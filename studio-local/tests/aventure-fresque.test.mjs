import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { ADVENTURE_SCENE_KEY, FRESQUE_LINKS_KEY } from '../store.mjs';
import { browserFixture } from './browser.mjs';

test('Aventure vers la Fresque, fiche liée, projection filtrée et restauration v11', { timeout: 55000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('aventure', { viewport: { width: 1440, height: 950 } });
  await page.goto(fixture.url);
  await page.locator('#campaign-name').fill('Campagne des passerelles');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
  await page.locator('#add-scene').click();
  await page.locator('#scene-title').fill('Le feu de camp');
  await page.locator('#scene-form button[type=submit]').click();
  await page.locator('#scene-dialog').waitFor({ state: 'hidden' });

  await page.locator('#nav-creations').click();
  const creation = page.locator('#creation-dialog');
  const saveCreation = async () => {
    await creation.getByRole('button', { name: 'Enregistrer la création' }).click();
    await creation.waitFor({ state: 'hidden' });
  };
  await page.getByRole('button', { name: 'Créer · PNJ', exact: true }).click();
  await creation.getByLabel('Nom', { exact: true }).fill('PNJ_CANARI Le passeur');
  await saveCreation();
  await page.getByRole('button', { name: 'Créer · Aventure', exact: true }).click();
  await creation.getByLabel('Nom', { exact: true }).fill('Les lanternes du gué');
  await creation.getByLabel('Scènes ou jalons').fill('1. L’arrivée :: SECRET_JALON\n\n- La traversée\n');
  await creation.getByText('Relier des fiches', { exact: true }).click();
  await creation.getByLabel('Fiche à relier').selectOption({ label: 'PNJ_CANARI Le passeur' });
  await creation.getByRole('button', { name: 'Ajouter le lien' }).click();
  await saveCreation();

  await page.locator('#nav-prepare').click();
  await page.getByRole('link', { name: 'Ouvrir les aventures du MJ' }).click();
  assert.equal(await page.locator('#catalogue-origin').inputValue(), 'personal');
  await page.getByRole('button', { name: 'Voir la fiche de Les lanternes du gué' }).click();
  const resource = page.locator('#resource-dialog');
  await resource.getByRole('button', { name: 'Préparer la Fresque' }).click();
  const planner = page.locator('#adventure-plan-dialog');
  const review = planner.getByRole('button', { name: 'Prévisualiser les scènes' });
  const milestones = planner.getByLabel('Jalons de l’aventure');
  const original = await milestones.inputValue();
  await milestones.fill(Array.from({ length: 13 }, (_, index) => 'Jalon ' + (index + 1)).join('\n'));
  await review.click();
  await planner.getByRole('alert').getByText(/entre 1 et 12 jalons/).waitFor();
  await milestones.fill(original);
  await review.focus();
  await page.keyboard.press('Enter');
  await planner.getByText(/2 scènes à préparer · Le point de reprise est conservé/).waitFor();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'adventure-plan-preview-title');
  const first = planner.locator('.adventure-row').first();
  assert.equal(await first.getByLabel('Notes privées du MJ').inputValue(), 'SECRET_JALON');
  await first.getByLabel('Titre partageable').fill('Arrivée au gué');
  await first.getByLabel('Texte partageable').fill('La berge disparaît dans la brume.');
  await first.getByRole('checkbox', { name: /PNJ_CANARI/ }).check();
  await planner.getByRole('button', { name: 'Revenir aux jalons' }).click();
  await review.click();
  assert.equal(await first.getByLabel('Titre partageable').inputValue(), 'Arrivée au gué');
  assert.equal(await first.getByRole('checkbox', { name: /PNJ_CANARI/ }).isChecked(), true);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await planner.evaluate(el => el.scrollWidth <= el.clientWidth), 'aperçu à ' + width + 'px');
  }
  assert.equal(await page.locator('#scene-list .scene-card').count(), 1);
  await planner.getByRole('button', { name: 'Ajouter 2 scènes à la Fresque' }).click();
  await planner.waitFor({ state: 'hidden' });
  await page.locator('#save-status').getByText('2 scènes ajoutées à la Fresque').waitFor();
  const cards = page.locator('#scene-list .scene-card');
  assert.deepEqual(await cards.locator('h3').allTextContents(), ['Le feu de camp', 'Arrivée au gué', 'La traversée']);
  assert.equal(await cards.first().getAttribute('aria-current'), 'true');
  assert.equal(await cards.nth(1).evaluate(el => el === document.activeElement), true);
  await cards.nth(1).getByText('Vers La traversée', { exact: true }).waitFor();
  await cards.nth(1).getByText('Fiches de préparation', { exact: true }).click();
  await cards.nth(1).getByRole('link', { name: 'Les lanternes du gué', exact: true }).click();
  await resource.getByRole('button', { name: 'Voir les scènes dans la Fresque' }).click();
  assert.equal(await cards.nth(1).evaluate(el => el === document.activeElement), true);
  await cards.nth(1).getByRole('button', { name: 'Jouer Arrivée au gué' }).click();
  await page.locator('#current-private-notes').getByText('SECRET_JALON').waitFor();
  await page.locator('#play-adventure').getByRole('link', { name: 'PNJ_CANARI Le passeur' }).waitFor();
  await page.locator('#share-title').check();
  await page.locator('#share-description').check();
  await page.locator('#show-projection').click();
  const projection = await page.locator('#projection iframe').getAttribute('srcdoc');
  assert.match(projection, /Arrivée au gué.*La berge disparaît dans la brume/s);
  assert.doesNotMatch(projection, /SECRET_JALON|PNJ_CANARI|Les lanternes du gué/);
  await page.locator('#stop-projection').click();
  await page.locator('#nav-backups').click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const buffer = await readFile(await download.path());
  const { version, payload } = JSON.parse(buffer);
  assert.equal(version, 11);
  assert.equal(payload.journal.filter(event => event.type === 'plan-adventure').length, 1);
  assert.equal(payload.campaign[FRESQUE_LINKS_KEY].length, 1);
  assert.equal(payload.campaign.scenes[1][ADVENTURE_SCENE_KEY].referenceIds.length, 1);

  const { page: restored } = await fixture.open('aventure-restauree', { viewport: { width: 390, height: 844 } });
  await restored.goto(fixture.url);
  await restored.locator('#save-status').getByText('Stockage local prêt').waitFor();
  await restored.locator('#nav-backups').click();
  await restored.locator('#backup-file').setInputFiles({ name: 'aventure-v11.json', mimeType: 'application/json', buffer });
  await restored.locator('#restore-backup').click();
  await restored.locator('#prepare-title').waitFor();
  await restored.locator('#nav-play').click();
  await restored.locator('#play-adventure').getByRole('link', { name: 'PNJ_CANARI Le passeur' }).click();
  await restored.locator('#resource-title').getByText('PNJ_CANARI Le passeur', { exact: true }).waitFor();
});

