import test from 'node:test';
import assert from 'node:assert/strict';
import {mountCreators,validateCreatorDraft,CREATOR_SCHEMA,CREATOR_KINDS,NUMERIC_UNAVAILABLE} from '../../src/creators/index.mjs';

// DOM double: these tests import the actual committed JS module, not a Python model.
class FakeElement {
  constructor(tag,doc){this.tagName=tag.toUpperCase();this.ownerDocument=doc;this.children=[];this.attributes=new Map();this.events=new Map();this.value='';this.hidden=false;this.disabled=false;this.textContent='';}
  append(...nodes){for(const node of nodes){assert.ok(node instanceof FakeElement);node.parent=this;this.children.push(node);}}
  setAttribute(key,val){this.attributes.set(key,String(val));}
  getAttribute(key){return this.attributes.get(key)??null;}
  removeAttribute(key){this.attributes.delete(key);}
  replaceChildren(...nodes){for(const n of this.children)n.parent=null;this.children=[];this.append(...nodes);}
  addEventListener(type,listener){const ls=this.events.get(type)??[];ls.push(listener);this.events.set(type,ls);}
  async emit(type){for(const listener of this.events.get(type)??[])await listener({preventDefault(){}});}
  focus(){this.ownerDocument.activeElement=this;}
  remove(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null;}
  find(predicate){if(predicate(this))return this;for(const c of this.children){const value=c.find(predicate);if(value)return value;}}
  findAll(predicate){return [...(predicate(this)?[this]:[]),...this.children.flatMap(c=>c.findAll(predicate))];}
}
class FakeDocument{
  createElement(tag){return new FakeElement(tag,this);}
  createTextNode(text){const x=new FakeElement('#text',this);x.textContent=text;return x;}
}
const setup=(options={})=>{const document=new FakeDocument(),root=document.createElement('main');return {document,root,api:mountCreators(root,options)};};
const form=(root,kind)=>root.find(n=>n.tagName==='FORM'&&n.getAttribute('data-creator-kind')===kind);
const field=(form,name)=>form.find(n=>n.name===name);
const button=(root,label)=>root.find(n=>n.tagName==='BUTTON'&&n.textContent===label);
function fill(formNode,kind){
  for(const [k,v] of Object.entries({name:'Porte des nuages',provenance:'Fiction de test',version:'v0.1',
    description:'Description fictive sans effet mécanique.',limitations:'Usage narratif seulement.'}))field(formNode,k).value=v;
  if(kind==='capacity')field(formNode,'trigger').value='Au début de la scène';
  if(kind==='spell')field(formNode,'tradition').value='École fictive';
  if(kind==='item')field(formNode,'category').value='Parure fictive';
}
for(const kind of CREATOR_KINDS)test('fiche '+kind+' descriptive',()=>{
  const result=validateCreatorDraft({schema:CREATOR_SCHEMA,kind,name:'Fiche fictive',provenance:'Brouillon local',
    version:'v0.1',description:'Texte descriptif suffisamment long.',limitations:'Usage narratif.'});
  assert.equal(result.valid,true);assert.equal(result.record.kind,kind);assert.equal(Object.hasOwn(result.record,'damage'),false);
});
test('rejette champ mécanique, inconnu, invalide et version étrangère',()=>{
  const input={schema:CREATOR_SCHEMA,kind:'capacity',name:'Fiche valide',provenance:'Fiction',version:'v0.1',
    description:'Description fictive valide.',limitations:'Usage narratif.'};
  for(const k of ['approved','damage','absorption','manaCost','charges','authority25','numericEffect']){
    const r=validateCreatorDraft({...input,[k]:1});assert.equal(r.valid,false,k);assert.match(r.errors[k],/interdit/);
  }
  for(const patch of [{schema:'autre.v0'},{version:'1 2'},{name:'X'},{description:'bref'},
    {provenance:'x'.repeat(200)},{unknown:'x'},{limitations:3},{kind:'attack'}]){
    assert.equal(validateCreatorDraft({...input,...patch}).valid,false,JSON.stringify(patch));
  }
});
test('DOM: trois formulaires, guidé/expert, champs bloqués, valeurs préservées',async()=>{
  const {root,api}=setup();
  assert.equal(root.findAll(n=>n.tagName==='FORM').length,3);
  assert.equal(form(root,'capacity').hidden,false);assert.equal(form(root,'spell').hidden,true);
  field(form(root,'capacity'),'name').value='Valeur préservée';
  await button(root,'Sort').emit('click');assert.equal(form(root,'spell').hidden,false);
  await button(root,'Capacité').emit('click');
  assert.equal(field(form(root,'capacity'),'name').value,'Valeur préservée');
  await button(root,'Expert').emit('click');
  assert.equal(form(root,'capacity').find(n=>n.getAttribute('aria-label')==='Champs experts descriptifs et fonctions inactives').hidden,false);
  for(const kind of CREATOR_KINDS){
    const f=form(root,kind);
    assert.equal(f.find(n=>n.tagName==='FIELDSET').disabled,true);
    assert.ok(f.find(n=>n.tagName==='P'&&n.textContent.includes(NUMERIC_UNAVAILABLE)));
    assert.equal(f.find(n=>n.tagName==='BUTTON'&&n.textContent==='Prévisualiser via INDEX/MATH').disabled,true);
    assert.equal(f.find(n=>n.tagName==='BUTTON'&&n.textContent==='Enregistrer localement').disabled,true);
  }
  assert.equal(api.getDraft('capacity').name,'Valeur préservée');
  api.destroy();assert.equal(root.children.length,0);
});
test('validation au submit, aria-invalid, focus, sauvegarde confirmée',async()=>{
  let saved,count=0;
  const {document,root}=setup({onSave:async record=>{count++;saved=record;return {saved:true};}});
  const f=form(root,'capacity');
  await f.emit('submit');assert.equal(count,0);assert.equal(document.activeElement,field(f,'name'));
  assert.equal(field(f,'name').getAttribute('aria-invalid'),'true');
  fill(f,'capacity');await field(f,'name').emit('input');
  assert.equal(field(f,'name').getAttribute('aria-invalid'),null);
  await f.emit('submit');assert.equal(count,1);assert.equal(saved.kind,'capacity');
  assert.equal(saved.trigger,'Au début de la scène');assert.equal(saved.schema,CREATOR_SCHEMA);
  assert.match(f.find(n=>n.getAttribute('role')==='status').textContent,/Enregistré localement/);
});
test('callback en échec et absence d’accusé = aucun succès usurpé',async()=>{
  const a=setup({onSave:async()=>{throw Error('refus');}});
  const f=form(a.root,'spell');fill(f,'spell');await f.emit('submit');
  assert.match(f.find(n=>n.getAttribute('role')==='status').textContent,/Échec/);
  const b=setup({onSave:async()=>({})});const g=form(b.root,'item');fill(g,'item');await g.emit('submit');
  assert.match(g.find(n=>n.getAttribute('role')==='status').textContent,/non confirmé/);
});
test('refus INDEX: aucune évaluation native, items toujours bloqués',async()=>{
  let auth=0,evals=0;
  const {root}=setup({onSave:()=>({saved:true}),numericPreview:{
    authorize:async()=>{auth++;return {status:'denied',nativeReference:'fixture'};},
    evaluate:async()=>{evals++;return {summary:'interdit'};}
  }});
  const f=form(root,'capacity');fill(f,'capacity');
  await f.find(n=>n.tagName==='BUTTON'&&n.textContent==='Prévisualiser via INDEX/MATH').emit('click');
  assert.equal(auth,1);assert.equal(evals,0);
  assert.match(f.find(n=>n.getAttribute('role')==='status').textContent,/Indisponible/);
  assert.equal(form(root,'item').find(n=>n.tagName==='BUTTON'&&n.textContent==='Prévisualiser via INDEX/MATH').disabled,true);
});
test('autorisation INDEX puis moteur injecté: preview uniquement, pas de sauvegarde',async()=>{
  let saves=0,auths=0,evals=0;
  const {root}=setup({onSave:()=>{saves++;return {saved:true};},numericPreview:{
    authorize:async record=>{auths++;assert.equal(record.schema,CREATOR_SCHEMA);return {status:'authorized',nativeReference:'native:fixture'};},
    evaluate:async(_,permit)=>{evals++;assert.equal(permit.nativeReference,'native:fixture');return {summary:'Calcul délégué fictif'};}
  }});
  const f=form(root,'spell');fill(f,'spell');
  await f.find(n=>n.tagName==='BUTTON'&&n.textContent==='Prévisualiser via INDEX/MATH').emit('click');
  assert.equal(auths,1);assert.equal(evals,1);assert.equal(saves,0);
  assert.match(f.find(n=>n.getAttribute('role')==='status').textContent,/Aperçu natif/);
});
test('affichage sûr: jamais de balisage HTML utilisateur inséré',async()=>{
  const {root,api}=setup();
  const f=form(root,'capacity');field(f,'name').value='<img src=x onerror=alert(1)>';
  await field(f,'name').emit('input');
  assert.equal(root.findAll(n=>n.tagName==='IMG').length,0);
  assert.equal(api.getDraft().name,'<img src=x onerror=alert(1)>');
});

