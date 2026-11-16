/**
 * M03 — calcul pur des confrontations M01/M02 (5d6).
 * Le moteur historique reste disponible pour les fiches legacy.
 * Aucune mutation de fiche, aucune autorité narrative automatique.
 */
import {effectiveStat,effectiveMastery} from "./atelier5d6-progression"
import type {AbilityDefinition} from "./atelier5d6-m02"
import type {DefenseProfile,ImpactMode,ResistanceKind} from "./atelier5d6-opposition"

export type M03EffectKind="precision"|"defense"|"absorption"|"impact"|"penetration"
export type M03Effect={
  abilityId:string;kind:M03EffectKind;magnitude:number;duration:number;trigger:"attaque"|"defense"
}
export type AuthorizedM03Effect=M03Effect & {approved:true}
export type CombatM03Input={
  natural:number;rawStat:number;masteryRank:number;situation:number;level:number
  difficulty:number;kind:ResistanceKind;mode:ImpactMode
  defender?:DefenseProfile|null;feasible:boolean
  baseDamage:number;penetration?:number;mjMinimum?:number;affinityBonus?:number
  effects?:readonly AuthorizedM03Effect[]
}
export type CombatM03Result={
  natural:number;statBonus:number;masteryBonus:number;total:number
  threshold:number;defense:number;gap:number;numericSuccess:boolean;feasible:boolean
  success:boolean;criticalFailure:boolean;criticalPotential:boolean
  glancing:boolean;contact:boolean;grossDamage:number;protection:number
  penetrated:number;absorbed:number;damage:number;effectProposed:boolean
  reaction:"aucune"|"defense"|"riposte_possible"
}

const safe=(n:number,low:number,high:number,label:string):number=>{
  if(!Number.isSafeInteger(n)||n<low||n>high)throw new RangeError(label+" hors limites")
  return n
}
const bonus=(n:unknown,high:number,label:string):number=>safe(n as number,0,high,label)
const stat=(n:number):number=>effectiveStat(safe(n,1,Number.MAX_SAFE_INTEGER,"Caractéristique"))
const mastery=(n:number):number=>effectiveMastery(safe(n,0,Number.MAX_SAFE_INTEGER,"Maîtrise"))
const levels=(n:number)=>safe(n,1,25,"Niveau")
const grades=[0,1,2,3,5,7] as const