test('La préparation est atomique, rejouable et protégée contre les doublons', { timeout: 30000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('contrat-aventure');
  await page.goto(fixture.url);
  const result = await page.evaluate(async () => {
    const { openStudioStore, FRESQUE_LINKS_KEY } = await import('/store.mjs');
    let inject = false;
    const store = await openStudioStore({ name: 'contrat-aventure-fictif', injectFailure(stage) {
      if (inject && stage === 'before-commit') throw new Error('Interruption simulée.');
    } });
    const id = 'campagne-fictive';
    const command = (type, operationId, expectedRevision, data) => ({ id, type, operationId, expectedRevision, data });
    const attempt = async action => {
      try { await action(); return 'ok'; }
      catch (error) { return error.code ?? error.message; }
    };
    try {
      await store.execute(command('create', 'campagne', 0, { name: 'Test', startingLevel: 1, style: 'campaign', description: '' }));
      const adventure = { id: 'creation-aventure', kind: 'adventure', name: 'Aventure fictive', description: '', notes: '',
        state: 'draft', details: { hook: '', audience: '', scenes: 'A\nB', outcomes: '' }, parentId: null, links: [] };
      await store.execute(command('save-creation', 'aventure', 1, adventure));
      const scenes = ['A', 'B'].map(title => ({
        id: 'scene-' + title, title, description: '', privateNotes: '', referenceIds: [],
      }));
      const plan = command('plan-adventure', 'plan', 2, { adventureId: adventure.id, chain: false, scenes });
      const invalid = await attempt(() => store.execute({ ...plan, data: { ...plan.data,
        scenes: [scenes[0], { ...scenes[1], referenceIds: ['creation-exterieure'] }] } }));
      inject = true;
      const interrupted = await attempt(() => store.execute(plan));
      inject = false;
      const before = await store.get(id);
      const saved = await store.execute(plan);
      const retried = await store.execute(plan);
      const duplicate = await attempt(() => store.execute({ ...plan, expectedRevision: 3, operationId: 'nouveau-plan' }));
      const stale = await attempt(() => store.execute({ ...plan, operationId: 'plan-perime' }));
      const exported = JSON.parse(await store.exportBackup(id));
      const downgrade = await attempt(() => store.previewBackup(JSON.stringify({ ...exported, version: 10 })));
      return { invalid, interrupted, before: [before.revision, before.scenes.length, before.activeSceneId],
        saved: [saved.revision, saved.scenes.length, saved.activeSceneId, saved[FRESQUE_LINKS_KEY]?.length ?? 0],
        retried: retried.revision, duplicate, stale, downgrade };
    } finally { store.close(); }
  });
  assert.equal(result.invalid, 'foreign-key');
  assert.notEqual(result.interrupted, 'ok');
  assert.deepEqual(result.before, [2, 0, null]);
  assert.deepEqual(result.saved, [3, 2, 'scene-A', 0]);
  assert.deepEqual([result.retried, result.duplicate, result.stale, result.downgrade], [3, 'already-planned', 'conflict', 'backup-version']);
});
