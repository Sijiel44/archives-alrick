#!/usr/bin/env node
/** Local-only reversible launcher, starts existing PR85 build and 127.0.0.1-only server. */
import {spawn,spawnSync} from 'node:child_process';
import {readFile,stat} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {setTimeout as sleep} from 'node:timers/promises';
import {getPreviewPlan,SOURCE_PRODUCT_SHA,securityDisclosure} from './contract.mjs';
import {probeLocalPreview} from './probe.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..','..','..','..');
const product=resolve(root,'experiments/dg-lot003');
const runFile=(...parts)=>resolve(product,...parts);
const args=new Set(process.argv.slice(2));
if([...args].some(arg=>!['--once','--no-build'].includes(arg)))throw Error('Options autorisées : --once, --no-build');
const plan=getPreviewPlan();
const testGit=(cmd,...a)=>spawnSync(cmd,a,{cwd:root,encoding:'utf8',timeout:12000,maxBuffer:16384});
const head=testGit('git','rev-parse','HEAD');
if(head.status!==0)throw Error('Checkout Git obligatoire ; ne pas lancer depuis un dossier de fichiers isolés');
const ancestry=testGit('git','merge-base','--is-ancestor',SOURCE_PRODUCT_SHA,head.stdout.trim());
if(ancestry.status!==0)throw Error('Le HEAD courant ne descend pas du commit produit PR85 fixé');
const manifest=JSON.parse(await readFile(runFile('manifest.json'),'utf8'));
if(manifest.schema!=='cer.dg003.integration-manifest.v0'||!Array.isArray(manifest.components)||
    !['ports','rules','catalog','storage','studio','player','creators'].every(role=>manifest.components.some(c=>c.role===role)))
  throw Error('Le produit L003 n’est pas entièrement assemblé');
if(process.env.HOST||process.env.PORT||process.env.PREVIEW_HOST||process.env.PREVIEW_ORIGIN)
  throw Error('Override réseau refusé : seules les deux origines loopback officielles sont admises');
console.log('L004_PREVIEW_SOURCE',SOURCE_PRODUCT_SHA,'CHECKOUT',head.stdout.trim());
console.log('L004_PREVIEW_POLICY',securityDisclosure());
async function command(file){
  return await new Promise((ok,fail)=>{
    const child=spawn(process.execPath,[file],{cwd:root,stdio:'inherit',env:{...process.env}});
    child.once('error',fail);child.once('exit',(code,signal)=>code===0?ok():fail(Error('Command failed '+file+' '+(signal??code))));
  });
}
if(!args.has('--no-build'))await command(runFile('tools','build.mjs'));
else await Promise.all(['index.html','player.html','assets/mj.js','assets/player.js'].map(p=>stat(runFile('dist',p))));
const server=spawn(process.execPath,[runFile('tools','serve.mjs')],{cwd:root,stdio:['ignore','pipe','pipe'],env:{...process.env}});
let log='';for(const stream of [server.stdout,server.stderr])stream.on('data',chunk=>{log=(log+chunk.toString()).slice(-12000);});
let closing=false;
async function stop(){if(closing)return;closing=true;if(server.exitCode===null&&server.signalCode===null)server.kill('SIGTERM');}
for(const sig of ['SIGINT','SIGTERM'])process.once(sig,()=>{void stop().then(()=>process.exit(sig==='SIGINT'?130:143));});
let probe;
try{
  for(let i=0;i<60;i++){
    if(server.exitCode!==null)throw Error('Serveur L003 arrêté : '+log);
    probe=await probeLocalPreview({timeoutMs:1200});
    if(probe.ok)break;
    await sleep(180);
  }
  if(!probe?.ok)throw Error('Contrôles HTTP échoués : '+JSON.stringify(probe?.checks)+'\n'+log);
  console.log('L004_PREVIEW_READY',JSON.stringify({mj:plan.mj.entry,player:plan.player.entry,checks:probe.checks.length}));
  if(args.has('--once')){await stop();process.exit(0);}
  await new Promise((resolve,reject)=>{server.once('exit',code=>code===0?resolve():reject(Error('Serveur arrêté : '+code+' '+log)));});
}catch(error){console.error('L004_PREVIEW_FAIL',String(error.message??error));await stop();process.exitCode=1;}
