import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {test} from 'node:test';
import {browserFixture} from './browser.mjs';
import {INDEX_RESOURCES_KEY,INDEXED_OPPOSITION_KEY,PLAY_ACTIONS_KEY} from '../store.mjs';

const db='studio-index-003-fixture';
const id='campagne-index-003';
const actor={id:'pj-mage',name:'Mage témoin',level:10,notes:'Fictif'};
const targetId='pnj-cible';
const sceneId='scene-duel';
const resourceId='mana-pj-mage';
const ref={type:'spell',id:'MAG-SORT-001',revision:1};
const meta=(id)=>({id,actor:actor.name,stat:'esprit',source:'table',
  intent:'Projeter une étincelle témoin',stakes:'Atteindre la cible',
  consequence:'Une conséquence validée par le MJ'});
const command=(operationId,expectedRevision,type,data)=>({id,operationId,expectedRevision,type,data});

async function init(page,url,name){
  await page.goto(url);
  await page.evaluate(async name=>{
    const {openStudioStore}=await import('/store.mjs');
    window.studioTest=await openStudioStore({name,injectFailure(stage){
      if(window.studioFail===stage)throw new Error(stage);
    }});
  },name);
}
const call=(page,method,...args)=>page.evaluate(({method,args})=>
  window.studioTest[method](...args),{method,args});
const outcome=(page,method,...args)=>page.evaluate(async ({method,args})=>{
  try {return {ok:true,value:await window.studioTest[method](...args)};}
  catch(error){return {ok:false,error:error.code??error.message};}
},{method,args});
const commit=(page)=>page.evaluate(async ()=>{
  try {return {ok:true,value:await window.studioTest.executeIndexed(window.preparedIndexed,window.metaIndexed)};}
  catch(error){return {ok:false,error:error.code??error.message};}
});

async function prepare(page,{operationId,revision,actionId,cost,mode='magie',applyDamage=true}){
  return page.evaluate(async ({operationId,revision,actionId,cost,mode,applyDamage})=>{
    const {previewIndexedOpposition}=await import('/opposition.mjs');
    const {prepareIndexedAttempt}=await import('/index-action-transaction.mjs');
    const {createIndexM03Session}=await import('/moteur/atelier5d6-index-effects.js');
    const c=await window.studioTest.get('campagne-index-003');
    const card=c.creatures.find(item=>item.id==='pnj-cible').entreRivesBestiaryProfileV7.card;
    const ref={type:'spell',id:'MAG-SORT-001',revision:1};
    const session=createIndexM03Session();
    session.importDefinition({reference:ref,provenance:'Cas fictif exclusivement',
      effect:{kind:'impact',magnitude:2,duration:1,trigger:'attaque'},intensityEligible:false});
    session.approveForHolder(ref,'pj-mage',true);
    const dice=[6,5,4,4,3];
    const roll={dice,rawStat:22,masteryRank:7,situation:0,level:15,
      threshold:21,impactMode:mode,baseDamage:6,penetration:1};
    const preview=previewIndexedOpposition(roll,card,session,
      {attackerId:'pj-mage',defenderId:'pnj-cible',attackRefs:[ref]});
    const record=prepareIndexedAttempt(preview,{campaignId:'campagne-index-003',
      sceneId:'scene-duel',operationId,expectedRevision:revision,
      confirmedByGM:true,costApprovedByGM:true,confirmedAt:'2026-11-17T12:00:00.000Z',
      cost,applyDamage});
    window.preparedIndexed=record;
    window.metaIndexed={id:actionId,actor:'Mage témoin',stat:'esprit',source:'table',
      intent:'Projeter une étincelle témoin',stakes:'Atteindre la cible',
      consequence:'Une conséquence validée par le MJ'};
    return {damage:preview.result.damage,proof:record.proof,previewGate:preview.journalGate};
  },{operationId,revision,actionId,cost,mode,applyDamage});
}

