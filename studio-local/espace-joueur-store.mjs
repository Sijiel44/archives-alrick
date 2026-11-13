import { checkJSON, sha256, validPJSource } from './store.mjs';
import { evaluatePJ, MAX_PJ_FILE_BYTES, M02_SCHEMA, readPJExport } from './pj-m02.mjs';
import { validPortrait } from './portraits.mjs';

const FORMAT = 'chroniques-entre-rives.joueur';
export const PLAYER_ROLL_LIMIT = 50;
const take = (value, keys) => Object.fromEntries(keys.filter(key => Object.hasOwn(value, key)).map(key => [key, value[key]]));
const scalarFields = (value, keys) => Object.fromEntries(Object.entries(take(value, keys))
  .filter(([, field]) => ['string', 'number', 'boolean'].includes(typeof field)));

export function checkPlayerSheet(sheet) {
  if (!validPJSource(sheet)) throw new Error('Cette fiche PJ M02 est incomplète.');
  const evaluation = evaluatePJ(sheet);
  if (!evaluation.valid) throw new Error(evaluation.issues.join(' '));
  return sheet;
}

function checkRolls(rolls) {
  if (!Array.isArray(rolls) || rolls.length > PLAYER_ROLL_LIMIT || new Set(rolls.map(roll => roll?.id)).size !== rolls.length ||
      rolls.some(roll => !roll || typeof roll.id !== 'string' || !/^[A-Za-z0-9:_-]{1,128}$/.test(roll.id) ||
        typeof roll.createdAt !== 'string' || !Number.isFinite(Date.parse(roll.createdAt)) ||
        !['free', 'action'].includes(roll.kind) || typeof roll.label !== 'string' || roll.label.length > 120 ||
        typeof roll.summary !== 'string' || roll.summary.length > 1200 ||
        !Array.isArray(roll.dice) || roll.dice.length !== 5 || roll.dice.some(die => !Number.isInteger(die) || die < 1 || die > 6))) {
    throw new Error('L’historique des jets est incomplet ou invalide.');
  }
}

export async function readPlayerFile(text) {
  if (new TextEncoder().encode(text).length > MAX_PJ_FILE_BYTES) throw new Error('Le fichier dépasse 2 Mio.');
  const archive = JSON.parse(text);
  checkJSON(archive);
  if (archive?.format !== FORMAT) {
    return { format: 'Export M02', created: archive?.created, records: readPJExport(text).sheets.map(sheet => ({ sheet, notes: '', rolls: [] })) };
  }
  if (![1, 2].includes(archive.version)) throw new Error('Cette version de sauvegarde joueur est inconnue.');
  const { payload, checksum } = archive;
  const keys = archive.version === 1 ? 'notes,sheet' : 'notes,rolls,sheet';
  if (!payload || Object.keys(payload).sort().join(',') !== keys || typeof payload.notes !== 'string' ||
      payload.notes.length > 8000 || checksum !== await sha256(JSON.stringify(payload))) {
    throw new Error('La sauvegarde joueur est incomplète ou altérée.');
  }
  checkPlayerSheet(payload.sheet);
  const rolls = archive.version === 1 ? [] : payload.rolls;
  checkRolls(rolls);
  return { format: `Sauvegarde joueur v${archive.version}`, created: archive.created, records: [{ ...payload, rolls }] };
}

export async function playerBackup({ sheet, notes, rolls = [] }) {
  checkRolls(rolls);
  const payload = { sheet, notes, rolls };
  return { format: FORMAT, version: 2, created: new Date().toISOString(), checksum: await sha256(JSON.stringify(payload)), payload };
}

export function playerExchange(sheet) {
  const copy = take(sheet, ['id', 'name', 'kind', 'ruleset', 'level', 'pv', 'pvMax', 'mana', 'manaMax', 'xp', 'stats', 'masteries']);
  for (const key of ['resistanceBonus', 'protection', 'equipmentGrades']) copy[key] = take(sheet[key], ['physique', 'magie', 'mental']);
  copy.stats = take(sheet.stats, ['physique', 'agilite', 'esprit', 'presence']);
  if (validPortrait(sheet.portrait) && sheet.portrait) copy.portrait = sheet.portrait;
  copy.development = {
    startingStats: take(sheet.development.startingStats, ['physique', 'agilite', 'esprit', 'presence']),
    abilities: sheet.development.abilities.map(ability => scalarFields(ability, ['id', 'name', 'description', 'domain', 'kind',
      'levelRequired', 'masteryDomain', 'masteryRequired', 'effect', 'limitations', 'resources', 'provenance', 'approvedByGM', 'status', 'rank', 'parentId'])),
    awards: [], approvedMilestones: Array.isArray(sheet.development.approvedMilestones)
      ? sheet.development.approvedMilestones.filter(level => Number.isInteger(level) && level >= 21 && level <= 25) : [],
    history: [],
  };
  copy.inventory = Array.isArray(sheet.inventory) ? sheet.inventory.filter(item => typeof item?.name === 'string').map(item =>
    scalarFields(item, ['id', 'templateId', 'name', 'category', 'quantity', 'description', 'value', 'equipped'])) : [];
  return { schema: M02_SCHEMA, created: new Date().toISOString(), sheets: [copy] };
}

export async function openPlayerStore() {
  const db = await new Promise((resolve, reject) => {
    let blocked = false;
    const request = indexedDB.open('entre-rives.espace-joueur.v1', 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('personnages')) request.result.createObjectStore('personnages', { keyPath: 'id' });
    };
    request.onblocked = () => {
      blocked = true;
      reject(new Error('Ferme les anciens onglets de l’espace joueur, puis recharge cette page pour terminer la mise à jour du stockage.'));
    };
    request.onsuccess = () => {
      if (blocked) request.result.close();
      else resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
  db.onversionchange = () => db.close();

  function transact(mode, work) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('personnages', mode);
      let result, error;
      tx.oncomplete = () => resolve(result);
      tx.onabort = () => reject(error ?? tx.error ?? new Error('Enregistrement interrompu.'));
      work(tx.objectStore('personnages'), value => { result = value; }, message => {
        error = new Error(message);
        tx.abort();
      });
    });
  }

  return {
    list: () => transact('readonly', (table, done) => {
      const request = table.getAll();
      request.onsuccess = () => done(request.result.map(record => ({ ...record, rolls: record.rolls ?? [] }))
        .sort((a, b) => b.updatedAt - a.updatedAt));
    }),
    save: ({ sheet, notes, rolls = [], id = crypto.randomUUID(), revision = 0 }) => {
      checkJSON(sheet);
      checkJSON(rolls);
      checkPlayerSheet(sheet);
      checkRolls(rolls);
      if (typeof notes !== 'string' || notes.length > 8000 ||
          new TextEncoder().encode(JSON.stringify({ sheet, notes, rolls })).length > MAX_PJ_FILE_BYTES - 512) {
        throw new Error('Le personnage dépasse la taille prise en charge.');
      }
      const record = { id, revision: revision + 1, updatedAt: Date.now(), sheet, notes, rolls };
      return transact('readwrite', (table, done, abort) => {
        const request = table.get(id);
        request.onsuccess = () => {
          if ((request.result?.revision ?? 0) !== revision) {
            abort('Cette fiche a changé dans un autre onglet. Recharge la page pour relire sa version enregistrée.');
            return;
          }
          table.put(record);
          done(record);
        };
      });
    },
  };
}
