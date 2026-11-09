import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import catalogue from '../catalogue-archives.json' with { type: 'json' };
import { browserFixture } from './browser.mjs';

async function openShelf(page, shelf) {
  await page.locator('#nav-library').click();
  await page.locator(`#library-shelves a[href="#rayon/${shelf}"]`).click();
}

test('Accueil par rayons, villages, Bestiaire et plans reliés depuis les fiches', { timeout: 55000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open('rayons-atlas', { viewport: { width: 1280, height: 900 } });
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto(fixture.url);
  await page.locator('#nav-library').click();
  const shelves = page.locator('#library-shelves');
  await shelves.getByRole('link', { name: /Atlas/ }).waitFor();
  assert.deepEqual(await shelves.locator('strong').allTextContents(), [
    'Atlas', 'Bestiaire', 'Objets et équipements', 'Sorts et rituels', 'Capacités et actions',
    'Aventures et quêtes', 'Imagerie', 'Fiches de campagne',
  ]);
  assert.equal(await page.locator('#library-results').isVisible(), false);
  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}px`);
  }
  const atlas = shelves.getByRole('link', { name: /Atlas/ });
  await atlas.focus();
  await page.keyboard.press('Enter');
  await page.locator('#library-shelf-title').getByText('Atlas', { exact: true }).waitFor();
  await page.locator('#catalogue-filter-summary').click();
  await page.locator('#catalogue-group').selectOption('Villages');
  await page.locator('#catalogue-count').getByText('14 fiches', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Voir la fiche de Clair-Reflet', exact: true }).click();
  const modal = page.locator('#resource-dialog');
  const title = page.locator('#resource-title');
  const links = page.locator('#resource-related-list');
  await modal.getByText('Proposition de jeu', { exact: true }).waitFor();
  await links.getByRole('link', { name: 'Lamproie de nacre', exact: true }).click();
  await title.getByText('Lamproie de nacre', { exact: true }).waitFor();
  await modal.getByText('Milieux possibles', { exact: true }).waitFor();
  await modal.getByText(/lacs souterrains/).first().waitFor();
  await page.locator('#resource-previous').click();
  await links.getByRole('link', { name: 'Dornaël', exact: true }).click();
  await title.getByText('Dornaël', { exact: true }).waitFor();
  assert.equal(await page.locator('#resource-shortcut').inputValue(), '[[GEO-013]]');
  await links.getByRole('link', { name: 'Plan de quartiers · Dornaël', exact: true }).click();
  await title.getByText('Plan de quartiers · Dornaël', { exact: true }).waitFor();
  const image = page.locator('#resource-art img');
  assert.match(await image.getAttribute('src'), /^\/media\/atlas\/dornael-.*\.svg$/);
  assert.ok(await image.evaluate(async el => { await el.decode(); return el.naturalWidth; }));
  assert.ok(await modal.evaluate(el => el.scrollWidth <= el.clientWidth));
  await page.locator('#resource-previous').click();
  await title.getByText('Dornaël', { exact: true }).waitFor();
  await page.keyboard.press('Escape');
  await page.locator('#library-back').click();
  await shelves.getByRole('link', { name: /Imagerie/ }).click();
  await page.locator('#catalogue-filter-summary').click();
  await page.locator('#catalogue-group').selectOption('Plans et cartes');
  await page.locator('#catalogue-count').getByText('8 fiches', { exact: true }).waitFor();
  assert.ok(requests.every(url => new URL(url).origin === new URL(fixture.url).origin));

  const deepLink = await context.newPage();
  await deepLink.goto(`${fixture.url}#fiche/GEO-013`);
  await deepLink.locator('#resource-title').getByText('Dornaël', { exact: true }).waitFor();
});

