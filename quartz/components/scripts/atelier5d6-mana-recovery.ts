/**
 * MAG-003.A — laboratoire de récupération personnelle, pur et versionné.
 * Aucun effet sur le Grimoire, les fiches historiques, les charges ou le site.
 * Les validations sont des attestations locales, PAS une authentification réseau.
 */
export const MANA_SCHEMA = "alrick.mana.recovery.v1" as const
export const RATE_SCALE = 10000
export type RestKind = "shortFirst"|"shortSecond"|"shortDeep"|"shortRitual"|"longOrdinary"|"longRetreat"
export type Rounding = "exactCarry"|"cycleAdjustment"
export type ManaPolicy = {id:string;version:string;rates:Record<RestKind,number>;rounding:Rounding}
export const MANA_POLICIES:Record<string,ManaPolicy> = {
  reference:{id:"mag003a-reference",version:"1.0.0",rounding:"exactCarry",
    rates:{shortFirst:2000,shortSecond:4000,shortDeep:4000,shortRitual:6000,longOrdinary:5000,longRetreat:10000}},
  prudent:{id:"mag003a-prudent",version:"1.0.0",rounding:"exactCarry",
    rates:{shortFirst:1500,shortSecond:3000,shortDeep:3500,shortRitual:5000,longOrdinary:5000,longRetreat:10000}},
  ample:{id:"mag003a-ample",version:"1.0.0",rounding:"exactCarry",
    rates:{shortFirst:2500,shortSecond:5000,shortDeep:5000,shortRitual:6500,longOrdinary:6000,longRetreat:10000}},
}
export type Validation={approved:boolean;authority:"mj"|"simulation"|"system";origin:string}
export type RestContext={restId:string;safe:boolean;completed:boolean;focused?:boolean;exceptionalApproved?:boolean;interrupted?:boolean}
export type ManaOperation=
 |{id:string;type:"recover";characterId:string;dayKey:string;validation:Validation;kind:RestKind;rest:RestContext}
 |{id:string;type:"spend";characterId:string;dayKey:string;validation:Validation;cost:number;purpose:string;denialReason?:string}
 |{id:string;type:"interrupt";characterId:string;dayKey:string;validation:Validation;restId:string}
 |{id:string;type:"changeMax";characterId:string;dayKey:string;validation:Validation;manaMax:number}
 |{id:string;type:"nextDay";characterId:string;dayKey:string;validation:Validation;nextDay:string}
