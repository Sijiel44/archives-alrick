import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { PJ_SOURCE_KEY } from '../store.mjs';
import { browserFixture } from './browser.mjs';

test('Parcours guidé, retour aux choix et restauration du PJ M02 privé', { timeout: 60000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('parcours-pj', { viewport: { width: 1440, height: 980 } });
  await page.goto(fixture.url);
  await page.locator('#campaign-name').fill('Les Lanternes · recette des origines');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
  await page.locator('#guide-pj').click();
  const modal = page.locator('#pj-guide-dialog');
  const review = page.locator('#pj-guide-review-panel');
  await page.locator('#pj-guide-level').getByText(/niveau 1 au départ.*niveau 5/).waitFor();
  await page.locator('#pj-guide-review').click();
  assert.equal(await review.isVisible(), false);
  await page.locator('#pj-guide-name').fill('Alba des Lanternes');
  for (const [step, option] of Object.entries({
    famille: 'artisans', formation: 'lettres', epreuve: 'voyage', vocation: 'savoir',
    education: 'oral', literacy: 'non_lecteur',
  })) await page.locator(`#pj-guide-${step}`).selectOption(option);
  await modal.getByText('Écrire le récit et les liens du PJ', { exact: false }).click();
  await page.locator('#pj-guide-backstory').fill('CANARI_ORIGINES Elle garde une lanterne confiée par sa mère.');
  await page.locator('#pj-guide-connections').fill('Sarel lui a appris à lire les courants.');
  await page.locator('#pj-guide-goal').fill('Retrouver la route des lanterniers.');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await modal.evaluate(el => el.scrollWidth <= el.clientWidth), `choix à ${width}px`);
  }
  await page.locator('#pj-guide-review').click();
  await review.getByText(/Budget M02 · 24 \/ 24 points/).waitFor();
  assert.equal(await page.locator('#character-list li').count(), 0);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'pj-guide-preview-title');
  await review.getByText('Parcours et récit', { exact: true }).click();
  await review.getByText('Ne lit pas encore', { exact: true }).waitFor();
  await page.locator('#pj-guide-revise').click();
  assert.equal(await page.locator('#pj-guide-backstory').inputValue(), 'CANARI_ORIGINES Elle garde une lanterne confiée par sa mère.');
  await page.locator('#pj-guide-vocation').selectOption('protection');
  await page.locator('#pj-guide-review').click();
  await review.getByText('Protecteur', { exact: true }).waitFor();
  assert.ok(await modal.evaluate(el => el.scrollWidth <= el.clientWidth));
  await page.locator('#pj-guide-create').click();
  await modal.waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Ouvrir le profil 5d6 de Alba des Lanternes' }).click();
  await page.locator('#resource-profile').getByText('36 / 36 PV', { exact: true }).waitFor();
  await page.keyboard.press('Escape');
  await page.locator('#add-scene').click();
  await page.locator('#scene-title').fill('Sur le quai');
  await page.locator('#scene-participants').getByRole('checkbox', { name: /Alba des Lanternes/ }).check();
  await page.locator('#scene-form button[type=submit]').click();
  await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-play').click();
  await page.locator('#participant-list').getByText(/PJ · M02.*36 \/ 36 PV/).waitFor();
  await page.locator('#share-title').check();
  await page.locator('#show-projection').click();
  assert.doesNotMatch(await page.locator('#projection iframe').getAttribute('srcdoc'), /CANARI_ORIGINES|Alba des Lanternes/);
  await page.locator('#stop-projection').click();
  await page.locator('#nav-backups').click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const buffer = await readFile(await download.path());
  const archive = JSON.parse(buffer);
  const { characters } = archive.payload.campaign;
  const source = characters[0][PJ_SOURCE_KEY];
  assert.equal(archive.version, 9);
  assert.equal(characters.length, 1);
  assert.notEqual(characters[0].id, source.id);
  assert.deepEqual(source.lifeSteps, ['artisans', 'lettres', 'voyage', 'protection']);
  assert.equal(source.literacy, 'non_lecteur');
  assert.equal(source.connections, 'Sarel lui a appris à lire les courants.');

  const { page: restored } = await fixture.open('parcours-restaure', { viewport: { width: 390, height: 844 } });
  await restored.goto(fixture.url);
  await restored.locator('#save-status').getByText('Stockage local prêt', { exact: true }).waitFor();
  await restored.locator('#nav-backups').click();
  await restored.locator('#backup-file').setInputFiles({ name: 'parcours-v9.json', mimeType: 'application/json', buffer });
  await restored.locator('#backup-summary').getByText(/1 fiche\(s\) PJ M02/).waitFor();
  await restored.locator('#restore-backup').click();
  await restored.locator('#prepare-title').waitFor();
  await restored.getByRole('button', { name: 'Ouvrir le profil 5d6 de Alba des Lanternes' }).click();
  await restored.getByText('Parcours et récit', { exact: true }).click();
  await restored.getByText(/CANARI_ORIGINES/).waitFor();
});

test('Le parcours du Studio reprend la répartition M02 et sépare le récit du calcul', { timeout: 30000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('parcours-parite');
  await page.goto(fixture.url);
  const results = await page.evaluate(async () => {
    const { createGuidedPJ, evaluatePJ } = await import('/pj-m02.mjs');
    const { draftFromLifePath } = await import('/moteur/atelier5d6-m02.js');
    const profiles = [
      ['artisans', 'ateliers', 'responsabilite', 'protection'],
      ['erudits', 'arcane', 'decouverte', 'magie'],
    ];
    return profiles.map(choices => {
      const input = { id: 'pj-test', name: 'Veilleur fictif', choices, education: 'oral', literacy: 'non_lecteur',
        backstory: 'Récit fictif.', connections: '', goal: '' };
      const source = createGuidedPJ(input);
      const alternate = createGuidedPJ({ ...input, education: 'ecole', literacy: 'erudit', backstory: 'Autre histoire.' });
      const native = draftFromLifePath(choices);
      return { stats: source.stats, masteries: source.masteries, alternate: [alternate.stats, alternate.masteries],
        expected: [native.sheet.stats, native.sheet.masteries], budget: evaluatePJ(source).spent,
        level: source.level, xp: source.xp, pv: source.pv, mana: source.mana, abilities: source.development.abilities.length };
    });
  });
  for (const result of results) {
    assert.deepEqual([result.stats, result.masteries], result.expected);
    assert.deepEqual(result.alternate, result.expected);
    assert.deepEqual([result.budget, result.level, result.xp, result.pv, result.abilities], [24, 5, 400, 36, 0]);
  }
  assert.deepEqual(results.map(result => result.mana), [0, 36]);
});
