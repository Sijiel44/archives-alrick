import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  createXpSuggestion, validateXpSuggestion, validateXpRegistry, correctXpSuggestion,
  previewXpSuggestion, createXpMathJournalReference,
  XP_JOURNAL_REFERENCE_SCHEMA, MATH_ENCOUNTER_SCHEMA,
} from '../../src/catalog/index.mjs';

const clone=x=>structuredClone(x);
const base=()=>({namespace:'demo',version:'0.1.0',
  target:{campaignId:'camp-a',characterInstanceId:'pj:l004-hero-fiction'},
  event:{id:'evt-a',pattern:'pacifique',domain:'diplomatie',difficulty:6,scope:'ordinaire'},
  context:{initialLevel:5,oneShot:{id:'fic-1',runId:'run-01'}},
  provenance:{originKind:'illustrative',sourceSchema:'dg004.test.fixtures',sourceId:'scene-1',sourceVersion:'v1'},
  rationale:'Fiction, résolution sans tuer. Aucune attribution automatique.'});
const context=()=>({kind:'encounter',accomplishmentId:'boss-et-quete-1',runId:'run-01',eventStatus:'observed',
  sourceSceneId:'sc-1',
  participants:[{instanceId:'pj:l004-hero-fiction',role:'pj',level:5,contributionNote:'Négociation réelle'},
    {instanceId:'pj:allie',role:'pj',level:10},
    {instanceId:'pnj:mentor',role:'pnj',level:20,contributionNote:'Aide décisive'}],
  selectedPjIds:['pj:l004-hero-fiction','pj:allie'],
  threats:[{instanceId:'boss-1',level:15,count:1,boss:true,dangerNote:'Danger réel attesté'}],
  assistance:{level:'decisive',npcIds:['pnj:mentor'],reason:'Le mentor N20 a protégé les PJ'},
  difficultyBeforeAssistance:'difficile',realizedDifficulty:'moderee',explicitM01Index:6,
});
const enriched=(who='pj:l004-hero-fiction')=>{
  const x=base(); x.id=`xp:demo:decision-${who==='pj:l004-hero-fiction'?'a':'b'}`;
  x.target.characterInstanceId=who;x.sourceContext=context();return x;
};
const ok=r=>{assert.equal(r.ok,true,JSON.stringify(r.errors));return r;};
const fail=(r,code)=>{assert.equal(r.ok,false,'Attendu: refus');assert.equal(typeof r.code,'string',JSON.stringify(r));
  assert.ok(Array.isArray(r.issues)&&r.issues.length>0,JSON.stringify(r));
  if(code)assert.equal(r.code,code,JSON.stringify(r));return r;};

