/** STUDIO-CREATE-004C : préparation contrôlée, sans persistance ni dépense. */
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { studioAssets } from '../studio-local/serve.mjs';

const alias = {
  name: 'studio-typescript-moteur',
  setup(b) {
    b.onResolve({filter:/^\.\/moteur\/atelier5d6-[a-z0-9-]+\.js$/}, arg => ({
      path:resolve('quartz/components/scripts',
        arg.path.slice('./moteur/'.length).replace(/\.js$/, '.ts')),
    }));
  },
};
const load = async path => {
  const output = await build({entryPoints:[path],bundle:true,platform:'node',
    format:'esm',target:'es2022',write:false,logLevel:'silent',plugins:[alias]});
  return import('data:text/javascript;base64,'+
    Buffer.from(output.outputFiles[0].text).toString('base64'));
};
// Un seul graphe bundlé : le WeakSet local de vérification doit être partagé
// entre l'aperçu émis et le préparateur, comme dans le vrai navigateur.
const combined = await build({stdin:{contents:
  "export {previewIndexedOpposition} from './studio-local/opposition.mjs';"+
  "export {prepareIndexedAttempt,verifyArchivedIndexedAttempt} from './studio-local/index-action-transaction.mjs';",
  resolveDir:process.cwd(),sourcefile:'test-index-transactions-entry.mjs',loader:'js'},
  bundle:true,platform:'node',format:'esm',target:'es2022',write:false,
  logLevel:'silent',plugins:[alias]});
const { previewIndexedOpposition, prepareIndexedAttempt, verifyArchivedIndexedAttempt } =
  await import('data:text/javascript;base64,'+
    Buffer.from(combined.outputFiles[0].text).toString('base64'));
const { referenceOpponent } = await load('quartz/components/scripts/atelier5d6-bestiary-workshop.ts');
const { createIndexM03Session } = await load('quartz/components/scripts/atelier5d6-index-effects.ts');
const defender=referenceOpponent(10,'defensif',2);
const roll={dice:[6,5,4,4,3],rawStat:22,masteryRank:7,situation:0,
  level:15,threshold:21,impactMode:'magie',baseDamage:6,penetration:1};
const ref={type:'spell',id:'MAG-SORT-001',revision:1};
const runtime=createIndexM03Session();
runtime.importDefinition({reference:ref,provenance:'Pilote Étincelle : essai de laboratoire',
  effect:{kind:'impact',magnitude:2,duration:1,trigger:'attaque'},
  intensityEligible:false,approved:true,approvedByGM:true});
const selections={attackerId:'pj-mage',defenderId:'pnj-cible',attackRefs:[ref]};
const denied=previewIndexedOpposition(roll,defender,runtime,selections);
const details={operationId:'tentative-001',campaignId:'campagne-demo',sceneId:'scene-1',
  expectedRevision:1,confirmedByGM:true,costApprovedByGM:true,
  confirmedAt:'2026-11-17T12:00:00.000Z',applyDamage:true,
  cost:{kind:'mana',sourceId:'mana-pj-mage',amount:3,availableBefore:10,version:2}};
assert.throws(()=>prepareIndexedAttempt(denied,details),/non homologuée/,
  'Un simple drapeau importé approved ne confère aucun droit');
runtime.approveForHolder(ref,'pj-mage',true);
const allowed=previewIndexedOpposition(roll,defender,runtime,selections);
assert.equal(allowed.journalGate,'versioned-journal-required');
assert(allowed.result.damage>0);
assert.throws(()=>prepareIndexedAttempt({...allowed},details),/Aperçu INDEX local exigé/);
assert.throws(()=>prepareIndexedAttempt(JSON.parse(JSON.stringify(allowed)),details),
  /Aperçu INDEX local exigé/);
assert.throws(()=>prepareIndexedAttempt(allowed,{...details,confirmedByGM:false}),
  /Confirmation MJ/);
assert.throws(()=>prepareIndexedAttempt(allowed,{...details,costApprovedByGM:false}),
  /Confirmation MJ/);
assert.throws(()=>prepareIndexedAttempt(allowed,{...details,
  cost:{...details.cost,amount:11}}),/Coût/);
assert.throws(()=>prepareIndexedAttempt(allowed,{...details,
  cost:{...details.cost,amount:0}}),/Coût/);
assert.throws(()=>prepareIndexedAttempt(allowed,{...details,
  confirmedAt:'2026-02-30T12:00:00.000Z'}),/Confirmation MJ/);
const manaBalance={current:10,version:2};
const prepared=prepareIndexedAttempt(allowed,details);
assert.equal(prepared.status,'prepared-not-committed');
assert.equal(prepared.cost.amount,3,'Coût explicitement fourni, jamais inféré');
assert.equal(prepared.result.damage,allowed.result.damage);
assert.equal(prepared.action.mode,'magie');
assert.deepEqual(manaBalance,{current:10,version:2},'Aucun débit automatique');
assert.equal(JSON.stringify(prepared),JSON.stringify(prepareIndexedAttempt(allowed,details)),
  'Préparation pure : opération identique répétée, sans engagement supplémentaire');
assert.throws(()=>prepared.dice.push(6),TypeError);
const archived=JSON.parse(JSON.stringify(prepared));
const checked=verifyArchivedIndexedAttempt(archived);
assert.equal(checked.mathematicallyConsistent,true);
assert.equal(checked.replay.damage,allowed.result.damage);
assert.throws(()=>verifyArchivedIndexedAttempt({...archived,result:{...archived.result,damage:999}}),
  /ne correspond pas à M03/);
assert.throws(()=>verifyArchivedIndexedAttempt({...archived,dice:[1,1,1,1,1]}),
  /cinq dés ne correspondent pas/);
assert.throws(()=>verifyArchivedIndexedAttempt({...archived,proof:{...archived.proof,
  effects:[{...archived.proof.effects[0],magnitude:3}]}}));
assert.throws(()=>verifyArchivedIndexedAttempt({...archived,references:[]}),
  /Source de capacité absente/);
assert.throws(()=>verifyArchivedIndexedAttempt({...archived,cost:{...archived.cost,
  approvedByGM:false}}),/Approbation du coût/);
assert.throws(()=>verifyArchivedIndexedAttempt({...archived,confirmedAt:'bogus'}),
  /Historique de tentative incomplet/);
// Le cas mental garde les cinq dés et les effets, mais ne produit pas de PV.
const mental=previewIndexedOpposition({...roll,impactMode:'mental'},defender,runtime,selections);
assert.equal(mental.result.damage,0);
assert.throws(()=>prepareIndexedAttempt(mental,{...details,applyDamage:true}),
  /Aucun dégât PV/);
const mentalPlan=prepareIndexedAttempt(mental,{...details,applyDamage:false,
  cost:{kind:'none',sourceId:null,amount:0,availableBefore:null,version:null}});
assert.equal(verifyArchivedIndexedAttempt(JSON.parse(JSON.stringify(mentalPlan)))
  .replay.damage,0);
const journalBlocked=previewIndexedOpposition({...roll,feasible:false},
  defender,runtime,selections);
assert.throws(()=>prepareIndexedAttempt(journalBlocked,details),/non homologuée/);
assert(studioAssets.has('/index-action-transaction.mjs'),
  'La lecture du prototype doit être possible dans Studio local');
console.log('STUDIO-CREATE-004C : préparatoire, cinq d6, habilitation locale, coût explicite,'+
  ' rejeu INDEX/M03, mental sans PV, intégrité et absence de débit : PASS');