/** Sélection du meilleur entraînement DÉFENSIF, une seule maîtrise comptabilisée. */
export function defenseMasteryM03(sheet:DefenseProfile,kind:ResistanceKind):number{
  const names=kind==="physique"?["esquive","parade","lames","haches","arcs"]
    :kind==="magie"?["resistance_magique","runes","magie"]
    :["volonte","negociation"]
  return Math.max(...names.map(name=>bonus(sheet.masteries?.[name]??0,Number.MAX_SAFE_INTEGER,"Maîtrise défensive")))
}
export function resistanceScoreM03(sheet:DefenseProfile,kind:ResistanceKind):number{
  const relevant=kind==="physique"?Math.max(sheet.stats.physique,sheet.stats.agilite)
    :kind==="magie"?sheet.stats.esprit:Math.max(sheet.stats.esprit,sheet.stats.presence)
  // Ni niveau, ni armure, ni maîtrise d'attaque ne se cumulent une seconde fois.
  return 15+stat(relevant)+mastery(defenseMasteryM03(sheet,kind))+
    bonus(sheet.resistanceBonus?.[kind]??0,8,"Bonus de défense MJ")
}
export function innateProtectionM03(level:number,kind:ResistanceKind):number{
  const base=Math.floor((levels(level)-1)/6)
  return kind==="physique"?base:kind==="magie"?Math.floor(base/2):0
}
export function equipmentProtectionM03(grade:number,kind:ResistanceKind):number{
  const base=grades[safe(grade,0,5,"Grade d'équipement")]
  return kind==="physique"?base:kind==="magie"?Math.floor(base*.6):0
}
export function effectiveProtectionM03(sheet:DefenseProfile,kind:ResistanceKind):number{
  const extra=bonus(sheet.protection?.[kind]??0,60,"Protection MJ")
  // Rendement décroissant et borne sur la seule protection additionnelle.
  const contextual=Math.min(6,Math.floor(3*Math.log2(1+extra/3)))
  return innateProtectionM03(sheet.level,kind)+
    equipmentProtectionM03(sheet.equipmentGrades?.[kind]??0,kind)+contextual
}
export function impactBonusM03(level:number):number{
  return Math.floor(levels(level)*.7)
}
/** Un texte narratif n'est jamais interprété comme un effet numérique. */
export function validateM03AbilityEffect(ability:AbilityDefinition|null|undefined,
  proposal:M03Effect|null|undefined):AuthorizedM03Effect|null{
  if(!ability||!proposal||ability.status!=="defined"||!ability.approvedByGM||
    !ability.effect?.trim()||!ability.limitations?.trim()||!ability.description?.trim()||
    proposal.abilityId!==ability.id||!ability.id.trim()||!Number.isSafeInteger(ability.rank)||
    ability.rank<1)return null
  if(!(["precision","defense","absorption","impact","penetration"] as string[]).includes(proposal.kind)||
    !["attaque","defense"].includes(proposal.trigger)||
    !Number.isSafeInteger(proposal.magnitude)||proposal.magnitude<1||proposal.magnitude>2||
    !Number.isSafeInteger(proposal.duration)||proposal.duration<1||proposal.duration>3)return null
  if((proposal.kind==="defense"||proposal.kind==="absorption")!==(proposal.trigger==="defense"))return null
  return {...proposal,approved:true}
}
function effectSum(effects:readonly AuthorizedM03Effect[],kind:M03EffectKind,trigger:"attaque"|"defense"):number{
  // Les effets ne s'empilent pas : plus fort bonus reconnu, max 2.
  return Math.max(0,...effects.filter(e=>e?.approved===true&&e.kind===kind&&e.trigger===trigger
    &&Number.isSafeInteger(e.magnitude)&&e.magnitude>=1&&e.magnitude<=2
    &&Number.isSafeInteger(e.duration)&&e.duration>=1&&e.duration<=3).map(e=>e.magnitude))
}
export function resolveCombatM03(a:CombatM03Input):CombatM03Result{
  const natural=safe(a.natural,5,30,"Jet naturel")
  const situation=safe(a.situation,-2,2,"Situation")
  const difficulty=safe(a.difficulty,15,30,"Difficulté")
  const minimum=safe(a.mjMinimum??0,0,45,"Seuil MJ")
  const statBonus=stat(a.rawStat),masteryBonus=mastery(a.masteryRank)
  const effects=a.effects??[]
  const precision=effectSum(effects,"precision","attaque")
  const defending=effectSum(effects,"defense","defense")
  const total=natural+statBonus+masteryBonus+situation+precision
  const defense=a.defender?resistanceScoreM03(a.defender,a.kind)+defending:0
  const threshold=Math.max(difficulty,minimum,defense)
  const criticalFailure=natural<=7
  const feasible=a.feasible===true
  const numericSuccess=!criticalFailure&&total>=threshold
  const success=feasible&&numericSuccess
  const criticalPotential=natural>=27
  // Un contact spectaculaire n'ignore jamais une impossibilité narrative.
  const glancing=feasible&&!success&&!criticalFailure&&criticalPotential&&
    a.mode!=="mental"&&total>=difficulty
  const contact=success||glancing
  const baseDamage=safe(a.baseDamage,1,12,"Dégâts de base")
  const extra=safe(a.affinityBonus??0,0,10,"Bonus d'affinité")
  const penetration=safe(a.penetration??0,0,8,"Pénétration")
  const impact=effectSum(effects,"impact","attaque")
  const pierce=effectSum(effects,"penetration","attaque")
  // Mental : réussite narrative exclusivement, aucun PV en l'absence de règle spécifique.
  const grossDamage=success&&a.mode!=="mental"?
    baseDamage+impactBonusM03(a.level)+masteryBonus+impact+
    (a.mode==="magie"?extra:0):0
  const protection=a.defender?effectiveProtectionM03(a.defender,a.kind):0
  const penetrated=Math.min(protection,penetration+pierce)
  const absorbed=Math.min(grossDamage,Math.max(0,protection-penetrated))
  const damage=success?grossDamage-absorbed:0
  const gap=threshold-total
  return {natural,statBonus,masteryBonus,total,threshold,defense,gap:Math.max(0,gap),
    numericSuccess,feasible,success,criticalFailure,criticalPotential,glancing,contact,
    grossDamage,protection,penetrated,absorbed,damage,effectProposed:success&&a.mode==="mental",
    reaction:contact||criticalFailure?"aucune":gap>=5?"riposte_possible":"defense"}
}


/**
 * MATH-REF-002A — Extension expérimentale, opt-in, du résolveur M03.
 *
 * Cette projection réutilise resolveCombatM03 pour le jet, l'opposition et
 * l'impact initial. Les consommateurs historiques continuent d'appeler
 * resolveCombatM03 sans aucune modification de leur contrat ni de leurs PV.
 *
 * La provenance et les habilitations doivent être vérifiées par INDEX/MJ
 * AVANT de construire M03AuthorizedIntensity et les AuthorizedM03Effect.
 * Un approved:true reçu d'un import non fiable n'est pas une autorisation.
 */
