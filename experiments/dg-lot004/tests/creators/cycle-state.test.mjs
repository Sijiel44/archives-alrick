import test from 'node:test';
import assert from 'node:assert/strict';
import {createCycle,createCreatorCycle,createBrowserCyclePersistence,validateCycle,CYCLE_SCHEMA,RULES_UNAVAILABLE,cloneCycleJSON} from '../../src/creators/cycle-state.mjs';
function ports(){
 const disk=new Map();const calls={catalog:[],studio:[],saves:0};
 const persistence={async load(){return disk.has('active')?structuredClone(disk.get('active')):null;},
  async save(state){calls.saves++;disk.set('active',structuredClone(state));return {saved:true}}};
 const validator=x=>({valid:true,record:structuredClone(x),errors:{}});
 const catalogBridge=(r,cat,id)=>{calls.catalog.push({r,id});return {id:`cap:${id}:${r.kind}-${r.name.replace(/\s/g,'-').toLowerCase()}`,executable:false,version:r.version,effects:[{mode:'descriptive',text:r.description}]};};
 const studioCampaign={id:'campagne-fixture-1',creatures:[],scenes:[],activeSceneId:''};
 const studio={async previewCreature(ref){calls.studio.push(['previewCreature',ref]);return {documentId:'DOC-FICTIF',profileId:'P-FICTIF',ruleset:'M03',name:'Loup imaginaire'};},
  async copyCreature(){calls.studio.push(['copyCreature']);studioCampaign.creatures.push({id:'inst-fixture-1'});},
  async createScene(title,publicDescription,privateNotes){calls.studio.push(['createScene',title,publicDescription,privateNotes]);studioCampaign.scenes.push({id:'scene-fictive-1',title,publicDescription,privateNotes,participantIds:[]});studioCampaign.activeSceneId='scene-fictive-1';},
  async updateScene(data){calls.studio.push(['updateScene',data]);Object.assign(studioCampaign.scenes.at(-1),data);},
  getCampaign(){return structuredClone(studioCampaign);}};
 const make=()=>createCreatorCycle({persistence,creatorValidator:validator,catalogBridge,catalog:{},studio,idFactory:()=> 'cycle-fixture-1'});
 const fixtures={item:{kind:'item',name:'Flûte fictive',provenance:'LAB non canonique',version:'0.1.0',description:'Objet sonore de fiction pure.',limitations:'Narration seulement.',category:'Instrument',appearance:'Bois pâle',questions:{target:'Qui écoute ?',hearing:'Audition possible ?',duration:'Combien de temps raconté ?',interruption:'Silence ?'}},
 capacity:{kind:'capacity',name:'Air imaginaire',provenance:'Fiction LAB',version:'0.1.0',description:'Action narrative sans effet chiffré.',limitations:'Condition MJ requise.',trigger:'Le joueur raconte',tags:'musique'},
 creature:{name:'Loup imaginaire',provenance:'Fiction MJ',version:'0.1.0',description:'Créature illustrative sans score.',limitations:'Aucun dégât automatisé.',sourceReference:'FICTIF-LOUP-01'},
 scene:{name:'Scène illustrée',title:'Rencontre des bois',provenance:'Fiction MJ',version:'0.1.0',description:'Épisode descriptif non joué.',limitations:'Aucun calcul.',publicDescription:'Une mélodie traverse le sentier.',privateNotes:'CANARI-PRIVE-NON-PARTAGE'}};
 return {make,persistence,disk,calls,fixtures};
}
async function finish(m,f){
 await m.saveDraft('item',f.item);await m.validateMJ('item');
 await m.saveDraft('capacity',f.capacity);await m.validateMJ('capacity');
 await m.saveDraft('creature',f.creature);await m.validateMJ('creature');
 await m.saveDraft('scene',f.scene);await m.validateMJ('scene');
}
test('cycle initial: provisoire privé, sans application ni XP',()=>{
 const s=createCycle('fixture-1');assert.equal(s.schema,CYCLE_SCHEMA);assert.equal(s.status,'draft');assert.deepEqual(s.sourceSnapshots,[]);
 assert.match(RULES_UNAVAILABLE,/Indisponible/);assert.equal(Object.hasOwn(s,'xp'),false);
 assert.deepEqual(validateCycle(s),s);
});
test('parcours guidé: pas de saut sans validation, expert libre',async()=>{
 const {make,fixtures}=ports(),m=make();
 await assert.rejects(m.go('capacity'),/Valider/);
 await m.saveDraft('item',fixtures.item);await assert.rejects(m.go('creature'),/Valider/);
 await m.validateMJ('item');await m.go('capacity');assert.equal(m.getState().step,'capacity');
 await m.setMode('expert');await m.go('scene');assert.equal(m.getState().step,'scene');
 await m.setMode('guided');await assert.rejects(m.go('scene'),/Valider/);
});
test('item -> capacité INDEX: descriptif inerte, référence réutilisable',async()=>{
 const {make,fixtures,calls}=ports(),m=make();await m.saveDraft('item',fixtures.item);await m.validateMJ('item');
 await m.saveDraft('capacity',fixtures.capacity);await m.validateMJ('capacity');
 assert.equal(calls.catalog.length,2);
 const s=m.getState();assert.ok(s.links.itemCatalogId.startsWith('cap:'));assert.ok(s.links.capacityCatalogId.startsWith('cap:'));
 assert.notEqual(s.links.itemCatalogId,s.links.capacityCatalogId);
 assert.equal(s.entries.capacity.status,'mj-validated');assert.equal(s.entries.capacity.catalogEntry.executable,false);
 assert.equal(s.drafts.item.questions.duration,'Combien de temps raconté ?');
});
test('STUDIO : copie créature puis scène, appels uniquement après validation MJ',async()=>{
 const {make,fixtures,calls}=ports(),m=make();
 await finish(m,fixtures);assert.equal(calls.studio.length,0);
 const creature=await m.attachCreature();assert.equal(creature.documentId,'DOC-FICTIF');assert.equal(creature.profileId,'P-FICTIF');
 assert.equal(m.getState().links.creatureInstanceId,'inst-fixture-1');
 const scene=await m.attachScene();assert.equal(scene.sceneId,'scene-fictive-1');
 assert.equal(m.getState().status,'mj-validated');assert.equal(m.getState().links.sceneId,'scene-fictive-1');
 assert.deepEqual(calls.studio.map(x=>x[0]),['previewCreature','copyCreature','createScene','updateScene']);
 assert.deepEqual(calls.studio[3][1].participantIds,['inst-fixture-1']);
 assert.equal(calls.studio[2][3],'CANARI-PRIVE-NON-PARTAGE');
 await assert.rejects(m.attachCreature(),/déjà liée/);await assert.rejects(m.attachScene(),/déjà liée/);
});
test('validation INDEX obligatoire, aucune activation automatique en cas de refus',async()=>{
 const {persistence,fixtures,calls}=ports();
 const m=createCreatorCycle({persistence,creatorValidator:()=>({valid:false,errors:{name:'non'}}),catalogBridge:()=>{calls.catalog.push(1);return {};},catalog:{},idFactory:()=> 'cycle-1'});
 await m.saveDraft('item',fixtures.item);await assert.rejects(m.validateMJ('item'),/Fiche invalide/);
 assert.equal(m.getState().entries.item,null);assert.equal(calls.catalog.length,0);
 const inert=createCreatorCycle({persistence,idFactory:()=> 'cycle-other'});await inert.saveDraft('item',fixtures.item);
 await assert.rejects(inert.validateMJ('item'),/INDEX non connecté/);
});
test('source et champs inconnus, version et statut natifs préservés au reload/export/restore',async()=>{
 const {make,fixtures,disk}=ports(),m=make();
 await m.addOriginalSource({version:'0.0.7',status:'historical',unknown:{privateExtension:{z:14}},raw:{source:'octets-base64-inerte'}});
 await m.saveDraft('item',{...fixtures.item,unrecognizedField:{foreign:'keep-me'}});
 await m.validateMJ('item');const before=m.getState();
 const reloaded=make();await reloaded.load();assert.deepEqual(reloaded.getState(),before);
 const bytes=await reloaded.exportPrivate();const proposal=reloaded.previewRestore(bytes);
 assert.equal(proposal.accepted,false);assert.equal(proposal.display.sources,1);
 assert.deepEqual(reloaded.getState(),before,'preview without mutation');
 await reloaded.acceptRestore(proposal.token);
 assert.equal(disk.get('active').revision,before.revision,'restoration never silently bumps revision');
 assert.deepEqual(reloaded.getState(),before);
 assert.deepEqual(Array.from(await reloaded.exportPrivate()),Array.from(bytes),'byte-identical export after restore');
 assert.deepEqual(reloaded.getState().drafts.item.unrecognizedField,{foreign:'keep-me'});
 assert.equal(reloaded.getState().sourceSnapshots[0].status,'historical');
});
test('restore refus et échec de sauvegarde ne modifient pas état',async()=>{
 const {make,fixtures,persistence}=ports(),m=make();await m.saveDraft('item',fixtures.item);
 const initial=m.getState();assert.throws(()=>m.previewRestore(new TextEncoder().encode('{')));
 assert.throws(()=>m.previewRestore(new TextEncoder().encode(JSON.stringify({kind:'other',cycle:initial}))),/inconnue/);
 assert.deepEqual(m.getState(),initial);
 const bytes=await m.exportPrivate();const plan=m.previewRestore(bytes);await assert.rejects(m.acceptRestore('wrong'),/non prévisualisée/);
 const oldSave=persistence.save;persistence.save=async()=>{throw Error('disk full')};
 await assert.rejects(m.acceptRestore(plan.token),/disk full/);assert.deepEqual(m.getState(),initial);
 await assert.rejects(m.saveDraft('item',{name:'Autre'}),/disk full/);assert.deepEqual(m.getState(),initial);
 persistence.save=oldSave;await m.acceptRestore(plan.token);
});
test('refus de clés dangereuses et propriétés mécaniques; champs facultatifs acceptés',async()=>{
 const {make,fixtures}=ports(),m=make();
 const dangerous=JSON.parse('{"__proto__":{"polluted":true}}');
 await assert.rejects(m.saveDraft('item',dangerous),/dangereuse/);
 await m.saveDraft('item',{...fixtures.item,charges:2});await assert.rejects(m.validateMJ('item'),/mécanique interdit/);
 await m.saveDraft('item',{charges:null});await assert.rejects(m.validateMJ('item'),/mécanique interdit/);
 assert.equal({}.polluted,undefined);
});
test('stockage local borné à origine MJ 4173, jamais joueur 4174',async()=>{
 const x=new Map();const localStorage={getItem:k=>x.get(k)??null,setItem:(k,v)=>x.set(k,v)};
 assert.throws(()=>createBrowserCyclePersistence({storage:localStorage,origin:'http://127.0.0.1:4174'}),/origine MJ/);
 const store=createBrowserCyclePersistence({storage:localStorage,origin:'http://127.0.0.1:4173'});
 const data=createCycle('test-local');assert.deepEqual(await store.save(data),{saved:true});assert.deepEqual(await store.load(),data);
});
test('sauvegarde concurrente sérialisée; version plus récente non écrasée',async()=>{
 const {make}=ports(),m=make();const ops=[m.saveDraft('item',{name:'Premier'}),m.saveDraft('item',{description:'Second'})];await Promise.all(ops);
 const d=m.getDraft('item');assert.equal(d.name,'Premier');assert.equal(d.description,'Second');assert.equal(m.getState().revision,2);
});
test('source originelle non mutée par validation et rechargement',async()=>{
 const {make,fixtures}=ports(),m=make();const original={schema:'fiction.v3',values:{n:14},extension:['keep','raw']};const saved=structuredClone(original);
 await m.addOriginalSource(original);original.values.n=0;
 await m.saveDraft('item',fixtures.item);await m.validateMJ('item');assert.deepEqual(m.getState().sourceSnapshots[0],saved);
});
test('export privé limité; refus des types non JSON et objets trop profonds',()=>{
 assert.throws(()=>cloneCycleJSON({a:()=>{}}),/non pris en charge/);
 assert.throws(()=>cloneCycleJSON({x:'a'.repeat(2*1024*1024+1)}),/volumineuses/);
});

