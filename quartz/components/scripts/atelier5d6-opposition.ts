/**
 * Extension de playtest 5d6. Calculs purs : ne confère jamais de droits divins,
 * de Cercles magiques ni de contre-attaques gratuites.
 */
export type ResistanceKind = "physique" | "magie" | "mental"
export type ImpactMode = "melee" | "tir" | "magie" | "mental"
export type DefenseProfile = {
  stats: {physique:number; agilite:number; esprit:number; presence:number}
  level:number
  masteries: Record<string,number>
  resistanceBonus: Record<ResistanceKind,number>
  protection: Record<ResistanceKind,number>
}
export type OppositionResult = {
  threshold:number
  success:boolean
  criticalFailure:boolean
  grossDamage:number
  absorbed:number
  damage:number
  reaction:"aucune" | "defense" | "riposte_possible"
  gap:number
}
const bounded=(n:number,min:number,max:number)=>Number.isFinite(n)?Math.max(min,Math.min(max,Math.trunc(n))):min
export function resistanceScore(sheet:DefenseProfile,kind:ResistanceKind):number{
  const stat=kind==="physique"?Math.max(sheet.stats.physique,sheet.stats.agilite)
    :kind==="magie"?sheet.stats.esprit:Math.max(sheet.stats.esprit,sheet.stats.presence)
  const trained=kind==="physique"?Math.max(sheet.masteries.lames??0,sheet.masteries.haches??0,sheet.masteries.arcs??0)
    :kind==="magie"?Math.max(sheet.masteries.magie??0,sheet.masteries.runes??0)
    :(sheet.masteries.negociation??0)
  // Un vétéran résiste mieux sans transformer le niveau en bonus massif de précision.
  const veteran=Math.floor((bounded(sheet.level,1,24)-1)/8)
  const divine=sheet.level>=21?2*(sheet.level-20):0
  return bounded(12+bounded(stat,1,12)+Math.floor(bounded(trained,0,12)/6)+veteran+
    bounded(sheet.resistanceBonus[kind]??0,0,8)+divine,13,45)
}
export function impactBonus(level:number):number{
  const n=bounded(level,1,24)
  if(n<=4)return 0
  if(n<=8)return 3
  if(n<=12)return 7
  if(n<=16)return 13
  if(n<=20)return 21
  return [29,37,46,56][n-21]
}
export function attackMastery(masteries:Record<string,number>,mode:ImpactMode):number{
  const key=mode==="melee"?Math.max(masteries.lames??0,masteries.haches??0)
    :mode==="tir"?(masteries.arcs??0)
    :mode==="magie"?Math.max(masteries.magie??0,masteries.runes??0)
    :(masteries.negociation??0)
  return bounded(key,0,12)
}
export function resolveOpposition(args:{
  natural:number; total:number; difficulty:number; resistance:number;
  damageBase:number; mastery:number; level:number; protection:number;
  mode:ImpactMode
}):OppositionResult{
  const threshold=Math.max(bounded(args.difficulty,15,30),bounded(args.resistance,13,45))
  const criticalFailure=args.natural<=7
  const success=!criticalFailure && args.total>=threshold
  const grossDamage=success&&args.mode!=="mental"?
    bounded(args.damageBase,1,12)+bounded(args.mastery,0,12)+impactBonus(args.level):0
  const absorbed=Math.min(grossDamage,bounded(args.protection,0,60))
  const damage=grossDamage-absorbed
  const gap=Math.max(0,threshold-args.total)
  // Réaction FACULTATIVE du défenseur : pas de jet adverse, pas de dégâts automatiques.
  const reaction=success||criticalFailure?"aucune":gap>=5?"riposte_possible":"defense"
  return {threshold,success,criticalFailure,grossDamage,absorbed,damage,reaction,gap}
}
