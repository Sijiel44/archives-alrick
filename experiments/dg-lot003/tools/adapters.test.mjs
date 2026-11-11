import test from 'node:test';
import assert from 'node:assert/strict';
import {studioToArchive,archiveToStudio,creatorToCatalog,OVERLAY_KEY} from './adapters.mjs';
import * as storage from '../src/storage/storage.mjs';
import * as catalog from '../src/catalog/index.mjs';

const encoder=new TextEncoder();
const hex=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
async function imported(){
 const original=encoder.encode('\uFEFF { "schema":"alrick.sheets.v3","unknownEnvelope":{"note":"privé"},"sheets":[{"id":"pj-test","schema":"alrick.sheet.v3","name":"Personnage inventé","stats":{"physique":14},"unknownSheet":{"future":"préservé"}}]} \n');
 const seed=storage.createCampaign({id:'campaign-001',name:'Test privé'});
 const preview=await storage.previewImport(original,seed);
 const committed=await storage.commitImport(seed,preview);
 return {original,entry:committed.characters[0]};
}
function studioCampaign(entry){
 return {schema:'cer.studio.dg003.provisional.v0',id:'campaign-001',title:'Campagne fictive',revision:7,
 characters:[{id:entry.id,publicLabel:'Éclaireuse fictive',privateSnapshot:{...structuredClone(entry),extraPrivate:{future:'yes'}},unknownCharacterUI:17}],
 creatures:[{id:'creature-001',publicLabel:'Témoin',privateSnapshot:{secret:'canari'}}],
 scenes:[{id:'scene-001',title:'Scène',privateNotes:'SECRET_CANARY_123',publicDescription:'Description',participantIds:[]}],
 activeSceneId:'scene-001',extensions:{unknownExtension:{v:1}},privateNotes:[{id:'note-001',text:'secret'}],
 arbitraryTopLevel:{retained:true}};
}
test('Archive/STUDIO roundtrip retains exact original raw source and all private unknowns',async()=>{
 const {original,entry}=await imported();
 const originalStudio=studioCampaign(entry);
 const archive=studioToArchive(originalStudio,storage.createCampaign);
 assert.equal(archive[OVERLAY_KEY].schema,'cer.dg003.studio-overlay.v1');
 assert.equal(archive.characters[0].source.sha256,await hex(original));
 assert.equal(archive.characters[0].sheet.stats.physique,14);
 const exported=await storage.exportPrivate(archive);
 assert.equal(exported.confidential,true);
 const preview=await storage.previewRestore(exported.bytes,{expectedSha256:exported.sha256});
 const verified=await storage.commitRestore(preview);
 const restored=archiveToStudio(verified);
 assert.deepEqual(restored.arbitraryTopLevel,{retained:true});
 assert.deepEqual(restored.privateNotes,[{id:'note-001',text:'secret'}]);
 assert.equal(restored.characters[0].unknownCharacterUI,17);
 assert.deepEqual(restored.characters[0].privateSnapshot.extraPrivate,{future:'yes'});
 assert.equal(restored.characters[0].privateSnapshot.sheet.stats.physique,14);
 assert.deepEqual(await storage.recoverOriginalBytes(verified.characters[0]),original);
 const next=studioToArchive(restored,storage.createCampaign);
 const second=await storage.exportPrivate(next);
 assert.equal((await storage.commitRestore(await storage.previewRestore(second.bytes))).characters[0].source.sha256,await hex(original));
});
test('Export refuses missing raw sheet or lost provenance',async()=>{
 const {entry}=await imported();
 const state=studioCampaign(entry);delete state.characters[0].privateSnapshot.sheet;
 assert.throws(()=>studioToArchive(state,storage.createCampaign),/Raw ARCHIVES/);
});
test('Multisheet handled by authoritative ARCHIVES, no implicit selection in Studio adapter',async()=>{
 const two=encoder.encode(JSON.stringify({schema:'alrick.sheets.v2',sheets:[{id:'a',stats:{physique:14}},{id:'b',stats:{physique:15}}]}));
 const p=await storage.previewImport(two,storage.createCampaign({id:'c'}));
 assert.equal(p.entries.length,2);
});
test('Creator => INDEX provenance/restrictions and descriptive only',()=>{
 const record={kind:'spell',schema:'cer.creator.dg003.descriptive.v0',name:'Lueur témoin',version:'1.0.0',
  description:'Lueur purement narrative, sans chiffre.',limitations:'Aucune exécution automatique'};
 const entry=creatorToCatalog(record,catalog,'campaign-001');
 assert.equal(entry.provenance.originKind,'campaign');
 assert.equal(entry.provenance.sourceVersion,'1.0.0');
 assert.deepEqual(entry.restrictions,['Aucune exécution automatique']);
 assert.equal(catalog.previewCatalogEntry(entry).preview.executable,false);
 assert.throws(()=>creatorToCatalog({...record,version:'v1'},catalog,'campaign-001'),/semantic version/);
 assert.throws(()=>creatorToCatalog({...record,description:'Inflige +2 dégâts.'},catalog,'campaign-001'),/numeric/);
});