test('passation MAG : versions numériques Grimoire, textuelles rites et semver INDEX distinctes',async()=>{
 const {make,fixtures}=ports(),m=make();
 const sources={grimoire:{version:17,status:'legacy',extra:'non converti'},rites:{version:'rite-text-v3',status:'proposal'},index:{version:'1.4.0',status:'experimental'}};
 await m.addOriginalSource(sources);
 await m.saveDraft('spell',{...fixtures.capacity,kind:'spell',tradition:'Fiction',manifestation:'Mélodie fictive'});
 await m.validateMJ('spell');
 const bytes=await m.exportPrivate();const plan=m.previewRestore(bytes);await m.acceptRestore(plan.token);
 assert.deepEqual(m.getState().sourceSnapshots[0],sources);
 assert.equal(typeof m.getState().sourceSnapshots[0].grimoire.version,'number');
 assert.equal(m.getState().sourceSnapshots[0].rites.version,'rite-text-v3');
 assert.equal(m.getState().sourceSnapshots[0].index.version,'1.4.0');
});
test('source brute exacte + SHA256 conservés sans altération après export / restauration',async()=>{
 const {make}=ports(),m=make();
 const raw=new Uint8Array([0,13,10,32,226,153,171,255,0,255]);
 await m.addOriginalSourceBytes(raw,{source:'fiction',grimoireVersion:7,ritualVersion:'R-text',indexVersion:'1.2.3'});
 raw[0]=77;
 const original=m.getState().sourceSnapshots[0];
 assert.equal(original.kind,'binary-original-private');assert.equal(original.byteLength,10);
 assert.deepEqual(Array.from(Uint8Array.from(atob(original.rawBase64),x=>x.charCodeAt(0))),[0,13,10,32,226,153,171,255,0,255]);
 assert.match(original.sha256,/^[a-f0-9]{64}$/);
 const bytes=await m.exportPrivate();const plan=m.previewRestore(bytes);await m.acceptRestore(plan.token);
 assert.deepEqual(m.getState().sourceSnapshots[0],original);
});
test('aucun malus −2, +2, charge chiffrée ou résolution de sort depuis la narration',async()=>{
 const {make,fixtures}=ports();
 for(const indication of ['Malus −2 à la cible.','Un bonus +2 est donné.','charges 3 par usage.']){
  const m=make();await m.saveDraft('item',{...fixtures.item,description:indication});
  await assert.rejects(m.validateMJ('item'),/non homologué/);
  assert.equal(m.getState().entries.item,null);
 }
 const m=make();await m.saveDraft('item',{...fixtures.item,resolveSpellCast:true});
 await assert.rejects(m.validateMJ('item'),/mécanique interdit/);
});

