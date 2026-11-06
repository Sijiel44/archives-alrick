/** STUDIO L004-REPAIR2 — ATELIERS #100 pendingStudioOp / ARCHIVES proof contract.
 * Synthetic private data, real STUDIO functions; no mock 5d6 math or fake restore engine.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectCreatorAttachment,confirmCreatorAttachmentWithEvidence}
  from '../../src/studio/reconcile.mjs';
const clone=structuredClone;
const STUDIO='cer.studio.dg003.provisional.v0';
const CYCLE='cer.creators.dg004.private.v0';
const SOURCE={documentId:'DOC-L004-FICTIF',profileId:'PROFILE-N5',ruleset:'m03'};
const PRIVATE='CANARI_NOTE_MJ_CONTRAT_001';
function actor(id='new-cr-1',source=SOURCE){return {id,source:clone(source),privateSnapshot:{secret:'CANARI_CREATURE_MJ'}};}
function scene(id='new-sc-1',notes=PRIVATE,participantIds=['cr-existing']){
 return {id,title:'Pont des deux rives',publicDescription:'Fiche visible uniquement sur consentement',privateNotes:notes,participantIds};
}
function campaign({creatures=[],scenes=[],id='camp-l004-01'}={}){
 return {schema:STUDIO,id,title:'Campagne 100% fictive',creatures:clone(creatures),scenes:clone(scenes),
  characters:[],revision:7,privateNotes:['CANARI_MJ_INTERDIT_JOUEUR']};
}
function cycle(kind='creature',beforeIds=[]){return {schema:CYCLE,id:'cycle-001',revision:7,
 drafts:{item:{},capacity:{},creature:{sourceReference:'fixture-source-001'},
   scene:{title:'Pont des deux rives',publicDescription:'Fiche visible uniquement sur consentement',privateNotes:PRIVATE}},
 links:{creatureInstanceId:kind==='scene'?'cr-existing':null,sceneId:null},
 extensions:{pendingStudioOp:kind==='creature'?{kind,campaignId:'camp-l004-01',beforeIds:clone(beforeIds),source:clone(SOURCE)}:
  {kind,campaignId:'camp-l004-01',beforeIds:clone(beforeIds)}}};}
function probe({kind='creature',live=null,disk=null,currentCycle=null,diskCycle=null}={}){
 const cy=currentCycle??cycle(kind);
 const campaignLive=live??campaign({creatures:[actor()]});
 const persistedCampaign=disk??clone(campaignLive);
 return inspectCreatorAttachment({campaign:campaignLive,persistedCampaign,
  cycle:cy,persistedCycle:diskCycle??clone(cy)});
}
function primary(x,kind='creature'){return kind==='creature'?x.creature:x.scene;}

test('PENDING-01: older matching creature without journal is NOT proof of ownership',()=>{
 const c=campaign({creatures:[actor()]});const cy=cycle();delete cy.extensions.pendingStudioOp;
 const out=probe({live:c,currentCycle:cy,diskCycle:clone(cy)});
 assert.equal(out.action,'block-automatic-retry');assert.equal(out.creature.status,'unattestable');
});
test('PENDING-02: preflight journal durable BEFORE external action -> missing, never retry blindly',()=>{
 const c=campaign();const out=probe({live:c,disk:clone(c)});
 assert.equal(primary(out).status,'missing');assert.equal(out.pending,true);
 assert.equal(out.action,'block-automatic-retry');
});
test('PENDING-03: journal failed before persisting -> no attestation even when STUDIO has actor',()=>{
 const cy=cycle(),old=clone(cy);delete old.extensions.pendingStudioOp;
 const c=campaign({creatures:[actor()]});const out=probe({live:c,currentCycle:cy,diskCycle:old});
 assert.equal(primary(out).status,'unattestable');assert.equal(out.action,'block-automatic-retry');
});
test('PENDING-04: copy succeeded only in RAM -> unpersisted, no link',()=>{
 const out=probe({live:campaign({creatures:[actor()]}),disk:campaign()});
 assert.equal(primary(out).status,'unpersisted');assert.equal(out.action,'block-automatic-retry');
});
test('PENDING-05: after action durable, only NEW identified creature can be confirmed',()=>{
 const previous=actor('older-cr'),created=actor('new-cr-1');
 const cy=cycle('creature',['older-cr']);
 const c=campaign({creatures:[previous,created]});const out=probe({live:c,disk:clone(c),currentCycle:cy});
 assert.equal(primary(out).id,'new-cr-1');assert.equal(primary(out).status,'reusable');
 assert.equal(out.action,'link-existing-after-MJ-confirmation');
 assert.doesNotMatch(JSON.stringify(out),/CANARI|privateSnapshot|privateNotes/);
});
test('PENDING-06: two new creatures, even only one with matching provenance -> ambiguous',()=>{
 const c=campaign({creatures:[actor(),actor('other-cr',{documentId:'other',profileId:'other',ruleset:'m03'})]});
 assert.equal(primary(probe({live:c})).status,'ambiguous');
});
test('PENDING-07: two copies with the same provenance -> ambiguous',()=>{
 const c=campaign({creatures:[actor('copy-a'),actor('copy-b')]});
 assert.equal(primary(probe({live:c})).status,'ambiguous');
});
test('PENDING-08: same name but other profile/ruleset -> conflict, not a candidate',()=>{
 const c=campaign({creatures:[actor('new-cr-1',{...SOURCE,profileId:'PROFILE-N99'})]});
 assert.equal(primary(probe({live:c})).status,'conflict');
});
test('PENDING-09: changed campaign ID after journal => fail closed',()=>{
 const c=campaign({creatures:[actor()],id:'different-campaign'});
 assert.equal(primary(probe({live:c,disk:clone(c)})).status,'wrong-campaign');
});
test('PENDING-10: restored older STUDIO campaign missing baseline IDs => stale',()=>{
 const cy=cycle('creature',['older-cr']);
 const c=campaign({creatures:[actor('new-cr-1')]});
 assert.equal(primary(probe({live:c,currentCycle:cy})).status,'stale');
});
test('PENDING-11: current journal and persisted journal differ => unattestable',()=>{
 const cy=cycle(),disk=clone(cy);disk.extensions.pendingStudioOp.beforeIds=['unknown'];
 const out=probe({currentCycle:cy,diskCycle:disk});
 assert.equal(primary(out).status,'unattestable');
});
test('PENDING-12: spoofed/broken journal with duplicate baseline IDs rejected',()=>{
 const cy=cycle('creature',['a','a']);const out=probe({currentCycle:cy});
 assert.equal(primary(out).status,'invalid-journal');
});
test('PENDING-13: duplicate instance IDs in either store never reusable',()=>{
 const c=campaign({creatures:[actor('copy'),actor('copy')]});
 assert.equal(primary(probe({live:c})).status,'ambiguous');
});
test('PENDING-14: one new durable scene with same text, notes and participant -> reusable',()=>{
 const c=campaign({creatures:[actor('cr-existing')],scenes:[scene()]});
 const out=probe({kind:'scene',live:c,disk:clone(c)});
 assert.equal(primary(out,'scene').status,'reusable');
 assert.equal(primary(out,'scene').id,'new-sc-1');
 assert.equal(out.action,'link-existing-after-MJ-confirmation');
 assert.doesNotMatch(JSON.stringify(out),/CANARI_NOTE_MJ/);
});
test('PENDING-15: scene missing creator-linked creature in participants blocks linking',()=>{
 const c=campaign({creatures:[actor('cr-existing')],scenes:[scene('new-sc-1',PRIVATE,[])]});
 assert.equal(primary(probe({kind:'scene',live:c}),'scene').status,'needs-participants');
});
test('PENDING-16: altered private scene notes => conflict; no private note in outcome',()=>{
 const c=campaign({creatures:[actor('cr-existing')],scenes:[scene('new-sc-1','private-other')]});
 const out=probe({kind:'scene',live:c});
 assert.equal(primary(out,'scene').status,'conflict');
 assert.doesNotMatch(JSON.stringify(out),/private-other|CANARI_NOTE/);
});
test('PENDING-17: scene present in RAM but absent from ARCHIVES -> unpersisted',()=>{
 const live=campaign({creatures:[actor('cr-existing')],scenes:[scene()]});
 const disk=campaign({creatures:[actor('cr-existing')]});
 assert.equal(primary(probe({kind:'scene',live,disk}),'scene').status,'unpersisted');
});
test('PENDING-18: another persisted scene ID than in RAM => conflict',()=>{
 const live=campaign({creatures:[actor('cr-existing')],scenes:[scene()]});
 const disk=campaign({creatures:[actor('cr-existing')],scenes:[scene('other-sc')]});
 assert.equal(primary(probe({kind:'scene',live,disk}),'scene').status,'conflict');
});
test('PENDING-19: identical replay after reload returns same ID without creating an instance',()=>{
 const live=campaign({creatures:[actor()]});const cy=cycle();const old=JSON.stringify(live);
 const a=probe({live,disk:clone(live),currentCycle:cy});
 const b=probe({live:clone(live),disk:clone(live),currentCycle:clone(cy)});
 assert.deepEqual(a,b);assert.equal(a.creature.id,'new-cr-1');assert.equal(JSON.stringify(live),old);
});

function setupConfirmation({kind='creature',candidate='new-cr-1',recoveryOverride=null,
 persistFailure=false}={}){
 const cy=cycle(kind),live=kind==='creature'?campaign({creatures:[actor(candidate)]}):
   campaign({creatures:[actor('cr-existing')],scenes:[scene(candidate)]});
 let savedCycle=clone(cy),callCount=0;
 const store={async load(){return clone(savedCycle)}};
 const studio={getCampaign(){return clone(live)}},studioStorage={async load(){return clone(live)}};
 const recovery={pending:true,durableVerified:true,status:'requires-confirmation',kind,candidates:[{id:candidate}],
   unverifiedCount:0,canAbandon:false};
 const creator={getState(){return clone(cy)},
 getStudioRecovery(){return {pending:true,status:'durability-unverified',kind,candidates:[],durableVerified:false}},
 async inspectStudioRecovery(){return clone(recoveryOverride??recovery)},
 async reconcileStudioLink(id,{confirm}){callCount++;assert.equal(id,candidate);assert.equal(confirm,true);
   if(persistFailure)throw Error('quota: durable cycle link missing');
   const prop=kind==='creature'?'creatureInstanceId':'sceneId';
   savedCycle.links[prop]=id;delete savedCycle.extensions.pendingStudioOp;
   return {kind,instanceId:id,reconciled:true,executable:false};
 }};
 return {creator,studio,creatorPersistence:store,studioStorage,instanceId:candidate,confirm:true,
   count:()=>callCount,getPersisted:()=>clone(savedCycle)};
}
test('PENDING-20: explicit confirmation is mandatory, no commit without it',async()=>{
 const p=setupConfirmation();await assert.rejects(confirmCreatorAttachmentWithEvidence({...p,confirm:false}),/Confirmation MJ/);
 assert.equal(p.count(),0);
});
test('PENDING-21: confirmation with both durable proofs links ONLY existing ID',async()=>{
 const p=setupConfirmation();const out=await confirmCreatorAttachmentWithEvidence(p);
 assert.deepEqual(out,{kind:'creature',instanceId:'new-cr-1',status:'linked',reconciled:true,executable:false});
 assert.equal(p.count(),1);assert.equal(p.getPersisted().links.creatureInstanceId,'new-cr-1');
});
test('PENDING-22: creator recovery disagreeing with STUDIO proof blocks before commit',async()=>{
 const p=setupConfirmation({recoveryOverride:{pending:true,status:'requires-confirmation',kind:'creature',
   durableVerified:true,candidates:[{id:'unrelated'}],unverifiedCount:0,canAbandon:false}});
 await assert.rejects(confirmCreatorAttachmentWithEvidence(p),/discordant/);
 assert.equal(p.count(),0);
});
test('PENDING-23: ambiguous creator recovery (two candidates) blocks even if STUDIO gives one',async()=>{
 const p=setupConfirmation({recoveryOverride:{pending:true,status:'requires-confirmation',kind:'creature',
   durableVerified:true,candidates:[{id:'new-cr-1'},{id:'new-cr-2'}],unverifiedCount:1,canAbandon:false}});
 await assert.rejects(confirmCreatorAttachmentWithEvidence(p),/discordant/);assert.equal(p.count(),0);
});
test('PENDING-24: after failure to persist final link, no second STUDIO copy is attempted',async()=>{
 const p=setupConfirmation({persistFailure:true});
 await assert.rejects(confirmCreatorAttachmentWithEvidence(p),/quota/);
 assert.equal(p.count(),1);assert.equal(p.getPersisted().extensions.pendingStudioOp.kind,'creature');
});
test('PENDING-25: scene explicit confirmation returns same scene ID and no secret',async()=>{
 const p=setupConfirmation({kind:'scene',candidate:'new-sc-1'});
 const out=await confirmCreatorAttachmentWithEvidence(p);
 assert.equal(out.kind,'scene');assert.equal(out.instanceId,'new-sc-1');
 assert.equal(p.getPersisted().links.sceneId,'new-sc-1');
 assert.doesNotMatch(JSON.stringify(out),/CANARI|privateNotes/);
});

test('PENDING-26: synchronous getStudioRecovery is deliberately durability-unverified',async()=>{
 const p=setupConfirmation();
 assert.equal(p.creator.getStudioRecovery().status,'durability-unverified');
 const result=await confirmCreatorAttachmentWithEvidence(p);
 assert.equal(result.status,'linked');assert.equal(p.count(),1);
});
test('PENDING-27: absence of async durable inspector refuses even if legacy hint claims success',async()=>{
 const p=setupConfirmation();
 p.creator={...p.creator,inspectStudioRecovery:undefined,getStudioRecovery:()=>({status:'requires-confirmation'})};
 await assert.rejects(confirmCreatorAttachmentWithEvidence(p),/Ports de réconciliation/);
 assert.equal(p.count(),0);
});
test('PENDING-28: no durableVerified flag is never enough',async()=>{
 const p=setupConfirmation();const real=p.creator.inspectStudioRecovery.bind(p.creator);
 p.creator={...p.creator,inspectStudioRecovery:async()=>{
  const x=await real();delete x.durableVerified;return x;
 }};
 await assert.rejects(confirmCreatorAttachmentWithEvidence(p),/Journal ATELIERS discordant/);
 assert.equal(p.count(),0);
});
test('PENDING-29: explicit durableVerified:false refuses status requires-confirmation',async()=>{
 const p=setupConfirmation();const real=p.creator.inspectStudioRecovery.bind(p.creator);
 p.creator={...p.creator,inspectStudioRecovery:async()=>({...await real(),durableVerified:false})};
 await assert.rejects(confirmCreatorAttachmentWithEvidence(p),/Journal ATELIERS discordant/);
 assert.equal(p.count(),0);
});
test('PENDING-30: asynchronous foreign candidate or two candidates refuses',async()=>{
 for(const candidates of [[{id:'foreign'}],[{id:'new-cr-1'},{id:'new-cr-2'}]]){
  const p=setupConfirmation();const real=p.creator.inspectStudioRecovery.bind(p.creator);
  p.creator={...p.creator,inspectStudioRecovery:async()=>({...await real(),candidates})};
  await assert.rejects(confirmCreatorAttachmentWithEvidence(p),/Journal ATELIERS discordant/);
  assert.equal(p.count(),0);
 }
});
test('PENDING-31: asynchronous inspector rejects during ARCHIVES read; no link attempt',async()=>{
 const p=setupConfirmation();p.creator={...p.creator,inspectStudioRecovery:async()=>{throw Error('ARCHIVES unavailable')}};
 await assert.rejects(confirmCreatorAttachmentWithEvidence(p),/ARCHIVES unavailable/);
 assert.equal(p.count(),0);
});
test('PENDING-32: refusal after forged link acknowledgement with no durable save',async()=>{
 const p=setupConfirmation();
 p.creator={...p.creator,reconcileStudioLink:async()=>({kind:'creature',instanceId:p.instanceId,reconciled:true})};
 await assert.rejects(confirmCreatorAttachmentWithEvidence(p),/Lien créateur non retrouvé durablement/);
 assert.equal(p.getPersisted().extensions.pendingStudioOp.kind,'creature');
});
test('PENDING-33: async inspection is awaited rather than ignored',async()=>{
 const p=setupConfirmation();const real=p.creator.inspectStudioRecovery.bind(p.creator);
 let inspected=false;
 p.creator={...p.creator,inspectStudioRecovery:async()=>{
  await Promise.resolve();inspected=true;return real();
 }};
 const out=await confirmCreatorAttachmentWithEvidence(p);
 assert.equal(inspected,true);assert.equal(out.instanceId,'new-cr-1');assert.equal(p.count(),1);
});
