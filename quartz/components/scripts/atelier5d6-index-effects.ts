/**
 * INDEX-EFF-002 — passerelle expérimentale de provenance et d'habilitation.
 *
 * Les fiches, exports et catalogues sont des données NON fiables.
 * Un drapeau imported approved:true ne devient jamais une permission.
 * Les approbations sont tenues en mémoire pour une séance locale du MJ ;
 * elles ne sont pas restaurées à partir d'un simple JSON.
 * Aucun débit, aucune sauvegarde et aucune mutation de PV ici.
 */
import {resolveUnifiedCombatM03} from "./atelier5d6-combat-m03"
import type {AuthorizedM03Effect,CombatM03Input,M03EffectKind,
  M03AuthorizedIntensity,M03UnifiedResult} from "./atelier5d6-combat-m03"

export type IndexReferenceType="ability"|"spell"|"object"|"ritual"|"creature"|"ordinary"
export type IndexEffectReference={type:IndexReferenceType;id:string;revision:number}
export type IndexEffectSpec={
  kind:M03EffectKind;magnitude:number;duration:number;trigger:"attaque"|"defense"
}
export type IndexEffectDefinition={
  reference:IndexEffectReference
  provenance:string
  effect:IndexEffectSpec|null
  intensityEligible:boolean
}
export type IndexResolveRequest={
  action:CombatM03Input
  attackerId:string
  defenderId?:string|null
  attackRefs?:readonly unknown[]
  defenseRefs?:readonly unknown[]
  intensityRef?:unknown
  intensityTier?:"mineure"|"courante"|"majeure"
  heroicChoice?:"impact"|"tactique"|null
}
export type IndexResolveResponse={
  result:M03UnifiedResult
  used:IndexEffectReference[]
  blocked:IndexEffectReference[]
  /** Justificatif historique de calcul : jamais une permission future. */
  proof:IndexM03ResolutionProof
}
export type IndexM03ResolutionProof={
  version:1
  effects:readonly AuthorizedM03Effect[]
  intensity:Readonly<M03AuthorizedIntensity>|null
  heroicChoice:"impact"|"tactique"|null
}

const types=["ability","spell","object","ritual","creature","ordinary"] as const
const kinds=["precision","defense","absorption","impact","penetration"] as const
const isObject=(v:unknown):v is Record<string,unknown> =>
  !!v&&typeof v==="object"&&!Array.isArray(v)&&
  (Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null)
