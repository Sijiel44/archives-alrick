/** L004 genuine Chrome/HTTP demonstration walkthrough, isolated test profile, no mocks. */
import {spawn,spawnSync} from 'node:child_process';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {setTimeout as sleep} from 'node:timers/promises';
import WebSocket from 'ws';
import {probeLocalPreview} from '../builder/src/probe.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const MJ='http://127.0.0.1:4173',PLAYER='http://127.0.0.1:4174';
const binary=process.env.CHROMIUM_PATH??'google-chrome-stable';
const version=spawnSync(binary,['--version'],{encoding:'utf8',timeout:8000});
if(version.status!==0)throw Error('OFFICIAL_CHROME_NOT_AVAILABLE '+String(version.error??version.stderr));
console.log('DG004_CHROME',version.stdout.trim());
const tmp=await mkdtemp(join(tmpdir(),'dg004-e2e-'));
let server,browser,stderr='',out='',spawnError=null,exit=null,endpoint=null;
const fail=x=>{throw Error(x)};
async function until(fn,attempts=90){
 let last;for(let i=0;i<attempts;i++){
  try{const x=await fn();if(x)return x;}catch(e){last=e;}
  await sleep(160);
 }throw Error('DG004_TIMEOUT '+(last?.message??''));
}
async function json(uri){const r=await fetch(uri,{signal:AbortSignal.timeout(1800)});if(!r.ok)throw Error('HTTP '+r.status);return r.json();}
function verifyEndpoint(text){
 const m=text.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/devtools\/browser\/[0-9a-zA-Z-]+)/);
 if(!m)return null;const url=new URL(m[1]),n=Number(url.port);
 if(url.protocol!=='ws:'||url.hostname!=='127.0.0.1'||!Number.isSafeInteger(n)||n<1||n>65535||
  !/^\/devtools\/browser\/[0-9a-zA-Z-]+$/.test(url.pathname))fail('CHROME_NOT_CHILD_LOOPBACK');
 return {port:n,ws:url.href};
}
class CDP{
 constructor(ws){this.ws=ws;this.id=0;this.waiting=new Map();ws.on('message',value=>{
  const v=JSON.parse(String(value)),p=this.waiting.get(v.id);if(!p)return;
  this.waiting.delete(v.id);if(v.error)p.reject(Error(v.error.message));else p.resolve(v.result);
 });}
 static async open(url){const ws=new WebSocket(url);await new Promise((ok,no)=>{ws.once('open',ok);ws.once('error',no);});return new CDP(ws);}
 call(method,params={}){return new Promise((ok,no)=>{const id=++this.id;this.waiting.set(id,{resolve:ok,reject:no});this.ws.send(JSON.stringify({id,method,params}),e=>{if(e){this.waiting.delete(id);no(e);}});});}
 async eval(expression){const result=await this.call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});
  if(result.exceptionDetails)throw Error('DOM:'+result.exceptionDetails.text+' '+(result.exceptionDetails.exception?.description??''));
  return result.result?.value;}
 close(){this.ws.close();}
}
function click(label){return '(()=>{const e=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==='+JSON.stringify(label)+');if(!e)throw Error("missing "+'+JSON.stringify(label)+');e.click();return true;})()';}
const textContains=x=>'document.body.innerText.includes('+JSON.stringify(x)+')';
try{
 server=spawn(process.execPath,[resolve(root,'tools/serve.mjs')],{stdio:['ignore','pipe','pipe']});
 let serverLog='';server.stderr?.on('data',x=>serverLog=(serverLog+String(x)).slice(-6000));
 await until(async()=>{const a=await fetch(MJ,{signal:AbortSignal.timeout(1500)}),b=await fetch(PLAYER,{signal:AbortSignal.timeout(1500)});return a.status===200&&b.status===200;});
 const builderProbe=await probeLocalPreview();
 if(!builderProbe.ok||builderProbe.checks.length!==8)
  fail('BUILDER_PROBE_FAIL '+JSON.stringify(builderProbe.checks));
 if((await fetch(PLAYER+'/assets/mj.js')).status!==404|| (await fetch(MJ+'/player.html')).status!==404)
  fail('ORIGIN_ISOLATION_FAIL');
 browser=spawn(binary,['--headless=new','--no-first-run','--no-default-browser-check','--disable-gpu',
  '--remote-debugging-port=0','--user-data-dir='+join(tmp,'chrome'),MJ],{stdio:['ignore','pipe','pipe']});
 browser.stderr?.on('data',x=>{stderr=(stderr+String(x)).slice(-14000);endpoint??=verifyEndpoint(stderr);});
 browser.stdout?.on('data',x=>out=(out+String(x)).slice(-3000));
 browser.on('error',e=>{spawnError=e.message;});browser.on('exit',(code,signal)=>exit={code,signal});
 const located=await until(async()=>{
  if(spawnError||exit)fail('BROWSER_START '+JSON.stringify({spawnError,exit,stderr}));
  if(endpoint)return endpoint;
  try{const raw=await readFile(join(tmp,'chrome/DevToolsActivePort'),'utf8');
   const [port,path]=raw.split(/\r?\n/);const n=Number(port);
   if(!Number.isSafeInteger(n)||n<=0||n>65535||!/^\/devtools\/browser\/[a-zA-Z0-9-]+$/.test(path??''))return null;
   return {port:n,ws:'ws://127.0.0.1:'+n+path};
  }catch(e){if(e.code==='ENOENT')return null;throw e;}
 },125);
 const base='http://127.0.0.1:'+located.port;
 const versionInfo=await until(()=>json(base+'/json/version'));
 if(versionInfo.webSocketDebuggerUrl!==located.ws)fail('CHROME_CDP_SESSION_MISMATCH');
 const target=await until(async()=>(await json(base+'/json')).find(x=>x.type==='page'&&x.url.startsWith(MJ)));
 const mj=await CDP.open(target.webSocketDebuggerUrl);await mj.call('Runtime.enable');
 await until(()=>mj.eval('!!document.querySelector("#dg004-demo-root button")'));
 const nav=await mj.eval('(()=>{const root=document.querySelector("[data-l004-preview-navigation]");if(!root)return null;return {count:root.querySelectorAll("button[data-preview-step]").length,labels:[...root.querySelectorAll("button")].map(x=>x.textContent.trim())};})()');
 if(nav?.count!==7)fail('BUILDER_NAV_NOT_MOUNTED '+JSON.stringify(nav));
 // Refuse an existing local private backup before any mock scenario is started.
 await mj.eval('localStorage.setItem("cer.dg003.private.campaign.v0","LEGACY_USER_BACKUP");localStorage.setItem("dg004-unrelated","keep")');
 await mj.eval(click('Démarrer la démonstration fictive'));
 await until(()=>mj.eval(textContains('DEMO_BLOCKED')));
 if((await mj.eval('localStorage.getItem("cer.dg003.private.campaign.v0")'))!=='LEGACY_USER_BACKUP')
  fail('OLD_USER_BACKUP_CHANGED');
 await mj.eval('localStorage.removeItem("cer.dg003.private.campaign.v0")');
 await mj.eval(click('Démarrer la démonstration fictive'));
 await until(()=>mj.eval(textContains('DEMO_READY')),130);
 const before=await mj.eval('({privateEnvelope:localStorage.getItem("cer.dg003.private.campaign.v0"),marker:localStorage.getItem("cer.dg004.demo.marker.v0")})');
 if(!before.privateEnvelope||!before.marker)fail('DG004_DEMO_NOT_PERSISTED');
 await mj.eval(click('Ouvrir la fenêtre joueur'));
 const playerTarget=await until(async()=>(await json(base+'/json')).find(x=>x.type==='page'&&x.url.startsWith(PLAYER)));
 const player=await CDP.open(playerTarget.webSocketDebuggerUrl);await player.call('Runtime.enable');
 await until(()=>mj.eval(textContains('Fenêtre joueur connectée')));
 const checkbox='(()=>{const e=[...document.querySelectorAll("label")].find(x=>x.textContent.includes("Partager le titre de la scène"));if(!e)throw Error("missing share title");e.querySelector("input").click();return true;})()';
 await mj.eval(checkbox);
 await mj.eval(click('Publier uniquement la sélection'));
 await until(()=>player.eval(textContains('Passerelle d’essai (fiction)')));
 const playerHtml=await player.eval('document.documentElement.outerHTML+JSON.stringify(localStorage)');
 if(/CANARY_DG004_PRIVATE_FAKE_NOT_FOR_PLAYER|DG004_FAKE_PRIVATE|privateSnapshot|DG004_SYNTHETIC_ONLY/.test(playerHtml)||await player.eval('localStorage.length')!==0)
  fail('DG004_PRIVATE_LEAK');
 await mj.eval(click('Quitter et effacer uniquement la démonstration'));
 await until(()=>mj.eval(textContains('DEMO_CLEARED')));
 const after=await mj.eval('({privateEnvelope:localStorage.getItem("cer.dg003.private.campaign.v0"),marker:localStorage.getItem("cer.dg004.demo.marker.v0"),unrelated:localStorage.getItem("dg004-unrelated")})');
 if(after.privateEnvelope!==null||after.marker!==null||after.unrelated!=='keep')
  fail('DG004_ROLLBACK_CHANGED_OTHER_DATA '+JSON.stringify(after));
 player.close();mj.close();
 console.log('DG004_BROWSER_DEMO_OK',JSON.stringify({source:'local-only',originMJ:MJ,originPlayer:PLAYER,
  optIn:true,builderHttpChecks:builderProbe.checks.length,builderNavigationSteps:nav.count,seededPJ:1,seededCreature:1,seededScenes:1,playerCanaryAbsent:true,rollback:true,unrelatedKept:true}));
}catch(error){console.error('DG004_BROWSER_FAIL',error.stack??error.message,JSON.stringify({stderr:stderr.slice(-1400),out:out.slice(-500)}));process.exitCode=1;}
finally{
 const terminate=async(child)=>{if(!child||child.exitCode!==null||child.signalCode!==null)return;
  const closed=new Promise(resolve=>child.once('close',resolve));child.kill();await Promise.race([closed,sleep(2500)]);};
 await terminate(browser);await terminate(server);await rm(tmp,{recursive:true,force:true,maxRetries:8,retryDelay:200});
}
