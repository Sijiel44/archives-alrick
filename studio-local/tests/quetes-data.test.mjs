import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QUESTS_KEY, validateQuestSteps, validQuestStep, questState } from '../quetes.mjs';
import { resourceUsages } from '../utilisations.mjs';
import { referenceSegments } from '../bibliotheque.mjs';
import { browserFixture } from './browser.mjs';
import { seedQuestCampaign } from './quetes-fixture.mjs';
const step = () => ({ id: 'quest-step-corde', kind: 'clue', questId: 'creation-quete', title: 'Une corde bleue', playerText: 'Un signe.', notes: 'PRIVE', sceneIds: ['scene-quai', 'scene-moulin'], references: [{ scope: 'campaign', id: 'creation-temoin' }] });
test('Le suivi refuse les références privées étrangères, états et historiques incohérents', () => {
  const campaign = { scenes: [{ id: 'scene-quai' }, { id: 'scene-moulin' }], characters: [], creatures: [], entreRivesCreationsV10: [{ id: 'creation-quete', kind: 'quest' }, { id: 'creation-temoin', kind: 'npc' }], [QUESTS_KEY]: [{ ...step(), history: [] }] };
  validateQuestSteps(campaign); assert.equal(questState(campaign[QUESTS_KEY][0]), 'planned');
  for (const patch of [{ sceneIds: ['ailleurs'] }, { references: [{ scope: 'campaign', id: 'autre-table' }] }, { questId: 'creation-temoin' },
    { history: [{ id: 'decision', at: '2026-11-16T12:00:00.000Z', from: 'revealed', to: 'resolved', note: 'Incohérent' }] },
    { history: [], unexpected: 'champ' }]) assert.throws(() => validateQuestSteps({ ...campaign, [QUESTS_KEY]: [{ ...campaign[QUESTS_KEY][0], ...patch }] }));
  assert.equal(validQuestStep({ ...step(), references: [step().references[0], step().references[0]] }), false);
  assert.equal(validQuestStep({ ...step(), title: ' ' }), false);
});
test('Les liens de retour suivent les identifiants, alias Markdown et plusieurs chemins sans autre campagne', () => {
  const campaign = { scenes: [{ id: 'scene-quai', title: 'Quai renommé', participantIds: ['temoin'], privateNotes: '[[creation-quete|Un autre titre]]', description: '' }, { id: 'scene-moulin', title: 'Moulin', participantIds: [], privateNotes: '', description: '' }],
    characters: [], creatures: [], entreRivesCreationsV10: [{ id: 'creation-quete', kind: 'quest', name: 'Quête renommée', parentId: null, links: [], description: '', notes: '', details: {} }], [QUESTS_KEY]: [{ ...step(), history: [] }] };
  const resolver = key => key === 'creation-quete' ? { id: key, name: 'Quête renommée' } : undefined;
  const links = text => referenceSegments(text, resolver).flatMap(part => part.entry ? [part.entry.id] : []);
  assert.deepEqual(resourceUsages(campaign, 'creation-quete', links).map(item => item.id), ['scene-quai', 'quest-step-corde']);
  assert.deepEqual(resourceUsages(campaign, 'quest-step-corde', links).map(item => item.label), ['Quai renommé', 'Moulin']);
  assert.deepEqual(resourceUsages(campaign, 'inexistant', links), []);
  assert.equal(referenceSegments('[[pnj:42|Témoin]]', key => ({ id: key, name: 'Témoin' }))[0].entry.id, 'pnj:42');
});
test('Décisions atomiques et rejouables, restauration v21 et refus des archives incohérentes', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('quete-data'); await seedQuestCampaign(page, f.url);
  const result = await page.evaluate(async input => {
    const { openStudioStore, sha256 } = await import('./store.mjs'); const { QUESTS_KEY } = await import('./quetes.mjs');
    const store = await openStudioStore(), destination = await openStudioStore({ name: 'quete-restauree-' + crypto.randomUUID() });
    try {
      let campaign = (await store.list())[0];
      const send = async (type, data) => campaign = await store.execute({ id: campaign.id, expectedRevision: campaign.revision, operationId: crypto.randomUUID(), type, data });
      await send('save-quest-step', input);
      const first = { id: campaign.id, expectedRevision: campaign.revision, operationId: 'decouverte', type: 'record-quest-decision', data: { id: input.id, state: 'revealed', at: '2026-11-16T12:00:00.000Z', note: 'Trouvé au moulin' } };
      campaign = await store.execute(first); await store.execute(first);
      let conflict; try { await store.execute({ ...first, operationId: 'autre-decision' }); } catch (error) { conflict = error.code; }
      await send('record-quest-decision', { id: input.id, state: 'planned', at: '2026-11-16T12:01:00.000Z', note: 'Correction de la table' });
      const before = JSON.stringify(await store.get(campaign.id)); let invalid;
      try { await send('save-quest-step', { ...input, sceneIds: ['ailleurs'] }); } catch (error) { invalid = error.code; }
      const unchanged = before === JSON.stringify(await store.get(campaign.id));
      await send('save-quest-step', { ...input, title: 'Corde renommée' });
      await send('save-fresque-marker', { id: 'repere-retirable', kind: 'lead', title: 'Ancienne piste', description: '', sceneId: null });
      await send('save-quest-step', { ...input, title: 'Corde renommée', references: [...input.references, { scope: 'campaign', id: 'repere-retirable' }] });
      await send('remove-fresque-marker', { id: 'repere-retirable' });
      const archive = JSON.parse(await store.exportBackup(campaign.id)); archive.payload.campaign.extensionPriveeTest = { note: 'CONSERVEE' };
      archive.sha256 = await sha256(JSON.stringify(archive.payload)); const json = JSON.stringify(archive);
      const preview = await destination.previewBackup(json), restored = await destination.restoreBackup(preview);
      const failures = [];
      for (const version of [20, 999]) { try { await destination.previewBackup(JSON.stringify({ ...archive, version })); } catch (error) { failures.push(error.code); } }
      const altered = structuredClone(archive); altered.payload.campaign[QUESTS_KEY][0].history[1].from = 'resolved'; altered.sha256 = await sha256(JSON.stringify(altered.payload));
      try { await destination.previewBackup(JSON.stringify(altered)); } catch (error) { failures.push(error.code); }
      return { conflict, invalid, unchanged, version: archive.version, count: preview.questSteps, step: restored[QUESTS_KEY][0], extension: restored.extensionPriveeTest, failures };
    } finally { store.close(); destination.close(); }
  }, step());
  assert.equal(result.version, 21); assert.equal(result.count, 1); assert.equal(result.step.history.length, 2); assert.equal(result.step.title, 'Corde renommée');
  assert.deepEqual(result.step.references, step().references);
  assert.equal(result.conflict, 'conflict'); assert.equal(result.invalid, 'invalid-data'); assert.equal(result.unchanged, true);
  assert.deepEqual(result.extension, { note: 'CONSERVEE' }); assert.deepEqual(result.failures, ['backup-version', 'backup-version', 'invalid-data']);
});
