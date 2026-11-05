import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {
  XP_SUGGESTION_SCHEMA, DESCRIPTIVE_CHAIN_SCHEMA, PRIVATE_CHAIN_SNAPSHOT_SCHEMA,
  LEVEL_REFERENCE, READONLY_NOTICE, createXpSuggestion, validateXpSuggestion,
  correctXpSuggestion, validateXpRegistry, previewXpSuggestion,previewLevelMatrix,
  createDescriptiveChain,validateDescriptiveChain,createPrivateChainSnapshot,
  validatePrivateChainSnapshot,previewDescriptiveChain,validateDescriptiveCatalogReference,
} from '../../src/catalog/index.mjs';
import {createDescriptiveItem,createDescriptiveCapability} from '../../../dg-lot003/src/catalog/index.mjs';

const deep = x => structuredClone(x);
const provenance = {originKind:'illustrative',sourceSchema:'fictive.dg004',sourceId:'fixture-flute',sourceVersion:'v.2-alpha',creator:'MJ fictif'};
const xpInput = () => ({namespace:'demo',version:'0.1.0',
  target:{campaignId:'camp-a',characterInstanceId:'pj-a'},
  event:{id:'evt-a',pattern:'enquete-brume',domain:'savoir',difficulty:3,scope:'ordinaire'},
  context:{initialLevel:5,oneShot:{id:'os-1',runId:'run-01'}},provenance:deep(provenance),
  rationale:'Découverte fictive, suggestion seulement'});
const created = () => createXpSuggestion(xpInput());
const validXp = () => {const r=created();assert.equal(r.ok,true,JSON.stringify(r.errors));return r.suggestion;};
const pass = r => assert.equal(r.ok,true,JSON.stringify(r.errors));
const fails = (r,re) => {assert.equal(r.ok,false,'devrait refuser');assert.match(JSON.stringify(r.errors),re);};
const makeChain = () => {
  const object=createDescriptiveItem({name:'Flûte de la brume',description:'La mélodie trouble les souvenirs : aucun malus chiffré.',
    provenance,restrictions:['Aucun malus numérique automatique']});pass(object);
  const ability=createDescriptiveCapability({name:'Mélodie incertaine',description:'Une histoire sonore sans modificateur.',
    provenance,restrictions:['Approbation MJ pour l’histoire uniquement']});pass(ability);
  const item=object.entry,cap=ability.entry;
  const input={id:'chain:demo:flute-creature-scene',version:'0.1.0',campaignId:'camp-a',provenance:deep(provenance),
    links:[
      {kind:'item',source:{id:item.id,version:item.version,schema:item.schema,status:item.definitionState,provenance:deep(provenance)},instance:{id:'it-1',campaignId:'camp-a'},status:'proposed'},
      {kind:'capability',source:{id:cap.id,version:cap.version,schema:cap.schema,status:cap.definitionState,provenance:deep(provenance)},status:'proposed'},
      {kind:'creature',source:{id:'fict-creature',version:'v.1',schema:'alrick.bestiary.v1',status:'brouillon',profileId:'profile-n5',ruleset:'m03',documentCode:'FICT-001',provenance:deep(provenance)},instance:{id:'cr-1',campaignId:'camp-a'},status:'proposed'},
      {kind:'scene',source:{id:'fict-scene',version:'1.0.0',schema:'cer.studio.dg003.provisional.v0',status:'brouillon',provenance:deep(provenance)},instance:{id:'sc-1',campaignId:'camp-a'},status:'proposed'},
    ]};
  return {input,item,cap};
};
const rawSources=()=>({
 item:{id:'fict-object',version:'original-3',customUnknown:{shape:'hexagonal'},secretMJ:'SENTINEL-MJ-FLUTE',quantity:1},
 capability:{id:'fict-cap',version:'0.1.0',description:'Sans malus chiffré',arbitrary:['x',14]},
 creature:{id:'fict-cr',level:5,stats:{physique:14},status:'jeu_valide',other:{unknown:true}},
 scene:{id:'fict-sc',privateNotes:'SENTINEL-SCENE-NE-JAMAIS-PUBLIER',status:'brouillon',revision:9},
});

