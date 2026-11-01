import assert from "node:assert/strict"
import {build} from "esbuild"
const load=async entry=>{
  const result=await build({entryPoints:[entry],platform:"node",bundle:true,format:"esm",
    target:"es2022",write:false,logLevel:"silent"})
  return import("data:text/javascript;base64,"+Buffer.from(result.outputFiles[0].text).toString("base64"))
}
const m=await load("quartz/components/scripts/atelier5d6-mana-recovery.ts")
const sim=await load("quartz/components/scripts/atelier5d6-mana-expedition.ts")
const prog=await load("quartz/components/scripts/atelier5d6-progression.ts")
const dice=await load("quartz/components/scripts/atelier5d6-probabilities.ts")
let assertions=0
const ok=(value,msg)=>{assert(value,msg);assertions++}
const eq=(a,b,msg)=>{assert.equal(a,b,msg);assertions++}
const approve=(authority="mj")=>({approved:true,authority,origin:"test-mag003a"})
const op=(s,id,type,extra={})=>({id,type,characterId:s.characterId,dayKey:s.dayKey,
  validation:approve(),...extra})
const rest=(s,id,kind,restId=id,extra={})=>m.applyManaOperation(s,op(s,id,"recover",{
  kind,rest:{restId,safe:true,completed:true,...extra}}))
const spend=(s,id,cost)=>m.applyManaOperation(s,op(s,id,"spend",{cost,purpose:"test"}))
const day=(s,id,name)=>m.applyManaOperation(s,op(s,id,"nextDay",{nextDay:name}))
const scenario=(level,reserve)=>{
  let s=m.createManaState("mage-"+level,"J1",reserve,0)
  const a=rest(s,"a","shortFirst");s=a.state
  eq(s.mana,Math.floor(reserve*.2),"Premier repos 20 %")
  const b=rest(s,"b","shortSecond");s=b.state
  eq(s.mana,Math.floor(reserve*.4),"Deux repos plafonnés cumulés")
  const used=s.recoveredToday
  if(s.mana>0){s=spend(s,"cost",Math.min(s.mana,2)).state;eq(s.recoveredToday,used,"Une dépense ne recrédite pas le budget")}
  const c=rest(s,"c","longOrdinary");s=c.state
  eq(s.recoveredToday,Math.floor(reserve*.5),"Repos long complète, sans addition")
  ok(s.mana>=0&&s.mana<=reserve,"Bornage de la réserve")
  const copies=m.importManaState(m.exportManaState(s))
  eq(JSON.stringify(copies),JSON.stringify(s),"Sauvegarde et reprise identiques")
  const again=m.applyManaOperation(s,op(s,"c","spend",{cost:0,purpose:"collision"}))
  ok(again.duplicate,"Transaction déjà reçue")
  eq(again.state.journal.length,s.journal.length,"Journal non doublé")
}
for(const [level,reserve] of [[1,0],[5,36],[10,66],[15,114],[20,174],[25,306]])
{
  eq(sim.manaForMagicLevel(level),reserve,"Réserve réellement projetée au niveau "+level)
  scenario(level,reserve)
}
const odd=35
for(const rounding of ["exactCarry","cycleAdjustment"]){
  let s=m.createManaState("odd","J1",odd,0,{...m.MANA_POLICIES.reference,rounding})
  s=rest(s,"r1","longOrdinary").state
  eq(s.mana,17,"Jour 1 : floor(17,5)")
  s=day(s,"next1","J2").state
  s=rest(s,"r2","longOrdinary").state
  eq(s.mana,35,"Jour 2 : arrondi compensé")
  s=spend(s,"spent35",35).state
  s=day(s,"next2","J3").state
  s=rest(s,"r3","longOrdinary").state
  eq(s.mana,17,"Jour 3 : pas de mana gratuit")
}
{
  let s=m.createManaState("interrupt","J1",36,0)
  s=m.applyManaOperation(s,op(s,"i1","interrupt",{restId:"pause-X"})).state
  const attempt=rest(s,"i2","shortFirst","pause-X")
  ok(!attempt.entry.accepted,"Repos interrompu inaccessible")
  eq(attempt.state.mana,0,"Aucun crédit sur interruption")
}
{
  let s=m.createManaState("mana0","J1",0,0)
  s=rest(s,"r0","shortFirst").state
  eq(s.mana,0,"Non-mage : repos sans mana")
  const refused=spend(s,"p0",2)
  eq(refused.entry.accepted,false,"Pas de réserve : débit refusé")
}
{
  let s=m.createManaState("full","J1",35,34)
  s=rest(s,"rf","longOrdinary").state
  eq(s.mana,35,"Récupération limitée au manque réel")
  eq(s.recoveredToday,1,"Budget réel et non théorique compté")
}
{
  let s=m.createManaState("growth","J1",36,0)
  s=m.applyManaOperation(s,op(s,"up","changeMax",{manaMax:306})).state
  s=rest(s,"r","longOrdinary").state
  eq(s.mana,18,"Croissance : aucun crédit rétroactif")
  s=day(s,"n","J2").state
  s=rest(s,"r2","longOrdinary").state
  eq(s.mana,171,"Nouveau jour : plafond recalculé à 306")
  s=m.applyManaOperation(s,op(s,"down","changeMax",{manaMax:10})).state
  eq(s.mana,10,"Diminution du maximum : mana écrêté")
  ok(s.recoveredToday>=0,"Le budget historique reste consommé après diminution")
}
{
  let s=m.createManaState("abuse","J1",36,0)
  s=rest(s,"p1","shortFirst").state
  s=rest(s,"p2","shortSecond").state
  for(let i=0;i<80;i++){
    const attempt=rest(s,"abuse"+i,"shortFirst","unique"+i)
    eq(attempt.entry.accepted,false,"Troisième repos court interdit")
    s=attempt.state
  }
  s=rest(s,"long","longOrdinary").state
  eq(s.recoveredToday,18,"Maximum quotidien 50 %")
  for(let i=0;i<30;i++){
    s=spend(s,"spend"+i,Math.min(1,s.mana)).state
    s=rest(s,"repeat"+i,"longOrdinary","long"+i).state
  }
  eq(s.recoveredToday,18,"Les dépenses ne recréent jamais le plafond")
  const unauthorized=rest(s,"ritual","shortRitual","ritual",{focused:true,exceptionalApproved:true})
  eq(unauthorized.entry.accepted,false,"Plus de créneau court")
}
{
  const s=m.createManaState("exceptions","J1",36,0)
  const unauthorized=m.applyManaOperation(s,{...op(s,"x","recover",{
    kind:"longRetreat",rest:{restId:"x",safe:true,completed:true,focused:true,exceptionalApproved:true}}),
    validation:approve("simulation")})
  eq(unauthorized.entry.accepted,false,"Une simulation n'accorde pas le privilège MJ")
  eq(unauthorized.state.mana,0,"Rite non validé : aucun mana")
  const allowed=rest(s,"approved","longRetreat","approved",{focused:true,exceptionalApproved:true})
  eq(allowed.state.mana,36,"Retraite 100 % seulement validée")
  const repeated=rest(allowed.state,"again","longRetreat","again",{focused:true,exceptionalApproved:true})
  eq(repeated.state.mana,36,"Deuxième retraite : aucun mana additionnel")
}
for(const mana of [36,306]){
  const sig=m.magicCost("significant",mana,"C"),major=m.magicCost("major",mana,"C")
  eq(sig,Math.max(4,Math.ceil(mana*.12)),"C : significatif")
  eq(major,Math.max(8,Math.ceil(mana*.25)),"C : majeur")
  ok(m.magicCost("significant",mana,"intensity",Math.min(36,mana))<=sig,"Intensité volontaire moins coûteuse")
  eq(m.magicCost("minor",mana),2,"Geste mineur fixe 2")
  eq(m.magicCost("significant",mana,"fixed"),4,"Ancien fixe 4 : comparaison, pas migration")
}
eq(prog.effectiveStat(39),11,"Progression M01 score brut 39")
eq(dice.TOTAL_OUTCOMES,7776,"Distribution exacte M01")
const choices=[
  {id:"mineur",tier:"minor",model:"C"},
  {id:"signif",tier:"significant",model:"C"},
  {id:"utilitaire",tier:"significant",model:"intensity",intensityBasis:36}
]
const profile={characterId:"expedition",dayKey:"J1",level:25,rawStat:39,masteryRank:8,manaMax:306,mana:90}
const step=(id,type,extra={})=>({id,type,characterId:profile.characterId,dayKey:profile.dayKey,
  validation:approve(),...extra})
