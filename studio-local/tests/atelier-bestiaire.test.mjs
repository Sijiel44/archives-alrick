import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { BESTIARY_PROFILE_KEY, BESTIARY_SCHEMA, PLAY_ACTIONS_KEY } from '../store.mjs';
import { browserFixture } from './browser.mjs';

async function createCampaign(page, name) {
  await page.locator('#campaign-name').fill(name);
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
}

async function exportCampaign(page) {
  await page.locator('#nav-backups').click();
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  return readFile(await file.path(), 'utf8');
}

function jsonFile(value) {
  return { name: 'fiche-fictive.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) };
}

test('Atelier M04, fiche M05, jet prérempli en séance et restauration v7', { timeout: 65000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('atelier-composition', { viewport: { width: 1280, height: 940 } });
  await page.goto(fixture.url);
  await createCampaign(page, 'Campagne des profils fictifs');
  await page.getByRole('button', { name: 'Créer un profil 5d6', exact: true }).click();
  const title = 'Colosse du gué';
  const sheet = page.locator('#workshop-sheet');
  await page.locator('#workshop-name').fill(title);
  await page.locator('#workshop-level').fill('15');
  await page.locator('#workshop-archetype').selectOption('colosse');
  await page.locator('#workshop-generate').click();
  await sheet.getByRole('heading', { name: title }).waitFor();
  assert.equal(await sheet.locator('.profile-meters strong').first().textContent(), '194');
  assert.deepEqual(await sheet.locator('.profile-stats strong').allTextContents(), ['15', '7', '8', '8']);
  await sheet.getByText('Résistances et absorptions', { exact: true }).click();
  await sheet.getByText('Seuil 27', { exact: true }).waitFor();
  await sheet.getByText('Attaque de référence', { exact: true }).click();
  await sheet.getByText('Dégâts de base', { exact: true }).waitFor();
  for (const width of [1280, 960, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 860 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `atelier ${width}px`);
  }
  await page.locator('#workshop-save').click();
  await page.locator('#save-status').getByText(`${title} · profil sauvegardé`, { exact: true }).waitFor();
  assert.equal(await page.locator('#workshop-save').isDisabled(), true);

  await page.locator('#nav-prepare').click();
  await page.getByRole('button', { name: `Ouvrir le profil 5d6 de ${title}`, exact: true }).click();
  const resource = page.locator('#resource-profile');
  await resource.getByText('Créature · M03 · niveau 15', { exact: true }).waitFor();
  await page.keyboard.press('Escape');
  await page.locator('#add-scene').click();
  await page.locator('#scene-title').fill('Passage sous la digue');
  await page.locator('#scene-participants').getByRole('checkbox', { name: /Colosse du gué/ }).check();
  await page.locator('#scene-form button[type=submit]').click();
  await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-play').click();
  await page.locator('#participant-list').getByRole('button', { name: `Ouvrir la fiche de ${title}`, exact: true }).click();
  await page.getByRole('button', { name: 'Préparer un jet 5d6', exact: true }).click();
  assert.equal(await page.locator('#play-actor').inputValue(), title);
  assert.equal(await page.locator('#play-raw-stat').inputValue(), '15');
  await page.locator('#play-stat').selectOption('agilite');
  assert.equal(await page.locator('#play-raw-stat').inputValue(), '7');
  const option = page.locator('#play-profile-mastery option[value="esquive"]');
  const rank = Number((await option.textContent()).split(' ').at(-1));
  await page.locator('#play-profile-mastery').selectOption('esquive');
  assert.equal(Number(await page.locator('#play-mastery').inputValue()), rank);
  await page.locator('#play-intent').fill('Éviter une chute de pierres');
  await page.locator('#play-stakes').fill('Le passage reste libre si le colosse se décale.');
  await page.locator('#play-lock').click();
  await page.locator('#play-locked-parameters').getByText(/Agilité 7/).waitFor();
  await page.locator('#play-resolve').click();
  await page.locator('#play-consequence').fill('Le groupe choisit de traverser en file.');
  await page.locator('#play-consequence-step button[type=submit]').click();
  await page.locator('#play-action-dialog').waitFor({ state: 'hidden' });

  const saved = await exportCampaign(page);
  const archive = JSON.parse(saved);
  const campaign = archive.payload.campaign;
  const [creature] = campaign.creatures;
  assert.equal(archive.version, 7);
  assert.equal(creature[BESTIARY_PROFILE_KEY].card.pvMax, 194);
  assert.notEqual(creature.id, creature.source.id);
  assert.equal(campaign[PLAY_ACTIONS_KEY][0].roll.rawStat, 7);
  assert.equal(campaign[PLAY_ACTIONS_KEY][0].roll.masteryRank, rank);
  const { page: restored } = await fixture.open('atelier-restaure', { viewport: { width: 390, height: 844 } });
  await restored.goto(fixture.url);
  await restored.locator('#save-status').getByText('Stockage local prêt', { exact: true }).waitFor();
  await restored.locator('#nav-backups').click();
  await restored.locator('#backup-file').setInputFiles({ name: 'campagne-fictive.json', mimeType: 'application/json', buffer: Buffer.from(saved) });
  await restored.locator('#backup-summary').getByText(/1 profil\(s\) M03/).waitFor();
  await restored.locator('#restore-backup').click();
  await restored.getByRole('button', { name: `Ouvrir le profil 5d6 de ${title}`, exact: true }).click();
  assert.equal(await restored.locator('#resource-profile .profile-meters strong').first().textContent(), '194');
});

test('Import volontaire du JSON historique avec original privé conservé et édition indépendante', { timeout: 50000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('atelier-import');
  const requested = [];
  page.on('request', request => requested.push(request.url()));
  await page.goto(fixture.url);
  await createCampaign(page, 'Campagne d’import fictive');
  const original = await page.evaluate(async () => {
    const { createBestiaryCard } = await import('/moteur/atelier5d6-bestiary-workshop.js');
    const card = createBestiaryCard(9, 'mystique', 'pnj', 'soutien');
    return { ...card, name: 'Archiviste de la rive', profession: 'Cartographe', notes: 'CANARI_PROFIL_PRIVÉ',
      artwork: { status: 'publication_approuvee', rights: { toString: null }, url: 'https://example.invalid/private-portrait.webp' },
      extension: { description: 'Annotation de source' },
      abilities: [{ name: 'Veille', description: 'Une veille à la lanterne.', limitations: 'Sur la rive.', approvedByGM: false }] };
  });
  await page.locator('#nav-workshop').click();
  await page.locator('#workshop-mode-import').click();
  await page.locator('#workshop-file').setInputFiles(jsonFile({ schema: 'alrick.sheets.v3', sheets: [original] }));
  await page.locator('#workshop-error').getByText(/alrick.bestiary.v1/).waitFor();
  assert.equal(await page.locator('#workshop-save').isDisabled(), true);
  await page.locator('#workshop-file').setInputFiles(jsonFile(original));
  await page.locator('#workshop-sheet').getByText('Source importée', { exact: false }).waitFor();
  await page.locator('#workshop-sheet').getByText('Cartographe', { exact: true }).waitFor();
  await page.locator('#workshop-save').click();
  await page.locator('#save-status').getByText(/Archiviste de la rive.*profil sauvegardé/).waitFor();
  await page.locator('#nav-prepare').click();
  await page.getByRole('button', { name: 'Adapter Archiviste de la rive', exact: true }).click();
  await page.locator('#creature-name').fill('Archiviste du pont');
  await page.locator('#creature-form button[type=submit]').click();
  await page.locator('#creature-dialog').waitFor({ state: 'hidden' });

  const archive = JSON.parse(await exportCampaign(page));
  const [creature] = archive.payload.campaign.creatures;
  assert.equal(creature.name, 'Archiviste du pont');
  assert.deepEqual(creature.source, { id: original.id, version: BESTIARY_SCHEMA });
  assert.deepEqual(creature[BESTIARY_PROFILE_KEY].original, original);
  assert.equal(creature[BESTIARY_PROFILE_KEY].card.name, original.name);
  assert.ok(requested.every(url => new URL(url).origin === new URL(fixture.url).origin));
});

test('Validation des profils, journal idempotent et refus d’un fichier rétrogradé', { timeout: 40000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('atelier-contrats');
  await page.goto(fixture.url);
  const result = await page.evaluate(async () => {
    const { BESTIARY_PROFILE_KEY, BESTIARY_SCHEMA, openStudioStore } = await import('/store.mjs');
    const { createProfile } = await import('/atelier-bestiaire.mjs');
    const store = await openStudioStore({ name: 'profils-fictifs' });
    async function failure(callback) {
      try { await callback(); return null; }
      catch (error) { return error.code; }
    }
    try {
      await store.execute({ id: 'profil-test', expectedRevision: 0, operationId: 'creation', type: 'create',
        data: { name: 'Campagne fictive', description: '', style: 'campaign', startingLevel: 1 } });
      const profile = createProfile({ name: 'Créature fictive', description: '', level: 5, archetype: 'faune', kind: 'creature', role: 'offensif' });
      const data = { id: 'exemplaire', name: profile.card.name, description: '', source: { id: profile.card.id, version: BESTIARY_SCHEMA }, profile };
      const command = { id: 'profil-test', expectedRevision: 1, operationId: 'insertion', type: 'save-bestiary-profile', data };
      const invalid = await failure(() => store.execute({ ...command,
        data: { ...data, profile: { ...profile, card: { ...profile.card, pvMax: 0 } } } }));
      const saved = await store.execute(command);
      const retry = await store.execute({ ...command, data: { ...data, profile: { original: null, card: profile.card, origin: 'created' } } });
      const backup = JSON.parse(await store.exportBackup('profil-test'));
      const downgrade = await failure(() => store.previewBackup(JSON.stringify({ ...backup, version: 6 })));
      return { invalid, downgrade, count: retry.creatures.length, revision: retry.revision, originalRevision: saved.revision,
        version: backup.version, profile: retry.creatures[0][BESTIARY_PROFILE_KEY].card.name };
    } finally { store.close(); }
  });
  assert.deepEqual(result, { invalid: 'invalid-command', downgrade: 'backup-version', count: 1, revision: 2,
    originalRevision: 2, version: 7, profile: 'Créature fictive' });
});

test('Navigation mobile, vue liste persistante et nouvelle illustration de Bestiaire', { timeout: 40000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('design-studio', { viewport: { width: 390, height: 844 } });
  await page.goto(fixture.url);
  await page.locator('#nav-library').click();
  await page.locator('#library-shelves a[href="#rayon/bestiaire"]').click();
  const filterSummary = page.locator('#catalogue-filter-summary');
  assert.equal(await page.locator('#catalogue-filters').evaluate(el => el.open), false);
  await filterSummary.click();
  await page.locator('#catalogue-origin').selectOption('archives');
  await filterSummary.getByText('Filtres de recherche · 1', { exact: true }).click();
  assert.equal(await page.locator('#catalogue-filters').evaluate(el => el.open), false);
  await page.locator('#library-layout-list').click();
  assert.equal(await page.locator('#catalogue-list').getAttribute('data-layout'), 'list');
  await page.reload();
  await page.locator('#nav-library').click();
  await page.locator('#library-shelves a[href="#rayon/bestiaire"]').click();
  assert.equal(await page.locator('#library-layout-list').getAttribute('aria-pressed'), 'true');
  await page.locator('#catalogue-search').fill('lamproie');
  const illustration = page.locator('#catalogue-list img[src$="lamproie-de-nacre.webp"]');
  assert.ok(await illustration.evaluate(async img => { await img.decode(); return img.naturalWidth; }));
  await page.setViewportSize({ width: 320, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.getByRole('button', { name: 'Ouvrir l’Atelier du Bestiaire', exact: true }).click();
  await page.locator('#workshop-title').waitFor();
  assert.equal(await page.locator('#workshop-save').isDisabled(), true);
});
