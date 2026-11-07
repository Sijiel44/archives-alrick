/** Cross-PR Node/CI fixture tests: need composite #102 + #105 + #104 checkout.
 * No migration, production UI, native rules or real indexedDB in this file.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateModelRecord,validateModelDataset,exportPrivateDataset,importPrivateDataset,makeSelectedPlayerCandidate}
 from '../../../../../p1a-index/src/data-model.mjs';
import {initialCampaign,assertCampaign,applyCommand,statusPublicOnly}
 from '../../../../../arch-storage-001/src/contracts.mjs';
import {makePrivateArchive,inspectPrivateArchive}
 from '../../../../../arch-storage-001/src/private-archive.mjs';
import {bridgeR2AteliersToIndex,recoverR2Originals,seedR2ProposalOnInitialCampaign,
 recoverR2FromArchiveCampaign,previewR2PlayerLabel} from './DATA_MODEL_R2_BRIDGE.proposal.mjs';
const source=JSON.parse(readFileSync(new URL('../DATA_MODEL_001_FIXTURES.proposal.json',import.meta.url),'utf8')).records;
const clone=x=>JSON.parse(JSON.stringify(x));
const ports={validateRecord:validateModelRecord,validateDataset:validateModelDataset};
const converted=()=>bridgeR2AteliersToIndex(source,ports).records;
const campaign=()=>seedR2ProposalOnInitialCampaign(initialCampaign({id:'camp:r2-fixtures'}),converted(),{assertCampaign});
const journal=c=>[{campaignId:c.id,eventId:'event-create',seq:1,kind:'create-campaign',signature:'genesis'}];

test('14 fixtures: INDEX validates without changing originals or 1/10/25 levels',()=>{
 const prior=JSON.stringify(source),out=converted();
 assert.equal(JSON.stringify(source),prior);
 assert.equal(out.length,14);assert.equal(validateModelDataset(out).ok,true);
 assert.deepEqual(out.filter(x=>x.recordKind==='pj'&&x.identity.instanceId).map(x=>x.data.level),[1,10,25]);
 assert.equal(new Set(out.map(x=>x.recordKind)).size,8);
});
test('definition > variant > instance are distinct, backward link retained',()=>{
 const out=converted();
 const d=out.find(x=>x.recordId==='def:creature:veilleur-brume');
 const v=out.find(x=>x.recordId==='var:creature:veilleur-n10');
 const i=out.find(x=>x.recordId==='inst:creature:veilleur-1');
 assert.equal(v.identity.definitionId,d.recordId);
 assert.equal(v.data.variantOf,d.recordId);
 assert.equal(v.identity.variantId,v.recordId);
 assert.equal(i.identity.definitionId,d.recordId);
 assert.equal(i.data.r2OriginalDefinitionRef,v.recordId);
 assert.equal(i.identity.instanceId,i.recordId);
});
test('collision, missing participant and metadata unknowns',()=>{
 const collision=clone(source);collision[1].recordId=collision[0].recordId;
 assert.throws(()=>bridgeR2AteliersToIndex(collision,ports),e=>e.code==='ID_COLLISION');
 const orphan=clone(source);
 orphan.find(x=>x.recordId==='inst:scene:rive-aube').links[0].targetId='inst:pj:absent';
 assert.throws(()=>bridgeR2AteliersToIndex(orphan,ports),e=>e.code==='INVALID_PARTICIPANT');
 const extras=clone(source);extras[0].provenance.sourceVersion=7;
 extras[0].legacy.unknownFields.future={unknown:[4,'non interprété']};
 const out=bridgeR2AteliersToIndex(extras,ports).records;
 assert.deepEqual(out[0].privacy.originalAteliersRecord,extras[0]);
 assert.equal(out[0].version,'0.1.0');
});
test('no canon/played, no mechanic approval, no secret or unlicensed media leaked',()=>{
 const out=converted();
 for(const r of out){
  assert.equal(r.state.layer,'proposal');assert.equal(r.state.attestation.status,'unverified');
  assert.equal(r.mechanics.validationStatus,'unvalidated');
  assert.equal(r.privacy.visibility,'mj-private');
 }
 const scene=out.find(x=>x.recordId==='inst:scene:rive-aube');
 assert.match(JSON.stringify(scene.privacy),/CANARI_MJ_NON_PUBLIC/);
 for(const payload of [makeSelectedPlayerCandidate(scene,{selected:true}),
  previewR2PlayerLabel(scene),statusPublicOnly(campaign())]){
  assert.equal(JSON.stringify(payload).includes('CANARI_MJ_NON_PUBLIC'),false);
  assert.equal(JSON.stringify(payload).includes('originalAteliersRecord'),false);
 }
 const item=out.find(x=>x.recordKind==='item');
 assert.equal(item.media[0].rights,'pending');
 assert.equal(item.media[0].visibility,'mj-private');
});
test('INDEX private export/import roundtrip exactly preserves #102 JSON',()=>{
 const pkg=exportPrivateDataset(converted());assert.equal(pkg.ok,true);
 const imported=importPrivateDataset(pkg.json);assert.equal(imported.ok,true);
 assert.deepEqual(recoverR2Originals(imported.value,{validateDataset:validateModelDataset}),source);
});
test('ARCHIVES campaign fixture stores exact original, unknowns; no add-draft command yet',()=>{
 const c=campaign();assertCampaign(c);
 assert.equal(c.creatorDrafts.length,14);
 assert.deepEqual(recoverR2FromArchiveCampaign(clone(c),
  {assertCampaign,validateDataset:validateModelDataset}),source);
 assert.equal(c.extensions.unknownFuture.retained,true);
 assert.throws(()=>seedR2ProposalOnInitialCampaign(c,converted(),{assertCampaign}),e=>e.code==='ARCHIVES_NOT_EMPTY');
 assert.throws(()=>applyCommand(c,{campaignId:c.id,eventId:'evt1',expectedRevision:c.revision,
  kind:'add-creator-draft',payload:{draft:{}}}),e=>e.code==='UNSUPPORTED_COMMAND');
});
test('ARCHIVES private SHA256 export → preview-import: 14 original records preserved',async()=>{
 const c=campaign(),event=journal(c),packed=await makePrivateArchive({campaign:c,journal:event});
 assert.match(packed.manifest.payloadSha256,/^[a-f0-9]{64}$/);
 const preview=await inspectPrivateArchive(packed.bytes);
 assert.equal(preview.kind,'private-preview');
 assert.deepEqual(preview.journal,event);
 assert.deepEqual(recoverR2FromArchiveCampaign(preview.campaign,
  {assertCampaign,validateDataset:validateModelDataset}),source);
});
test('tampered private ARCHIVES export blocked without touching source campaign',async()=>{
 const c=campaign(),packed=await makePrivateArchive({campaign:c,journal:journal(c)});
 const prior=JSON.stringify(c),tampered=JSON.parse(new TextDecoder().decode(packed.bytes));
 tampered.payload.campaign.creatorDrafts[0].privateIndexRecord.narrative.name='FALSIFIÉ';
 await assert.rejects(inspectPrivateArchive(new TextEncoder().encode(JSON.stringify(tampered))),
  e=>e.code==='HASH_MISMATCH');
 assert.equal(JSON.stringify(c),prior);
});
