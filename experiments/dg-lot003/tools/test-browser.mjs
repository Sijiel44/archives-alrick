/** Browser E2E on actual served origins, using existing ws and Chromium CDP (no mocks). */
import {spawn,spawnSync} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm,readdir,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {setTimeout as sleep} from 'node:timers/promises';
import {Script} from 'node:vm';
import WebSocket from 'ws';
import * as archives from '../src/storage/storage.mjs';
import {OVERLAY_KEY} from './adapters.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const MJ='http://127.0.0.1:4173',PLAYER='http://127.0.0.1:4174';
const manifest=JSON.parse(await readFile(resolve(root,'manifest.json')));
const required=['ports','rules','catalog','storage','studio','player','creators'];
if(!required.every(role=>manifest.components.some(item=>item.role===role)))throw Error('E2E blocked: owner modules absent');
// Use explicit CHROMIUM_PATH when set; otherwise prefer an already installed
// official Chrome binary over Ubuntu's apt/Snap Chromium launcher.
const candidates=process.env.CHROMIUM_PATH
 ?[process.env.CHROMIUM_PATH]
 :['google-chrome-stable','google-chrome','/opt/google/chrome/chrome',
   '/usr/bin/google-chrome-stable','/usr/bin/google-chrome','chromium','chromium-browser'];
const found=[];
for(const candidate of candidates){
 const resolved=spawnSync('which',[candidate],{encoding:'utf8',timeout:4000});
 if(resolved.status!==0)continue;
 const binary=(resolved.stdout??'').trim()||candidate;
 const probe=spawnSync(binary,['--version'],{encoding:'utf8',timeout:8000,maxBuffer:65536});
 found.push({binary,version:((probe.stdout??'')+' '+(probe.stderr??'')).trim().slice(0,300),
  exitCode:probe.status,signal:probe.signal,spawnError:probe.error?.message??null});
}
if(!found.length){
 console.error('NON EXÉCUTÉ : aucun binaire Chrome/Chromium local détecté (CHROMIUM_PATH).');
 process.exit(2);
}
console.log('BROWSER_CANDIDATES',JSON.stringify(found));
const chosen=found.find(candidate=>candidate.exitCode===0);
if(!chosen){
 console.error('BROWSER_SETUP_FAIL : aucune commande navigateur --version réussie.');
 process.exit(2);
}
const binary=chosen.binary;
console.log('BROWSER_SELECTED',JSON.stringify(chosen));
const working=await mkdtemp(join(tmpdir(),'dg003-e2e-'));
let server,browser;
const fail=message=>{throw Error(message)};
async function until(fn,{tries=80,wait=150}={}){
 let last;
 for(let n=0;n<tries;n++){try{const value=await fn();if(value)return value;}catch(error){last=error;}await sleep(wait);}
 throw Error('Condition timed out: '+(last?.message??''));
}
async function json(url){const response=await fetch(url);if(!response.ok)throw Error('HTTP '+response.status+' '+url);return response.json();}
class CDP {
 constructor(ws){this.ws=ws;this.pending=new Map();this.nextId=0;ws.on('message',message=>{
  const data=JSON.parse(String(message));if(!data.id)return;
  const awaiting=this.pending.get(data.id);if(!awaiting)return;this.pending.delete(data.id);
  if(data.error)awaiting.reject(Error(data.error.message));else awaiting.resolve(data.result);
 });}
 static async connect(url){
  const ws=new WebSocket(url);
  await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});
  return new CDP(ws);
 }
 call(method,params={}){
  const id=++this.nextId;
  return new Promise((resolve,reject)=>{
   this.pending.set(id,{resolve,reject});
   this.ws.send(JSON.stringify({id,method,params}),error=>{if(error){this.pending.delete(id);reject(error);}});
  });
 }
 async eval(expression){
  const r=await this.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});
  if(r.exceptionDetails)throw Error('Browser JS: '+r.exceptionDetails.text+' '+(r.exceptionDetails.exception?.description??''));
  return r.result?.value;
 }
 close(){this.ws.close();}
}
async function checkDOM(page,expression){return until(()=>page.eval(expression),{tries:80});}
const selector=(label)=>'input[aria-label='+JSON.stringify(label)+']';
const fill=(css,value)=>`(()=>{const el=document.querySelector(${JSON.stringify(css)});if(!el)throw Error('Field not found');el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}));return true})()`;
const click=(text)=>`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(text)});if(!b||b.disabled)throw Error('Action absent/disabled: '+${JSON.stringify(text)});b.click();return true})()`;

