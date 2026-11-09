import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { CREATION_TYPES } from '../creations.mjs';
import { CREATIONS_KEY } from '../store.mjs';
import { browserFixture } from './browser.mjs';

test('Atelier MJ, Atlas relié, repère de séance et restauration v10', { timeout: 60000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('creations');
  const modal = page.locator('#creation-dialog');
  const resource = page.locator('#resource-dialog');
  const save = async () => {
    await modal.getByRole('button', { name: 'Enregistrer la création' }).click();
    await modal.waitFor({ state: 'hidden' });
    await page.locator('#save-status').getByText('Création enregistrée dans la bibliothèque').waitFor();
  };
  const secret = 'CANARI_CREATION_MJ';
  await page.goto(fixture.url);
  await page.locator('#campaign-name').fill('La route des passerelles');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
  await page.locator('#nav-creations').click();
  assert.equal(await page.locator('.creation-card').count(), Object.keys(CREATION_TYPES).length);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `atelier à ${width}px`);
  }
  await page.getByRole('button', { name: 'Créer · Lieu', exact: true }).focus();
  await page.keyboard.press('Enter');
  await modal.getByLabel('Nom', { exact: true }).fill('Continent des Veilles');
  await modal.getByLabel('Type de lieu').selectOption('Continent');
  await save();
  await page.getByRole('button', { name: 'Créer · Lieu', exact: true }).click();
  await modal.getByLabel('Nom', { exact: true }).fill('Ville des Écluses');
  await modal.getByLabel('Type de lieu').selectOption('Ville');
  await modal.getByLabel('Lieu parent').selectOption({ label: 'Continent des Veilles · Continent' });
  const parentId = await modal.getByLabel('Lieu parent').inputValue();
  await modal.getByLabel('Accès et déplacements').fill(`Une route vers [[${parentId}|le continent]].`);
  await modal.getByLabel('Notes privées du MJ').fill(secret);
  await modal.getByLabel('État de préparation').selectOption('ready');
  assert.ok(await modal.evaluate(el => el.scrollWidth <= el.clientWidth));
  await save();
  await page.getByRole('button', { name: 'Créer · PNJ', exact: true }).click();
  await modal.getByLabel('Nom', { exact: true }).fill('Sanna des Écluses');
  await modal.getByLabel('Rôle ou métier').fill('Garde des ponts');
  await modal.getByText('Relier des fiches', { exact: true }).click();
  await modal.getByLabel('Fiche à relier').selectOption({ label: 'Ville des Écluses' });
  await modal.getByRole('button', { name: 'Ajouter le lien' }).click();
  await save();
  await page.locator('#nav-library').click();
  await page.getByRole('link', { name: /Atlas/ }).click();
  await page.locator('#catalogue-filter-summary').click();
  await page.locator('#catalogue-group').selectOption('Ville');
  await page.getByRole('button', { name: 'Voir la fiche de Ville des Écluses' }).click();
  await resource.getByText('Prête pour la séance', { exact: true }).waitFor();
  await resource.getByText('Notes privées du MJ', { exact: true }).click();
  await resource.getByText(secret, { exact: true }).waitFor();
  const shortcut = await resource.getByLabel('Raccourci Markdown').inputValue();
  const cityId = shortcut.slice(2, -2);
  await resource.getByRole('link', { name: 'le continent', exact: true }).click();
  await resource.getByRole('heading', { name: 'Continent des Veilles', exact: true }).waitFor();
  await resource.getByRole('link', { name: 'Ville des Écluses', exact: true }).click();
  await resource.getByRole('button', { name: 'Ajouter comme repère' }).click();
  assert.match(await page.locator('#marker-description').inputValue(), /^\[\[creation-/);
  await page.locator('#marker-form button[type=submit]').click();
  await page.locator('#marker-dialog').waitFor({ state: 'hidden' });

  await page.locator('#nav-library').click();
  await page.getByRole('link', { name: /Bestiaire/ }).click();
  await page.locator('#catalogue-search').fill('garde ponts');
  await page.getByRole('button', { name: 'Voir la fiche de Sanna des Écluses' }).click();
  await resource.getByRole('link', { name: 'Ville des Écluses', exact: true }).waitFor();
  await resource.getByRole('button', { name: 'Préremplir un profil 5d6' }).click();
  assert.equal(await page.locator('#workshop-name').inputValue(), 'Sanna des Écluses');
  assert.equal(await page.locator('#workshop-kind').inputValue(), 'pnj');

  await page.locator('#nav-prepare').click();
  await page.locator('#marker-reserve-list summary').getByText('Ville des Écluses', { exact: true }).click();
  await page.locator('#marker-reserve-list').getByRole('link', { name: 'Ville des Écluses', exact: true }).click();
  await resource.getByRole('heading', { name: 'Ville des Écluses', exact: true }).waitFor();
  await page.keyboard.press('Escape');
  await page.locator('#add-scene').click();
  await page.locator('#scene-title').fill('Au pied de la porte');
  await page.locator('#scene-form button[type=submit]').click();
  await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-play').click();
  await page.locator('#share-title').check();
  await page.locator('#show-projection').click();
  assert.doesNotMatch(await page.locator('#projection iframe').getAttribute('srcdoc'), /CANARI_CREATION_MJ|Ville des Écluses/);
  await page.locator('#stop-projection').click();
  await page.locator('#nav-backups').click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const buffer = await readFile(await download.path());
  const archive = JSON.parse(buffer);
  assert.equal(archive.version, 10);
  assert.equal(archive.payload.campaign[CREATIONS_KEY][1].parentId, parentId);

  const { page: restored } = await fixture.open('creations-restaurees', { viewport: { width: 390, height: 844 } });
  await restored.goto(fixture.url);
  await restored.locator('#save-status').getByText('Stockage local prêt', { exact: true }).waitFor();
  await restored.locator('#nav-backups').click();
  await restored.locator('#backup-file').setInputFiles({ name: 'creations-v10.json', mimeType: 'application/json', buffer });
  await restored.locator('#backup-summary').getByText(/3 création\(s\) MJ/).waitFor();
  await restored.locator('#restore-backup').click();
  await restored.locator('#prepare-title').waitFor();
  await restored.goto(new URL(`#fiche/${cityId}`, fixture.url).href);
  await restored.reload();
  await restored.locator('#resource-title').getByText('Ville des Écluses', { exact: true }).waitFor();
  await restored.getByRole('button', { name: 'Modifier la création' }).click();
  assert.equal(await restored.locator('#creation-parent').inputValue(), parentId);
  await restored.locator('#creation-state').selectOption('shelved');
  await restored.locator('#creation-form button[type=submit]').click();
  await restored.locator('#creation-dialog').waitFor({ state: 'hidden' });
  await restored.locator('#catalogue-search').fill('Ville des Écluses');
  await restored.getByRole('article').filter({ hasText: 'Mise de côté' })
    .getByRole('button', { name: 'Voir la fiche de Ville des Écluses' }).click();
  await restored.locator('#resource-status').getByText('Mise de côté', { exact: true }).waitFor();
});

