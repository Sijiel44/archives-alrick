import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BACKUP_HISTORY_KEY, backupCopyStatus, readBackupHistory, recordBackupReceipt } from '../suivi-sauvegardes.mjs';
import { browserFixture } from './browser.mjs';

const at = '2026-11-15T20:00:00.000Z';
const later = '2026-11-15T21:00:00.000Z';
const archive = (revision = 1, id = 'table') => ({ format: 'chroniques-entre-rives.studio-local', version: 19,
  sha256: 'a'.repeat(64), payload: { campaign: { id, revision, name: 'CANARI_NOM', notes: 'CANARI_NOTES', url: 'https://CANARI_URL.invalid/' } } });
function memory(initial = null) {
  let value = initial;
  return { getItem(key) { assert.equal(key, BACKUP_HISTORY_KEY); return value; },
    setItem(key, next) { assert.equal(key, BACKUP_HISTORY_KEY); value = next; } };
}

test('Le suivi distingue téléchargement lancé, fichier vérifié et campagne devenue plus récente', () => {
  const storage = memory(), campaign = { id: 'table', revision: 4 };
  assert.equal(backupCopyStatus(campaign, readBackupHistory(storage)).state, 'none');
  assert.equal(recordBackupReceipt(archive(4), 'download', at, storage), true);
  let history = readBackupHistory(storage);
  assert.equal(backupCopyStatus(campaign, history).state, 'unverified');
  assert.equal(history.entries.table.verified, undefined);
  assert.equal(recordBackupReceipt(archive(3), 'verified', later, storage), true);
  assert.equal(backupCopyStatus(campaign, readBackupHistory(storage)).state, 'unverified');
  assert.equal(recordBackupReceipt(archive(4), 'verified', later, storage), true);
  history = readBackupHistory(storage);
  const status = backupCopyStatus(campaign, history);
  assert.equal(status.state, 'current');
  assert.match(status.message, /relu et vérifié/);
  assert.equal(backupCopyStatus({ ...campaign, revision: 5 }, history).state, 'outdated');
  assert.equal(backupCopyStatus({ ...campaign, revision: 3 }, history).state, 'outdated');
  assert.doesNotMatch(storage.getItem(BACKUP_HISTORY_KEY), /CANARI|name|notes|url/);
  status.verified.revision = 999;
  assert.equal(history.entries.table.verified.revision, 4);
  history.entries.table.verified.revision = 998;
  assert.equal(readBackupHistory(storage).entries.table.verified.revision, 4);
});

test('Une révision téléchargée plus récente empêche de dire que l’ancienne campagne affichée est courante', () => {
  const storage = memory(), campaign = { id: 'table', revision: 1 };
  assert.equal(recordBackupReceipt(archive(1), 'download', at, storage), true);
  assert.equal(recordBackupReceipt(archive(1), 'verified', at, storage), true);
  assert.equal(backupCopyStatus(campaign, readBackupHistory(storage)).state, 'current');
  assert.equal(recordBackupReceipt(archive(2), 'download', later, storage), true);
  const history = readBackupHistory(storage);
  const stale = backupCopyStatus(campaign, history);
  assert.equal(stale.state, 'outdated', 'Le reçu récent reste utile même sans notification de sauvegarde de l’autre onglet');
  assert.match(stale.message, /révision 2.*révision 1.*Rechargez/);
  assert.equal(stale.verified.revision, 1, 'Le constat ne transforme pas le téléchargement en relecture');
  assert.equal(stale.download.revision, 2);
  assert.equal(backupCopyStatus({ ...campaign, revision: 2 }, history).state, 'unverified');
});

