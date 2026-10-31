/** M04 — contrats et calculs purs de l'Atelier du Bestiaire (non canonique). */
import { generateCreatureProfileM03 } from "./atelier5d6-bestiary"
import type { CreatureArchetype } from "./atelier5d6-bestiary"
import { effectiveMastery, effectiveStat } from "./atelier5d6-progression"
import { resolveCombatM03, resistanceScoreM03, effectiveProtectionM03 } from "./atelier5d6-combat-m03"
import { sumOccurrences, TOTAL_OUTCOMES } from "./atelier5d6-probabilities"
import type { DefenseProfile } from "./atelier5d6-opposition"

export const BESTIARY_SCHEMA = "alrick.bestiary.v1"
export const BESTIARY_STORAGE = "archives-alrick-bestiary-v1"
export const ARCHETYPES: CreatureArchetype[] = ["faune","predateur","gardien","mystique","colosse"]
export type BestiaryKind = "creature"|"pnj"
export type BestiaryRole = "offensif"|"defensif"|"soutien"
export type BestiaryStatus = "brouillon"|"jeu_valide"|"documentaire_approuve"
export type BestiaryCard = {
  schema:typeof BESTIARY_SCHEMA;ruleset:"m03";id:string;name:string;description:string
  origin:string;profession:string;notes:string;kind:BestiaryKind;role:BestiaryRole
  status:BestiaryStatus;level:number;archetype:CreatureArchetype
  stats:{physique:number;agilite:number;esprit:number;presence:number}
  masteries:Record<string,number>;pvMax:number;manaMax:number
  resistanceBonus:{physique:number;magie:number;mental:number}
  protection:{physique:number;magie:number;mental:number}
  equipmentGrades:{physique:number;magie:number;mental:number}
  baseDamage:number;penetration:number;abilities:{name:string;description:string;limitations:string;approvedByGM:boolean}[]
  [extension:string]:unknown // Champs supplémentaires JSON conservés, non exécutables.
}
export type MathSide = {hits:number;contacts:number;expectedDamage:number;woundChance:number;defense:number;protection:number}
export type Matchup = {creature:MathSide;opponent:MathSide;opponentCount:number;roundsEstimate:number|null;stalemate:boolean;level:number;profile:string;assumptions:string}
const clamp=(n:number,min:number,max:number)=>Number.isFinite(n)?Math.max(min,Math.min(max,Math.floor(n))):min
const string=(v:unknown,max=500)=>typeof v==="string"?v.slice(0,max):""
const pick=(v:unknown,values:readonly string[],fallback:string)=>typeof v==="string"&&values.includes(v)?v:fallback
const safeId=()=>("bestiary-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,10))
const copy=<T>(x:T):T=>JSON.parse(JSON.stringify(x)) as T
export function createBestiaryCard(level:number,archetype:CreatureArchetype,kind:BestiaryKind="creature",role:BestiaryRole="offensif"):BestiaryCard{
  const n=clamp(level,1,25), p=generateCreatureProfileM03(n,archetype)
  const stats=copy(p.stats)
  if(kind==="pnj"){
    // Profil de référence : modèle simplifié de PNJ, pas un build PJ financé.
    if(role==="soutien")stats.esprit+=2
    if(role==="defensif")stats.agilite+=2
  }
  return {schema:BESTIARY_SCHEMA,ruleset:"m03",id:safeId(),name:"Nouvelle "+(kind==="pnj"?"personne":"créature"),
    description:"",origin:"",profession:"",notes:"",kind,role,status:"brouillon",level:n,archetype,
    stats,masteries:{lames:p.mastery,esquive:p.mastery,magie:p.mastery,runes:p.mastery,
      survie:p.mastery,volonte:p.mastery,negociation:p.mastery},
    pvMax:p.pvMax,manaMax:p.manaMax,
    // Les résistances du générateur M03 sont des bonus de DÉFENSE (+0..8),
    // pas de protection/absorption (rendement logarithmique) : ne pas confondre.
    resistanceBonus:{physique:p.resistancePhysical,magie:p.resistanceMagic,mental:0},
    protection:{physique:0,magie:0,mental:0},
    equipmentGrades:{physique:p.equipmentPhysical,magie:p.equipmentMagic,mental:0},
    baseDamage:6,penetration:0,abilities:[]}
}
/** Les imports invalides sont refusés ; aucune exécution de contenu narratif. */
export function validateBestiaryCard(raw:unknown):BestiaryCard{
  if(!raw||typeof raw!=="object"||Array.isArray(raw))throw Error("Fiche absente")
  const x=raw as Record<string,unknown>
  if(x.schema!==BESTIARY_SCHEMA||x.ruleset!=="m03")throw Error("Schéma ou règles incompatibles")
  if(typeof x.name!=="string"||!x.name.trim())throw Error("Nom manquant")
  const kind=pick(x.kind,["creature","pnj"],"creature") as BestiaryKind
  const role=pick(x.role,["offensif","defensif","soutien"],"offensif") as BestiaryRole
  const archetype=pick(x.archetype,ARCHETYPES,"faune") as CreatureArchetype
  const out=createBestiaryCard(Number(x.level),archetype,kind,role)
  out.id=string(x.id,90)||out.id
  out.name=string(x.name,100)
  out.description=string(x.description,1500)
  out.origin=string(x.origin,150)
  out.profession=string(x.profession,150)
  out.notes=string(x.notes,2000)
  out.status=pick(x.status,["brouillon","jeu_valide","documentaire_approuve"],"brouillon") as BestiaryStatus
  const stats=x.stats as Record<string,unknown> | undefined
  if(!stats||typeof stats!=="object")throw Error("Caractéristiques absentes")
  for(const k of ["physique","agilite","esprit","presence"] as const){
    if(!Number.isSafeInteger(stats[k])||Number(stats[k])<1||Number(stats[k])>9999)throw Error("Caractéristique invalide : "+k)
    out.stats[k]=Number(stats[k])
  }
  const masteries=x.masteries as Record<string,unknown> | undefined
  if(!masteries||typeof masteries!=="object")throw Error("Maîtrises absentes")
  for(const [k,v] of Object.entries(masteries).slice(0,60)){
    if(!k.trim()||k.length>90||!Number.isSafeInteger(v)||Number(v)<0||Number(v)>9999)throw Error("Maîtrise invalide")
    out.masteries[k]=Number(v)
  }
  for(const key of ["pvMax","manaMax","baseDamage","penetration"] as const){
    const upper=key==="baseDamage"?12:key==="penetration"?8:999999
    const lower=key==="baseDamage"||key==="pvMax"?1:0
    if(!Number.isSafeInteger(x[key])||Number(x[key])<lower||Number(x[key])>upper)throw Error("Ressource invalide : "+key)
    out[key]=Number(x[key])
  }
  for(const prop of ["resistanceBonus","protection","equipmentGrades"] as const){
    const o=x[prop] as Record<string,unknown> | undefined
    if(!o||typeof o!=="object")throw Error("Défense absente")
    const upper=prop==="equipmentGrades"?5:prop==="resistanceBonus"?8:60
    for(const k of ["physique","magie","mental"] as const){
      if(!Number.isSafeInteger(o[k])||Number(o[k])<0||Number(o[k])>upper)throw Error("Protection invalide : "+k)
      out[prop][k]=Number(o[k])
    }
  }
  if(!Array.isArray(x.abilities)||x.abilities.length>25)throw Error("Liste de capacités invalide")
  out.abilities=x.abilities.map((v:unknown)=>{
    const a=v as Record<string,unknown>
    if(!a||typeof a!=="object"||typeof a.name!=="string")throw Error("Capacité invalide")
    const result={...a,name:string(a.name,100),description:string(a.description,1000),
      limitations:string(a.limitations,500),approvedByGM:a.approvedByGM===true}
    return result
  })
  // Préserver les clés propres additionnelles lors d'un aller-retour, sans les interpréter.
  // Interdire les noms spéciaux afin de préserver la sûreté des prototypes JS.
  const known=new Set(Object.keys(out))
  for(const [key,value] of Object.entries(x)){
    if(known.has(key)||["__proto__","prototype","constructor"].includes(key))continue
    const encoded=JSON.stringify(value)
    if(encoded&&encoded.length<=20000)Object.defineProperty(out,key,
      {value:JSON.parse(encoded) as unknown,enumerable:true,writable:true,configurable:true})
  }
  return out
}
/** Contrat distinct M03 : une créature n'est pas soumise au budget d'un PJ M02. */
export function exportBestiaryForAtelier(card:BestiaryCard){
  const c=validateBestiaryCard(card)
  return {schema:"alrick.sheets.v3",sheets:[{
    schema:"alrick.sheet.v3",ruleset:"m03-bestiary",kind:c.kind,
    name:c.name,profession:c.profession||c.archetype,description:c.description,
    level:c.level,highestLevel:c.level,stats:copy(c.stats),
    masteries:copy(c.masteries),pv:c.pvMax,pvMax:c.pvMax,
    mana:c.manaMax,manaMax:c.manaMax,
    resistanceBonus:copy(c.resistanceBonus),protection:copy(c.protection),
    equipmentGrades:copy(c.equipmentGrades),notes:c.notes,
    bestiarySource:copy(c)
  }]}
}
export function toDefense(card:BestiaryCard):DefenseProfile{
  return {level:card.level,stats:card.stats,masteries:card.masteries,
    resistanceBonus:card.resistanceBonus,protection:card.protection,
    equipmentGrades:card.equipmentGrades}
}
export function referenceOpponent(level:number,profile:"offensif"|"defensif"|"polyvalent",grade:number):BestiaryCard{
  const p=createBestiaryCard(level,profile==="defensif"?"gardien":"predateur","pnj",profile==="defensif"?"defensif":"offensif")
  p.name="Personnage de référence "+profile
  p.stats={physique:3+Math.floor((p.level-1)*.55),agilite:3+Math.floor((p.level-1)*.55),esprit:3+Math.floor((p.level-1)*.55),presence:3+Math.floor((p.level-1)*.55)}
  if(profile==="offensif")p.stats.physique+=3
  if(profile==="defensif")p.stats.agilite+=3
  p.masteries.lames=Math.floor((p.level-1)*.45)
  p.masteries.esquive=p.masteries.lames+(profile==="defensif"?3:0)
  p.equipmentGrades.physique=clamp(grade,0,5)
  p.protection.physique=0
  p.pvMax=12;for(let n=2;n<=p.level;n++)p.pvMax+=n>=25?36:n>=21?24:n>=13?12:6
  return p
}
export function attackMath(attacker:BestiaryCard,defender:BestiaryCard,situation=0):MathSide{
  let hits=0,contacts=0,damage=0,wounds=0
  const d=toDefense(defender)
  for(let natural=5;natural<=30;natural++){
    const weight=sumOccurrences(natural)
    const r=resolveCombatM03({natural,rawStat:attacker.stats.physique,
      masteryRank:attacker.masteries.lames??0,situation,level:attacker.level,
      difficulty:21,kind:"physique",mode:"melee",defender:d,feasible:true,
      baseDamage:attacker.baseDamage,penetration:attacker.penetration})
    if(r.success)hits+=weight
    if(r.contact)contacts+=weight
    if(r.damage>0)wounds+=weight
    damage+=weight*r.damage
  }
  return {hits:hits/TOTAL_OUTCOMES,contacts:contacts/TOTAL_OUTCOMES,
    expectedDamage:damage/TOTAL_OUTCOMES,woundChance:wounds/TOTAL_OUTCOMES,
    defense:resistanceScoreM03(d,"physique"),protection:effectiveProtectionM03(d,"physique")}
}
export function evaluateMatchup(creature:BestiaryCard,level:number,
  profile:"offensif"|"defensif"|"polyvalent",equipment:number,count:number,situation=0):Matchup{
  const opponent=referenceOpponent(level,profile,equipment)
  const c=attackMath(creature,opponent,situation)
  const p=attackMath(opponent,creature,-situation)
  const n=clamp(count,1,8),dps=p.expectedDamage*n
  const rounds=dps===0?null:creature.pvMax/dps
  return {creature:c,opponent:p,opponentCount:n,roundsEstimate:rounds,stalemate:!p.expectedDamage||!c.expectedDamage,
    level:opponent.level,profile,assumptions:"5d6 exacts (7 776 issues), 1 attaque par acteur et par round, cible passive, aucune ressource consommée, aucune capacité spéciale active, aucune action tactique ou décision narrative. Durée théorique, pas durée réelle de partie."}
}
export function describeFormula(card:BestiaryCard):string{
  return "5d6 + "+effectiveStat(card.stats.physique)+" (Physique "+card.stats.physique+
    ") + "+effectiveMastery(card.masteries.lames??0)+" (maîtrise "+(card.masteries.lames??0)+
    ") + situation [-2,+2] ; échecs forcés : naturels 5–7"
}
