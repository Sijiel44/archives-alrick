import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

// Validation hors réseau du livrable réel, sans importer ses modules ni exécuter son aperçu.
const root = fs.realpathSync(path.resolve(process.argv[2] ?? import.meta.dirname));
const errors = [];
const warnings = [];
let assertions = 0;
const buffers = new Map();
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const normalize = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '')
  .toLocaleLowerCase('fr').replace(/[^a-z0-9]+/g, ' ').trim();
const unique = values => new Set(values).size === values.length;

function check(condition, message) {
  assertions += 1;
  try { assert.ok(condition, message); } catch { errors.push(message); }
  return Boolean(condition);
}

function confinedFile(relative, label = relative) {
  if (!check(nonempty(relative), `${label}: chemin manquant`)) return null;
  if (!check(!/^(?:[a-z][a-z0-9+.-]*:|[\\/]{1,2})/i.test(relative) && !relative.includes('\0'),
    `${label}: chemin absolu ou URL interdits`)) return null;
  const target = path.resolve(root, relative.replace(/[\\/]/g, path.sep));
  const within = candidate => {
    const rel = path.relative(root, candidate);
    return rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel);
  };
  if (!check(within(target), `${label}: chemin hors paquet`)) return null;
  try {
    const actual = fs.realpathSync(target);
    if (!check(within(actual), `${label}: lien réel hors paquet`)) return null;
    if (!check(fs.statSync(actual).isFile(), `${label}: fichier ordinaire attendu`)) return null;
    return actual;
  } catch (error) {
    check(false, `${label}: fichier inaccessible (${error.code ?? error.message})`);
    return null;
  }
}

function fileBytes(relative) {
  if (buffers.has(relative)) return buffers.get(relative);
  const absolute = confinedFile(relative);
  if (!absolute) return null;
  try {
    const bytes = fs.readFileSync(absolute);
    buffers.set(relative, bytes);
    return bytes;
  } catch (error) {
    check(false, `${relative}: lecture impossible (${error.code ?? error.message})`);
    return null;
  }
}

function json(relative) {
  const bytes = fileBytes(relative);
  if (!bytes) return null;
  try { return JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, '')); }
  catch (error) { check(false, `${relative}: JSON invalide (${error.message})`); return null; }
}

function fields(object, keys, label) {
  check(object && typeof object === 'object' && !Array.isArray(object), `${label}: objet attendu`);
  for (const key of keys) check(nonempty(object?.[key]), `${label}.${key}: texte vide ou absent`);
}

function textArray(value, label, minimum = 1) {
  check(Array.isArray(value) && value.length >= minimum, `${label}: liste attendue`);
  if (Array.isArray(value)) for (const [i, item] of value.entries()) check(nonempty(item), `${label}[${i}]: texte vide`);
}

function narrativeWords(entry) {
  const parts = [entry.description, entry.habitat,
    ...Object.values(entry.ecology ?? {}), ...Object.values(entry.behavior ?? {}),
    ...(entry.abilitiesDescriptive ?? []).flatMap(item =>
      ['name', 'effect', 'conditions', 'limits', 'counterplay'].map(key => item[key])),
    ...(entry.strengths ?? []),
    ...Object.values(entry.evolution ?? {}),
    ...(entry.weaknesses ?? []),
    ...(entry.variants ?? []).flatMap(item => [item.name, item.description]),
    ...(entry.resources?.renewable ?? []), ...(entry.resources?.harmful ?? []),
    ...(entry.resources?.proposedUses ?? []),
    entry.resources?.alchemy?.material, entry.resources?.alchemy?.proposedUse, entry.resources?.alchemy?.conditions,
    ...(entry.quests ?? []).flatMap(item => ['title', 'situation', 'choice', 'openOutcome'].map(key => item[key]))];
  return parts.filter(nonempty).join(' ').trim().split(/\s+/u).filter(Boolean).length;
}

function resolveLinkedFile(documentPath, target, label) {
  if (!check(nonempty(target), `${label}: cible vide`)) return null;
  if (!check(!/^(?:[a-z][a-z0-9+.-]*:|[\\/])/i.test(target), `${label}: lien externe ou absolu interdit`)) return null;
  let clean = target.split('#')[0].split('?')[0];
  if (!clean) return null;
  try { clean = decodeURIComponent(clean); } catch { check(false, `${label}: échappement URL invalide`); return null; }
  const relative = path.posix.join(path.posix.dirname(documentPath.replaceAll('\\', '/')), clean.replaceAll('\\', '/'));
  return confinedFile(relative, label);
}

