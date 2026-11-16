/**
 * PNJ-008 — raccord documentaire du Cabinet au rayon « PNJ et personnages ».
 *
 * Le catalogue du Studio est accessible sans authentification. Décision du
 * créateur : toutes les fiches historiques documentées doivent être
 * découvrables ; les révélations sont averties, jamais présentées en secret.
 * Ne copier ni notes de campagne privées ni mécanique non arbitrée.
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { selection } from './selection.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cataloguePath = path.join(root, 'studio-local/catalogue-pnj.json');
const sourcesPath = path.join(root, 'content/personnages');

function frontmatterValue(metadata, name) {
  return metadata.match(new RegExp(`^${name}:\\s*(.*)$`, 'm'))?.[1]
    ?.trim().replace(/^['"]|['"]$/g, '') ?? '';
}

function blobVersion(content) {
  return createHash('sha1').update(`blob ${Buffer.byteLength(content)}\0`).update(content).digest('hex');
}

export async function publicNpcEntries(records = selection) {
  // Le catalogue grandit avec la sélection : ne pas bloquer la publication
  // des prochains lots, mais interdire toute disparition des 102 bases.
  if (records.length < 102) throw new Error('La sélection doit conserver les 102 personnages historiques au minimum.');
  const entries = [];
  for (const record of records) {
    const content = await readFile(path.join(sourcesPath, record.file), 'utf8');
    const metadata = content.split(/^---\s*$/m)[1];
    if (!metadata) throw new Error(`Métadonnées absentes : ${record.file}`);
    if (frontmatterValue(metadata, 'publish') !== 'true') {
      throw new Error(`Source encore non publiée : ${record.file}`);
    }
    const code = frontmatterValue(metadata, 'code');
    const name = frontmatterValue(metadata, 'title').split(' — ')[0];
    const spoiler = frontmatterValue(metadata, 'spoilers') === 'true';
    if (!code || !name || !record.accroche?.trim()) throw new Error(`Source PNJ invalide : ${record.file}`);
    entries.push({
      id: code,
      version: blobVersion(content),
      name,
      description: `${spoiler ? '⚠ Révélations sur l’histoire d’Orin. ' : ''}${record.accroche}`,
      kind: 'npc',
      shelf: 'pnj',
      group: record.groupe === 'metiers' ? 'Artisans et vie quotidienne' :
        record.groupe === 'proches' ? 'Relations et compagnons' : 'Figures documentées',
      status: 'reference',
      path: `content/personnages/${record.file}`,
      tags: `pnj personnage ${record.groupe} ${record.id} archives ${spoiler ? 'avertissement revelations' : 'public'}`,
      links: [],
      ...((record.image || record.externe) ? { art: {
        src: record.image ? `https://sijiel44.github.io/archives-alrick/images/personnages/${record.image}` : record.externe.url,
        alt: record.image ? `Portrait conceptuel de ${name}, interprétation graphique non canonique.` :
          `Inspiration visuelle externe : ${record.externe.titre}. Ce n’est pas un portrait de ${name}.`,
      } } : {}),
      details: [
        ...(spoiler ? [['Révélations', 'Cette référence peut dévoiler des événements de l’Odyssée. La lecture est volontaire.']] : []),
        ['En scène (proposition)', record.enScene],
        ['Rencontre fictive', record.rencontre],
        ['Choix possible', record.choix],
        ...(record.image ? [['Illustration', 'Proposition graphique non canonisée ; apparence libre à adapter par le MJ.']] : []),
        ...(record.externe ? [['Inspiration externe', `${record.externe.credit} · ${record.externe.licence} · ${record.externe.source}`]] : []),
      ],
    });
  }
  return entries.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

export async function buildStudioCatalogue() {
  const previous = JSON.parse(await readFile(cataloguePath, 'utf8'));
  const dragons = previous.entries.filter(entry => /^DRG-0[123]$/.test(entry.id));
  if (dragons.length !== 3) throw new Error('Les trois dragons historiques doivent être conservés.');
  const candidates = await publicNpcEntries();
  const entries = [...dragons, ...candidates];
  if (new Set(entries.map(entry => entry.id)).size !== entries.length) {
    throw new Error('Collision de codes PNJ : le catalogue ne peut pas être écrit.');
  }
  return { ...previous,
    decision: `Décision du créateur, 16 novembre 2026 : catalogue accessible à tous, ${candidates.length} fiches documentées et trois dragons. Les scènes de rencontre sont adaptables et les révélations historiquement sourcées restent averties.`,
    entries,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await buildStudioCatalogue();
  await writeFile(cataloguePath, `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(`${result.entries.length} personnages publics indexés (dont 3 dragons).\n`);
}