test('XP01 schema et création inerte',()=>{const r=created();pass(r);assert.equal(r.suggestion.schema,XP_SUGGESTION_SCHEMA);assert.equal(r.executable,false);assert.equal('amount' in r.suggestion,false);});
test('XP02 identité stable et idempotence déterministe',()=>{const a=validXp(),b=validXp();assert.deepEqual(a,b);assert.match(a.idempotencyKey,/run-01/);});
test('XP03 isolation des entrées originales',()=>{const x=xpInput(),r=createXpSuggestion(x);pass(r);x.event.difficulty=12;assert.equal(r.suggestion.event.difficulty,3);});
test('XP04 niveau initial 1 accepté',()=>{const x=xpInput();x.context.initialLevel=1;pass(createXpSuggestion(x));});
test('XP05 niveau initial 25 accepté',()=>{const x=xpInput();x.context.initialLevel=25;pass(createXpSuggestion(x));});
test('XP06 niveau initial 0 refusé',()=>{const x=xpInput();x.context.initialLevel=0;fails(createXpSuggestion(x),/initialLevel/);});
test('XP07 niveau initial 26 refusé',()=>{const x=xpInput();x.context.initialLevel=26;fails(createXpSuggestion(x),/initialLevel/);});
test('XP08 difficulté 1 acceptée',()=>{const x=xpInput();x.event.difficulty=1;pass(createXpSuggestion(x));});
test('XP09 difficulté 12 acceptée',()=>{const x=xpInput();x.event.difficulty=12;pass(createXpSuggestion(x));});
test('XP10 difficulté 0 refusée',()=>{const x=xpInput();x.event.difficulty=0;fails(createXpSuggestion(x),/difficulty/);});
test('XP11 difficulté 13 refusée',()=>{const x=xpInput();x.event.difficulty=13;fails(createXpSuggestion(x),/difficulty/);});
test('XP12 domaine M01 inconnu refusé',()=>{const x=xpInput();x.event.domain='inconnu';fails(createXpSuggestion(x),/event/);});
test('XP13 statut version et provenance invalides refusés',()=>{for(const edit of [x=>x.version='1',x=>x.provenance.originKind='native',x=>x.status='validated']){const x=xpInput();edit(x);fails(createXpSuggestion(x),/version|sourceCommit|status/);}});
test('XP14 approved:true injection refusée',()=>{const x=xpInput();x.event.approved=true;fails(createXpSuggestion(x),/approved/);});
test('XP15 injection XP explicite refusée',()=>{for(const key of ['awardedXp','suggestedXp','grantedXp']){const x=xpInput();x[key]=999;fails(createXpSuggestion(x),/input|Xp/);}});
test('XP16 attack payload et getter JS refusés',()=>{const x=xpInput();Object.defineProperty(x,'rationale',{get(){throw Error('executed')},enumerable:true});fails(createXpSuggestion(x),/Accesseur|JSON/);});
test('XP17 prototypes hostiles refusés',()=>{const x=xpInput();x.event=Object.create({id:'hidden'});fails(createXpSuggestion(x),/Prototype|event/);});
test('XP18 no provider no invented XP',()=>{const r=previewXpSuggestion(validXp());fails(r,/port M01/);assert.equal('candidateXp' in r,false);});
test('XP19 pas d’historique implicite',()=>{fails(previewXpSuggestion(validXp(),{experienceAward:()=>999}),/historique/);});
test('XP20 prévisualisation pure avec port injecté (stub non attesté)',()=>{const history=[];const calls=[];const r=previewXpSuggestion(validXp(),{history,experienceAward:(ev,h)=>{calls.push(deep(ev));assert.deepEqual(h,[]);return 60;}});pass(r);assert.equal(r.candidateXp,60);assert.equal(r.source,'delegated-M01-not-attested');assert.equal(r.awardCommitted,false);assert.equal(r.levelValidated,false);assert.equal(calls[0].approved,false);assert.deepEqual(history,[]);});
test('XP21 résultat de port invalide bloqué',()=>{fails(previewXpSuggestion(validXp(),{history:[],experienceAward:()=>-3}),/M01/);});
test('XP22 majeur jamais approuvé par INDEX',()=>{const x=xpInput();x.event.scope='majeur';const s=createXpSuggestion(x);pass(s);let called=false;const r=previewXpSuggestion(s.suggestion,{history:[],experienceAward:()=>{called=true;return 180}});fails(r,/validation MJ/);assert.equal(called,false);});
test('XP23 légendaire jamais approuvé par INDEX',()=>{const x=xpInput();x.event.scope='legendaire';const s=createXpSuggestion(x);pass(s);fails(previewXpSuggestion(s.suggestion),/validation MJ/);});
test('XP24 correction avance version et audit, sans mutation',()=>{const a=validXp(),b=correctXpSuggestion(a,{event:{...a.event,difficulty:4},rationale:'Correction du périmètre',reason:'Indice initial erroné'});pass(b);assert.equal(b.suggestion.version,'0.1.1');assert.equal(b.suggestion.revision,2);assert.equal(b.suggestion.idempotencyKey,a.idempotencyKey);assert.equal(b.suggestion.correctionOf.version,'0.1.0');assert.equal(a.event.difficulty,3);pass(validateXpRegistry([a,b.suggestion]));});
test('XP25 correction semver non croissant refusée',()=>{const a=validXp();fails(correctXpSuggestion(a,{version:'0.1.0',reason:'Raison'}),/version/);});
test('XP26 changement événement lors correction refusé',()=>{const a=validXp();fails(correctXpSuggestion(a,{event:{...a.event,id:'evt-b'},reason:'Raison'}),/event.id/);});
test('XP27 changement one-shot run lors correction refusé',()=>{const a=validXp();fails(correctXpSuggestion(a,{context:{...a.context,oneShot:{id:'os-1',runId:'run-02'}},reason:'Raison'}),/oneShot/);});
test('XP28 correction de one-shot conserve run',()=>{const a=validXp();pass(correctXpSuggestion(a,{context:{...a.context,initialLevel:10},reason:'Niveau initial précisé'}));});
test('XP29 révision sans parent non valide',()=>{const a=validXp();a.revision=2;fails(validateXpSuggestion(a),/correctionOf/);});
test('XP30 registre collision id-version',()=>{const a=validXp();fails(validateXpRegistry([a,a]),/déjà présents/);});
test('XP31 registre idempotence entre ID divers',()=>{const a=validXp(),b={...deep(a),id:'xp:demo:autre-id'};fails(validateXpRegistry([a,b]),/idempotence/);});
test('XP32 registre correction orpheline',()=>{const a=validXp(),b=correctXpSuggestion(a,{reason:'Erreur'});pass(b);fails(validateXpRegistry([b.suggestion]),/correction/);});
test('XP33 runs de one-shot distincts à identité distincte',()=>{const a=xpInput(),b=xpInput();b.context.oneShot.runId='run-02';const r1=createXpSuggestion(a),r2=createXpSuggestion(b);pass(r1);pass(r2);assert.notEqual(r1.suggestion.id,r2.suggestion.id);assert.notEqual(r1.suggestion.idempotencyKey,r2.suggestion.idempotencyKey);pass(validateXpRegistry([r1.suggestion,r2.suggestion]));});
test('XP34 retrait définitif',()=>{const a=validXp(),b=correctXpSuggestion(a,{status:'withdrawn',reason:'Annulation MJ'});pass(b);fails(previewXpSuggestion(b.suggestion),/retirée/);fails(correctXpSuggestion(b.suggestion,{reason:'Restaurer'}),/retirée/);});
test('M01-PORT1 matrice indisponible sans MATH',()=>{fails(previewLevelMatrix(),/M01/);});
test('M01-PORT2 niveau et résultat M01 restitués sans calcul ajouté (stub)',()=>{const rows=LEVEL_REFERENCE.map((level,i)=>({level,experience:i*100,development:i*12}));const out=previewLevelMatrix({progressionAtLevel:(n)=>deep(rows[LEVEL_REFERENCE.indexOf(n)])});pass(out);assert.deepEqual(out.rows,rows);assert.equal(out.levelValidated,false);});
test('M01-PORT3 niveaux de la matrice imposés',()=>{fails(previewLevelMatrix({progressionAtLevel:()=>({level:1,experience:0,development:0}),levels:[1,2,3,4,5,6]}),/référence/);});
test('M01-PORT4 délégataire incohérent refusé',()=>{fails(previewLevelMatrix({progressionAtLevel:()=>({level:9,experience:0,development:0})}),/niveau/);});
test('CHAIN01 création des 4 références et statuts',()=>{const {input}=makeChain(),r=createDescriptiveChain(input);pass(r);assert.equal(r.chain.schema,DESCRIPTIVE_CHAIN_SCHEMA);assert.equal(r.chain.links.length,4);assert.deepEqual(r.chain.links.map(x=>x.kind),['item','capability','creature','scene']);assert.equal(r.executable,false);});
test('CHAIN02 validation non mutante',()=>{const {input}=makeChain(),before=deep(input);pass(createDescriptiveChain(input));assert.deepEqual(input,before);});
test('CHAIN03 relations seulement descriptives',()=>{const {input}=makeChain();input.relations=[{from:'item',to:'capability',type:'grants-m03'}, {from:'capability',to:'creature',type:'referenced-by'},{from:'creature',to:'scene',type:'staged-in'}];fails(createDescriptiveChain(input),/relations/);});
test('CHAIN04 source et instance restent distincts',()=>{const {input}=makeChain();input.links[0].instance.id=input.links[0].source.id;fails(createDescriptiveChain(input),/instance/);});
test('CHAIN05 collision de deux instances',()=>{const {input}=makeChain();input.links[2].instance.id=input.links[0].instance.id;fails(createDescriptiveChain(input),/collision/);});
test('CHAIN06 campagne inter-tenant refusée',()=>{const {input}=makeChain();input.links[3].instance.campaignId='another-campaign';fails(createDescriptiveChain(input),/instance/);});
test('CHAIN07 capacité doit être une identité catalogue',()=>{const {input}=makeChain();input.links[1].source.id='sort-non-id';fails(createDescriptiveChain(input),/INDEX/);});
test('CHAIN08 créature sans profil/ruleset refusée',()=>{const {input}=makeChain();delete input.links[2].source.profileId;fails(createDescriptiveChain(input),/profil/);});
test('CHAIN09 magnitude et objets numériques refusés',()=>{const {input}=makeChain();input.links[0].magnitude=3;fails(createDescriptiveChain(input),/magnitude|champ/);});
test('CHAIN10 approved:true forgé refusé',()=>{const {input}=makeChain();input.links[2].approvedByGM=true;fails(createDescriptiveChain(input),/approved/);});
test('CHAIN11 origine native sans SHA Git refusée',()=>{const {input}=makeChain();input.links[0].source.provenance.originKind='native';fails(createDescriptiveChain(input),/sourceCommit/);});
test('CHAIN12 version invalide refusée',()=>{const {input}=makeChain();input.version='vbad';fails(createDescriptiveChain(input),/SemVer/);});
test('CHAIN13 les deux fiches L003 sont valides et descriptives',()=>{const {item,cap}=makeChain();pass(validateDescriptiveCatalogReference(item));pass(validateDescriptiveCatalogReference(cap));});
test('CHAIN14 refus des entrées sort/attaque chiffrée',()=>{const {item}=makeChain();const x=deep(item);x.effects=[{mode:'numeric',kind:'m03.impact',magnitude:1}];fails(validateDescriptiveCatalogReference(x),/effet|chiffrée|numeric/);});
test('CHAIN15 snapshot privé roundtrip et inconnus intacts',()=>{const {input}=makeChain(),ch=createDescriptiveChain(input);pass(ch);const raw=rawSources(),b=createPrivateChainSnapshot(ch.chain,raw);pass(b);assert.equal(b.snapshot.schema,PRIVATE_CHAIN_SNAPSHOT_SCHEMA);assert.equal(b.snapshot.visibility,'mj-private-only');assert.equal(b.snapshot.originalSources.item.customUnknown.shape,'hexagonal');const restored=validatePrivateChainSnapshot(JSON.parse(JSON.stringify(b.snapshot)));pass(restored);assert.deepEqual(restored.snapshot.originalSources,raw);assert.equal(restored.snapshot.originalSources.creature.stats.physique,14);});
test('CHAIN16 mutation de source après snapshot impossible',()=>{const {input}=makeChain(),r=createDescriptiveChain(input),raw=rawSources();pass(r);const s=createPrivateChainSnapshot(r.chain,raw);pass(s);raw.item.secretMJ='CHANGED';assert.equal(s.snapshot.originalSources.item.secretMJ,'SENTINEL-MJ-FLUTE');});
test('CHAIN17 export de preview MJ sans canaris privés',()=>{const {input}=makeChain(),r=createDescriptiveChain(input),s=createPrivateChainSnapshot(r.chain,rawSources());pass(r);pass(s);const p=previewDescriptiveChain(s.snapshot.chain);pass(p);assert.equal(p.preview.kind,'mj-private-preview');assert.equal(p.preview.requiresGMReview,true);assert.equal(p.preview.executable,false);assert.doesNotMatch(JSON.stringify(p.preview),/SENTINEL|privateNotes|originalSources|approved:true/);});
test('CHAIN18 flûte narrative sans malus numérique automatique',()=>{const {input}=makeChain(),r=createDescriptiveChain(input);pass(r);const p=previewDescriptiveChain(r.chain);pass(p);assert.equal('damage' in p.preview,false);assert.equal('magnitude' in p.preview,false);assert.equal(p.preview.notice,READONLY_NOTICE);});
test('CHAIN19 bad snapshot public refusé',()=>{const {input}=makeChain(),c=createDescriptiveChain(input),s=createPrivateChainSnapshot(c.chain,rawSources());pass(c);pass(s);s.snapshot.visibility='player';fails(validatePrivateChainSnapshot(s.snapshot),/privée/);});
test('CHAIN20 raw sources manquantes refusées',()=>{const {input}=makeChain(),c=createDescriptiveChain(input);pass(c);fails(createPrivateChainSnapshot(c.chain,{item:{}}),/nativeSources/);});
test('CHAIN21 prototype pollution refusée',()=>{const {input}=makeChain();const raw={...rawSources(),item:JSON.parse('{"__proto__":{"polluted":true}}')};const c=createDescriptiveChain(input);pass(c);fails(createPrivateChainSnapshot(c.chain,raw),/interdite/);assert.equal({}.polluted,undefined);});
test('CHAIN22 JSON accessors refusés',()=>{const {input}=makeChain();Object.defineProperty(input.links[0].source,'id',{get(){throw Error('getter invoked')},enumerable:true});fails(createDescriptiveChain(input),/Accesseur/);});
test('CHAIN23 source statut reste documentaire, ne devient pas approbation',()=>{const {input}=makeChain();input.links[2].source.status='jeu_valide';const c=createDescriptiveChain(input);pass(c);assert.equal(c.chain.status,'proposed');assert.equal(c.chain.links[2].source.status,'jeu_valide');assert.equal(c.executable,false);});
test('CHAIN24 source inconnue conservée dans snapshot et jamais au preview',()=>{const {input}=makeChain(),c=createDescriptiveChain(input),raw=rawSources();pass(c);raw.item.extensions={surprise:'inconnu'};const s=createPrivateChainSnapshot(c.chain,raw);pass(s);assert.deepEqual(s.snapshot.originalSources.item.extensions,{surprise:'inconnu'});const p=previewDescriptiveChain(c.chain);pass(p);assert.doesNotMatch(JSON.stringify(p),/surprise/);});
test('SOURCE-01 fixtures L003 originales intègres',()=>{const bytes=readFileSync(new URL('../../../dg-lot003/tests/catalog/fixtures-v02-original.json',import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),'7396a5eaade764dd048c243ee1765d12ab22a473e88a4ebad15b6c08a1480a89');});
test('SOURCE-02 module L003 réutilisé sans modification',()=>{const bytes=readFileSync(new URL('../../../dg-lot003/src/catalog/index.mjs',import.meta.url));const data=Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes]);assert.equal(createHash('sha1').update(data).digest('hex'),'6c35e0da2c56a51dea9bce37b9cdc60cd2c75de5');});