test('R2 01 repro Chrome #95 : pj:l004-hero-fiction est accepté, exact, sans alias',()=>{
  const r=ok(createXpSuggestion(base())); assert.equal(r.suggestion.target.characterInstanceId,'pj:l004-hero-fiction');
  assert.match(r.suggestion.id,/^xp:demo:sha256-[0-9a-f]{64}$/);assert.match(r.suggestion.idempotencyKey,/pj:l004-hero-fiction/);
});
test('R2 02 régression MATH #99: deux-points natifs et run préservés',()=>{
  const r=ok(createXpSuggestion(base()));const x=ok(validateXpSuggestion(JSON.parse(JSON.stringify(r.suggestion)))).suggestion;
  assert.equal(x.target.characterInstanceId,'pj:l004-hero-fiction');assert.match(x.idempotencyKey,/run-01/);
});
test('R2 03 aucune alias colon ↔ tiret',()=>{
  const a=ok(createXpSuggestion(base()));const b=base();b.target.characterInstanceId='pj-l004-hero-fiction';const y=ok(createXpSuggestion(b));
  assert.notEqual(a.suggestion.id,y.suggestion.id);assert.notEqual(a.suggestion.idempotencyKey,y.suggestion.idempotencyKey);
  ok(validateXpRegistry([a.suggestion,y.suggestion]));
});
test('R2 04 aucune normalisation de casse de l’instance',()=>{
  const a=base(),b=base();a.target.characterInstanceId='pj:Hero';b.target.characterInstanceId='pj:hero';
  const x=ok(createXpSuggestion(a)),y=ok(createXpSuggestion(b));assert.notEqual(x.suggestion.id,y.suggestion.id);
});
test('R2 05 ID typed incomplet refusé structuré',()=>{
  for(const value of ['pj:',':x','pj::x','pj/x','pj: bad','pj:x\n','pj:x/..','pnj:mentor']){
    const x=base();x.target.characterInstanceId=value;
    fail(createXpSuggestion(x),'INVALID_NATIVE_INSTANCE_ID');
  }
});
test('R2 06 longueur maximale MATH ID 40 acceptée',()=>{
  const x=base();x.target.characterInstanceId='pj:'+('a'.repeat(37));x.id='xp:demo:explicit-long-id';
  assert.equal(x.target.characterInstanceId.length,40);ok(createXpSuggestion(x));
});
test('R2 07 longueur 41 refusée avec path stable',()=>{
  const x=base();x.target.characterInstanceId='pj:'+('a'.repeat(38));x.id='xp:demo:explicit-long-id';
  const r=fail(createXpSuggestion(x),'INVALID_NATIVE_INSTANCE_ID');assert.equal(r.issues[0].path,'target.characterInstanceId');
});
test('R2 08 entrées longues acceptées avec empreinte entière, jamais tronquées',()=>{
  const x=base();x.target.characterInstanceId='pj:'+('a'.repeat(37));x.event.id='e'.repeat(60);
  const generated=ok(createXpSuggestion(x));assert.match(generated.suggestion.id,/^xp:demo:sha256-[a-f0-9]{64}$/);
  assert.equal(generated.suggestion.target.characterInstanceId,x.target.characterInstanceId);
  x.id='xp:demo:provided-no-alias';const y=ok(createXpSuggestion(x));assert.equal(y.suggestion.id,x.id);
});
test('R2 09 erreur de clé détournée : code stable et pas d’autorisation',()=>{
  const s=ok(createXpSuggestion(base())).suggestion;s.idempotencyKey='xpkey:v2:["compromised"]';
  fail(validateXpSuggestion(s),'IDEMPOTENCY_KEY_MISMATCH');
});
test('R2 10 collision d’un même ID entre deux instances',()=>{
  const x=base();x.id='xp:demo:collision';const a=ok(createXpSuggestion(x)).suggestion;
  const y=base();y.id=x.id;y.target.characterInstanceId='pj:l004-other';const b=ok(createXpSuggestion(y)).suggestion;
  const r=fail(validateXpRegistry([a,b]));assert.ok(r.issues.some(z=>z.code==='IDENTITY_COLLISION'));
});
test('R2 11 ancien v1 reste lisible sans modification silencieuse',()=>{
  const x=base();x.target.characterInstanceId='pj-a';x.id='xp:demo:evt-a-pj-a-run-01';
  const v=ok(createXpSuggestion(x)).suggestion;v.idempotencyKey='xpkey:camp-a:pj-a:run-01:evt-a';
  const got=ok(validateXpSuggestion(v)).suggestion;assert.equal(got.idempotencyKey,'xpkey:camp-a:pj-a:run-01:evt-a');
});
test('R2 12 même source v1 et v2 ne peut doubler crédit',()=>{
  const x=base();x.target.characterInstanceId='pj-a';x.id='xp:demo:evt-a-pj-a-run-01';
  const old=ok(createXpSuggestion(x)).suggestion;old.idempotencyKey='xpkey:camp-a:pj-a:run-01:evt-a';
  const fresh=base();fresh.target.characterInstanceId='pj-a';const now=ok(createXpSuggestion(fresh)).suggestion;
  const r=fail(validateXpRegistry([old,now]));assert.ok(r.issues.some(z=>z.code==='DUPLICATE_ACCOMPLISHMENT'));
});
test('R2 13 source enrichie rencontre et participant PJ/PNJ validés',()=>{
  const s=ok(createXpSuggestion(enriched())).suggestion;
  assert.equal(s.sourceContext.kind,'encounter');assert.equal(s.sourceContext.participants[2].role,'pnj');
  assert.equal(s.sourceContext.participants[2].level,20);assert.equal(s.event.difficulty,6);
  assert.equal(s.sourceContext.threats[0].level,15);assert.equal(s.sourceContext.selectedPjIds.includes('pnj:mentor'),false);
});
test('R2 14 PNJ exclu explicitement de la sélection',()=>{
  const x=enriched();x.sourceContext.selectedPjIds.push('pnj:mentor');fail(createXpSuggestion(x),'INVALID_SOURCE_CONTEXT');
});
test('R2 15 suggestion cible PJ non sélectionné rejetée',()=>{
  const x=enriched();x.sourceContext.selectedPjIds=['pj:allie'];fail(createXpSuggestion(x),'INVALID_SOURCE_CONTEXT');
});
test('R2 16 niveau ennemi 26 refusé, indice M01 1..12 indépendant',()=>{
  const x=enriched();x.sourceContext.threats[0].level=26;fail(createXpSuggestion(x),'INVALID_SOURCE_CONTEXT');
  x.sourceContext.threats[0].level=25;x.event.difficulty=13;fail(createXpSuggestion(x));
});
test('R2 17 témoin N25 accepté comme menace, pas comme indice XP M01',()=>{
  const x=enriched();x.sourceContext.threats[0].level=25;x.event.difficulty=12;x.sourceContext.explicitM01Index=12;
  const s=ok(createXpSuggestion(x)).suggestion;
  assert.equal(s.sourceContext.threats[0].level,25);assert.equal(s.event.difficulty,12);
});
test('R2 18 doublon participant ou menace rejeté',()=>{
  const x=enriched();x.sourceContext.participants.push(clone(x.sourceContext.participants[0]));
  fail(createXpSuggestion(x),'INVALID_SOURCE_CONTEXT');const y=enriched();y.sourceContext.threats.push(clone(y.sourceContext.threats[0]));
  fail(createXpSuggestion(y),'INVALID_SOURCE_CONTEXT');
});
test('R2 19 aide PNJ décisive requiert PNJ présent et justification',()=>{
  const x=enriched();x.sourceContext.assistance.npcIds=['pnj:inconnu'];fail(createXpSuggestion(x),'INVALID_SOURCE_CONTEXT');
  const y=enriched();y.sourceContext.assistance.reason='';fail(createXpSuggestion(y),'INVALID_SOURCE_CONTEXT');
});
test('R2 20 one-shot run non concordant interdit, sans alias',()=>{
  const x=enriched();x.sourceContext.runId='autre-run';fail(createXpSuggestion(x),'INVALID_SOURCE_CONTEXT');
});
test('R2 21 même accomplishment boss/quête ⇒ même idempotence et rejet registre',()=>{
  const a=ok(createXpSuggestion(enriched())).suggestion;
  const q=enriched();q.id='xp:demo:boss-et-quete-version-quete';q.event.id='evt-quest';q.sourceContext.kind='quest';
  const b=ok(createXpSuggestion(q)).suggestion;
  assert.equal(a.idempotencyKey,b.idempotencyKey);
  const z=fail(validateXpRegistry([a,b]));assert.ok(z.issues.some(i=>i.code==='DUPLICATE_ACCOMPLISHMENT'));
});
test('R2 22 accomplissements distincts, raison distincte : deux sources traçables',()=>{
  const a=ok(createXpSuggestion(enriched())).suggestion;
  const q=enriched();q.id='xp:demo:quete-separee';q.sourceContext.kind='quest';q.sourceContext.accomplishmentId='quete-pacifique-2';
  q.rationale='Nouvelle mission pacifique indépendante et approuvable par le MJ, pas le boss';
  const b=ok(createXpSuggestion(q)).suggestion;
  assert.notEqual(a.idempotencyKey,b.idempotencyKey);ok(validateXpRegistry([a,b]));
});
test('R2 23 même source entre deux PJ éligibles = deux suggestions, pas de division',()=>{
  const a=ok(createXpSuggestion(enriched())).suggestion;
  const x=enriched('pj:allie');const b=ok(createXpSuggestion(x)).suggestion;
  assert.notEqual(a.idempotencyKey,b.idempotencyKey);ok(validateXpRegistry([a,b]));
  assert.equal('individualXp' in a,false);assert.equal('amount' in b,false);
});
test('R2 24 versions/corrections garde l’identité d’accomplissement',()=>{
  const a=ok(createXpSuggestion(enriched())).suggestion;
  const update={reason:'Difficulté réelle corrigée',event:{...a.event,difficulty:4},
    sourceContext:{...a.sourceContext,kind:'quest',realizedDifficulty:'facile',explicitM01Index:4}};
  const b=ok(correctXpSuggestion(a,update)).suggestion;
  assert.equal(b.revision,2);assert.equal(b.idempotencyKey,a.idempotencyKey);
  ok(validateXpRegistry([a,b]));assert.equal(a.event.difficulty,6);
});
test('R2 25 correction qui altère accomplishmentId bloque la continuité',()=>{
  const a=ok(createXpSuggestion(enriched())).suggestion;
  const next={...a.sourceContext,accomplishmentId:'autre'};
  fail(correctXpSuggestion(a,{reason:'Détournement',sourceContext:next}),'INVALID_SOURCE_CONTEXT');
});
test('R2 26 correction qui altère run bloque la continuité',()=>{
  const a=ok(createXpSuggestion(enriched())).suggestion;
  const next={...a.sourceContext,runId:'autre'};
  fail(correctXpSuggestion(a,{reason:'Détournement',sourceContext:next}),'INVALID_SOURCE_CONTEXT');
});
test('R2 27 tentative forged approvedByMJ:true bloquée en contexte',()=>{
  const x=enriched();x.sourceContext.approvedByMJ=true;fail(createXpSuggestion(x));
});
test('R2 28 aucune suggestion n’inscrit récompense ou level-up',()=>{
  const s=ok(createXpSuggestion(enriched())).suggestion;
  const p=previewXpSuggestion(s,{experienceAward:()=>77,history:[]});ok(p);
  assert.equal(p.candidateXp,77);assert.equal(p.awardCommitted,false);assert.equal(p.levelValidated,false);
  assert.doesNotMatch(JSON.stringify(s),/awardedXp|approvedByGM|levelUp|grantAward/);
});
test('R2 29 confiance MATH séparée : source/participant journal référencée sans XP',()=>{
  const s=ok(createXpSuggestion(enriched())).suggestion;
  const r=ok(createXpMathJournalReference(s,{status:'recorded',pjId:'pj:l004-hero-fiction',decisionId:'dec-1'}));
  assert.equal(r.reference.schema,XP_JOURNAL_REFERENCE_SCHEMA);
  assert.equal(r.reference.authority,'unverified-external-math-journal');
  assert.equal(r.reference.appliedToSheet,false);
  assert.doesNotMatch(JSON.stringify(r.reference),/decidedXp|approvedByMJ|nextLedgers/);
});
test('R2 30 receipt MATH PJ divergent refuse',()=>{
  const s=ok(createXpSuggestion(enriched())).suggestion;
  fail(createXpMathJournalReference(s,{status:'recorded',pjId:'pnj:mentor',decisionId:'dec-1'}),'INVALID_MATH_RECEIPT');
});
test('R2 31 receipt contrefait avec approved:true refusé',()=>{
  const s=ok(createXpSuggestion(enriched())).suggestion;
  fail(createXpMathJournalReference(s,{status:'recorded',pjId:'pj:l004-hero-fiction',decisionId:'dec-1',approvedByMJ:true}),'INVALID_MATH_RECEIPT');
});
test('R2 32 snapshot registre enrichi JSON roundtrip conserve identité/provenance/inconnus permis',()=>{
  const s=ok(createXpSuggestion(enriched())).suggestion;
  const raw=JSON.stringify(s);const r=ok(validateXpSuggestion(JSON.parse(raw))).suggestion;
  assert.deepEqual(r,s);assert.equal(r.provenance.sourceVersion,'v1');
  assert.equal(r.sourceContext.eventStatus,'observed');
});
test('R2 33 schéma MATH cité, pas de champ d’autorité validé depuis INDEX',()=>{
  assert.equal(MATH_ENCOUNTER_SCHEMA,'cer.math.encounter-xp.provisional.v0');
  const x=enriched();x.sourceContext.scope='legendaire';fail(createXpSuggestion(x),'INVALID_SOURCE_CONTEXT');
});

