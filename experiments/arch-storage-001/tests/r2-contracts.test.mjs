import test from 'node:test';import assert from 'node:assert/strict';
import {createAReinforcedComparison} from '../src/a-guard.mjs';
import {seedFiction} from '../src/idb-store.mjs';
import {DEMO_ID} from '../src/contracts.mjs';

function fakeStorage(){const m=new Map();let quota=false;return Object.freeze({
 getItem:k=>m.has(k)?m.get(k):null,
 setItem:(k,v)=>{if(quota)throw Object.assign(Error('Quota simulated'),{name:'QuotaExceededError'});m.set(k,v);},
 setQuota:x=>{quota=x},get size(){return m.size}
});}
const K='cer.r2.fixture';
const make=async()=>{const storage=fakeStorage(),a=createAReinforcedComparison({storage,key:K});await seedFiction(a);return {storage,a};};
test('R2 A strengthened fixture is identical to B command fixture (2PJ/1creature/2scenes/note)',async()=>{
 const {a}=await make();const c=await a.readCampaign(),j=await a.listEvents();
 assert.equal(c.characters.length,2);assert.equal(c.instances.length,1);assert.equal(c.scenes.length,2);assert.equal(c.privateNotes.length,1);
 assert.equal(c.revision,7);assert.equal(j.length,7);assert.equal(c.characters[0].rawStat,14);
});
test('R2 A one-key snapshot and journal archive retains SHA metadata',async()=>{
 const {a}=await make();const e=await a.exportPrivate(DEMO_ID),p=await a.previewImport(e.bytes);
 assert.equal(p.manifest.revision,7);assert.equal(p.journal.length,7);assert.equal(p.sha256,e.sha256);
});
test('R2 A rejects duplicate campaign and nonmatching revision without replacing',async()=>{
 const {a}=await make();await assert.rejects(a.createCampaign(),{code:'CAMPAIGN_COLLISION'});
 const command={campaignId:DEMO_ID,eventId:'test-stale',expectedRevision:1,kind:'add-private-note',payload:{note:{id:'wrong',sceneId:'scene-1',text:'no'}}};
 await assert.rejects(a.applyEvent(command),{code:'STALE_REVISION'});assert.equal((await a.readCampaign()).revision,7);
});
test('R2 A same-event retry is idempotent and journal has no duplicate',async()=>{
 const {a}=await make();const c=await a.readCampaign();const command={campaignId:DEMO_ID,eventId:'r2-retry',expectedRevision:7,kind:'add-private-note',payload:{note:{id:'retry-note',sceneId:'scene-1',text:'fiction'}}};
 assert.equal((await a.applyEvent(command)).status,'committed');assert.equal((await a.applyEvent(command)).status,'duplicate');
 assert.equal((await a.listEvents()).length,8);assert.equal((await a.readCampaign()).privateNotes.filter(x=>x.id==='retry-note').length,1);
});
test('R2 A simulated quota rejects write and preserves old envelope unchanged',async()=>{
 const {a,storage}=await make();const before=JSON.stringify(await a.readCampaign()),j=JSON.stringify(await a.listEvents());
 storage.setQuota(true);
 const cmd={campaignId:DEMO_ID,eventId:'r2-no-quota',expectedRevision:7,kind:'add-private-note',payload:{note:{id:'cannot-write',sceneId:'scene-1',text:'not persisted'}}};
 await assert.rejects(a.applyEvent(cmd),{code:'QUOTA_EXCEEDED'});
 storage.setQuota(false);
 assert.equal(JSON.stringify(await a.readCampaign()),before);assert.equal(JSON.stringify(await a.listEvents()),j);
});
test('R2 A is NOT cross-tab safe: deterministic pre-persist barrier reveals lost update',async()=>{
 const {a,storage}=await make();const b=createAReinforcedComparison({storage,key:K});
 let release;const gate=new Promise(r=>release=r);let seen=0;let bothReady;const ready=new Promise(r=>bothReady=r);
 const pause=async()=>{seen++;if(seen===2)bothReady();await gate;};
 const cmd=n=>({campaignId:DEMO_ID,eventId:'r2-race-'+n,expectedRevision:7,kind:'add-private-note',payload:{note:{id:'r2-a-'+n,sceneId:'scene-1',text:n}}});
 const p1=a.applyEvent(cmd('x'),{beforePersist:pause}),p2=b.applyEvent(cmd('y'),{beforePersist:pause});
 await ready;release();assert.equal((await p1).status,'committed');assert.equal((await p2).status,'committed');
 const final=await a.readCampaign();assert.equal(final.revision,8);
 assert.equal(final.privateNotes.filter(n=>n.id.startsWith('r2-a-')).length,1); // proven unsafe
});
