/** L003 integrator entry generator: owners remain independent, never mount services. */
import {resolve,sep} from 'node:path';
const roles=new Set(['ports','rules','catalog','storage','studio','player','creators']);
export function makeEntry({target,manifest,repository}){
 if(!['mj','player'].includes(target))throw Error('Invalid target');
 if(manifest.schema!=='cer.dg003.integration-manifest.v0'||!Array.isArray(manifest.components))throw Error('Invalid manifest');
 const seen=new Set(),selected=[];
 for(const entry of manifest.components){
  if(!roles.has(entry.role)||seen.has(entry.role)||typeof entry.entry!=='string'||!Array.isArray(entry.paths)||!entry.paths.includes(entry.entry)||
   !/^[a-f0-9]{40}$/.test(entry.blobSha??'')||!(entry.commit===null||/^[a-f0-9]{40}$/.test(entry.commit??'')))throw Error('Invalid provenance');
  seen.add(entry.role);
  const absolute=resolve(repository,entry.entry);
  const prefix=resolve(repository,'experiments/dg-lot003/src')+sep;
  if(!absolute.startsWith(prefix)||!absolute.includes(sep+entry.role+sep))throw Error('Out-of-owner module');
  if(target==='player' ? entry.role==='player' : entry.role!=='player')selected.push({...entry,absolute});
 }
 const runtime=resolve(repository,'experiments/dg-lot003/tools/runtime.mjs');
 const result=[`import {mountIntegratedMJ,mountIntegratedPlayer} from ${JSON.stringify(runtime)};`];
 selected.forEach((x,i)=>result.push(`import * as x${i} from ${JSON.stringify(x.absolute)};`));
 result.push('const owners=Object.create(null);');
 selected.forEach((x,i)=>result.push(`owners[${JSON.stringify(x.role)}]=x${i};`));
 result.push('const status=document.getElementById("status");');
 result.push(`try { if(${JSON.stringify(target)}==='mj')mountIntegratedMJ({owners,doc:document});else mountIntegratedPlayer({owners,doc:document}); status.textContent="Modules présents — recette QA nécessaire";} catch(error){status.textContent="Assemblage incomplet : "+error.message;console.error(error);}`);
 return result.join('\n');
}
