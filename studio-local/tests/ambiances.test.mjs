import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { SCENE_AMBIANCES_KEY } from '../store.mjs';
import { browserFixture } from './browser.mjs';

test('Carnet d’ambiances par scène, aperçu privé et restauration v12', { timeout: 65000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open('ambiances', { viewport: { width: 1440, height: 950 } });
  await page.goto(fixture.url);
  await page.locator('#campaign-name').fill('CANARI_CAMPAGNE La route');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
  for (const title of ['Le gué', 'La colline']) {
    await page.locator('#add-scene').click();
    await page.locator('#scene-title').fill(title);
    await page.locator('#scene-description').fill('CANARI_TEXTE_SCENE');
    await page.locator('#scene-private-notes').fill('CANARI_NOTES_MJ');
    await page.locator('#scene-form button[type=submit]').click();
    await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
  }
  const card = page.locator('#scene-list .scene-card').filter({ has: page.getByRole('heading', { name: 'Le gué', exact: true }) });
  await card.getByText('Carnet d’ambiances', { exact: true }).click();
  await card.getByRole('button', { name: 'Ajouter une ambiance' }).click();
  const editor = page.locator('#ambiance-dialog');
  const save = async () => {
    await editor.getByRole('button', { name: 'Enregistrer l’ambiance' }).click();
    await editor.waitFor({ state: 'hidden' });
    await page.locator('#save-status').getByText('Ambiance enregistrée').waitFor();
  };
  await editor.getByLabel('Nom privé de l’ambiance').fill('CANARI_PLAN Nuit au gué');
  await editor.getByRole('button', { name: 'Enregistrer l’ambiance' }).click();
  await editor.getByRole('alert').getByText(/Ajoutez au moins un titre/).waitFor();
  await editor.getByRole('button', { name: 'Reprendre le titre et le texte de la scène' }).click();
  assert.equal(await editor.getByLabel('Titre à projeter').inputValue(), 'Le gué');
  assert.equal(await editor.getByLabel('Texte à projeter').inputValue(), 'CANARI_TEXTE_SCENE');
  await editor.getByLabel('Titre à projeter').fill('Après la dernière lanterne');
  await editor.getByLabel('Texte à projeter').fill('Un passeur apparaît dans la brume.');
  await editor.getByLabel('Image du catalogue').selectOption('image-gardien-des-salines');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await editor.evaluate(el => el.scrollWidth <= el.clientWidth), 'éditeur à ' + width + 'px');
  }
  await save();
  await card.getByText('CANARI_PLAN Nuit au gué', { exact: true }).waitFor();

  await page.locator('#nav-play').click();
  await page.locator('#quick-ambiances').click();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'play-ambiances-title');
  const notebook = page.locator('#play-ambiances');
  await notebook.getByRole('button', { name: 'Ajouter une ambiance' }).click();
  await editor.getByLabel('Nom privé de l’ambiance').fill('Carte seule');
  await editor.getByLabel('Image du catalogue').selectOption('carte-ensembles');
  await save();
  await page.locator('#jump-scene').selectOption({ label: 'La colline' });
  await notebook.getByText('Aucune ambiance préparée pour cette scène.').waitFor();
  await page.locator('#jump-scene').selectOption({ label: 'Le gué' });
  await notebook.getByRole('button', { name: 'Préparer l’ambiance Carte seule' }).click();
  const review = page.locator('#player-share-dialog');
  await page.frameLocator('#player-share-preview iframe').locator('img').evaluate(img => img.decode());
  assert.equal(await review.locator('#scene-share-fields input:checked').count(), 0);
  assert.equal(await page.locator('#stop-player-window').isVisible(), false);
  await review.getByRole('button', { name: 'Annuler' }).click();

  await page.reload();
  await page.getByRole('button', { name: 'Ouvrir CANARI_CAMPAGNE La route', exact: true }).click();
  await page.locator('#nav-play').click();
  await page.locator('#edit-current-scene').click();
  await page.locator('#scene-title').fill('Le gué après la pluie');
  await page.locator('#scene-form button[type=submit]').click();
  await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
  await notebook.getByRole('button', { name: 'Préparer l’ambiance CANARI_PLAN Nuit au gué' }).click();
  const image = page.frameLocator('#player-share-preview iframe').locator('img');
  await image.evaluate(img => img.decode());
  assert.equal(await review.getByRole('checkbox', { name: 'Titre de l’ambiance' }).isChecked(), true);
  assert.equal(await review.getByRole('checkbox', { name: 'Texte de l’ambiance' }).isChecked(), true);
  const preview = await page.locator('#player-share-preview iframe').getAttribute('srcdoc');
  assert.match(preview, /<h1>Après la dernière lanterne<\/h1>.*Un passeur apparaît dans la brume/s);
  assert.doesNotMatch(preview, /CANARI|Le gué après la pluie/);
  const [player] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  const shown = player.locator('#player-sheet iframe');
  await shown.waitFor();
  assert.ok(await shown.getAttribute('srcdoc') === preview, 'Le document de la fenêtre est celui de l’aperçu.');
  await page.getByRole('button', { name: 'Retirer la scène de la fenêtre joueur' }).click();
  await page.locator('#nav-backups').click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const buffer = await readFile(await download.path());
  const archive = JSON.parse(buffer);
  assert.equal(archive.version, 12);
  const [first, second] = archive.payload.campaign.scenes;
  assert.equal(first[SCENE_AMBIANCES_KEY].length, 2);
  assert.equal(first[SCENE_AMBIANCES_KEY][0].imageId, 'image-gardien-des-salines');
  assert.equal(second[SCENE_AMBIANCES_KEY], undefined);
  assert.doesNotMatch(buffer.toString(), /data:image\//);

  const { page: restored } = await fixture.open('ambiances-restaurees', { viewport: { width: 390, height: 844 } });
  await restored.goto(fixture.url);
  await restored.locator('#save-status').getByText('Stockage local prêt').waitFor();
  await restored.locator('#nav-backups').click();
  await restored.locator('#backup-file').setInputFiles({ name: 'ambiances-v12.json', mimeType: 'application/json', buffer });
  await restored.locator('#backup-summary').getByText(/2 ambiance\(s\)/).waitFor();
  await restored.locator('#restore-backup').click();
  await restored.locator('#prepare-title').waitFor();
  await restored.locator('#nav-play').click();
  await restored.getByRole('button', { name: 'Modifier l’ambiance Carte seule' }).click();
  await restored.getByLabel('Nom privé de l’ambiance').fill('Carte des rives');
  await restored.getByRole('button', { name: 'Enregistrer l’ambiance' }).click();
  await restored.getByRole('button', { name: 'Préparer l’ambiance Carte des rives' }).waitFor();
  restored.once('dialog', dialog => dialog.accept());
  await restored.getByRole('button', { name: 'Supprimer l’ambiance Carte des rives' }).click();
  await restored.locator('#save-status').getByText('Ambiance supprimée').waitFor();
  assert.equal(await restored.locator('#play-ambiances [data-ambiance-id]').count(), 1);
});