test('Sorts, objets et capacités par catégorie, puis découverte de l’Univers', { timeout: 50000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('rayons-grimoire');
  await page.goto(fixture.url);
  await openShelf(page, 'sorts');
  await page.locator('#catalogue-type').selectOption('spell');
  await page.locator('#catalogue-status').selectOption('test');
  await page.locator('#catalogue-count').getByText('6 fiches', { exact: true }).waitFor();
  await page.locator('#catalogue-search').fill('souffle');
  await page.getByRole('button', { name: /Voir la fiche de Souffle/ }).click();
  const modal = page.locator('#resource-dialog');
  await modal.getByText('Prototype', { exact: true }).waitFor();
  await modal.getByText('Coût de base en mana', { exact: true }).waitFor();
  await modal.getByRole('link', { name: 'Grimoire 5d6', exact: true }).click();
  await page.locator('#resource-title').getByText('Grimoire 5d6', { exact: true }).waitFor();
  await page.keyboard.press('Escape');

  await openShelf(page, 'objets');
  await page.locator('#catalogue-search').fill('armure');
  await page.locator('#catalogue-list').getByText('Fait joué', { exact: true }).waitFor();
  await openShelf(page, 'actions');
  await page.locator('#catalogue-search').fill('aptitudes signatures');
  await page.getByRole('button', { name: 'Voir la fiche de Aptitudes, techniques et signatures', exact: true }).click();
  await page.keyboard.press('Escape');

  await page.locator('#nav-universe').click();
  await page.getByRole('heading', { name: 'Univers', exact: true }).waitFor();
  await page.getByRole('heading', { name: 'La vie quotidienne', exact: true }).waitFor();
  await page.getByRole('link', { name: 'Failles et ruptures', exact: true }).click();
  await modal.getByText('Lore validé', { exact: true }).waitFor();
  await modal.getByRole('link', { name: /Secours aux passages/ }).click();
  await page.locator('#resource-title').getByText(/Secours aux passages/).waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: /Explorer l’Atlas/ }).click();
  await page.locator('#library-shelf-title').getByText('Atlas', { exact: true }).waitFor();
});

test('Les raccourcis Markdown restent sûrs et un lieu ou une créature rejoint la campagne', { timeout: 55000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('rayons-campagne');
  await page.goto(fixture.url);
  await page.locator('#campaign-name').fill('Campagne des rayons fictive');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
  await openShelf(page, 'atlas');
  await page.getByRole('button', { name: 'Créer un repère de lieu', exact: true }).click();
  assert.equal(await page.locator('#marker-kind').inputValue(), 'place');
  await page.locator('#marker-title').fill('Le gué des Rosières');
  const description = 'Près de [[lieux/GEO-013|la cité]], voir [Clair-Reflet](#fiche/village-clair-reflet). ' +
    '[[mj/revelation]] [étranger](javascript:alert(1)) <img src="https://example.invalid/x">';
  await page.locator('#marker-description').fill(description);
  await page.locator('#marker-form button[type=submit]').click();
  await page.locator('#marker-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-prepare').click();
  const reserve = page.locator('#marker-reserve-list');
  await reserve.getByText('Le gué des Rosières', { exact: true }).click();
  const wiki = reserve.getByRole('link', { name: 'la cité', exact: true });
  assert.equal(await wiki.getAttribute('href'), '#fiche/GEO-013');
  assert.equal(await reserve.getByRole('link', { name: 'Clair-Reflet', exact: true }).count(), 1);
  assert.equal(await reserve.getByRole('link').count(), 2);
  assert.equal(await reserve.locator('img').count(), 0);
  await reserve.getByText(/\[\[mj\/revelation\]\]/).waitFor();
  await wiki.click();
  await page.locator('#resource-title').getByText('Dornaël', { exact: true }).waitFor();
  await page.keyboard.press('Escape');

  await openShelf(page, 'bestiaire');
  await page.locator('#catalogue-search').fill('lamproie');
  await page.getByRole('button', { name: 'Copier Lamproie de nacre dans la campagne', exact: true }).click();
  await page.locator('#save-status').getByText('Lamproie de nacre · copie sauvegardée', { exact: true }).waitFor();
  const copied = await page.evaluate(async () => {
    const { openStudioStore } = await import('/store.mjs');
    const store = await openStudioStore();
    try { return (await store.list())[0].creatures[0]; }
    finally { store.close(); }
  });
  const original = catalogue.entries.find(entry => entry.id === 'bestiaire-lamproie-de-nacre');
  assert.deepEqual(copied.source, { id: original.id, version: original.version });
  assert.match(copied.description, /Indices avant la rencontre/);
});
