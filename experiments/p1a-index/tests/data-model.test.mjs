import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {validateModelRecord,validateModelDataset,exportPrivateDataset,importPrivateDataset,makeSelectedPlayerCandidate,clonePrivateJSON,DATA_MODEL_SCHEMA} from '../src/data-model.mjs';
import {proposeHistoricalReference,proposeNativeReference} from '../src/adapters.mjs';
const dir=dirname(fileURLToPath(import.meta.url));
const original=JSON.parse(readFileSync(resolve(dir,'../fixtures/P1A_FICTION_11_RECORDS.json'),'utf8'));
const copy=x=>structuredClone(x);
const code=x=>x.issues?.[0]?.code;
const fixture=(name)=>copy(original.find(x=>x.recordId===`rec:demo:${name}`));
test('jeu fictif: 11 objets et catégories explicites',()=>{
 assert.equal(original.length,11);
 const counts=original.reduce((a,x)=>(a[x.recordKind]=(a[x.recordKind]||0)+1,a),{});
 assert.deepEqual(counts,{pj:3,creature:2,npc:1,item:1,ability:1,'spell-ref':1,'ritual-ref':1,scene:1});
});
test('tous les objets correspondent au contrat proposé',()=>{
 assert.equal(validateModelDataset(original).ok,true,JSON.stringify(validateModelDataset(original).issues));
 original.forEach(x=>assert.equal(validateModelRecord(x).ok,true,x.recordId));
});
for(const level of [1,10,25])test('PJ N'+level+' accepté sans progression calculée',()=>{
 const v=original.find(x=>x.recordKind==='pj'&&x.data.level===level);
 assert.ok(v);assert.equal(validateModelRecord(v).ok,true);
 assert.equal(v.mechanics.status,'not-evaluated');
});
test('créature + variante: même définition, instances distinctes',()=>{
 const base=fixture('creature-base'),alt=fixture('creature-variant');
 assert.equal(base.identity.definitionId,alt.identity.definitionId);
 assert.notEqual(base.identity.instanceId,alt.identity.instanceId);
 assert.equal(alt.identity.variantId,'var:demo:crete');
});
test('PNJ narratif sans niveau explicite est valide',()=>{
 const npc=fixture('npc');assert.equal(Object.hasOwn(npc.data,'level'),false);
 assert.equal(validateModelRecord(npc).ok,true);
});
test('niveau 26 rejeté sans interpréter M01',()=>{
 const f=fixture('pj-n25');f.data.level=26;
 assert.equal(code(validateModelRecord(f)),'LEVEL_OUT_OF_RANGE');
});
test('absence niveau 0 ou décimal',()=>{
 for(const n of [0,-1,2.5]){const f=fixture('pj-n1');f.data.level=n;assert.equal(code(validateModelRecord(f)),'LEVEL_OUT_OF_RANGE');}
});
test('ID ARCHIVES natif avec : accepté à l’identique',()=>{
 const f=fixture('pj-n1');f.identity.instanceId='pj:l004-hero-fiction';
 const x=validateModelRecord(f);assert.equal(x.ok,true);
 assert.equal(x.value.identity.instanceId,'pj:l004-hero-fiction');
});
test('IDs sans alias : et - restent différents',()=>{
 const a=fixture('pj-n1'),b=fixture('pj-n10');
 a.identity.instanceId='pj:l004-hero-fiction';b.identity.instanceId='pj-l004-hero-fiction';
 assert.equal(validateModelDataset([a,b]).ok,true);
});
test('instance native invalide rejetée sur chemin structuré',()=>{
 const f=fixture('pj-n1');f.identity.instanceId='pj:␀bad';
 const r=validateModelRecord(f);assert.equal(r.ok,false);
 assert.equal(r.issues[0].path,'identity.instanceId');
 assert.equal(r.issues[0].code,'INVALID_NATIVE_ID');
});
test('collision instance campagne même avec IDs documentaires différents',()=>{
 const a=fixture('pj-n1'),b=fixture('pj-n10');b.identity.instanceId=a.identity.instanceId;
 assert.equal(code(validateModelDataset([a,b])),'DUPLICATE_INSTANCE');
});
test('collision recordId interversions dans un seul snapshot',()=>{
 const a=fixture('item'),b=fixture('item');b.version='0.2.0';
 assert.equal(code(validateModelDataset([a,b])),'DUPLICATE_RECORD');
});
test('variante ne devient pas automatiquement canon',()=>{
 const f=fixture('creature-variant');assert.equal(f.state.layer,'proposal');
 assert.equal(f.state.attestation.status,'unverified');
});
test('statut joué/canon sans preuve refuse',()=>{
 for(const layer of ['played','canon-reference']){
  const f=fixture('scene');f.state.layer=layer;
  const r=validateModelRecord(f);
  assert.equal(code(r),'ATTESTATION_REQUIRED');
 }
});
test('une attestation déclarée n’est pas vérification cryptographique',()=>{
 const f=fixture('scene');f.state.layer='played';
 f.state.attestation={status:'externally-attested',evidenceRefs:['CB:FAKE']};
 assert.equal(validateModelRecord(f).ok,true);
 // Structural validation must never be interpreted as an assertion that CB:FAKE exists.
});
test('approved/autoApply/creditXp ne passent pas même imbriqués',()=>{
 for(const [field,value] of [['approved',true],['autoApply',true],['creditXp',100]]){
  const f=fixture('item');f.data.preview={[field]:value};
  assert.equal(code(validateModelRecord(f)),'AUTHORITY_FORBIDDEN');
 }
});
test('inconnus dans original privé sont conservés sans exécution',()=>{
 const f=fixture('item');f.privacy.legacyOriginal.someUnknown={version:14,approved:true,'x-tester':'keep'};
 const r=validateModelRecord(f);assert.equal(r.ok,true);
 assert.deepEqual(JSON.parse(JSON.stringify(r.value.privacy.legacyOriginal.someUnknown)),f.privacy.legacyOriginal.someUnknown);
});
test('méta provenance non épinglée refusée pour source historique',()=>{
 const f=fixture('item');f.provenance={origin:'historical-reference',sourceSchema:'quartz.md',sourceId:'DOC-1'};
 assert.equal(code(validateModelRecord(f)),'UNPINNED_SOURCE');
});
test('empreinte commit et blob native sont distinctes',()=>{
 const f=fixture('spell');assert.notEqual(f.provenance.sourceCommit,f.provenance.sourceBlob);
 assert.equal(f.provenance.sourceId,'demo-lueur-guide');
});
test('médias non autorisés sans droits confirmés',()=>{
 const f=fixture('item');const r=makeSelectedPlayerCandidate(f,{selected:true});
 assert.equal(r.ok,true);assert.deepEqual(r.candidate.media,[]);
});
test('sélection explicite obligatoire pour candidat joueur',()=>{
 const f=fixture('item');assert.equal(code(makeSelectedPlayerCandidate(f)),'EXPLICIT_SELECTION_REQUIRED');
});
test('projection candidate à liste blanche, aucune donnée privée ni provenance',()=>{
 const r=makeSelectedPlayerCandidate(fixture('scene'),{selected:true});
 assert.equal(r.ok,true);assert.equal(r.requiresStudioWhitelist,true);
 const json=JSON.stringify(r);
 for(const secret of ['SCENE_PRIVATE_FICTIVE_CANARY','LAB_PRIVATE_FICTIF_P1A','legacyOriginal','sourceBlob','participants','provenance'])
 assert.equal(json.includes(secret),false,secret);
});
test('roundtrip import/export JSON, ext inconnues et version exacte',()=>{
 const originalCopy=copy(original);const e=exportPrivateDataset(original);assert.equal(e.ok,true);
 const i=importPrivateDataset(e.json);assert.equal(i.ok,true);
 assert.deepEqual(JSON.parse(JSON.stringify(i.value)),originalCopy);
 assert.equal(exportPrivateDataset(i.value).json,e.json);
 assert.deepEqual(original,originalCopy);
});
test('export privé ne publie ni ne modifie des fiches',()=>{
 const x=exportPrivateDataset(original);assert.equal(x.ok,true);
 assert.equal(JSON.parse(x.json).privacy,'mj-private');
 assert.ok(!JSON.parse(x.json).published);
});
test('package privé inconnu rejeté',()=>{
 const r=importPrivateDataset(JSON.stringify({kind:'another',records:[]}));
 assert.equal(code(r),'UNKNOWN_PACKAGE');
});
test('JSON non valide refusé',()=>{
 assert.equal(code(importPrivateDataset('{broken')),'INVALID_JSON');
});
test('prototype pollution refusée même en zone privée',()=>{
 const bad=JSON.parse('{"__proto__":{"hack":1}}');
 assert.throws(()=>clonePrivateJSON(bad));
});
test('getter, classe, cycle et fonction refusés',()=>{
 assert.throws(()=>clonePrivateJSON({a:()=>1}));
 assert.throws(()=>clonePrivateJSON({get a(){return 'secret'}}));
 assert.throws(()=>clonePrivateJSON(new Date()));
 const z={};z.self=z;assert.throws(()=>clonePrivateJSON(z));
});
test('participant renvoyant à un autre ID est refusé',()=>{
 const all=copy(original),scene=all.find(x=>x.recordKind==='scene');
 scene.data.participants[0].instanceId='pj:invented';
 assert.equal(code(validateModelDataset(all)),'UNRESOLVED_PARTICIPANT');
});
test('participant dupliqué refusé sans effectuer transaction',()=>{
 const all=copy(original),scene=all.find(x=>x.recordKind==='scene');
 scene.data.participants.push(copy(scene.data.participants[0]));
 assert.equal(code(validateModelDataset(all)),'DUPLICATE_PARTICIPANT');
});
test('adaptateur historique garde tout Markdown et classe canon en proposition',()=>{
 const raw='---\ncanon_statut: lore_valide\n---\nTEST\nINCONNU: 42\n';
 const f=proposeHistoricalReference({recordKind:'npc',recordId:'rec:fake:hist',definitionId:'def:fake:hist',
   path:'content/personnages/FAKE.md',commit:'a'.repeat(40),blob:'b'.repeat(40),
   frontmatter:{title:'Ancien fictif',description:'Archive de test',code:'FAKE-01',canon_statut:'lore_valide',champInconnu:{abc:1}},originalMarkdown:raw});
 assert.equal(f.ok,true,JSON.stringify(f.issues));
 assert.equal(f.value.state.layer,'proposal');
 assert.equal(f.value.privacy.originalSource.text,raw);
 assert.equal(f.value.privacy.originalSource.frontmatter.champInconnu.abc,1);
 assert.ok(f.fieldClassification.obsolete.length);
});
test('adaptateur natif conserve source brute et n’autorise aucun effet',()=>{
 const x=proposeNativeReference({recordKind:'spell-ref',recordId:'rec:demo:spell-adapt',definitionId:'def:demo:spell-adapt',
  sourceSchema:'alrick.grimoire.v1',sourceId:'demo-lueur-guide',sourceVersion:1,sourceCommit:'a'.repeat(40),sourceBlob:'b'.repeat(40),
  nativeModule:'atelier5d6-grimoire.ts',name:'Sort fictif',originalJson:{version:1,more:{approvedByGM:true,x:4}}});
 assert.equal(x.ok,true,JSON.stringify(x.issues));
 assert.equal(x.value.mechanics.status,'native-reference');
 assert.equal(x.value.privacy.nativeOriginal.more.approvedByGM,true);
 assert.equal(x.value.state.layer,'proposal');
});
test('adaptateur historique refuse SHA non épinglé',()=>{
 const x=proposeHistoricalReference({recordKind:'npc',recordId:'rec:demo:bad',definitionId:'def:demo:bad',path:'FAKE.md',
  commit:'notsha',blob:'b'.repeat(40),frontmatter:{title:'Fictif'},originalMarkdown:'text'});
 assert.equal(code(x),'UNPINNED_SOURCE');
});
test('schema de l’enveloppe reste versionné en propre',()=>{
 assert.equal(original[0].schema,DATA_MODEL_SCHEMA);
 assert.notEqual(original[0].schema,original[0].provenance.sourceSchema);
});
test('variante sans origine liée refusée',()=>{
 const all=copy(original),variant=all.find(x=>x.recordId==='rec:demo:creature-variant');
 variant.data.variantOf='rec:demo:missing';
 assert.equal(code(validateModelDataset(all)),'UNRESOLVED_VARIANT');
});
test('collision de variantId dans une même définition refusée',()=>{
 const all=copy(original);const v=copy(all.find(x=>x.recordId==='rec:demo:creature-variant'));
 v.recordId='rec:demo:creature-variant2';v.identity.instanceId='creature:demo:variant2';
 all.push(v);
 assert.equal(code(validateModelDataset(all)),'DUPLICATE_VARIANT');
});
test('mention de validation externe ne crée pas une règle exécutable',()=>{
 const f=fixture('ability');f.mechanics.validationStatus='reported-validated';
 const v=validateModelRecord(f);assert.equal(v.ok,true);assert.equal(v.executable,false);
 assert.equal(f.mechanics.status,'not-evaluated');
});

test('flûte narrative ne crée aucun malus ou décompte de charge',()=>{
 const f=fixture('item');const r=validateModelRecord(f);assert.equal(r.ok,true);
 assert.equal(r.executable,false);assert.equal(Object.hasOwn(r.value.data,'numericEffect'),false);
 assert.equal(Object.hasOwn(r.value.data,'malus'),false);
});
test('PNJ participant ne reçoit pas de crédit XP implicite',()=>{
 const npc=fixture('npc');assert.equal(npc.recordKind,'npc');
 assert.equal(Object.hasOwn(npc.data,'xp'),false);
 const r=validateModelRecord(npc);assert.equal(r.ok,true);assert.equal(r.executable,false);
});
