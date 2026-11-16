import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import bestiaire from '../catalogue-bestiaire.json' with { type: 'json' };
import { browserFixture } from './browser.mjs';

test('Studio : nouvelles fiches illustrées, copie indépendante et écran étroit', { timeout: 60000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('bestiaire-entre-rives', { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.goto(fixture.url);
  await page.locator('#campaign-name').fill('Campagne fictive des rives');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#nav-library').click();
  await page.locator('#library-shelves a[href="#rayon/bestiaire"]').click();
  for (const entry of bestiaire.entries.slice(0, 3)) {
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
  await page.locator('#catalogue-search').fill('Loutre aux anneaux de cuivre');
  await page.getByRole('button', { name: 'Copier Loutre aux anneaux de cuivre dans la campagne' }).click();
  await page.locator('#save-status').getByText(/Loutre aux anneaux de cuivre.*copie sauvegardée/).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.setViewportSize({ width: 320, height: 740 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.locator('#nav-backups').click();
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const saved = JSON.parse(await readFile(await file.path(), 'utf8'));
  const [copy] = saved.payload.campaign.creatures;
  assert.equal(copy.source.id, bestiaire.entries[0].id);
  assert.equal(copy.source.version, bestiaire.entries[0].version);
  assert.notEqual(copy.id, copy.source.id);
  assert.equal(copy.description, bestiaire.entries[0].description);
});
