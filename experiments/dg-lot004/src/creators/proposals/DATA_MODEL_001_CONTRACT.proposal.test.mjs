import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inspectFixtureSet,contrastRatio} from './DATA_MODEL_001_VALIDATE.proposal.mjs';
const schema=JSON.parse(readFileSync(new URL('./DATA_MODEL_001_SCHEMA.proposal.json',import.meta.url),'utf8'));
const fixtures=JSON.parse(readFileSync(new URL('./DATA_MODEL_001_FIXTURES.proposal.json',import.meta.url),'utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
test('schéma et 14 fixtures cohérents structurellement, sans canon ni moteur forgé',()=>{
 const r=inspectFixtureSet(schema,fixtures);assert.equal(r.ok,true,JSON.stringify(r.issues));
 assert.equal(r.stats.count,14);assert.deepEqual(r.stats.pjLevels,[1,10,25]);
 assert.equal(r.stats.recordTypes.length,8);
});
test('champs inconnus conservés, et statut de canon ou joue détecté',()=>{
 const input=clone(fixtures);input.records[0].legacy.unknownFields.futur='non interprété';
 assert.equal(inspectFixtureSet(schema,input).ok,true);
 input.records[0].continuity.referenceStatus='canon';
 assert.equal(inspectFixtureSet(schema,input).issues.some(x=>x.code==='NOT_FICTIVE'),true);
});
test('version de source numérique conservée indépendamment du SemVer enveloppe',()=>{
 const input=clone(fixtures);input.records[0].provenance.sourceVersion=4;
 assert.equal(inspectFixtureSet(schema,input).ok,true);
 assert.equal(input.records[0].recordVersion,'0.1.0');
});
test('référence absente et collision ID refusées',()=>{
 const input=clone(fixtures);input.records[1].definitionRef='def:pj:manquant';
 assert.equal(inspectFixtureSet(schema,input).issues.some(x=>x.code==='MISSING_DEFINITION'),true);
 const duplicate=clone(fixtures);duplicate.records[2].recordId=duplicate.records[1].recordId;
 assert.equal(inspectFixtureSet(schema,duplicate).issues.some(x=>x.code==='DUPLICATE_ID'),true);
});
test('variante sans moteur natif, fuite de projection et media non autorisé refusés',()=>{
 const input=clone(fixtures);
 const variant=input.records.find(x=>x.nodeType==='variant');variant.variantChanges.mechanicPolicy='apply-now';
 assert.equal(inspectFixtureSet(schema,input).issues.some(x=>x.code==='BAD_VARIANT'),true);
 const item=input.records.find(x=>x.entityType==='item');item.privacy.publicFields.push('privacy.gmOnly');
 assert.equal(inspectFixtureSet(schema,input).issues.some(x=>x.code==='PUBLIC_LEAK'),true);
 item.media[0].audience='public-after-approval';
 assert.equal(inspectFixtureSet(schema,input).issues.some(x=>x.code==='MEDIA_PUBLIC_UNVERIFIED'),true);
});
test('contrastes proposés ardoise/cuivre/or calculés; aucune validation d’interface',()=>{
 const palette=[['#F4EFE5','#14212D',14.25],['#F4EFE5','#233347',11.19],['#14212D','#E4B179',8.44],['#14212D','#E9C56E',9.85],['#FFE299','#14212D',12.90]];
 for(const [a,b,minimum] of palette)assert.ok(contrastRatio(a,b)>=minimum);
});
