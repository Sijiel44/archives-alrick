/** UI de préparation 5d6 importable dans le vrai cockpit. Ne calcule aucun dégât. */
const camps=[['allies','Alliés'],['adversaries','Adversaires'],['neutral','Neutres']];
const roles=[['defense','Défense'],['assaut','Assaut'],['soutien','Soutien'],['controle','Contrôle'],['eclaireur','Éclaireur'],['boss','Boss'],['personnalise','Personnalisé']];
const style='.er-encounter{background:#202831;color:#f2efe6;border:1px solid #987348;border-radius:12px;padding:1rem;font-family:system-ui}.er-encounter h2{color:#e0bc82}.er-encounter .er-line{display:flex;flex-wrap:wrap;gap:.5rem;align-items:end}.er-encounter label{display:flex;flex-direction:column;gap:.2rem}.er-encounter input,.er-encounter select{background:#14212b;color:white;border:1px solid #a3927c;padding:.4rem;border-radius:5px}.er-encounter button{padding:.45rem .7rem;background:#8b683f;border:1px solid #ddb97c;border-radius:6px;color:white;cursor:pointer}.er-encounter button:focus-visible,.er-encounter input:focus-visible,.er-encounter select:focus-visible{outline:3px solid #eed195}.er-encounter button:disabled{opacity:.5}.er-encounter output{display:block;white-space:pre-wrap;overflow-wrap:anywhere}.er-encounter .er-warn{color:#eac896}.er-encounter li{margin:.4rem 0}';
function elt(doc,tag,text){const e=doc.createElement(tag);if(text!==undefined)e.textContent=text;return e;}
function options(doc,items,name){
 const select=elt(doc,'select');select.setAttribute('aria-label',name);
 for(const [v,label] of items){const o=elt(doc,'option',label);o.value=v;select.append(o);}
 return select;
}
function field(doc,title,control){const lab=elt(doc,'label',title);lab.append(control);return lab;}
/** Requires a MJ-only DOM root and the tested createEncounterStudioBridge instance. */
export async function mountEncounterPlanner(root,bridge){
 if(!root?.ownerDocument||typeof root.append!=='function')throw TypeError('Conteneur DOM requis.');
 if(typeof bridge?.load!=='function'||typeof bridge?.preview!=='function')throw TypeError('Bridge Studio requis.');
 const d=root.ownerDocument,css=elt(d,'style',style),main=elt(d,'section');
 main.className='er-encounter';main.setAttribute('aria-label','Préparer une rencontre 5d6');
 root.append(css,main);let removed=false;
 const status=elt(d,'p','');status.setAttribute('role','status');
 async function run(fn){try{await fn();status.textContent='Brouillon mis à jour.';await refresh();}
 catch(err){status.textContent='Action refusée : '+err.message;}}
 async function refresh(){
  if(removed)return;
  const draft=bridge.get(),catalog=await bridge.list(),overview=bridge.summary();
  main.replaceChildren(elt(d,'h2','Préparer une rencontre — 5d6'),
    elt(d,'p','Choisissez des fiches existantes. Camps et rôles n’accordent aucun bonus. La préparation est sans dégâts ni dépense.'));
  const controls=elt(d,'div');controls.className='er-line';
  const candidates=catalog.filter(x=>!draft.participants.some(p=>p.actorId===x.id));
  const selected=options(d,candidates.map(x=>[x.id,x.label+' — N'+x.level+' ('+x.kind+')']),'Personnage ou créature');
  const camp=options(d,camps,'Camp'),role=options(d,roles,'Rôle');
  const add=elt(d,'button','Ajouter');add.type='button';add.disabled=candidates.length===0;
  add.addEventListener('click',()=>run(()=>bridge.add({actorId:selected.value,side:camp.value,role:role.value})));
  controls.append(field(d,'Fiche existante',selected),field(d,'Camp',camp),field(d,'Rôle',role),add);main.append(controls);
  for(const [side,name] of camps){
   const group=overview.bySide[side];
   main.append(elt(d,'h3',name+' : '+group.count+' — niveaux '+(group.levels.join(', ')||'aucun')+' — médiane '+(group.median??'—')));
   const ul=elt(d,'ul');
   for(const p of draft.participants.filter(x=>x.side===side)){
    const li=elt(d,'li',p.label+' — N'+p.level+' · '+p.role+' · ID '+p.actorId);
    const del=elt(d,'button','Retirer');del.type='button';
    del.setAttribute('aria-label','Retirer '+p.label);
    del.addEventListener('click',()=>run(()=>bridge.remove(p.actorId)));
    li.append(del);ul.append(li);
   }main.append(ul);
  }
  const caution=elt(d,'p',overview.warning);caution.className='er-warn';main.append(caution);
  const reload=elt(d,'button','Recharger');reload.type='button';reload.addEventListener('click',()=>run(()=>bridge.load()));
  const show=elt(d,'button','Afficher le JSON de rencontre');show.type='button';
  show.addEventListener('click',()=>{status.textContent=bridge.exportJSON();});main.append(reload,show);
  if(draft.participants.length>1){
   main.append(elt(d,'h3','Prévisualiser une opposition — cinq dés'));
   const row=elt(d,'div');row.className='er-line';
   const ids=draft.participants.map(p=>[p.actorId,p.label+' ('+p.actorId+')']);
   const attacker=options(d,ids,'Attaquant'),defender=options(d,ids,'Cible');defender.value=ids[1][0];
   row.append(field(d,'Attaquant',attacker),field(d,'Cible',defender));
   const dice=Array.from({length:5},(_,i)=>{const input=elt(d,'input');input.type='number';
    input.min='1';input.max='6';input.step='1';input.value='3';input.setAttribute('aria-label','Dé '+(i+1));row.append(input);return input;});
   const calculate=elt(d,'button','Prévisualiser M03');calculate.type='button';
   const result=elt(d,'output','Aucun effet appliqué aux fiches.');
   calculate.addEventListener('click',async()=>{
    try{result.textContent=JSON.stringify(await bridge.preview({attackerId:attacker.value,defenderId:defender.value,dice:dice.map(x=>Number(x.value))}),null,2);}
    catch(error){result.textContent='Refus : '+error.message;}
   });row.append(calculate);main.append(row,result);
  }
  main.append(status);
 }
 try{await bridge.load();await refresh();}catch(err){main.append(elt(d,'p','Préparation indisponible : '+err.message));}
 return {refresh,destroy(){removed=true;main.remove();css.remove();}};
}
