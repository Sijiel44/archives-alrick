import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

async function setup(t, profile, { tracked = false, damage = false } = {}) {
  const f = await browserFixture(t), { page } = await f.open(profile);
  await page.route('**/objets-mj.mjs', route => readFile(new URL('../objets-mj.mjs', import.meta.url), 'utf8')
    .then(body => route.fulfill({ status: 200, contentType: 'text/javascript', body })));
  await page.goto(f.url);
  await page.evaluate(async ({ tracked, damage }) => {
    const s = await import('./store.mjs'), { createFreePJ, buildFreePJ } = await import('./pj-m02.mjs');
    const { makeExchange, EXCHANGE_KEY } = await import('./echanges-pj.mjs');
    const { objectGrantFields } = await import('./objets-mj.mjs');
    const store = await s.openStudioStore({ name: 'objets-mj-' + crypto.randomUUID(), injectFailure(stage, command) {
      const failure = window.objectGrantFailure;
      if (failure?.stage === stage && failure.id === command.operationId) { window.objectGrantFailure = undefined; throw new Error('INTERRUPTION_FICTIVE'); }
    } });
    let campaign;
    const send = async (type, data) => campaign = await store.execute({ id: 'campagne-canari-privee', operationId: crypto.randomUUID(), expectedRevision: campaign?.revision ?? 0, type, data });
    await send('create', { name: 'Table fictive objets', description: 'CANARI_CAMPAGNE_PRIVEE', style: 'campaign', startingLevel: 5 });
    const base = { physique: 3, agilite: 3, esprit: 3, presence: 3 };
    const { source } = createFreePJ(buildFreePJ({ level: 5, startingStats: base, stats: { ...base, physique: 5 }, masteries: { lames: 1 } }),
      { id: 'pj-source', name: 'Néria', profession: 'Batelière', backstory: 'CANARI_HISTOIRE_PRIVEE', connections: '', goal: '' });
    source.pv = 32;
    source.inventory = [{ id: 'ancien', name: 'Objet futur', quantity: { future: 3 }, category: { future: 'outil' }, extension: 'CANARI_OBJET_PRIVE' }, { opaque: 'ENTREE_OPAQUE' }];
    source.extensionFuture = { secret: 'CANARI_EXTENSION_PRIVEE' };
    if (tracked) {
      const packet = await makeExchange(source, 'joueur');
      source[EXCHANGE_KEY] = { version: 1, revision: packet.payload.revision, origin: 'joueur', created: packet.payload.created, extension: 'MARQUEUR_PRIVE' };
    }
    await send('attach-pj-source', { id: 'pj', attach: false, source });
    await send('save-character', { id: 'pj', name: 'Néria nom de table', level: 5, notes: 'CANARI_NOTES_MJ' });
    await send('save-scene', { id: 'scene', title: 'Le gué fictif', description: '', privateNotes: 'CANARI_SCENE_PRIVEE', participantIds: ['pj'] });
    await send('save-creation', { id: 'creation-canari-modele-id', kind: 'object', name: 'Lanterne de voyage', description: 'Une lanterne à volet.',
      notes: 'CANARI_MODELE_PRIVE', state: 'draft', parentId: null, links: [], details: { category: 'Outil', use: 'CANARI_USAGE_PRIVE', origin: 'CANARI_ORIGINE_PRIVEE' } });
    if (damage) await send('record-opposition', { id: 'combat', mode: 'opposition', sceneId: 'scene', actor: 'Veilleur fictif', intent: 'Écarter la garde',
      stakes: 'Garder le passage', consequence: 'CANARI_CONSEQUENCE_PRIVEE', recordedAt: '2026-11-14T15:00:00.000Z', applyDamage: true,
      roll: { ruleset: 'm03', source: 'table', stat: 'physique', rawStat: 5, masteryRank: 0, situation: 0, threshold: 15,
        dice: [6, 6, 6, 6, 6], targetId: 'pj', impactMode: 'melee', level: 5, baseDamage: 1, penetration: 0 } });
    const creation = campaign[s.CREATIONS_KEY][0];
    window.objectGrantFixture = { store, campaign, original: structuredClone(campaign), fields: objectGrantFields(creation), at: '2026-11-14T16:00:00.000Z' };
  }, { tracked, damage });
  return page;
}

