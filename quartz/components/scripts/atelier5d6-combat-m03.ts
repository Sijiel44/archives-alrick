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
  natural:number;rawStat:number;masteryRank:number;situation:number
  difficulty:number;kind:ResistanceKind;mode:ImpactMode
  defender?:DefenseProfile|null;feasible:boolean
  baseDamage:number;penetration?:number;mjMinimum?:number;affinityBonus?:number
  effects?:readonly AuthorizedM03Effect[]
}
export type CombatM03Result={
  natural:number;statBonus:number;masteryBonus:number;total:number
  threshold:number;defense:number;numericSuccess:boolean;feasible:boolean
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
    baseDamage+impactBonusM03(a.defender?.level??1)+masteryBonus+impact+
    (a.mode==="magie"?extra:0):0
  const protection=a.defender?effectiveProtectionM03(a.defender,a.kind):0
  const penetrated=Math.min(protection,penetration+pierce)
  const absorbed=Math.min(grossDamage,Math.max(0,protection-penetrated))
  const damage=success?grossDamage-absorbed:0
  const gap=threshold-total
  return {natural,statBonus,masteryBonus,total,threshold,defense,
    numericSuccess,feasible,success,criticalFailure,criticalPotential,glancing,contact,
    grossDamage,protection,penetrated,absorbed,damage,effectProposed:success&&a.mode==="mental",
    reaction:contact||criticalFailure?"aucune":gap>=5?"riposte_possible":"defense"}
}
