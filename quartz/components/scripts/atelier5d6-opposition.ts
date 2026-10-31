/**
 * Opposition 5d6 : prototype de jeu indépendant des pouvoirs canoniques d'Alrick.
 * Toucher ≠ percer la résistance ≠ blesser. Une prouesse de précision peut effleurer
 * une entité inaccessible sans lui imposer de dégâts ou d'effet magique.
 */
export type ResistanceKind = "physique" | "magie" | "mental"
export type ImpactMode = "melee" | "tir" | "magie" | "mental"
export type DefenseProfile = {
  stats:{physique:number;agilite:number;esprit:number;presence:number}
  level:number
  masteries:Record<string,number>
  resistanceBonus:Record<ResistanceKind,number>
  protection:Record<ResistanceKind,number>
  equipmentGrades?:Record<ResistanceKind,number>
}
export type OppositionResult = {
  threshold:number
  success:boolean
  contact:boolean
  glancing:boolean
  criticalFailure:boolean
  grossDamage:number
  absorbed:number
  damage:number
  reaction:"aucune"|"defense"|"riposte_possible"
  gap:number
}
const bounded=(n:number,min:number,max:number)=>Number.isFinite(n)?Math.max(min,Math.min(max,Math.trunc(n))):min
const LEVEL_MAX=25
const NATURAL_GUARD=[0,2,5,9,14,20,27,35,44,55] as const
const GEAR_GUARD=[0,2,5,10,18,30] as const
export function innateProtection(level:number,kind:ResistanceKind):number{
  const n=bounded(level,1,LEVEL_MAX)
  const tier=n<=20?Math.floor((n-1)/4):n-16
  const base=NATURAL_GUARD[tier]
  return kind==="magie"?Math.floor(base*0.7):kind==="mental"?0:base
}
export function equipmentProtection(grade:number,kind:ResistanceKind):number{
  const base=GEAR_GUARD[bounded(grade,0,5)]
  return kind==="magie"?Math.floor(base*0.7):kind==="mental"?0:base
}
export function effectiveProtection(sheet:DefenseProfile,kind:ResistanceKind):number{
  return bounded(sheet.protection[kind]??0,0,60)+innateProtection(sheet.level,kind)+
    equipmentProtection(sheet.equipmentGrades?.[kind]??0,kind)
}
export function resistanceScore(sheet:DefenseProfile,kind:ResistanceKind):number{
  const stat=kind==="physique"?Math.max(sheet.stats.physique,sheet.stats.agilite)
    :kind==="magie"?sheet.stats.esprit:Math.max(sheet.stats.esprit,sheet.stats.presence)
  const trained=kind==="physique"?Math.max(sheet.masteries.lames??0,sheet.masteries.haches??0,sheet.masteries.arcs??0)
    :kind==="magie"?Math.max(sheet.masteries.magie??0,sheet.masteries.runes??0)
    :(sheet.masteries.negociation??0)
  const lvl=bounded(sheet.level,1,LEVEL_MAX)
  const veteran=Math.floor((lvl-1)/5)
  const divine=lvl>=21?lvl-20:0
  const equipment=bounded(sheet.equipmentGrades?.[kind]??0,0,5)
  return bounded(12+bounded(stat,1,12)+Math.floor(bounded(trained,0,12)/6)+veteran+
    bounded(sheet.resistanceBonus[kind]??0,0,8)+divine+equipment,13,50)
}
export function impactBonus(level:number):number{
  const n=bounded(level,1,LEVEL_MAX)
  if(n<=4)return 0
  if(n<=8)return 3
  if(n<=12)return 7
  if(n<=16)return 13
  if(n<=20)return 21
  return [29,37,46,56,68][n-21]
}
export function attackMastery(masteries:Record<string,number>,mode:ImpactMode):number{
  const key=mode==="melee"?Math.max(masteries.lames??0,masteries.haches??0)
    :mode==="tir"?(masteries.arcs??0)
    :mode==="magie"?Math.max(masteries.magie??0,masteries.runes??0)
    :(masteries.negociation??0)
  return bounded(key,0,12)
}
export function resolveOpposition(args:{
  natural:number;total:number;difficulty:number;resistance:number
  damageBase:number;mastery:number;level:number;protection:number;mode:ImpactMode
}):OppositionResult{
  const normalDifficulty=bounded(args.difficulty,15,30)
  const threshold=Math.max(normalDifficulty,bounded(args.resistance,0,50))
  const criticalFailure=args.natural<=7
  const success=!criticalFailure&&args.total>=threshold
  // Contact héroïque : il atteint la cible, mais sa défense n'est PAS franchie.
  // Ne sert jamais à imposer un sort, une contrainte mentale ou un effet cosmique.
  const glancing=!criticalFailure&&!success&&args.mode!=="mental"&&
    args.natural>=27&&args.natural<=30&&args.total>=normalDifficulty
  const contact=success||glancing
  const potential=bounded(args.damageBase,1,12)+bounded(args.mastery,0,12)+impactBonus(args.level)
  const grossDamage=contact&&args.mode!=="mental"?potential:0
  const protection=bounded(args.protection,0,999)
  // En cas de contact héroïque, 0 PV par défaut, 1 PV AU MAXIMUM sur 30 naturel
  // seulement si l'impact potentiel surmonte entièrement l'absorption.
  const damage=success?Math.max(0,grossDamage-protection):
    glancing&&args.natural===30&&grossDamage>protection?1:0
  const absorbed=contact?grossDamage-damage:0
  const gap=Math.max(0,threshold-args.total)
  // La riposte n'est jamais gratuite; pas d'opportunité de riposte sur contact.
  const reaction=contact||criticalFailure?"aucune":gap>=5?"riposte_possible":"defense"
  return {threshold,success,contact,glancing,criticalFailure,
    grossDamage,absorbed,damage,reaction,gap}
}
