import { checkJSON, sha256, validPJSource } from './store.mjs';
import { evaluatePJ, MAX_PJ_FILE_BYTES, readPJExport } from './pj-m02.mjs';
import { EXCHANGE_FORMAT, readExchange, receivedSheet } from './echanges-pj.mjs';
import { checkPlayerGrimoire } from './grimoire-joueur.mjs';
import { DRAFT_ID, checkCreationDraft, checkDraftRecord } from './brouillons-pj.mjs';
import { checkPlayerFiling, isPlayerArchived } from './rangement-joueur.mjs';
export { playerExchange } from './echanges-pj.mjs';

const FORMAT = 'chroniques-entre-rives.joueur';
export const PLAYER_ROLL_LIMIT = 50;
const recordDefaults = record => ({ ...record, rolls: record.rolls ?? [], grimoire: record.grimoire ?? [], filing: record.filing ?? { archivedAt: null } });

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
  if (archive?.format === EXCHANGE_FORMAT) {
    const exchange = await readExchange(text);
    return { format: 'Échange joueur / MJ v1', created: exchange.created, exchange,
      records: [{ sheet: receivedSheet(exchange), notes: '', rolls: [], grimoire: [] }] };
  }
  if (archive?.format !== FORMAT) {
    return { format: 'Export M02', created: archive?.created, records: readPJExport(text).sheets.map(sheet => ({ sheet, notes: '', rolls: [], grimoire: [] })) };
  }
  if (![1, 2, 3, 4].includes(archive.version)) throw new Error('Cette version de sauvegarde joueur est inconnue.');
  const { payload, checksum } = archive;
  const keys = archive.version === 1 ? 'notes,sheet' : archive.version === 2 ? 'notes,rolls,sheet' : archive.version === 3 ? 'grimoire,notes,rolls,sheet' : 'filing,grimoire,notes,rolls,sheet';
  if (!payload || Object.keys(payload).sort().join(',') !== keys || typeof payload.notes !== 'string' ||
      payload.notes.length > 8000 || checksum !== await sha256(JSON.stringify(payload))) {
    throw new Error('La sauvegarde joueur est incomplète ou altérée.');
  }
  checkPlayerSheet(payload.sheet);
  const rolls = archive.version === 1 ? [] : payload.rolls;
  checkRolls(rolls);
  const grimoire = archive.version < 3 ? [] : payload.grimoire;
  checkPlayerGrimoire(grimoire);
  const filing = archive.version < 4 ? { archivedAt: null } : payload.filing;
  checkPlayerFiling(filing);
  return { format: `Sauvegarde joueur v${archive.version}`, created: archive.created, records: [{ ...payload, rolls, grimoire, filing }] };
}

export async function playerBackup({ sheet, notes, rolls = [], grimoire = [], filing = { archivedAt: null } }) {
  checkJSON(grimoire);
  checkPlayerGrimoire(grimoire);
  checkRolls(rolls);
  checkPlayerFiling(filing);
  const payload = { sheet, notes, rolls, grimoire, filing };
  return { format: FORMAT, version: 4, created: new Date().toISOString(), checksum: await sha256(JSON.stringify(payload)), payload };
}

