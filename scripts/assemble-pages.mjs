import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readStudioAsset, studioAssets } from '../studio-local/serve.mjs';

const output = fileURLToPath(new URL('../public/', import.meta.url));
const studio = join(output, 'studio');
const repository = 'https://github.com/Sijiel44/archives-alrick';
const root = join(output, 'index.html');
const archives = await readFile(root, 'utf8');
assert(archives.includes('id="alrick-home-title"'), 'Construisez les Archives Quartz avant d’assembler GitHub Pages.');

function withPolicy(html, policy) {
  return html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n    <meta http-equiv="Content-Security-Policy" content="${policy}">`);
}

const basePolicy = "default-src 'none'; script-src 'self'; base-uri 'none'";
const localPortal = (await readStudioAsset(studioAssets.get('/accueil'))).toString('utf8');
const portal = withPolicy(localPortal.replace(/\b(href|src)="\/(?!\/)([^"#]*)(#[^"]*)?"/g, (_, attribute, route, hash = '') => {
  const destination = route === 'accueil' ? './' : `./studio/${route}`;
  return `${attribute}="${destination}${hash}"`;
}).replace('<a class="text-link" href="./studio/#bibliotheque">', '<a class="text-link" href="./archives.html">Consulter les Archives d’Alrick</a>\n        <a class="text-link" href="./studio/#bibliotheque">')
.replace('<span>Édition pilote · Découverte</span>', `<a class="text-link" href="./archives.html">Les Archives d’Alrick</a>
      <a class="text-link" href="${repository}/blob/main/CONTRIBUTING.md">Contribuer à l’univers</a>`),
`${basePolicy}; style-src 'self'; img-src 'self'; form-action 'none'`);

await writeFile(join(output, 'archives.html'), archives);
for (const [route, asset] of studioAssets) {
  if (['/', '/accueil', '/accueil/'].includes(route)) continue;
  const filename = join(studio, route === '/joueur' ? 'joueur.html' : route.slice(1));
  let content = await readStudioAsset(asset);
  assert(content !== null, `Le média ${route} a changé. Vérifiez sa provenance avant publication.`);
  if (route === '/index.html') {
    content = withPolicy(content.toString('utf8').replace('<html lang="fr">', '<html lang="fr" data-pages-studio>')
      .replace('href="/accueil"', 'href="../"'),
    `${basePolicy}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-src 'self'; form-action 'none'`);
  } else if (route === '/joueur') {
    content = withPolicy(content.toString('utf8').replace('src="/joueur.js"', 'src="./joueur.js"'),
      `${basePolicy}; style-src 'unsafe-inline'; img-src data:; frame-src 'self' about:; form-action 'none'`);
  } else if (route === '/espace-joueur.html') {
    content = withPolicy(content.toString('utf8').replace('href="/accueil#univers"', 'href="../bibliotheque.html"')
      .replace('href="/accueil"', 'href="../"'), `${basePolicy}; style-src 'self'; form-action 'none'`);
  }
  await mkdir(dirname(filename), { recursive: true });
  await writeFile(filename, content);
}
await writeFile(root, portal);
console.log('GitHub Pages réunit les Chroniques, le Studio et les Archives.');
