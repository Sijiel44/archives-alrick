/** Node --test sur le vrai module L003-CATALOG, sans mocks moteur ni Python. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {
  CATALOG_SCHEMA, CATALOG_UNAVAILABLE, CATALOG_PRIVATE_SNAPSHOT,
  validateCatalogEntry, createDescriptiveEntry, createDescriptiveCapability,
  createDescriptiveSpell, createDescriptiveItem, createNativeReference,
  createPrivateSnapshot, previewCatalogEntry, validateCatalogRegistry,
  clonePrivateJson, draftCatalogId,
} from '../../src/catalog/index.mjs';

const file = new URL('./fixtures-v02-original.json', import.meta.url);
const originalBytes = readFileSync(file);
const original = JSON.parse(originalBytes.toString('utf8'));
const fixtures = Object.fromEntries(original.scenarios.map(x => [x.scenario, x.entry]));
const source = Object.freeze({
  sourceSchema: 'cer.studio.dg003.provisional.v0', sourceId: 'fictif-atelier',
  sourceVersion: 'v3', originKind: 'campaign',
});
const fresh = (name = 'Signal de veille') => createDescriptiveCapability({
  name, description: 'Un geste narratif sous contrôle du MJ.', effectText: 'Décrit un signe, sans bonus.',
  provenance: source, restrictions: ['Aucun calcul automatique.'],
});
const clone = o => JSON.parse(JSON.stringify(o));
const cloneAttack = () => clone(fixtures.attaque_commune_pj_creature);
const bad = (obj, option = {}) => {
  const x = validateCatalogEntry(obj, option);
  assert.equal(x.ok, false, 'entrée invalide injustement acceptée');
  assert.ok(x.errors.length > 0);
  assert.equal(x.executable, false);
};

test('F00 — les cinq fixtures d’origine conservent exactement leurs octets/SHA256', () => {
  assert.equal(original.status, 'FICTIF_POUR_TEST_HORS_CANON');
  assert.equal(original.scenarios.length, 5);
  assert.equal(createHash('sha256').update(originalBytes).digest('hex'),
    '7396a5eaade764dd048c243ee1765d12ab22a473e88a4ebad15b6c08a1480a89');
});
test('F01 — attaque PJ/créature lisible en metadata inerte, jamais utilisable', () => {
  const r = validateCatalogEntry(fixtures.attaque_commune_pj_creature, {inertNumericMetadata: true});
  assert.equal(r.ok, true, r.errors.join(', ')); assert.equal(r.executable, false);
  const view = previewCatalogEntry(fixtures.attaque_commune_pj_creature);
  assert.equal(view.preview.status, CATALOG_UNAVAILABLE);
  assert.equal(view.preview.executable, false);
});
test('F02 — sort démo lisible en metadata inerte, version native séparée', () => {
  const e = fixtures.sort; const r = validateCatalogEntry(e, {inertNumericMetadata: true});
  assert.equal(r.ok, true, r.errors.join(', '));
  const native = createNativeReference(e);
  assert.equal(native.ok, true); assert.equal(native.reference.catalogVersion, '0.2.0');
  assert.equal(native.reference.sourceVersion, '1');
  assert.equal(native.reference.sourceId, 'demo-etincelle');
  assert.equal(native.reference.executable, false);
  assert.equal('approved' in native.reference, false);
});
test('F03 — rite lisible mais aucun effet numérique appliqué', () => {
  const r = validateCatalogEntry(fixtures.rite, {inertNumericMetadata: true});
  assert.equal(r.ok, true, r.errors.join(', ')); assert.equal(r.executable, false);
  assert.equal(previewCatalogEntry(fixtures.rite).preview.status, CATALOG_UNAVAILABLE);
});
test('F04 — anneau de stockage descriptif admissible sans chiffres', () => {
  const r = validateCatalogEntry(fixtures.objet_stockage_non_chiffre);
  assert.equal(r.ok, true, r.errors.join(', '));
  const p = previewCatalogEntry(r.entry);
  assert.equal(p.ok, true); assert.deepEqual(p.preview.effects,
    ['Conserve des souvenirs selon la fiction approuvée par le MJ ; capacité non chiffrée.']);
});
test('F05 — bague chiffrée bloquée même pour metadata inerte', () => {
  bad(fixtures.bague_effet_chiffre, {inertNumericMetadata: true});
  assert.equal(previewCatalogEntry(fixtures.bague_effet_chiffre).status, CATALOG_UNAVAILABLE);
});

test('C01 — une capacité descriptive peut être fabriquée/validée/prévisualisée', () => {
  const r = fresh(); assert.equal(r.ok, true, r.errors?.join('; '));
  assert.equal(r.entry.schema, CATALOG_SCHEMA);
  assert.equal(r.entry.id, 'cap:local:technique-signal-de-veille');
  assert.equal(r.entry.action.implementation, 'manual');
  assert.equal(r.executable, false); assert.equal(r.entry.effects[0].mode, 'descriptive');
  assert.equal(previewCatalogEntry(r.entry).preview.executable, false);
});
test('C02 — factory sort descriptive disponible pour ATELIERS', () => {
  const r = createDescriptiveSpell({name: 'Lueur fictive', provenance: source, effectText: 'Décrit une lueur.', restrictions: ['MJ.']});
  assert.equal(r.ok, true, r.errors?.join('; ')); assert.equal(r.entry.entryType, 'spell');
});
test('C03 — factory objet descriptif disponible pour ATELIERS', () => {
  const r = createDescriptiveItem({name: 'Bague de récit', provenance: source, effectText: 'Symbole sans effet.', restrictions: []});
  assert.equal(r.ok, true, r.errors?.join('; '));
  assert.equal(r.entry.entryType, 'item-effect');
  assert.equal(r.entry.action.kind, 'describe');
});
test('C04 — factory générique aptitude et namespace stabilisés à la création', () => {
  const r = createDescriptiveEntry({entryType: 'aptitude', name: 'Élan de conte', namespace: 'table01', provenance: source, effectText: 'Narration.', version: '1.0.0'});
  assert.equal(r.ok, true, r.errors?.join('; '));
  assert.equal(r.entry.id, 'cap:table01:aptitude-elan-de-conte');
  assert.equal(r.entry.version, '1.0.0');
  assert.equal(draftCatalogId('aptitude', 'Élan de conte', 'table01'), r.entry.id);
});
test('C05 — création non mutante et champs inconnus source conservés au privé seulement', () => {
  const before = clone(source); const r = fresh();
  assert.deepEqual(source, before);
  const raw = {schema: 'alrick.grimoire.v1', id: 'essai', version: 7, status: 'demo',
    extensions: {newField: {arbitrary: ['v1', {x: 14}], gmNotes: 'SENTINEL_SECRET'}},
    approvedByGM: true};
  const snap = createPrivateSnapshot(r.entry, raw);
  assert.equal(snap.ok, true, snap.errors?.join('; '));
  assert.equal(snap.snapshot.schema, CATALOG_PRIVATE_SNAPSHOT);
  assert.equal(snap.snapshot.originalVersion, 7);
  assert.equal(snap.snapshot.originalStatus, 'demo');
  assert.deepEqual(snap.snapshot.originalNativeSource, raw);
  assert.notStrictEqual(snap.snapshot.originalNativeSource, raw);
  const preview = previewCatalogEntry(r.entry);
  assert.equal(JSON.stringify(preview).includes('SENTINEL_SECRET'), false);
  assert.equal('originalNativeSource' in preview.preview, false);
});
test('C06 — une version native ne doit pas devenir version INDEX', () => {
  const native = createNativeReference(fixtures.sort);
  assert.equal(native.reference.catalogVersion, '0.2.0');
  assert.equal(native.reference.sourceVersion, '1');
});
test('C07 — source native non épinglée refusée pour création de ref', () => {
  const x = clone(fixtures.sort); x.provenance.sourceCommit = null;
  bad(x, {inertNumericMetadata: true});
  const r = createNativeReference(x); assert.equal(r.ok, false);
});
test('C08 — source illustrative ne devient jamais source native', () => {
  const r = createNativeReference(fixtures.objet_stockage_non_chiffre);
  assert.equal(r.ok, false);
});

test('V01 — mauvaise version du contrat rejetée', () => { const x = fresh().entry; x.schema = 'alrick.magic.v2'; bad(x); });
test('V02 — ID invalide rejeté', () => { const x = fresh().entry; x.id = '___'; bad(x); });
test('V03 — catégorie inconnue rejetée', () => { const x = fresh().entry; x.entryType = 'admin'; bad(x); });
test('V04 — version semver avec zéro initial rejetée', () => { const x = fresh().entry; x.version = '01.2.0'; bad(x); });
test('V05 — version prerelease avec zéro initial rejetée', () => { const x = fresh().entry; x.version = '1.2.3-01'; bad(x); });
test('V06 — provenance sans sourceId rejetée', () => { const x = fresh().entry; delete x.provenance.sourceId; bad(x); });
test('V07 — provenance avec originKind inconnu rejetée', () => { const x = fresh().entry; x.provenance.originKind = 'automatique'; bad(x); });
test('V08 — SHA Git invalide rejeté', () => { const x = fresh().entry; x.provenance.sourceCommit = 'abc'; bad(x); });
test('V09 — SHA256 invalide rejeté', () => { const x = fresh().entry; x.provenance.sourceHash = '1234'; bad(x); });
test('V10 — alias scope vide rejeté', () => { const x = fresh().entry; x.aliases = [{sourceSchema:'local',sourceId:'x',scope:''}]; bad(x); });
test('V11 — aliases dupliqués rejetés', () => { const x = fresh().entry; x.aliases = [{sourceSchema:'local',sourceId:'x',scope:'campagne-1'}, {sourceSchema:'local',sourceId:'x',scope:'campagne-1'}]; bad(x); });
test('V12 — collision ID+version dans registre rejetée', () => { const x = fresh().entry; assert.equal(validateCatalogRegistry([x,x]).ok, false); });
test('V13 — changement catégorie ID stable rejeté', () => { const x = fresh().entry; const y = clone(x); y.version='0.2.0'; y.entryType='spell'; assert.equal(validateCatalogRegistry([x,y]).ok, false); });
test('V14 — même ID en version suivante accepté (catégorie stable)', () => { const x = fresh().entry; const y = clone(x); y.version='0.2.0'; assert.equal(validateCatalogRegistry([x,y]).ok, true); });
test('V15 — collision alias deux identités refusée', () => {
  const x=fresh('Signal un').entry, y=fresh('Signal deux').entry;
  x.aliases=[{sourceSchema:'local',sourceId:'ancien',scope:'campagne-1'}]; y.aliases=clone(x.aliases);
  assert.equal(validateCatalogRegistry([x,y]).ok,false);
});
test('V16 — alias de même nom permis si scope différent', () => {
  const x=fresh('Signal un').entry, y=fresh('Signal deux').entry;
  x.aliases=[{sourceSchema:'local',sourceId:'ancien',scope:'campagne-1'}];
  y.aliases=[{sourceSchema:'local',sourceId:'ancien',scope:'campagne-2'}];
  assert.equal(validateCatalogRegistry([x,y]).ok,true);
});

test('N01 — magnitude M03 3 interdit y compris en metadata', () => { const x=cloneAttack(); x.effects[0].parameters.magnitude=3; bad(x,{inertNumericMetadata:true}); });
test('N02 — magnitude M03 2 est la borne supérieure admise en metadata', () => { const x=cloneAttack(); x.effects[0].parameters.magnitude=2; assert.equal(validateCatalogEntry(x,{inertNumericMetadata:true}).ok,true); });
test('N03 — magnitude M03 0 interdite', () => { const x=cloneAttack(); x.effects[0].parameters.magnitude=0; bad(x,{inertNumericMetadata:true}); });
test('N04 — durée M03 4 interdite', () => { const x=cloneAttack(); x.effects[0].parameters.duration=4; bad(x,{inertNumericMetadata:true}); });
test('N05 — trigger incompatible interdit', () => { const x=cloneAttack(); x.effects[0].parameters.trigger='defense'; bad(x,{inertNumericMetadata:true}); });
test('N06 — famille absorption interdite même si source validée', () => { const x=cloneAttack(); x.effects[0].family='combat.absorption'; x.effects[0].parameters.kind='absorption'; bad(x,{inertNumericMetadata:true}); });
test('N07 — sans opt-in metadata les effets numériques sont refusés', () => { bad(cloneAttack()); });
test('N08 — validateur source mensonger refusé', () => { const x=cloneAttack(); x.effects[0].authorization.validator='futureValidator'; bad(x,{inertNumericMetadata:true}); });
test('N09 — numeric item jamais homologué y compris si metadata true', () => { const x=cloneAttack(); x.entryType='item-effect'; bad(x,{inertNumericMetadata:true}); });
test('N10 — rite +2 interdit', () => { const x=clone(fixtures.rite); x.effects[1].parameters.magnitude=2; bad(x,{inertNumericMetadata:true}); });

test('A01 — not-applicable accompagné d’un montant est rejeté', () => {
  const x=fresh().entry; x.cost={mode:'not-applicable',amounts:[{resource:'mana',value:7,unit:'mana'}]}; bad(x);
});
test('A02 — unknown accompagné d’un montant est rejeté', () => { const x=fresh().entry; x.cost={mode:'unknown',amounts:[]}; bad(x); });
test('A03 — montant négatif rejeté', () => { const x=fresh().entry; x.cost={mode:'specified',amounts:[{resource:'mana',value:-1,unit:'mana'}]}; bad(x); });
test('A04 — mode native doit porter une référence', () => { const x=fresh().entry; x.cost={mode:'native'}; bad(x); });
test('A05 — une durée unknown ne peut cacher une valeur', () => { const x=fresh().entry; x.duration={mode:'unknown',value:50,unit:'round'}; bad(x); });
test('A06 — tentative approved:true dans unknown extensions rejetée', () => { const x=fresh().entry; x.extensions={future:{approved:true}}; bad(x); });
test('A07 — tentative approvedByGM dans le registre rejetée', () => { const x=fresh().entry; x.approvedByGM=true; bad(x); });
test('A08 — création descriptive refuse l’injection numérique', () => {
  const r=createDescriptiveSpell({name:'Essai',provenance:source,effects:[cloneAttack().effects[0]]}); assert.equal(r.ok,false);
});
test('A09 — création descriptive refuse une action mécanique', () => {
  const r=createDescriptiveItem({name:'Essai',provenance:source,effectText:'Décrit.',action:{kind:'activate-item',implementation:'m03'}}); assert.equal(r.ok,false);
});
test('A10 — création descriptive refuse une approbation forgée', () => {
  const r=createDescriptiveCapability({name:'Essai',provenance:source,effectText:'Décrit.',approved:true}); assert.equal(r.ok,false);
});
test('A11 — clé prototype empoisonnée rejetée sans pollution', () => {
  const x=JSON.parse('{"schema":"'+CATALOG_SCHEMA+'","__proto__":{"polluted":true}}'); bad(x);
  assert.equal(({}).polluted, undefined);
});
test('A12 — getter malveillant refusé sans exécution', () => {
  let called=false; const payload={entryType:'technique',name:'Essai',provenance:source};
  Object.defineProperty(payload,'description',{enumerable:true,get(){called=true;return 'evil';}});
  assert.equal(createDescriptiveEntry(payload).ok,false); assert.equal(called,false);
});
test('A13 — clone privé rejette les cycles', () => { const x={}; x.cycle=x; assert.throws(()=>clonePrivateJson(x)); });
test('A14 — source privée archivée sans mutation et sans normalisation Spell', () => {
  const r=createDescriptiveSpell({name:'Lueur',provenance:source,effectText:'Lueur descriptive.'});
  const raw={id:'demo-lueur',version:9,status:'canon_confirme',unsupportedFuture:{future:[7,8]},gmNotes:'SENTINEL_SECRET'};
  const s=createPrivateSnapshot(r.entry,raw);
  assert.equal(s.ok,true,s.errors?.join('; '));
  assert.equal(s.snapshot.originalVersion,9);
  assert.equal(s.snapshot.originalStatus,'canon_confirme');
  assert.deepEqual(s.snapshot.originalNativeSource.unsupportedFuture,{future:[7,8]});
  assert.equal(previewCatalogEntry(r.entry).preview.gmNotes,undefined);
});
test('A15 — snapshot privé refuse un objet non JSON', () => {
  const x={version:1,fn:()=>42}; assert.equal(createPrivateSnapshot(fresh().entry,x).ok,false);
});
test('A16 — preview ne publie jamais l’enveloppe source ou les extensions', () => {
  const x=fresh().entry; x.extensions={gmNotes:'SECRET_CANARY',legacyOriginal:{password:'TEST'}};
  const p=previewCatalogEntry(x);
  assert.equal(p.ok,true);assert.equal(JSON.stringify(p).includes('SECRET_CANARY'),false);
  assert.equal(JSON.stringify(p).includes('legacyOriginal'),false);
});
test('A17 — une définition validated ne donne pas la permission d’exécuter', () => {
  const x=fresh().entry; x.definitionState='validated';
  const r=validateCatalogEntry(x); assert.equal(r.ok,true);assert.equal(r.executable,false);
  assert.equal(previewCatalogEntry(x).preview.executable,false);
});
test('A18 — metadata authorized-in-source-only ne crée jamais approved:true', () => {
  const x=cloneAttack(); x.effects[0].authorization.status='authorized-in-source-only';
  const r=validateCatalogEntry(x,{inertNumericMetadata:true}); assert.equal(r.ok,true);
  assert.equal(r.executable,false);
  assert.equal('approved' in r.entry.effects[0],false);
});