export type ManaEvent={
  id:string;characterId:string;dayKey:string;type:ManaOperation["type"];kind:string
  before:number;after:number;gain:number;spent:number;budgetBefore:number;budgetAfter:number
  policyId:string;policyVersion:string;validation:Validation;accepted:boolean;reason:string
}
export type ManaState={
  schema:typeof MANA_SCHEMA;characterId:string;dayKey:string;dayIndex:number
  mana:number;manaMax:number;dayBaseMax:number;dayRate:number;recoveredToday:number
  carryUnits:number;cycleUnits:number;shortCount:number;restIds:string[]
  policy:ManaPolicy;journal:ManaEvent[]
}
const integer=(value:number,label:string,min=0):void=>{
  if(!Number.isSafeInteger(value)||value<min)throw new RangeError(label+" : entier sûr requis.")
}
const positive=(s:string,label:string):void=>{if(typeof s!=="string"||!s.trim())throw new RangeError(label+" obligatoire.")}
const clone=<T>(value:T):T=>JSON.parse(JSON.stringify(value)) as T
export function validateManaPolicy(p:ManaPolicy):ManaPolicy {
  if(!p||typeof p!=="object")throw new Error("Politique absente.")
  positive(p.id,"ID politique");positive(p.version,"Version")
  if(p.rounding!=="exactCarry"&&p.rounding!=="cycleAdjustment")throw new Error("Arrondi inconnu.")
  const kinds:RestKind[]=["shortFirst","shortSecond","shortDeep","shortRitual","longOrdinary","longRetreat"]
  for(const k of kinds){integer(p.rates?.[k],"Taux "+k);if(p.rates[k]>RATE_SCALE)throw new RangeError("Taux >100 %.")}
  if(p.rates.shortSecond<p.rates.shortFirst)throw new Error("Deuxième repos inférieur au premier.")
  return clone(p)
}
export function createManaState(characterId:string,dayKey:string,manaMax:number,mana=manaMax,
  policy:ManaPolicy=MANA_POLICIES.reference):ManaState{
  positive(characterId,"Personnage");positive(dayKey,"Journée");integer(manaMax,"Mana maximum");integer(mana,"Mana actuel")
  if(mana>manaMax)throw new Error("Mana actuel supérieur au maximum.")
  return {schema:MANA_SCHEMA,characterId,dayKey,dayIndex:0,mana,manaMax,dayBaseMax:manaMax,
    dayRate:0,recoveredToday:0,carryUnits:0,cycleUnits:0,shortCount:0,restIds:[],
    policy:validateManaPolicy(policy),journal:[]}
}
/** Le maximum est figé au commencement de la journée : jamais de crédit rétroactif. */
export function dailyCeiling(s:ManaState,rate=s.dayRate):number {
  integer(rate,"Taux");if(rate>RATE_SCALE)throw new RangeError("Taux invalide.")
  const units=BigInt(s.dayBaseMax)*BigInt(rate),scale=BigInt(RATE_SCALE)
  const fraction=Number(units%scale)
  if(s.policy.rounding==="exactCarry")return Number((units+BigInt(s.carryUnits))/scale)
  return Number(units/scale)+
    (s.dayIndex%2===1?Math.floor((s.cycleUnits+fraction)/RATE_SCALE):0)
}
export function recoveryAvailable(s:ManaState):number{
  return Math.max(0,Math.min(s.manaMax-s.mana,dailyCeiling(s)-s.recoveredToday))
}
export type ManaResult={state:ManaState;entry:ManaEvent;duplicate:boolean}
export function applyManaOperation(source:ManaState,operation:ManaOperation):ManaResult{
  validateManaState(source)
  positive(operation.id,"Transaction")
  if(operation.characterId!==source.characterId)throw new Error("Identifiant de personnage incompatible.")
  const old=source.journal.find(e=>e.id===operation.id)
  if(old)return {state:clone(source),entry:clone(old),duplicate:true}
  if(operation.dayKey!==source.dayKey)throw new Error("Journée incorrecte : transition explicite requise.")
  const s=clone(source),before=s.mana,budgetBefore=s.recoveredToday
  let accepted=true,reason="ok",gain=0,spent=0,kind=""
  const reject=(msg:string)=>{accepted=false;reason=msg}
  const v=operation.validation
  if(!v||!["mj","simulation","system"].includes(v.authority)||typeof v.origin!=="string"||!v.origin.trim())
    throw new Error("Provenance et autorité obligatoires.")
  if(!v.approved)reject("Validation absente.")
  if(accepted&&operation.type==="spend"){
    integer(operation.cost,"Coût");positive(operation.purpose,"Motif");kind=operation.purpose
    if(operation.denialReason)reject(operation.denialReason)
    else if(operation.cost>s.mana)reject("Mana insuffisant.")
    else{s.mana-=operation.cost;spent=operation.cost}
  } else if(accepted&&operation.type==="recover"){
    const rest=operation.rest
    kind=operation.kind
    if(!rest||typeof rest.restId!=="string"||!rest.restId.trim())throw new Error("Période de repos obligatoire.")
    if(!Object.hasOwn(s.policy.rates,operation.kind))throw new Error("Pratique inconnue.")
    if(s.restIds.includes(rest.restId))reject("Période déjà utilisée ou interrompue.")
    else if(rest.interrupted||!rest.completed)reject("Repos inachevé ou interrompu.")
    else if(!rest.safe)reject("Absence de sûreté attestée.")
    else if((operation.kind==="shortDeep"||operation.kind==="shortRitual"||operation.kind==="longRetreat")&&!rest.focused)
      reject("Pratique structurée absente.")
    else if((operation.kind==="shortRitual"||operation.kind==="longRetreat")&&
      (!rest.exceptionalApproved||v.authority!=="mj"))reject("Condition exceptionnelle non approuvée par le MJ.")
    else if(operation.kind==="shortFirst"&&s.shortCount!==0)reject("Premier repos déjà effectué.")
    else if(operation.kind==="shortSecond"&&s.shortCount!==1)reject("Second repos sans premier repos valide.")
    else if(operation.kind.startsWith("short")&&s.shortCount>=2)reject("Deux repos courts au maximum.")
    if(accepted){
      s.restIds.push(rest.restId)
      if(operation.kind.startsWith("short"))s.shortCount++
      s.dayRate=Math.max(s.dayRate,s.policy.rates[operation.kind])
      gain=Math.min(s.manaMax-s.mana,Math.max(0,dailyCeiling(s)-s.recoveredToday))
      s.mana+=gain;s.recoveredToday+=gain
    }
  } else if(accepted&&operation.type==="interrupt"){
    positive(operation.restId,"Période interrompue");kind=operation.restId
    if(s.restIds.includes(operation.restId))reject("Période déjà finalisée.")
    else s.restIds.push(operation.restId)
  } else if(accepted&&operation.type==="changeMax"){
    integer(operation.manaMax,"Nouveau maximum");kind="cap-change"
    s.manaMax=operation.manaMax
    s.mana=Math.min(s.mana,s.manaMax)
    // Le budget déjà consommé ne diminue pas avec la réserve maximale.
  } else if(accepted&&operation.type==="nextDay"){
    positive(operation.nextDay,"Nouvelle journée");kind=operation.nextDay
    if(operation.nextDay===s.dayKey)reject("Même journée.")
    else {
      // Seules les fractions d'un plafond réellement consommé sont reportées.
      const basis=BigInt(s.dayBaseMax)*BigInt(s.dayRate),scale=BigInt(RATE_SCALE)
      const fraction=(s.recoveredToday>=dailyCeiling(s)&&s.dayRate>0)?Number(basis%scale):0
      if(s.policy.rounding==="exactCarry")s.carryUnits=fraction?Number((basis+BigInt(s.carryUnits))%scale):0
      else s.cycleUnits=s.dayIndex%2===0?fraction:0
      s.dayIndex++;s.dayKey=operation.nextDay;s.dayBaseMax=s.manaMax
      s.dayRate=0;s.recoveredToday=0;s.shortCount=0;s.restIds=[]
    }
  }
  const entry:ManaEvent={id:operation.id,characterId:source.characterId,dayKey:source.dayKey,
    type:operation.type,kind,before,after:s.mana,gain,spent,budgetBefore,budgetAfter:s.recoveredToday,
    policyId:s.policy.id,policyVersion:s.policy.version,validation:clone(v),accepted,reason}
  s.journal.push(entry)
  validateManaState(s)
  return {state:s,entry,duplicate:false}
}
export function validateManaState(raw:ManaState):void{
  if(!raw||raw.schema!==MANA_SCHEMA)throw new Error("Schéma de sauvegarde incompatible.")
  positive(raw.characterId,"Personnage");positive(raw.dayKey,"Journée")
  validateManaPolicy(raw.policy)
  for(const [k,n] of Object.entries({dayIndex:raw.dayIndex,mana:raw.mana,manaMax:raw.manaMax,
    dayBaseMax:raw.dayBaseMax,dayRate:raw.dayRate,recoveredToday:raw.recoveredToday,
    carryUnits:raw.carryUnits,cycleUnits:raw.cycleUnits,shortCount:raw.shortCount}))integer(n,k)
  if(raw.mana>raw.manaMax||raw.dayRate>RATE_SCALE||raw.shortCount>2||
    raw.carryUnits>=RATE_SCALE||raw.cycleUnits>=RATE_SCALE||
    raw.recoveredToday>dailyCeiling(raw))throw new Error("Registre mana incohérent.")
  if(!Array.isArray(raw.restIds)||new Set(raw.restIds).size!==raw.restIds.length||
    raw.restIds.some(id=>typeof id!=="string"||!id.trim()))throw new Error("Repos incohérents.")
  if(!Array.isArray(raw.journal)||new Set(raw.journal.map(e=>e.id)).size!==raw.journal.length||
    raw.journal.some(e=>!e.id||e.characterId!==raw.characterId||!Number.isSafeInteger(e.after)||
      e.after<0||e.gain<0||e.spent<0||!e.policyVersion||!e.validation?.origin))
    throw new Error("Journal transactionnel invalide.")
}
export function exportManaState(s:ManaState):string{validateManaState(s);return JSON.stringify(s)}
export function importManaState(json:string):ManaState{
  const s=JSON.parse(json) as ManaState;validateManaState(s);return clone(s)
}
export type CostTier="minor"|"significant"|"major"
export function magicCost(tier:CostTier,manaMax:number,model:"C"|"intensity"|"fixed"="C",intensityBasis?:number):number{
  integer(manaMax,"Maximum")
  if(!["minor","significant","major"].includes(tier))throw new Error("Catégorie inconnue.")
  if(model==="fixed")return {minor:2,significant:4,major:16}[tier]
  if(model!=="C"&&model!=="intensity")throw new Error("Modèle inconnu.")
  let basis=manaMax
  if(model==="intensity"){
    if(intensityBasis===undefined)throw new Error("Intensité choisie obligatoire.")
    integer(intensityBasis,"Intensité",1)
    if(intensityBasis>manaMax)throw new Error("Intensité supérieure à la réserve.")
    basis=intensityBasis
  }
  const ceilPercent=(rate:number)=>Number((BigInt(basis)*BigInt(rate)+99n)/100n)
  return tier==="minor"?2:tier==="significant"?Math.max(4,ceilPercent(12)):
    Math.max(8,ceilPercent(25))
}
