/** Execute only on assembled clone containing exact owner #104 ARCH-STORAGE-001. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {makeArchStorageCandidate,recoverArchStorageCandidate} from '../src/model-r2.mjs';
import {assertCampaign} from '../../../arch-storage-001/src/contracts.mjs';
import {makePrivateArchive,inspectPrivateArchive} from '../../../arch-storage-001/src/private-archive.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const fixtures=JSON.parse(readFileSync(resolve(root,'../fixtures/R2_SYNTHETIC_CHAIN.json'),'utf8'));
const rows=fixtures.records;
test('P1 #104 vrai assertCampaign accepte la projection candidate (non commit)',()=>{
 const c=makeArchStorageCandidate(rows);assert.equal(c.ok,true);assertCampaign(c.campaign);
 assert.equal(c.persisted,false);assert.equal(c.campaign.extensions.indexP1R2.notApplied,true);
});
test('P1 #104 export/archive/private-preview puis réexport octet-exact pour snapshot fictif',async()=>{
 const candidate=makeArchStorageCandidate(rows);assert.equal(candidate.ok,true);
 const c=candidate.campaign;
 const journal=[{campaignId:c.id,eventId:'event-create',seq:1,kind:'create-campaign',signature:'genesis'}];
 const archive=await makePrivateArchive({campaign:c,journal});
 const restored=await inspectPrivateArchive(archive.bytes);
 assert.deepEqual(restored.campaign,c);assert.deepEqual(restored.journal,journal);
 const recovered=recoverArchStorageCandidate(restored.campaign);assert.equal(recovered.ok,true);
 assert.equal(JSON.stringify(recovered.value),JSON.stringify(rows));
 const again=await makePrivateArchive({campaign:restored.campaign,journal:restored.journal});
 assert.deepEqual(again.bytes,archive.bytes);assert.equal(again.sha256,archive.sha256);
});
test('P1 #104 rejette altération d’archive privée via SHA',async()=>{
 const candidate=makeArchStorageCandidate(rows);
 const journal=[{campaignId:candidate.campaign.id,eventId:'event-create',seq:1,kind:'create-campaign',signature:'genesis'}];
 const archive=await makePrivateArchive({campaign:candidate.campaign,journal});
 const x=JSON.parse(new TextDecoder().decode(archive.bytes));x.payload.campaign.title='altéré';
 await assert.rejects(()=>inspectPrivateArchive(new TextEncoder().encode(JSON.stringify(x))),e=>e.code==='HASH_MISMATCH');
});
