import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mergeLibrary,searchLibrary,categoryFor} from './library-model.mjs';
test('Un identifiant, deux lectures : conserver les liens et statuts sans fusionner les textes',()=>{
 const entries=mergeLibrary([{id:'X',name:'Créature étoilée',type:'creatures',status:'Proposition',href:'/#fiche/X'}],[{id:'X',title:'Étoilée',category:'bestiaire',status:'Référence',href:'/studio/fiches.html#fiche/X'}]);
 assert.equal(entries.length,1); assert.deepEqual(entries[0].variants.map(v=>v.status),['Proposition','Référence']);
 assert.equal(searchLibrary(entries,{q:'etoilee X creature',usage:'game',category:'bestiaire'}).length,1);
 assert.equal(searchLibrary(entries,{q:'inconnue'}).length,0);
});
test('Les révélations et brouillons restent hors découverte ; seule leur adaptation publique peut apparaître',()=>{
 const entries=mergeLibrary([{id:'SECRET',name:'Titre privé',hidden:true},{id:'DRAFT',name:'Brouillon',publish:false}],[{id:'SECRET',title:'Repères publics',category:'pnj',href:'/studio/fiches.html#fiche/SECRET'},{id:'H',title:'Caché',unlisted:true}]);
 assert.equal(entries.length,1); assert.equal(entries[0].title,'Repères publics'); assert.equal(entries[0].variants.length,1); assert.equal(searchLibrary(entries,{q:'privé'}).length,0);
 assert.equal(categoryFor({id:'ATL-ORI-001',type:'world'},'reading'),'atlas');
 assert.equal(categoryFor({category:'sorts'},'game'),'magie');
});
