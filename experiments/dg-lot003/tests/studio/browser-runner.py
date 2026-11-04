"""Real Chromium test against two actual local HTTP origins, entirely synthetic fixtures.
Optional local test runner; requires preinstalled Python playwright + Chromium.
Does not run on about:blank or pretend to test the integrated app.
"""
from __future__ import annotations
import hashlib, json, os, socket, subprocess, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

ROOT = Path(__file__).resolve().parents[2]
LOG = ROOT / 'tests/studio/browser-results.json'
RESULTS=[]

def wait_port(port):
    for _ in range(80):
        try:
            with socket.create_connection(('127.0.0.1', port), timeout=.15): return
        except OSError: time.sleep(.1)
    raise RuntimeError(f'HTTP port {port} not available')

def verify(label, predicate, detail=''):
    if not predicate:
        RESULTS.append({'test':label,'status':'FAIL','detail':detail})
        raise AssertionError(label + ': ' + detail)
    RESULTS.append({'test':label,'status':'PASS'})

def main():
    servers=[]
    try:
        for port in (4173,4174):
            proc=subprocess.Popen([sys.executable,'-m','http.server',str(port),'--bind','127.0.0.1','--directory',str(ROOT)],
                stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            servers.append(proc)
            wait_port(port)
        with sync_playwright() as playwright:
            browser=playwright.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
            ctx=browser.new_context(accept_downloads=True)
            errors=[]
            ctx.add_init_script("window.__observedMessages=[];window.addEventListener('message',e=>window.__observedMessages.push(JSON.stringify(e.data))); ")
            page=ctx.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto('http://127.0.0.1:4173/tests/studio/harness-studio.html',wait_until='networkidle')
            page.get_by_label('Nom de la campagne').fill('Campagne d’essai synthétique')
            page.get_by_role('button',name='Créer campagne').click()
            verify('campagne et état vide', 'Campagne active' in page.locator('main').inner_text() and
                   'Aucun PJ importé' in page.locator('main').inner_text())
            payload={'schema':'alrick.sheets.v3','sheets':[{'name':'Aventurière fictive','level':5,
                'stats':{'physique':14,'agilite':4,'esprit':5,'presence':3},
                'extensionInconnue':{'secret':'PRIVATE_SENTINEL_IMPORT_7e9e'},
                'gmNotes':'PRIVATE_SENTINEL_IMPORT_7e9e'}]}
            raw=json.dumps(payload,ensure_ascii=False,separators=(',',':')).encode('utf-8')
            page.get_by_label('Fichier PJ v2/v3').set_input_files({'name':'fiction.json','mimeType':'application/json','buffer':raw})
            page.get_by_role('button',name='Prévisualiser PJ').click()
            verify('prévisualisation sans mutation',
                   len(page.evaluate('window.__studio.getCampaign().characters'))==0 and
                   'À importer' in page.locator('main').inner_text())
            page.get_by_role('button',name='Accepter copie PJ').click()
            c=page.evaluate('window.__studio.getCampaign()')
            accepted=c['characters'][0]['privateSnapshot']
            verify('PJ raw14 extension + octets SHA',accepted['sheet']['stats']['physique']==14 and
                   accepted['sheet']['extensionInconnue']['secret']=='PRIVATE_SENTINEL_IMPORT_7e9e' and
                   accepted['sha256']==hashlib.sha256(raw).hexdigest() and
                   bytes(accepted['originalBytes'])==raw)
            page.get_by_label('Code ou référence créature').fill('FICT-BEST-001')
            page.get_by_role('button',name='Prévisualiser référence').click()
            page.get_by_role('button',name='Créer copie d’instance').click()
            c=page.evaluate('window.__studio.getCampaign()')
            verify('créature source/copie distinctes',len(c['creatures'])==1 and
                   c['creatures'][0]['id']!=c['creatures'][0]['source']['profileId'] and
                   c['creatures'][0]['source']['documentId']=='FICT-BEST-001')
            page.get_by_label('Titre de nouvelle scène').fill('Une entrée <sans script>')
            page.get_by_label('Description destinée à être proposée au public').fill('Des bruits en forêt <img src=x onerror=alert(1)>')
            page.get_by_label('Notes privées MJ',exact=True).fill('PRIVATE_SENTINEL_SCENE_834c')
            page.get_by_role('button',name='Créer scène').click()
            page.get_by_label('Aventurière fictive',exact=True).check()
            page.get_by_label('Créature fictive N5',exact=True).check()
            page.get_by_role('button',name='Enregistrer la scène et les notes privées').click()
            verify('notes privées enregistrées',page.evaluate("window.__studio.getCampaign().scenes[0].privateNotes")=='PRIVATE_SENTINEL_SCENE_834c')
            verify('origine studio autorisée',page.evaluate('window.__studio.canProject') is True)
            with page.expect_popup() as opened:
                page.get_by_role('button',name='Ouvrir la fenêtre joueur').click()
            player=opened.value
            player.wait_for_load_state('networkidle')
            page.wait_for_function('window.__studio.isPlayerReady() === true',timeout=8000)
            verify('origines distinctes',player.url.startswith('http://127.0.0.1:4174/') and
                   page.url.startswith('http://127.0.0.1:4173/'))
            player.on('pageerror', lambda e: errors.append(str(e)))
            verify('joueur état vide avant consentement', 'Aucune information publique' in player.locator('main').inner_text())
            page.get_by_label('Partager le titre de la scène').check()
            page.get_by_label('Partager la description publique').check()
            page.get_by_label('Afficher Aventurière fictive').check()
            page.get_by_role('button',name='Publier uniquement la sélection').click()
            player.get_by_role('heading',name='Une entrée <sans script>').wait_for()
            visible=player.locator('main').inner_text()
            forbidden=['PRIVATE_SENTINEL_SCENE_834c','PRIVATE_SENTINEL_IMPORT_7e9e',
                       'PRIVATE_SENTINEL_CREATURE_92bb','PRIVATE_SENTINEL_CREATURE_INSTANCE_2f91']
            observed=player.evaluate('window.__observedMessages')
            local=player.evaluate('({local:Object.entries(localStorage),session:Object.entries(sessionStorage)})')
            verify('aucun secret DOM et stockage joueur',not any(x in visible or x in player.content() or x in json.dumps(local) for x in forbidden))
            verify('aucun secret dans postMessage joueur',not any(x in ''.join(observed) for x in forbidden) and
                   not any('characters' in x or 'privateSnapshot' in x for x in observed))
            verify('aucune injection HTML',player.locator('main img').count()==0 and '<img src=x onerror=alert(1)>' in visible)
            verify('whitelist participants', 'Aventurière fictive' in visible and 'Créature fictive N5' not in visible)
            with page.expect_download() as exported:
                page.get_by_role('button',name='Exporter projection publique').click()
            public_json=exported.value.path().read_text(encoding='utf-8')
            verify('export public whitelist',not any(x in public_json for x in forbidden) and
                   set(json.loads(public_json))=={'schema','revision','scene'})
            with page.expect_download() as private_download:
                page.get_by_role('button',name='Exporter campagne CONFIDENTIELLE').click()
            private_bytes=private_download.value.path().read_bytes()
            private_json=json.loads(private_bytes)
            verify('export privé confidentiel',private_json['classification']=='CONFIDENTIEL' and
                   private_json['campaign']['characters'][0]['privateSnapshot']['sha256']==hashlib.sha256(raw).hexdigest())
            # Force a bad source-origin message: self-message cannot impersonate opener.
            before=player.locator('main').inner_text()
            player.evaluate("""() => {let c=new URL(location.href).searchParams.get('channel');
              window.postMessage({kind:'cer.dg003.player.show',channel:c,
                projection:{schema:'cer.studio.player.whitelist.dg003.v0',revision:1,
                  scene:{title:'INJECTED',description:'',visibleActors:[]}}},'*');}""")
            player.wait_for_timeout(120)
            verify('refus message source non approuvée',player.locator('main').inner_text()==before)
            page.get_by_label('Fichier de restauration confidentiel').set_input_files(
                {'name':'private.json','mimeType':'application/json','buffer':private_bytes})
            page.get_by_role('button',name='Prévisualiser restauration').click()
            verify('restauration preview non mutante',page.evaluate('window.__studio.getCampaign().revision')==c['revision']+2)
            page.get_by_role('button',name='Confirmer restauration').click()
            restored=page.evaluate('window.__studio.getCampaign()')
            verify('restauration fidèle',restored['characters'][0]['privateSnapshot']['sha256']==hashlib.sha256(raw).hexdigest() and
                   restored['scenes'][0]['privateNotes']=='PRIVATE_SENTINEL_SCENE_834c')
            page.reload(wait_until='networkidle')
            page.get_by_role('button',name='Recharger campagne').click()
            verify('persistance après reload',page.evaluate('window.__studio.getCampaign().characters.length')==1)
            # Studio served from wrong origin is disabled.
            unauthorized=ctx.new_page()
            unauthorized.goto('http://127.0.0.1:4174/tests/studio/harness-studio.html',wait_until='networkidle')
            unauthorized.get_by_label('Nom de la campagne').fill('Local refus')
            unauthorized.get_by_role('button',name='Créer campagne').click()
            unauthorized.get_by_label('Titre de nouvelle scène').fill('Refus')
            unauthorized.get_by_role('button',name='Créer scène').click()
            verify('mauvaise origine : projection désactivée',unauthorized.get_by_role('button',name='Ouvrir la fenêtre joueur').is_disabled())
            verify('absence erreur JavaScript non traitée',len(errors)==0,'; '.join(errors))
            page.screenshot(path=str(ROOT/'tests/studio/chromium-studio-fictif.png'),full_page=True)
            player.screenshot(path=str(ROOT/'tests/studio/chromium-joueur-fictif.png'),full_page=True)
            browser.close()
    except Exception as exc:
        print('ERROR',type(exc).__name__,str(exc))
        raise
    finally:
        LOG.write_text(json.dumps({'tests':RESULTS,'passed':sum(x['status']=='PASS' for x in RESULTS),
            'failed':sum(x['status']=='FAIL' for x in RESULTS),'runner':'Chromium on local 127.0.0.1:4173/4174, synthetic ports'},
            ensure_ascii=False,indent=2),encoding='utf-8')
        for proc in servers:
            proc.terminate()
            try:proc.wait(timeout=5)
            except subprocess.TimeoutExpired:proc.kill()
    print('Browser scenarios PASS:',sum(x['status']=='PASS' for x in RESULTS))

if __name__=='__main__':main()
