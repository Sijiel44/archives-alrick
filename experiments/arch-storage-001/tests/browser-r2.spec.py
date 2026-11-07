"""R2-only real Chrome acceptance. Uses P1-A sources, never a second rules engine.
Chromium/Playwright are TEST HARNESS dependencies only; no app dependency changed.
"""
import asyncio, json, os, subprocess, sys, tempfile, urllib.request
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
URL='http://127.0.0.1:4181/'
CHROME=os.environ.get('CHROMIUM_PATH','/usr/bin/google-chrome-stable')
CID='campagne-fictive-p1a'
async def main():
 server=subprocess.Popen(['node',str(ROOT/'tools/serve.mjs')],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 try:
  for _ in range(90):
   try:
    with urllib.request.urlopen(URL,timeout=.5) as r:
     assert r.status==200 and "script-src 'self'" in r.headers['Content-Security-Policy']
    break
   except Exception:await asyncio.sleep(.1)
  else:raise RuntimeError('Serveur R2 loopback indisponible')
  async with async_playwright() as pw:
   browser=await pw.chromium.launch(executable_path=CHROME,headless=True)
   ctx=await browser.new_context()
   mj=await ctx.new_page();await mj.goto(URL);await mj.locator('body[data-p1a-ready="true"]').wait_for()
   tab2=await ctx.new_page();await tab2.goto(URL);await tab2.locator('body[data-p1a-ready="true"]').wait_for()
   # B11: same user-level commands + byte-exact archive for strengthened A and B
   compare=await mj.evaluate('''async()=>{
    const {createAReinforcedComparison}=await import('./src/a-guard.mjs');
    const {openStore,seedFiction}=await import('./src/idb-store.mjs');
    const a=createAReinforcedComparison({storage:localStorage,key:'cer.arch-storage001.r2.comparison-a'});
    const b=await openStore({name:'cer.arch-storage001.r2.comparison-b'});
    window.__r2A=a;window.__r2B=b;
    await seedFiction(a);await seedFiction(b);
    const [ac,bc,aj,bj,ae,be]=await Promise.all([
     a.readCampaign(),b.readCampaign('campagne-fictive-p1a'),a.listEvents(),b.listEvents('campagne-fictive-p1a'),a.exportPrivate(),b.exportPrivate()]);
    return{campaignsEqual:JSON.stringify(ac)===JSON.stringify(bc),
     journalsEqual:JSON.stringify(aj)===JSON.stringify(bj),
     archivesEqual:JSON.stringify([...ae.bytes])===JSON.stringify([...be.bytes]),
     aRevision:ac.revision,bRevision:bc.revision,pj:bc.characters.length};
   }''')
   assert compare=={'campaignsEqual':True,'journalsEqual':True,'archivesEqual':True,'aRevision':7,'bRevision':7,'pj':2},compare
   print('PASS B11 A strengthened vs B: same real fixture, campaign/journal/archive byte exact')
   # B12: a second real tab commits while the export has snapshotted under a single readonly transaction
   await mj.evaluate('''()=>{
    window.__r2ExportPromise=window.__r2B.exportPrivate('campagne-fictive-p1a',{
      onTransactionOpen(){document.body.dataset.r2TxnOpened='yes';},
      async afterSnapshotRead(s){document.body.dataset.r2SnapshotReady='yes';window.__r2Captured=s;
        await new Promise(resolve=>{window.__r2ResumeExport=resolve;});}
    }).then(x=>({bytes:[...x.bytes],sha256:x.sha256}));return true;
   }''')
   await mj.locator('body[data-r2-snapshot-ready="yes"]').wait_for()
   w=await tab2.evaluate('''async()=>{
     const {openStore}=await import('./src/idb-store.mjs');const s=await openStore({name:'cer.arch-storage001.r2.comparison-b'});
     const c=await s.readCampaign('campagne-fictive-p1a');
     const r=await s.applyEvent({campaignId:c.id,eventId:'r2-during-export',expectedRevision:c.revision,
       kind:'add-private-note',payload:{note:{id:'r2-note-export',sceneId:'scene-1',text:'private fictional update'}}});
     s.close();return{r:r.status,revision:r.revision};
   }''')
   assert w=={'r':'committed','revision':8},w
   oldArchive=await mj.evaluate('async()=>{window.__r2ResumeExport();return window.__r2ExportPromise;}')
   envelope=json.loads(bytes(oldArchive['bytes']).decode('utf8'))
   assert envelope['manifest']['revision']==7
   assert envelope['payload']['campaign']['revision']==len(envelope['payload']['journal'])==7
   live=await mj.evaluate('''async()=>{const s=window.__r2B,c=await s.readCampaign('campagne-fictive-p1a');return{revision:c.revision,j:(await s.listEvents(c.id)).length}}''')
   assert live=={'revision':8,'j':8},live
   print('PASS B12 real second tab writes during export: coherent prior snapshot (7/7), live 8/8')
   # A precisely interleaved two-tab race: one localStorage envelope can lose a write.
   async def schedule_a(page,tag):
    return await page.evaluate('''async tag=>{
     const {createAReinforcedComparison}=await import('./src/a-guard.mjs');
     const a=createAReinforcedComparison({storage:localStorage,key:'cer.arch-storage001.r2.comparison-a'});
     const cmd={campaignId:'campagne-fictive-p1a',expectedRevision:7,eventId:'a-race-'+tag,
      kind:'add-private-note',payload:{note:{id:'a-note-'+tag,sceneId:'scene-1',text:'fake '+tag}}};
     window.__r2ALast=a.applyEvent(cmd,{beforePersist:async()=>{
      document.body.dataset['aRaceReady'+tag]='yes';await new Promise(resolve=>window.__r2ARelease=resolve);
     }});return true;
    }''',tag)
   await asyncio.gather(schedule_a(mj,'x'),schedule_a(tab2,'y'))
   await mj.locator('body[data-a-race-readyx="yes"]').wait_for()
   await tab2.locator('body[data-a-race-readyy="yes"]').wait_for()
   outcomes=await asyncio.gather(mj.evaluate('async()=>{window.__r2ARelease();return window.__r2ALast}'),tab2.evaluate('async()=>{window.__r2ARelease();return window.__r2ALast}'))
   assert all(x['status']=='committed' for x in outcomes)
   aRace=await mj.evaluate('''async()=>{const c=await window.__r2A.readCampaign();return{rev:c.revision,notes:c.privateNotes.filter(x=>x.id.startsWith('a-note-')).length}}''')
   assert aRace=={'rev':8,'notes':1},aRace
   print('PASS B13 A limitation REPRODUCED: same fixture, two tabs, two successes but one lost update; B uses stale rejection')
   # Simulated quota abort on B, same scenario must preserve both stores.
   q=await mj.evaluate('''async()=>{
      const s=window.__r2B,b=await s.readConsistentSnapshot(),rev=b.campaign.revision;
      let error=null;try{await s.applyEvent({campaignId:b.campaign.id,eventId:'r2-quota',expectedRevision:rev,
       kind:'add-private-note',payload:{note:{id:'r2-quota-note',sceneId:'scene-1',text:'never persisted'}}},
       {injectFailure:'quota'});}catch(e){error=e.code;}
      const a=await s.readConsistentSnapshot();return {error,oldRev:rev,newRev:a.campaign.revision,
       oldJournal:b.journal.length,newJournal:a.journal.length,
       noteAbsent:!a.campaign.privateNotes.some(x=>x.id==='r2-quota-note')};
   }''')
   assert q=={'error':'QUOTA_EXCEEDED_SIMULATED','oldRev':8,'newRev':8,'oldJournal':8,'newJournal':8,'noteAbsent':True},q
   print('PASS B14 SIMULATED quota failure aborts both stores, no data deleted (physical quota NON EXÉCUTÉ)')
   # Old tab cooperates on upgrade: onversionchange closes and old handle refuses writes.
   version_name='cer.arch-storage001.r2.version-cooperative'
   await mj.evaluate('''async name=>{const {openStore}=await import('./src/idb-store.mjs');const {initialCampaign}=await import('./src/contracts.mjs');
      window.__r2VersionStore=await openStore({name});await window.__r2VersionStore.createCampaign(initialCampaign());return true;}''',version_name)
   await tab2.evaluate('''async name=>{const {openStore}=await import('./src/idb-store.mjs');window.__r2OldTab=await openStore({name});return true;}''',version_name)
   upgrade=await mj.evaluate('''async name=>new Promise((resolve,reject)=>{const req=indexedDB.open(name,2);
      req.onupgradeneeded=()=>{};req.onblocked=()=>reject(Error('Unexpected cooperative block'));
      req.onerror=()=>reject(req.error);req.onsuccess=()=>{
       const d=req.result,t=d.transaction('campaigns','readonly'),q=t.objectStore('campaigns').get('campagne-fictive-p1a');
       q.onsuccess=()=>{const val=q.result;d.close();resolve({version:2,id:val.id,revision:val.revision});};
       q.onerror=()=>reject(q.error);
      };})''',version_name)
   assert upgrade=={'version':2,'id':CID,'revision':1},upgrade
   old=await tab2.evaluate('''async()=>{try{await window.__r2OldTab.readCampaign();return 'unexpected'}catch(e){return e.code??e.message}}''')
   assert old=='DB_CLOSED',old
   downgrade=await mj.evaluate('''async name=>{const {openStore}=await import('./src/idb-store.mjs');try{const s=await openStore({name});s.close();return 'unexpected'}catch(e){return e.name??e.code}}''',version_name)
   assert downgrade=='VersionError',downgrade
   print('PASS B15 DB upgrade with old cooperative tab, auto-close, old handle refused, downgrade rejected, data preserved')
   # An uncooperative raw legacy tab must BLOCK the version upgrade, never delete its data.
   block_name='cer.arch-storage001.r2.uncooperative'
   await tab2.evaluate('''async name=>new Promise((resolve,reject)=>{const q=indexedDB.open(name,1);
     q.onupgradeneeded=()=>q.result.createObjectStore('history',{keyPath:'id'});
     q.onerror=()=>reject(q.error);q.onsuccess=()=>{window.__r2Stubborn=q.result;
      const t=q.result.transaction('history','readwrite');t.objectStore('history').put({id:'legacy',value:'must-survive'});
      t.oncomplete=()=>resolve(true);t.onabort=()=>reject(t.error);};})''',block_name)
   await mj.evaluate('''name=>{window.__r2BlockedPromise=new Promise((resolve,reject)=>{
      const q=indexedDB.open(name,2);q.onblocked=()=>{document.body.dataset.r2Blocked='yes';};
      q.onupgradeneeded=()=>{};q.onerror=()=>reject(q.error);
      q.onsuccess=()=>{const db=q.result,tx=db.transaction('history','readonly'),r=tx.objectStore('history').get('legacy');
       r.onsuccess=()=>{const v=r.result;db.close();resolve({version:2,legacy:v.value});};r.onerror=()=>reject(r.error);};
      });return true;}''',block_name)
   await mj.locator('body[data-r2-blocked="yes"]').wait_for()
   await tab2.evaluate('()=>{window.__r2Stubborn.close();return true;}')
   result=await mj.evaluate('()=>window.__r2BlockedPromise')
   assert result=={'version':2,'legacy':'must-survive'},result
   print('PASS B16 DB old uncooperative tab blocks upgrade until closed; never deleted the legacy record')
   # Export -> actual disk file -> distinct browser profile (not same tab/localStorage).
   real=await mj.evaluate('''async()=>{const e=await window.__r2B.exportPrivate('campagne-fictive-p1a');return [...e.bytes]}''')
   with tempfile.TemporaryDirectory(prefix='p1a-r2-private-') as tmp:
    filepath=Path(tmp)/'CONFIDENTIEL_fictif_R2.json';filepath.write_bytes(bytes(real))
    isolated=await browser.new_context();outside=await isolated.new_page();await outside.goto(URL)
    await outside.locator('body[data-p1a-ready="true"]').wait_for()
    restored=await outside.evaluate('''async b=>{const s=window.__p1aDemo.store;
      const p=await s.previewImport(Uint8Array.from(b));const result=await s.commitImport(p);
      const exportAgain=await s.exportPrivate(result.campaignId);const c=await s.readCampaign(result.campaignId);
      return{rev:c.revision,private:c.privateNotes.length,bytes:[...exportAgain.bytes]};
    }''',list(filepath.read_bytes()))
    assert restored['rev']==8 and restored['private']==2 and restored['bytes']==real
    await isolated.close()
   print('PASS B17 private archive file saved outside origin profile and imported in a second clean Chrome context, exact bytes')
   await mj.evaluate('()=>{window.__r2B.close();window.__r2VersionStore.close();}')
   await ctx.close();await browser.close()
 finally:
  server.terminate()
  try:server.wait(timeout=5)
  except subprocess.TimeoutExpired:server.kill()
if __name__=='__main__':
 try:asyncio.run(main())
 except Exception as e:print('FAIL R2 BROWSER',repr(e),file=sys.stderr);raise
