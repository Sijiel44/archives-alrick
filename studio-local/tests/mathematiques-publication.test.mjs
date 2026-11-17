import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { readStudioAsset, studioAssets } from '../serve.mjs';

const source = new URL('../', import.meta.url);

test('le guide mathématique du nouveau site est routé et illustré sans chargement externe', async () => {
  const guide = (await readStudioAsset(studioAssets.get('/mathematiques.html'))).toString();
  assert.match(guide, /<h1 id="titre">Mathématiques/);
  assert.match(guide, /publication pilote/i);
  assert.match(guide, /sans dégâts PV automatiques/);
  assert.match(guide, /Le rattachement automatique du profil/);
  assert.match(guide, /niveau 20/);
  assert.equal((await readStudioAsset(studioAssets.get('/mathematiques.css'))).length > 500, true);
  for (const [, name] of [...guide.matchAll(/src="\.\/media\/(math-site-001-[\w-]+\.webp)"/g)]) {
    const bytes = await readStudioAsset(studioAssets.get(`/media/${name}`));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `${name} : format image WebP`);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `${name} : format image WebP`);
  }
  assert.match(guide, /#atelier/);
});

test('liens de navigation 5d6 disponibles au portail et dans les parcours du Studio', async () => {
  const studio = await readFile(new URL('index.html', source), 'utf8');
  const portal = await readFile(new URL('accueil.html', source), 'utf8');
  const app = await readFile(new URL('app.mjs', source), 'utf8');
  assert.match(portal, /href="\/mathematiques\.html"/);
  assert.match(studio, /class="nav-reference" href="\.\/mathematiques\.html"/);
  assert.match(studio, /Rappel des 5d6, dégâts et protections/);
  assert.match(studio, /workshop-profile-code/);
  assert.match(app, /Préparer un profil 5d6 \(variante MJ\)/);
  assert.match(app, /function renderWorkshopPresetCode\(/);
});

test('guides complets publiables gardent un avertissement expérimental', async () => {
  for (const name of ['systeme-5d6-unifie-reference', 'atelier-creation-5d6-guide-illustre']) {
    const text = await readFile(new URL(`../content/jouer/${name}.md`, source), 'utf8');
    assert.match(text, /^publish: true$/m);
    assert.match(text, /^canon_statut: "proposition_non_jouee"$/m);
    assert.match(text, /non homologu|non canonis|simulation/i);
  }
});