test('INDEX #97 — chaîne stricte injectée, quatre identités et snapshot privé conservés',async()=>{
 const base=ports();const originalMake=base.make;
 const contractCalls=[];
 const indexChain={
  createDescriptiveChain(input){contractCalls.push(['create',structuredClone(input)]);
   assert.equal(input.links.length,4);assert.deepEqual(input.links.map(x=>x.kind),['item','capability','creature','scene']);
   assert.equal(input.campaignId,'campagne-fixture-1');
   for(const link of input.links)assert.notEqual(link.source.id,link.instance?.id);
   assert.equal(input.links[2].source.profileId,'P-FICTIF');
   assert.equal(input.links[2].source.documentCode,'DOC-FICTIF');
   assert.equal(input.links[2].source.ruleset,'M03');
   assert.equal(input.links[2].instance.id,'inst-fixture-1');
   assert.equal(input.links[3].instance.id,'scene-fictive-1');
   assert.equal(input.links[1].source.schema,'entre-rives.catalog.entry.v0.2-proposal');
   return {ok:true,chain:{schema:'cer.catalog.dg004.descriptive-chain.v0',...input,status:'proposed'},executable:false};
  },
  validateDescriptiveChain(chain){contractCalls.push(['validate']);return {ok:true,chain,executable:false}},
  createPrivateChainSnapshot(chain,rawSources){contractCalls.push(['private']);
   assert.deepEqual(Object.keys(rawSources),['item','capability','creature','scene']);
   assert.equal(rawSources.scene.draft.privateNotes,'CANARI-PRIVE-NON-PARTAGE');
   assert.equal(rawSources.item.rawSources[0].grimoire.version,7);
   assert.equal(rawSources.item.rawSources[0].rites.version,'rite-text-v3');
   assert.equal(rawSources.item.rawSources[0].index.version,'2.1.0');
   return {ok:true,snapshot:{schema:'cer.catalog.dg004.private-chain-snapshot.v0',visibility:'mj-private-only',chain,originalSources:rawSources,executable:false},executable:false};
  },
  validatePrivateChainSnapshot(snapshot){contractCalls.push(['private-validate']);assert.equal(snapshot.visibility,'mj-private-only');return {ok:true,executable:false}}
 };
 const studioCampaign={id:'campagne-fixture-1',creatures:[],scenes:[],activeSceneId:''};
 const studio={
  async previewCreature(){return {documentId:'DOC-FICTIF',profileId:'P-FICTIF',ruleset:'M03',name:'Créature fictive'}},
  async copyCreature(){studioCampaign.creatures.push({id:'inst-fixture-1'})},
  async createScene(title,publicDescription,privateNotes){studioCampaign.scenes.push({id:'scene-fictive-1',title,publicDescription,privateNotes,participantIds:[]});studioCampaign.activeSceneId='scene-fictive-1'},
  async updateScene(data){Object.assign(studioCampaign.scenes.at(-1),data)},
  getCampaign(){return structuredClone(studioCampaign)}
 };
 const catalogBridge=(record,_,id)=>({schema:'entre-rives.catalog.entry.v0.2-proposal',id:`cap:local:${record.kind}-${id}`,
  version:record.version,definitionState:'experimental',provenance:{originKind:'campaign',sourceSchema:'cer.creator.dg003.descriptive.v0',sourceId:record.name,sourceVersion:record.version},
  executable:false});
 const m=createCreatorCycle({persistence:base.persistence,creatorValidator:x=>({valid:true,record:x}),catalogBridge,catalog:{},studio,indexChain,idFactory:()=> 'cycle-fixture-1'});
 await assert.rejects(m.bindIndexChain(),/Quatre validations/);
 await m.addOriginalSource({grimoire:{version:7},rites:{version:'rite-text-v3'},index:{version:'2.1.0'},unknown:{keep:'yes'}});
 await finish(m,base.fixtures);
 await assert.rejects(m.bindIndexChain(),/Copies réelles/);
 await m.attachCreature();await m.attachScene();
 const result=await m.bindIndexChain();
 assert.equal(result.executable,false);assert.equal(result.chain.links.length,4);
 assert.deepEqual(contractCalls.map(x=>x[0]),['create','validate','private','private-validate']);
 const privateState=m.getState().extensions.indexL004;
 assert.equal(privateState.visibility,'mj-private-only');assert.equal(privateState.privateSnapshot.originalSources.item.rawSources[0].unknown.keep,'yes');
 const exportBytes=await m.exportPrivate();const proposal=m.previewRestore(exportBytes);await m.acceptRestore(proposal.token);
 assert.deepEqual(m.getState().extensions.indexL004,privateState);
 assert.ok(!JSON.stringify(result.chain).includes('CANARI-PRIVE-NON-PARTAGE'));
 assert.ok(JSON.stringify(result.snapshot).includes('CANARI-PRIVE-NON-PARTAGE'));
});
test('INDEX absent => chaîne strictement indisponible, sans mutation',async()=>{
 const {make,fixtures}=ports(),m=make();await finish(m,fixtures);const original=m.getState();
 await assert.rejects(m.bindIndexChain(),/Contrat INDEX L004-C absent/);
 assert.deepEqual(m.getState(),original);
});
test('aucune confusion entre ancienne créature STUDIO et nouvelle copie',async()=>{
 const {persistence,fixtures}=ports();let creatures=[{id:'ancien'}];
 const studio={previewCreature:async()=>({documentId:'doc-x',profileId:'p-x',ruleset:'M03'}),copyCreature:async()=>{},
  getCampaign:()=>({id:'camp-fixture',creatures:structuredClone(creatures),scenes:[]})};
 const m=createCreatorCycle({persistence,studio,idFactory:()=> 'cycle-fictive-2',creatorValidator:x=>({valid:true,record:x}),catalogBridge:r=>({id:'cap:local:'+r.kind,executable:false}),catalog:{}});
 await finish(m,fixtures);
 await assert.rejects(m.attachCreature(),/non vérifiable/);
 assert.equal(m.getState().links.creatureInstanceId,null);
});
test('brouillon modifié invalide les validations dépendantes sans créer de copies STUDIO',async()=>{
 const {make,fixtures}=ports(),m=make();await m.saveDraft('item',fixtures.item);await m.validateMJ('item');
 await m.saveDraft('capacity',fixtures.capacity);await m.validateMJ('capacity');
 await m.saveDraft('item',{description:'Autre description narrative fictive.'});
 assert.equal(m.getState().entries.item,null);assert.equal(m.getState().entries.capacity,null);
 assert.equal(m.getState().links.capacityCatalogId,null);
 await assert.rejects(m.go('creature'),/Valider/);
});
test('une fois copie STUDIO effectuée, aucune modification silencieuse des sources',async()=>{
 const {make,fixtures}=ports(),m=make();await finish(m,fixtures);await m.attachCreature();
 const before=m.getState();await assert.rejects(m.saveDraft('item',{name:'Nouvelle version'}),/ouvrir une nouvelle version/);
 assert.deepEqual(m.getState(),before);
});

