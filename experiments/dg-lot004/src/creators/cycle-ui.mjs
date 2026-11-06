/** Navigable L004-C frontend above L003 creators, injected INDEX and STUDIO ports. */
import {createCreatorCycle,CYCLE_STEPS,OPTIONAL_STEPS,RULES_UNAVAILABLE,MAX_CYCLE_BYTES} from './cycle-state.mjs';
export const CYCLE_STYLES=`
.cer-cycle{font:inherit;color:#f7ecdb;background:#171719;border:1px solid #b18460;border-radius:12px;padding:1rem;max-width:1100px;margin:1rem auto}
.cer-cycle *{box-sizing:border-box}.cer-cycle h2,.cer-cycle h3{color:#f7c69f}
.cer-cycle .cycle-steps,.cer-cycle .cycle-actions{display:flex;gap:.5rem;flex-wrap:wrap;margin:1rem 0}
.cer-cycle button{border:1px solid #c39b77;background:#493528;color:#fff2e3;border-radius:8px;min-height:44px;padding:.5rem .85rem;font:inherit;cursor:pointer}
.cer-cycle button:disabled{opacity:.58;cursor:not-allowed}.cer-cycle button[aria-current=step]{background:#e0ab7e;color:#201713;font-weight:700}
.cer-cycle .cycle-panel{border:1px solid #806b5b;padding:1rem;margin:1rem 0;border-radius:8px;background:#292427}
.cer-cycle .cycle-field{display:block;margin:.75rem 0;font-weight:600}
.cer-cycle .cycle-field input,.cer-cycle .cycle-field textarea{display:block;width:100%;font:inherit;color:#fff8e9;background:#171719;border:1px solid #baa590;border-radius:6px;min-height:44px;padding:.6rem;margin:.25rem 0}
.cer-cycle .cycle-field textarea{min-height:90px;resize:vertical}.cer-cycle .cycle-preview{white-space:pre-wrap;overflow-wrap:anywhere;border-left:3px solid #d89e75;padding:.75rem;background:#372e2b}
.cer-cycle .cycle-status{border-left:3px solid #e0aa79;padding:.65rem;background:#312825;overflow-wrap:anywhere}
.cer-cycle :is(button,input,textarea):focus-visible{outline:3px solid #ffe3ac;outline-offset:3px}
.cer-cycle [hidden]{display:none!important}@media(max-width:700px){.cer-cycle{padding:.6rem}.cer-cycle .cycle-panel{padding:.65rem}}
`;
const STEPS=[...CYCLE_STEPS,...OPTIONAL_STEPS];
const LABELS={item:'1. Objet fictif',capacity:'2. Capacité réutilisable',creature:'3. Créature fictive',scene:'4. Scène MJ',spell:'Sort optionnel'};
function el(doc,tag,text='',className=''){const n=doc.createElement(tag);n.textContent=text;if(className)n.className=className;return n;}
function input(doc,parent,key,label,value='',multiline=false){
 const row=el(doc,'label',label,'cycle-field'),field=el(doc,multiline?'textarea':'input');
 if(!multiline)field.type='text';field.name=key;field.value=String(value??'');field.maxLength=key==='description'?3000: key==='limitations'?1200:key==='privateNotes'?4000:800;
 row.append(field);parent.append(row);return field;
}
function safeMessage(error){return error instanceof Error?error.message:'Action refusée';}
function indexKeys(kind){return {item:['name','provenance','version','description','limitations','category','appearance'],capacity:['name','provenance','version','description','limitations','trigger','tags'],spell:['name','provenance','version','description','limitations','tradition','manifestation']}[kind];}
/**
 * mountCreatorCycle(root,{mountCreators,validateCreatorDraft,catalogBridge,catalog,studio,persistence,
 *   idFactory,initialMode='guided',onExport,injectStyles=false})
 * External ports remain authoritative. No network, rules or automatic public projection.
 */