test('ARCHIVES-EFF-003 : atomicité IndexedDB, anti-rejeu, concurrence, sauvegarde et mental',
  {timeout:100000},async t=>{
  const fixture=await browserFixture(t);
  const {page:first,context}=await fixture.open('archives-index');
  const second=await context.newPage();
  await Promise.all([init(first,fixture.url,db),init(second,fixture.url,db)]);
  await call(first,'execute',command('creer',0,'create',{
    name:'Campagne INDEX fictive',description:'Test seulement',style:'one-shot',startingLevel:10}));
  await call(first,'execute',command('creer-pj',1,'save-character',actor));
  const card=await first.evaluate(async ()=>{
    const {referenceOpponent}=await import('/moteur/atelier5d6-bestiary-workshop.js');
    const p=referenceOpponent(10,'defensif',2);
    p.id='pnj-cible';p.name='Gardien témoin';
    return p;
  });
  await call(first,'execute',command('creer-pnj',2,'save-bestiary-profile',{
    id:targetId,name:card.name,description:'Profil fictif',
    source:{id:targetId,version:'alrick.bestiary.v1'},profile:{origin:'created',card,original:null}}));
  await call(first,'execute',command('creer-scene',3,'save-scene',{
    id:sceneId,title:'Duel fictif',description:'Sable',privateNotes:'CANARI_SECRET_003',
    participantIds:[actor.id,targetId]}));
  await call(first,'execute',command('scene-active',4,'select-scene',{id:sceneId}));
  await call(first,'execute',command('res-mana',5,'register-index-resource',{
    id:resourceId,holderId:actor.id,kind:'mana',initial:10}));
  let campaign=await call(first,'get',id);
  assert.equal(campaign.revision,6);
  assert.deepEqual(campaign[INDEX_RESOURCES_KEY],[{id:resourceId,holderId:actor.id,
    kind:'mana',initial:10,current:10,version:1}]);
  assert.deepEqual(await outcome(first,'execute',command('res-duplicate',6,'register-index-resource',{
    id:resourceId,holderId:actor.id,kind:'mana',initial:999})),
    {ok:false,error:'conflict'},'Impossible de réinitialiser une réserve dépensée');
  const cost={kind:'mana',sourceId:resourceId,amount:3,availableBefore:10,version:1};
  const trial=await prepare(first,{operationId:'eff-1',revision:6,actionId:'action-eff-1',cost});
  assert.equal(trial.previewGate,'versioned-journal-required');
  assert(trial.damage>0);
  // La voie publique JSON ne peut jamais s'attribuer une autorisation INDEX.
  const fake=await first.evaluate(async ()=>{
    const prepared=JSON.parse(JSON.stringify(window.preparedIndexed));
    const metadata=window.metaIndexed;
    try {await window.studioTest.executeIndexed(prepared,metadata);return 'accepted';}
    catch(error){return error.message;}
  });
  assert.match(fake,/locale confirmée/);
  const direct=await first.evaluate(async()=>{
    const prepared=window.preparedIndexed,metadata=window.metaIndexed;
    try {await window.studioTest.execute({id:prepared.campaignId,operationId:prepared.operationId,
      expectedRevision:6,type:'record-indexed-opposition',data:{...metadata}});return 'accepted';}
    catch(error){return error.code??error.message;}
  });
  assert.notEqual(direct,'accepted');
  await first.evaluate(()=>{window.studioFail='before-commit';});
  assert.equal((await commit(first)).error,'before-commit');
  campaign=await call(second,'get',id);
  assert.equal(campaign.revision,6);
  assert.equal(campaign[INDEX_RESOURCES_KEY][0].current,10);
  await first.evaluate(()=>{window.studioFail='after-commit';});
  assert.equal((await commit(first)).error,'after-commit');
  campaign=await call(second,'get',id);
  assert.equal(campaign.revision,7);
  assert.equal(campaign[INDEX_RESOURCES_KEY][0].current,7);
  assert.equal(campaign[INDEX_RESOURCES_KEY][0].version,2);
  assert.equal(campaign[PLAY_ACTIONS_KEY].length,1);
  assert.equal(campaign[PLAY_ACTIONS_KEY][0].combat.damage,trial.damage);
  assert.equal(campaign[PLAY_ACTIONS_KEY][0][INDEXED_OPPOSITION_KEY].operationId,'eff-1');
  await first.evaluate(()=>{window.studioFail=null;});
  assert.equal((await commit(first)).value.revision,7,'Reprise idempotente après acquittement perdu');
  assert.equal((await call(first,'get',id))[INDEX_RESOURCES_KEY][0].current,7);
  // Deux onglets préparent des opérations concurrentes sur la même version.
  const raceCost={...cost,availableBefore:7,version:2};
  await prepare(first,{operationId:'eff-race-a',revision:7,actionId:'action-race-a',cost:raceCost});
  await prepare(second,{operationId:'eff-race-b',revision:7,actionId:'action-race-b',cost:raceCost});
  const raced=await Promise.all([commit(first),commit(second)]);
  assert.equal(raced.filter(item=>item.ok).length,1);
  assert.deepEqual(raced.filter(item=>!item.ok).map(item=>item.error),['conflict']);
  campaign=await call(first,'get',id);
  assert.equal(campaign.revision,8);
  assert.equal(campaign[INDEX_RESOURCES_KEY][0].current,4);
  assert.equal(campaign[PLAY_ACTIONS_KEY].length,2);
  // Un succès mental conserve le journal, mais n'applique jamais de PV.
  const none={kind:'none',sourceId:null,amount:0,availableBefore:null,version:null};
  const mental=await prepare(first,{operationId:'eff-mental',revision:8,actionId:'action-mental',
    cost:none,mode:'mental',applyDamage:false});
  assert.equal(mental.damage,0);
  const hpBefore=campaign[PLAY_ACTIONS_KEY].at(-1).combat.hpAfter;
  assert.equal((await commit(first)).value.revision,9);
  campaign=await call(first,'get',id);
  assert.equal(campaign[PLAY_ACTIONS_KEY].at(-1).combat.hpAfter,hpBefore);
  assert.equal(campaign[INDEX_RESOURCES_KEY][0].current,4);
  // La même transaction accepte une réserve de charges explicitement déclarée.
  await call(first,'execute',command('creer-charge',9,'register-index-resource',{
    id:'charges-objet-temoin',holderId:actor.id,kind:'charge',initial:2}));
  await prepare(first,{operationId:'eff-charge',revision:10,actionId:'action-charge',
    cost:{kind:'charge',sourceId:'charges-objet-temoin',amount:1,availableBefore:2,version:1},
    applyDamage:false});
  assert.equal((await commit(first)).value.revision,11);
  campaign=await call(first,'get',id);
  assert.equal(campaign[INDEX_RESOURCES_KEY].find(r=>r.kind==='charge').current,1);
  assert.equal(campaign[INDEX_RESOURCES_KEY].find(r=>r.kind==='mana').current,4);
  // Sauvegarde, preuve historique et restauration réelle dans une autre base.
  const backup=await call(first,'exportBackup',id);
  assert.equal(JSON.parse(backup).version,22);
  const restored=await first.evaluate(async backup=>{
    const {openStudioStore}=await import('/store.mjs');
    const other=await openStudioStore({name:'studio-index-003-restored'});
    try {const preview=await other.previewBackup(backup);
      return {preview,campaign:await other.restoreBackup(preview)};}
    finally {other.close();}
  },backup);
  assert.equal(restored.preview.conflict,false);
  assert.equal(restored.campaign[INDEX_RESOURCES_KEY][0].current,4);
  assert.equal(restored.campaign[INDEX_RESOURCES_KEY][1].current,1);
  assert.equal(restored.campaign[PLAY_ACTIONS_KEY].length,4);
  const archive=JSON.parse(backup);
  const tampered=structuredClone(archive);
  tampered.payload.campaign[PLAY_ACTIONS_KEY][0][INDEXED_OPPOSITION_KEY].result.damage=999;
  tampered.sha256=createHash('sha256').update(JSON.stringify(tampered.payload)).digest('hex');
  const forged=await outcome(first,'previewBackup',JSON.stringify(tampered));
  assert.deepEqual(forged,{ok:false,error:'invalid-data'},
    'Une empreinte recalculée ne contourne pas la preuve M03');
});