test('Un export tardif ou une ancienne lecture ne remplace pas un reçu plus récent', () => {
  const storage = memory();
  assert.equal(recordBackupReceipt(archive(8), 'download', at, storage), true);
  const before = storage.getItem(BACKUP_HISTORY_KEY);
  assert.equal(recordBackupReceipt(archive(7), 'download', later, storage), false);
  assert.equal(recordBackupReceipt(archive(8), 'download', '2026-11-15T19:00:00.000Z', storage), false);
  assert.equal(storage.getItem(BACKUP_HISTORY_KEY), before);
  assert.equal(recordBackupReceipt(archive(8), 'download', later, storage), true);
  assert.equal(recordBackupReceipt(archive(8), 'verified', at, storage), true);
  const history = readBackupHistory(storage);
  assert.equal(history.entries.table.download.at, later);
  assert.equal(history.entries.table.verified.at, at);
  assert.equal(recordBackupReceipt(archive(7), 'verified', later, storage), false);
  assert.equal(readBackupHistory(storage).entries.table.verified.revision, 8);
  assert.equal(recordBackupReceipt(archive(1, 'constructor'), 'download', at, storage), true);
  assert.equal(readBackupHistory(storage).entries.constructor.download.revision, 1);
});

test('Les données de reçu invalides, le quota et les historiques corrompus restent sans faux succès', () => {
  const storage = memory();
  for (const value of [{ ...archive(), format: 'autre' }, { ...archive(), version: 0 }, { ...archive(), version: '19' },
    { ...archive(), sha256: 'A'.repeat(64) }, { ...archive(), sha256: 'x' }, archive(0), archive(NaN), archive(1, '__proto__'),
    { ...archive(), payload: null }]) assert.equal(recordBackupReceipt(value, 'download', at, storage), false);
  for (const date of ['2026-02-30T20:00:00.000Z', '2026-11-15T20:00:00Z', '2026-11-15', '', null]) {
    assert.equal(recordBackupReceipt(archive(), 'download', date, storage), false);
  }
  assert.equal(recordBackupReceipt(archive(), 'unknown', at, storage), false);
  assert.equal(storage.getItem(BACKUP_HISTORY_KEY), null);
  const quota = { getItem: () => null, setItem() { throw new DOMException('Quota fictif', 'QuotaExceededError'); } };
  assert.equal(recordBackupReceipt(archive(), 'download', at, quota), false);
  const denied = { getItem() { throw new DOMException('Refus fictif', 'SecurityError'); }, setItem() { throw new Error(); } };
  assert.equal(readBackupHistory(denied).available, false);
  assert.equal(recordBackupReceipt(archive(), 'download', at, denied), false);
  assert.equal(backupCopyStatus({ id: 'table', revision: 1 }, readBackupHistory(denied)).state, 'unavailable');
  const silent = { getItem: () => null, setItem() {} };
  assert.equal(recordBackupReceipt(archive(), 'download', at, silent), false);
  for (const raw of ['{', '{"version":2,"entries":{}}', '{"version":1,"entries":{"table":{"download":{"revision":1}}}}',
    JSON.stringify({ version: 1, entries: {}, extra: 'CANARI_HISTORIQUE' })]) {
    const corrupt = memory(raw);
    assert.equal(readBackupHistory(corrupt).available, false);
    assert.equal(recordBackupReceipt(archive(), 'download', at, corrupt), false);
    assert.equal(corrupt.getItem(BACKUP_HISTORY_KEY), raw);
  }
  const entries = Object.fromEntries(Array.from({ length: 100 }, (_, index) => [`table-${index}`, { download: { revision: 1, sha256: 'b'.repeat(64), at } }]));
  const full = memory(JSON.stringify({ version: 1, entries }));
  assert.equal(recordBackupReceipt(archive(), 'download', at, full), false);
  assert.equal(Object.keys(readBackupHistory(full).entries).length, 100);
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  if (!descriptor || descriptor.configurable) {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Accès global refusé'); } });
    try { assert.equal(readBackupHistory().available, false); assert.equal(recordBackupReceipt(archive(), 'download', at), false); }
    finally { if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor); else delete globalThis.localStorage; }
  }
});

