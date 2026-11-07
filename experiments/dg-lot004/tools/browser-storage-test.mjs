/** DG004 P0 test-only loopback probe. No public/player origin endpoint.
 * Uses real ARCHIVES native storage and INTÉGRATION runtime in Chrome.
 * All campaigns and backups below are synthetic and isolated by temporary profile.
 */
import * as owner from '../../dg-lot003/src/storage/storage.mjs';
import {createValidatedStorage} from '../../dg-lot003/tools/runtime.mjs';
import {studioToArchive} from '../../dg-lot003/tools/adapters.mjs';
const KEY='cer.dg003.private.campaign.v0';
const ports=[],previews=new Map(),replacements=new Map(),edits=new Map();let editSequence=0;
const make=(revision=0)=>({
 schema:owner.STORAGE_SCHEMA,id:'browser-parent-p0',title:'Navigateur fictif',revision,
 characters:[],creatures:[],scenes:[],activeSceneId:'',privateNotes:[],
 extensions:{privateCanary:'CHROME_P0_ONLY_MJ',futureUnknown:{retained:true}}
});
function edit(value,revision,name){
 const next=structuredClone(value);next.revision=revision;
 next.scenes.push({id:name,title:name,privateNotes:'MJ_CANARY_'+name});return next;
}
function create({withoutLock=false}={}){
 const x=createValidatedStorage(owner,localStorage,{
  indexedDB:window.indexedDB,locks:withoutLock?null:window.navigator.locks,browserContext:true
 });
 ports.push(x);return ports.length-1;
}
const operations={
 isReady:true,
 lockAvailable:()=>typeof navigator.locks?.request==='function',
 original:()=>localStorage.getItem(KEY),
 reset:()=>{localStorage.removeItem(KEY);return localStorage.getItem(KEY)===null},
 create,make,edit,
 load:async i=>ports[i].load(),
 save:async(i,x)=>{await ports[i].save(x);return {saved:true}},
 async beginEdit(i){
  const session=await ports[i].beginEdit();
  const id='edit-'+(++editSequence);
  edits.set(id,{port:i,handle:session.handle});
  return {id,base:session.base};
 },
 async commitEdit(i,id,ops){
  const e=edits.get(id);
  if(!e||e.port!==i)throw Error('Private edit foreign session');
  return await ports[i].commitEdit(e.handle,ops);
 },
 async forkEdit(i,id){
  const e=edits.get(id);if(!e||e.port!==i)throw Error('Private edit foreign session');
  const fork=ports[i].forkEdit(e.handle),newId='edit-'+(++editSequence);
  edits.set(newId,{port:i,handle:fork});
  return newId;
 },
 async preview(i){
  const previous=await ports[i].load();
  const candidate=edit(make(0),0,'old-backup');
  const original=await owner.exportPrivate(studioToArchive(candidate,owner.createCampaign));
  const preview=await ports[i].previewRestore({bytes:original.bytes});
  previews.set(i,{preview,previous});
  return {preview:true,backupBytes:original.bytes.length};
 },
 async restore(i){
  const item=previews.get(i);
  if(!item)throw Error('P0 preview absent');
  const replacement=await ports[i].restore(item.preview,{previous:item.previous});
  replacements.set(i,replacement);return {restoredInMemoryOnly:true};
 },
 async commit(i){await ports[i].save(replacements.get(i));return {committed:true}},
 async loadAfter(i){const c=await ports[i].load();return c?.scenes?.map(s=>s.id)??[]},
};
if(location.origin!=='http://127.0.0.1:4173'||location.pathname!=='/p0-storage-test.html')
 throw Error('P0 browser contract only on local MJ fixture origin');
window.__dg004P0=Object.freeze(operations);
document.getElementById('status').textContent='P0_TEST_BROWSER_READY';
