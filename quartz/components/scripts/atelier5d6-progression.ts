/**
 * M01 — modèle pur et expérimental de progression, NON connecté à l'Atelier.
 * Valeurs brutes non plafonnées ; jets, magie, statut divin et canon indépendants.
 */
import { countSuccessfulRolls, TOTAL_OUTCOMES } from "./atelier5d6-probabilities.js"

export const STAT_NAMES = ["physique","agilite","esprit","presence"] as const
export type StatName = typeof STAT_NAMES[number]
export type Stats = Record<StatName,number>
export type ExperienceDomain =
  "combat"|"artisanat"|"savoir"|"diplomatie"|"exploration"|"magie"|"secours"|"transmission"
export type AccomplishmentScope = "ordinaire"|"majeur"|"legendaire"
export type ExperienceEvent = {
  id:string;pattern:string;domain:ExperienceDomain;difficulty:number
  scope:AccomplishmentScope;approved:boolean
}
export type Build = {
  level:number;startingStats:Stats;stats:Stats;masteries:Record<string,number>
  aptitudes:number;techniques:number;signatures:number;approvedSignatures:number
}
export type Action = {
  natural:number;rawStat:number;masteryRank:number;situation:number
  threshold:number;feasible:boolean
}
function safeNonnegative(n:number,label:string):void {
  if(!Number.isSafeInteger(n)||n<0)throw new RangeError(label+" doit être un entier naturel sûr.")
}
function levelInRange(n:number):void {
  if(!Number.isInteger(n)||n<1||n>25)throw new RangeError("Niveau attendu : 1 à 25.")
}
/** Coûts 1,2,3... par tranches ; somme fermée O(1), aucun plafond de jeu. */
export function cumulativeRankCost(rank:number,width:number):number {
  safeNonnegative(rank,"Rang")
  if(!Number.isSafeInteger(width)||width<1)throw new RangeError("Tranche invalide.")
  const q=Math.floor(rank/width),r=rank%width
  const sum=width*q*(q+1)/2+r*(q+1)
  if(!Number.isSafeInteger(sum))throw new RangeError("Coût hors précision entière.")
  return sum
}
export function statCost(from:number,to:number):number {
  safeNonnegative(from,"Score initial");safeNonnegative(to,"Score final")
  if(from<1||to<from)throw new RangeError("Achat de caractéristique invalide.")
  return cumulativeRankCost(to,8)-cumulativeRankCost(from,8)
}
export function masteryCost(from:number,to:number):number {
  safeNonnegative(from,"Maîtrise initiale");safeNonnegative(to,"Maîtrise finale")
  if(to<from)throw new RangeError("Achat de maîtrise invalide.")
  return cumulativeRankCost(to,6)-cumulativeRankCost(from,6)
}
/** Rendements décroissants SANS plafond : valeur 3 -> +3, 12 -> +6, 39 -> +11. */
export function effectiveStat(raw:number):number {
  if(!Number.isSafeInteger(raw)||raw<1)throw new RangeError("Score brut invalide.")
  return Math.floor(3*Math.log2(1+raw/3))
}
export function effectiveMastery(rank:number):number {
  safeNonnegative(rank,"Maîtrise")
  return Math.floor(Math.log2(1+rank))
}
export function experienceRequired(level:number):number {
  levelInRange(level);return 25*(level-1)**2
}
export function legacyExperienceRequired(level:number):number {
  levelInRange(level);return 5*(level-1)**3
}
export function developmentBudget(level:number):number {
  levelInRange(level);return 6*(level-1)
}
export function legacyStatBudget(level:number):number {
  levelInRange(level);return 12+6*(level-1)
}
export function progressionAtLevel(level:number) {
  levelInRange(level)
  return {level,experience:experienceRequired(level),previousExperience:legacyExperienceRequired(level),
    nextLevelExperience:level===25?null:experienceRequired(level+1)-experienceRequired(level),
    development:developmentBudget(level),legacyRawCredits:legacyStatBudget(level),
    legacyMasteries:2*(level-1)}
}
export const ABILITY_COSTS=Object.freeze({aptitude:3,technique:6,signature:9})
/**
 * Budget commun : caractéristiques, maîtrises, aptitudes, techniques, signatures.
 * Signatures seulement au N17+, sur validation MJ ; n'accordent aucun Cercle/Autorité.
 */
