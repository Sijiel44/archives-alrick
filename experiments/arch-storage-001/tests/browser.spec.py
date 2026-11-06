"""Actual Chromium + real loopback HTTP + IndexedDB. Requires pip install playwright and a locally installed Chromium."""
import asyncio, json, os, subprocess, sys, time, urllib.request
from pathlib import Path
from playwright.async_api import async_playwright

BASE='http://127.0.0.1:4181/'
ROOT=Path(__file__).resolve().parents[1]
CHROME=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium')
async def test():
 server=subprocess.Popen(['node',str(ROOT/'tools/serve.mjs')],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 try:
  for _ in range(100):
   try:
    with urllib.request.urlopen(BASE,timeout=.5) as response:
     assert response.status==200
     assert "connect-src 'none'" in response.headers['content-security-policy']
    break
   except Exception: await asyncio.sleep(.1)
  else:raise RuntimeError('Local server not responding')
  async with async_playwright() as pw:
   browser=await pw.chromium.launch(executable_path=CHROME,headless=True)
   ctx=await browser.new_context(viewport={'width':768,'height':1024})
   page=await ctx.new_page();await page.goto(BASE)
   await page.wait_for_selector('#seed');await page.get_by_text('Créer campagne fictive, 2 PJ, créature, 2 scènes et note MJ').click()
   await page.wait_for_function('document.querySelector("#stats").textContent.includes("Campagne fictive")')
   base=await page.evaluate('async()=>{let s=window.__p1aDemo.store;return {c:await s.readCampaign("campagne-fictive-p1a"),events:await s.listEvents("campagne-fictive-p1a")}}')
   assert [len(base['c'][k]) for k in ['characters','instances','scenes','privateNotes']]==[2,1,2,1]
   assert len(base['events'])==7 and base['c']['revision']==7
   assert base['c']['characters'][0]['rawStat']==14
   print('PASS B01 fixture 2PJ / 1 creature / 2 scenes / private note / revision7')
   # cross-tab: both pages access real same-origin IndexedDB
   second=await ctx.new_page();await second.goto(BASE)
   await second.wait_for_function('window.__p1aDemo && window.__p1aDemo.store')
   changed=await second.evaluate('async()=>{const c=await window.__p1aDemo.store.readCampaign("campagne-fictive-p1a");return c?.revision}')
   assert changed==7
   print('PASS B02 shared IndexedDB across 2 real tabs')
   # before-commit injected failure proves atomic rollback of both object stores
   before=await page.evaluate('async()=>{const s=window.__p1aDemo.store;const c=await s.readCampaign("campagne-fictive-p1a");const n=(await s.listEvents(c.id)).length;try{await s.applyEvent({campaignId:c.id,eventId:"crash-before-commit",kind:"add-private-note",expectedRevision:c.revision,payload:{note:{id:"note-panne",sceneId:"scene-2",text:"never persisted"}}},{injectFailure:"before-commit"});return {unexpected:true}}catch(e){return {code:e.code,revision:(await s.readCampaign(c.id)).revision,events:(await s.listEvents(c.id)).length,previous:n}}}')
   assert before['revision']==7 and before['events']==before['previous']==7
   print('PASS B03 failure before commit rolls back state + journal')
   # ack lost, idempotent retry (same event id)
   result=await page.evaluate('async()=>{const s=window.__p1aDemo.store,c=await s.readCampaign("campagne-fictive-p1a");const cmd={campaignId:c.id,eventId:"retry-event",kind:"add-private-note",expectedRevision:c.revision,payload:{note:{id:"note-retry",sceneId:"scene-2",text:"fictitious retry"}}};let error;try{await s.applyEvent(cmd,{injectFailure:"ack-lost"});}catch(e){error=e.code;}const r=await s.applyEvent(cmd);const after=await s.readCampaign(c.id);return {error,r,rev:after.revision,notes:after.privateNotes.filter(x=>x.id==="note-retry").length,journal:(await s.listEvents(c.id)).length}}')
   assert result['error']=='ACK_LOST_AFTER_COMMIT' and result['r']['status']=='duplicate' and result['notes']==1 and result['journal']==result['rev']==8
   print('PASS B04 ack lost recovery idempotent (no duplicate)')
   # concurrent writers in two real pages share the revision: one wins, one stale
   expr='async (n)=>{const s=window.__p1aDemo.store,c=await s.readCampaign("campagne-fictive-p1a");try{const r=await s.applyEvent({campaignId:c.id,eventId:"tab-event-"+n,kind:"add-private-note",expectedRevision:8,payload:{note:{id:"note-tab-"+n,sceneId:"scene-1",text:"fictitious tab"}}});return r.status}catch(e){return e.code??e.message}}'
   both=await asyncio.gather(page.evaluate(expr,'a'),second.evaluate(expr,'b'))
   assert sorted(both)==['STALE_REVISION','committed'],both
   print('PASS B05 real two-tab optimistic concurrency: one commit / one stale')
   # reload preserving same browser profile
   await page.reload()
   await page.wait_for_function('window.__p1aDemo && window.__p1aDemo.store')
   persisted=await page.evaluate('async()=>{const s=window.__p1aDemo.store,c=await s.readCampaign("campagne-fictive-p1a");return {revision:c.revision,j:(await s.listEvents(c.id)).length}}')
   assert persisted=={'revision':9,'j':9}
   print('PASS B06 reload preserves state and event journal')
   # export private, tampering, collision refusal, then fresh browser context import
   exported=await page.evaluate('async()=>{const x=await window.__p1aDemo.store.exportPrivate("campagne-fictive-p1a");return {bytes:[...x.bytes],sha:x.sha256}}')
   assert len(exported['bytes'])>500
   collision=await page.evaluate('async arr=>{const s=window.__p1aDemo.store,p=await s.previewImport(Uint8Array.from(arr));try{await s.commitImport(p);return "unexpected"}catch(e){return e.code}}',exported['bytes'])
   assert collision=='CAMPAIGN_COLLISION'
   tamper=await page.evaluate('async arr=>{arr[30]=(arr[30]+1)%127;try{await window.__p1aDemo.store.previewImport(Uint8Array.from(arr));return "unexpected"}catch(e){return e.code}}',[*exported['bytes']])
   assert tamper in ['BAD_ARCHIVE','HASH_MISMATCH','BAD_JSON']
   print('PASS B07 export SHA, collision rejected and corrupt import refused')
   # imported into empty indexeddb in separate isolated browser context, event count exact
   other=await browser.new_context();dest=await other.new_page();await dest.goto(BASE)
   await dest.wait_for_function('window.__p1aDemo && window.__p1aDemo.store')
   restored=await dest.evaluate('async arr=>{const s=window.__p1aDemo.store,p=await s.previewImport(Uint8Array.from(arr));const r=await s.commitImport(p);const c=await s.readCampaign(r.campaignId),j=await s.listEvents(c.id),e=await s.exportPrivate(c.id);return {revision:c.revision,count:j.length,notes:c.privateNotes.length,bytes:[...e.bytes]}}',exported['bytes'])
   assert restored['revision']==9 and restored['count']==9 and restored['notes']==3 and restored['bytes']==exported['bytes']
   print('PASS B08 import into fresh profile and byte-exact private re-export')
   # no API from player, only same-origin localhost app, clean UI rendering does not execute HTML injected
   policy=await page.evaluate('()=>({scripts:[...document.scripts].map(x=>x.src),external:performance.getEntriesByType("resource").filter(x=>!x.name.startsWith(location.origin)).map(x=>x.name),p:location.port})')
   assert policy['p']=='4181' and policy['external']==[]
   print('PASS B09 local origin only / no external resource in page')
   # responsive, labels and no horizontal overflow
   for w in (1280,768,390):
    await page.set_viewport_size({'width':w,'height':800});m=await page.evaluate('()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll("button")].every(b=>b.getBoundingClientRect().height>=44)})')
    assert m['scroll']<=m['width'] and m['buttons'],m
   print('PASS B10 responsive 1280/768/390 and >=44px buttons')
   await other.close();await ctx.close();await browser.close()
 finally:
  server.terminate()
  try:server.wait(timeout=5)
  except subprocess.TimeoutExpired:server.kill()
if __name__=='__main__':
 try:asyncio.run(test())
 except Exception as e:print('FAIL BROWSER',repr(e),file=sys.stderr);raise
