import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {studioAssets,readStudioAsset} from '../studio-local/serve.mjs'

async function load(file){
  const out=await build({entryPoints:[file],bundle:true,platform:'node',
    format:'esm',target:'es2022',write:false,logLevel:'silent'})
  return import('data:text/javascript;base64,'+
    Buffer.from(out.outputFiles[0].text).toString('base64'))
}
const registry=await load('quartz/components/scripts/atelier5d6-index-effects.ts')
const m03=await load('quartz/components/scripts/atelier5d6-combat-m03.ts')
const defense={
  level:15,stats:{physique:10,agilite:10,esprit:10,presence:10},
  masteries:{lames:4,esquive:4,magie:4,volonte:4},
  resistanceBonus:{physique:0,magie:0,mental:0},
  protection:{physique:0,magie:0,mental:0},
  equipmentGrades:{physique:3,magie:3,mental:0}
}
const attack={natural:24,rawStat:30,masteryRank:15,situation:0,level:25,
  difficulty:21,kind:'physique',mode:'melee',feasible:true,
  baseDamage:8,penetration:0,defender:defense}
const baseline=m03.resolveCombatM03(attack)
assert(baseline.success)
const ref=(type,id,revision=1)=>({type,id,revision})
const impact=ref('ability','CAP-TEST')
const charm=ref('object','OBJ-CHARM')
const ward=ref('spell','MAG-WARD')
const flame=ref('spell','MAG-SORT-001')
const index=registry.createIndexM03Session()
const effect=(reference,kind,magnitude,trigger,intensityEligible=false)=>({
  reference,provenance:'Catalogue MJ local',effect:{
    kind,magnitude,duration:2,trigger
  },intensityEligible,approved:true,approvedByGM:true
})
// Un fichier importé peut mentir sur son propre approved:true.
const offered=index.importDefinition(effect(impact,'impact',2,'attaque'))
assert.deepEqual(offered,impact)
const forged={
  abilityId:'evil',kind:'impact',magnitude:2,
  duration:2,trigger:'attaque',approved:true
}
const without=index.resolve({action:{...attack,effects:[forged]},
  attackerId:'npc-a',attackRefs:[{...impact,approved:true}]})
assert.equal(without.result.damage,baseline.damage)
assert.equal(without.result.grossDamage,baseline.grossDamage)
assert.equal(without.blocked.length,1)
assert.equal(without.used.length,0)
assert.throws(()=>index.approveForHolder(impact,'npc-a',false))
assert.throws(()=>index.approveForHolder(impact,'',true))
assert.equal(index.approveForHolder(impact,'npc-a',true),true)
const authorized=index.resolve({action:{...attack,effects:[forged]},
  attackerId:'npc-a',attackRefs:[impact]})
assert.equal(authorized.result.grossDamage,baseline.grossDamage+2)
assert.equal(authorized.result.damage,baseline.damage+2)
assert.equal(authorized.used.length,1)
assert.deepEqual(registry.replayIndexM03Proof(attack,authorized.proof),authorized.result,
  'Même M03 pour un événement autorisé conservé puis rejoué')
const archivedImpact=JSON.parse(JSON.stringify(authorized.proof))
assert.deepEqual(registry.replayIndexM03Proof(attack,archivedImpact),authorized.result)
assert.throws(()=>registry.replayIndexM03Proof(attack,
  {...archivedImpact,effects:[{...archivedImpact.effects[0],magnitude:3}]}),
  /Justificatif historique M03 invalide/)
assert.throws(()=>registry.replayIndexM03Proof(attack,
  {...archivedImpact,effects:[{...archivedImpact.effects[0],approved:false}]}),
  /Justificatif historique M03 invalide/)
const another=index.resolve({action:attack,attackerId:'npc-b',
  attackRefs:[impact]})
assert.equal(another.result.damage,baseline.damage,'Autorisation non transférée')
const prior=index.resolve({action:attack,attackerId:'npc-a',
  attackRefs:[ref('ability','CAP-TEST',2)]})
assert.equal(prior.result.damage,baseline.damage,'Révision non homologuée')
index.importDefinition(effect(ref('ability','CAP-TEST',2),
  'impact',1,'attaque'))
const second=index.resolve({action:attack,attackerId:'npc-a',
  attackRefs:[ref('ability','CAP-TEST',2)]})
