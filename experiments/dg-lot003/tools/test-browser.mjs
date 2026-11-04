/** Browser E2E on actual served origins, using existing ws and Chromium CDP (no mocks). */
import {spawn,spawnSync} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {setTimeout as sleep} from 'node:timers/promises';
import WebSocket from 'ws';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const MJ='http://127.0.0.1:4173',PLAYER='http://127.0.0.1:4174';
const manifest=JSON.parse(await readFile(resolve(root,'manifest.json')));
const required=['ports','rules','catalog','storage','studio','player','creators'];
if(!required.every(role=>manifest.components.some(item=>item.role===role)))throw Error('E2E blocked: owner modules absent');
const candidates=process.env.CHROMIUM_PATH?[process.env.CHROMIUM_PATH]:['chromium','chromium-browser','google-chrome','google-chrome-stable'];
const binary=candidates.find(value=>spawnSync('which',[value],{stdio:'ignore'}).status===0);
if(!binary){console.error('NON EXÉCUTÉ : Chromium absent (CHROMIUM_PATH).');process.exit(2);}
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
 const portData=await until(async()=>{
  const text=await readFile(join(working,'chrome','DevToolsActivePort'),'utf8');
  return text.split('\n')[0];
 },{tries:120});
 const debuggerUrl='http://127.0.0.1:'+Number(portData);
 const mjTarget=await until(async()=>{
  const targets=await json(debuggerUrl+'/json');
  return targets.find(x=>x.type==='page'&&x.url.startsWith(MJ));
 },{tries:80});
 const mj=await CDP.connect(mjTarget.webSocketDebuggerUrl);
 await mj.call('Runtime.enable');await mj.call('DOM.enable');
 await checkDOM(mj,'!!document.querySelector("input[aria-label=\"Nom de la campagne\"]")');
 await mj.eval(fill(selector('Nom de la campagne'),'Campagne fictive E2E'));
 await mj.eval(click('Créer campagne'));
 await checkDOM(mj,'document.body.innerText.includes("Campagne active : Campagne fictive E2E")');
 const fixture=join(working,'pj-v2.json');
 await writeFile(fixture,'\uFEFF '+JSON.stringify({schema:'alrick.sheets.v2',unknownEnvelope:'CANARY_PRIVATE_009',
 sheets:[{id:'pj-001',name:'PJ inventé',stats:{physique:14},unknownField:'PRIVE_NI_JAMAIS_PLAYER'}]}));
 await upload(mj,'Fichier PJ v2/v3',fixture);
 await mj.eval(click('Prévisualiser PJ'));
 await checkDOM(mj,'document.body.innerText.includes("À importer")');
 await mj.eval(click('Accepter copie PJ'));
 await checkDOM(mj,'document.body.innerText.includes("PJ copiés :") && document.body.innerText.includes("PJ inventé")');
 await mj.eval(fill(selector('Code ou référence créature'),'fixture-source-001'));
 await mj.eval(click('Prévisualiser référence'));
 await checkDOM(mj,'document.body.innerText.includes("Créature témoin N5")');
 await mj.eval(click('Créer copie d’instance'));
 await checkDOM(mj,'document.body.innerText.includes("Copies : Créature témoin N5")');
 await mj.eval(fill(selector('Titre de nouvelle scène'),'Scène témoin'));
 await mj.eval(fill('textarea[aria-label="Description destinée à être proposée au public"]','Le pont est visible.'));
 await mj.eval(fill('textarea[aria-label="Notes privées MJ"]','CANARY_PRIVATE_SCENE_123'));
 await mj.eval(click('Créer scène'));
 await checkDOM(mj,'document.body.innerText.includes("Scène témoin") && !!document.querySelector("textarea[aria-label=\"Notes MJ — privées\"]")');
 await mj.eval(click('Mode expert'));
 await mj.eval(click('Prévisualiser calcul M03 natif autorisé'));
 await checkDOM(mj,'document.body.innerText.includes("Aperçu natif consulté")');
 await mj.eval(click('Sort'));
 for(const [name,value] of [['name','Lueur fictive'],['provenance','campagne-fictive'],['version','1.0.0'],
  ['description','Une lumière purement narrative sans chiffre.'],['limitations','Aucune activation automatique']]){
  await mj.eval(fill('form[data-creator-kind="spell"] [name="'+name+'"]',value));
 }
 await mj.eval(`document.querySelector('form[data-creator-kind="spell"]').requestSubmit();true`);
 await checkDOM(mj,'document.body.innerText.includes("Enregistré localement")');
 await checkDOM(mj,'document.querySelector("#catalog-saved")?.innerText.includes("Lueur fictive")');
 const saved=await mj.eval('localStorage.getItem("cer.dg003.private.campaign.v0")');
 if(typeof saved!=='string'||!saved.includes('private-export'))fail('Private envelope not persisted by ARCHIVES');
 const persisted=JSON.parse(saved);
 if(persisted.kind!=='cer.dg003.local-validated-envelope.v0'||typeof persisted.raw!=='string')fail('Invalid private session envelope');
 const backup=join(working,'CONFIDENTIEL_test.json');await writeFile(backup,persisted.raw);
 await upload(mj,'Fichier de restauration confidentiel',backup);
 await mj.eval(click('Prévisualiser restauration'));
 await checkDOM(mj,'document.body.innerText.includes("Restauration proposée")');
 await mj.eval(click('Confirmer restauration'));
 await checkDOM(mj,'document.body.innerText.includes("Campagne restaurée")');
 await mj.eval(click('Ouvrir la fenêtre joueur'));
 const playerTarget=await until(async()=>{const xs=await json(debuggerUrl+'/json');return xs.find(x=>x.type==='page'&&x.url.startsWith(PLAYER));},{tries:80});
 const player=await CDP.connect(playerTarget.webSocketDebuggerUrl);
 await player.call('Runtime.enable');
 await checkDOM(mj,'document.body.innerText.includes("Fenêtre joueur connectée")');
 await mj.eval(`(()=>{const e=[...document.querySelectorAll('label')].find(e=>e.textContent.includes('Partager le titre de la scène'));if(!e)throw Error('Checkbox missing');e.querySelector('input').click();return true;})()`);
 await mj.eval(click('Publier uniquement la sélection'));
 await checkDOM(player,'document.body.innerText.includes("Scène témoin")');
 const playerText=await player.eval('document.documentElement.outerHTML+JSON.stringify(localStorage)');
 if(/CANARY_PRIVATE|PRIVE_NI_JAMAIS_PLAYER|privateSnapshot|base64|sourceDigestSHA256/.test(playerText))
  fail('P0 PRIVATE DATA LEAK TO PLAYER');
 if(await player.eval('localStorage.length')!==0)fail('Player storage not empty');
 player.close();mj.close();
 console.log('BROWSER_OK: two served HTTP origins, v2 raw import, BEST copy, scene, M03, creator save, ARCHIVES restore, player whitelist');
} catch(error){console.error('BROWSER_FAIL:',error.stack??error.message);process.exitCode=1;}
finally{browser?.kill();server?.kill();await rm(working,{recursive:true,force:true});}