test('style par défaut et injectStyles:true conservent le comportement historique',()=>{
  for(const options of [{},{injectStyles:true}]){
    const {root,api}=setup(options);
    const styles=root.findAll(n=>n.tagName==='STYLE');
    assert.equal(styles.length,1);
    assert.match(styles[0].textContent,/\.cer-creators/);
    assert.equal(root.findAll(n=>n.tagName==='FORM').length,3);
    api.destroy();
    assert.equal(root.children.length,0);
  }
});
test('injectStyles:false ne crée aucun style et destroy reste sûr',async()=>{
  const saved=[];
  const {root,api}=setup({injectStyles:false,onSave:async record=>{saved.push(record);return {saved:true};}});
  assert.equal(root.findAll(n=>n.tagName==='STYLE').length,0);
  assert.equal(root.children.length,1);
  assert.equal(root.findAll(n=>n.tagName==='FORM').length,3);
  await button(root,'Sort').emit('click');
  await button(root,'Expert').emit('click');
  const spell=form(root,'spell');fill(spell,'spell');
  await spell.emit('submit');
  assert.equal(saved.length,1);
  assert.equal(saved[0].kind,'spell');
  assert.equal(root.findAll(n=>n.tagName==='STYLE').length,0);
  api.destroy();
  assert.equal(root.children.length,0);
});
