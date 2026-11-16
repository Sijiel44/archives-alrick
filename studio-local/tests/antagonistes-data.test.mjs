import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { LIBRARY_ILLUSTRATIONS, buildLibraryIndex, libraryReference } from '../bibliotheque.mjs';
import { startStudioServer, studioAssets } from '../serve.mjs';
import catalogue from '../catalogue-antagonistes.json' with { type: 'json' };

const root = fileURLToPath(new URL('../../', import.meta.url));
const sourceFile = path => fileURLToPath(new URL(`../../${path}`, import.meta.url));
const hash = path => execFileSync('git', ['hash-object', path], { cwd: root, encoding: 'utf8' }).trim();

test('Trente-six personnages des conflits de Déchéance : niveaux narratifs, Chutes et sources', () => {
  assert.equal(catalogue.schema, 'entre-rives/antagonistes-publics/1');
  assert.equal(catalogue.visibility, 'public');
  assert.equal(catalogue.rulesStatus, 'narrative_levels_only');
  assert.equal(catalogue.entries.length, 36);
  assert.deepEqual(catalogue.entries.map(entry => entry.levelIntent), [2, 3, 5, 7, 8, 10, 12, 15, 17, 20, 4, 6, 9, 11, 14, 18, 2, 8, 13, 19, 17, 14, 6, 9, 4, 2, 12, 8, 3, 16, 10, 5, 15, 11, 6, 2]);
  const entries = buildLibraryIndex([]);
  const ids = new Set();
  for (const character of catalogue.entries) {
    assert.match(character.id, /^PER-DECH-(?:0[1-9]|1[0-9]|2[0-9]|3[0-6])$/);
    assert.equal(ids.has(character.id), false);
    ids.add(character.id);
    assert.ok(['Tentation', 'Fêlure', 'Rupture', 'Déchéance', 'Abîme', 'Non Déchu'].includes(character.corruptionStage));
    assert.ok(['Opposition possible', 'Rivalité / ambiguïté'].includes(character.positionNarrative));
    const page = readFileSync(sourceFile(character.path), 'utf8');
    assert.match(page, new RegExp(`^code: "${character.id}"$`, 'm'));
    assert.match(page, /^publish: true$/m);
    assert.match(page, /^canon_statut: "lore_valide"$/m);
    assert.match(page, new RegExp(String.raw`\*\*Niveau de référence : ${character.levelIntent}\b`));
    assert.equal(hash(character.path), character.version, `${character.id} : source changée sans version`);
    if (['Rupture', 'Déchéance', 'Abîme'].includes(character.corruptionStage)) {
      assert.match(page, /Chute liée|Chutes liées|branches distinctes/, `${character.id} : seuil de Déchéance sans branche décrite`);
    }
    const image = readFileSync(sourceFile(`quartz/static/images/personnages-dechus/${character.image}`));
    if (character.image.endsWith('.webp')) {
      assert.equal(image.toString('ascii', 0, 4), 'RIFF', `${character.id}: en-tête RIFF`);
      assert.equal(image.toString('ascii', 8, 12), 'WEBP', `${character.id}: fichier WebP`);
      const svg = readFileSync(sourceFile(`quartz/static/images/personnages-dechus/${character.id.toLowerCase()}.svg`), 'utf8');
      assert.match(svg, /^<svg[^>]*role="img"/, `${character.id}: variante SVG originale`);
      assert.doesNotMatch(svg, /<script|<foreignObject|\bon\w+\s*=|\bhref=/i);
    } else {
      assert.match(image.toString('utf8'), /^<svg[^>]*role="img"/);
      assert.doesNotMatch(image.toString('utf8'), /<script|<foreignObject|\bon\w+\s*=|\bhref=/i);
    }
    const reference = libraryReference(character.id);
    assert.equal(reference?.kind, 'npc');
    assert.equal(reference?.shelf, 'antagonistes');
    assert.equal(reference?.positionNarrative, character.positionNarrative);
    assert.equal(reference?.status, 'lore');
    assert.equal(reference?.version, character.version);
    assert.equal(reference?.level, undefined, 'Un niveau indicatif ne doit pas devenir un profil de combat');
    assert.equal(reference?.publicTemplate?.role, character.role);
    assert.equal(reference?.publicTemplate?.posture, character.positionNarrative);
    assert.equal(libraryReference(character.path), reference);
    assert.ok(LIBRARY_ILLUSTRATIONS.includes(reference));
    assert.ok(entries.some(entry => entry.id === character.id));
  }
  for (const entry of catalogue.entries) for (const related of [...entry.relations, ...entry.factions]) {
    assert.ok(ids.has(related) || /^ORG-DECH-(?:0[1-9]|10)$/.test(related));
  }
  assert.deepEqual(catalogue.entries.filter(entry => entry.corruptionStage === 'Non Déchu').map(entry => entry.id),
    ['PER-DECH-21', 'PER-DECH-24', 'PER-DECH-26', 'PER-DECH-27', 'PER-DECH-29', 'PER-DECH-30', 'PER-DECH-32', 'PER-DECH-33', 'PER-DECH-36'], 'Les salariés non Déchus ne comptent pas comme Chutes liées');
});

test('Les profils publics ne transportent ni chiffres de combat ni secrets de campagne', () => {
  const data = JSON.stringify(catalogue).toLowerCase();
  for (const forbidden of ['secret mj', 'hidden', 'campaign_id', 'campagne_id', 'pvmax', 'defense', 'degats', 'mana', 'lieur_id']) {
    assert.equal(data.includes(forbidden), false, `Champ confidentiel ou mécanique interdit : ${forbidden}`);
  }
  assert.ok(catalogue.entries.every(entry => entry.levelIntent >= 2 && entry.levelIntent <= 20 && entry.artAlt));
});

test('Studio : JSON, portraits SVG et CSP limités au rayon MJ', async t => {
  const server = await startStudioServer(0);
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const studio = await fetch(origin);
  assert.match(studio.headers.get('content-security-policy') ?? '', /connect-src[^;]+\/catalogue-antagonistes\.json/);
  const player = await fetch(`${origin}/joueur`);
  assert.match(player.headers.get('content-security-policy') ?? '', /connect-src 'none'/);
  const response = await fetch(`${origin}/catalogue-antagonistes.json`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).entries.length, 36);
  for (const entry of catalogue.entries) {
    const target = `/images/personnages-dechus/${entry.image}`;
    assert.ok(studioAssets.has(target));
    const illustration = await fetch(`${origin}${target}`);
    assert.equal(illustration.status, 200);
    assert.match(illustration.headers.get('content-type') ?? '', /image\/(?:svg\+xml|webp)/);
  }
  assert.equal((await fetch(`${origin}/images/personnages-dechus/dossier-secret.svg`)).status, 404);
});


test('Catégorie éditoriale : 36 fiches publiables, repères indépendants de la Déchéance', () => {
  const page = readFileSync(sourceFile('content/personnages/antagonistes-et-rivaux.md'), 'utf8');
  assert.match(page, /^publish: true$/m);
  for (const character of catalogue.entries) assert.ok(page.includes(`./${character.id}.md`), `Lien manquant : ${character.id}`);
  for (const marker of ['antag-role--opposition', 'antag-role--ambigu', 'antag-role--ally', 'antag-role--neutral']) {
    assert.ok(page.includes(marker), `Légende manquante : ${marker}`);
  }
  const types = readFileSync(sourceFile('studio-local/creations.mjs'), 'utf8');
  assert.match(types, /Position narrative dans cette campagne/);
  assert.match(page, /La référence commune reste intacte/);
});
