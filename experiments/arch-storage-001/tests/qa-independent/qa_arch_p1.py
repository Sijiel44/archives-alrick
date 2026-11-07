"""QA-ARCH-P1 independent browser protocol. Fictional test data only."""
import asyncio, hashlib, json, os, subprocess, sys, time, urllib.request
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[3]
URL='http://127.0.0.1:4181/'
HEAD=os.environ.get('QA_EXPECTED_HEAD','')
RESULTS=[]
def sha(data): return hashlib.sha256(bytes(data)).hexdigest()
async def check(id,fn):
    started=time.monotonic()
    try:
        result=await asyncio.wait_for(fn(),timeout=30)
        status='PASS'
        info=result if isinstance(result,dict) else {}
    except Exception as e:
        status='FAIL';info={'error':str(e)[:500]}
    RESULTS.append({'id':id,'status':status,'durationMs':round((time.monotonic()-started)*1000),'evidence':info})
    print('QA_ARCH_P1',json.dumps(RESULTS[-1],ensure_ascii=False),flush=True)

async def main():
    server=subprocess.Popen(['node',str(ROOT/'tools/serve.mjs')],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    try:
        for _ in range(120):
            try:
                with urllib.request.urlopen(URL,timeout=.5) as response:
                    assert response.status==200
                    break
            except Exception: await asyncio.sleep(.1)
        else: raise RuntimeError('HTTP 4181 local unavailable')
        async with async_playwright() as pw:
            browser=await pw.chromium.launch(executable_path=os.environ['CHROMIUM_PATH'],headless=True)
            ctx=await browser.new_context()
            page=await ctx.new_page()
            await page.goto(URL)
            await page.locator('body[data-p1a-ready="true"]').wait_for(timeout=15000)
            second=None;fresh=None;exported=None
            async def b01():
                await page.get_by_text('Créer campagne fictive, 2 PJ, créature, 2 scènes et note MJ').click()
                state=await page.evaluate("""async()=>{const s=window.__p1aDemo.store,c=await s.readCampaign('campagne-fictive-p1a'),j=await s.listEvents('campagne-fictive-p1a');return {rev:c.revision,counts:[c.characters.length,c.instances.length,c.scenes.length,c.privateNotes.length],rawStat:c.characters[0].rawStat,j:j.length,distinct:c.instances[0].id!==c.instances[0].profileId,unknown:c.extensions.unknownFuture.retained}}""")
                assert state['rev']==7 and state['j']==7 and state['counts']==[2,1,2,1] and state['rawStat']==14 and state['distinct'] and state['unknown'],state
                return state
            await check('B01',b01)
            async def b02():
                nonlocal second
                second=await ctx.new_page();await second.goto(URL);await second.locator('body[data-p1a-ready="true"]').wait_for()
                rev=await second.evaluate("async()=> (await window.__p1aDemo.store.readCampaign('campagne-fictive-p1a')).revision")
                assert rev==7
                return {'secondTabRevision':rev}
            await check('B02',b02)
            async def b03():
                state=await page.evaluate("""async()=>{const s=window.__p1aDemo.store,c=await s.readCampaign('campagne-fictive-p1a'),j=await s.listEvents(c.id);let err='';try{await s.applyEvent({campaignId:c.id,eventId:'qa-abort',expectedRevision:c.revision,kind:'add-private-note',payload:{note:{id:'qa-abort-note',sceneId:'scene-1',text:'never committed'}}},{injectFailure:'before-commit'})}catch(e){err=e.code??e.message}const z=await s.readCampaign(c.id),k=await s.listEvents(c.id);return {err,oldRev:c.revision,newRev:z.revision,oldEvents:j.length,newEvents:k.length,notes:z.privateNotes.some(x=>x.id==='qa-abort-note')}}""")
                assert state['err']=='INJECTED_FAILURE_BEFORE_COMMIT' and state['oldRev']==state['newRev'] and state['oldEvents']==state['newEvents'] and not state['notes'],state
                return state
            await check('B03',b03)
            async def b04():
                state=await page.evaluate("""async()=>{const s=window.__p1aDemo.store,c=await s.readCampaign('campagne-fictive-p1a');const cmd={campaignId:c.id,eventId:'qa-ack',expectedRevision:c.revision,kind:'add-private-note',payload:{note:{id:'qa-ack-note',sceneId:'scene-1',text:'ack lost synthetic'}}};let err;try{await s.applyEvent(cmd,{injectFailure:'ack-lost'})}catch(e){err=e.code}const retry=await s.applyEvent(cmd),x=await s.readCampaign(c.id),j=await s.listEvents(c.id);return {err,retry:retry.status,revision:x.revision,journal:j.length,noteCount:x.privateNotes.filter(n=>n.id==='qa-ack-note').length}}""")
                assert state['err']=='ACK_LOST_AFTER_COMMIT' and state['retry']=='duplicate' and state['revision']==state['journal']==8 and state['noteCount']==1,state
                return state
            await check('B04',b04)
            async def b05():
                assert second is not None
                code="""async tag=>{const s=window.__p1aDemo.store,c=await s.readCampaign('campagne-fictive-p1a');const cmd={campaignId:c.id,eventId:'qa-race-'+tag,expectedRevision:8,kind:'add-private-note',payload:{note:{id:'qa-race-'+tag,sceneId:'scene-2',text:'race fictive'}}};try{return (await s.applyEvent(cmd)).status}catch(e){return e.code??e.message}}"""
                a,b=await asyncio.gather(page.evaluate(code,'a'),second.evaluate(code,'b'))
                assert sorted([a,b])==['STALE_REVISION','committed'],[a,b]
                return {'competing':[a,b]}
            await check('B05',b05)
            async def b06():
                await page.reload();await page.locator('body[data-p1a-ready="true"]').wait_for()
                state=await page.evaluate("""async()=>{const s=window.__p1aDemo.store,c=await s.readCampaign('campagne-fictive-p1a'),j=await s.listEvents(c.id);return {rev:c.revision,events:j.length}}""")
                assert state=={'rev':9,'events':9},state
                return state
            await check('B06',b06)
            async def b07():
                nonlocal exported
                exported=await page.evaluate("""async()=>{const x=await window.__p1aDemo.store.exportPrivate('campagne-fictive-p1a');return {bytes:Array.from(x.bytes),sha256:x.sha256}}""")
                assert sha(exported['bytes'])==exported['sha256']
                res=await page.evaluate("""async b=>{const s=window.__p1aDemo.store,p=await s.previewImport(Uint8Array.from(b));try{await s.commitImport(p);return 'wrong'}catch(e){return e.code}}""",exported['bytes'])
                assert res=='CAMPAIGN_COLLISION',res
                bad=exported['bytes'].copy();bad[-18]=(bad[-18]+13)%256
                rejected=await page.evaluate("""async b=>{try{await window.__p1aDemo.store.previewImport(Uint8Array.from(b));return 'wrong'}catch(e){return e.code}}""",bad)
                assert rejected in ('BAD_ARCHIVE','HASH_MISMATCH','BAD_JSON'),rejected
                return {'exportBytes':len(exported['bytes']),'sha256':exported['sha256'],'collision':res,'tamper':rejected}
            await check('B07',b07)
            async def b08():
                nonlocal fresh
                assert exported
                fresh=await browser.new_context();dest=await fresh.new_page();await dest.goto(URL);await dest.locator('body[data-p1a-ready="true"]').wait_for()
                result=await dest.evaluate("""async b=>{const s=window.__p1aDemo.store,p=await s.previewImport(Uint8Array.from(b));await s.commitImport(p);const c=await s.readCampaign(p.campaign.id),j=await s.listEvents(c.id),e=await s.exportPrivate(c.id);return {revision:c.revision,journal:j.length,sha256:e.sha256,bytes:Array.from(e.bytes),unknown:c.extensions.unknownFuture.retained}}""",exported['bytes'])
                assert result['revision']==result['journal']==9 and result['unknown'] and result['bytes']==exported['bytes'] and result['sha256']==exported['sha256']
                return {'sameBytes':True,'sha256':result['sha256'],'unknown':result['unknown']}
            await check('B08',b08)
            async def b09():
                evidence=await page.evaluate("""()=>({origin:location.origin,external:performance.getEntriesByType('resource').map(x=>x.name).filter(x=>!x.startsWith(location.origin)),public:document.body.innerText.includes('PRIVE_P1A_SENTINEL_NE_JAMAIS_PROJETER'),csp:document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content??null})""")
                assert evidence['origin']==URL.rstrip('/') and evidence['external']==[] and not evidence['public'],evidence
                return evidence
            await check('B09',b09)
            async def b10():
                measurements=[]
                for w in [1280,768,390]:
                    await page.set_viewport_size({'width':w,'height':800})
                    m=await page.evaluate("""()=>({inner:innerWidth,scroll:document.documentElement.scrollWidth,minButton:Math.min(...Array.from(document.querySelectorAll('button'),e=>e.getBoundingClientRect().height))})""")
                    assert m['scroll']<=m['inner'] and m['minButton']>=44,m
                    measurements.append(m)
                return {'viewports':measurements}
            await check('B10',b10)
            async def race_export():
                assert second is not None
                # Real concurrent IndexedDB writes during export, never a patched exception.
                outcomes={'valid':0,'refusal':0,'badArchive':0,'commits':0}
                for n in range(14):
                    r=await page.evaluate("""async n=>{const s=window.__p1aDemo.store,c=await s.readCampaign('campagne-fictive-p1a');const cmd={campaignId:c.id,eventId:'qa-export-race-'+n,expectedRevision:c.revision,kind:'add-private-note',payload:{note:{id:'qa-export-race-'+n,sceneId:'scene-1',text:'race-'+n}}};const items=await Promise.allSettled([s.exportPrivate(c.id),s.applyEvent(cmd)]);const exp=items[0],write=items[1];let archive='';if(exp.status==='fulfilled'){try{const p=await s.previewImport(exp.value.bytes);archive=p.campaign.revision==p.journal.length?'valid':'bad'}catch(e){archive='bad'}}else archive=exp.reason.code??exp.reason.message;return {archive,commit:write.status==='fulfilled'&&write.value.status==='committed'}}""",n)
                    if r['archive']=='valid':outcomes['valid']+=1
                    elif r['archive']=='JOURNAL_INCONSISTENT':outcomes['refusal']+=1
                    else:outcomes['badArchive']+=1
                    outcomes['commits']+=int(r['commit'])
                assert outcomes['badArchive']==0 and outcomes['commits']==14,outcomes
                return outcomes
            await check('P1-RACE-EXPORT',race_export)
            async def import_unknown():
                assert exported
                data=json.loads(bytes(exported['bytes']).decode())
                # Verify source's existing unknown field roundtrip, plus strictly rejected unsupported manifest.
                assert data['payload']['campaign']['extensions']['unknownFuture']=={'retained':True}
                wrong=json.loads(json.dumps(data));wrong['manifest']['schema']='cer.unknown.future'
                b=list(json.dumps(wrong,separators=(',',':')).encode())
                code=await page.evaluate("""async b=>{try{await window.__p1aDemo.store.previewImport(Uint8Array.from(b));return 'accepted'}catch(e){return e.code}}""",b)
                assert code!='accepted',code
                return {'unknownPreserved':True,'unknownVersionRejected':code}
            await check('P1-UNKNOWN-VERSION',import_unknown)
            if fresh: await fresh.close()
            if second: await second.close()
            await ctx.close();await browser.close()
    finally:
        server.terminate()
        try:server.wait(timeout=5)
        except subprocess.TimeoutExpired:server.kill()
        path=Path(os.environ.get('QA_ARCH_P1_REPORT','qa-arch-p1-evidence.json'))
        path.write_text(json.dumps({'sourceHead':'f84f8c54361b3701ebb0251700f2d0d09d4acf4d','testedHead':HEAD,'platform':'Ubuntu GitHub runner; Node 24; Chrome official; Python Playwright 1.56.0','results':RESULTS},ensure_ascii=False,indent=2))
        print('QA_ARCH_P1_SUMMARY',json.dumps({'head':HEAD,'pass':sum(x['status']=='PASS' for x in RESULTS),'fail':sum(x['status']=='FAIL' for x in RESULTS),'count':len(RESULTS)}))
    if any(x['status']=='FAIL' for x in RESULTS):sys.exit(1)
if __name__=='__main__': asyncio.run(main())
