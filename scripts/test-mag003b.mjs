import assert from "node:assert/strict"
import {build} from "esbuild"
const bundle=async entry=>{
  const built=await build({entryPoints:[entry],platform:"node",bundle:true,format:"esm",
    target:"es2022",write:false,logLevel:"silent"})
  return import("data:text/javascript;base64,"+Buffer.from(built.outputFiles[0].text).toString("base64"))
}
const m=await bundle("quartz/components/scripts/atelier5d6-rituals-mag003b.ts")
const mana=await bundle("quartz/components/scripts/atelier5d6-mana-recovery.ts")
const probability=await bundle("quartz/components/scripts/atelier5d6-probabilities.ts")
let checks=0
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++}
const yes=(a,label)=>{assert(a,label);checks++}
const throws=(fn,part)=>{assert.throws(fn,e=>e.message.includes(part),part);checks++}
const person=(id,role="officiant",overrides={})=>({
  id,role,rawStat:5,masteryRank:3,mage:role==="officiant",
  skills:[],circleRights:{},...overrides
})
const def=(overrides={})=>({
  schema:m.RITUAL_SCHEMA,id:"rite-test",version:"1.0.0",title:"Rite de test",
  practice:"meditation",resolution:"automatique",leadRole:"officiant",
  feasible:true,requiresSafePlace:true,requiredRoles:["officiant"],components:{},effects:[],
  ...overrides
})
const contribution=(id,participantId,kind,more={})=>({
  id,participantId,kind,detail:kind,approved:true,...more
})
const create=(d=def(),participants=[person("p1")])=>m.createRitualInstance(d,"instance-"+d.id,participants)
const prepare=(s,contributions=[],safePlace=true)=>m.transitionRitual(s,{
  id:"prepare",type:"preparer",tick:1,contributions,safePlace
})
const engage=s=>m.transitionRitual(s,{id:"engage",type:"engager",tick:2})
const resolve=(s,more={})=>m.transitionRitual(s,{id:"solve",type:"resoudre",tick:3,...more})
const chain=(s,c=[],safe=true)=>engage(prepare(s,c,safe))
const scenarios=[]
// 1. Rite personnel simple sans jet et sans augmentation de mana
{
  const s=resolve(chain(create()))
  eq(s.status,"resolu","Rite personnel terminé")
  eq(s.result.automatic,true,"Pratique certaine sans dé")
  eq(s.result.probability,1,"Pratique acquise")
  eq(s.result.energyDebits.length,0,"Sans économie magique implicite")
  scenarios.push("S01 rite personnel simple")
}
// 2. Méditation approfondie : effet narratif, pas de bonus implicite
{
  const effect={id:"clarte",kind:"clarte",narrative:"Esprit apaisé",durationTicks:2,context:"hors combat"}
  const s=resolve(chain(create(def({id:"deep",effects:[effect]}))))
  eq(s.result.effectsProposed[0].expiresAtTick,5,"Expiration déclarative")
  eq(s.result.effectsProposed[0].numerical,undefined,"Pas de bonus implicite")
  eq(m.eligibleRitualEffects(s,4,"hors combat").length,1,"Effet éligible dans sa durée")
  eq(m.eligibleRitualEffects(s,5,"hors combat").length,0,"Effet expiré")
  eq(m.eligibleRitualEffects(s,4,"combat").length,0,"Contexte non valide")
  eq(m.applicationPlan(s).applied,false,"Plan non appliqué")
  scenarios.push("S02 méditation approfondie")
}
// 3. Rite incertain et probabilités exactes M01
{
  let s=chain(create(def({id:"roll",resolution:"m01",difficulty:23})))
  s=resolve(s,{natural:18})
  eq(s.result.automatic,false,"Jet requis")
  const leader=s.participants[0]
  const prog=await bundle("quartz/components/scripts/atelier5d6-progression.ts")
  eq(s.result.probability,prog.probabilityProgressionAction({
    rawStat:leader.rawStat,masteryRank:leader.masteryRank,situation:0,threshold:23,feasible:true
  }),"Probabilité identique M01")
  eq(probability.TOTAL_OUTCOMES,7776,"5d6")
  throws(()=>resolve(chain(create(def({id:"missing",resolution:"m01",difficulty:20})))),"Naturel 5d6")
  scenarios.push("S03 rite incertain 5d6")
}
// 4. Interruption et transitions refusées
{
  let s=prepare(create())
  s=m.transitionRitual(s,{id:"stop",type:"interrompre",tick:2,reason:"orage"})
  eq(s.status,"interrompu","Rite interrompu")
  throws(()=>engage(s),"Transition interdite")
  throws(()=>m.transitionRitual(s,{id:"stop",type:"annuler",tick:2,reason:"collision"}),"Collision")
  eq(m.transitionRitual(s,{id:"stop",type:"interrompre",tick:2,reason:"orage"}),s,"Idempotence")
  scenarios.push("S04 interruption")
}
// 5. Cérémonie à trois rôles
{
  const s=resolve(chain(create(def({id:"trio",requiredRoles:["officiant","chantre","gardien"]}),[
    person("a"),person("b","chantre"),person("c","gardien")
  ])))
  eq(s.status,"resolu","Trois personnages")
  scenarios.push("S05 cérémonie trois")
}
// 6. Non mage utile par composant, sécurité et support
{
  let s=create(def({id:"nonmage",requiredRoles:["officiant","artisan"],components:{craie:1}}),[
    person("mage"),person("ouvrier","artisan",{mage:false,skills:["atelier"]})
  ])
  s=chain(s,[contribution("s","ouvrier","component",{componentId:"craie",quantity:1}),
    contribution("sec","ouvrier","securite")],false)
  eq(resolve(s).status,"resolu","Non mage valide la préparation")
  scenarios.push("S06 cérémonie non mage")
}
// 7. Dix assistants : un soutien +1 non cumulatif, plafonné dans situation M01
{
  let s=create(def({id:"ten",resolution:"m01",difficulty:21}),[
    person("lead"),...Array.from({length:10},(_,i)=>person("a"+i,"assistant",{mage:false}))
  ])
  const help=Array.from({length:10},(_,i)=>contribution("help"+i,"a"+i,"support"))
  s=resolve(chain(s,help),{natural:17,baseSituation:1})
  eq(s.result.supportUsed,1,"Dix aides plafonnées à +1")
  eq(s.result.effectiveSituation,2,"Situation M01 maximum +2")
  const t=resolve(chain(create(def({id:"ten-cap",resolution:"m01",difficulty:21}),[
    person("lead"),person("helper","assistant")
  ]),[contribution("h","helper","support")]),{natural:17,baseSituation:2})
  eq(t.result.supportUsed,0,"Ne franchit pas +2")
  scenarios.push("S07 dix assistants")
}
// 8. Composant manquant
{
  throws(()=>prepare(create(def({id:"component",components:{sel:2}}))),"Composant manquant")
  scenarios.push("S08 composant absent")
}
// 9. Préparation matrice existante, séparée de conception
{
  const activation=def({id:"matrix",practice:"preparation_rituel",circle:{
    number:3,action:"activer",existingMatrixId:"M-01",authorizedMatrix:true
  }})
  const mage=person("runiste","runiste",{circleRights:{activer:[3]}})
  eq(resolve(chain(create(activation,[mage,person("chef")]))).status,"resolu","Activation connue")
  throws(()=>prepare(create({...activation,id:"matrix-design",circle:{number:3,action:"concevoir",authorizedMatrix:true}},
    [mage,person("chef"),...Array.from({length:10},(_,i)=>person("e"+i,"assistant"))])),
    "Aucun participant ne maîtrise")
  scenarios.push("S09 matrice et conception")
}
// 10. Cercle IX/validation et rite impossible
{
  throws(()=>create(def({id:"ix",circle:{number:9,action:"concevoir",authorizedMatrix:true}})),
    "Cercle IX")
  throws(()=>create(def({id:"forbid",circle:{number:2,action:"assister",authorizedMatrix:false}})),
    "Validation de matrice")
  const s=resolve(chain(create(def({id:"impossible",resolution:"m01",difficulty:15,feasible:false}))),{natural:30})
  eq(s.result.success,false,"Naturel 30 ne contourne pas impossibilité")
  eq(s.result.probability,0,"Probabilité nulle")
  scenarios.push("S10 refus sans autorisation")
}
// 11. Énergie collective : propositions seulement, pas de débit ni bonus illimité
{
  const d=def({id:"energy",energy:{policyId:"MAG003B-explicit",maxPerParticipant:5,maxTotal:8}})
  const p=[person("m1"),person("m2","canaliseur")]
  const c=[contribution("e1","m1","energie",{energyAmount:4,manaCharacterId:"m1"}),
    contribution("e2","m2","energie",{energyAmount:3,manaCharacterId:"m2"})]
  let s=chain(create(d,p),c)
  const states={m1:mana.createManaState("m1","J1",36,10),
    m2:mana.createManaState("m2","J1",36,9)}
  const prior=JSON.stringify(states)
  s=resolve(s,{manaStates:states})
  eq(JSON.stringify(states),prior,"Aucun mana débité en prévisualisation")
  eq(s.result.energyDebits.length,2,"Écritures détaillées par propriétaire")
  eq(s.result.application,"requires-authoritative-server","Multijoueur bloqué sans serveur")
  eq(m.applicationPlan(s).needsServer,true,"Aucune atomicité simulée")
  throws(()=>prepare(create({...d,id:"over"},p),[
    contribution("e3","m1","energie",{energyAmount:6,manaCharacterId:"m1"})]),"Plafond énergétique")
  throws(()=>prepare(create({...d,id:"wrong"},p),[
    contribution("e4","m1","energie",{energyAmount:1,manaCharacterId:"m2"})]),"non attribuée")
  throws(()=>resolve(chain(create({...d,id:"low"},p),c),{manaStates:{
    m1:mana.createManaState("m1","J1",36,3),m2:states.m2}}),"Mana insuffisant")
  scenarios.push("S11 transactions énergie")
}
// 12. Non cumul d'effets numériques et verrou éditorial
{
  throws(()=>create(def({id:"unapproved",effects:[{id:"i",kind:"inspiration",narrative:"motivé",
    durationTicks:1,context:"rappel",numerical:{kind:"m01-situation",magnitude:1,approvedByGM:false}}]})),
  "non validé")
  throws(()=>create(def({id:"too-big",effects:[{id:"i",kind:"clarte",narrative:"concentré",
    durationTicks:1,context:"atelier",numerical:{kind:"m03-situation",magnitude:2,approvedByGM:true}}]})),
  "supérieur")
  throws(()=>create(def({id:"stack",effects:[
    {id:"n1",kind:"clarte",narrative:"clarté",durationTicks:1,context:"jet",
      numerical:{kind:"m01-situation",magnitude:1,approvedByGM:true}},
    {id:"n2",kind:"concentration",narrative:"concentration",durationTicks:1,context:"jet",
      numerical:{kind:"m01-situation",magnitude:1,approvedByGM:true}}
  ]})),"Non-cumul")
  scenarios.push("S12 effets et validation")
}
// 13. Test chemin M03 : résolution par l'autorité existante, probabilité exacte
{
  let s=chain(create(def({id:"m03",resolution:"m03",difficulty:18})))
  s=resolve(s,{natural:20,combat:{level:5,kind:"mental",mode:"mental",
    feasible:true,baseDamage:1,difficulty:18}})
  eq(s.result.damageProposed,0,"M03 mental sans dégâts")
  yes(s.result.probability>=0&&s.result.probability<=1,"Probabilité M03 bornée")
  scenarios.push("S13 M03")
}
// 14. Import/export et annulation
{
  const s=prepare(create(def({id:"export"})))
  eq(m.importRitual(m.exportRitual(s)),s,"Persistance versionnée")
  const a=m.transitionRitual(s,{id:"c",type:"annuler",tick:2,reason:"décision"})
  throws(()=>engage(a),"Transition interdite")
  scenarios.push("S14 import et annulation")
}
console.log("MAG-003.B : "+checks+" assertions réussies ; "+scenarios.length+" scénarios.")
for(const s of scenarios)console.log("  "+s)