assert.equal(second.result.damage,baseline.damage,'Nouvelle révision non auto-validée')
index.importDefinition(effect(impact,'impact',1,'attaque'))
const reimport=index.resolve({action:attack,attackerId:'npc-a',attackRefs:[impact]})
assert.equal(reimport.result.damage,baseline.damage,
  'Réimportation annule les permis non attestés')
index.approveForHolder(impact,'npc-a',true)
index.revokeForHolder(impact,'npc-a')
assert.equal(index.resolve({action:attack,attackerId:'npc-a',
  attackRefs:[impact]}).result.damage,baseline.damage)

index.importDefinition(effect(ward,'absorption',2,'defense'))
index.approveForHolder(ward,'def-b',true)
const withAbsorption=index.resolve({action:attack,attackerId:'npc-a',
  defenderId:'def-b',defenseRefs:[ward]})
assert.equal(withAbsorption.result.specialAbsorption,2)
assert.equal(withAbsorption.result.damage,baseline.damage-2)
assert.equal(withAbsorption.result.penetrated,baseline.penetrated)
assert.deepEqual(registry.replayIndexM03Proof(attack,withAbsorption.proof),
  withAbsorption.result,'L’absorption est rejouée sans second calcul de touche')
const wrongOwner=index.resolve({action:attack,attackerId:'npc-a',
  defenderId:'def-c',defenseRefs:[ward]})
assert.equal(wrongOwner.result.damage,baseline.damage)

index.importDefinition({reference:charm,provenance:'Objets fictifs',
  effect:null,intensityEligible:false,approvedByGM:true})
index.approveForHolder(charm,'npc-a',true)
const descriptive=index.resolve({action:attack,attackerId:'npc-a',
  attackRefs:[charm]})
assert.equal(descriptive.result.damage,baseline.damage,
  'Objet purement descriptif ne crée pas de bonus')
index.importDefinition(effect(flame,'precision',1,'attaque',true))
const notApprovedIntensity=index.resolve({action:attack,attackerId:'npc-a',
  intensityRef:flame,intensityTier:'majeure'})
assert.equal(notApprovedIntensity.result.intensityMultiplier,1)
index.approveForHolder(flame,'npc-a',true)
const divine=index.resolve({action:attack,attackerId:'npc-a',
  intensityRef:flame,intensityTier:'majeure'})
assert.equal(divine.result.intensityMultiplier,2)
assert.equal(divine.result.grossDamage,baseline.grossDamage*2,
  'Multiplicateur seulement après habilitation de cet effet')
assert.deepEqual(registry.replayIndexM03Proof(attack,divine.proof),divine.result,
  'Intensité divine stable après archivage de la résolution')
assert.throws(()=>registry.replayIndexM03Proof(attack,
  {...divine.proof,intensity:{...divine.proof.intensity,approved:false}}),
  /Justificatif d'intensité invalide/)
const minor=index.resolve({action:attack,attackerId:'npc-a',
  intensityRef:flame,intensityTier:'mineure'})
assert.equal(minor.result.intensityMultiplier,1)
const mental=index.resolve({action:{...attack,kind:'mental',mode:'mental'},
  attackerId:'npc-a',intensityRef:flame,intensityTier:'majeure',
  attackRefs:[impact]})
assert.equal(mental.result.damage,0)
assert.equal(mental.result.grossDamage,0)
assert.throws(()=>registry.indexReferenceM03({type:'spell',id:'../../secret',revision:1}))
assert.throws(()=>index.importDefinition({reference:ref('object','OBJ-TEST'),
  provenance:' ',effect:null}))
assert.throws(()=>index.importDefinition(effect(ref('spell','BAD-SPELL'),
  'arbitrary',1,'attaque')))
assert.throws(()=>index.resolve({action:attack,attackerId:'npc-a',
  attackRefs:Array.from({length:51},()=>impact)}))
const indexAsset=studioAssets.get('/moteur/atelier5d6-index-effects.js')
assert(indexAsset,'La passerelle INDEX doit être disponible dans le Studio')
const browserModule=(await readStudioAsset(indexAsset)).toString()
assert(browserModule.includes('createIndexM03Session'))
assert(browserModule.includes('atelier5d6-combat-m03.js'),
  'Les imports relatifs sont raccordés au moteur M03 navigateur')
console.log('INDEX-EFF-002 : import non fiable, validation locale/owner/version, '+
  'objet descriptif, absorption, intensité divine, M03/mental et révocation : PASS')
