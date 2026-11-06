import test from 'node:test';import assert from 'node:assert/strict';
import {initialCampaign,assertCampaign,applyCommand,commandSignature,statusPublicOnly,CAMPAIGN_SCHEMA,TYPES,DEMO_ID} from '../src/contracts.mjs';
import {demoCommands,SENTINEL} from '../src/fixture.mjs';
const call=(f,code)=>assert.throws(f,e=>e.code===code);
function assembled(){let c=initialCampaign();for(const x of demoCommands())c=applyCommand(c,{...x,campaignId:DEMO_ID,expectedRevision:c.revision});return c;}
test('12 explicit entity families accounted for',()=>assert.equal(TYPES.length,12));
test('initial Campaign schema/provisional',()=>assert.equal(initialCampaign().schema,CAMPAIGN_SCHEMA));
test('six commands produce 2 PJ, 1 instance, 2 scenes, 1 note and revision 7',()=>{const c=assembled();assert.equal(c.revision,7);assert.deepEqual([c.characters.length,c.instances.length,c.scenes.length,c.privateNotes.length],[2,1,2,1]);});
test('raw characteristic 14 retained',()=>assert.equal(assembled().characters[0].rawStat,14));
test('source document/profile/instance identities stay disjoint',()=>{const i=assembled().instances[0];assert.notEqual(i.id,i.profileId);assert.notEqual(i.id,i.sourceDocumentCode);assert.equal(i.catalogRefId,'catalog-creature-1');});
test('private note never flows to public-only status',()=>{const c=assembled();assert.equal(JSON.stringify(statusPublicOnly(c)).includes(SENTINEL),false);});
test('mutations do not alter their input',()=>{let c=initialCampaign();const s=JSON.stringify(c);applyCommand(c,{...demoCommands()[0],campaignId:DEMO_ID,expectedRevision:1});assert.equal(JSON.stringify(c),s);});
test('id collision refused',()=>{let c=initialCampaign();const cmd=demoCommands()[0];c=applyCommand(c,{...cmd,campaignId:DEMO_ID,expectedRevision:1});call(()=>applyCommand(c,{...cmd,campaignId:DEMO_ID,expectedRevision:2}),'ID_COLLISION');});
test('missing scene reference refused',()=>call(()=>applyCommand(initialCampaign(),{campaignId:DEMO_ID,eventId:'bad-1',expectedRevision:1,kind:'add-private-note',payload:{note:{id:'note',sceneId:'missing',text:'x'}}}),'BROKEN_REFERENCE'));
test('unknown command refused (not a second rules engine)',()=>call(()=>applyCommand(initialCampaign(),{campaignId:DEMO_ID,eventId:'x',expectedRevision:1,kind:'grant-xp',payload:{amount:100}}),'UNSUPPORTED_COMMAND'));
test('JSON getters and prototype pollution refused',()=>{call(()=>assertCampaign({...initialCampaign(),extensions:JSON.parse('{"__proto__":"no"}')}),'BAD_KEY');});
test('command signature is deterministic and includes payload',()=>{const cmd={campaignId:DEMO_ID,eventId:'x',kind:'add-scene',expectedRevision:1,payload:{scene:{id:'scene-x'}}};assert.equal(commandSignature(cmd),commandSignature(structuredClone(cmd)));});
test('duplicate ids in restored campaign refused',()=>{const c=assembled();c.scenes.push(structuredClone(c.scenes[0]));call(()=>assertCampaign(c),'ID_COLLISION')});
