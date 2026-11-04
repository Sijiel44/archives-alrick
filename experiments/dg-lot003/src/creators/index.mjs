/** L003-CREATORS: three descriptive editors. No rules, network, publication or storage implementation. */
export const CREATOR_KINDS = Object.freeze(['capacity','spell','item']);
export const CREATOR_SCHEMA = 'cer.creator.dg003.descriptive.v0';
export const NUMERIC_UNAVAILABLE = 'Indisponible — règle/validateur non homologué';
const COMMON = [
  ['name','Nom',120,true],['provenance','Provenance / source',160,true],
  ['version','Version de fiche',32,true],['description','Description narrative',3000,true],
  ['limitations','Limites et conditions',1200,true]
];
const TYPES = {
  capacity:{label:'Capacité',extra:[['trigger','Déclencheur narratif',800,false],['tags','Mots-clés descriptifs',200,false]],blocked:['Absorption M03','Autorités 25+']},
  spell:{label:'Sort',extra:[['tradition','Tradition ou école',160,false],['manifestation','Manifestation narrative',800,false]],blocked:['Coût et débit de mana','Absorption M03','Autorités 25+']},
  item:{label:'Objet',extra:[['category','Catégorie descriptive',160,false],['appearance','Apparence',800,false]],blocked:['Propriétés numériques','Charges et débits','Absorption M03','Autorités 25+']}
};
const FORBIDDEN = new Set(['approved','damage','absorption','mana','manaCost','charges','chargeCost','cost','numericEffect','authority','authority25','effectMagnitude','applied']);
let instance = 0;
export const CREATOR_STYLES = [
'.cer-creators{--bg:#171719;--panel:#252326;--copper:#e7a56f;color:#fff4e6;background:var(--bg);border:1px solid #92765f;border-radius:12px;padding:1rem;font:inherit;max-width:1020px;margin:auto}',
'.cer-creators *{box-sizing:border-box}.cer-creators .cer-row{display:flex;flex-wrap:wrap;gap:.6rem;margin:.75rem 0}',
'.cer-creators button{background:#433328;color:#fff6ed;border:1px solid #ca946c;border-radius:8px;padding:.65rem 1rem;min-height:44px;cursor:pointer;font:inherit}',
'.cer-creators button[aria-pressed="true"]{background:var(--copper);color:#171719;font-weight:700}.cer-creators button:disabled{opacity:.58;cursor:not-allowed}',
'.cer-creators .cer-layout{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(250px,1fr);gap:1rem}',
'.cer-creators .cer-editor{background:var(--panel);padding:1rem;border:1px solid #765f4d;border-radius:9px}',
'.cer-creators .cer-field{margin:.8rem 0}.cer-creators label{display:block;font-weight:650;margin-bottom:.25rem}',
'.cer-creators input[type=text],.cer-creators textarea{width:100%;min-height:44px;padding:.7rem;border:1px solid #baa38c;background:#111113;color:#fff6ec;font:inherit;border-radius:7px}',
'.cer-creators textarea{min-height:90px;resize:vertical}.cer-creators .cer-hint{color:#d7c8b4;display:block;font-size:.88rem}',
'.cer-creators .cer-error{color:#ffccbb;font-weight:600}.cer-creators [aria-invalid=true]{border:2px solid #ffb1a0!important}',
'.cer-creators .cer-preview{background:#211d1c;border:1px solid #9b795c;border-radius:9px;padding:1rem;overflow-wrap:anywhere}',
'.cer-creators .cer-preview dt{color:var(--copper);font-weight:bold;margin-top:.5rem}.cer-creators .cer-preview dd{margin:0;white-space:pre-wrap}',
'.cer-creators .cer-status{padding:.7rem;border-left:3px solid var(--copper);background:#302722;overflow-wrap:anywhere}',
'.cer-creators .cer-restricted{border:1px dashed #ad8b72;border-radius:8px;padding:.7rem;margin:1rem 0}',
'.cer-creators [hidden]{display:none!important}.cer-creators :is(button,input,textarea):focus-visible{outline:3px solid #ffe0a3;outline-offset:3px}',
'@media(max-width:750px){.cer-creators .cer-layout{grid-template-columns:1fr}.cer-creators{padding:.7rem}.cer-creators .cer-editor{padding:.7rem}}',
'@media(prefers-reduced-motion:reduce){.cer-creators *{animation:none!important;transition:none!important}}'
].join('\n');
function node(doc,tag,cls,text){const x=doc.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;}
function fields(kind){return [...COMMON,...TYPES[kind].extra];}
export function validateCreatorDraft(input){
  if(!input || typeof input!=='object' || Array.isArray(input)) return {valid:false,errors:{form:'Brouillon invalide.'},record:null};
  if(!CREATOR_KINDS.includes(input.kind)) return {valid:false,errors:{kind:'Type de création inconnu.'},record:null};
  const errors={}, record={schema:CREATOR_SCHEMA,kind:input.kind};
  if(input.schema!==undefined && input.schema!==CREATOR_SCHEMA) errors.schema='Schéma non pris en charge.';
  const allowed=new Set(['kind','schema',...fields(input.kind).map(f=>f[0])]);
  for(const key of Object.keys(input)) if(FORBIDDEN.has(key)||!allowed.has(key)) errors[key]='Champ mécanique ou inconnu interdit.';
  for(const [key,,max,required] of fields(input.kind)){
    const raw=input[key]??'';
    if(typeof raw!=='string'){errors[key]='Texte descriptif requis.';continue;}
    const value=raw.trim();record[key]=value;
    if(required&&!value) errors[key]='Champ obligatoire.';
    if(value.length>max) errors[key]='Maximum '+max+' caractères.';
  }
  if(record.name&&record.name.length<2)errors.name='Au moins 2 caractères.';
  if(record.provenance&&record.provenance.length<3)errors.provenance='Au moins 3 caractères.';
  if(record.description&&record.description.length<10)errors.description='Au moins 10 caractères.';
  if(record.limitations&&record.limitations.length<3)errors.limitations='Au moins 3 caractères.';
  if(record.version&&!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,31}$/.test(record.version))errors.version='Version invalide.';
  return {valid:Object.keys(errors).length===0,errors,record:Object.keys(errors).length?null:record};
}
/**
 * mountCreators(root,{onSave,numericPreview,initialKind,initialMode,injectStyles=true})
 * onSave(record): Promise<{saved:true}> - supplied local persistence; no automatic storage.
 * numericPreview.authorize(record): Promise<{status:'authorized',nativeReference:string}> - INDEX/native approval;
 * numericPreview.evaluate(record,authorization): Promise<{summary:string}> - MATH/native delegation.
 * This optional port is preview-only, never debits or applies effects. Items always blocked.
 * return {getDraft(kind?),setKind(kind),setMode('guided'|'expert'),destroy()}.
 */
