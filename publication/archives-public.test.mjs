import assert from 'node:assert/strict';
import { test } from 'node:test';
const base = (process.env.PUBLIC_BASE ?? 'http://127.0.0.1:4396').replace(/\/$/, '');
test('Publication Archives : campagne, continuité et récupération sans ancien Studio', async () => {
  const get = async route => fetch(`${base}/${route}`, { cache: 'no-store' });
  const home = await get(''); assert.equal(home.status, 200);
  const html = await home.text(); assert.match(html, /L’Odyssée/); assert.match(html, /d’Orin/);
  assert.doesNotMatch(html, /Commencer une aventure/);
  const manifest = await (await get('publication-manifest.json')).json();
  assert.equal(manifest.profile, 'orin-campaign');
  assert(manifest.documents.includes('jdr-alrick/cb44-bilan-et-reprise.md'));
  assert(!manifest.documents.some(filename => filename.startsWith('jouer/') || filename.startsWith('univers/')));
  for (const route of ['studio/', 'studio/espace-joueur.html']) {
    const response = await get(route); assert.equal(response.status, 200);
    assert.match(await response.text(), /Récupérer mes sauvegardes/);
  }
  for (const route of ['studio/app.mjs', 'studio/catalogue-bestiaire.json', 'jouer/atelier-5d6.html', 'univers/index.html']) {
    assert.equal((await get(route)).status, 404, `Ancienne fonctionnalité encore publiée : ${route}`);
  }
  const continuity = await get('jdr-alrick/cb44-bilan-et-reprise.html'); assert.equal(continuity.status, 200);
  assert.match(await continuity.text(), /spoiler-disclosure/);
});
