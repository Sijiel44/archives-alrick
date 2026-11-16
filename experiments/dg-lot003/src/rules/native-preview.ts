/**
 * L003-RULES — passerelle provisoire, pure, sans nouvelle équation 5d6.
 * Source officielle figée pour ce prototype : main@88f774f3d0d6d520d8d11443b72202b9caf4f94b.
 * Ne pas utiliser pour un débit, une mutation de fiche ni une autorisation réseau.
 */
import {resolveProgressionAction,progressionAtLevel} from "../../../../quartz/components/scripts/atelier5d6-progression"
import {resolveCombatM03,validateM03AbilityEffect} from "../../../../quartz/components/scripts/atelier5d6-combat-m03"
import type {Action} from "../../../../quartz/components/scripts/atelier5d6-progression"
import type {CombatM03Input,M03Effect} from "../../../../quartz/components/scripts/atelier5d6-combat-m03"
import type {AbilityDefinition} from "../../../../quartz/components/scripts/atelier5d6-m02"

export const RULES_PREVIEW_VERSION="cer.rules.dg003.provisional.v0" as const
export type RulesActor="pj"|"creature"
export type RulesEffectCandidate={
  source:"m02-ability"
  ability:AbilityDefinition
  proposal:M03Effect
}
export type RulesProgressionRequest={
  kind:"progression"; actor:RulesActor; action:Action
}
export type RulesCombatRequest={
  kind:"combat"; actor:RulesActor
  /** Entrées natives M03, sans effects pré-approuvés. */
  combat:Omit<CombatM03Input,"effects">
  /** Seul ce chemin permet une autorisation numérique, via le validateur M03. */
  effects?:readonly RulesEffectCandidate[]
}
export type RulesPreviewRequest=RulesProgressionRequest|RulesCombatRequest
export type RulesPreview=
 |{status:"ok";version:typeof RULES_PREVIEW_VERSION;engine:"M01"|"M03";actor:RulesActor;
    appliedEffects:readonly {abilityId:string;kind:string;magnitude:number;duration:number;trigger:string}[];
    result:ReturnType<typeof resolveProgressionAction>|ReturnType<typeof resolveCombatM03>;applied:false}
 |{status:"unavailable"|"rejected";version:typeof RULES_PREVIEW_VERSION;
    code:string;reason:string;applied:false}

const unavailable=(code:string,reason:string):RulesPreview=>({status:"unavailable",version:RULES_PREVIEW_VERSION,code,reason,applied:false})
const rejected=(code:string,reason:string):RulesPreview=>({status:"rejected",version:RULES_PREVIEW_VERSION,code,reason,applied:false})
const isRecord=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==="object"&&!Array.isArray(v)
const onlyKeys=(v:Record<string,unknown>,keys:readonly string[])=>Object.keys(v).every(k=>keys.includes(k))
const allowedCombatKeys=["natural","rawStat","masteryRank","situation","level","difficulty","kind","mode","defender","feasible","baseDamage","penetration","mjMinimum","affinityBonus"] as const
const allowedEffectKeys=["source","ability","proposal"] as const
const allowedProposalKeys=["abilityId","kind","magnitude","duration","trigger"] as const
const allowedAbilitySourceKinds=["m02-ability"] as const
const allowedCombatModes=["melee","tir","magie","mental"] as const
const allowedResistanceKinds=["physique","magie","mental"] as const
const validLevel=(value:unknown):value is number=>
  typeof value==="number"&&Number.isSafeInteger(value)&&value>=1&&value<=25

/**
 * Prévisualisation pour injection UI : aucune mutation, aucun débit, aucun état persistant.
 * `actor` est informatif : PJ et créature empruntent strictement la même fonction M03.
 * Toute capacité numérique requiert `validateM03AbilityEffect(ability, proposal)`.
 * Les effets de même catégorie/déclencheur sont NON CUMULATIFS par le M03 officiel.
 * `status !== 'ok'` : ne jamais afficher un dommage comme homologué.
 */