test('Attribuer un modèle garde les PV effectifs, les profils historiques et permet le rétablissement v17', { timeout: 40000 }, async t => {
  const page = await setup(t, 'modeles-pv', { damage: true });
  const result = await page.evaluate(async () => {
    const { store, original, fields, at } = window.objectGrantFixture;
    const s = await import('./store.mjs'), { prepareObjectGrant } = await import('./objets-mj.mjs');
    const actor = original.characters[0], before = structuredClone(actor[s.PJ_SOURCE_KEY]);
    try {
      const data = await prepareObjectGrant(original, { creationId: 'creation-canari-modele-id', characterId: 'pj', itemId: 'copie-lanterne', fields, at });
      const source = data.source;
      const preparedWithoutWriting = JSON.stringify(await store.get(original.id)) === JSON.stringify(original);
      const effectivePV = s.currentHitPoints(original, actor);
      const command = { id: original.id, operationId: 'attribution-lanterne', expectedRevision: original.revision, type: 'update-pj-source', data };
      const granted = await store.execute(command), updated = granted.characters[0];
      const archive = JSON.parse(await store.exportBackup(original.id));
      const restored = await store.execute({ id: original.id, operationId: 'retablir-attribution', expectedRevision: granted.revision,
        type: 'restore-pj-source', data: { id: 'pj', updateId: 'attribution-lanterne', at } });
      const { inventory, pv, name, entreRivesExchangeV1, ...rest } = source;
      const { inventory: oldInventory, pv: oldPV, name: oldName, ...originalRest } = before;
      return { preparedWithoutWriting, effectivePV, oldPV, pv, name, rest, originalRest, oldInventory, previousItems: inventory.slice(0, -1),
        newItem: inventory.at(-1), unchangedScenes: JSON.stringify(granted.scenes) === JSON.stringify(original.scenes),
        unchangedModel: JSON.stringify(granted[s.CREATIONS_KEY]) === JSON.stringify(original[s.CREATIONS_KEY]),
        notes: updated.notes, updates: updated[s.PJ_UPDATES_KEY].length, actionOffset: updated[s.PJ_UPDATES_KEY][0].actionCount,
        historicalPV: s.historicalCombatProfile(granted, updated, 'combat').pv, archiveVersion: archive.version,
        restoredInventory: restored.characters[0][s.PJ_SOURCE_KEY].inventory, restoredPV: s.currentHitPoints(restored, restored.characters[0]),
        historicalPVBefore: before.pv };
    } finally { store.close(); }
  });
  assert.equal(result.preparedWithoutWriting, true); assert.ok(result.effectivePV < result.oldPV);
  assert.equal(result.pv, result.effectivePV); assert.equal(result.name, 'Néria nom de table');
  assert.deepEqual(result.rest, result.originalRest); assert.deepEqual(result.previousItems, result.oldInventory);
  assert.deepEqual(result.newItem, { id: 'copie-lanterne', templateId: '', name: 'Lanterne de voyage', category: 'outil', quantity: 1, description: 'Une lanterne à volet.', value: '', equipped: false, entreRivesTableObjectV1: { version: 1, creationId: 'creation-canari-modele-id', campaignId: 'campagne-canari-privee', at: '2026-11-14T16:00:00.000Z' } });
  assert.equal(result.unchangedScenes, true); assert.equal(result.unchangedModel, true); assert.equal(result.notes, 'CANARI_NOTES_MJ');
  assert.equal(result.updates, 1); assert.equal(result.actionOffset, 1); assert.equal(result.historicalPV, result.historicalPVBefore);
  assert.equal(result.archiveVersion, 17); assert.deepEqual(result.restoredInventory, result.oldInventory); assert.equal(result.restoredPV, result.effectivePV);
});

test('Une copie attribuée garde la base d’échange convenue et son export ne diffuse aucun champ privé du modèle', { timeout: 40000 }, async t => {
  const page = await setup(t, 'modeles-partage', { tracked: true });
  const result = await page.evaluate(async () => {
    const { store, campaign, fields, at } = window.objectGrantFixture;
    const s = await import('./store.mjs'), { prepareObjectGrant } = await import('./objets-mj.mjs');
    const e = await import('./echanges-pj.mjs');
    try {
      const local = campaign.characters[0][s.PJ_SOURCE_KEY];
      const data = await prepareObjectGrant(campaign, { creationId: 'creation-canari-modele-id', characterId: 'pj', itemId: 'copie', fields, at });
      const packet = await e.makeExchange(data.source, 'mj');
      const exchange = await e.readExchange(JSON.stringify(packet));
      const comparison = await e.compareExchange(local, exchange);
      return { shared: JSON.stringify(packet), marker: data.source[e.EXCHANGE_KEY], originalMarker: local[e.EXCHANGE_KEY],
        sharedItem: exchange.sheet.inventory.at(-1), comparison };
    } finally { store.close(); }
  });
  assert.deepEqual(result.marker, result.originalMarker);
  assert.doesNotMatch(result.shared, /CANARI_|creation-canari-modele-id|campagne-canari-privee|entreRivesTableObjectV1|extensionFuture|entreRivesCreationsV10|details|parentId|links/);
  assert.equal(result.sharedItem.name, 'Lanterne de voyage'); assert.equal(result.sharedItem.quantity, 1);
  assert.equal(result.comparison.divergent, false);
});

