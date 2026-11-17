import assert from 'node:assert/strict'
import {resolve} from 'node:path'
import {build} from 'esbuild'
import {studioAssets} from '../studio-local/serve.mjs'

const alias={
  name:'studio-moteur-typescript',
  setup(b){
    b.onResolve({filter:/^\.\/moteur\/atelier5d6-[a-z0-9-]+\.js$/},arg=>{
      const leaf=arg.path.slice('./moteur/'.length).replace(/\.js$/,'.ts')
      return {path:resolve('quartz/components/scripts',leaf)}
    })
  }
}
async function load(path){
  const out=await build({entryPoints:[path],bundle:true,platform:'node',
    format:'esm',target:'es2022',write:false,logLevel:'silent',plugins:[alias]})
  return import('data:text/javascript;base64,'+
    Buffer.from(out.outputFiles[0].text).toString('base64'))
}
const studio=await load('studio-local/opposition.mjs')
const bestiary=await load('quartz/components/scripts/atelier5d6-bestiary-workshop.ts')
const index=await load('quartz/components/scripts/atelier5d6-index-effects.ts')
const card=bestiary.referenceOpponent(10,'defensif',2)
const roll={dice:[6,5,4,4,3],rawStat:22,masteryRank:7,
  situation:0,level:15,threshold:21,impactMode:'melee',baseDamage:6,penetration:1}
const beforeCard=JSON.stringify(card)
const beforeRoll=JSON.stringify(roll)
const legacy=studio.resolveOpposition(roll,card)
assert.equal(legacy.success,true,'Cas pilote doit toucher')
assert(legacy.damage>0,'Cas pilote doit infliger des PV')
const runtime=index.createIndexM03Session()
const impact={type:'ability',id:'CAP-ATTAQUE',revision:1}
runtime.importDefinition({reference:impact,provenance:'CAP pilote',
  effect:{kind:'impact',magnitude:2,duration:1,trigger:'attaque'},intensityEligible:false,
  approved:true,approvedByGM:true})
const selection={attackerId:'pj-1',defenderId:'pnj-1',attackRefs:[impact]}
const absent=studio.previewIndexedOpposition(roll,card,runtime,selection)
assert.equal(absent.status,'preview')
assert.equal(absent.result.damage,legacy.damage,'Import non homologué : zéro bonus')
assert.equal(absent.blocked.length,1)
assert.equal(absent.used.length,0)
assert.equal(absent.result.natural,22,'Cinq d6 réels utilisés une fois')
const poison={...roll,effects:[{kind:'impact',magnitude:2,approved:true}],
  intensity:{tier:'majeure',approved:true,definitionId:'forge',version:1}}
const denied=studio.previewIndexedOpposition(poison,card,runtime,selection)
assert.equal(denied.result.damage,legacy.damage,'Données action injectées ignorées')
runtime.approveForHolder(impact,'pj-1',true)
const allowed=studio.previewIndexedOpposition(roll,card,runtime,selection)
assert.equal(allowed.result.damage,legacy.damage+2,'Impact homologué via INDEX/M03')
assert.equal(allowed.used.length,1)
const repeated=studio.previewIndexedOpposition(roll,card,runtime,selection)
assert.deepEqual(repeated,allowed,'Aperçu répété sans état d’engagement')
const wrongOwner=studio.previewIndexedOpposition(roll,card,runtime,
  {...selection,attackerId:'pj-2'})
assert.equal(wrongOwner.result.damage,legacy.damage,'Pas de transfert de permission')
const mental=studio.previewIndexedOpposition({...roll,impactMode:'mental'},card,
  runtime,selection)
assert.equal(mental.result.damage,0,'Mental sans PV')
assert.equal(mental.result.grossDamage,0)
const blockedByMJ=studio.previewIndexedOpposition({...roll,feasible:false},
  card,runtime,selection)
assert.equal(blockedByMJ.result.success,false,'Faisabilité refusée par MJ')
assert.equal(blockedByMJ.result.damage,0)
for(const dice of [[1,2,3,4],[1,2,3,4,7],[0,2,3,4,5],
  [1,2,3,4,5,6],['1',2,3,4,5]]) {
  assert.throws(()=>studio.previewIndexedOpposition({...roll,dice},
    card,runtime,selection),/cinq dés à six faces/)
}
assert.throws(()=>studio.previewIndexedOpposition({...roll,impactMode:'inconnu'},
  card,runtime,selection),/Mode d’opposition inconnu/)
assert.throws(()=>studio.previewIndexedOpposition({...roll,feasible:'false'},
  card,runtime,selection),/Faisabilité MJ/)
assert.throws(()=>studio.previewIndexedOpposition(roll,card,null,selection))
assert.equal(JSON.stringify(card),beforeCard,'Carte défenseur immuable')
assert.equal(JSON.stringify(roll),beforeRoll,'Action entrante immuable')
assert(studioAssets.has('/opposition.mjs'),'Passerelle Studio exposée')
assert(studioAssets.has('/moteur/atelier5d6-index-effects.js'),
  'Session INDEX exposée')
console.log('STUDIO-CREATE-004/P0 : un aperçu cinq d6 sans dépense, M03 historique,'+
  ' permission INDEX, anti-injection, détenteur, faisabilité, mental, non-mutation : PASS')