test('R2 34 MATH sourceEventId JSON canonique identique encounter/quest',()=>{
  const scene=enriched();const s=ok(createXpSuggestion(scene)).suggestion;
  const events=[];const r=previewXpSuggestion(s,{experienceAward:(ev)=>{events.push(ev);return 42;},history:[]});
  ok(r);const canonical=JSON.stringify(['camp-a','run-01','boss-et-quete-1']);
  assert.equal(events[0].id,canonical);assert.equal(r.sourceEventId,canonical);
  const t=enriched();t.sourceContext.kind='quest';t.event.id='different-kind-event';
  const q=ok(createXpSuggestion(t)).suggestion;
  const r2=previewXpSuggestion(q,{experienceAward:ev=>{assert.equal(ev.id,canonical);return 0;},history:[]});ok(r2);
});
test('R2 35 journal MATH historisé JSON autorisé sans normalisation',()=>{
  const s=ok(createXpSuggestion(enriched())).suggestion;
  const id=JSON.stringify(['camp-a','run-01','boss-et-quete-1']);
  const history=[{id,pattern:'pacifique',domain:'diplomatie',scope:'ordinaire',difficulty:6,approved:true}];
  const r=previewXpSuggestion(s,{experienceAward:(ev,h)=>{assert.equal(h[0].id,id);return 0;},history});
  ok(r);assert.equal(r.candidateXp,0);assert.deepEqual(history[0].id,id);
});
test('R2 36 historique M01 JSON forgé/ref altérée refusée',()=>{
  const s=ok(createXpSuggestion(enriched())).suggestion;
  const r=previewXpSuggestion(s,{experienceAward:()=>42,history:[{id:'["camp-a","run-01","bad"] broken',pattern:'pacifique'}]});
  assert.equal(r.ok,false);assert.match(JSON.stringify(r.errors),/historique M01 invalide/);
});
test('R2 37 PNJ faussement typé PJ refusé même si sélectionné',()=>{
  const x=enriched();x.sourceContext.participants[2].role='pj';x.sourceContext.selectedPjIds.push('pnj:mentor');
  fail(createXpSuggestion(x),'INVALID_SOURCE_CONTEXT');
});
test('R2 38 un PJ camouflé en PNJ est refusé',()=>{
  const x=enriched();x.sourceContext.participants[0].role='pnj';
  fail(createXpSuggestion(x),'INVALID_SOURCE_CONTEXT');
});

