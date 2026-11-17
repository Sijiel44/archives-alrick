import assert from 'node:assert/strict';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

test('recette mobile : portail → guide mathématique illustré → atelier de préparation', { timeout: 45000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('math-site-001', { viewport: { width: 390, height: 844 } });
  await page.goto(new URL('/accueil', fixture.url).href);
  await page.getByRole('link', { name: /Mathématiques/ }).first().click();
  await page.getByRole('heading', { name: /Mathématiques 5d6/ }).waitFor();
  assert.match(page.url(), /\/mathematiques\.html$/);
  assert.equal(await page.locator('img[src*="math-site-001-jet.webp"]').evaluate(img => img.complete && img.naturalWidth > 0), true);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.getByRole('link', { name: 'Préparer un profil dans le Studio' }).click();
  await page.locator('#view-workshop:not([hidden])').waitFor();
  assert.equal(await page.locator('#workshop-profile-code').textContent(), 'N01-FAUNE-OFFENSIF');
  await page.locator('#workshop-level').fill('10');
  await page.locator('#workshop-archetype').selectOption('mystique');
  await page.locator('#workshop-role').selectOption('soutien');
  assert.equal(await page.locator('#workshop-profile-code').textContent(), 'N10-MYSTIQUE-SOUTIEN');
});
