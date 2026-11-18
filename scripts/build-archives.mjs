// Production Pages : sources de campagne uniquement. Le build d'intégration
// historique reste disponible pour les tests, mais n'est jamais téléversé.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile, rm, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { build } from 'esbuild';
import YAML from 'yaml';
import { contentDocuments, isCampaignDocument } from './publication-scope.mjs';

const workspace = process.cwd();
const stage = path.resolve('.publication/archives');
const output = path.resolve('public-archives');
// Toute suppression reste strictement dans ces deux répertoires de génération.
for (const target of [stage, output]) {
  assert(target.startsWith(`${workspace}${path.sep}`) && target !== workspace);
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
}
const documents = await contentDocuments();
const legacy = new Set(JSON.parse(await readFile('config/campaign-legacy.json', 'utf8')));
const selected = documents.filter(document => isCampaignDocument(document, legacy));
const pages = new Map(selected.map(document => [document.path, document]));
const groups = new Map();
for (const document of selected) {
  const group = document.path.split('/')[0];
  if (!document.fm.code || !document.path.includes('/')) continue;
  if (!groups.has(group)) groups.set(group, []);
  groups.get(group).push(document);
}
const titles = { personnages: 'Personnages rencontrés', lieux: 'Lieux de la campagne', groupes: 'Compagnies et alliances',
  chroniques: 'Épisodes de l’Odyssée', objets: 'Objets et œuvres', creatures: 'Créatures rencontrées', cultures: 'Cultures et traditions',
  economie: 'Économie et engagements', institutions: 'Institutions', projets: 'Projets de campagne', magie: 'Magie dans la campagne',
  maison: 'Maison divine', monde: 'Repères du monde', 'jdr-alrick': 'Récit et continuité', mj: 'Dossiers MJ de campagne' };