const identifier=(v:unknown,label:string):string=>{
  if(typeof v!=="string"||!/^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(v))
    throw new Error(label+" invalide")
  return v
}
export function indexReferenceM03(raw:unknown):IndexEffectReference{
  if(!isObject(raw)||!types.includes(raw.type as IndexReferenceType))
    throw new Error("Famille de référence inconnue")
  const id=identifier(raw.id,"ID de référence")
  if(!Number.isSafeInteger(raw.revision)||Number(raw.revision)<1||
    Number(raw.revision)>1000000)throw new Error("Révision invalide")
  return Object.freeze({type:raw.type as IndexReferenceType,id,revision:Number(raw.revision)})
}
const key=(ref:IndexEffectReference)=>ref.type+":"+ref.id+"@"+ref.revision
const ownerKey=(holder:string,ref:IndexEffectReference)=>holder+"|"+key(ref)
const validProofEffect=(raw:unknown):raw is AuthorizedM03Effect=>{
  if(!isObject(raw)||Object.keys(raw).sort().join(",")!==
    "abilityId,approved,duration,kind,magnitude,trigger"||raw.approved!==true||
    typeof raw.abilityId!=="string"||
    !/^(ability|spell|object|ritual|creature|ordinary):[A-Za-z0-9][A-Za-z0-9:_-]{0,127}@[1-9][0-9]{0,5}$/.test(raw.abilityId)||
    !kinds.includes(raw.kind as M03EffectKind)||
    !["attaque","defense"].includes(raw.trigger as string)||
    !Number.isSafeInteger(raw.magnitude)||Number(raw.magnitude)<1||
    Number(raw.magnitude)>2||!Number.isSafeInteger(raw.duration)||
    Number(raw.duration)<1||Number(raw.duration)>3)return false
  return (["defense","absorption"].includes(raw.kind as string)===
    (raw.trigger==="defense"))
}
/** Rejoue un évènement passé ; NE confère jamais le droit d'utiliser un effet. */
export function replayIndexM03Proof(action:CombatM03Input,raw:unknown):M03UnifiedResult{
  if(!isObject(raw)||Object.keys(raw).sort().join(",")!==
    "effects,heroicChoice,intensity,version"||raw.version!==1||
    !Array.isArray(raw.effects)||raw.effects.length>50||
    !raw.effects.every(validProofEffect)||
    !(raw.heroicChoice===null||raw.heroicChoice==="impact"||raw.heroicChoice==="tactique"))
    throw new Error("Justificatif historique M03 invalide")
  const intensity=raw.intensity
  if(intensity!==null&&(!isObject(intensity)||
    Object.keys(intensity).sort().join(",")!=="approved,definitionId,tier,version"||
    intensity.approved!==true||
    typeof intensity.definitionId!=="string"||
    !/^(ability|spell|object|ritual|creature|ordinary):[A-Za-z0-9][A-Za-z0-9:_-]{0,127}@[1-9][0-9]{0,5}$/.test(intensity.definitionId)||
    !Number.isSafeInteger(intensity.version)||Number(intensity.version)<1||
    Number(intensity.version)>1000000||
    !["mineure","courante","majeure"].includes(intensity.tier as string)))
    throw new Error("Justificatif d'intensité invalide")
  const effects=raw.effects.map(e=>({...e})) as AuthorizedM03Effect[]
  const validatedIntensity=intensity as M03AuthorizedIntensity|null
  return resolveUnifiedCombatM03({...action,effects,intensity:validatedIntensity,
    applySpecialAbsorption:effects.some(e=>e.kind==="absorption"),
    heroicChoice:raw.heroicChoice})
}
const checkedDefinition=(raw:unknown):IndexEffectDefinition=>{
  if(!isObject(raw))throw new Error("Définition absente")
  const ref=indexReferenceM03(raw.reference)
  if(typeof raw.provenance!=="string"||!raw.provenance.trim()||
    raw.provenance.length>200)throw new Error("Provenance absente")
  if(raw.intensityEligible!==undefined&&typeof raw.intensityEligible!=="boolean")
    throw new Error("Éligibilité d'intensité invalide")
  let effect:IndexEffectSpec|null=null
  if(raw.effect!==null&&raw.effect!==undefined){
    if(!isObject(raw.effect))throw new Error("Effet mal formé")
    const e=raw.effect
    if(!kinds.includes(e.kind as M03EffectKind)||
      !["attaque","defense"].includes(e.trigger as string)||
      !Number.isSafeInteger(e.magnitude)||Number(e.magnitude)<1||
      Number(e.magnitude)>2||!Number.isSafeInteger(e.duration)||
      Number(e.duration)<1||Number(e.duration)>3||
      (["defense","absorption"].includes(e.kind as string)!==(e.trigger==="defense")))
      throw new Error("Effet M03 non homologable")
    effect=Object.freeze({kind:e.kind as M03EffectKind,
      magnitude:Number(e.magnitude),duration:Number(e.duration),
      trigger:e.trigger as "attaque"|"defense"})
  }
  // État / approvedByGM / approved importés expressément ignorés.
  return Object.freeze({reference:ref,provenance:raw.provenance,
    effect,intensityEligible:raw.intensityEligible===true})
}

