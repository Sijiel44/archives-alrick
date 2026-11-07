/**
 * DG P0-STORAGE-SUPPORT-001 — run IN OFFICIAL CHECKOUT at exact integration HEAD.
 * Real L003 storage and L004 creator persistence, synthetic values only.
 * Expected failures are deliberately NOT disabled or converted to skips.
 * node --test experiments/dg-lot004/tests/storage/P0_STORAGE_SUPPORT_REAL.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as owner from '../../../dg-lot003/src/storage/storage.mjs';
import {createValidatedStorage} from '../../../dg-lot003/tools/runtime.mjs';
import {createBrowserCyclePersistence,createCycle} from '../../src/creators/cycle-state.mjs';

const PRIVATE_KEY = 'cer.dg003.private.campaign.v0';
const CREATOR_KEY = 'cer.dg004.creators.private.demo.v0';
const clone = x => structuredClone(x);
const base = (id='p0-storage-fixture') => ({
  schema: owner.STORAGE_SCHEMA, id, title:'P0 campagne fictive', revision:0,
  characters:[], creatures:[], scenes:[], activeSceneId:'', privateNotes:[],
  extensions:{unknownFuture:{retained:true},secretCanary:'ONLY_FOR_MJ'}
});
function area(initial={}) {
  const map=new Map(Object.entries(initial));
  let before=null, after=null;
  const api={
    getItem(k){return map.has(k)?map.get(k):null},
    setItem(k,v){if(before)before(k,v);map.set(k,String(v));if(after)after(k,v)},
    removeItem(k){map.delete(k)},
    onBefore(f){before=f},onAfter(f){after=f},raw:map,
  };return api;
}
const errorString = x => String(x?.message ?? x);
function adapter(storage) { return createValidatedStorage(owner,storage,{indexedDB:null}); }

test('P0-S01 native store save -> await ACK -> load from independent adapter preserves unknowns',async()=>{
  const a=area(),first=adapter(a),p=base();p.scenes.push({id:'scene-1',privateNotes:'PRIVATE_CANARY',title:'Scène fictive'});
  await first.save(p);
  const reopened=await adapter(a).load();
  assert.deepEqual(reopened,p);
  assert.equal(reopened.extensions.unknownFuture.retained,true);
  assert.equal(reopened.scenes[0].privateNotes,'PRIVATE_CANARY');
});

test('P0-S02 failure before localStorage commit preserves previous snapshot and source unknowns',async()=>{
  const a=area(),s=adapter(a);const original=base();await s.save(original);
  const before=a.getItem(PRIVATE_KEY);a.onBefore((k)=>{if(k===PRIVATE_KEY)throw Error('INJECTED_QUOTA_BEFORE_COMMIT')});
  const updated=clone(original);updated.scenes.push({id:'scene-a',title:'New scene'});updated.revision++;
  await assert.rejects(s.save(updated),/INJECTED_QUOTA_BEFORE_COMMIT/);
  assert.equal(a.getItem(PRIVATE_KEY),before);
  assert.deepEqual(await s.load(),original);
});

test('P0-S03 ACK lost after durable write: independent reload sees same ID, never requires new instance',async()=>{
  const a=area(),s=adapter(a);const first=base();await s.save(first);
  const updated=clone(first);updated.creatures.push({id:'creature-original',sourceId:'fictive-profile',privateSnapshot:{arbitrary:true}});updated.revision=1;
  a.onAfter(k=>{if(k===PRIVATE_KEY)throw Error('ACK_LOST_AFTER_DURABLE_SETITEM')});
  await assert.rejects(s.save(updated),/ACK_LOST_AFTER_DURABLE_SETITEM/);
  a.onAfter(null);
  const reopened=await adapter(a).load();
  assert.equal(reopened.creatures.length,1);
  assert.equal(reopened.creatures[0].id,'creature-original');
  // Never auto-repeat the external copy; replay requires matching a pending journal.
});

test('P0-S04 native local private key foreign opaque: save/load refuses overwriting it',async()=>{
  const old='FOREIGN_PRIVATE_BACKUP_NOT_OURS',a=area({[PRIVATE_KEY]:old}),s=adapter(a);
  await assert.rejects(s.save(base()),/envelope|invalid|incompatible/i);
  assert.equal(a.getItem(PRIVATE_KEY),old);
});

test('P0-S05 historical backup with no matching journal must not authorize automatic duplicate',async()=>{
  const a=area(),s=adapter(a);const p=base();p.creatures.push({id:'already-persisted',source:{documentId:'fixture-source',profileId:'profile-fixture',ruleset:'m03'}});
  await s.save(p);
  const restored=await adapter(a).load();
  assert.equal(restored.creatures.length,1);
  // Storage may restore; creator must check for independent journal before creating any new instance.
  const cycleArea=area();const creator=createBrowserCyclePersistence({storage:cycleArea,key:CREATOR_KEY,origin:'http://127.0.0.1:4173'});
  const historical=createCycle('history-before-journal');await creator.save(historical);
  assert.equal((await creator.load()).extensions.pendingStudioOp,undefined);
  assert.equal(restored.creatures[0].id,'already-persisted');
});

test('P0-S06 creator pendingStudioOp persisted before action; independent creator reload',async()=>{
  const a=area(),one=createBrowserCyclePersistence({storage:a,key:CREATOR_KEY,origin:'http://127.0.0.1:4173'});
  const c=createCycle('journal-cycle');c.extensions.pendingStudioOp={kind:'creature',campaignId:'p0-storage-fixture',beforeIds:[],
    source:{documentId:'DOC-FICTIF',profileId:'profile-fixture',ruleset:'m03'}};
  await one.save(c);
  const two=createBrowserCyclePersistence({storage:a,key:CREATOR_KEY,origin:'http://127.0.0.1:4173'});
  const persisted=await two.load();
  assert.deepEqual(persisted.extensions.pendingStudioOp,c.extensions.pendingStudioOp);
  assert.equal(persisted.id,c.id);
});

test('P0-S07 foreign creator key MUST remain untouched (expected fail on old fixed-key persistence)',async()=>{
  const old='FOREIGN_CREATOR_BACKUP',a=area({[CREATOR_KEY]:old});
  const creator=createBrowserCyclePersistence({storage:a,key:CREATOR_KEY,origin:'http://127.0.0.1:4173'});
  await assert.rejects(creator.save(createCycle('different-cycle')),
    /foreign|existing|ownership|collision|conflict|refus|étrang|propri|ancien/i);
  assert.equal(a.getItem(CREATOR_KEY),old);
});

test('P0-S08 two tabs stale revision MUST be refused instead of lost update (expected fail old adapter)',async()=>{
  const a=area(),tabA=adapter(a),tabB=adapter(a);const initial=base();await tabA.save(initial);
  const left=await tabA.load(),right=await tabB.load();
  left.scenes.push({id:'scene-tab-a',title:'A'});left.revision++;
  right.scenes.push({id:'scene-tab-b',title:'B'});right.revision++;
  await tabA.save(left);
  await assert.rejects(tabB.save(right),/revision|stale|collision|conflict|concurrent|verrou/i,
    'An equal-revision concurrent write must not erase tab A');
  assert.deepEqual((await tabA.load()).scenes.map(x=>x.id),['scene-tab-a']);
});

test('P0-S09 two tabs creator stale revision MUST be rejected (expected fail old creator storage)',async()=>{
  const a=area(),opts={storage:a,key:CREATOR_KEY,origin:'http://127.0.0.1:4173'};
  const A=createBrowserCyclePersistence(opts),B=createBrowserCyclePersistence(opts);
  await A.save(createCycle('single-cycle'));const l=await A.load(),r=await B.load();
  l.revision=1;l.extensions.writer='A';await A.save(l);
  r.revision=1;r.extensions.writer='B';
  await assert.rejects(B.save(r),/revision|stale|collision|conflict|concurrent|verrou/i);
  assert.equal((await A.load()).extensions.writer,'A');
});