export async function openPlayerStore() {
  const db = await new Promise((resolve, reject) => {
    let blocked = false;
    const request = indexedDB.open('entre-rives.espace-joueur.v1', 5);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('personnages')) request.result.createObjectStore('personnages', { keyPath: 'id' });
      if (!request.result.objectStoreNames.contains('brouillons')) request.result.createObjectStore('brouillons', { keyPath: 'id' });
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

  function transact(mode, work, names = 'personnages') {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(names, mode);
      let result, error;
      tx.oncomplete = () => resolve(result);
      tx.onabort = () => reject(error ?? tx.error ?? new Error('Enregistrement interrompu.'));
      work(tx.objectStore(Array.isArray(names) ? names[0] : names), value => { result = value; }, message => {
        error = new Error(message);
        tx.abort();
      }, tx);
    });
  }

  return {
    setArchived: ({ id, revision, archived }) => {
      if (typeof id !== 'string' || !id || !Number.isSafeInteger(revision) || revision < 1 || typeof archived !== 'boolean') throw new Error('Choix de rangement invalide.');
      return transact('readwrite', (table, done, abort) => {
        const request = table.get(id);
        request.onsuccess = () => {
          const current = request.result;
          if (!current || current.revision !== revision) return abort('Cette fiche a changé dans un autre onglet. Rouvre sa version enregistrée avant de la ranger.');
          try { checkPlayerFiling(current.filing ?? { archivedAt: null }); } catch (error) { return abort(error.message); }
          if (isPlayerArchived(current) === archived) { done(recordDefaults(current)); return; }
          const record = { ...current, revision: revision + 1, updatedAt: Date.now(),
            filing: { ...current.filing, archivedAt: archived ? new Date().toISOString() : null } };
          if (new TextEncoder().encode(JSON.stringify(record)).length > MAX_PJ_FILE_BYTES - 512) return abort('La fiche dépasse la taille prise en charge. Les données enregistrées sont conservées.');
          table.put(record); done(recordDefaults(record));
        };
      });
    },
    readDraft: async () => checkDraftRecord(await transact('readonly', (table, done) => {
      const request = table.get(DRAFT_ID);
      request.onsuccess = () => done(request.result);
    }, 'brouillons')),
    saveDraft: (snapshot, revision = 0) => {
      if (snapshot !== null) checkCreationDraft(snapshot);
      if (!Number.isSafeInteger(revision) || revision < 0 || revision >= Number.MAX_SAFE_INTEGER) throw new Error('Révision de brouillon invalide.');
      const record = { id: DRAFT_ID, version: 1, revision: revision + 1, updatedAt: Date.now(), snapshot };
      return transact('readwrite', (table, done, abort) => {
        const request = table.get(DRAFT_ID);
        request.onsuccess = () => {
          try { checkDraftRecord(request.result); } catch (error) { return abort(error.message); }
          if ((request.result?.revision ?? 0) !== revision) return abort('Le brouillon a changé dans un autre onglet. Télécharge tes choix avant de relire le brouillon enregistré.');
          table.put(record);
          done(record);
        };
      }, 'brouillons');
    },
    list: () => transact('readonly', (table, done) => {
      const request = table.getAll();
      request.onsuccess = () => done(request.result.map(recordDefaults)
        .sort((a, b) => b.updatedAt - a.updatedAt));
    }),
    save: ({ sheet, notes, rolls = [], grimoire = [], filing, id = crypto.randomUUID(), revision = 0 }, compared, fromDraft) => {
      checkJSON(sheet);
      checkJSON(rolls);
      checkJSON(grimoire);
      checkPlayerGrimoire(grimoire);
      checkPlayerSheet(sheet);
      checkRolls(rolls);
      if (filing !== undefined) checkPlayerFiling(filing);
      if (fromDraft) {
        checkCreationDraft(fromDraft.snapshot);
        if (!Number.isSafeInteger(fromDraft.revision) || fromDraft.revision < 1 ||
            fromDraft.snapshot.id !== id || sheet.id !== id || revision !== 0) throw new Error('La création ne correspond pas au brouillon vérifié.');
      }
      if (typeof notes !== 'string' || notes.length > 8000 ||
          new TextEncoder().encode(JSON.stringify({ sheet, notes, rolls, grimoire, filing })).length > MAX_PJ_FILE_BYTES - 512) {
        throw new Error('Le personnage dépasse la taille prise en charge.');
      }
      const record = { id, revision: revision + 1, updatedAt: Date.now(), sheet, notes, rolls, grimoire, filing: filing ?? { archivedAt: null } };
      return transact('readwrite', (table, done, abort, tx) => {
        if (fromDraft) {
          const drafts = tx.objectStore('brouillons');
          const guard = drafts.get(DRAFT_ID);
          guard.onsuccess = () => {
            if (guard.result?.version !== 1 || guard.result?.revision !== fromDraft.revision || JSON.stringify(guard.result?.snapshot) !== JSON.stringify(fromDraft.snapshot)) {
              return abort('Le brouillon a changé dans un autre onglet. La création est interrompue ; tes choix restent disponibles.');
            }
            drafts.put({ id: DRAFT_ID, version: 1, revision: fromDraft.revision + 1, updatedAt: Date.now(), snapshot: null });
          };
        }
        if (compared) {
          const guard = table.get(compared.id);
          guard.onsuccess = () => {
            if (guard.result?.revision !== compared.revision || isPlayerArchived(guard.result)) abort('La fiche comparée a changé ou a été archivée dans un autre onglet. Recharge la page pour refaire la comparaison.');
          };
        }
        const request = table.get(id);
        request.onsuccess = () => {
          if ((request.result?.revision ?? 0) !== revision) {
            abort('Cette fiche a changé dans un autre onglet. Recharge la page pour relire sa version enregistrée.');
            return;
          }
          const current = request.result;
          if (isPlayerArchived(current)) return abort('Cette fiche est archivée. Remets-la en activité pour la modifier.');
          if (current) {
            try { checkPlayerFiling(current.filing ?? { archivedAt: null }); } catch (error) { return abort(error.message); }
            if (filing?.archivedAt && !current.filing?.archivedAt) return abort('Utilise la commande d’archivage pour ranger une fiche existante.');
            record.filing = { ...current.filing, ...(filing ?? {}), archivedAt: null };
          }
          try { checkPlayerFiling(record.filing); } catch (error) { return abort(error.message); }
          if (new TextEncoder().encode(JSON.stringify(record)).length > MAX_PJ_FILE_BYTES - 512) return abort('Le personnage dépasse la taille prise en charge.');
          table.put(record);
          done(record);
        };
      }, fromDraft ? ['personnages', 'brouillons'] : 'personnages');
    },
  };
}
