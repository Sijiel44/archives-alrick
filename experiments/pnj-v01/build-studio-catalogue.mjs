/**
 * PNJ-008 — raccord documentaire du Cabinet au rayon « PNJ et personnages ».
 *
 * Le catalogue du Studio est accessible sans authentification : seules les
 * fiches explicitement publiques, non masquées et sans avertissement de
 * révélations peuvent y être indexées. Les autres restent dans leurs dossiers
 * historiques, sans duplication ni fuite vers la fenêtre joueur.
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

export async function publicNpcEntries(records = selection.slice(0, 90)) {
  if (records.length !== 90) throw new Error('Le lot PNJ-001–006 doit contenir 90 références exactes.');
  const entries = [];
  for (const record of records) {
    const content = await readFile(path.join(sourcesPath, record.file), 'utf8');
    const metadata = content.split(/^---\s*$/m)[1];
    if (!metadata) throw new Error(`Métadonnées absentes : ${record.file}`);
    // « unlisted » et « spoilers » sont délibérément exclus même si la page
    // source est physiquement servie par Quartz.
    if (frontmatterValue(metadata, 'publish') !== 'true' ||
        frontmatterValue(metadata, 'unlisted') === 'true' ||
        frontmatterValue(metadata, 'spoilers') === 'true') continue;
    const code = frontmatterValue(metadata, 'code');
    const name = frontmatterValue(metadata, 'title').split(' — ')[0];
    if (!code || !name || !record.accroche?.trim()) throw new Error(`Source PNJ invalide : ${record.file}`);
    entries.push({
      id: code,
      version: blobVersion(content),
      name,
      description: record.accroche,
      kind: 'npc',
      shelf: 'pnj',
      group: record.groupe === 'metiers' ? 'Artisans et vie quotidienne' :
        record.groupe === 'proches' ? 'Relations et compagnons' : 'Figures documentées',
      status: 'reference',
      path: `content/personnages/${record.file}`,
      tags: `pnj personnage ${record.groupe} ${record.id} archives proposition non jouée`,
      links: [],
      ...(record.image ? { art: {
        src: `https://sijiel44.github.io/archives-alrick/images/personnages/${record.image}`,
        alt: `Portrait conceptuel de ${name}, interprétation graphique non canonique.`,
      } } : {}),
      details: [
        ['En scène (proposition)', record.enScene],
        ['Rencontre fictive', record.rencontre],
        ['Choix possible', record.choix],
        ...(record.image ? [['Illustration', 'Proposition graphique non canonisée ; apparence libre à adapter par le MJ.']] : []),
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
    decision: 'Catalogue public du Studio : les trois dragons documentés et les fiches de PNJ sans révélations des lots PNJ-001–006. Les références privées ou non listées restent exclues.',
    entries,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await buildStudioCatalogue();
  await writeFile(cataloguePath, `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(`${result.entries.length} personnages publics indexés (dont 3 dragons).\n`);
}
