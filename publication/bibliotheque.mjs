import {categories,searchLibrary} from './library-model.mjs';
const $=id=>document.getElementById(id);
const node=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
let entries=[],limit=24;
const state=()=>({q:$('search').value,category:$('category').value,usage:$('usage').value});
function readURL(){const p=new URLSearchParams(location.search);$('search').value=p.get('q')??'';$('category').value=p.get('category')??'';$('usage').value=p.get('usage')??'';}
function localHref(raw){try{const url=new URL(raw,location.href);return url.origin===location.origin && ['http:','https:'].includes(url.protocol)?url:null;}catch{return null;}}
function card(entry){
 const article=node('article',undefined,'card');
 if(entry.image&&localHref(entry.image)){const img=node('img');img.src=entry.image;img.alt=entry.imageAlt;img.loading='lazy';img.addEventListener('error',()=>img.remove(),{once:true});article.append(img);}
 const body=node('div',undefined,'card-body');body.append(node('p',`${categories.find(([id])=>id===entry.category)?.[1]??'Univers'} · ${entry.id}`,'eyebrow'),node('h3',entry.title),node('p',entry.description,'description'));
 const links=node('div',undefined,'variants');for(const v of entry.variants){const url=localHref(v.href);if(!url)continue;url.searchParams.set('bibliotheque',location.search);const group=node('div');const a=node('a',v.kind==='reading'?'Lire le dossier →':'Voir la référence de jeu →');a.href=url.href;a.setAttribute('aria-label',`${a.textContent} ${entry.title}`);group.append(a,node('small',({lore_valide:'Lore validé',proposition_non_jouee:'Proposition · non jouée',reference:'Référence documentaire',played:'Faits joués',lore:'Lore',test:'En test',hypothese:'Hypothèse',a_verifier:'À vérifier'})[v.status] ?? v.status));links.append(group);}body.append(links);article.append(body);return article;
}
function render(updateURL=true){
 const s=state();if(updateURL){const p=new URLSearchParams();for(const[k,v]of Object.entries(s))if(v)p.set(k,v);history.replaceState(null,'',`${location.pathname}${p.size?'?'+p:''}`);}
 const matches=searchLibrary(entries,s);$('cards').replaceChildren(...matches.slice(0,limit).map(card));$('count').textContent=`${matches.length} fiche${matches.length>1?'s':''} · ${Math.min(limit,matches.length)} affichée${Math.min(limit,matches.length)>1?'s':''}`;$('empty').hidden=matches.length>0;$('more').hidden=matches.length<=limit;
 document.querySelectorAll('[data-shelf]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shelf===s.category)));
}
function reset(){ for(const id of ['search','category','usage'])$(id).value='';limit=24;render();$('search').focus(); }
$('filters').addEventListener('submit',e=>{e.preventDefault();limit=24;render();});
for(const id of ['search','category','usage'])$(id).addEventListener(id==='search'?'input':'change',()=>{limit=24;render();});
$('reset').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);
$('more').addEventListener('click',()=>{const first=limit;limit+=24;render(false);const link=$('cards').children[first]?.querySelector('a');link?.focus();});
window.addEventListener('popstate',()=>{readURL();limit=24;render(false);});
try{
 const response=await fetch('./library-index.json');if(!response.ok)throw new Error();const data=await response.json();entries=data.entries;
 for(const [id,label,description]of categories){const count=entries.filter(e=>e.category===id).length;if(!count)continue;const option=node('option',label);option.value=id;$('category').append(option);const button=node('button',undefined,'shelf');button.type='button';button.dataset.shelf=id;button.append(node('span',`${count} fiches`,'eyebrow'),node('strong',label),node('span',description));button.addEventListener('click',()=>{$('category').value=id;$('search').value='';$('usage').value='';limit=24;render();$('recherche').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('search').focus({preventScroll:true});});$('shelves').append(button);}
 readURL();render(false);
}catch{$('count').textContent='';$('error').textContent='La bibliothèque ne peut pas être chargée. Rechargez la page pour réessayer.';}
