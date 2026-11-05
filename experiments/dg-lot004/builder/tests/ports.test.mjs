import test from 'node:test';
import assert from 'node:assert/strict';
import {MJ_ORIGIN,PLAYER_ORIGIN,SOURCE_PRODUCT_SHA,NAVIGATION,getPreviewPlan,classifyPreviewUrl,securityDisclosure} from '../src/contract.mjs';
import {probeLocalPreview} from '../src/probe.mjs';
import {mountPreviewNavigation} from '../src/navigation.mjs';
test('product SHA fixed and destinations separate loopback',()=>{
  assert.equal(SOURCE_PRODUCT_SHA,'2ab809ef5351940e0fc272b859d10f21de894d00');
  const plan=getPreviewPlan();assert.equal(plan.mj.origin,MJ_ORIGIN);assert.equal(plan.player.origin,PLAYER_ORIGIN);
  assert.notEqual(plan.mj.origin,plan.player.origin);assert.match(securityDisclosure(),/non|Aucune/);
});
test('known paths allowed, including actual player separate URL',()=>{
  for(const url of [MJ_ORIGIN+'/',MJ_ORIGIN+'/index.html',MJ_ORIGIN+'/assets/mj.js',PLAYER_ORIGIN+'/player.html',PLAYER_ORIGIN+'/assets/player.js'])assert.equal(classifyPreviewUrl(url).ok,true,url);
});
test('public host, alias, different port, file and credentials forbidden',()=>{
  for(const url of ['https://example.com/','http://localhost:4173/','http://0.0.0.0:4173/','http://127.0.0.1:4175/','file:///etc/passwd',MJ_ORIGIN.replace('http://','http://guest:secret@')+'/',MJ_ORIGIN+'/?x=1',MJ_ORIGIN+'/#foo'])assert.equal(classifyPreviewUrl(url).ok,false,url);
});
test('cross origin source routes forbidden at policy layer',()=>{
 assert.equal(classifyPreviewUrl(PLAYER_ORIGIN+'/index.html').ok,false);
 assert.equal(classifyPreviewUrl(PLAYER_ORIGIN+'/assets/mj.js').ok,false);
 assert.equal(classifyPreviewUrl(MJ_ORIGIN+'/player.html').ok,false);
 assert.equal(classifyPreviewUrl(MJ_ORIGIN+'/assets/player.js').ok,false);
});
test('no mutable plan or expansion to arbitrary hosts',()=>{
 assert.throws(()=>getPreviewPlan({mjOrigin:'http://0.0.0.0:4173'}));
 assert.throws(()=>getPreviewPlan({playerOrigin:MJ_ORIGIN}));
 assert.throws(()=>getPreviewPlan({host:'0.0.0.0'}));
 assert.equal(Object.isFrozen(getPreviewPlan()),true);
});
test('navigation covers full seven step user journey',()=>{
 assert.deepEqual(NAVIGATION.map(s=>s.id),['campagne','fiches','creature','scene','projection','sauvegarde','createurs']);
 for(const step of NAVIGATION){assert.ok(step.selector);assert.ok(step.label);}
});
test('probe makes exactly 8 read-only HTTP checks, verifies defensive headers',async()=>{
 const calls=[];
 const headers=new Map([['content-security-policy',"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'none'; frame-ancestors 'none'"],['cache-control','no-store'],['x-content-type-options','nosniff'],['referrer-policy','no-referrer']]);
 const fake=async (url,options)=>{calls.push({url,options});const origin=new URL(url).origin;const status= url.includes('/assets/mj.js')&&origin===PLAYER_ORIGIN||url.includes('/manifest.json')||url.endsWith('/index.html')&&origin===PLAYER_ORIGIN||url.endsWith('/player.html')&&origin===MJ_ORIGIN?404:200;
   return {status,url,headers:{get(k){return k==='content-type'? url.endsWith('.js')?'text/javascript':'text/html':headers.get(k)}},body:{async cancel(){}}};};
 const r=await probeLocalPreview({fetchImpl:fake});assert.equal(r.ok,true);assert.equal(r.checks.length,8);
 assert.equal(calls.length,8);for(const c of calls){assert.equal(c.options.redirect,'manual');assert.ok(c.options.signal)}
});
test('probe fails closed on missing CSP or player asset leak',async()=>{
 const fake=async url=>({status:200,url,headers:{get(k){return k==='content-type'?'text/html':''}}});
 const r=await probeLocalPreview({fetchImpl:fake});assert.equal(r.ok,false);
});
test('probe reports network failure rather than forging pass',async()=>{
 const r=await probeLocalPreview({fetchImpl:async()=>{throw Error('unreachable')}});
 assert.equal(r.ok,false);assert.equal(r.checks.filter(x=>!x.ok).length,8);
});
test('navigation refuses player origin even when root has append',()=>{
 const root={append(){},ownerDocument:{}};
 assert.throws(()=>mountPreviewNavigation(root,{view:{location:{origin:PLAYER_ORIGIN}}}),/refusée/);
});
test('navigation requires DOM root',()=>assert.throws(()=>mountPreviewNavigation(null),/refusée/));
test('navigation focuses existing field without changing it, and disposal removes guide',()=>{
  const created=[];const doc={createElement(tag){const el={tagName:tag,children:[],dataset:{},style:{},attrs:{},textContent:'',parent:null,
    setAttribute(k,v){this.attrs[k]=v;},append(c){c.parent=this;this.children.push(c);},remove(){this.removed=true;},
    addEventListener(k,fn){this['on_'+k]=fn;}};created.push(el);return el;}};
  const field={focusCount:0,focus(){this.focusCount++},scrollIntoView(){this.scrolled=true},value:'unchanged'};
  const root={ownerDocument:doc,append(x){this.nav=x}};
  const handle=mountPreviewNavigation(root,{view:{location:{origin:MJ_ORIGIN}},select:sel=>sel===NAVIGATION[0].selector?field:null});
  const first=root.nav.children.find(c=>c.dataset?.previewStep==='campagne');
  first.on_click();assert.equal(field.focusCount,1);assert.equal(field.value,'unchanged');assert.equal(field.scrolled,true);
  assert.equal(handle.stepIds.length,7);handle.dispose();assert.equal(root.nav.removed,true);
});
test('navigation missing stage refuses to invent campaign data',()=>{
  const elements=[];const doc={createElement(tag){const item={tagName:tag,dataset:{},style:{},setAttribute(){},append(){},addEventListener(kind,cb){this['on_'+kind]=cb;},remove(){}};elements.push(item);return item;}};
  const root={ownerDocument:doc,append(){}},controller=mountPreviewNavigation(root,{view:{location:{origin:MJ_ORIGIN}},select:()=>null});
  const clicker=elements.find(x=>x.dataset.previewStep==='fiches');assert.ok(clicker);assert.doesNotThrow(()=>clicker.on_click());controller.dispose();
});