/**
 * Session locale à construire dans le contrôleur MJ, jamais en désérialisant
 * l'objet d'une campagne. approveForHolder correspond à une confirmation
 * humaine explicite (l'identité du MJ appartient au contrôleur Studio).
 */
export function createIndexM03Session(){
  const catalog=new Map<string,IndexEffectDefinition>()
  const authorizations=new Set<string>()
  const imported=(raw:unknown):IndexEffectReference=>{
    const def=checkedDefinition(raw)
    catalog.set(key(def.reference),def)
    // Nouvelle importation/révision : ne pas transférer silencieusement
    // les validations précédentes de cette définition.
    for(const grant of authorizations)
      if(grant.endsWith("|"+key(def.reference)))authorizations.delete(grant)
    return def.reference
  }
  const approved=(holderId:string,ref:IndexEffectReference)=>
    authorizations.has(ownerKey(holderId,ref))&&catalog.has(key(ref))
  const resolve=(request:IndexResolveRequest):IndexResolveResponse=>{
    const attackerId=identifier(request.attackerId,"Acteur")
    const defenderId=request.defenderId==null?null:identifier(request.defenderId,"Défenseur")
    const used:IndexEffectReference[]=[],blocked:IndexEffectReference[]=[]
    const effects:AuthorizedM03Effect[]=[]
    const assemble=(refs:readonly unknown[],holder:string|null,trigger:"attaque"|"defense")=>{
      if(refs.length>50)throw new Error("Trop d'effets à évaluer")
      for(const raw of refs){
        const ref=indexReferenceM03(raw),def=catalog.get(key(ref))
        if(!holder||!def||!approved(holder,ref)){
          blocked.push(ref);continue
        }
        used.push(ref)
        if(def.effect&&def.effect.trigger===trigger){
          effects.push({...def.effect,abilityId:key(ref),approved:true})
        }
      }
    }
    assemble(request.attackRefs??[],attackerId,"attaque")
    assemble(request.defenseRefs??[],defenderId,"defense")
    let intensity:M03AuthorizedIntensity|null=null
    if(request.intensityRef!==undefined&&request.intensityRef!==null){
      const ref=indexReferenceM03(request.intensityRef),def=catalog.get(key(ref))
      if(def&&approved(attackerId,ref)&&def.intensityEligible){
        if(!request.intensityTier)throw new Error("Intensité à sélectionner")
        intensity={tier:request.intensityTier,definitionId:key(ref),
          version:ref.revision,approved:true}
        used.push(ref)
      }else blocked.push(ref)
    }
    // IMPORTANT : les effets ou permissions inclus dans request.action
    // sont systématiquement REMPLACÉS par les autorisations de cette session.
    const result=resolveUnifiedCombatM03({...request.action,effects,
      intensity,applySpecialAbsorption:effects.some(e=>e.kind==="absorption"),
      heroicChoice:request.heroicChoice??null})
    const proof:IndexM03ResolutionProof=Object.freeze({version:1,
      effects:Object.freeze(effects.map(e=>Object.freeze({...e}))),
      intensity:intensity?Object.freeze({...intensity}):null,
      heroicChoice:request.heroicChoice??null})
    return {result,used,blocked,proof}
  }
  return Object.freeze({
    importDefinition:imported,
    approveForHolder(rawRef:unknown,rawHolder:unknown,confirmedByGM:boolean){
      if(confirmedByGM!==true)throw new Error("Confirmation locale MJ exigée")
      const holder=identifier(rawHolder,"Détenteur"),ref=indexReferenceM03(rawRef)
      if(!catalog.has(key(ref)))throw new Error("Définition inconnue")
      authorizations.add(ownerKey(holder,ref))
      return true
    },
    revokeForHolder(rawRef:unknown,rawHolder:unknown){
      const ref=indexReferenceM03(rawRef),holder=identifier(rawHolder,"Détenteur")
      authorizations.delete(ownerKey(holder,ref))
    },
    resolve,
  })
}