test('Le journal rend l’attribution atomique, rejouable après acquittement perdu et bloque un aperçu périmé', { timeout: 40000 }, async t => {
  const page = await setup(t, 'modeles-transaction');
  const result = await page.evaluate(async () => {
    const f = window.objectGrantFixture, { store, campaign, fields, at } = f;
    const s = await import('./store.mjs'), { prepareObjectGrant } = await import('./objets-mj.mjs');
    const failure = async command => { try { await store.execute(command); return false; } catch { return true; } };
    try {
      const data = await prepareObjectGrant(campaign, { creationId: 'creation-canari-modele-id', characterId: 'pj', itemId: 'copie', fields, at });
      const command = { id: campaign.id, operationId: 'attribution', expectedRevision: campaign.revision, type: 'update-pj-source', data };
      window.objectGrantFailure = { stage: 'before-commit', id: 'attribution' };
      const aborted = await failure(command), unchanged = JSON.stringify(await store.get(campaign.id)) === JSON.stringify(campaign);
      window.objectGrantFailure = { stage: 'after-commit', id: 'attribution' };
      const lost = await failure(command), replay = await store.execute(command);
      const again = await store.execute(command);
      const staleData = await prepareObjectGrant(replay, { creationId: 'creation-canari-modele-id', characterId: 'pj', itemId: 'copie-suivante', fields, at });
      const model = { ...replay[s.CREATIONS_KEY][0], description: 'Modèle actualisé dans un autre onglet.' };
      const changed = await store.execute({ id: campaign.id, operationId: 'autre-onglet', expectedRevision: replay.revision, type: 'save-creation', data: model });
      const stale = await failure({ id: campaign.id, operationId: 'attribution-perimee', expectedRevision: replay.revision, type: 'update-pj-source', data: staleData });
      return { aborted, unchanged, lost, stale, revisions: [replay.revision, again.revision], counts: [replay.characters[0][s.PJ_SOURCE_KEY].inventory.length, changed.characters[0][s.PJ_SOURCE_KEY].inventory.length],
        updates: replay.characters[0][s.PJ_UPDATES_KEY].length, originalCount: campaign.characters[0][s.PJ_SOURCE_KEY].inventory.length };
    } finally { store.close(); }
  });
  assert.equal(result.aborted, true); assert.equal(result.unchanged, true); assert.equal(result.lost, true); assert.equal(result.stale, true);
  assert.equal(result.revisions[0], result.revisions[1]); assert.equal(result.updates, 1);
  assert.deepEqual(result.counts, [result.originalCount + 1, result.originalCount + 1]);
});

test('Les limites, les identités étrangères et les formats d’inventaire inconnus sont refusés avant toute écriture', { timeout: 40000 }, async t => {
  const page = await setup(t, 'modeles-validation');
  const result = await page.evaluate(async () => {
    const { store, campaign, fields, at } = window.objectGrantFixture;
    const s = await import('./store.mjs'), { prepareObjectGrant, objectGrantFields } = await import('./objets-mj.mjs');
    const options = { creationId: 'creation-canari-modele-id', characterId: 'pj', itemId: 'copie', fields, at };
    const rejected = [];
    try {
      for (const patch of [{ creationId: 'autre-modele' }, { characterId: 'autre-pj' }, { itemId: 'ancien' }, { itemId: '../interdit' }, { at: 'hier' },
        { fields: { ...fields, notes: 'CHAMP_PRIVE_INTERDIT' } }, { fields: { ...fields, quantity: 0 } }, { fields: { ...fields, quantity: 1000 } },
        { fields: { ...fields, description: 'x'.repeat(601) } }, { fields: { ...fields, category: 'arbitraire' } }]) {
        try { await prepareObjectGrant(campaign, { ...options, ...patch }); rejected.push(false); } catch { rejected.push(true); }
      }
      for (const inventory of [{ futureFormat: true }, Array.from({ length: 150 }, (_, index) => ({ id: 'plein-' + index, name: 'Ancien' }))]) {
        const changed = structuredClone(campaign); changed.characters[0][s.PJ_SOURCE_KEY].inventory = inventory;
        try { await prepareObjectGrant(changed, options); rejected.push(false); } catch { rejected.push(true); }
      }
      const allowed = structuredClone(campaign); allowed.characters[0][s.PJ_SOURCE_KEY].inventory = Array.from({ length: 149 }, (_, index) => ({ id: 'ancien-' + index, name: 'Ancien' }));
      const finalSlot = await prepareObjectGrant(allowed, options);
      return { rejected, finalCount: finalSlot.source.inventory.length, unchanged: JSON.stringify(await store.get(campaign.id)) === JSON.stringify(campaign),
        defaults: objectGrantFields(campaign[s.CREATIONS_KEY][0]) };
    } finally { store.close(); }
  });
  assert.deepEqual(result.rejected, Array(12).fill(true)); assert.equal(result.finalCount, 150); assert.equal(result.unchanged, true);
  assert.doesNotMatch(JSON.stringify(result.defaults), /CANARI_|origin|use|notes/);
});