export function previewNativeRules(request:unknown):RulesPreview {
  if(!isRecord(request))return rejected("INVALID_REQUEST","Requête de prévisualisation non structurée.")
  if(request.kind==="math002"||request.kind==="authority"||request.kind==="level-25-plus")
    return unavailable("MATH002_UNHOMOLOGATED","MATH-002 et Autorités 25+ non adoptées.")
  if(request.kind==="numeric-object"||request.kind==="item-effect")
    return unavailable("NUMERIC_ITEM_UNHOMOLOGATED","Aucun validateur natif d'objet numérique homologué.")
  if(request.kind==="resource-operation"||request.kind==="mana-debit"||request.kind==="charge-debit")
    return unavailable("RESOURCE_DEBIT_UNAVAILABLE","Aucun débit de mana ou de charge n'est autorisé dans la passerelle.")
  if(request.kind!=="combat"&&request.kind!=="progression")
    return unavailable("UNSUPPORTED_FAMILY","Aucun moteur natif autorisé pour cette famille.")
  if(request.actor!=="pj"&&request.actor!=="creature")
    return rejected("INVALID_ACTOR","L'origine doit être 'pj' ou 'creature'.")
  if(request.kind==="progression") {
    if(!onlyKeys(request,["kind","actor","action"])||!isRecord(request.action))
      return rejected("INVALID_REQUEST","La prévisualisation M01 ne permet ni options cachées ni ressources.")
    if(!onlyKeys(request.action,["natural","rawStat","masteryRank","situation","threshold","feasible"]))
      return rejected("INVALID_REQUEST","Paramètres M01 non reconnus.")
    if(typeof request.action.feasible!=="boolean")
      return rejected("INVALID_FEASIBLE","Le champ feasible doit être booléen.")
    try {
      const result=resolveProgressionAction(request.action as Action)
      return {status:"ok",version:RULES_PREVIEW_VERSION,engine:"M01",actor:request.actor,
        appliedEffects:[],result,applied:false}
    } catch(e) {return rejected("INVALID_NATIVE_INPUT",e instanceof Error?e.message:"Entrée M01 refusée.")}
  }
  if(!onlyKeys(request,["kind","actor","combat","effects"])||!isRecord(request.combat))
    return rejected("INVALID_REQUEST","Entrée M03 non structurée ou champs non autorisés.")
  if(!onlyKeys(request.combat,allowedCombatKeys))
    return rejected("INJECTED_NATIVE_EFFECT","Injection d'un effet ou d'une ressource native pré-autorisée interdite.")
  // M03 utilise kind/mode dans des branches différentes : le type TS ne valide pas les JSON à l'exécution.
  if(!allowedCombatModes.includes(request.combat.mode as typeof allowedCombatModes[number]))
    return rejected("INVALID_COMBAT_MODE","Mode M03 inconnu (melee, tir, magie, mental).")
  if(!allowedResistanceKinds.includes(request.combat.kind as typeof allowedResistanceKinds[number]))
    return rejected("INVALID_RESISTANCE_KIND","Résistance M03 inconnue (physique, magie, mental).")
  // Le moteur peut ne pas consulter level après un échec ou en mode mental : contrôler en amont.
  if(!validLevel(request.combat.level))
    return rejected("INVALID_LEVEL","Niveau M03 attendu : 1 à 25.")
  if(typeof request.combat.feasible!=="boolean")
    return rejected("INVALID_FEASIBLE","Le champ feasible doit être booléen.")
  if(request.combat.defender!==null&&request.combat.defender!==undefined){
    if(!isRecord(request.combat.defender)||!validLevel(request.combat.defender.level))
      return rejected("INVALID_DEFENDER_LEVEL","Niveau du défenseur attendu : 1 à 25.")
  }
  if(request.effects!==undefined&&!Array.isArray(request.effects))
    return rejected("INVALID_EFFECTS","Les effets doivent former un tableau.")
  const candidates=(request.effects??[]) as unknown[]
  if(candidates.length>16)return rejected("TOO_MANY_EFFECTS","Prévisualisation limitée à 16 effets candidats.")
  const authorized:NonNullable<CombatM03Input["effects"]>[number][]=[]
  for(const candidate of candidates){
    if(!isRecord(candidate)||!onlyKeys(candidate,allowedEffectKeys)||
      !allowedAbilitySourceKinds.includes(candidate.source as "m02-ability")||!isRecord(candidate.proposal))
      return rejected("INVALID_EFFECT_SOURCE","Source d'effet numérique non reconnue.")
    if(!onlyKeys(candidate.proposal,allowedProposalKeys))
      return rejected("FORGED_APPROVAL","N'injectez ni 'approved:true' ni un effet M03 déjà autorisé.")
    if(candidate.proposal.kind==="absorption")
      return unavailable("ABSORPTION_UNHOMOLOGATED","La famille absorption est bloquée en attente de sémantique COMBAT/DG.")
    // Ne jamais confier des champs JSON de type invalide au validateur TS natif :
    // des lectures comme ability.effect?.trim() peuvent sinon lever une exception.
    try {
      if(!isRecord(candidate.ability)||
        typeof candidate.ability.id!=="string"||typeof candidate.ability.status!=="string"||
        typeof candidate.ability.approvedByGM!=="boolean"||
        typeof candidate.ability.rank!=="number"||!Number.isSafeInteger(candidate.ability.rank)||
        typeof candidate.ability.effect!=="string"||
        typeof candidate.ability.limitations!=="string"||
        typeof candidate.ability.description!=="string"||
        typeof candidate.proposal.abilityId!=="string"||
        typeof candidate.proposal.kind!=="string"||
        typeof candidate.proposal.trigger!=="string"||
        typeof candidate.proposal.magnitude!=="number"||
        typeof candidate.proposal.duration!=="number")
        return rejected("INVALID_ABILITY_SHAPE","Capacité M02 ou proposition M03 mal typée.")
      // Seul M03 accorde l'approbation et applique les bornes magnitude 1–2, durée 1–3.
      const approved=validateM03AbilityEffect(candidate.ability as AbilityDefinition,candidate.proposal as M03Effect)
      if(!approved)return rejected("NATIVE_APPROVAL_REQUIRED","validateM03AbilityEffect a refusé la capacité.")
      authorized.push(approved)
    } catch {
      return rejected("INVALID_ABILITY_SHAPE","Validation M03 impossible sur une capacité malformée.")
    }
  }
  try {
    const result=resolveCombatM03({...request.combat as Omit<CombatM03Input,"effects">,effects:authorized})
    return {status:"ok",version:RULES_PREVIEW_VERSION,engine:"M03",actor:request.actor,
      appliedEffects:authorized.map(({abilityId,kind,magnitude,duration,trigger})=>({abilityId,kind,magnitude,duration,trigger})),
      result,applied:false}
  } catch(e) {return rejected("INVALID_NATIVE_INPUT",e instanceof Error?e.message:"Entrée M03 refusée.")}
}

/** Adaptateur minimal : retour direct de `progressionAtLevel` officiel, niveaux 1–25 uniquement. */
export function previewNativeProgressionLevel(level:number){return progressionAtLevel(level)}
