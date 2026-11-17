import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { readStudioAsset, studioAssets } from '../studio-local/serve.mjs';
import { buildLibraryIndex } from '../studio-local/bibliotheque.mjs';
import { contentDocuments, isPublicUniverse } from './publication-scope.mjs';

const destination = path.resolve(process.argv[2] ?? '.publication/chroniques');
// Export additif dans le Site existant : ne jamais écraser son Univers ni ses médias.
const output = path.join(destination, 'studio');
await mkdir(output, { recursive: true });
const basePolicy = "default-src 'none'; script-src 'self'; base-uri 'none'";
const policy = (html, value) => html.replace('<meta charset="utf-8">', `<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${value}">`);
const documents = await contentDocuments();
const byPath = new Map(documents.map(doc => [`content/${doc.path}`, doc]));
const byCode = new Map(documents.filter(doc => doc.fm.code).map(doc => [doc.fm.code, doc]));
const entries = buildLibraryIndex([]);
const readable = new Map();
const pathIds = {};
for (const entry of entries) {
  if (entry.origin === 'personal') continue;
  const document = byPath.get(entry.path) ?? byCode.get(entry.id);
  const full = document && isPublicUniverse(document);
  readable.set(entry.id, { id: entry.id, title: entry.name, category: entry.shelf ?? entry.kind, description: entry.description,
    status: full ? document.fm.canon_statut : entry.status, image: entry.art?.src,
    imageAlt: entry.art?.alt, source: document?.fm.code ?? entry.id,
    provenance: full ? `Document d’univers · ${document.fm.ancre_documentaire ?? 'état documentaire conservé'}` : 'Fiche publique adaptée pour le jeu ; elle ne reproduit pas le dossier de campagne.',
    markdown: full ? document.body : `## Repères publics\n\n${entry.description ?? ''}\n\n` + (entry.details ?? []).map(([title, text]) => `### ${title}\n\n${text}`).join('\n\n'),
    links: entry.links ?? [] });
  if (document) pathIds[document.path.replace(/\.md$/, '')] = entry.id;
}
// Nouvelles fiches d'univers publiques : disponibles même avant l'ajout au catalogue de copies.
for (const doc of documents.filter(doc => isPublicUniverse(doc) && doc.fm.code)) {
  const old = readable.get(doc.fm.code);
  readable.set(doc.fm.code, { ...old, id: doc.fm.code, title: doc.fm.title,
    category: old?.category ?? ({ personnages: 'pnj', creatures: 'bestiaire', lieux: 'atlas', magie: 'magie', jouer: 'regles' }[doc.path.split('/')[0]] ?? 'univers'),
    description: doc.fm.description ?? '', status: doc.fm.canon_statut, source: doc.fm.code,
    image: old?.image ?? doc.fm.illustration, imageAlt: old?.imageAlt ?? doc.fm.illustration_alt,
    provenance: `Document d’univers · ${doc.fm.ancre_documentaire ?? 'état documentaire conservé'}`,
    markdown: doc.body, links: old?.links ?? [] });
  pathIds[doc.path.replace(/\.md$/, '')] = doc.fm.code;
}
// Références de règles publiques déjà proposées par le Studio, désormais lues sur place.
const ruleSources = [
  ['M03', 'Opposition et combat 5d6', 'docs/rapports-missions/M03_COMBAT_BESTIAIRE_5D6.md'],
  ['GRIMOIRE-5D6', 'Magie et Grimoire', 'docs/GRIMOIRE_5D6_V1.md'],
  ['M01', 'Progression 5d6', 'docs/rapports-missions/M01_PROGRESSION_5D6.md'],
  ['RECHERCHE-MJ', 'Vérifier les sources avant une réponse', 'docs/PROTOCOLE_RECHERCHE_AVANT_REPONSE_JDR.md'],
];
for (const [id, title, filename] of ruleSources) {
  readable.set(id, { id, title, category: 'regles', description: 'Référence documentaire du système de jeu.',
    status: 'reference', source: id, provenance: 'Document de conception conservé ; tests et homologation en séance restent distincts.',
    markdown: await readFile(filename, 'utf8'), links: [] });
  pathIds[filename] = id;
}
const localDestination = raw => {
  const filename = raw.replace(/^https:\/\/github\.com\/Sijiel44\/archives-alrick\/(?:blob|tree)\/[^/]+\//i, '');
  if (filename.endsWith('ENRICHIR-UNIVERS.md')) return '../contribuer.html';
  const id = pathIds[filename] ?? pathIds[filename.replace(/^content\//, '').replace(/\.md$/, '')];
  return id ? `./fiches.html#fiche/${encodeURIComponent(id)}` : './fiches.html';
};
for (const [route, asset] of studioAssets) {
  if (['/', '/accueil', '/accueil/'].includes(route)) continue;
  let bytes = await readStudioAsset(asset);
  assert(bytes !== null, `Provenance média invalide : ${route}`);
  if (route.endsWith('.html') || route === '/joueur') {
    let html = bytes.toString('utf8').replace(/href="https:\/\/github\.com\/Sijiel44\/archives-alrick\/[^\"]+"/gi, match =>
      `href="${localDestination(match.slice(6, -1))}"`).replace('href="/accueil#univers"', 'href="../#univers"').replaceAll('href="/accueil"', 'href="../"');
    if (route === '/index.html') {
      html = html.replace('<html lang="fr">', '<html lang="fr" data-pages-studio>')
        .replace('Les Archives d’Alrick</p>', 'L’univers des Chroniques</p>')
        .replace('Enrichir les Archives avec ChatGPT', 'Enrichir les Chroniques avec ChatGPT')
        .replace('Lire la source des Archives', 'Lire la fiche dans les Chroniques')
        .replace('les territoires, les peuples et les savoirs des Archives', 'les territoires, les peuples et les savoirs des Chroniques')
        .replace('Les autres modules sont consultables dans les Archives.', 'Les autres modules se lisent dans la bibliothèque des Chroniques.');
      html = policy(html, `${basePolicy}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src https: blob:; connect-src 'self'; frame-src 'self' https://www.youtube-nocookie.com; form-action 'none'`);
    } else if (route === '/joueur') {
      html = policy(html.replace('src="/joueur.js"', 'src="./joueur.js"').replace('src="/video-player.js"', 'src="./video-player.js"'),
        `${basePolicy}; style-src 'self' 'unsafe-inline'; img-src data:; media-src https:; frame-src 'self' about:; form-action 'none'`);
    } else if (route === '/espace-joueur.html') {
      html = policy(html, `${basePolicy}; style-src 'self'; img-src 'self' data: blob: https:; connect-src 'self'; form-action 'none'`);
    }
    bytes = html;
  }
  if (['/bibliotheque.mjs', '/grimoire-joueur.mjs', '/objets-joueur.mjs'].includes(route)) {
    bytes = bytes.toString('utf8').replace(/`https:\/\/github\.com\/Sijiel44\/archives-alrick\/blob\/[^`]+`/g,
      '`./fiches.html#fiche/${encodeURIComponent(entry.id)}`');
  }
  if (route === '/app.mjs') {
    bytes = bytes.toString('utf8').replace("  const entry = location.hash;", "  const entry = location.hash;\n  if (entry === '#sauvegardes') { history.replaceState(history.state, '', location.pathname + location.search); navigate('backups'); return; }");
  }
  const filename = path.join(output, route === '/joueur' ? 'joueur.html' : route.slice(1));
  await mkdir(path.dirname(filename), { recursive: true }); await writeFile(filename, bytes);
}
for (const filename of ['fiches.html', 'fiches.mjs', 'fiches.css']) await copyFile(`publication/${filename}`, path.join(output, filename));
await copyFile('publication/article-renderer.mjs', path.join(destination, 'article-renderer.mjs'));
for (const entry of readable.values()) {
  if (/^\/(studio\/media|images)\//.test(entry.image ?? '')) {
    assert(!entry.image.includes('..'), 'Image hors périmètre');
    const source = entry.image.startsWith('/studio/media/') ? `studio-local/${entry.image.slice('/studio/'.length)}` : `content${entry.image}`;
    const filename = path.join(output, entry.image.startsWith('/studio/') ? entry.image.slice('/studio/'.length) : entry.image.slice(1));
    await mkdir(path.dirname(filename), { recursive: true }); await copyFile(source, filename);
    if (entry.image.startsWith('/images/')) entry.image = `.${entry.image}`;
  }
  if (entry.image?.startsWith('/studio/')) entry.image = `.${entry.image.slice('/studio'.length)}`;
  // Les bibliothèques Node résolvent les chemins d'illustration avant leur export navigateur.
  if (entry.image?.includes('/studio-local/')) entry.image = `./${entry.image.split('/studio-local/')[1]}`;
}
await writeFile(path.join(output, 'public-documents.json'), JSON.stringify({ entries: [...readable.values()], pathIds }));
await writeFile(path.join(output, 'publication.json'), JSON.stringify({ profile: 'chroniques-studio', generatedAt: new Date().toISOString(),
  entries: readable.size, source: 'studio-local allowlist', campaignPrivateData: false }));
console.log(`CHRONIQUES · Studio exporté · ${readable.size} fiches internes · Univers existant préservé.`);