export function mountCreatorCycle(root,options={}){
 if(!root?.ownerDocument||typeof root.replaceChildren!=='function')throw new TypeError('Racine DOM requise');
 if(typeof options.mountCreators!=='function'||typeof options.validateCreatorDraft!=='function')
  throw new TypeError('Ports ATELIERS L003 mountCreators/validateCreatorDraft requis');
 const doc=root.ownerDocument,cycle=createCreatorCycle({...options,creatorValidator:options.validateCreatorDraft}),status=el(doc,'p','Brouillon local non validé.','cycle-status');
 status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const shell=el(doc,'section','','cer-cycle');shell.setAttribute('aria-label','Parcours de création L004-C');
 shell.append(el(doc,'h2','Parcours MJ — objet, capacité, créature, scène'),
  el(doc,'p','Proposition fictive locale. Aucun bonus, dépense, lancer de sort, XP, publication ou effet automatique.'),status);
 const steps=el(doc,'nav','','cycle-steps');steps.setAttribute('aria-label','Étapes de création');shell.append(steps);
 const modeBar=el(doc,'div','','cycle-actions'),panels=el(doc,'div');shell.append(modeBar,panels);
 const creatorPanel=el(doc,'section','','cycle-panel'),creatorHost=el(doc,'div');creatorPanel.append(creatorHost);panels.append(creatorPanel);
 const optionPanel=el(doc,'section','','cycle-panel');panels.append(optionPanel);
 optionPanel.append(el(doc,'h3','Progression XP — en attente MATH / INDEX'),el(doc,'p','Suggestions en lecture seule et choix MJ libre : indisponibles avant contrat homologué. Aucun XP proposé, appliqué ou crédité.')); 
 const creaturePanel=el(doc,'section','','cycle-panel');panels.append(creaturePanel);
 const scenePanel=el(doc,'section','','cycle-panel');panels.append(scenePanel);
 const preview=el(doc,'pre',RULES_UNAVAILABLE+' — prévisualisation descriptive uniquement.','cycle-preview');
 const actions=el(doc,'div','','cycle-actions'),bottom=el(doc,'section','','cycle-panel');shell.append(preview,actions,bottom);
 const modeButtons={},stepButtons={};let disposed=false,working=false,restoreToken=null;
 const notify=x=>{status.textContent=x;};
 const creator=options.mountCreators(creatorHost,{initialKind:'item',initialMode:'guided',injectStyles:false,
  onSave:async record=>{await cycle.saveDraft(record.kind,{...cycle.getDraft(record.kind),...record});notify('Brouillon enregistré localement. Validation MJ distincte.');render();return {saved:true};}});
 const itemQuestions=el(doc,'div','','cycle-panel');itemQuestions.append(el(doc,'h3','Questions de narration — aucune valeur numérique'));
 const questionFields={};
 for(const [key,label] of [['target','Quelle cible ?'],['hearing','Qui peut entendre ?'],['duration','Quelle durée narrative ?'],['interruption','Qu’est-ce qui interrompt l’effet ?'],['prerequisites','Quels prérequis narratifs ?']])
  questionFields[key]=input(doc,itemQuestions,key,label);
 creatorPanel.append(itemQuestions);
 const creatureFields={};creaturePanel.append(el(doc,'h3','Créature fictive — référence STUDIO/BEST requise'));
 for(const [key,label,multi] of [['name','Nom',false],['provenance','Provenance',false],['version','Version',false],['description','Description narrative',true],['limitations','Limites',true],['sourceReference','Référence créature fictive du catalogue',false]])
  creatureFields[key]=input(doc,creaturePanel,key,label,'',multi);
 const sceneFields={};scenePanel.append(el(doc,'h3','Scène locale — notes privées MJ'));
 for(const [key,label,multi] of [['name','Nom de fiche',false],['title','Titre de la scène',false],['provenance','Provenance',false],['version','Version',false],['description','Description de fiche',true],['limitations','Limites narratives',true],['publicDescription','Description proposée au public (non publiée)',true],['privateNotes','Notes MJ — confidentielles',true]])
  sceneFields[key]=input(doc,scenePanel,key,label,'',multi);
 for(const step of STEPS){const b=el(doc,'button',LABELS[step]);b.type='button';b.addEventListener('click',()=>void act(async()=>{await persistCurrent();await cycle.go(step);render();}));stepButtons[step]=b;steps.append(b);}
 for(const mode of ['guided','expert']){const b=el(doc,'button',mode==='guided'?'Mode guidé':'Mode expert');b.type='button';b.addEventListener('click',()=>void act(async()=>{await persistCurrent();await cycle.setMode(mode);render();}));modeButtons[mode]=b;modeBar.append(b);}
 const draftButton=el(doc,'button','Enregistrer brouillon');draftButton.type='button';draftButton.addEventListener('click',()=>void act(async()=>{await persistCurrent();notify('Brouillon sauvegardé localement ; aucun effet appliqué.');render();}));
 const validButton=el(doc,'button','Valider MJ — descriptif');validButton.type='button';validButton.addEventListener('click',()=>void act(async()=>{await persistCurrent();await cycle.validateMJ(cycle.getState().step);notify('Validation MJ enregistrée. Aucun effet numérique activé.');render();}));
 const nextButton=el(doc,'button','Étape suivante');nextButton.type='button';nextButton.addEventListener('click',()=>void act(async()=>{const s=cycle.getState();const index=CYCLE_STEPS.indexOf(s.step);if(index<0||index===CYCLE_STEPS.length-1)throw Error('Dernière étape');await persistCurrent();await cycle.go(CYCLE_STEPS[index+1]);render();}));
 const creatureButton=el(doc,'button','Copier la créature dans STUDIO (MJ)');creatureButton.type='button';creatureButton.addEventListener('click',()=>void act(async()=>{const x=await cycle.attachCreature();notify('Copie STUDIO confirmée : '+x.instanceId);render();}));
 const chainButton=el(doc,'button','Enregistrer chaîne descriptive INDEX — MJ privé');chainButton.type='button';chainButton.addEventListener('click',()=>void act(async()=>{const r=await cycle.bindIndexChain();notify('Chaîne INDEX enregistrée en privé : '+r.chain.id+'. Aucune application.');render();}));
 const sceneButton=el(doc,'button','Créer la scène dans STUDIO (MJ)');sceneButton.type='button';sceneButton.addEventListener('click',()=>void act(async()=>{const x=await cycle.attachScene();notify('Scène STUDIO liée : '+x.sceneId+'. Aucune projection joueur.');render();}));
 actions.append(draftButton,validButton,nextButton,creatureButton,sceneButton,chainButton);
 // Explicit, private-only reconciliation. Never retry STUDIO automatically.
 const recoveryPanel=el(doc,'section','','cycle-panel');
 recoveryPanel.append(el(doc,'h3','Reprise après écriture STUDIO interrompue'));
 const recoveryInfo=el(doc,'p','Aucune reprise en attente.','cycle-status');
 const recoveryLabel=el(doc,'label','Instance STUDIO à confirmer (identifiant)','cycle-field');
 const recoveryChoice=el(doc,'select');recoveryChoice.setAttribute('aria-label','Instance STUDIO à réconcilier');
 recoveryLabel.append(recoveryChoice);
 const recoveryConfirm=el(doc,'button','Confirmer lien vers instance existante (MJ)');
 recoveryConfirm.type='button';
 recoveryConfirm.addEventListener('click',()=>void act(async()=>{
  const result=await cycle.reconcileStudioLink(recoveryChoice.value,{confirm:true});
  notify('Instance STUDIO réconciliée sans nouvelle copie : '+result.instanceId);render();
 }));
 const recoveryAbandon=el(doc,'button','Confirmer absence de copie et réessayer');
 recoveryAbandon.type='button';
 recoveryAbandon.addEventListener('click',()=>void act(async()=>{
  await cycle.abandonStudioRecovery({confirm:true});
  notify('Journal de reprise clos : aucune instance nouvelle détectée dans STUDIO.');render();
 }));
 recoveryPanel.append(recoveryInfo,recoveryLabel,recoveryConfirm,recoveryAbandon);
 shell.append(recoveryPanel);
 const loadBtn=el(doc,'button','Recharger brouillons'),exportBtn=el(doc,'button','Exporter archive CONFIDENTIELLE'),restoreBtn=el(doc,'button','Prévisualiser restauration'),confirmBtn=el(doc,'button','Confirmer restauration');
 for(const b of [loadBtn,exportBtn,restoreBtn,confirmBtn])b.type='button';
 const upload=input(doc,bottom,'backup','Archive JSON privée à restaurer');upload.type='file';upload.accept='.json,application/json';
 loadBtn.addEventListener('click',()=>void act(async()=>{await cycle.load();populate();notify('Brouillons rechargés depuis le stockage local.');render();}));
 exportBtn.addEventListener('click',()=>void act(async()=>{
  await persistCurrent();const bytes=await cycle.exportPrivate();
  if(typeof options.onExport==='function')await options.onExport(new Uint8Array(bytes),'CONFIDENTIEL_L004_C_creators.json');
  else{
   const view=doc.defaultView;if(!view?.URL?.createObjectURL||typeof view.Blob!=='function')throw Error('Export fichier indisponible : fournir onExport');
   const blob=new view.Blob([bytes],{type:'application/json'}),url=view.URL.createObjectURL(blob),link=el(doc,'a');
   link.href=url;link.download='CONFIDENTIEL_L004_C_creators.json';link.hidden=true;doc.body.append(link);link.click();link.remove();view.URL.revokeObjectURL(url);
  }
  notify('Archive CONFIDENTIELLE exportée localement. Pas de transfert réseau.');
 }));
 restoreBtn.addEventListener('click',()=>void act(async()=>{const file=upload.files?.[0];if(!file||file.size>MAX_CYCLE_BYTES)throw Error('Archive absente ou trop volumineuse');
  const bytes=new Uint8Array(await file.arrayBuffer());const proposal=cycle.previewRestore(bytes);restoreToken=proposal.token;
  notify('Restauration proposée sans mutation : '+proposal.display.saved.join(', ')+' ; confirmer explicitement.');render();}));
 confirmBtn.addEventListener('click',()=>void act(async()=>{if(!restoreToken)throw Error('Prévisualiser avant restauration');
  await cycle.acceptRestore(restoreToken);restoreToken=null;populate();notify('Restauration privée confirmée.');render();}));
 bottom.append(el(doc,'h3','Sauvegarde, export et restauration privés'),loadBtn,exportBtn,restoreBtn,confirmBtn);
 function readCurrent(){const s=cycle.getState(),k=s.step;
  if(indexKeys(k)){
   const known=creator.getDraft(k);const value={...s.drafts[k],...known};
   if(k==='item')value.questions=Object.fromEntries(Object.entries(questionFields).map(([key,field])=>[key,field.value]));
   return value;
  }
  const source=k==='creature'?creatureFields:sceneFields;
  return {...s.drafts[k],...Object.fromEntries(Object.entries(source).map(([key,field])=>[key,field.value]))};
 }
 async function persistCurrent(){const k=cycle.getState().step;await cycle.saveDraft(k,readCurrent());}
 function populate(){const s=cycle.getState();
  for(const k of ['item','capacity','spell']){
   const f=creatorHost.querySelector(`form[data-creator-kind="${k}"]`);if(!f)continue;
   for(const field of f.querySelectorAll('[name]'))if(typeof s.drafts[k][field.name]==='string')field.value=s.drafts[k][field.name];
  }
  for(const [k,f] of Object.entries(questionFields))f.value=s.drafts.item.questions?.[k]??'';
  for(const [k,f] of Object.entries(creatureFields))f.value=s.drafts.creature[k]??'';
  for(const [k,f] of Object.entries(sceneFields))f.value=s.drafts.scene[k]??'';
 }
 function render(){if(disposed)return;const s=cycle.getState(),kind=s.step;
  for(const [k,b] of Object.entries(stepButtons)){
   b.hidden=k==='spell'&&s.mode==='guided';
   b.setAttribute('aria-current',kind===k?'step':'false');
   const i=CYCLE_STEPS.indexOf(k);b.disabled=working||(s.mode==='guided'&&i>0&&CYCLE_STEPS.slice(0,i).some(p=>!s.entries[p]));
  }
  for(const [k,b] of Object.entries(modeButtons))b.setAttribute('aria-pressed',String(s.mode===k));
  const isCreator=Boolean(indexKeys(kind));creatorPanel.hidden=!isCreator;creaturePanel.hidden=kind!=='creature';scenePanel.hidden=kind!=='scene';
  if(isCreator){creator.setKind(kind);creator.setMode(s.mode);itemQuestions.hidden=kind!=='item';}
  const done=s.entries[kind];const view={step:kind,status:done?.status??'draft',provenance:s.drafts[kind].provenance??'',
   version:s.drafts[kind].version??'',linked:s.links,mechanics:RULES_UNAVAILABLE};
  preview.textContent=JSON.stringify(view,null,2);
  const recovery=cycle.getStudioRecovery();
  recoveryPanel.hidden=!recovery.pending;
  if(recovery.pending){
   recoveryInfo.textContent='Création '+recovery.kind+' interrompue : '+(recovery.message??'Vérification MJ requise')+'. Aucune nouvelle création automatique.';
   recoveryChoice.replaceChildren();
   for(const candidate of recovery.candidates){
    const option=el(doc,'option',candidate.id);option.value=candidate.id;recoveryChoice.append(option);
   }
   recoveryLabel.hidden=recovery.candidates.length===0;
  }
  recoveryConfirm.disabled=working||!recovery.pending||!recovery.candidates?.length;
  recoveryAbandon.disabled=working||!recovery.canAbandon;
  creatureButton.hidden=kind!=='creature';creatureButton.disabled=working||!!recovery.pending||!s.entries.creature||!s.entries.capacity||!!s.links.creatureInstanceId;
  sceneButton.hidden=kind!=='scene';sceneButton.disabled=working||!!recovery.pending||!s.entries.scene||!s.links.creatureInstanceId||!!s.links.sceneId;
  chainButton.hidden=kind!=='scene';chainButton.disabled=working||!s.links.sceneId||!!s.extensions.indexL004;
  nextButton.hidden=kind==='spell'||kind==='scene';nextButton.disabled=working||!s.entries[kind];
  confirmBtn.disabled=working||!restoreToken;
  for(const btn of [draftButton,validButton,loadBtn,exportBtn,restoreBtn])btn.disabled=working;
 }
 async function act(operation){if(working||disposed)return;working=true;render();try{await operation();}catch(e){notify(safeMessage(e));}finally{working=false;render();}}
 root.replaceChildren(shell);
 const ready=(async()=>{try{await cycle.load();populate();render();notify('Parcours privé prêt. Aucun effet numérique ni XP.');}catch(e){notify('Chargement refusé : '+safeMessage(e));render();}})();
 return {ready,cycle,render,destroy(){disposed=true;creator.destroy();root.replaceChildren();}};
}