// Every expression that crosses Runtime.evaluate is generated with JSON-quoted
// selectors/text. Parse them with node:vm before the browser is launched.
const hasSelector=css=>`!!document.querySelector(${JSON.stringify(css)})`;
const hasText=value=>`document.body.innerText.includes(${JSON.stringify(value)})`;
const hasTextPair=(a,b)=>`(${hasText(a)} && ${hasText(b)})`;
const hasTextAndSelector=(value,css)=>`(${hasText(value)} && ${hasSelector(css)})`;
const catalogHasText=value=>`document.querySelector(${JSON.stringify('#catalog-saved')})?.innerText.includes(${JSON.stringify(value)})`;
const creatorSubmit=`document.querySelector(${JSON.stringify('form[data-creator-kind="spell"]')}).requestSubmit();true`;
const shareTitle=`(()=>{const e=[...document.querySelectorAll(${JSON.stringify('label')})].find(e=>e.textContent.includes(${JSON.stringify('Partager le titre de la scène')}));if(!e)throw Error('Checkbox missing');e.querySelector('input').click();return true;})()`;
const previewDetails=`(()=>{const panel=document.getElementById("native-preview-details");const input=document.getElementById("native-preview-input");const output=document.getElementById("native-preview-result");if(!panel||panel.hidden||!input||!output)return false;const i=JSON.parse(input.textContent),r=JSON.parse(output.textContent);return i.kind==="combat"&&i.actor==="pj"&&i.combat.natural===24&&r.status==="ok"&&r.engine==="M03"&&r.applied===false&&r.result!==undefined;})()`;
const expressionSamples=[
 hasSelector('input[aria-label="Nom de la campagne"]'),hasText('Campagne active : Campagne fictive E2E'),
 hasText('À importer'),hasTextPair('PJ copiés :','PJ inventé'),hasText('Créature témoin N5'),
 hasText('Copies : Créature témoin N5'),hasTextAndSelector('Scène témoin','textarea[aria-label="Notes MJ — privées"]'),
 hasText('Aperçu natif consulté'),previewDetails,creatorSubmit,shareTitle,
 hasText('Enregistré localement'),catalogHasText('Lueur fictive'),hasText('Restauration proposée'),
 hasText('Campagne restaurée'),hasText('Fenêtre joueur connectée'),hasText('Scène témoin'),
 fill('input[aria-label="Nom de la campagne"]','Campagne fictive E2E'),
 fill('textarea[aria-label="Notes MJ — privées"]','CANARY_PRIVATE_SCENE_123'),
 fill('form[data-creator-kind="spell"] [name="description"]','Une lumière fictive'),
 click('Créer campagne'),click('Prévisualiser calcul M03 natif autorisé')
];
for(const [index,expression] of expressionSamples.entries()){
 try{new Script(expression,{filename:'dg003-browser-expression-'+index+'.js'});}
 catch(error){throw Error('BROWSER_EXPRESSION_SYNTAX '+index+': '+error.message);}
}
console.log('BROWSER_EXPRESSIONS_PARSE_OK',expressionSamples.length);