function page(filename, title, body, extra = {}) {
  const fm = { title, publish: true, portee: 'jdr_alrick', ...extra };
  pages.set(filename, { path: filename, fm, body });
}
for (const [group, files] of groups) {
  if (['jdr-alrick', 'mj'].includes(group) && pages.has(`${group}/index.md`)) continue;
  const publicFiles = files.filter(file => !file.fm.spoilers && !file.fm.unlisted);
  page(`${group}/index.md`, titles[group] ?? group,
    `# ${titles[group] ?? group}\n\nFiches documentées dans L’Odyssée d’Orin. Les états, intentions et faits joués restent distingués.\n\n` +
    publicFiles.sort((a, b) => a.fm.title.localeCompare(b.fm.title, 'fr')).map(file => `- [[${file.path.replace(/\.md$/, '')}|${file.fm.title}]]`).join('\n'));
}
const nestedFolders = new Set(selected.map(doc => path.posix.dirname(doc.path)).filter(dir => dir.includes('/')));
for (const folder of nestedFolders) {
  if (pages.has(`${folder}/index.md`)) continue;
  const children = selected.filter(doc => path.posix.dirname(doc.path) === folder);
  const secret = children.every(doc => doc.fm.spoilers || doc.fm.unlisted);
  page(`${folder}/index.md`, 'Dossier de campagne', '# Dossier de campagne\n\n' + children.map(doc =>
    `- [[${doc.path.replace(/\.md$/, '')}|${doc.fm.title}]]`).join('\n'), secret ? { spoilers: true, unlisted: true, visibilite: 'publique_avec_avertissement' } : {});
}
page('index.md', 'L’Odyssée d’Orin — Archives de campagne', '');
page('bibliotheque.md', 'Les fiches de la campagne', '');
page('a-propos.md', 'Sources et mise à jour de la campagne', `# Sources et mise à jour de la campagne

Ce site est exclusivement consacré au JDR d’Alrick, **L’Odyssée d’Orin**. Les documents bruts autorisés, leurs synthèses et les fiches sourcées conservent leurs codes et leur état documentaire.

## Ajouter une séance avec ChatGPT

Indiquer « Mettre à jour les Archives de L’Odyssée d’Orin », joindre le texte de campagne et préciser son code documentaire. L’assistant recherche les fiches liées, distingue les faits joués des intentions, prépare une modification relisible, exécute les contrôles puis publie le lot autorisé ici. Les textes privés restent hors du site.

## Lire les sources avec justesse

Une intention n’est pas un événement accompli. Les propositions, déclarations et hypothèses gardent leur statut. Les pages signalées comme contenant des révélations demandent une ouverture explicite ; cet avertissement n’est pas un contrôle d’accès.

## Périmètre

Les Chroniques d’Entre-Rives constituent un jeu et un univers distincts. Leurs outils, règles et nouvelles créations ne sont plus publiés dans ces Archives. Une adaptation peut s’inspirer de la campagne sans devenir un fait joué par Orin.

[[odyssee/index|Lire l’Odyssée]] · [[bibliotheque|Rechercher une fiche]]`);
const slugs = new Set([...pages.keys()].map(filename => filename.replace(/\.md$/, '')));
const basename = new Map([...slugs].map(slug => [slug.split('/').at(-1), slug]));
const assets = new Set();
const removedLinks = [];
function available(target, from) {
  const raw = target.split('#')[0].replace(/\.md$/, '').replace(/^\//, '');
  if (!raw) return true;
  return slugs.has(raw) || slugs.has(path.posix.normalize(path.posix.join(path.posix.dirname(from), raw))) || basename.has(raw);
}
for (const document of pages.values()) {
  let body = document.body.replace(/!?\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, target, label) => {
    if (available(target, document.path)) return match;
    removedLinks.push({ from: document.path, target });
    return label ?? target.split('/').at(-1).split('#')[0];
  });
  // Les anciens parcours généraux ne restent pas des invitations sans destination.
  body = body.replace(/## Autres parcours[\s\S]*$/, '');
  body = body.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, (match, label, target) => {
    if (/^(https?:|mailto:|#)/.test(target) || available(target, document.path)) return match;
    removedLinks.push({ from: document.path, target });
    return label;
  });
  for (const match of `${body}\n${document.fm.illustration ?? ''}`.matchAll(/(?:\/studio\/media\/|\/images\/)[^\s)"'<>`]+?\.(?:webp|png|jpg|jpeg|avif|svg)/g)) assets.add(match[0]);
  const target = path.join(stage, document.path);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `---\n${YAML.stringify(document.fm)}---\n${body}\n`);
}
const result = spawnSync(process.execPath, ['./quartz/bootstrap-cli.mjs', 'build', '-d', stage, '-o', output], {
  stdio: 'inherit', env: { ...process.env, PUBLICATION_PROFILE: 'orin-campaign' },
});
assert.equal(result.status, 0, 'Construction Quartz des Archives');
for (const asset of assets) {
  assert(!asset.includes('..'), 'Chemin média invalide');
  const source = asset.startsWith('/studio/media/') ? `studio-local/${asset.slice('/studio/'.length)}` : `content${asset}`;
  const target = path.join(output, asset.slice(1));
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
}
await mkdir(path.join(output, 'studio'), { recursive: true });
await copyFile('publication/recuperation.html', path.join(output, 'studio/index.html'));
await copyFile('publication/recuperation.html', path.join(output, 'studio/espace-joueur.html'));
await copyFile('publication/recuperation.css', path.join(output, 'studio/recuperation.css'));
await build({ entryPoints: ['publication/recuperation.mjs'], bundle: true, format: 'esm', platform: 'browser',
  outfile: path.join(output, 'studio/recuperation.mjs'), minify: true,
  plugins: [{ name: 'moteurs-studio', setup(builder) {
    builder.onResolve({ filter: /\/moteur\/[^/]+\.js$/ }, args => ({
      path: path.resolve('quartz/components/scripts', path.basename(args.path).replace(/\.js$/, '.ts')),
    }));
  } }],
});
// L'ancienne adresse des Archives continue à servir les mêmes documents.
await copyFile(path.join(output, 'index.html'), path.join(output, 'archives.html'));
await writeFile(path.join(output, 'publication-manifest.json'), JSON.stringify({ profile: 'orin-campaign',
  documents: [...pages.keys()].sort(), assets: [...assets].sort(),
  recoveryOnly: ['studio/index.html', 'studio/espace-joueur.html'] }, null, 2));
await writeFile('.publication/archives-report.json', JSON.stringify({ selected: selected.length,
  excluded: documents.filter(document => !pages.has(document.path)).map(document => document.path), removedLinks }, null, 2));
console.log(`ARCHIVES · ${selected.length} sources de campagne · ${pages.size} pages · aucun Studio de jeu publié.`);
