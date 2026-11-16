import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import bestiaire from '../catalogue-bestiaire.json' with { type: 'json' };
import { browserFixture } from './browser.mjs';

test('Studio : vingt-deux espèces illustrées, copies indépendantes et écran étroit', { timeout: 120000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('bestiaire-entre-rives', { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.goto(fixture.url);
  await page.locator('#campaign-name').fill('Campagne fictive des rives');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#nav-library').click();
  await page.locator('#library-shelves a[href="#rayon/bestiaire"]').click();
  for (const entry of bestiaire.entries.filter(entry => entry.id.startsWith('ESP-ER-'))) {
    await page.locator('#catalogue-search').fill(entry.name);
    const card = page.locator('#catalogue-list article').filter({ has: page.getByRole('heading', { name: entry.name, exact: true }) });
    await card.waitFor();
    const image = card.locator('img.catalogue-illustration');
    const pixels = await image.evaluate(async element => {
      await element.decode();
      return { width: element.naturalWidth, alt: element.alt };
    });
    assert.ok(pixels.width > 0 && pixels.alt.trim());
  }
  await page.locator('#catalogue-search').fill('Sanglier de silex');
  await page.getByRole('button', { name: 'Copier Sanglier de silex dans la campagne' }).click();
  await page.locator('#save-status').getByText(/Sanglier de silex.*copie sauvegardée/).waitFor();
  await page.locator('#catalogue-search').fill('Vautre des marais');
  await page.getByRole('button', { name: 'Copier Vautre des marais dans la campagne' }).click();
  await page.locator('#save-status').getByText(/Vautre des marais.*copie sauvegardée/).waitFor();
  await page.locator('#catalogue-search').fill('Fée des aulnes');
  await page.getByRole('button', { name: 'Copier Fée des aulnes dans la campagne' }).click();
  await page.locator('#save-status').getByText(/Fée des aulnes.*copie sauvegardée/).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.setViewportSize({ width: 320, height: 740 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.locator('#nav-backups').click();
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const saved = JSON.parse(await readFile(await file.path(), 'utf8'));
  const [copy, danger, fee] = saved.payload.campaign.creatures;
  assert.equal(copy.source.id, 'ESP-ER-011');
  assert.equal(copy.source.version, bestiaire.entries.find(entry => entry.id === 'ESP-ER-011').version);
  assert.notEqual(copy.id, copy.source.id);
  assert.ok(copy.description.includes('Danger · Charge défensive'), 'copie des détails descriptifs attendue');
  assert.equal(danger.source.id, 'ESP-ER-018');
  assert.equal(danger.source.version, bestiaire.entries.find(entry => entry.id === 'ESP-ER-018').version);
  assert.notEqual(danger.id, danger.source.id);
  assert.ok(danger.description.includes('Danger · Défend son refuge'), 'danger descriptif sans dégâts');
  assert.equal(fee.source.id, 'ESP-ER-021');
  assert.equal(fee.source.version, bestiaire.entries.find(entry => entry.id === 'ESP-ER-021').version);
  assert.notEqual(fee.id, fee.source.id);
  assert.notEqual(fee.id, danger.id);
  assert.ok(fee.description.includes('Être conscient'), 'dignité féerique conservée dans la copie');
  assert.equal(saved.payload.campaign.creatures.length, 3);
});