async function upload(page,field,file){
 const doc=(await page.call('DOM.getDocument')).root.nodeId;
 const id=(await page.call('DOM.querySelector',{nodeId:doc,selector:'input[type="file"][aria-label='+JSON.stringify(field)+']'})).nodeId;
 if(!id)fail('Upload input missing: '+field);
 await page.call('DOM.setFileInputFiles',{nodeId:id,files:[file]});
}
try{
 server=spawn(process.execPath,[resolve(root,'tools/serve.mjs')],{stdio:['ignore','pipe','pipe']});
 await until(async()=>{const a=await fetch(MJ);const b=await fetch(PLAYER);return a.ok&&b.ok;},{tries:100});
 if((await fetch(PLAYER+'/index.html')).status!==404)fail('Player host exposes MJ HTML');
 if((await fetch(PLAYER+'/assets/mj.js')).status!==404)fail('Player host exposes MJ bundle');
 if((await fetch(MJ+'/player.html')).status!==404)fail('MJ host exposes player HTML');
 browser=spawn(binary,['--headless=new','--no-first-run','--no-default-browser-check','--disable-gpu',
  '--remote-debugging-port=0','--user-data-dir='+join(working,'chrome'),MJ],{stdio:['ignore','pipe','pipe']});
 const cap=12000;
 let stderr='',stdout='',exit=null,spawnError=null,childAnnouncement=null;
 browser.stderr?.on('data',chunk=>{
  stderr=(stderr+String(chunk)).slice(-cap);
  // Keep this child's endpoint even if later D-Bus diagnostics roll the bounded log.
  childAnnouncement ??= announcedEndpoint(stderr);
 });
 browser.stdout?.on('data',chunk=>{stdout=(stdout+String(chunk)).slice(-cap);});
 browser.on('error',error=>{spawnError=error.message;});
 browser.on('exit',(code,signal)=>{exit={code,signal};});
 // Bind ONLY to the DevTools endpoint announced by this spawned child, or its
 // own user-data-dir DevToolsActivePort file; never scan arbitrary local sessions.
 function announcedEndpoint(log) {
  const match=log.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/devtools\/browser\/[A-Za-z0-9-]+)/);
  if(!match)return null;
  const url=new URL(match[1]);
  const port=Number(url.port);
  if(url.protocol!=='ws:'||url.hostname!=='127.0.0.1'||
     !Number.isSafeInteger(port)||port<1||port>65535||
     !/^\/devtools\/browser\/[A-Za-z0-9-]+$/.test(url.pathname))
   throw Error('Invalid child DevTools address');
  return {port,browserWs:url.href,discoveredBy:'child-stderr'};
 }
 let endpoint;
 try{
  endpoint=await until(async()=>{
   if(spawnError)throw Error('BROWSER_SPAWN_ERROR: '+spawnError);
   if(exit)throw Error('BROWSER_EXIT: '+JSON.stringify(exit));
   // The logged DevTools listening line proves this child started even when
   // its launcher does not create the expected DevToolsActivePort file.
   const announced=childAnnouncement??announcedEndpoint(stderr);
   if(announced)return announced;
   let data;
   try{data=await readFile(join(working,'chrome','DevToolsActivePort'),'utf8');}
   catch(error){if(error.code==='ENOENT')return null;throw error;}
   const [first,second]=data.split(/\r?\n/);
   const port=Number(first);
   if(!/^\d+$/.test(first)||!Number.isSafeInteger(port)||port<1||port>65535)return null;
   // File belongs to the unique temporary user-data-dir supplied to this child.
   const browserWs=second?.startsWith('/devtools/browser/')
     ?'ws://127.0.0.1:'+port+second:null;
   return {port,browserWs,discoveredBy:'child-profile-file'};
  },{tries:120});
 }catch(error){
  console.error('BROWSER_START_DIAGNOSTIC',JSON.stringify({
   binary,version:chosen.version,pid:browser.pid??null,exit,spawnError,
   stderr,stdout
  }));
  throw error;
 }
 const debuggerUrl='http://127.0.0.1:'+endpoint.port;
 console.log('CHILD_DEVTOOLS_DISCOVERED',JSON.stringify(endpoint));
 // Compare the advertised browser endpoint against Chrome's own /json/version
 // response before using the page targets, preventing cross-session attachment.
 const devtoolsVersion=await until(()=>json(debuggerUrl+'/json/version'));
 if(endpoint.browserWs && devtoolsVersion.webSocketDebuggerUrl!==endpoint.browserWs)
  throw Error('DevTools browser websocket differs from spawned-child announcement');
 const mjTarget=await until(async()=>{
  const targets=await json(debuggerUrl+'/json');
  return targets.find(x=>x.type==='page'&&x.url.startsWith(MJ));
 },{tries:80});
 const mj=await CDP.connect(mjTarget.webSocketDebuggerUrl);
 await mj.call('Runtime.enable');await mj.call('DOM.enable');
 await checkDOM(mj,hasSelector('input[aria-label="Nom de la campagne"]'));
 await mj.eval(fill(selector('Nom de la campagne'),'Campagne fictive E2E'));
 await mj.eval(click('Créer campagne'));
 await checkDOM(mj,hasText('Campagne active : Campagne fictive E2E'));
 const fixture=join(working,'pj-v2.json');
 await writeFile(fixture,'\uFEFF '+JSON.stringify({schema:'alrick.sheets.v2',unknownEnvelope:'CANARY_PRIVATE_009',
 sheets:[{id:'pj-001',name:'PJ inventé',stats:{physique:14},unknownField:'PRIVE_NI_JAMAIS_PLAYER'}]}));
 await upload(mj,'Fichier PJ v2/v3',fixture);
 await mj.eval(click('Prévisualiser PJ'));
 await checkDOM(mj,hasText('À importer'));
 await mj.eval(click('Accepter copie PJ'));
 await checkDOM(mj,hasTextPair('PJ copiés :','PJ inventé'));
 await mj.eval(fill(selector('Code ou référence créature'),'fixture-source-001'));
 await mj.eval(click('Prévisualiser référence'));
 await checkDOM(mj,hasText('Créature témoin N5'));
 await mj.eval(click('Créer copie d’instance'));
 await checkDOM(mj,hasText('Copies : Créature témoin N5'));
 await mj.eval(fill(selector('Titre de nouvelle scène'),'Scène témoin'));
 await mj.eval(fill('textarea[aria-label="Description destinée à être proposée au public"]','Le pont est visible.'));
 await mj.eval(fill('textarea[aria-label="Notes privées MJ"]','CANARY_PRIVATE_SCENE_123'));
 await mj.eval(click('Créer scène'));
 await checkDOM(mj,hasTextAndSelector('Scène témoin','textarea[aria-label="Notes MJ — privées"]'));
 await mj.eval(click('Mode expert'));
 await mj.eval(click('Prévisualiser calcul M03 natif autorisé'));
 await checkDOM(mj,hasText('Aperçu natif consulté'));
 await checkDOM(mj,previewDetails);
 await mj.eval(click('Sort'));
 for(const [name,value] of [['name','Lueur fictive'],['provenance','campagne-fictive'],['version','1.0.0'],
  ['description','Une lumière purement narrative sans chiffre.'],['limitations','Aucune activation automatique']]){
  await mj.eval(fill('form[data-creator-kind="spell"] [name="'+name+'"]',value));
 }
 await mj.eval(creatorSubmit);
 await checkDOM(mj,hasText('Enregistré localement'));
 await checkDOM(mj,catalogHasText('Lueur fictive'));
 const saved=await mj.eval('localStorage.getItem("cer.dg003.private.campaign.v0")');
 if(typeof saved!=='string'||!saved.includes('private-export'))fail('Private envelope not persisted by ARCHIVES');
 const persisted=JSON.parse(saved);
 if(persisted.kind!=='cer.dg003.local-validated-envelope.v0'||typeof persisted.raw!=='string')fail('Invalid private session envelope');
 const backup=join(working,'CONFIDENTIEL_test.json');await writeFile(backup,persisted.raw);
 await upload(mj,'Fichier de restauration confidentiel',backup);
 await mj.eval(click('Prévisualiser restauration'));
 await checkDOM(mj,hasText('Restauration proposée'));
 await mj.eval(click('Confirmer restauration'));
 await checkDOM(mj,hasText('Campagne restaurée'));
 await mj.eval(click('Ouvrir la fenêtre joueur'));
 const playerTarget=await until(async()=>{const xs=await json(debuggerUrl+'/json');return xs.find(x=>x.type==='page'&&x.url.startsWith(PLAYER));},{tries:80});
 const player=await CDP.connect(playerTarget.webSocketDebuggerUrl);
 await player.call('Runtime.enable');
 await checkDOM(mj,hasText('Fenêtre joueur connectée'));
 await mj.eval(shareTitle);
 await mj.eval(click('Publier uniquement la sélection'));
 await checkDOM(player,hasText('Scène témoin'));
 const playerText=await player.eval('document.documentElement.outerHTML+JSON.stringify(localStorage)');
 if(/CANARY_PRIVATE|PRIVE_NI_JAMAIS_PLAYER|privateSnapshot|base64|sourceDigestSHA256/.test(playerText))
  fail('P0 PRIVATE DATA LEAK TO PLAYER');
 if(await player.eval('localStorage.length')!==0)fail('Player storage not empty');
 // Native ARCHIVES >5 MiB: real STUDIO file selection, validated restoration,
 // browser persistence, reload, private export and verification of unknown fields.
 const project=archives.createCampaign({id:'native-backup-6mib',name:'Archive 6 Mio intégrale'});
 project.privateNotes=[{id:'bulk-note',opaque:'Z'.repeat(6*1024*1024),
   unknown:{marker:'NATIVE_UNKNOWN_6MIB'}}];
 project[OVERLAY_KEY]={schema:'cer.dg003.studio-overlay.v1',
   fields:{title:'Archive 6 Mio intégrale',revision:7,activeSceneId:'',extensions:{}},characters:[]};
 const nativeBackup=await archives.exportPrivate(project);
 if(nativeBackup.bytes.length<=5*1024*1024||nativeBackup.bytes.length>16*1024*1024)
  fail('Expected native backup between 5 and 16 MiB');
 const largeFile=join(working,'native-6mib-backup.json');
 await writeFile(largeFile,nativeBackup.bytes);
 await upload(mj,'Fichier de restauration confidentiel',largeFile);
 await mj.eval(click('Prévisualiser restauration'));
 await checkDOM(mj,hasText('Restauration proposée'));
 await mj.eval(click('Confirmer restauration'));
 await checkDOM(mj,hasText('Campagne restaurée depuis la prévisualisation.'));
 await mj.call('Page.enable');
 await mj.call('Page.reload',{ignoreCache:true});
 await checkDOM(mj,hasSelector('button'));
 await mj.eval(click('Recharger campagne'));
 await checkDOM(mj,hasText('Campagne active : Archive 6 Mio intégrale'));
 const downloadDir=join(working,'exported-private');
 await mkdir(downloadDir,{recursive:true});
 await mj.call('Page.setDownloadBehavior',{behavior:'allow',downloadPath:downloadDir});
 await mj.eval(click('Exporter campagne CONFIDENTIELLE'));
 const privateFile=await until(async()=>{
  const files=(await readdir(downloadDir)).filter(x=>x.endsWith('.json'));
  return files.length===1?join(downloadDir,files[0]):null;
 },{tries:120});
 const exportedBytes=new Uint8Array(await readFile(privateFile));
 const preview=await archives.previewRestore(exportedBytes);
 const restored=await archives.commitRestore(preview);
 if(exportedBytes.length<=5*1024*1024||
    restored.privateNotes?.[0]?.unknown?.marker!=='NATIVE_UNKNOWN_6MIB'||
    restored.privateNotes?.[0]?.opaque?.length!==6*1024*1024 ||
    restored[OVERLAY_KEY]?.fields?.revision!==7)
  fail('NATIVE_6MIB_ROUNDTRIP: missing unknown fields or lost native data');
 console.log('BROWSER_NATIVE_6MIB_OK',JSON.stringify({
  importedBytes:nativeBackup.bytes.length,reexportedBytes:exportedBytes.length,
  unknownMarker:restored.privateNotes[0].unknown.marker,revision:restored[OVERLAY_KEY].fields.revision
 }));

  player.close();mj.close();
 console.log('BROWSER_OK: two served HTTP origins, v2 raw import, BEST copy, scene, M03, creator save, ARCHIVES restore, player whitelist');
} catch(error){console.error('BROWSER_FAIL:',error.stack??error.message);process.exitCode=1;}
finally{browser?.kill();server?.kill();await rm(working,{recursive:true,force:true});}