test('R2 39 fragment importable vers MATH #99 sans eventApprovedByMJ ni ledgers', async()=>{
  const {previewMathEncounterFragment}=await import('../../src/catalog/index.mjs');
  const s=ok(createXpSuggestion(enriched())).suggestion;
  const f=ok(previewMathEncounterFragment(s));assert.equal(f.schema,MATH_ENCOUNTER_SCHEMA);
  assert.deepEqual(f.missingExternalFields,['eventApprovedByMJ','ledgersByPj']);
  assert.equal(f.mathInputFragment.actors[2].instanceId,'pnj:mentor');
  assert.equal(f.mathInputFragment.selectedPjIds.length,2);
  assert.equal(f.mathInputFragment.explicitM01Index,6);
  assert.equal(f.mathInputFragment.threats[0].level,15);
  assert.equal(f.mathInputFragment.assistance.level,'decisive');
  assert.equal('eventApprovedByMJ' in f.mathInputFragment,false);
  assert.equal('ledgersByPj' in f.mathInputFragment,false);
  assert.equal(f.appliedToSheet,false);
});
test('R2 40 fragment MATH refuse suggestion sans sourceContext',async()=>{
  const {previewMathEncounterFragment}=await import('../../src/catalog/index.mjs');
  const s=ok(createXpSuggestion(base())).suggestion;
  fail(previewMathEncounterFragment(s),'MATH_SOURCE_REQUIRED');
});
test('R2 41 fragment signale difficulté manquante, sans l’inventer',async()=>{
  const {previewMathEncounterFragment}=await import('../../src/catalog/index.mjs');
  const x=enriched();delete x.sourceContext.difficultyBeforeAssistance;
  const s=ok(createXpSuggestion(x)).suggestion;
  const f=ok(previewMathEncounterFragment(s));
  assert.ok(f.missingExternalFields.includes('difficultyBeforeAssistance'));
  assert.equal('difficultyBeforeAssistance' in f.mathInputFragment,false);
});
test('R2 42 reproduit exactement l’événement du runtime intégration #95',()=>{
  const x={namespace:'demo',version:'0.1.0',target:{campaignId:'l004-camp',characterInstanceId:'pj:l004-hero-fiction'},
    event:{id:'evt-demo-m01-l004',pattern:'exploration-fictive',domain:'exploration',difficulty:3,scope:'ordinaire'},
    context:{initialLevel:5},provenance:{originKind:'illustrative',sourceSchema:'cer.dg004.fake.xp',sourceId:'event-demo-l004',sourceVersion:'1'},
    rationale:'Exploration fictive ; aucune récompense créditée'};
  const r=ok(createXpSuggestion(x));const candidate=previewXpSuggestion(r.suggestion,{experienceAward:()=>60,history:[]});
  ok(candidate);assert.equal(candidate.candidateXp,60);assert.equal(candidate.awardCommitted,false);
  assert.equal(r.suggestion.target.characterInstanceId,'pj:l004-hero-fiction');
});
test('R2 43 scénario #95 alternatif PJ importé pj:dg004-fake-pj',()=>{
  const x=base();x.target.characterInstanceId='pj:dg004-fake-pj';x.event.id='evt-demo-m01-l004';
  ok(createXpSuggestion(x));
});
test('R2 44 cas erreur preview XP inclut code/issue',()=>{
  const s=ok(createXpSuggestion(base())).suggestion;
  const invalid=previewXpSuggestion(s,{history:[]});
  fail(invalid,'M01_PORT_UNAVAILABLE');assert.equal(invalid.status,'unavailable');
});