function markdown(relative) {
  const bytes = fileBytes(relative);
  if (!bytes) return;
  const text = bytes.toString('utf8');
  const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  check(Boolean(front), `${relative}: frontmatter absent`);
  if (front) {
    check(/^publish\s*:\s*false\s*$/m.test(front[1]), `${relative}: publish:false exigé`);
    check(/^portee\s*:\s*["']?univers_partage["']?\s*$/m.test(front[1]), `${relative}: portée univers_partage exigée`);
  }
  let imageCount = 0;
  for (const match of text.matchAll(/!\[[^\]]*\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+["'][^\n]*?["'])?\s*\)/g)) {
    imageCount += 1;
    resolveLinkedFile(relative, match[1].replace(/^<|>$/g, ''), `${relative}: image`);
  }
  const definitions = new Map([...text.matchAll(/^\s*\[([^\]]+)\]:\s*(<[^>]+>|\S+)/gm)]
    .map(match => [match[1].trim().toLowerCase(), match[2].replace(/^<|>$/g, '')]));
  for (const match of text.matchAll(/!\[([^\]]*)\]\[([^\]]*)\]/g)) {
    imageCount += 1;
    const ref = (match[2] || match[1]).trim().toLowerCase();
    check(definitions.has(ref), `${relative}: référence image ${ref} absente`);
    if (definitions.has(ref)) resolveLinkedFile(relative, definitions.get(ref), `${relative}: image ${ref}`);
  }
  check(imageCount >= 1, `${relative}: illustration Markdown absente`);
}

function imageFiles(entry, manifestEntry, manifestPaths) {
  const illustration = entry.illustration;
  fields(illustration, ['path', 'originalPath', 'alt'], `${entry.id}.illustration`);
  const webpPath = illustration?.path;
  const pngPath = illustration?.originalPath;
  check(typeof webpPath === 'string' && /\.webp$/i.test(webpPath), `${entry.id}: chemin WebP attendu`);
  check(typeof pngPath === 'string' && /\.png$/i.test(pngPath), `${entry.id}: original PNG attendu`);
  for (const relative of [webpPath, pngPath]) {
    if (!nonempty(relative)) continue;
    check(manifestPaths.has(relative), `${entry.id}: image absente de manifest.files (${relative})`);
  }
  const webp = nonempty(webpPath) ? fileBytes(webpPath) : null;
  const png = nonempty(pngPath) ? fileBytes(pngPath) : null;
  if (webp) {
    check(webp.length <= 3 * 1024 * 1024, `${entry.id}: WebP dépasse 3 Mio`);
    check(webp.length >= 16 && webp.toString('ascii', 0, 4) === 'RIFF' && webp.toString('ascii', 8, 12) === 'WEBP',
      `${entry.id}: signature WebP invalide`);
    if (webp.length >= 16) {
      check(webp.readUInt32LE(4) + 8 === webp.length, `${entry.id}: taille RIFF WebP incohérente`);
      check(['VP8 ', 'VP8L', 'VP8X'].includes(webp.toString('ascii', 12, 16)), `${entry.id}: bloc image WebP inconnu`);
    }
  }
  if (png) {
    check(png.length >= 24 && png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      `${entry.id}: signature PNG invalide`);
    if (png.length >= 24) {
      check(png.toString('ascii', 12, 16) === 'IHDR' && png.readUInt32BE(16) > 0 && png.readUInt32BE(20) > 0,
        `${entry.id}: en-tête dimensions PNG invalide`);
    }
  }
  if (manifestEntry?.illustration) {
    const declared = manifestEntry.illustration;
    check(declared.path === webpPath && declared.originalPath === pngPath, `${entry.id}: chemins image différents dans le manifeste`);
    if (webp) check(declared.sha256 === digest(webp), `${entry.id}: empreinte WebP du manifeste incorrecte`);
    if (png) check(declared.originalSha256 === digest(png), `${entry.id}: empreinte PNG du manifeste incorrecte`);
  } else check(false, `${entry.id}: illustration du manifeste absente`);
}

const lot = json('lot-v0.1.json');
const manifest = json('manifest-v0.1.json');
const control = json('controle-doublons-v0.1.json');
const snapshot = json('snapshot-sources-v0.1.json');
const entries = Array.isArray(lot?.entries) ? lot.entries : [];
check(lot?.lot === 'BEST-ER-010', 'Lot BEST-ER-010 attendu');
check(entries.length === 10, 'Le lot doit contenir dix fiches');
check(lot?.portee === 'univers_partage', 'Portée du lot incorrecte');
check(manifest?.lot === lot?.lot && manifest?.version === lot?.version, 'Identité/version du manifeste différente du lot');
check(control?.lot === lot?.lot && snapshot?.lot === lot?.lot, 'Contrôle et instantané doivent concerner le même lot');

const expectedIds = Array.from({length: 10}, (_, i) => `BEST-ER-010-${String(53 + i).padStart(3, '0')}`);
check(unique(entries.map(entry => entry.id)), 'Identifiants de travail répétés');
check(expectedIds.every(id => entries.some(entry => entry.id === id)), 'Série de travail 053–062 incomplète');
check(unique(entries.map(entry => normalize(entry.name))), 'Noms normalisés répétés dans le nouveau lot');
check(unique(entries.map(entry => entry.slug)), 'Slugs répétés dans le nouveau lot');

const fileRecords = Array.isArray(manifest?.files) ? manifest.files : [];
check(fileRecords.length > 0, 'manifest.files absent ou vide');
check(unique(fileRecords.map(file => file.path)), 'Chemins répétés dans manifest.files');
const manifestPaths = new Set(fileRecords.map(file => file.path));
for (const file of fileRecords) {
  check(/^[a-f0-9]{64}$/.test(file.sha256 ?? ''), `${file.path}: empreinte SHA-256 mal formée`);
  check(Number.isSafeInteger(file.bytes) && file.bytes >= 0, `${file.path}: taille déclarée invalide`);
  const bytes = fileBytes(file.path);
  if (bytes) {
    check(bytes.length === file.bytes, `${file.path}: taille différente du manifeste`);
    check(digest(bytes) === file.sha256, `${file.path}: empreinte différente du manifeste`);
  }
}
for (const required of ['lot-v0.1.json', 'controle-doublons-v0.1.json', 'snapshot-sources-v0.1.json', 'APERCU.html'])
  check(manifestPaths.has(required), `${required}: absent de manifest.files`);
check(manifest?.source?.path === 'lot-v0.1.json', 'manifest.source.path doit désigner le lot');
if (buffers.has('lot-v0.1.json')) check(manifest?.source?.sha256 === digest(buffers.get('lot-v0.1.json')), 'manifest.source.sha256 incorrect');
check(Array.isArray(manifest?.entries) && manifest.entries.length === 10, 'Dix correspondances manifest.entries exigées');
check(unique((manifest?.entries ?? []).map(entry => entry.id)), 'Identifiants répétés dans manifest.entries');
const byManifestId = new Map((manifest?.entries ?? []).map(entry => [entry.id, entry]));
const wordCounts = {};
for (const entry of entries) {
  fields(entry, ['id', 'name', 'slug', 'family', 'size', 'description', 'habitat', 'provenance'], entry.id ?? 'fiche');
  check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug ?? ''), `${entry.id}: slug invalide`);
  check(entry.category === 'bestiaire' && entry.portee === 'univers_partage', `${entry.id}: catégorie ou portée incorrecte`);
  check(entry.candidateRegistryId === null && entry.registryStatus === 'non_attribue', `${entry.id}: code permanent ne doit pas être attribué`);
  check(entry.publish === false && entry.canonValidated === false && entry.playedFact === false, `${entry.id}: publication, canon ou fait joué activé`);
  check(entry.canon_statut === 'proposition_non_jouee' && entry.editorialStatus === 'proposition_non_jouee', `${entry.id}: statut de proposition absent`);
  check(entry.etat_editorial === 'en_chantier', `${entry.id}: état éditorial de préparation attendu`);
  check(entry.mjSecrets === null && entry.mechanics?.profile === null && entry.mechanics?.status === 'non_valide', `${entry.id}: secret ou profil mécanique indûment renseigné`);
  fields(entry.evolution, ['naturalStages','possibleAdaptations','limits'], `${entry.id}.evolution`);
  textArray(entry.strengths, `${entry.id}.strengths`, 2);
  fields(entry.ecology, ['diet', 'lifeCycle', 'role', 'seasonality'], `${entry.id}.ecology`);
  fields(entry.behavior, ['ordinary', 'warningSigns', 'firstContact', 'escalation', 'retreat', 'coexistence'], `${entry.id}.behavior`);
  check(Array.isArray(entry.abilitiesDescriptive) && entry.abilitiesDescriptive.length === 3, `${entry.id}: trois capacités exigées`);
  for (const [i, ability] of (entry.abilitiesDescriptive ?? []).entries()) fields(ability, ['name', 'effect', 'conditions', 'limits', 'counterplay'], `${entry.id}.capacite[${i}]`);
  textArray(entry.weaknesses, `${entry.id}.weaknesses`);
  check(Array.isArray(entry.variants) && entry.variants.length === 2, `${entry.id}: deux variantes exigées`);
  for (const [i, variant] of (entry.variants ?? []).entries()) {
    fields(variant, ['name', 'description'], `${entry.id}.variante[${i}]`);
    check(variant.status === 'proposition_non_jouee', `${entry.id}: statut de variante incorrect`);
  }
  for (const key of ['renewable', 'harmful', 'proposedUses']) textArray(entry.resources?.[key], `${entry.id}.resources.${key}`);
  fields(entry.resources?.alchemy, ['material','proposedUse','conditions'], `${entry.id}.resources.alchemy`);
  check(entry.resources?.alchemy?.status === 'proposition_non_jouee', `${entry.id}: piste alchimique non proposée`);
  check(entry.resources?.validation === 'aucune_recette_ni_bonus_valide', `${entry.id}: validation de ressource indue`);
  check(Array.isArray(entry.quests) && entry.quests.length === 4, `${entry.id}: quatre amorces exigées`);
  for (const [i, quest] of (entry.quests ?? []).entries()) fields(quest, ['title', 'situation', 'choice', 'openOutcome'], `${entry.id}.amorce[${i}]`);
  const words = narrativeWords(entry);
  wordCounts[entry.id] = words;
  check(words >= 500, `${entry.id}: texte narratif insuffisant (${words} mots, minimum 500)`);
  const record = byManifestId.get(entry.id);
  check(Boolean(record) && record.name === entry.name && record.slug === entry.slug, `${entry.id}: correspondance d’identité du manifeste incorrecte`);
  if (record) {
    check(manifestPaths.has(record.path), `${entry.id}: fiche Markdown absente de manifest.files`);
    if (nonempty(record.path)) markdown(record.path);
  }
  imageFiles(entry, record, manifestPaths);
}

