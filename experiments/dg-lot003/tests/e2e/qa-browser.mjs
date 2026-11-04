/** Independent L003 product E2E driver: actual HTTP origins + Chromium CDP, no mock DOM. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm,readFile,readdir,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {setTimeout as delay} from 'node:timers/promises';
const require=createRequire(import.meta.url);
const WebSocket=require('ws');
const ESC=x=>JSON.stringify(x);
export const CANARIES=['QA_MJ_SECRET_L003_8aef217f','QA_MJ_PRIVATE_NOTE_L003_a90d730c','QA_MJ_ONLY_L003_92fda031'];
const BOOT=String.raw`(()=>{
  const safe=x=>{try{return JSON.stringify(x)}catch{return '[not-serializable]'}};
  const out=[];Object.defineProperty(window,'__DG003_QA_EVENTS__',{value:out,configurable:false});
  const pm=window.postMessage;window.postMessage=function(...a){out.push({type:'window.postMessage',data:safe(a[0]),target:String(a[1])});return pm.apply(this,a)};
  const originalAdd=window.addEventListener;
  originalAdd.call(window,'message',e=>out.push({type:'incoming',data:safe(e.data),origin:e.origin}),true);
  const bc=window.BroadcastChannel;if(bc)window.BroadcastChannel=class extends bc{
    postMessage(x){out.push({type:'broadcast',data:safe(x),channel:this.name});return super.postMessage(x)};
  };
  const p=MessagePort.prototype.postMessage;MessagePort.prototype.postMessage=function(...a){out.push({type:'MessagePort',data:safe(a[0])});return p.apply(this,a)};
})();`;
async function preflight(mj,player){
 for(const [name,u,port] of [['MJ',mj,'4173'],['player',player,'4174']]){
  const url=new URL(u);assert.equal(url.protocol,'http:');assert.equal(url.hostname,'127.0.0.1');assert.equal(url.port,port);
  const r=await fetch(u,{signal:AbortSignal.timeout(5000)});assert(r.ok,`${name} HTTP ${r.status}`);
  assert(/text\/html/.test(r.headers.get('content-type')||''),`${name} must serve HTML`);
 }
 assert.notEqual(new URL(mj).origin,new URL(player).origin);
}
class CDP{
 constructor(ws,{master=null,sessionId=null}={}){
  this.master=master;this.sessionId=sessionId;this.events=[];
  if(master){this.ws=master.ws;master.sessions.set(sessionId,this);return}
  this.ws=new WebSocket(ws);this.id=0;this.pending=new Map();this.sessions=new Map();this.closedError=null;
  this.ws.on('message',b=>{
   let m;try{m=JSON.parse(String(b))}catch{return}
   if(m.id){
    const p=this.pending.get(m.id);if(!p)return;
    this.pending.delete(m.id);clearTimeout(p.timer);
    m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);
   }else{this.events.push(m);if(m.sessionId)this.sessions.get(m.sessionId)?.events.push(m)}
  });
  const abort=(error)=>{
   if(this.closedError)return;this.closedError=error instanceof Error?error:Error(String(error));
   console.error('[QA_CDP_CLOSED]',this.closedError.message,'pending=',this.pending.size);
   for(const [id,p] of this.pending){clearTimeout(p.timer);p.reject(this.closedError);this.pending.delete(id)}
  };
  this.ws.on('close',(code,reason)=>abort(Error('CDP closed '+code+' '+String(reason))));
  this.ws.on('error',abort);
 }
 async ready(){
  if(this.master)return;
  if(this.closedError)throw this.closedError;
  if(this.ws.readyState===WebSocket.OPEN)return;
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{finish();reject(Error('CDP websocket open timeout (8000ms)'))},8000);
   const finish=()=>{clearTimeout(timer);this.ws.off('open',ok);this.ws.off('error',bad);this.ws.off('close',closed)};
   const ok=()=>{finish();resolve()};
   const bad=e=>{finish();reject(e)};
   const closed=()=>{finish();reject(Error('CDP websocket closed before ready'))};
   this.ws.once('open',ok);this.ws.once('error',bad);this.ws.once('close',closed);
   if(this.ws.readyState===WebSocket.OPEN)ok();
  });
 }
 cmd(method,params={},sessionId=this.sessionId,timeoutMs=8000){
  if(this.master)return this.master.cmd(method,params,sessionId,timeoutMs);
  if(this.closedError)return Promise.reject(this.closedError);
  if(this.ws.readyState!==WebSocket.OPEN)return Promise.reject(Error('CDP socket not open: '+method));
  const id=++this.id;const begun=Date.now();
  console.log('[QA_CDP_BEGIN]',id,sessionId??'browser',method);
  return new Promise((resolve,reject)=>{
   const done=(fn,x)=>{
    console.log('[QA_CDP_END]',id,method,'ms=',Date.now()-begun,fn===reject?'ERROR':'OK');
    fn(x);
   };
   const timer=setTimeout(()=>{
    this.pending.delete(id);
    done(reject,Error('CDP_COMMAND_TIMEOUT '+method+' id='+id+' after '+timeoutMs+'ms'));
   },timeoutMs);
   this.pending.set(id,{timer,resolve:x=>done(resolve,x),reject:e=>done(reject,e)});
   try{
    this.ws.send(JSON.stringify({...sessionId?{sessionId}:{},id,method,params}),e=>{
     if(e){const p=this.pending.get(id);if(p){this.pending.delete(id);clearTimeout(p.timer);p.reject(e)}}
    });
   }catch(e){const p=this.pending.get(id);if(p){this.pending.delete(id);clearTimeout(p.timer);p.reject(e)}}
  });
 }
 session(id){assert(!this.master,'Nested session');return new CDP(null,{master:this,sessionId:id})}
 async evaluate(expr,{userGesture=false,timeoutMs=5000}={}){
  const r=await this.cmd('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true,userGesture},this.sessionId,timeoutMs);
  if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
  return r.result?.value;
 }
 async wait(expr,ms=12000){
  const deadline=Date.now()+ms;let last='';
  while(Date.now()<deadline){
   try{if(await this.evaluate('Boolean('+expr+')',{timeoutMs:Math.min(2500,Math.max(250,deadline-Date.now()))}))return}
   catch(e){last=e.message}
   if(Date.now()<deadline)await delay(Math.min(125,deadline-Date.now()));
  }
  throw Error('TIMEOUT '+expr+' '+last);
 }
 async goto(url){await this.cmd('Page.navigate',{url});await this.wait('document.readyState === "complete"');await delay(300)}
 async click(s){await this.wait('document.querySelector('+ESC(s)+')');await this.evaluate('(()=>{const e=document.querySelector('+ESC(s)+');if(e.disabled||e.getAttribute("aria-disabled")==="true")throw Error("Disabled: "+'+ESC(s)+');e.click();return true})()')}
 async fill(s,value){await this.wait('document.querySelector('+ESC(s)+')');await this.evaluate('(()=>{const e=document.querySelector('+ESC(s)+');e.focus();const p=e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,"value").set.call(e,'+ESC(String(value))+');e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}));return true})()')}
 async upload(s,file){const d=await this.cmd('DOM.getDocument');const e=await this.cmd('DOM.querySelector',{nodeId:d.root.nodeId,selector:s});assert(e.nodeId,'Missing file input '+s);await this.cmd('DOM.setFileInputFiles',{nodeId:e.nodeId,files:[file]});await this.evaluate('document.querySelector('+ESC(s)+').dispatchEvent(new Event("change",{bubbles:true}))')}
 async key(key){const code=key==='Tab'?9:key==='Enter'?13:key==='Escape'?27:0;assert(code,'Unsupported key '+key);await this.cmd('Input.dispatchKeyEvent',{type:'keyDown',key,windowsVirtualKeyCode:code});await this.cmd('Input.dispatchKeyEvent',{type:'keyUp',key,windowsVirtualKeyCode:code})}
 async inspect(){return this.evaluate('(()=>({url:location.href,html:document.documentElement.outerHTML,local:Object.entries(localStorage),session:Object.entries(sessionStorage),events:window.__DG003_QA_EVENTS__||[],focus:document.activeElement?.outerHTML||"",title:document.title}))()')}
 close(){if(this.master){this.master.sessions.delete(this.sessionId);return}this.ws.close()}
}
function chromium(){for(const p of [process.env.CHROMIUM_PATH,process.env.CHROME_PATH,'/usr/bin/chromium','/usr/bin/chromium-browser','/usr/bin/google-chrome'])if(p){try{require('node:fs').accessSync(p);return p}catch{}}throw Error('Chromium binary unavailable: provide CHROMIUM_PATH')}
export async function launch(config){
 const mj=config.mjUrl||'http://127.0.0.1:4173/';const player=config.playerUrl||'http://127.0.0.1:4174/';await preflight(mj,player);
 const profile=await mkdtemp(path.join(tmpdir(),'dg003-qa-cdp-'));const downloads=await mkdtemp(path.join(tmpdir(),'dg003-qa-downloads-'));
 const child=spawn(chromium(),['--headless=new','--no-first-run','--disable-extensions','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:'pipe'});
 let diagnostic='';child.stderr.on('data',x=>{diagnostic=(diagnostic+String(x)).slice(-16000)});
 let browserURL,port;
 const checkWs=x=>{try{const u=new URL(x);const p=Number(u.port);return u.protocol==='ws:'&&u.hostname==='127.0.0.1'&&!u.username&&!u.password&&!u.search&&!u.hash&&Number.isSafeInteger(p)&&p>=1024&&p<=65535&&/^\/devtools\/browser\/[A-Za-z0-9-]+$/.test(u.pathname)?{url:u.href,port:p}:null}catch{return null}};
 const advertised=()=>[...diagnostic.matchAll(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/devtools\/browser\/[A-Za-z0-9-]+)/g)].at(-1)?.[1];
 async function stopChrome(){
  if(child.exitCode===null&&child.signalCode===null)child.kill('SIGTERM');
  if(child.exitCode===null&&child.signalCode===null)await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(5000)]);
  if(child.exitCode===null&&child.signalCode===null){child.kill('SIGKILL');await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(2000)])}
  await rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:200});
  await rm(downloads,{recursive:true,force:true,maxRetries:10,retryDelay:200});
 }
 try{
  for(let i=0;i<75;i++){
   if(child.exitCode!==null||child.signalCode!==null)throw Error('Chromium exited: '+diagnostic);
   const options=[];
   try{const lines=(await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n');
    if(/^\d+$/.test(lines[0])&&/^\/devtools\/browser\/[A-Za-z0-9-]+$/.test(lines[1]?.trim()??''))options.push('ws://127.0.0.1:'+lines[0]+lines[1].trim());
   }catch{}
   const stderrWs=advertised();if(stderrWs)options.push(stderrWs);
   for(const candidate of options){
    const valid=checkWs(candidate);if(!valid)continue;
    try{const response=await fetch('http://127.0.0.1:'+valid.port+'/json/version',{signal:AbortSignal.timeout(650)});
     if(!response.ok)continue;const info=await response.json();
     if(info.webSocketDebuggerUrl===valid.url&&checkWs(info.webSocketDebuggerUrl)?.port===valid.port){browserURL=valid.url;port=valid.port;break}
    }catch{}
   }
   if(browserURL)break;await delay(200);
  }
  assert(browserURL,'Own Chromium CDP endpoint unavailable (DevToolsActivePort/stderr): '+diagnostic);
  const browser=new CDP(browserURL);await browser.ready();
  await browser.cmd('Browser.setDownloadBehavior',{behavior:'allowAndName',downloadPath:downloads,eventsEnabled:true});
  async function tab(url){const target=await browser.cmd('Target.createTarget',{url:'about:blank'});
   let ws;for(let i=0;i<30;i++){const all=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();ws=all.find(x=>x.id===target.targetId)?.webSocketDebuggerUrl;if(ws)break;await delay(100)}assert(ws,'CDP target websocket absent');
   const cdp=new CDP(ws);await cdp.ready();await cdp.cmd('Page.enable');await cdp.cmd('Runtime.enable');await cdp.cmd('DOM.enable');await cdp.cmd('Network.enable');await cdp.cmd('Page.addScriptToEvaluateOnNewDocument',{source:BOOT});await cdp.goto(url);return {cdp,targetId:target.targetId};
  }
  const mjTab=await tab(mj);const clients={mj:mjTab.cdp,player:null};
  async function openPlayerFromMJ(selector, {buttonText=null}={}){
   assert.equal(clients.player,null,'Player popup already exists');
   // Auto-attach pauses the genuine popup before its page scripts execute.
   await browser.cmd('Target.setDiscoverTargets',{discover:true});
   await browser.cmd('Target.setAutoAttach',{autoAttach:true,waitForDebuggerOnStart:true,flatten:true});
   const start=browser.events.length;
   let clickPending=null;
   console.log('[QA_POPUP_BEGIN] click, then discover/resume real opener target');
   if(buttonText){
     const expression=`Array.from(document.querySelectorAll('#studio-root button')).find(x=>x.textContent.trim()===${JSON.stringify(buttonText)})`;
     await clients.mj.wait(`Boolean(${expression})`);
     // Do not await the opener click while popup target is paused by auto-attach.
     clickPending=clients.mj.evaluate(`(()=>{const b=${expression};if(b.disabled)throw Error('Player popup button disabled');b.click();return true})()`,{userGesture:true,timeoutMs:10000}).then(()=>({ok:true}),error=>({ok:false,error}));
   }else{
     await clients.mj.wait(`Boolean(document.querySelector(${ESC(selector)}))`);
     clickPending=clients.mj.evaluate(`(()=>{const b=document.querySelector(${ESC(selector)});if(!b||b.disabled)throw Error('Popup button unavailable');b.click();return true})()`,{userGesture:true,timeoutMs:10000}).then(()=>({ok:true}),error=>({ok:false,error}));
   }
   let found;const end=Date.now()+12000;
   while(Date.now()<end){found=browser.events.slice(start).find(e=>e.method==='Target.attachedToTarget'&&e.params?.targetInfo?.type==='page'&&e.params.targetInfo.openerId===mjTab.targetId);if(found)break;await delay(100)}
   assert(found,'No genuine popup from MJ button with opener target; locked page is NOT evidence of projection');
   const playerTab=browser.session(found.params.sessionId);
   try{
    await playerTab.cmd('Page.enable');await playerTab.cmd('Runtime.enable');await playerTab.cmd('DOM.enable');await playerTab.cmd('Network.enable');
    await playerTab.cmd('Page.addScriptToEvaluateOnNewDocument',{source:BOOT});
    await playerTab.cmd('Runtime.runIfWaitingForDebugger');
    const clickResult=await clickPending;
    if(!clickResult?.ok)throw clickResult?.error??Error('Opener click failed');
    console.log('[QA_POPUP_RESUMED]',found.params.targetInfo.targetId);
    await playerTab.wait(`location.origin === ${ESC(new URL(player).origin)} && document.readyState === 'complete'`,15000);
    assert.equal(await playerTab.evaluate('window.opener !== null'),true,'Player popup has no window.opener');
    clients.player=playerTab;
    return {openerTargetId:mjTab.targetId,playerTargetId:found.params.targetInfo.targetId,origin:await playerTab.evaluate('location.origin')};
   }catch(e){playerTab.close();throw e}
  }
  return {mj,player,clients,downloads,browser,child,profile,diagnostic,openPlayerFromMJ,
   async close(){clients.mj.close();clients.player?.close();browser.close();await stopChrome()}};
 }catch(e){await stopChrome();throw e}
}
export async function readDownload(folder,before,timeout=12000){const deadline=Date.now()+timeout;
 while(Date.now()<deadline){const list=(await readdir(folder)).filter(x=>!x.endsWith('.crdownload')&&!before.includes(x));for(const name of list){const file=path.join(folder,name);const s=await stat(file);if(s.size){const raw=await readFile(file);return {name,raw,file}}}await delay(100)}throw Error('Expected browser download never appeared')}
export function noCanary(value,where,canaries=CANARIES){const s=typeof value==='string'?value:JSON.stringify(value);for(const secret of canaries)assert(!s.includes(secret),`P0 canary ${where}: ${secret}`)}
export async function playerNoLeak(session,publicExport){assert(session.clients.player,'Real popup required before leak scan');const player=await session.clients.player.inspect();const mj=await session.clients.mj.inspect();
 // Evidence must include an actual browser message/port exchange, not just a connected-looking label.
 const exchanged=[...mj.events,...player.events].filter(e=>['incoming','MessagePort','broadcast','window.postMessage'].includes(e.type));
 assert(exchanged.length>0,'No observed real communication event between MJ and player; inactive popup is not a passing security test');
noCanary(player,'player DOM/storage/messages');noCanary(mj.events,'MJ outbound/inbound messages');
 for(const label of ['mj','player'])for(const event of session.clients[label].events){
  if(event.method==='Runtime.consoleAPICalled')noCanary(event.params?.args?.map(x=>x.value??x.description),'console '+label);
  if(event.method==='Log.entryAdded')noCanary(event.params?.entry?.text||'','log '+label);
 }if(publicExport)noCanary(publicExport,'public export');
 for(const event of session.clients.player.events.filter(e=>e.method==='Network.requestWillBeSent'))noCanary(event.params?.request?.postData||'','player request body');return {player,mjMessages:mj.events};}
export async function runActions(session,steps,ctx){let current='mj';const results={};
 const interpol=x=>typeof x==='string'?x.replace(/\$\{([A-Z0-9_]+)\}/g,(_,key)=>{assert(Object.hasOwn(ctx,key),`Missing interpolation ${key}`);return String(ctx[key])}):x;
 for(const [i,s] of steps.entries()){
  assert(s&&typeof s==='object',`step ${i} missing`);if(s.whenMulti){assert(['accepted','rejected'].includes(s.whenMulti),'Invalid whenMulti');if(s.whenMulti!==ctx.MULTI_MODE)continue;}if(s.origin){assert(['mj','player'].includes(s.origin));current=s.origin}const c=session.clients[current];if(s.do!=='openPlayer')assert(c,`No active ${current} popup`);const val=interpol(s.value);
  switch(s.do){
   case 'switch':assert(c,`Switch to ${current} without a real popup`);break;
   case 'openPlayer':{assert(current==='mj','Popup must be opened by MJ');results[s.key||'popup']=await session.openPlayerFromMJ(s.selector);break}
   case 'click':await c.click(s.selector);break;
   case 'fill':await c.fill(s.selector,val);break;
   case 'upload':assert(ctx[s.file],`Missing fixture ${s.file}`);await c.upload(s.selector,ctx[s.file]);break;
   case 'restoreDownload':{const d=results[s.key];assert(d?.file,`Previous download missing ${s.key}`);await c.upload(s.selector,d.file);break}
   case 'key':await c.key(s.key);break;
   case 'reload':await c.goto(current==='mj'?session.mj:session.player);break;
   case 'wait':await c.wait(s.expression,s.timeout||12000);break;
   case 'assert':assert.deepEqual(await c.evaluate(s.expression),s.equals===undefined?true:val===undefined?s.equals:val,s.description||`step ${i} assertion failed`);break;
   case 'text':{const txt=await c.evaluate(`document.querySelector(${ESC(s.selector)})?.textContent`);assert.equal(typeof txt,'string',`Selector missing ${s.selector}`);assert(txt.includes(String(val)),`Text missing for ${s.selector}: ${val}`);break}
   case 'disabled':assert.equal(await c.evaluate(`document.querySelector(${ESC(s.selector)})?.matches(':disabled,[aria-disabled="true"]')`),true,`Not disabled ${s.selector}`);break;
   case 'capture':results[s.key||`step_${i}`]=await c.inspect();break;
   case 'download':{const before=await readdir(session.downloads);await c.click(s.selector);const d=await readDownload(session.downloads,before,s.timeout||12000);results[s.key||`download_${i}`]=d;break}
   default:throw Error(`Unknown E2E step ${s.do} at ${i}`)
  }
 }
 return results;
}