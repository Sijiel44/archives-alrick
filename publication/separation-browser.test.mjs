import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'node:http';
import { browserFixture } from '../studio-local/tests/browser.mjs';
import { seedQuestCampaign } from '../studio-local/tests/quetes-fixture.mjs';

async function serve(t, root) {
  const types = { html: 'text/html', mjs: 'text/javascript', js: 'text/javascript', css: 'text/css', json: 'application/json', webp: 'image/webp' };
  const server = createServer(async (req, res) => {
    const route = new URL(req.url, 'http://localhost').pathname;
    const filename = path.resolve(root, `.${route}${route.endsWith('/') ? 'index.html' : ''}`);
    if (!filename.startsWith(path.resolve(root) + path.sep)) return res.writeHead(404).end();
    try { const bytes = await readFile(filename); res.writeHead(200, { 'Content-Type': types[filename.split('.').at(-1)] ?? 'application/octet-stream' }).end(bytes); }
    catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}

test('Ancienne origine : récupérer puis restaurer la campagne sur les Chroniques sans effacer la source', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('migration');
  await seedQuestCampaign(page, f.url);
  const before = await page.evaluate(async () => {
    const store = await (await import('./store.mjs')).openStudioStore();
    try { return JSON.parse(await store.exportBackup('table-enquete')); } finally { store.close(); }
  });
  // L'origine historique reste identique ; seule l'interface devient la page de récupération.
  for (const filename of ['recuperation.mjs', 'recuperation.css']) await page.route(`**/${filename}`, route => route.fulfill({ path: `public-archives/studio/${filename}`, contentType: filename.endsWith('mjs') ? 'text/javascript' : 'text/css' }));
  await page.route('**/recuperation.html', route => route.fulfill({ path: 'publication/recuperation.html', contentType: 'text/html' }));
  await page.goto(`${f.url}recuperation.html`);
  await page.locator('#inspect').click(); await page.locator('#campaigns').getByText('Les lanternes disparues').waitFor();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#campaigns button').click()]);
  const buffer = await readFile(await download.path());
  assert.deepEqual(JSON.parse(buffer), before, 'Format et empreinte inchangés');
  const source = await page.evaluate(async () => {
    const store = await (await import('./store.mjs')).openStudioStore();
    try { return JSON.parse(await store.exportBackup('table-enquete')); } finally { store.close(); }
  });
  assert.deepEqual(source, before, 'Aucun effacement ni changement dans la campagne originale');
  const target = await serve(t, '.publication/chroniques');
  await page.goto(`${target}/studio/#sauvegardes`);
  await page.locator('#backup-file').setInputFiles({ name: 'campagne.json', mimeType: 'application/json', buffer });
  await page.locator('#backup-preview').waitFor();
  await page.locator('#restore-backup').click();
  await page.locator('#save-status').getByText('Campagne restaurée et sauvegardée').waitFor();
  const restored = await page.evaluate(async () => {
    const store = await (await import('./store.mjs')).openStudioStore();
    try { return JSON.parse(await store.exportBackup('table-enquete')); } finally { store.close(); }
  });
  assert.deepEqual(restored.payload, before.payload, 'Scènes, notes MJ et journal conservés');
});

test('Fiches internes et Studio : bureau, mobile, liens sans GitHub ni Archives', { timeout: 45000 }, async t => {
  const f = await browserFixture(t), { page } = await f.open('bibliotheque');
  const target = await serve(t, '.publication/chroniques');
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  for (const width of [1365, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${target}/studio/fiches.html`);
    await page.locator('#cards a').first().waitFor();
    await page.locator('#search').fill('ESP-ER-001');
    await page.locator('#cards a').first().click();
    await page.locator('#reader:not([hidden])').waitFor();
    assert.match(await page.locator('#code').textContent(), /ESP-ER-001/);
    assert(await page.locator('#body').textContent());
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await mkdir('artifacts/separation', { recursive: true });
    await page.screenshot({ path: `artifacts/separation/fiche-${width}.png`, fullPage: true });
  }
  await page.goto(`${target}/studio/`);
  await page.locator('#save-status').getByText('Stockage local prêt').waitFor();
  assert.equal(await page.locator('a[href*="github.com"],a[href*="sijiel44.github.io"]').count(), 0);
  await page.goto(`${target}/studio/espace-joueur.html`);
  await page.locator('#player-save-status').waitFor();
  assert.equal(await page.locator('a[href*="github.com"],a[href*="sijiel44.github.io"]').count(), 0);
  assert.deepEqual(errors, []);
});