test('Le diagnostic du Store est borné, sans données privées et sans mutation des enregistrements', { timeout: 40000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('fiabilite-diagnostic');
  await page.goto(f.url);
  const result = await page.evaluate(async () => {
    const { openStudioStore, sha256 } = await import('./store.mjs');
    const name = 'diagnostic-fictif-' + crypto.randomUUID();
    const store = await openStudioStore({ name });
    await store.execute({ id: 'saine', operationId: 'creation', expectedRevision: 0, type: 'create',
      data: { name: 'CANARI_NOM_SAIN', description: 'CANARI_NOTES_SAINES', style: 'campaign', startingLevel: 5 } });
    const beforeBackup = await store.exportBackup('saine');
    const request = indexedDB.open(name, 1);
    const db = await new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const rows = Array.from({ length: 105 }, (_, index) => ({ id: `CANARI_CLE_${index}`, schema: 'autre',
      payload: { name: 'CANARI_NOM_PRIVE', notes: 'CANARI_NOTES_PRIVEES', url: 'https://CANARI_URL.invalid/' } }));
    const all = () => new Promise((resolve, reject) => {
      const tx = db.transaction('campaigns', 'readonly'), request = tx.objectStore('campaigns').getAll();
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    try {
      await new Promise((resolve, reject) => { const tx = db.transaction('campaigns', 'readwrite');
        tx.oncomplete = resolve; tx.onabort = () => reject(tx.error); for (const row of rows) tx.objectStore('campaigns').add(row); });
      const before = JSON.stringify(await all());
      let completed = false;
      const modes = [], afterCompletion = [];
      const nativeTransaction = IDBDatabase.prototype.transaction, nativeDigest = crypto.subtle.digest;
      IDBDatabase.prototype.transaction = function (...args) {
        modes.push(args[1]); const tx = nativeTransaction.apply(this, args); tx.addEventListener('complete', () => { completed = true; }); return tx;
      };
      crypto.subtle.digest = function (...args) { afterCompletion.push(completed); return nativeDigest.apply(this, args); };
      let report;
      try { report = await store.diagnoseInventory(); }
      finally { IDBDatabase.prototype.transaction = nativeTransaction; crypto.subtle.digest = nativeDigest; }
      const again = await store.diagnoseInventory();
      const after = JSON.stringify(await all()), afterBackup = await store.exportBackup('saine');
      const expected = `sha256:${await sha256(JSON.stringify(['string', rows[0].id]))}`;
      store.close();
      let closed; try { await store.diagnoseInventory(); } catch (error) { closed = error.code; }
      return { report, stable: JSON.stringify(report.entries) === JSON.stringify(again.entries), unchanged: before === after,
        sameBackup: beforeBackup === afterBackup, modes, hashesAfterTransaction: afterCompletion.every(Boolean), hashCount: afterCompletion.length,
        expected, closed };
    } finally { store.close(); db.close(); }
  });
  assert.equal(result.report.format, 'chroniques-entre-rives.diagnostic-stockage');
  assert.equal(result.report.version, 1);
  assert.equal(new Date(result.report.at).toISOString(), result.report.at);
  assert.deepEqual([result.report.checked, result.report.readable, result.report.unreadable, result.report.entries.length], [106, 1, 105, 100]);
  assert.equal(result.report.entries.every(entry => /^sha256:[a-f0-9]{64}$/.test(entry.record) && entry.reason === 'foreign-key'), true);
  assert.equal(result.report.entries[0].record, result.expected);
  assert.doesNotMatch(JSON.stringify(result.report), /CANARI|https:|payload|notes|name/);
  assert.equal(result.stable, true); assert.equal(result.unchanged, true); assert.equal(result.sameBackup, true);
  assert.deepEqual(result.modes, ['readonly']);
  assert.equal(result.hashesAfterTransaction, true); assert.equal(result.hashCount, 100);
  assert.equal(result.closed, 'storage');
});
