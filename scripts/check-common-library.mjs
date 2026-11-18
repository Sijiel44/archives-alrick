import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]);
const {entries}=JSON.parse(await readFile(path.join(root,'library-index.json'),'utf8'));
assert(entries.length>0);assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);
let variants=0,images=0;
for(const entry of entries){
 assert(entry.id&&entry.title&&entry.category&&entry.variants.length);
 assert.doesNotMatch(entry.description,/révélations? sur l’histoire|révélations? de campagne|spoilers?/i);
 for(const raw of [...entry.variants.map(v=>v.href),entry.image].filter(Boolean)){
  const url=new URL(raw,'https://site.invalid/');assert.equal(url.origin,'https://site.invalid');
  const filename=path.resolve(root,'.'+url.pathname+(url.pathname.endsWith('/')?'index.html':''));assert(filename.startsWith(root+path.sep));await access(filename);
 }
 for(const v of entry.variants){assert(v.status);assert(['game','reading'].includes(v.kind));variants++;}
 if(entry.image)images++;
}
console.log(`BIBLIOTHEQUE_COMMUNE_OK · ${entries.length} fiches · ${variants} lectures · ${images} images locales · aucun lien de lecture externe`);