export function mountCreators(root,options={}){
  if(!root||!root.ownerDocument||typeof root.append!=='function')throw new TypeError('Élément DOM requis.');
  const initialKind=options.initialKind??'capacity',initialMode=options.initialMode??'guided';
  if(!CREATOR_KINDS.includes(initialKind))throw new RangeError('Type initial invalide.');
  if(!['guided','expert'].includes(initialMode))throw new RangeError('Mode initial invalide.');
  const doc=root.ownerDocument,id='cer-dg003-'+(++instance),forms=new Map(),tabs=new Map(),modes=new Map();
  let kind=initialKind,mode=initialMode,destroyed=false;
  const style=options.injectStyles===false?null:node(doc,'style','',CREATOR_STYLES),shell=node(doc,'section','cer-creators');
  style?.setAttribute('data-cer-creators-style',id);
  shell.setAttribute('aria-label','Créateurs descriptifs DG-LOT-003');
  shell.append(node(doc,'h2','','Ateliers de création — prototype local'),node(doc,'p','','Fiches fictives, descriptives et non canoniques. Aucun débit, calcul, lancement ou publication automatique.'));
  const nav=node(doc,'div','cer-row'),switcher=node(doc,'div','cer-row'),stage=node(doc,'div');
  nav.setAttribute('role','group');nav.setAttribute('aria-label','Type de fiche');
  switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Mode de saisie');
  shell.append(nav,switcher,stage);
  function getDraft(selected=kind){
    if(!CREATOR_KINDS.includes(selected))throw new RangeError('Type de fiche invalide.');
    const record={schema:CREATOR_SCHEMA,kind:selected};
    for(const [key,input] of forms.get(selected).inputs)record[key]=input.value;
    return record;
  }
  function validateUI(f){
    const result=validateCreatorDraft(getDraft(f.kind));
    for(const [key,input] of f.inputs){
      const error=result.errors[key]??'';
      f.errors.get(key).textContent=error;
      if(error)input.setAttribute('aria-invalid','true');else input.removeAttribute('aria-invalid');
    }
    return result;
  }
  function preview(f){
    f.preview.replaceChildren(node(doc,'h3','','Aperçu — '+TYPES[f.kind].label),
      node(doc,'p','','PROPOSITION LOCALE · non validée INDEX · non canonique'));
    const list=node(doc,'dl'),draft=getDraft(f.kind);
    for(const [key,label,,required] of fields(f.kind)){
      if(!draft[key]&&!required)continue;
      list.append(node(doc,'dt','',label),node(doc,'dd','',draft[key]||'Non renseigné'));
    }
    f.preview.append(list);
  }
  function setKind(next){
    if(!CREATOR_KINDS.includes(next))throw new RangeError('Type inconnu.');
    kind=next;
    for(const [key,button] of tabs)button.setAttribute('aria-pressed',String(key===kind));
    for(const [key,f] of forms)f.form.hidden=key!==kind;
  }
  function setMode(next){
    if(!['guided','expert'].includes(next))throw new RangeError('Mode inconnu.');
    mode=next;
    for(const [key,button] of modes)button.setAttribute('aria-pressed',String(key===mode));
    for(const f of forms.values())f.expert.hidden=mode!=='expert';
  }
  for(const [key,label] of [['capacity','Capacité'],['spell','Sort'],['item','Objet']]){
    const b=node(doc,'button','',label);b.type='button';b.setAttribute('aria-pressed','false');
    b.addEventListener('click',()=>setKind(key));tabs.set(key,b);nav.append(b);
  }
  for(const [key,label] of [['guided','Guidé'],['expert','Expert']]){
    const b=node(doc,'button','',label);b.type='button';b.setAttribute('aria-pressed','false');
    b.addEventListener('click',()=>setMode(key));modes.set(key,b);switcher.append(b);
  }
  for(const key of CREATOR_KINDS){
    const spec=TYPES[key],form=node(doc,'form','cer-editor');form.noValidate=true;form.setAttribute('data-creator-kind',key);
    form.append(node(doc,'h3','','Créer '+(key==='item'?'un objet':key==='spell'?'un sort':'une capacité')+' descriptif'));
    const layout=node(doc,'div','cer-layout'),left=node(doc,'div'),right=node(doc,'aside','cer-preview');
    right.setAttribute('aria-label','Aperçu '+key);
    const inputs=new Map(),errors=new Map(),expert=node(doc,'section');
    expert.setAttribute('aria-label','Champs experts descriptifs et fonctions inactives');
    expert.append(node(doc,'h3','','Détails experts'));
    for(const [field,label,max,required] of fields(key)){
      const wrap=node(doc,'div','cer-field'),labelNode=node(doc,'label','',label+(required?' *':'')),domId=id+'-'+key+'-'+field;
      labelNode.setAttribute('for',domId);
      const input=node(doc,field==='description'||field==='limitations'||max>=800?'textarea':'input');
      input.id=domId;input.name=field;if(input.tagName==='INPUT')input.type='text';
      input.maxLength=max;input.required=required;
      input.setAttribute('aria-describedby',domId+'-hint '+domId+'-error');
      const hint=node(doc,'small','cer-hint',required?'Champ obligatoire, descriptif uniquement.':'Champ facultatif, sans effet chiffré.');
      hint.id=domId+'-hint';const error=node(doc,'div','cer-error');error.id=domId+'-error';
      wrap.append(labelNode,input,hint,error);inputs.set(field,input);errors.set(field,error);
      (COMMON.some(f=>f[0]===field)?left:expert).append(wrap);
    }
    const blocked=node(doc,'fieldset','cer-restricted');blocked.disabled=true;
    blocked.append(node(doc,'legend','','Fonctions non homologuées — désactivées'));
    for(const restriction of spec.blocked){
      const label=node(doc,'label'),input=node(doc,'input');input.type='checkbox';input.disabled=true;
      label.append(input,doc.createTextNode(' '+restriction));blocked.append(label);
    }
    expert.append(blocked,node(doc,'p','',NUMERIC_UNAVAILABLE+'. Aperçu autorisé uniquement via ports INDEX/MATH injectés.'));
    left.append(expert);layout.append(left,right);
    const actions=node(doc,'div','cer-row'),save=node(doc,'button','','Enregistrer localement'),numeric=node(doc,'button','','Prévisualiser via INDEX/MATH');
    save.type='submit';save.disabled=typeof options.onSave!=='function';
    const provider=options.numericPreview;
    const hasPort=key!=='item'&&typeof provider?.authorize==='function'&&typeof provider?.evaluate==='function';
    numeric.type='button';numeric.disabled=!hasPort;
    const status=node(doc,'p','cer-status',save.disabled?'Enregistrement indisponible — callback local manquant.':'Brouillon non enregistré.');
    status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    actions.append(save,numeric);form.append(layout,actions,status);stage.append(form);
    const f={kind:key,form,inputs,errors,expert,preview:right,status,save,numeric,busy:false,request:0};forms.set(key,f);
    for(const input of inputs.values())input.addEventListener('input',()=>{
      preview(f);for(const [name,control] of inputs){control.removeAttribute('aria-invalid');errors.get(name).textContent='';}
      status.textContent='Brouillon modifié — non enregistré.';
    });
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(destroyed||f.busy)return;
      const result=validateUI(f);
      if(!result.valid){
        status.textContent='Corrigez les champs indiqués avant enregistrement.';
        for(const [name,control] of inputs)if(result.errors[name]){control.focus();break;}
        return;
      }
      if(typeof options.onSave!=='function'){status.textContent='Enregistrement indisponible — callback local manquant.';return;}
      f.busy=true;save.disabled=true;status.textContent='Enregistrement local en cours…';
      try{
        const response=await options.onSave(Object.freeze({...result.record}));
        if(!destroyed)status.textContent=response?.saved===true?'Enregistré localement (confirmation du service injecté).':'Enregistrement non confirmé par le service local.';
      }catch{if(!destroyed)status.textContent='Échec de l’enregistrement local — brouillon conservé.';}
      finally{f.busy=false;if(!destroyed)save.disabled=false;}
    });
    numeric.addEventListener('click',async()=>{
      if(!hasPort||destroyed)return;
      const request=++f.request,result=validateUI(f);
      if(!result.valid){status.textContent='Prévisualisation refusée : fiche invalide.';return;}
      numeric.disabled=true;status.textContent='Vérification INDEX/MATH…';
      try{
        const approval=await provider.authorize(Object.freeze({...result.record}));
        if(destroyed||request!==f.request)return;
        if(approval?.status!=='authorized'||typeof approval.nativeReference!=='string'||!approval.nativeReference.trim()){
          status.textContent=NUMERIC_UNAVAILABLE+'.';return;
        }
        const output=await provider.evaluate(Object.freeze({...result.record}),approval);
        if(destroyed||request!==f.request)return;
        status.textContent=typeof output?.summary==='string'&&output.summary.trim()
          ?'Aperçu natif : '+output.summary.slice(0,1200)+' (aucune application ni dépense).'
          :NUMERIC_UNAVAILABLE+'.';
      }catch{if(!destroyed&&request===f.request)status.textContent=NUMERIC_UNAVAILABLE+'.';}
      finally{if(!destroyed&&request===f.request)numeric.disabled=false;}
    });
    preview(f);
  }
  if(style)root.append(style);
  root.append(shell);setKind(initialKind);setMode(initialMode);
  return {getDraft,setKind,setMode,destroy(){
    destroyed=true;for(const f of forms.values())f.request++;
    shell.remove();style?.remove();
  }};
}