// Les anciens corpus se recouvrent : seules leurs collisions avec les nouvelles fiches sont rejetées.
const corpora = [];
for (const source of ['github', 'sites']) {
  const values = snapshot?.[source]?.corpora;
  check(Array.isArray(values) && values.length > 0, `Instantané ${source}.corpora absent ou vide`);
  for (const corpus of values ?? []) {
    check(nonempty(corpus.key) && Array.isArray(corpus.identities), `${source}: corpus mal formé`);
    check(corpus.count === corpus.identities?.length, `${source}/${corpus.key}: total différent des identités enregistrées`);
    corpora.push({source, key: corpus.key, identities: corpus.identities ?? []});
  }
}
const oldRows = corpora.flatMap(corpus => corpus.identities.map(identity => ({...identity, corpus: `${corpus.source}/${corpus.key}`})));
check(oldRows.length > 0, 'Aucune identité historique disponible pour contrôler les doublons');
const collisionRows = [];
for (const entry of entries) {
  const names = [entry.name, ...(entry.aliases ?? [])].map(normalize).filter(Boolean);
  const idHits = oldRows.filter(old => [old.id, old.canonicalId, old.workId, old.candidateRegistryId].includes(entry.id));
  const nameHits = oldRows.filter(old => [old.name, ...(old.aliases ?? [])].map(normalize).some(name => name && names.includes(name)));
  check(idHits.length === 0, `${entry.id}: collision d’identifiant dans l’instantané`);
  check(nameHits.length === 0, `${entry.id}: collision exacte de nom/alias normalisé dans l’instantané`);
  if (idHits.length || nameHits.length) collisionRows.push({id: entry.id, idHits: idHits.map(row => row.corpus), nameHits: nameHits.map(row => row.corpus)});
  const saved = (snapshot?.candidates ?? []).find(candidate => candidate.id === entry.id);
  check(Boolean(saved) && saved.name === entry.name && saved.slug === entry.slug, `${entry.id}: identité différente dans snapshot.candidates`);
  const report = (control?.entries ?? []).find(candidate => candidate.id === entry.id);
  check(Boolean(report) && report.name === entry.name && report.normalizedName === normalize(entry.name), `${entry.id}: identité différente dans le contrôle des doublons`);
  check(Array.isArray(report?.idCollisions) && report.idCollisions.length === idHits.length, `${entry.id}: compte rendu des collisions ID incohérent`);
  check(Array.isArray(report?.normalizedExactNameCollisions) && report.normalizedExactNameCollisions.length === nameHits.length, `${entry.id}: compte rendu des collisions de noms incohérent`);
  fields(report?.semanticReview, ['assessment', 'decision'], `${entry.id}.semanticReview`);
}
check(Array.isArray(snapshot?.candidates) && snapshot.candidates.length === 10, 'Dix candidats exigés dans l’instantané');
check(Array.isArray(control?.entries) && control.entries.length === 10, 'Dix entrées exigées dans le contrôle des doublons');
check(control?.checks?.idCollisions === 0 && control?.checks?.normalizedExactNameCollisions === 0,
  'Le contrôle enregistré ne conclut pas zéro collision exacte');
