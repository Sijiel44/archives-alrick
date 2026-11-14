import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { PJ_SOURCE_KEY, PLAY_ACTIONS_KEY } from '../store.mjs';
import { browserFixture } from './browser.mjs';

const stats = { physique: 3, agilite: 3, esprit: 3, presence: 3 };
const defenses = { physique: 0, magie: 0, mental: 0 };
const original = {
  id: 'pj-source-atelier', name: 'Néria des rives', kind: 'pj', ruleset: 'm02', level: 5,
  profession: 'Éclaireuse', stats: { ...stats, physique: 5 }, masteries: { lames: 1 },
  pv: 32, pvMax: 36, mana: 4, manaMax: 8, xp: 400,
  resistanceBonus: defenses, protection: defenses, equipmentGrades: defenses,
  development: { startingStats: stats, abilities: [{
    id: 'aptitude-guet', name: 'Guet du matin', kind: 'aptitude', domain: 'survie', levelRequired: 3,
    provenance: 'Parcours fictif', approvedByGM: false, status: 'slot', rank: 1,
  }], awards: [], approvedMilestones: [], history: [] },
  inventory: [{ name: 'Lanterne sourde', quantity: 2 }], gmNotes: 'CANARI_PJ_M02',
  sourceExtension: { privateReference: 'conservée', portrait: 'https://example.invalid/portrait.webp' },
};
const file = sheets => ({ name: 'fiches-atelier.json', mimeType: 'application/json',
  buffer: Buffer.from(JSON.stringify({ schema: 'alrick.sheets.v3', sheets })) });

test('Import M02 ciblé, rattachement sans perte, jet et opposition en séance, restauration v9', { timeout: 70000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('pj-m02', { viewport: { width: 1280, height: 900 } });
  await page.goto(fixture.url);
  await page.locator('#campaign-name').fill('Les veilleurs · test PJ');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
  await page.locator('#add-character').click();
  await page.locator('#character-name').fill('Néria en campagne');
  await page.locator('#character-notes').fill('Notes privées de la campagne.');
  await page.locator('#character-form button[type=submit]').click();
  await page.locator('#character-dialog').waitFor({ state: 'hidden' });
  await page.locator('#add-scene').click();
  await page.locator('#scene-title').fill('La porte des guetteurs');
  await page.locator('#scene-participants').getByRole('checkbox', { name: /Néria/ }).check();
  await page.locator('#scene-form button[type=submit]').click();
  await page.locator('#scene-dialog').waitFor({ state: 'hidden' });

  await page.locator('#import-pj').click();
  await page.locator('#pj-import-file').setInputFiles(file([original, { ...original, id: 'second-pj', name: 'Autre PJ' },
    { ...original, id: 'ancienne-fiche', ruleset: 'legacy' }]));
  await page.locator('#pj-import-status').getByText(/2 fiche.*1 autre/).waitFor();
  assert.equal(await page.locator('#pj-import-submit').isDisabled(), true);
  await page.locator('#pj-import-source').selectOption('0');
  await page.locator('#pj-import-preview').getByText('32 / 36 PV', { exact: true }).waitFor();
  await page.getByText('Inventaire source', { exact: true }).click();
  await page.getByText('Lanterne sourde × 2', { exact: true }).waitFor();
  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.locator('#pj-import-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true, `dialogue ${width}px`);
  }
  await page.locator('#pj-import-destination').selectOption({ label: 'Rattacher à Néria en campagne' });
  await page.locator('#pj-import-submit').click();
  await page.locator('#pj-import-dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Modifier Néria en campagne' }).click();
  assert.equal(await page.locator('#character-level').inputValue(), '5');
  assert.equal(await page.locator('#character-level').evaluate(el => el.readOnly), true);
  assert.equal(await page.locator('#character-notes').inputValue(), 'Notes privées de la campagne.');
  await page.keyboard.press('Escape');

  await page.locator('#nav-play').click();
  const participant = page.locator('#participant-list');
  await participant.getByText(/PJ · M02.*32 \/ 36 PV/).waitFor();
  await participant.getByRole('button', { name: 'Ouvrir la fiche de Néria en campagne' }).click();
  await page.getByRole('button', { name: 'Préparer un jet 5d6' }).click();
  assert.equal(await page.locator('#play-actor').inputValue(), 'Néria en campagne');
  assert.equal(await page.locator('#play-raw-stat').inputValue(), '5');
  await page.locator('#play-profile-mastery').selectOption('lames');
  assert.equal(await page.locator('#play-mastery').inputValue(), '1');
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#play-action-form .cancel-edit').click();
  await participant.getByRole('button', { name: 'Ouvrir la fiche de Néria en campagne' }).click();
  await page.getByRole('button', { name: 'Cibler en opposition' }).click();
  await page.locator('#play-intent').fill('Repousser la garde');
  await page.locator('#play-stakes').fill('Le passage est dégagé si la garde recule.');
  await page.locator('#play-raw-stat').fill('5');
  await page.locator('#play-attacker-level').fill('5');
  await page.locator('#play-lock').click();
  await page.locator('#play-dice-source').selectOption('table');
  for (const die of await page.locator('#play-manual-dice input').all()) await die.fill('6');
  await page.locator('#play-resolve').click();
  await page.locator('#play-impact-change').getByText(/32 → 23 PV/).waitFor();
  await page.locator('#play-apply-damage').check();
  await page.locator('#play-consequence').fill('CANARI_JOURNAL_PJ');
  await page.locator('#play-record').click();
  await page.locator('#play-action-dialog').waitFor({ state: 'hidden' });
  await participant.getByText(/23 \/ 36 PV/).waitFor();
  await participant.getByRole('button', { name: 'Ouvrir la fiche de Néria en campagne' }).click();
  await page.getByRole('button', { name: 'Préparer un échange pour le joueur', exact: true }).click();
  await page.locator('#pj-export-status').getByText(/Copie prête/).waitFor();
  const [exchangeFile] = await Promise.all([page.waitForEvent('download'), page.locator('#pj-export-download').click()]);
  const packet = JSON.parse(await readFile(await exchangeFile.path(), 'utf8'));
  assert.equal(packet.payload.sheet.pv, 23);
  assert.equal(packet.payload.sheet.name, 'Néria en campagne');
  assert.doesNotMatch(JSON.stringify(packet), /CANARI/);
  await page.locator('#pj-export-close').click();
  await page.locator('#share-title').check();
  await page.locator('#show-projection').click();
  assert.doesNotMatch(await page.locator('#projection iframe').getAttribute('srcdoc'), /CANARI|Néria|23 \/ 36 PV/);
  await page.locator('#stop-projection').click();

  await page.locator('#nav-backups').click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const buffer = await readFile(await download.path());
  const archive = JSON.parse(buffer);
  const { campaign } = archive.payload;
  assert.equal(archive.version, 9);
  assert.equal(campaign.characters.length, 1);
  assert.deepEqual(campaign.characters[0][PJ_SOURCE_KEY], original);
  assert.equal(campaign.scenes[0].participantIds[0], campaign.characters[0].id);
  assert.equal(campaign[PLAY_ACTIONS_KEY][0].combat.hpAfter, 23);
  assert.doesNotMatch(buffer.toString(), /Autre PJ|ancienne-fiche/);

  const { page: restored } = await fixture.open('pj-m02-restaure', { viewport: { width: 390, height: 844 } });
  await restored.goto(fixture.url);
  await restored.locator('#save-status').getByText('Stockage local prêt', { exact: true }).waitFor();
  await restored.locator('#nav-backups').click();
  await restored.locator('#backup-file').setInputFiles({ name: 'campagne-v9.json', mimeType: 'application/json', buffer });
  await restored.locator('#backup-summary').getByText(/1 fiche\(s\) PJ M02/).waitFor();
  await restored.locator('#restore-backup').click();
  await restored.locator('#prepare-title').waitFor();
  await restored.locator('#nav-play').click();
  await restored.locator('#participant-list').getByText(/23 \/ 36 PV/).waitFor();
});

