import assert from 'node:assert/strict';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { fromHtml } from 'hast-util-from-html';
import { visit } from 'unist-util-visit';
import { contentDocuments, walk } from './publication-scope.mjs';
const root = path.resolve('public-archives');
const files = await walk(root);
const manifest = JSON.parse(await readFile(path.join(root, 'publication-manifest.json'), 'utf8'));
assert.equal(manifest.profile, 'orin-campaign');
const home = await readFile(path.join(root, 'index.html'), 'utf8');
assert(home.includes('L’Odyssée') && home.includes('d’Orin'));
assert(!home.includes('Commencer une aventure') && !home.includes('href="./jouer/"'));
assert(!files.some(file => /[/\\]studio[/\\](app\.mjs|index\.js|catalogue-.*\.json)$/.test(file)));
const index = JSON.parse(await readFile(path.join(root, 'static/contentIndex.json'), 'utf8'));
const documents = await contentDocuments();
for (const doc of documents) {
  const slug = doc.path.replace(/\.md$/, '').toLowerCase();
  if (!manifest.documents.includes(doc.path)) {
    assert(!files.includes(path.join(root, `${slug}.html`)), `Document hors périmètre publié : ${slug}`);
    assert(!Object.hasOwn(index, slug), `Document hors périmètre dans la recherche : ${slug}`);
  } else if (doc.fm.spoilers || doc.fm.unlisted) {
    const html = await readFile(path.join(root, `${slug}.html`), 'utf8');
    assert(html.includes('spoiler-disclosure'), `Avertissement absent : ${slug}`);
    assert(!Object.hasOwn(index, slug), `Révélation indexée : ${slug}`);
  }
}
const base = new URL('https://sijiel44.github.io/archives-alrick/');
const failures = [];
const exists = async filename => { try { return (await stat(filename)).isFile(); } catch { return false; } };
let checked = 0;
for (const file of files.filter(file => file.endsWith('.html'))) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  const url = new URL(relative.replace(/index\.html$/, ''), base);
  const refs = [];
  visit(fromHtml(await readFile(file, 'utf8')), 'element', node => {
    for (const key of ['href', 'src']) if (node.properties?.[key]) refs.push(String(node.properties[key]));
  });
  for (const ref of refs) {
    if (/^(data:|mailto:|tel:|#)/.test(ref)) continue;
    const target = new URL(ref, url);
    if (target.origin !== base.origin) continue;
    if (!target.pathname.startsWith(base.pathname)) { failures.push(`${relative} → hors base ${ref}`); continue; }
    const filename = path.resolve(root, decodeURIComponent(target.pathname.slice(base.pathname.length)));
    if (!(await Promise.all([filename, `${filename}.html`, path.join(filename, 'index.html')].map(exists))).some(Boolean)) failures.push(`${relative} → ${ref}`);
    checked++;
  }
}
assert.deepEqual(failures, [], 'Liens locaux rompus');
console.log(`ARCHIVES_OK · ${manifest.documents.length} pages sélectionnées · ${checked} liens · recherche sans univers hors campagne ni spoilers.`);