test('Les écritures d’ambiances sont isolées par scène et rejouables', { timeout: 30000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('contrat-ambiances');
  await page.goto(fixture.url);
  const result = await page.evaluate(async () => {
    const { openStudioStore, SCENE_AMBIANCES_KEY } = await import('/store.mjs');
    const store = await openStudioStore({ name: 'contrat-ambiances-fictif' });
    const command = (type, operationId, expectedRevision, data) =>
      ({ id: 'campagne-fictive', type, operationId, expectedRevision, data });
    const attempt = async operation => {
      try { await store.execute(operation); return 'ok'; }
      catch (error) { return error.code; }
    };
    try {
      await store.execute(command('create', 'campagne', 0, { name: 'Test', description: '', style: 'campaign', startingLevel: 1 }));
      await store.execute(command('save-scene', 'scene', 1, {
        id: 'scene-un', title: 'Scène', description: '', privateNotes: '', participantIds: [],
      }));
      const data = { sceneId: 'scene-un', id: 'ambiance-un', name: 'Note privée', title: 'La rive', description: '', imageId: null };
      const add = command('save-scene-ambiance', 'ambiance', 2, data);
      const empty = await attempt({ ...add, data: { ...data, title: '' } });
      const foreign = await attempt({ ...add, data: { ...data, sceneId: 'scene-inconnue' } });
      const saved = await store.execute(add);
      const retried = await store.execute(add);
      const stale = await attempt({ ...add, operationId: 'stale' });
      const removed = await store.execute(command('remove-scene-ambiance', 'retirer', 3, { sceneId: data.sceneId, id: data.id }));
      const archive = JSON.parse(await store.exportBackup('campagne-fictive'));
      let downgrade;
      try { await store.previewBackup(JSON.stringify({ ...archive, version: 11 })); }
      catch (error) { downgrade = error.code; }
      return { empty, foreign, stale, downgrade, version: archive.version, count: saved.scenes[0][SCENE_AMBIANCES_KEY].length,
        retried: retried.revision, removed: removed.revision, remaining: Boolean(removed.scenes[0][SCENE_AMBIANCES_KEY]) };
    } finally { store.close(); }
  });
  assert.deepEqual(result, { empty: 'invalid-command', foreign: 'foreign-key', stale: 'conflict', downgrade: 'backup-version',
    version: 12, count: 1, retried: 3, removed: 4, remaining: false });
});
