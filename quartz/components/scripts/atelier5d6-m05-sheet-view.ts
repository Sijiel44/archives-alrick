/** M05 — adaptateur de lecture 5d6. Jamais un moteur de règles parallèle. */
import type {BestiaryCard,Matchup} from "./atelier5d6-bestiary-workshop"
import {toDefense} from "./atelier5d6-bestiary-workshop"
import {baseHealth,generateCreatureProfileM03} from "./atelier5d6-bestiary"
import {effectiveMastery,effectiveStat} from "./atelier5d6-progression"
import {defenseMasteryM03,resistanceScoreM03,innateProtectionM03,
  equipmentProtectionM03,effectiveProtectionM03,impactBonusM03} from "./atelier5d6-combat-m03"

export const M05_STATS=[
  ["physique","Physique"],["agilite","Agilité"],["esprit","Esprit"],["presence","Présence"]
] as const
export const M05_DEFENSES=["physique","magie","mental"] as const

type DocumentaryKind="espece"|"individu"|"autre"
export type M05DocumentaryLink={
  id:string;type:DocumentaryKind;source:string;sourceVersion:string
  canonStatut:string|null;etatEditorial:string|null;visibilite:string|null
  publish:boolean|null;spoilers:boolean|null;unlisted:boolean|null
  publicPath:string|null
}
/** Les liens déclarés par le MJ ne constituent jamais une autorisation de publication. */
export function readDocumentaryLink(card:BestiaryCard):M05DocumentaryLink|null {
  const v=card.documentaryLink
  if(!v||typeof v!=="object"||Array.isArray(v))return null
  const r=v as Record<string,unknown>
  const str=(x:unknown,max=150)=>typeof x==="string"?x.slice(0,max):""
  const id=str(r.id,90)
  if(!/^[A-Za-z0-9-]{2,90}$/.test(id))return null
  const type:DocumentaryKind=r.type==="espece"||r.type==="individu"?r.type:"autre"
  return {id,type,source:str(r.source,220),sourceVersion:str(r.sourceVersion,90),
    canonStatut:typeof r.canonStatut==="string"?str(r.canonStatut):null,
    etatEditorial:typeof r.etatEditorial==="string"?str(r.etatEditorial):null,
    visibilite:typeof r.visibilite==="string"?str(r.visibilite):null,
    publish:typeof r.publish==="boolean"?r.publish:null,
    spoilers:typeof r.spoilers==="boolean"?r.spoilers:null,
    unlisted:typeof r.unlisted==="boolean"?r.unlisted:null,
    publicPath:typeof r.publicPath==="string"?str(r.publicPath,250):null}
}
export function canOfferDocumentaryLink(d:M05DocumentaryLink|null):boolean {
  // Une approbation locale n'est JAMAIS une preuve de publication. Aucun raccourci URL
  // n'est fourni avant un registre B-001 résolu et validé par le chantier documentaire.
  return false
}
export type M05Artwork={url:string;alt:string;author:string;rights:string;status:string}
export function readApprovedArtwork(card:BestiaryCard):M05Artwork|null{
  const raw=card.artwork
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return null
  const v=raw as Record<string,unknown>
  // Images explicitement autorisées, hébergées sur le site ; jamais d'URL externe.
  if(v.status!=="publication_approuvee"&&v.status!=="canonique_validee")return null
  if(!["own","open","public","permission"].includes(String(v.rights)))return null
  if(typeof v.url!=="string"||!/^\/archives-alrick\/(?:static|assets)\/[A-Za-z0-9/_%.\-]+$/.test(v.url))return null
  if(typeof v.alt!=="string"||!v.alt.trim()||typeof v.author!=="string"||!v.author.trim())return null
  return {url:v.url,alt:v.alt.slice(0,220),author:v.author.slice(0,150),
    rights:String(v.rights),status:String(v.status)}
}
export function deriveM05Sheet(card:BestiaryCard,matchup?:Matchup){
  // Aucun changement d'objet source. Tous les bonus et seuils proviennent des modules M01/M03.
  const defender=toDefense(card)
  const reference=generateCreatureProfileM03(card.level,card.archetype)
  const hpReference=baseHealth(card.level)
  const stats=M05_STATS.map(([id,title])=>({
    id,title,raw:card.stats[id],bonus:effectiveStat(card.stats[id]),
    initial:reference.stats[id],delta:card.stats[id]-reference.stats[id]
  }))
  const defenses=M05_DEFENSES.map(kind=>{
    const bonus=card.resistanceBonus[kind]
    const innate=innateProtectionM03(card.level,kind)
    const equipment=equipmentProtectionM03(card.equipmentGrades[kind],kind)
    const extra=effectiveProtectionM03(defender,kind)-innate-equipment
    return {kind,threshold:resistanceScoreM03(defender,kind),
      defensiveMastery:defenseMasteryM03(defender,kind),defensiveBonus:bonus,
      innate,equipment,extra,absorption:effectiveProtectionM03(defender,kind)}
  })
  const masteries=Object.entries(card.masteries)
    .filter(([,rank])=>rank>0).map(([name,rank])=>({name,rank,bonus:effectiveMastery(rank)}))
  const statBonus=effectiveStat(card.stats.physique)
  const attackMastery=effectiveMastery(card.masteries.lames??0)
  return {id:card.id,name:card.name,kind:card.kind,level:card.level,
    role:card.role,archetype:card.archetype,profession:card.profession,
    description:card.description,origin:card.origin,status:card.status,
    pvMax:card.pvMax,manaMax:card.manaMax,
    stats,defenses,masteries,
    baseHealth:hpReference,referenceHealth:reference.pvMax,
    initialProfile:reference,sourceRuleset:card.ruleset,
    attack:{statBonus,masteryRank:card.masteries.lames??0,masteryBonus:attackMastery,
      impactBonus:impactBonusM03(card.level),baseDamage:card.baseDamage,
      penetration:card.penetration,baseDifficulty:21},
    abilities:card.abilities.map(a=>({name:a.name,description:a.description,
      limitations:a.limitations,approvedByGM:a.approvedByGM})),
    documentary:readDocumentaryLink(card),artwork:readApprovedArtwork(card),
    matchup
  }
}