test('Régression Chrome L004-C : objet, capacité, créature, copie STUDIO puis SAISIE et validation de scène',async()=>{
 const {make,fixtures,calls,disk}=ports(),m=make();
 // Ordre strict du script Chrome #95, sans créer de scène préventivement.
 await m.saveDraft('item',fixtures.item);await m.validateMJ('item');
 await m.saveDraft('capacity',fixtures.capacity);await m.validateMJ('capacity');
 await m.saveDraft('creature',fixtures.creature);await m.validateMJ('creature');
 await m.attachCreature();
 const linked=m.getState();
 assert.equal(linked.links.creatureInstanceId,'inst-fixture-1');
 assert.deepEqual(linked.drafts.scene,{});
 assert.equal(linked.entries.scene,null);
 assert.equal(linked.links.sceneId,null);
 // Avant le correctif, cette instruction était rejetée par creatureInstanceId.
 await m.saveDraft('scene',fixtures.scene);
 const afterDraft=m.getState();
 assert.deepEqual(afterDraft.entries.item,linked.entries.item);
 assert.deepEqual(afterDraft.entries.capacity,linked.entries.capacity);
 assert.deepEqual(afterDraft.entries.creature,linked.entries.creature);
 assert.deepEqual(afterDraft.drafts.item,linked.drafts.item);
 assert.deepEqual(afterDraft.drafts.capacity,linked.drafts.capacity);
 assert.deepEqual(afterDraft.drafts.creature,linked.drafts.creature);
 assert.equal(afterDraft.links.itemCatalogId,linked.links.itemCatalogId);
 assert.equal(afterDraft.links.capacityCatalogId,linked.links.capacityCatalogId);
 assert.equal(afterDraft.links.creatureInstanceId,linked.links.creatureInstanceId);
 assert.deepEqual(afterDraft.links.creatureSource,linked.links.creatureSource);
 assert.deepEqual(afterDraft.drafts.scene,fixtures.scene);
 await m.validateMJ('scene');
 assert.equal(m.getState().entries.scene.status,'mj-validated');
 const scene=await m.attachScene();
 assert.equal(scene.sceneId,'scene-fictive-1');
 assert.deepEqual(calls.studio.map(x=>x[0]),['previewCreature','copyCreature','createScene','updateScene']);
 assert.equal(calls.studio[2][3],fixtures.scene.privateNotes);
 assert.equal(m.getState().links.creatureInstanceId,'inst-fixture-1');
 assert.equal(disk.get('active').links.sceneId,'scene-fictive-1');
});
test('Scène en aval modifiable jusqu’à sa liaison, sans invalider les fiches/copies STUDIO en amont',async()=>{
 const {make,fixtures}=ports(),m=make();
 await m.saveDraft('item',fixtures.item);await m.validateMJ('item');
 await m.saveDraft('capacity',fixtures.capacity);await m.validateMJ('capacity');
 await m.saveDraft('creature',fixtures.creature);await m.validateMJ('creature');
 await m.attachCreature();
 await m.saveDraft('scene',fixtures.scene);await m.validateMJ('scene');
 const upstream=m.getState();
 await m.saveDraft('scene',{description:'Une autre narration fictive et descriptive.',extraUnknown:{nativeVersion:7}});
 const after=m.getState();
 assert.equal(after.entries.scene,null,'seule la validation de scène doit être invalidée');
 for(const kind of ['item','capacity','creature']){
  assert.deepEqual(after.entries[kind],upstream.entries[kind],kind+' entrée liée préservée');
  assert.deepEqual(after.drafts[kind],upstream.drafts[kind],kind+' source liée préservée');
 }
 assert.deepEqual(after.links,upstream.links,'identifiants STUDIO et INDEX inchangés');
 assert.equal(after.drafts.scene.extraUnknown.nativeVersion,7,'extension conservée');
 await m.validateMJ('scene');await m.attachScene();
 assert.equal(m.getState().drafts.scene.extraUnknown.nativeVersion,7);
});
test('Immutabilité : aucune réécriture item/capacity/creature/spell après copie, ni scène après liaison',async()=>{
 const {make,fixtures,calls,disk}=ports(),m=make();
 await m.saveDraft('item',fixtures.item);await m.validateMJ('item');
 await m.saveDraft('capacity',fixtures.capacity);await m.validateMJ('capacity');
 await m.saveDraft('creature',fixtures.creature);await m.validateMJ('creature');
 await m.attachCreature();
 const afterCreature=m.getState(),savedBefore=calls.saves;
 for(const kind of ['item','capacity','creature','spell']){
  await assert.rejects(m.saveDraft(kind,{description:'Modification interdite de source liée.'}),/ouvrir une nouvelle version/);
  assert.deepEqual(m.getState(),afterCreature,'state unchanged for '+kind);
 }
 assert.equal(calls.saves,savedBefore,'aucun écrit local sur refus amont');
 await m.saveDraft('scene',fixtures.scene);await m.validateMJ('scene');await m.attachScene();
 const linked=m.getState(),savesAfterScene=calls.saves,archive=structuredClone(disk.get('active'));
 for(const kind of ['item','capacity','creature','scene','spell']){
  await assert.rejects(m.saveDraft(kind,{description:'Réécriture refusée après liaison.'}),/ouvrir une nouvelle version/);
  assert.deepEqual(m.getState(),linked,'state unchanged after scene link for '+kind);
 }
 assert.equal(calls.saves,savesAfterScene);
 assert.deepEqual(disk.get('active'),archive);
});