test('Les douze modèles respectent le contrat de stockage et refusent les parents invalides', { timeout: 30000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('contrat-creations');
  await page.goto(fixture.url);
  const result = await page.evaluate(async () => {
    const { CREATION_TYPES } = await import('/creations.mjs');
    const { openStudioStore, CREATIONS_KEY } = await import('/store.mjs');
    const store = await openStudioStore({ name: 'contrat-creations' });
    const attempt = async action => {
      try { await action(); return 'ok'; }
      catch (error) { return error.code; }
    };
    try {
      let campaign = await store.execute({ id: 'test-campagne', operationId: 'campagne', expectedRevision: 0,
        type: 'create', data: { name: 'Test', style: 'campaign', startingLevel: 1, description: '' } });
      const command = (data, operationId) => ({ id: campaign.id, expectedRevision: campaign.revision,
        operationId, type: 'save-creation', data });
      for (const [kind, { fields }] of Object.entries(CREATION_TYPES)) {
        campaign = await store.execute(command({ id: `creation-${kind}`, kind, name: kind, description: '', notes: '',
          state: 'draft', parentId: null, links: [],
          details: Object.fromEntries(fields.map(({ key, choices }) => [key, choices?.[0] ?? ''])) }, `save-${kind}`));
      }
      const root = campaign[CREATIONS_KEY].find(entry => entry.kind === 'place');
      const child = { ...root, id: 'creation-ville', parentId: root.id, details: { ...root.details, scale: 'Ville' } };
      const first = command(child, 'save-ville');
      campaign = await store.execute(first);
      const retried = await store.execute(first);
      const cycle = await attempt(() => store.execute(command({ ...root, parentId: child.id }, 'cycle')));
      const orphan = await attempt(() => store.execute(command({ ...root, parentId: 'creation-npc' }, 'orphan')));
      const crossLink = await attempt(() => store.execute(command({ ...child, links: ['creation-autre-campagne'] }, 'crosslink')));
      const invalid = await attempt(() => store.execute(command({ ...child, details: { ...child.details, scale: 'Inconnu' } }, 'scale')));
      const archive = JSON.parse(await store.exportBackup(campaign.id));
      const downgrade = await attempt(() => store.previewBackup(JSON.stringify({ ...archive, version: 9 })));
      return { revision: campaign.revision, retried: retried.revision, cycle, orphan, crossLink, invalid, downgrade,
        count: archive.payload.campaign[CREATIONS_KEY].length, version: archive.version };
    } finally { store.close(); }
  });
  assert.deepEqual(result, { revision: 14, retried: 14, cycle: 'invalid-data', orphan: 'foreign-key', crossLink: 'foreign-key',
    invalid: 'invalid-command', downgrade: 'backup-version', count: 13, version: 10 });
});