test('R2 45 aucun désaccord silencieux entre indice INDEX et indice explicite MATH',()=>{
  const x=enriched();x.event.difficulty=5;
  fail(createXpSuggestion(x),'INVALID_SOURCE_CONTEXT');
});
test('R2 46 indice absent : laisser MATH proposer via étiquette, ne pas inventer barème',()=>{
  const x=enriched();delete x.sourceContext.explicitM01Index;
  const s=ok(createXpSuggestion(x)).suggestion;
  let called=false;const r=previewXpSuggestion(s,{history:[],experienceAward:()=>{called=true;return 999;}});
  fail(r,'MATH_INDEX_NOT_ATTESTED');assert.equal(r.status,'unavailable');assert.equal(called,false);
});

test('R2 47 id stable SHA256 complet vérifié par Node crypto, jamais un alias',()=>{
  const x=base();const r=ok(createXpSuggestion(x)).suggestion;
  const tuple=[x.target.campaignId,x.target.characterInstanceId,x.context.oneShot.runId,x.event.id,x.event.id];
  const hash=createHash('sha256').update(JSON.stringify(tuple)).digest('hex');
  assert.equal(r.id,`xp:demo:sha256-${hash}`);
});
test('R2 48 même événement/PJ/run dans deux campagnes : ID et clé distincts',()=>{
  const x=base(),y=base();y.target.campaignId='camp-b';
  const a=ok(createXpSuggestion(x)).suggestion,b=ok(createXpSuggestion(y)).suggestion;
  assert.notEqual(a.id,b.id);assert.notEqual(a.idempotencyKey,b.idempotencyKey);
  ok(validateXpRegistry([a,b]));
});
test('R2 49 namespace invalide et borne rejetés avec erreur structurée',()=>{
  const x=base();x.namespace='x'.repeat(52);fail(createXpSuggestion(x),'INVALID_NAMESPACE');
  x.namespace='DEMO';fail(createXpSuggestion(x),'INVALID_NAMESPACE');
});

test('R2 50 SHA256 long multi-bloc conforme à node:crypto et sans collision tronquée',()=>{
  const x=base();x.event.id='e'.repeat(60);x.target.characterInstanceId='pj:'+('z'.repeat(37));
  const s=ok(createXpSuggestion(x)).suggestion;
  const preimage=JSON.stringify([x.target.campaignId,x.target.characterInstanceId,x.context.oneShot.runId,x.event.id,x.event.id]);
  assert.ok(Buffer.byteLength(preimage)>64);
  assert.equal(s.id,`xp:demo:sha256-${createHash('sha256').update(preimage).digest('hex')}`);
});