check(control?.checks?.candidateIdsUnique === true && control?.checks?.candidateNamesUnique === true && control?.checks?.candidateSlugsUnique === true,
  'Le contrôle enregistré ne confirme pas l’unicité des nouvelles fiches');
check(control?.snapshot?.path === 'snapshot-sources-v0.1.json', 'Chemin du snapshot différent dans le contrôle');
if (buffers.has('snapshot-sources-v0.1.json')) check(control?.snapshot?.sha256 === digest(buffers.get('snapshot-sources-v0.1.json')),
  'Empreinte du snapshot incorrecte dans le contrôle');

const previewBytes = fileBytes('APERCU.html');
let previewArticleCount = 0;
if (previewBytes) {
  const html = previewBytes.toString('utf8');
  check(!/(?:https?:)?\/\/[^\s"'<>]+/i.test(html), 'APERCU.html contient une URL externe');
  check(!/\bfetch\s*\(/i.test(html), 'APERCU.html appelle fetch');
  previewArticleCount = [...html.matchAll(/<article\b/gi)].length;
  check(previewArticleCount === 10, `APERCU.html: dix articles exigés (${previewArticleCount} trouvés)`);
  for (const match of html.matchAll(/\b(src|href)\s*=\s*(["'])(.*?)\2/gi)) {
    const target = match[3].replaceAll('&amp;', '&');
    if (target.startsWith('#')) continue;
    check(!/^(?:[a-z][a-z0-9+.-]*:|[\\/])/i.test(target), `APERCU.html: ${match[1]} externe ou absolu interdit`);
    resolveLinkedFile('APERCU.html', target, `APERCU.html: ${match[1]}`);
  }
  for (const match of html.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
    if (match[2].startsWith('#')) continue;
    resolveLinkedFile('APERCU.html', match[2], 'APERCU.html: ressource CSS');
  }
}

const summary = {
  lot: lot?.lot ?? null,
  ok: errors.length === 0,
  assertions,
  entries: entries.length,
  narrativeWords: wordCounts,
  manifestFilesChecked: fileRecords.length,
  originalPngExpected: entries.length,
  webpExpected: entries.length,
  previewArticles: previewArticleCount,
  historicalSnapshot: corpora.map(corpus => ({source: corpus.source, key: corpus.key, rows: corpus.identities.length})),
  exactCandidateCollisions: collisionRows,
  limits: ['Contrôle de fichiers et métadonnées ; ne remplace pas une relecture sémantique, une recette navigateur ou une décision éditoriale.'],
  warnings,
  errors
};
console.log(JSON.stringify(summary, null, 2));
process.exitCode = errors.length ? 1 : 0;