export function evaluateBuild(build:Build) {
  levelInRange(build.level)
  const issues:string[]=[]
  const base=build.startingStats
  const baseValues=STAT_NAMES.map(k=>base[k])
  if(baseValues.some(v=>!Number.isSafeInteger(v)||v<1||v>5)||
     baseValues.reduce((a,b)=>a+b,0)!==12)issues.push("Création : 12 points, scores initiaux 1–5.")
  let spent=0
  for(const key of STAT_NAMES) {
    try{spent+=statCost(base[key],build.stats[key])}
    catch{issues.push("Caractéristique invalide : "+key)}
  }
  if(!build.masteries||typeof build.masteries!=="object"||Array.isArray(build.masteries)) {
    issues.push("Registre de maîtrises invalide.")
  }else for(const [name,rank] of Object.entries(build.masteries)) {
    if(!name.trim())issues.push("Maîtrise sans domaine.")
    try{spent+=masteryCost(0,rank)}catch{issues.push("Maîtrise invalide : "+name)}
  }
  for(const [kind,cost] of Object.entries(ABILITY_COSTS) as [keyof typeof ABILITY_COSTS,number][]) {
    const count=kind==="aptitude"?build.aptitudes:kind==="technique"?build.techniques:build.signatures
    if(!Number.isSafeInteger(count)||count<0)issues.push("Quantité invalide : "+kind)
    else spent+=count*cost
  }
  if(build.aptitudes>0&&build.level<3)issues.push("Aptitude ouverte au niveau 3.")
  if(build.techniques>0&&build.level<5)issues.push("Technique ouverte au niveau 5.")
  if(build.signatures>0&&build.level<17)issues.push("Signature ouverte au niveau 17.")
  if(!Number.isSafeInteger(build.approvedSignatures)||build.approvedSignatures<build.signatures)
    issues.push("Signature sans validation MJ.")
  const budget=developmentBudget(build.level)
  if(spent>budget)issues.push("Dépassement du budget.")
  return {valid:issues.length===0,issues,spent,budget,remaining:budget-spent}
}
/** Les échecs naturels 5–7 et la faisabilité priment tout bonus, même immense. */
export function resolveProgressionAction(a:Action) {
  if(!Number.isInteger(a.natural)||a.natural<5||a.natural>30)throw new RangeError("Naturel 5d6 invalide.")
  if(!Number.isInteger(a.situation)||a.situation< -2||a.situation>2)throw new RangeError("Situation hors −2..+2.")
  if(!Number.isFinite(a.threshold)||a.threshold<0)throw new RangeError("Seuil invalide.")
  const bonus=effectiveStat(a.rawStat)+effectiveMastery(a.masteryRank)+a.situation
  const total=a.natural+bonus
  const naturalFailure=a.natural<=7
  const numericSuccess=!naturalFailure&&total>=a.threshold
  const success=a.feasible===true&&numericSuccess
  return {natural:a.natural,bonus,total,naturalFailure,numericSuccess,success,
    criticalPotential:a.natural>=27,criticalApplied:success&&a.natural>=27}
}
export function probabilityProgressionAction(a:Omit<Action,"natural">):number {
  if(!Number.isFinite(a.threshold)||a.threshold<0)throw new RangeError("Seuil invalide.")
  if(!Number.isInteger(a.situation)||a.situation< -2||a.situation>2)throw new RangeError("Situation invalide.")
  if(a.feasible!==true)return 0
  const bonus=effectiveStat(a.rawStat)+effectiveMastery(a.masteryRank)+a.situation
  return countSuccessfulRolls(a.threshold,bonus)/TOTAL_OUTCOMES
}
export function experienceAward(event:ExperienceEvent,history:readonly ExperienceEvent[]):number {
  if(!event.id.trim()||!event.pattern.trim())throw new RangeError("Accomplissement sans identifiant.")
  if(!Number.isInteger(event.difficulty)||event.difficulty<1||event.difficulty>12)
    throw new RangeError("Indice d'accomplissement 1–12 requis.")
  const domains:readonly string[]=["combat","artisanat","savoir","diplomatie","exploration","magie","secours","transmission"]
  if(!domains.includes(event.domain))throw new RangeError("Domaine inconnu.")
  if(!(["ordinaire","majeur","legendaire"] as string[]).includes(event.scope))throw new RangeError("Portée inconnue.")
  if(history.some(h=>h.id===event.id))return 0
  if(event.scope!=="ordinaire"&&!event.approved)return 0
  const repeated=history.filter(h=>h.pattern===event.pattern).length
  const divisor=repeated===0?1:repeated===1?2:repeated<=3?4:Infinity
  const multiplier=event.scope==="legendaire"?8:event.scope==="majeur"?3:1
  return Number.isFinite(divisor)?Math.floor(20*event.difficulty*multiplier/divisor):0
}
/** N21–N25 : cinq accomplissements distincts validés, jamais une divinisation automatique. */
export function canReachLevel(target:number,xp:number,approvedMilestones:readonly number[]):boolean {
  levelInRange(target);safeNonnegative(xp,"XP")
  if(xp<experienceRequired(target))return false
  return target<=20||Array.from({length:target-20},(_,i)=>i+21).every(n=>approvedMilestones.includes(n))
}