export type M03AuthorizedIntensity={
  tier:"mineure"|"courante"|"majeure"
  approved:true
  definitionId:string
  version:number
}
export type M03UnifiedInput=CombatM03Input & {
  /** Autorisation de définition vérifiée hors M03 ; jamais déduite du texte. */
  intensity?:M03AuthorizedIntensity|null
  /** Activation réservée à la voie expérimentale, sans effet sur le legacy. */
  applySpecialAbsorption?:boolean
  /** Sur naturel 27–30 ET touche réussie, choix non automatique. */
  heroicChoice?:"impact"|"tactique"|null
}
export type M03UnifiedResult=CombatM03Result & {
  /** Coefficient offensif divin appliqué après l'impact M03, avant armure. */
  intensityMultiplier:number
  /** Absorption additionnelle post-protection ; ne change pas penetrated. */
  specialAbsorption:number
  /** Le bénéfice tactique reste une proposition à valider/appliquer côté MJ. */
  heroicBenefit:"impact"|"tactique"|null
}

/** Règle divine offensive seulement. Aucun bonus divin universel automatique. */
export function divineOffensiveMultiplierM03(
  level:number,tier:"mineure"|"courante"|"majeure",
):number{
  const l=levels(level)
  if(!["mineure","courante","majeure"].includes(tier))throw new RangeError("Intensité inconnue")
  if(tier==="mineure"||l<=20)return 1
  const current=[1.25,1.30,1.35,1.40,1.50] as const
  const major=[1.50,1.60,1.70,1.80,2.00] as const
  return tier==="courante"?current[l-21]:major[l-21]
}

/**
 * Un moteur M03, une seule résolution 5d6, aucun second jet.
 * Appliquer ensuite confirmation MJ, ressources et sauvegarde dans le Studio,
 * jamais dans cette fonction pure.
 */
export function resolveUnifiedCombatM03(a:M03UnifiedInput):M03UnifiedResult{
  // La validation est réalisée même si l'action échoue, pour rendre les
  // incohérences d'adaptateur reproductibles en recette.
  const intensity=a.intensity??null
  if(intensity){
    if(intensity.approved!==true||typeof intensity.definitionId!=="string"||
      !intensity.definitionId.trim())throw new RangeError("Intensité sans autorisation de définition")
    safe(intensity.version,1,Number.MAX_SAFE_INTEGER,"Version d'intensité")
    if(!["mineure","courante","majeure"].includes(intensity.tier))
      throw new RangeError("Intensité inconnue")
  }
  if(a.heroicChoice!=null&&!["impact","tactique"].includes(a.heroicChoice))
    throw new RangeError("Choix héroïque inconnu")
  const base=resolveCombatM03(a)
  // L'échec, l'impossibilité et le mental n'occasionnent aucun PV.
  if(!base.success||a.mode==="mental")return {
    ...base,intensityMultiplier:1,specialAbsorption:0,heroicBenefit:null,
  }
  const k=intensity?divineOffensiveMultiplierM03(a.level,intensity.tier):1
  // Le moteur M03 a déjà compté l'affinité dans grossDamage : on la
  // retranche avant le multiplicateur puis on la réintègre UNE fois après.
  const affinity=a.mode==="magie"?(a.affinityBonus??0):0
  const impactBeforeMultiplier=base.grossDamage-affinity
  let grossDamage=Math.floor(impactBeforeMultiplier*k)+affinity
  const heroic=base.natural>=27?(a.heroicChoice??null):null
  if(heroic==="impact"){
    // Maximum d'une seule source d'impact 2. Supplément APRÈS k :
    // pas de multiplication/divinisation automatique du critique.
    const alreadyBestImpact=effectSum(a.effects??[],"impact","attaque")
    grossDamage+=Math.max(0,2-alreadyBestImpact)
  }
  // La pénétration concerne seulement la protection (jamais l'absorption).
  const armorAbsorbed=Math.min(grossDamage,Math.max(0,base.protection-base.penetrated))
  const specialAbsorption=a.applySpecialAbsorption===true?
    Math.min(grossDamage-armorAbsorbed,
      effectSum(a.effects??[],"absorption","defense")):0
  return {...base,grossDamage,absorbed:armorAbsorbed,
    damage:Math.max(0,grossDamage-armorAbsorbed-specialAbsorption),
    intensityMultiplier:k,specialAbsorption,heroicBenefit:heroic}
}