/** Failure-injection fixture: real STUDIO side effects, durable journal, no rules. */
function transactionPorts(){
 const disk={snapshot:null,failStage:null,failFinal:null,writeCount:0};
 const campaign={id:'camp-test-001',creatures:[],scenes:[],activeSceneId:''};
 const calls={copies:0,scenes:0,updates:0};
 const copy=structuredClone;
 const persistence={
  async load(){return disk.snapshot===null?null:copy(disk.snapshot)},
  async save(next){
   disk.writeCount++;
   const intent=next.extensions.pendingStudioOp;
   if(disk.failStage&&intent?.kind===disk.failStage && !next.links.creatureInstanceId && !next.links.sceneId)
    throw Error('injected: journal not saved');
   if(disk.failFinal==='creature'&&next.links.creatureInstanceId)throw Error('injected: creature-link not saved');
   if(disk.failFinal==='scene'&&next.links.sceneId)throw Error('injected: scene-link not saved');
   disk.snapshot=copy(next);return {saved:true};
  }
 };
 const studio={
  async previewCreature(){return {documentId:'DOC-1',profileId:'PROFILE-1',ruleset:'M03',name:'Fiction'}},
  async copyCreature(){
   calls.copies++;campaign.creatures.push({
    id:'cr-'+calls.copies,source:{documentId:'DOC-1',profileId:'PROFILE-1',ruleset:'M03'},
    publicLabel:'Créature fictive',privateSnapshot:{secret:'CANARI-CREATURE-PRIVÉ'}});
  },
  async createScene(title,publicDescription,privateNotes){
   calls.scenes++;const id='scene-'+calls.scenes;campaign.scenes.push({
    id,title,publicDescription,privateNotes,participantIds:[]});campaign.activeSceneId=id;
  },
  async updateScene(data){calls.updates++;Object.assign(campaign.scenes.at(-1),data)},
  getCampaign(){return copy(campaign)}
 };
 const make=()=>createCreatorCycle({persistence,creatorValidator:x=>({valid:true,record:copy(x)}),
  catalogBridge:x=>({id:'cap:local:'+x.kind,executable:false}),catalog:{},studio,
  idFactory:()=> 'cycle-transaction-1'});
 return {make,disk,campaign,calls,studio,fixtures:ports().fixtures};
}
async function readyCreature(m,fixtures){
 for(const kind of ['item','capacity','creature']){
  await m.saveDraft(kind,fixtures[kind]);await m.validateMJ(kind);
 }
}
test('REPAIR: échec du journal AVANT STUDIO interdit toute copie et conserve le cycle',async()=>{
 const x=transactionPorts(),m=x.make();await readyCreature(m,x.fixtures);
 const previous=m.getState(),before=x.disk.writeCount;
 x.disk.failStage='creature';
 await assert.rejects(m.attachCreature(),/journal not saved/);
 assert.equal(x.calls.copies,0);
 assert.deepEqual(m.getState(),previous);
 assert.equal(x.disk.writeCount,before+1);
 assert.equal(x.disk.snapshot.extensions.pendingStudioOp,undefined);
 x.disk.failStage=null;
 await m.attachCreature();
 assert.equal(x.calls.copies,1);
 assert.equal(m.getStudioRecovery().pending,false);
});
test('REPAIR: échec APRES copie créature, recharge, refus du doublon et réconciliation MJ vérifiée',async()=>{
 const x=transactionPorts(),m=x.make();await readyCreature(m,x.fixtures);
 x.disk.failFinal='creature';
 await assert.rejects(m.attachCreature(),/creature-link not saved/);
 assert.equal(x.calls.copies,1);
 assert.equal(m.getState().links.creatureInstanceId,null);
 assert.equal(x.disk.snapshot.extensions.pendingStudioOp.kind,'creature');
 assert.equal(x.disk.snapshot.extensions.pendingStudioOp.campaignId,'camp-test-001');
 await assert.rejects(m.attachCreature(),/Réconciliation/);
 await assert.rejects(m.saveDraft('scene',x.fixtures.scene),/ouvrir une nouvelle version/);
 await assert.rejects(m.validateMJ('creature'),/Réconciliation/);
 const restarted=x.make();await restarted.load();
 const recovery=restarted.getStudioRecovery();
 assert.deepEqual(recovery.candidates,[{id:'cr-1'}]);
 assert.equal(recovery.status,'requires-confirmation');
 assert.ok(!JSON.stringify(recovery).includes('CANARI-CREATURE-PRIVÉ'));
 await assert.rejects(restarted.reconcileStudioLink('cr-1'),/Confirmation/);
 await assert.rejects(restarted.reconcileStudioLink('cr-inconnue',{confirm:true}),/non reconnue/);
 assert.equal(x.calls.copies,1);
 x.disk.failFinal=null;
 const result=await restarted.reconcileStudioLink('cr-1',{confirm:true});
 assert.equal(result.reconciled,true);
 assert.equal(restarted.getState().links.creatureInstanceId,'cr-1');
 assert.equal(restarted.getState().links.creatureSource.profileId,'PROFILE-1');
 assert.equal(x.disk.snapshot.extensions.pendingStudioOp,undefined);
 assert.equal(restarted.getStudioRecovery().pending,false);
 await assert.rejects(restarted.attachCreature(),/déjà liée/);
 assert.equal(x.calls.copies,1);
});
test('REPAIR: échec après création scène, reprise sans duplication, canari privé jamais retourné',async()=>{
 const x=transactionPorts(),m=x.make();await readyCreature(m,x.fixtures);await m.attachCreature();
 await m.saveDraft('scene',x.fixtures.scene);await m.validateMJ('scene');
 x.disk.failFinal='scene';
 await assert.rejects(m.attachScene(),/scene-link not saved/);
 assert.equal(x.calls.scenes,1);
 assert.equal(x.calls.updates,1);
 assert.equal(x.disk.snapshot.extensions.pendingStudioOp.kind,'scene');
 await assert.rejects(m.attachScene(),/Réconciliation/);
 const restarted=x.make();await restarted.load();
 const recovery=restarted.getStudioRecovery();
 assert.deepEqual(recovery.candidates,[{id:'scene-1'}]);
 assert.ok(!JSON.stringify(recovery).includes('CANARI-PRIVE-NON-PARTAGE'));
 x.disk.failFinal=null;
 await restarted.reconcileStudioLink('scene-1',{confirm:true});
 assert.equal(restarted.getState().links.sceneId,'scene-1');
 assert.equal(restarted.getState().drafts.scene.privateNotes,'CANARI-PRIVE-NON-PARTAGE');
 assert.equal(x.campaign.scenes[0].privateNotes,'CANARI-PRIVE-NON-PARTAGE');
 assert.deepEqual(x.campaign.scenes[0].participantIds,['cr-1']);
 assert.equal(x.disk.snapshot.extensions.pendingStudioOp,undefined);
 await assert.rejects(restarted.attachScene(),/déjà liée/);
 assert.equal(x.calls.scenes,1);
});
test('REPAIR: journal durable mais copie STUDIO absente => abandon explicite seulement',async()=>{
 const x=transactionPorts(),m=x.make();await readyCreature(m,x.fixtures);
 x.studio.copyCreature=async()=>{throw Error('STUDIO ne répond pas')};
 await assert.rejects(m.attachCreature(),/ne répond pas/);
 const restarted=x.make();await restarted.load();
 const r=restarted.getStudioRecovery();assert.equal(r.status,'no-side-effect-observed');
 assert.equal(r.canAbandon,true);
 await assert.rejects(restarted.abandonStudioRecovery(),/Confirmation/);
 assert.equal(restarted.getStudioRecovery().pending,true);
 await restarted.abandonStudioRecovery({confirm:true});
 assert.equal(x.disk.snapshot.extensions.pendingStudioOp,undefined);
 x.studio.copyCreature=async()=>{
  x.calls.copies++;x.campaign.creatures.push({
   id:'cr-'+x.calls.copies,source:{documentId:'DOC-1',profileId:'PROFILE-1',ruleset:'M03'}});
 };
 await restarted.attachCreature();assert.equal(x.calls.copies,1);
});
test('REPAIR: provenance contradictoire, autre campagne et nouvelle instance non reconnue => fail-closed',async()=>{
 const x=transactionPorts(),m=x.make();await readyCreature(m,x.fixtures);
 x.disk.failFinal='creature';
 await assert.rejects(m.attachCreature(),/creature-link not saved/);
 // The copied instance exists but the source metadata no longer agrees.
 x.campaign.creatures[0].source.profileId='ALTERED';
 let recovery=m.getStudioRecovery();
 assert.equal(recovery.candidates.length,0);assert.equal(recovery.canAbandon,false);
 await assert.rejects(m.reconcileStudioLink('cr-1',{confirm:true}),/non reconnue/);
 await assert.rejects(m.abandonStudioRecovery({confirm:true}),/bloquée/);
 const original=x.campaign.id;x.campaign.id='autre-campagne';
 recovery=m.getStudioRecovery();assert.equal(recovery.status,'wrong-campaign');
 await assert.rejects(m.reconcileStudioLink('cr-1',{confirm:true}),/non reconnue/);
 x.campaign.id=original;
 assert.equal(x.calls.copies,1);
 assert.equal(m.getState().links.creatureInstanceId,null);
});
test('REPAIR: journal privé après copie est exportable/restaurable et refuse corruption',async()=>{
 const x=transactionPorts(),m=x.make();await readyCreature(m,x.fixtures);
 x.disk.failFinal='creature';await assert.rejects(m.attachCreature(),/creature-link not saved/);
 const exported=await m.exportPrivate(),p=m.previewRestore(exported);
 assert.equal(p.accepted,false);
 const restarted=x.make();await restarted.load();
 assert.equal(restarted.getStudioRecovery().pending,true);
 const altered=structuredClone(restarted.getState());
 altered.extensions.pendingStudioOp.beforeIds=['mauvais','mauvais'];
 assert.throws(()=>validateCycle(altered),/Journal STUDIO privé invalide/);
 assert.equal(JSON.stringify(restarted.getState()).includes('CANARI-CREATURE-PRIVÉ'),false);
 assert.equal(x.calls.copies,1);
});
test('REPAIR: deux copies concurrentes ne créent jamais deux instances STUDIO',async()=>{
 const x=transactionPorts(),m=x.make();await readyCreature(m,x.fixtures);
 const results=await Promise.allSettled([m.attachCreature(),m.attachCreature()]);
 assert.equal(results.filter(z=>z.status==='fulfilled').length,1);
 assert.equal(results.filter(z=>z.status==='rejected').length,1);
 assert.equal(x.calls.copies,1);
 assert.equal(m.getState().links.creatureInstanceId,'cr-1');
});

