"""QA-ready scenario against REAL integrated HTTP pages, not about:blank.
Requires `python -m playwright` installed by QA environment. Never disables browser policy.
If browser access is denied, returns failure / NON EXÉCUTÉ, never PASS.
"""
from pathlib import Path
import json, os, sys
from playwright.sync_api import sync_playwright

MJ='http://127.0.0.1:4173'
PLAYER='http://127.0.0.1:4174'
ROOT=Path(__file__).resolve().parent
assert MJ != PLAYER

def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'))
        ctx=browser.new_context(viewport={'width':390,'height':844},accept_downloads=True)
        # Test instrumentation only, not part of user/player build.
        ctx.add_init_script("window.__l004Captured=[];addEventListener('message',e=>window.__l004Captured.push({origin:e.origin,data:e.data}));")
        page=ctx.new_page()
        try:
            page.goto(MJ+'/dg004-demo.html',wait_until='domcontentloaded',timeout=10000)
            page.get_by_role('heading',name='Studio — démonstration fictive L004-A').wait_for()
            assert page.locator('[data-l004-demo]').count()==1
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'), 'Horizontal mobile overflow'
            page.get_by_role('button',name='Créer campagne fictive',exact=True).click()
            page.get_by_role('button',name='Prévisualiser PJ fictif',exact=True).click()
            page.get_by_role('button',name='Accepter copie PJ',exact=True).click()
            page.get_by_role('button',name='Prévisualiser créature fictive',exact=True).click()
            page.get_by_role('button',name='Accepter copie créature',exact=True).click()
            page.get_by_role('button',name='Créer scène et notes MJ fictives',exact=True).click()
            assert page.get_by_text('SENTINELLE_MJ_L004_FICTIVE',exact=False).count()>=1
            # Three REAL descriptive creator forms from PR85; no numeric effects.
            for kind,title in [('capacity','Lueur de passage'),('item','Lanterne d’argile'),('spell','Voile de brume')]:
                editor=page.locator(f'form[data-creator-kind="{kind}"]')
                page.get_by_role('button',name={'capacity':'Capacité','item':'Objet','spell':'Sort'}[kind],exact=True).click()
                editor.locator('input[name="name"]').fill(title)
                editor.locator('input[name="provenance"]').fill('Laboratoire fictif L004')
                editor.locator('input[name="version"]').fill('0.0.1')
                editor.locator('textarea[name="description"]').fill('Description purement fictive sans effet numérique ni coût')
                editor.locator('textarea[name="limitations"]').fill('Aucun avantage automatique en jeu')
                editor.get_by_role('button',name='Enregistrer localement').click()
                editor.get_by_text('Enregistré localement',exact=False).wait_for()
            page.get_by_role('button',name='Prévisualiser le lien privé vers la scène').click()
            page.get_by_text('Privé — Lanterne d’argile → Lueur de passage',exact=False).wait_for()
            assert page.locator('[aria-label="L004-C — raccord descriptif scène"]').get_by_text('Indisponible — règle/validateur non homologué').count()==1
            with page.expect_popup() as pop:
                page.get_by_role('button',name='Ouvrir la fenêtre joueur').click()
            player=pop.value
            player.wait_for_load_state('domcontentloaded')
            assert player.url.startswith(PLAYER+'/'+'player.html')
            # After READY, manually select public fields and publish.
            page.get_by_label('Partager le titre de la scène').check()
            page.get_by_label('Partager la description publique').check()
            page.get_by_role('button',name='Publier uniquement la sélection').click()
            player.get_by_text('La Lanterne des Deux Rives').wait_for()
            assert 'SENTINELLE_MJ_L004_FICTIVE' not in player.content()
            assert 'SENTINELLE_MJ_L004_FICTIVE' not in json.dumps(player.evaluate('window.__l004Captured'))
            assert player.evaluate('localStorage.length')==0
            page.get_by_label('Titre de nouvelle scène').fill('Nouvelle scène fictive')
            page.get_by_role('button',name='Créer scène',exact=True).click()
            player.get_by_text('Aucune information publique transmise.').wait_for()
            assert player.get_by_text('La Lanterne des Deux Rives').count()==0
            with page.expect_download() as d:
                page.get_by_role('button',name='Exporter campagne CONFIDENTIELLE').click()
            raw=d.value.path().read_bytes()
            assert raw and b'CONFIDENTIEL' in d.value.suggested_filename.encode('utf8')
            page.get_by_label('Fichier de restauration confidentiel').set_input_files({'name':'restore-demo.json','mimeType':'application/json','buffer':raw})
            page.get_by_role('button',name='Prévisualiser restauration').click()
            page.get_by_role('button',name='Confirmer restauration').click()
            page.screenshot(path=str(ROOT/'L004_BROWSER_FICTIF.png'),full_page=True)
            print('L004_BROWSER_PASS',json.dumps({'url':page.url,'player':player.url,'viewport':'390x844','archiveBytes':len(raw),'playerSecret':False}))
        finally:
            ctx.close();browser.close()

if __name__=='__main__':
    try:main()
    except Exception as exc:
        print('L004_BROWSER_NON_EXECUTE_OR_FAIL:',type(exc).__name__,str(exc),file=sys.stderr)
        sys.exit(2)
