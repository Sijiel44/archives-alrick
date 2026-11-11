import { checkJSON, sha256, validPJSource } from './store.mjs';
import { evaluatePJ, MAX_PJ_FILE_BYTES, M02_SCHEMA, readPJExport } from './pj-m02.mjs';

const FORMAT = 'chroniques-entre-rives.joueur';
const take = (value, keys) => Object.fromEntries(keys.filter(key => Object.hasOwn(value, key)).map(key => [key, value[key]]));
const scalarFields = (value, keys) => Object.fromEntries(Object.entries(take(value, keys))
  .filter(([, field]) => ['string', 'number', 'boolean'].includes(typeof field)));

export function checkPlayerSheet(sheet) {
  if (!validPJSource(sheet)) throw new Error('Cette fiche PJ M02 est incomplète.');
  const evaluation = evaluatePJ(sheet);
  if (!evaluation.valid) throw new Error(evaluation.issues.join(' '));
  return sheet;
}

export async function readPlayerFile(text) {
  if (new TextEncoder().encode(text).length > MAX_PJ_FILE_BYTES) throw new Error('Le fichier dépasse 2 Mio.');
  const archive = JSON.parse(text);
  checkJSON(archive);
  if (archive?.format !== FORMAT) {
    return { format: 'Export M02', created: archive?.created, records: readPJExport(text).sheets.map(sheet => ({ sheet, notes: '' })) };
  }
  if (archive.version !== 1) throw new Error('Cette version de sauvegarde joueur est inconnue.');
  const { payload, checksum } = archive;
  if (!payload || Object.keys(payload).sort().join(',') !== 'notes,sheet' || typeof payload.notes !== 'string' ||
      payload.notes.length > 8000 || checksum !== await sha256(JSON.stringify(payload))) {
    throw new Error('La sauvegarde joueur est incomplète ou altérée.');
  }
  checkPlayerSheet(payload.sheet);
  return { format: 'Sauvegarde joueur v1', created: archive.created, records: [payload] };
}

export async function playerBackup({ sheet, notes }) {
  const payload = { sheet, notes };
  return { format: FORMAT, version: 1, created: new Date().toISOString(), checksum: await sha256(JSON.stringify(payload)), payload };
}

export function playerExchange(sheet) {
  const copy = take(sheet, ['id', 'name', 'kind', 'ruleset', 'level', 'pv', 'pvMax', 'mana', 'manaMax', 'xp', 'stats', 'masteries']);
  for (const key of ['resistanceBonus', 'protection', 'equipmentGrades']) copy[key] = take(sheet[key], ['physique', 'magie', 'mental']);
  copy.stats = take(sheet.stats, ['physique', 'agilite', 'esprit', 'presence']);
  copy.development = {
    startingStats: take(sheet.development.startingStats, ['physique', 'agilite', 'esprit', 'presence']),
    abilities: sheet.development.abilities.map(ability => scalarFields(ability, ['id', 'name', 'description', 'domain', 'kind',
      'levelRequired', 'masteryDomain', 'masteryRequired', 'effect', 'limitations', 'resources', 'provenance', 'approvedByGM', 'status', 'rank', 'parentId'])),
    awards: [], approvedMilestones: Array.isArray(sheet.development.approvedMilestones)
      ? sheet.development.approvedMilestones.filter(level => Number.isInteger(level) && level >= 21 && level <= 25) : [],
    history: [],
  };
  copy.inventory = Array.isArray(sheet.inventory) ? sheet.inventory.filter(item => typeof item?.name === 'string').map(item =>
    scalarFields(item, ['id', 'templateId', 'name', 'category', 'quantity', 'description', 'value'])) : [];
  return { schema: M02_SCHEMA, created: new Date().toISOString(), sheets: [copy] };
}

export async function openPlayerStore() {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('entre-rives.espace-joueur.v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('personnages', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
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
      request.onsuccess = () => done(request.result.sort((a, b) => b.updatedAt - a.updatedAt));
    }),
    save: ({ sheet, notes, id = crypto.randomUUID(), revision = 0 }) => {
      checkJSON(sheet);
      checkPlayerSheet(sheet);
      if (typeof notes !== 'string' || notes.length > 8000 ||
          new TextEncoder().encode(JSON.stringify({ sheet, notes })).length > MAX_PJ_FILE_BYTES - 512) {
        throw new Error('Le personnage dépasse la taille prise en charge.');
      }
      const record = { id, revision: revision + 1, updatedAt: Date.now(), sheet, notes };
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