test('Création d’un PJ importé, contrôle natif du budget et conflits de rattachement', { timeout: 38000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('pj-m02-contrats');
  await page.goto(fixture.url);
  const result = await page.evaluate(async source => {
    const { openStudioStore, PJ_SOURCE_KEY } = await import('/store.mjs');
    const store = await openStudioStore({ name: 'pj-m02-contrats' });
    const id = 'campagne-test-pj';
    const run = (type, expectedRevision, data, operationId = crypto.randomUUID()) => store.execute({ id, expectedRevision, type, data, operationId });
    const rejection = async callback => {
      try { await callback(); return null; } catch (error) { return error.code; }
    };
    try {
      await run('create', 0, { name: 'Campagne fictive', description: '', style: 'campaign', startingLevel: 1 });
      const data = { id: 'instance-pj', attach: false, source };
      const budget = await rejection(() => run('attach-pj-source', 1, { ...data, source: { ...source, stats: { ...source.stats, physique: 500 } } }));
      const saved = await run('attach-pj-source', 1, data, 'import-pj');
      const reordered = Object.fromEntries(Object.entries(source).reverse());
      const retry = await run('attach-pj-source', 1, { ...data, source: reordered }, 'import-pj');
      const stale = await rejection(() => run('attach-pj-source', 1, { ...data, id: 'autre-pj' }));
      const conflict = await rejection(() => run('attach-pj-source', 2, { ...data, attach: true }));
      const level = await rejection(() => run('save-character', 2, { id: data.id, level: 2, name: source.name, notes: '' }));
      const archive = JSON.parse(await store.exportBackup(id));
      const downgrade = await rejection(() => store.previewBackup(JSON.stringify({ ...archive, version: 8 })));
      return { budget, stale, conflict, level, downgrade, revision: retry.revision, count: retry.characters.length,
        sourceId: saved.characters[0][PJ_SOURCE_KEY].id, id: saved.characters[0].id };
    } finally { store.close(); }
  }, original);
  assert.deepEqual(result, { budget: 'invalid-data', stale: 'conflict', conflict: 'conflict', level: 'invalid-command',
    downgrade: 'backup-version', revision: 2, count: 1, sourceId: original.id, id: 'instance-pj' });
});
