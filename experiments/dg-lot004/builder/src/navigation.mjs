/** Optional MJ-only navigation aid; no app state write, no persistence, no game rules. */
import {MJ_ORIGIN,NAVIGATION} from './contract.mjs';
const canUse=(root)=>root&&typeof root.append==='function'&&root.ownerDocument;
export function mountPreviewNavigation(root,{view=root?.ownerDocument?.defaultView,select=selector=>root.ownerDocument.querySelector(selector)}={}){
  if(!canUse(root)||!view||view.location.origin!==MJ_ORIGIN)throw new Error('Navigation refusée hors origine MJ locale');
  const doc=root.ownerDocument;
  const nav=doc.createElement('nav');nav.setAttribute('aria-label','Parcours de prévisualisation local');
  nav.setAttribute('data-l004-preview-navigation','');
  const heading=doc.createElement('h2');heading.textContent='Parcours Studio local (données fictives)';nav.append(heading);
  const hint=doc.createElement('p');hint.setAttribute('role','status');hint.setAttribute('aria-live','polite');
  hint.textContent='Les étapes 2 à 6 apparaissent après création d’une campagne.';nav.append(hint);
  for(const item of NAVIGATION){
    const button=doc.createElement('button');button.type='button';button.textContent=item.label;
    button.dataset.previewStep=item.id;button.style.minHeight='44px';button.style.margin='0.25rem';
    button.addEventListener('click',()=>{
      const target=select(item.selector);
      if(!target||typeof target.focus!=='function'){
        hint.textContent='Étape indisponible : créez d’abord une campagne ou vérifiez le montage du Studio.';
        return;
      }
      target.scrollIntoView?.({block:'center',behavior:'auto'});
      target.focus({preventScroll:true});
      hint.textContent='Étape affichée : '+item.label+'. Aucune donnée modifiée.';
    });
    nav.append(button);
  }
  root.append(nav);
  return {node:nav,dispose(){nav.remove();},stepIds:NAVIGATION.map(item=>item.id)};
}
