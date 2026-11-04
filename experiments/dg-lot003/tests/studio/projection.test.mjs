import test from 'node:test';
import assert from 'node:assert/strict';
import {makePlayerProjection,validatePlayerDTO,checkedPlayerOrigins,PLAYER_DTO_SCHEMA,
  STUDIO_ORIGIN,PLAYER_ORIGIN} from '../../src/studio/projection.mjs';
import {mountStudio} from '../../src/studio/index.mjs';
import {mountPlayer} from '../../src/player/index.mjs';

const marker='PRIVATE_SENTINEL_73b987';
function fixture(){return {schema:'cer.studio.dg003.provisional.v0',id:'camp-1',title:'Campagne fictive',revision:4,
  gmNotes:marker,unknownExtension:{private:marker},characters:[{id:'pj-1',publicLabel:'Aventurière',privateSnapshot:{gmNotes:marker,stats:{physique:14}}}],
  creatures:[{id:'cre-1',publicLabel:'Bête fictive',privateSnapshot:{secrets:marker}}],
  scenes:[{id:'s-1',title:'Scène publique',publicDescription:'Visible aux joueurs',privateNotes:marker,
    participantIds:['pj-1','cre-1']}],activeSceneId:'s-1'};}

test('projection ne retourne que les clés listées et conserve les noms explicitement autorisés',()=>{
  const c=fixture();const dto=makePlayerProjection(c,{sceneId:'s-1',shareTitle:true,shareDescription:true,actorIds:['pj-1']});
  assert.deepEqual(Object.keys(dto),['schema','revision','scene']);
  assert.deepEqual(Object.keys(dto.scene),['title','description','visibleActors']);
  assert.deepEqual(dto.scene.visibleActors,[{label:'Aventurière'}]);
  assert.ok(!JSON.stringify(dto).includes(marker));
  assert.equal(dto.schema,PLAYER_DTO_SCHEMA);
  assert.deepEqual(validatePlayerDTO(dto),dto);
});
test('sélection absente = DTO public vide',()=>{
  const dto=makePlayerProjection(fixture(),{sceneId:'s-1'});
  assert.deepEqual(dto.scene,{title:'',description:'',visibleActors:[]});
});
test('aucun personnage extérieur à la scène ne peut être projeté',()=>{
  const c=fixture();c.characters.push({id:'pj-2',publicLabel:'Intrus',gmNotes:marker});
  assert.deepEqual(makePlayerProjection(c,{sceneId:'s-1',actorIds:['pj-2']}).scene.visibleActors,[]);
});
test('objet campagne enrichi ne contamine pas DTO',()=>{
  const c=fixture();c.scenes[0].publicDescription='Bonjour';c.scenes[0].newField=marker;
  assert.ok(!JSON.stringify(makePlayerProjection(c,{sceneId:'s-1',shareDescription:true})).includes(marker));
});
test('validation joueur rejette extension top-level',()=>{
  const dto=makePlayerProjection(fixture(),{sceneId:'s-1'});dto.gmNotes=marker;
  assert.equal(validatePlayerDTO(dto),null);
});
test('validation joueur rejette champs cachés sous scene',()=>{
  const dto=makePlayerProjection(fixture(),{sceneId:'s-1'});dto.scene.privateNotes=marker;
  assert.equal(validatePlayerDTO(dto),null);
});
test('validation joueur rejette champs cachés par acteur',()=>{
  const dto=makePlayerProjection(fixture(),{sceneId:'s-1',actorIds:['pj-1']});dto.scene.visibleActors[0].stats={physique:14};
  assert.equal(validatePlayerDTO(dto),null);
});
test('validation joueur rejette chaînes trop longues et structure invalide',()=>{
  const dto=makePlayerProjection(fixture(),{sceneId:'s-1'});dto.scene.title='x'.repeat(161);
  assert.equal(validatePlayerDTO(dto),null);
  assert.equal(validatePlayerDTO(null),null);
  assert.equal(validatePlayerDTO({schema:PLAYER_DTO_SCHEMA}),null);
});
test('validation rejette origines arbitraires, mêmes origines et localhost',()=>{
  assert.equal(checkedPlayerOrigins(STUDIO_ORIGIN,PLAYER_ORIGIN),true);
  for(const [a,b] of [[STUDIO_ORIGIN,STUDIO_ORIGIN],['http://localhost:4173',PLAYER_ORIGIN],
    [STUDIO_ORIGIN,'http://localhost:4174'],[STUDIO_ORIGIN,'http://127.0.0.1:9999'],
    ['file://',PLAYER_ORIGIN],['https://127.0.0.1:4173',PLAYER_ORIGIN]])assert.equal(checkedPlayerOrigins(a,b),false);
});
test('projection refuse absence de scène',()=>{
  assert.throws(()=>makePlayerProjection(fixture(),{sceneId:'s-0'}),/Scène/);
});
test('les modules montables sont importables sans DOM ni effets',()=>{
  assert.equal(typeof mountStudio,'function');assert.equal(typeof mountPlayer,'function');
});
