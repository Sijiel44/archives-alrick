"""QA scenario against the ACTUAL 05-integrated page, NOT a standalone about:blank harness.
No browser bypass, no network outside 127.0.0.1. Purely fictional fixtures.
This script needs a separate, running 05 build/serve and Playwright. It does not inject
faults into native storage: split-commit/lost-ACK failures are covered by Node tests.
"""
import os, sys
from playwright.sync_api import sync_playwright

MJ='http://127.0.0.1:4173'
PLAYER='http://127.0.0.1:4174'
assert MJ!=PLAYER

def do():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'))
        context=browser.new_context(viewport={'width':390,'height':844})
        try:
            page=context.new_page()
            page.goto(MJ+'/dg004-demo.html',wait_until='domcontentloaded',timeout=10000)
            page.get_by_role('heading',name='Studio — démonstration fictive L004-A').wait_for()
            for label in ['Créer campagne fictive','Prévisualiser PJ fictif','Accepter copie PJ',
                          'Prévisualiser créature fictive','Accepter copie créature','Créer scène et notes MJ fictives']:
                page.get_by_role('button',name=label,exact=True).click()
                page.get_by_text('Étape exécutée. Vérifier le cockpit avant la suivante.',exact=True).wait_for()
            # A retry must reuse the source instance and scene, without creating a second entry.
            for label in ['Accepter copie créature','Créer scène et notes MJ fictives']:
                page.get_by_role('button',name=label,exact=True).click()
                page.get_by_text('Étape exécutée. Vérifier le cockpit avant la suivante.',exact=True).wait_for()
            names=page.locator('select[aria-label="Scène active"] option').all_text_contents()
            assert len([x for x in names if x=='La Lanterne des Deux Rives'])==1,names
            assert 'SENTINELLE_MJ_L004_FICTIVE' in page.content()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Débordement mobile'
            with page.expect_popup() as p:
                page.get_by_role('button',name='Ouvrir la fenêtre joueur').click()
            player=p.value
            player.wait_for_load_state('domcontentloaded')
            assert player.url.startswith(PLAYER+'/player.html'),player.url
            page.get_by_label('Partager le titre de la scène').check()
            page.get_by_label('Partager la description publique').check()
            page.get_by_role('button',name='Publier uniquement la sélection').click()
            player.get_by_text('La Lanterne des Deux Rives').wait_for()
            assert 'SENTINELLE_MJ_L004_FICTIVE' not in player.content()
            assert player.evaluate('localStorage.length')==0
            page.get_by_label('Titre de nouvelle scène').fill('Scène de révocation fictive')
            page.get_by_role('button',name='Créer scène',exact=True).click()
            player.get_by_text('Aucune information publique transmise.').wait_for()
            assert player.get_by_text('La Lanterne des Deux Rives').count()==0
            print('L004_REPAIR_BROWSER_PASS',{'url':page.url,'player':player.url,'sceneDuplicates':0,'privateMarkerInPlayer':False})
        finally:
            context.close();browser.close()

if __name__=='__main__':
    try:do()
    except Exception as exc:
        print('L004_REPAIR_BROWSER_FAIL_OR_NON_EXECUTE',type(exc).__name__,str(exc),file=sys.stderr)
        raise