const expedition={
  profile,seed:20261101,choices,
  steps:[
    {id:"cast1",type:"cast",characterId:profile.characterId,dayKey:"J1",validation:approve(),
      action:choices[1],check:{type:"m01",threshold:24,feasible:true,situation:0}},
    step("rest1","recover",{kind:"shortFirst",rest:{restId:"p1",safe:true,completed:true}}),
    step("interrupt","interrupt",{restId:"p2"}),
    step("rejected-rest","recover",{kind:"shortSecond",rest:{restId:"p2",safe:true,completed:true}}),
    {id:"cast2",type:"cast",characterId:profile.characterId,dayKey:"J1",validation:approve(),
      action:choices[0],check:{type:"m03",combat:{
        situation:0,difficulty:21,kind:"magie",mode:"magie",baseDamage:3,feasible:true}}},
    step("rest2","recover",{kind:"shortSecond",rest:{restId:"p3",safe:true,completed:true}}),
    step("long","recover",{kind:"longOrdinary",rest:{restId:"p4",safe:true,completed:true}})
  ]
}
const run=sim.simulateExpedition(expedition)
const same=sim.simulateExpedition(expedition)
eq(JSON.stringify(run.rows),JSON.stringify(same.rows),"Mêmes graines => résultats identiques")
eq(run.rows.length,7,"Tous les événements tracés")
eq(run.rows[3].accepted,false,"Repos interrompu refusé")
ok(run.rows[0].natural>=5&&run.rows[0].natural<=30,"Vrais dés 5d6")
ok(typeof run.rows[4].damageProposed==="number","M03 calcule sans appliquer de dégâts")
ok(run.rows.every(r=>r.manaAfter>=0&&r.manaAfter<=306),"Aucun débordement")
ok(run.rows.some(r=>r.possible.includes("mineur")),"Actions possibles calculées")
const compared=sim.compareRecoveryPolicies({...expedition,steps:expedition.steps.filter(s=>s.type==="recover")})
eq(compared.length,3,"Trois grilles paramétrées comparées")
ok(compared[0].restored!==compared[1].restored,"Politiques réellement différentes")
assert.throws(()=>m.importManaState('{"schema":"alrick.mana.recovery.v1"}'),"Import incomplet rejeté")
assert.throws(()=>m.magicCost("major",36,"intensity",37),"Intensité excessive rejetée")
assert.throws(()=>m.createManaState("a","J1",35,36),"Mana initial invalide")
console.table(compared)
console.log("MAG-003.A OK — "+assertions+" assertions contrôlées ; niveaux N1/N5/N10/N15/N20/N25, registres, coûts, sauvegardes, interruptions, M01 et M03.")
