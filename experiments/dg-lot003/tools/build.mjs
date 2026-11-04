import {build} from 'esbuild';
import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {makeEntry} from './compose.mjs';
const project=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const repository=resolve(project,'..','..');
const dist=resolve(project,'dist');
const manifest=JSON.parse(await readFile(resolve(project,'manifest.json'),'utf8'));
if(manifest.schema!=='cer.dg003.integration-manifest.v0'||!Array.isArray(manifest.components))throw Error('Invalid manifest');
const builtEntries=Object.fromEntries(['mj','player'].map(target=>[target,makeEntry({target,manifest,repository})]));
await rm(dist,{recursive:true,force:true});
await mkdir(resolve(dist,'assets'),{recursive:true});
await Promise.all(['index.html','player.html'].map(file=>copyFile(resolve(project,file),resolve(dist,file))));
await writeFile(resolve(dist,'assets','app.css'),'body{font:1rem system-ui,sans-serif;margin:0 auto;max-width:72rem;padding:2rem;background:#f4f5f8;color:#182332}section{padding:1rem;border:1px solid #abb7c5;border-radius:.5rem;margin:1rem 0}button,input,select,textarea{font:inherit}button:focus-visible,input:focus-visible{outline:3px solid #286cc4}main{min-width:0}');
for(const [target,source] of Object.entries(builtEntries)){
 await build({stdin:{contents:source,resolveDir:repository,sourcefile:target+'-wiring.js',loader:'js'},bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:resolve(dist,'assets',target+'.js'),logLevel:'warning'});
}
const creators=manifest.components.find(item=>item.role==='creators');
if(creators){
 const module=await import(pathToFileURL(resolve(repository,creators.entry)).href);
 if(typeof module.CREATOR_STYLES!=='string')throw Error('CREATOR_STYLES unavailable');
 const hash=createHash('sha256').update(module.CREATOR_STYLES).digest('base64');
 await writeFile(resolve(dist,'style-csp.json'),JSON.stringify({hash:'sha256-'+hash}));
}else await writeFile(resolve(dist,'style-csp.json'),JSON.stringify({hash:null}));
await writeFile(resolve(dist,'manifest.json'),JSON.stringify(manifest,null,2));
const present=new Set(manifest.components.map(x=>x.role));
const complete=['ports','rules','catalog','storage','studio','player','creators'].every(x=>present.has(x));
console.log('BUILD_OK',dist,'modules',manifest.components.length,'qualification',complete?'À TESTER':'INCOMPLET');