test('REPAIR: interdit annulation et restauration tant que copie STUDIO est en vol ou journal présent',async()=>{
 const x=transactionPorts(),m=x.make();await readyCreature(m,x.fixtures);
 const olderExport=await m.exportPrivate();
 let allowCopy;
 const gate=new Promise(resolve=>{allowCopy=resolve});
 const originalCopy=x.studio.copyCreature;
 x.studio.copyCreature=async()=>{await gate;return originalCopy()};
 const task=m.attachCreature();
 // Attendre que le journal soit effectivement sauvegardé avant d'examiner la fenêtre concurrente.
 for(let n=0;n<100&&m.getStudioRecovery().status!=='in-flight';n++)await Promise.resolve();
 assert.equal(x.disk.snapshot.extensions.pendingStudioOp?.kind,'creature');
 const pending=m.getStudioRecovery();assert.equal(pending.status,'in-flight');
 assert.equal(pending.canAbandon,false);
 await assert.rejects(m.abandonStudioRecovery({confirm:true}),/en cours/);
 await assert.rejects(m.reconcileStudioLink('cr-1',{confirm:true}),/en cours/);
 await assert.rejects(m.load(),/rechargement interdit/);
 const proposal=m.previewRestore(olderExport);
 await assert.rejects(m.acceptRestore(proposal.token),/Réconciliation STUDIO requise/);
 allowCopy();await task;
 assert.equal(x.calls.copies,1);
 assert.equal(m.getState().links.creatureInstanceId,'cr-1');
 assert.equal(m.getStudioRecovery().pending,false);
});
test('REPAIR: interdit restauration obsolète pendant journal STUDIO après échec',async()=>{
 const x=transactionPorts(),m=x.make();await readyCreature(m,x.fixtures);
 const oldBackup=await m.exportPrivate();
 x.disk.failFinal='creature';await assert.rejects(m.attachCreature(),/creature-link not saved/);
 const proposal=m.previewRestore(oldBackup);
 await assert.rejects(m.acceptRestore(proposal.token),/Réconciliation STUDIO requise/);
 assert.equal(x.disk.snapshot.extensions.pendingStudioOp?.kind,'creature');
 assert.equal(x.calls.copies,1);
});
