#!/usr/bin/env node
/** L004-A true Chrome CDP smoke over real served HTTP; desktop, tablet and optional narrow viewport. */
import {spawn,spawnSync} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {setTimeout as sleep} from 'node:timers/promises';
import WebSocket from 'ws'; // Existing repository dependency. No new package.
import {MJ_ORIGIN,PLAYER_ORIGIN} from './contract.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const launcher=resolve(here,'launch-local.mjs');
const temp=await mkdtemp(join(tmpdir(),'l004-browser-'));
let server,browser;
const logs=[];
const cap=9000;
function attach(child,name){for(const stream of [child.stdout,child.stderr])stream?.on('data',data=>{logs.push(name+': '+String(data).slice(0,1000));if(logs.length>60)logs.shift();});}
const until=async(fn,max=85,wait=150)=>{let last;for(let i=0;i<max;i++){try{const x=await fn();if(x)return x;}catch(e){last=e;}await sleep(wait);}throw Error('Timeout: '+String(last?.message??'condition'));};
const browserCandidate=process.env.CHROMIUM_PATH? [process.env.CHROMIUM_PATH]:['google-chrome-stable','google-chrome','/opt/google/chrome/chrome','/usr/bin/google-chrome-stable','/usr/bin/google-chrome'];
let chosen;
for(const name of browserCandidate){const which=spawnSync('which',[name],{encoding:'utf8',timeout:4000});if(which.status!==0)continue;const binary=which.stdout.trim();const ver=spawnSync(binary,['--version'],{encoding:'utf8',timeout:8000});if(ver.status===0){chosen={binary,version:(ver.stdout||ver.stderr).trim()};break;}}
if(!chosen){console.error('L004_BROWSER_NON_EXECUTE: Chrome officiel absent ou inutilisable; pas de bypass sandbox.');process.exit(2);}
class CDP {
 constructor(ws){this.ws=ws;this.id=0;this.pending=new Map();ws.on('message',msg=>{let v;try{v=JSON.parse(String(msg));}catch{return;}if(!v.id||!this.pending.has(v.id))return;const p=this.pending.get(v.id);this.pending.delete(v.id);v.error?p.reject(Error(v.error.message)):p.resolve(v.result);});}
 static async connect(url){const ws=new WebSocket(url);await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});return new CDP(ws);}
 call(method,params={}){const id=++this.id;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params}),error=>{if(error){this.pending.delete(id);reject(error);}});});}
 async evaluate(js){const v=await this.call('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true,userGesture:true});if(v.exceptionDetails)throw Error('Browser expression: '+v.exceptionDetails.text);return v.result?.value;}
 close(){this.ws.close();}
}
async function ready(url){return until(async()=>{const r=await fetch(url,{signal:AbortSignal.timeout(900)});return r.status===200&&r.headers.get('content-type')?.includes('text/html');});}
async function pageStatus(cdp,expectedWidth){
 await cdp.call('Emulation.setDeviceMetricsOverride',{width:expectedWidth,height:expectedWidth<600?844:expectedWidth<900?1024:800,deviceScaleFactor:1,mobile:expectedWidth<600});
 return await until(async()=>{const state=await cdp.evaluate(`(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,ready:!!document.querySelector('input[aria-label="Nom de la campagne"]'),creators:!!document.querySelector('[aria-label="Créateurs descriptifs DG-LOT-003"]'),root:!!document.querySelector('main[aria-label="Cockpit du Maître de Jeu"]'),viewport:!!document.querySelector('meta[name="viewport"]')}))()`);return state?.ready?state:null;});
}
async function launchBrowser(){
 const profile=join(temp,'chrome');
 browser=spawn(chosen.binary,['--headless=new','--no-first-run','--no-default-browser-check','--disable-gpu',
    '--remote-debugging-port=0','--user-data-dir='+profile,MJ_ORIGIN+'/'],{stdio:['ignore','pipe','pipe']});
 attach(browser,'Chrome');
 let chromeExit=null,chromeError=null;browser.on('exit',(code,signal)=>{chromeExit={code,signal};});browser.on('error',e=>{chromeError=e;});
 const endpoint=await until(async()=>{
  if(chromeError)throw chromeError;
  if(chromeExit)throw Error('Chrome exited '+JSON.stringify(chromeExit));
  let content;try{content=await readFile(join(profile,'DevToolsActivePort'),'utf8');}catch(e){if(e.code==='ENOENT')return null;throw e;}
  const [portString]=content.split(/\r?\n/);
  const port=Number(portString);return port>=1&&port<=65535&&Number.isSafeInteger(port)?port:null;
 },120);
 const debuggerUrl='http://127.0.0.1:'+endpoint;
 const version=await (await fetch(debuggerUrl+'/json/version')).json();
 if(!version.webSocketDebuggerUrl?.startsWith('ws://127.0.0.1:'+endpoint+'/devtools/browser/'))throw Error('Chrome endpoint invalid');
 const mjTarget=await until(async()=>{const pages=await(await fetch(debuggerUrl+'/json')).json();return pages.find(p=>p.type==='page'&&p.url.startsWith(MJ_ORIGIN)&&p.webSocketDebuggerUrl);});
 return {debuggerUrl,mj:await CDP.connect(mjTarget.webSocketDebuggerUrl)};
}
try{
  // Do not bind other interfaces or ports, do not launch public network services.
  server=spawn(process.execPath,[launcher,'--no-build'],{stdio:['ignore','pipe','pipe']});attach(server,'Preview');
  await ready(MJ_ORIGIN+'/');await ready(PLAYER_ORIGIN+'/');
  const {debuggerUrl,mj}=await launchBrowser();await mj.call('Runtime.enable');
  const results=[];
  for(const [label,width] of [['ordinateur',1280],['tablette',768],['telephone-temoin',390]]){
    const state=await pageStatus(mj,width);const ok=state.viewport&&state.root&&state.creators&&state.width===width&&state.scrollWidth<=width+2;
    results.push({label,requestedWidth:width,...state,ok});
    if(!ok)throw Error('Responsive navigation failed '+JSON.stringify(results.at(-1)));
  }
  await mj.call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  const didCreate=await mj.evaluate(`(()=>{const f=document.querySelector('input[aria-label="Nom de la campagne"]');const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Créer campagne');if(!f||!b||b.disabled)return false;f.value='Campagne fictive L004';f.dispatchEvent(new Event('input',{bubbles:true}));b.click();return true})()`);
  if(!didCreate)throw Error('Créer campagne action non navigable');
  const journey=await until(async()=>{const x=await mj.evaluate(`(()=>{const body=document.body.innerText;return {
   campaign:body.includes('Campagne active : Campagne fictive L004'),
   pj:!!document.querySelector('input[aria-label="Fichier PJ v2/v3"]'),
   bestiary:!!document.querySelector('input[aria-label="Code ou référence créature"]'),
   scene:!!document.querySelector('input[aria-label="Titre de nouvelle scène"]'),
   projection:!!document.querySelector('[aria-label="Aperçu public"]'),
   backup:!!document.querySelector('input[aria-label="Fichier de restauration confidentiel"]'),
   creators:!!document.querySelector('[aria-label="Créateurs descriptifs DG-LOT-003"]')
  }})()`);return x&&Object.values(x).every(Boolean)?x:null;},80);
  const target=await(await fetch(debuggerUrl+'/json/new?'+encodeURIComponent(PLAYER_ORIGIN+'/'),{method:'PUT'})).json();
  if(!target.webSocketDebuggerUrl)throw Error('Player target could not open');
  const player=await CDP.connect(target.webSocketDebuggerUrl);await player.call('Runtime.enable');
  const playerState=await until(async()=>{
   const v=await player.evaluate(`(()=>({origin:location.origin,text:document.body.innerText,storage:localStorage.length,root:!!document.querySelector('#player-root')}))()`);
   return v?.root?v:null;
  });
  player.close();
  if(playerState.origin!==PLAYER_ORIGIN||playerState.storage!==0||!playerState.text.includes('Vue joueur')||playerState.text.includes('Campagne fictive L004'))
    throw Error('Player isolation failed');
  console.log('L004_BROWSER_PASS',JSON.stringify({browser:chosen.version,shaExpected:'2ab809ef5351940e0fc272b859d10f21de894d00',responsive:results,journey,player:{origin:playerState.origin,storage:playerState.storage,isolated:true}}));
  mj.close();
}catch(e){console.error('L004_BROWSER_FAIL',e.stack??String(e));console.error('L004_BROWSER_LOG',logs.join('\n').slice(-cap));process.exitCode=1;}
finally{
 if(browser&&!browser.killed)browser.kill('SIGTERM');
 if(server&&!server.killed)server.kill('SIGTERM');
 await sleep(450);
 await rm(temp,{recursive:true,force:true});
}