test('Large private notes retain byte-exact ARCHIVES export after reversible Studio projection, without duplicate overlay',async()=>{
 const {entry}=await imported();
 const initial=studioCampaign(entry);
 initial.privateNotes=[{id:'private-large',opaque:'Z'.repeat(256*1024),future:{marker:'RAW_UNKNOWN_PRESERVED'}}];
 const first=await storage.exportPrivate(studioToArchive(initial,storage.createCampaign));
 const native=await storage.commitRestore(await storage.previewRestore(first.bytes));
 assert.equal(Object.hasOwn(native[OVERLAY_KEY].fields,'privateNotes'),false,'private data must not be duplicated');
 const round=archiveToStudio(native);
 const second=await storage.exportPrivate(studioToArchive(round,storage.createCampaign));
 assert.deepEqual(second.bytes,first.bytes,'no silent duplication, mutation, or byte drift');
 assert.equal(round.privateNotes[0].future.marker,'RAW_UNKNOWN_PRESERVED');
});

function byteEqualityProof(before,after){
 const left=Buffer.from(before.bytes),right=Buffer.from(after.bytes);
 let firstMismatch=-1;
 const size=Math.min(left.length,right.length);
 for(let i=0;i<size;i++){if(left[i]!==right[i]){firstMismatch=i;break;}}
 if(firstMismatch<0 && left.length!==right.length)firstMismatch=size;
 return {beforeBytes:left.length,afterBytes:right.length,
  beforeSHA256:before.sha256,afterSHA256:after.sha256,firstMismatch,
  compare:Buffer.compare(left,right)};
}
test('L003 QA: 6MiB native unknown AFTER overlay survives archiveToStudio/studioToArchive byte-for-byte',async()=>{
 const initial={schema:'cer.studio.dg003.provisional.v0',id:'qa-native-after-overlay',
  title:'QA exact archive',revision:7,characters:[],creatures:[],scenes:[],
  privateNotes:[],activeSceneId:'',extensions:{}};
 const archive=studioToArchive(initial,storage.createCampaign);
 archive.qaUnknownLargeExtension={marker:'synthetic',payload:'Q'.repeat(6*1024*1024)};
 assert.deepEqual(Object.keys(archive).slice(-2),[OVERLAY_KEY,'qaUnknownLargeExtension'],
  'fixture must place unknown after the native Studio overlay');
 const before=await storage.exportPrivate(archive);
 const studio=archiveToStudio(archive);
 const round=studioToArchive(structuredClone(studio),storage.createCampaign);
 assert.deepEqual(Object.keys(round),Object.keys(archive),'native key order must be preserved');
 const after=await storage.exportPrivate(round);
 const evidence=byteEqualityProof(before,after);
 assert.equal(evidence.compare,0,JSON.stringify(evidence));
 assert.equal(evidence.beforeSHA256,evidence.afterSHA256,JSON.stringify(evidence));
 assert.equal(round.qaUnknownLargeExtension.payload.length,6*1024*1024);
 assert.equal(Object.hasOwn(round[OVERLAY_KEY].fields,'privateNotes'),false,'private notes not duplicated');
});
test('L003 QA: v2/v3 raw PJ and late unknown keep native SHA, catalog and legacy private fields',async()=>{
 for(const v of ['v2','v3']){
  const doc={schema:'alrick.sheets.'+v,unknownEnvelope:{marker:'legacy-'+v},
   sheets:[{id:'pj-'+v,schema:'alrick.sheet.'+v,name:'PJ '+v,
    stats:{physique:14},unknownSheet:{future:'intact-'+v}}]};
  const raw=encoder.encode('\uFEFF '+JSON.stringify(doc)+' \n');
  const campaign=storage.createCampaign({id:'legacy-'+v,name:'Legacy '+v});
  const preview=await storage.previewImport(raw,campaign);
  const committed=await storage.commitImport(campaign,preview);
  const state={schema:'cer.studio.dg003.provisional.v0',id:campaign.id,
   title:'Legacy '+v,revision:5,
   characters:committed.characters.map(c=>({id:c.id,publicLabel:'PJ '+v,
     privateSnapshot:{...structuredClone(c),futurePrivate:{marker:'keep-'+v}}})),
   creatures:[],scenes:[],privateNotes:[{id:'note-'+v,text:'SECRET_LEGACY'}],
   activeSceneId:'',extensions:{catalog:[{id:'legacy-catalog-'+v,version:'1.0.0',executable:false}],
    futureCatalog:{marker:'retain-'+v}}};
  const archive=studioToArchive(state,storage.createCampaign);
  archive.qaUnknownLargeExtension={marker:'late-'+v,payload:'q'.repeat(1024)};
  const before=await storage.exportPrivate(archive);
  const verified=await storage.commitRestore(await storage.previewRestore(before.bytes));
  const restoredStudio=archiveToStudio(verified);
  const after=await storage.exportPrivate(studioToArchive(restoredStudio,storage.createCampaign));
  const evidence=byteEqualityProof(before,after);
  assert.equal(evidence.compare,0,JSON.stringify({version:v,...evidence}));
  assert.equal(evidence.beforeSHA256,evidence.afterSHA256,JSON.stringify({version:v,...evidence}));
  assert.deepEqual(restoredStudio.extensions,state.extensions);
  assert.deepEqual(restoredStudio.privateNotes,state.privateNotes);
  assert.equal(restoredStudio.characters[0].privateSnapshot.futurePrivate.marker,'keep-'+v);
  const returned=await storage.commitRestore(await storage.previewRestore(after.bytes));
  assert.deepEqual(await storage.recoverOriginalBytes(returned.characters[0]),raw);
 }
});

