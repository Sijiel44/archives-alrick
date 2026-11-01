/** MAG-003.A — simulateur calculatoire déterministe, sans interface ni conséquence canonique. */
import {createManaState,applyManaOperation,recoveryAvailable,magicCost,MANA_POLICIES,validateManaPolicy} from "./atelier5d6-mana-recovery"
import type {ManaOperation,ManaPolicy,ManaState,CostTier,Validation} from "./atelier5d6-mana-recovery"
import {effectiveStat,effectiveMastery,resolveProgressionAction} from "./atelier5d6-progression"
import {rollFiveDice} from "./atelier5d6-probabilities"
import {resolveCombatM03} from "./atelier5d6-combat-m03"
import type {CombatM03Input} from "./atelier5d6-combat-m03"

export type SimProfile={characterId:string;dayKey:string;level:number;rawStat:number;masteryRank:number;manaMax:number;mana:number}
export type ActionChoice={id:string;tier:CostTier;model:"C"|"intensity"|"fixed";intensityBasis?:number}
export type SimCast={
  id:string;type:"cast";characterId:string;dayKey:string;validation:Validation
  action:ActionChoice;effectLevel?:number;check?:{type:"m01";threshold:number;feasible:boolean;situation:number}
   |{type:"m03";combat:Omit<CombatM03Input,"natural"|"rawStat"|"masteryRank"|"level">}
}
export type ExpeditionStep=ManaOperation|SimCast
export type ExpeditionInput={profile:SimProfile;steps:ExpeditionStep[];policy?:ManaPolicy;seed?:number;choices?:ActionChoice[]}
export type SimRow={
  id:string;dayKey:string;type:string;accepted:boolean;reason:string;duplicate:boolean
  manaBefore:number;manaAfter:number;gain:number;budgetUsed:number;budgetAvailable:number
  possible:string[];refused:{id:string;reason:string}[];natural?:number;success?:boolean;damageProposed?:number
}
export type ExpeditionOutput={state:ManaState;rows:SimRow[];warnings:string[];seed:number;policyId:string;policyVersion:string}
export function seededRandom(seed:number):()=>number{
  if(!Number.isSafeInteger(seed))throw new Error("Graine entière sûre requise.")
  let x=seed>>>0
  return ()=>{x=(Math.imul(1664525,x)+1013904223)>>>0;return x/4294967296}
}
export function manaForMagicLevel(level:number):number{
  if(!Number.isInteger(level)||level<1||level>25)throw new Error("Niveau 1–25 attendu.")
  // Seule projection attestée de l'Atelier : PJ magique créé au niveau 5 avec 36 mana.
  // N1–N4 n'ont aucune réserve magique automatiquement attribuée.
  if(level<5)return 0
  let mana=36
  for(let n=6;n<=level;n++)mana+=n===25?36:n>=21?24:n>=13?12:6
  return mana
}
export function simulateExpedition(input:ExpeditionInput):ExpeditionOutput{
  const p=input.profile
  if(!Number.isInteger(p.level)||p.level<1||p.level>25)throw new Error("Niveau 1–25 requis.")
  // Utilisation effective du contrat commun, jamais des bonus bruts au jet.
  effectiveStat(p.rawStat);effectiveMastery(p.masteryRank)
  const policy=validateManaPolicy(input.policy??MANA_POLICIES.reference)
  let state=createManaState(p.characterId,p.dayKey,p.manaMax,p.mana,policy)
  const seed=input.seed??20261101,random=seededRandom(seed)
  const rows:SimRow[]=[],warnings:string[]=[]
  const choices=input.choices??[]
  for(const step of input.steps){
    let operation:ManaOperation
    let cost=0
    if(step.type==="cast"){
      cost=magicCost(step.action.tier,state.manaMax,step.action.model,step.action.intensityBasis)
      const combatIntensity=step.action.model==="intensity"&&step.check?.type==="m03"
      const effectLevelValid=Number.isInteger(step.effectLevel)&&
        (step.effectLevel??0)>=5&&(step.effectLevel??0)<=p.level&&
        step.action.intensityBasis===manaForMagicLevel(step.effectLevel??0)
      const denialReason=combatIntensity&&!effectLevelValid?
        "Intensité M03 non attestée : niveau d'effet et réserve de référence requis.":undefined
      operation={id:step.id,type:"spend",characterId:step.characterId,dayKey:step.dayKey,
        validation:step.validation,cost,purpose:"sort:"+step.action.id,denialReason}
    }else operation=step
    const result=applyManaOperation(state,operation)
    const was=state.mana
    state=result.state
    const possible:string[]=[],refused:{id:string;reason:string}[]=[]
    for(const choice of choices){
      try{
        const actionCost=magicCost(choice.tier,state.manaMax,choice.model,choice.intensityBasis)
        if(actionCost<=state.mana)possible.push(choice.id)
        else refused.push({id:choice.id,reason:"Mana insuffisant ("+actionCost+" requis)."})
      }catch(e){refused.push({id:choice.id,reason:(e as Error).message})}
    }
    const row:SimRow={id:step.id,dayKey:step.dayKey,type:step.type,accepted:result.entry.accepted,
      reason:result.entry.reason,duplicate:result.duplicate,
      manaBefore:was,manaAfter:state.mana,gain:result.entry.gain,budgetUsed:state.recoveredToday,
      budgetAvailable:recoveryAvailable(state),possible,refused}
    if(step.type==="cast"&&result.entry.accepted&&!result.duplicate&&step.check){
      const dice=rollFiveDice(random)
      row.natural=dice.reduce((a,b)=>a+b,0)
      if(step.check.type==="m01"){
        const resultM01=resolveProgressionAction({natural:row.natural,
          rawStat:p.rawStat,masteryRank:p.masteryRank,threshold:step.check.threshold,
          feasible:step.check.feasible,situation:step.check.situation})
        row.success=resultM01.success
      }else{
        const resultM03=resolveCombatM03({...step.check.combat,natural:row.natural,
          rawStat:p.rawStat,masteryRank:p.masteryRank,level:step.action.model==="intensity"?step.effectLevel:p.level})
        row.success=resultM03.success
        row.damageProposed=resultM03.damage // NE PAS appliquer de PV automatiquement.
      }
    }
    if(!result.entry.accepted)warnings.push(step.id+" : "+result.entry.reason)
    if(step.type==="changeMax"&&state.manaMax!==state.dayBaseMax)
      warnings.push(step.id+" : changement de réserve, plafond de récupération ancré au début de journée.")
    rows.push(row)
  }
  return {state,rows,warnings,seed,policyId:policy.id,policyVersion:policy.version}
}
export function compareRecoveryPolicies(input:Omit<ExpeditionInput,"policy">,
  policies:ManaPolicy[]=Object.values(MANA_POLICIES)){
  return policies.map(policy=>{
    const result=simulateExpedition({...input,policy})
    return {id:policy.id,version:policy.version,rounding:policy.rounding,
      manaFinal:result.state.mana,restored:result.rows.reduce((n,r)=>n+r.gain,0),
      rejected:result.rows.filter(r=>!r.accepted).length,events:result.rows.length}
  })
}