test('L003 QA: legitimate toString and hasOwnProperty unknown keys remain native JSON properties',async()=>{
 const state={schema:'cer.studio.dg003.provisional.v0',id:'qa-native-own-keys',
  title:'QA dictionnaire sans prototype',revision:3,characters:[],creatures:[],
  scenes:[],privateNotes:[],activeSceneId:'',extensions:{}};
 const archive=studioToArchive(state,storage.createCampaign);
 archive.toString={marker:'legitimate unknown toString'};
 archive.hasOwnProperty={marker:'legitimate unknown hasOwnProperty'};
 const before=await storage.exportPrivate(archive);
 const restored=archiveToStudio(await storage.commitRestore(await storage.previewRestore(before.bytes)));
 const afterArchive=studioToArchive(structuredClone(restored),storage.createCampaign);
 const after=await storage.exportPrivate(afterArchive);
 const evidence=byteEqualityProof(before,after);
 assert.equal(evidence.compare,0,JSON.stringify(evidence));
 assert.equal(evidence.beforeSHA256,evidence.afterSHA256,JSON.stringify(evidence));
 assert.deepEqual(afterArchive.toString,archive.toString);
 assert.deepEqual(afterArchive.hasOwnProperty,archive.hasOwnProperty);
 assert.equal(typeof afterArchive.toString,'object');
 assert.equal(typeof afterArchive.hasOwnProperty,'object');
});
