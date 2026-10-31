/**
 * Générateur de profils 5d6 purement ludiques : 1 à 25.
 * Aucune nouvelle espèce, aucun statut divin ou exploit d'Orin n'est déclaré canonique.
 */
export type CreatureArchetype="faune"|"predateur"|"gardien"|"mystique"|"colosse"
export type CreatureProfile={
  level:number;stats:{physique:number;agilite:number;esprit:number;presence:number}
  pvMax:number;manaMax:number;mastery:number
  equipmentPhysical:number;equipmentMagic:number;resistancePhysical:number;resistanceMagic:number
}
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,Math.floor(Number.isFinite(n)?n:a)))
const stepGain=(n:number)=>n>=25?36:n>=21?24:n>=13?12:6
export function baseHealth(level:number):number{
  const n=clamp(level,1,25)
  let hp=12
  for(let l=2;l<=n;l++)hp+=stepGain(l)
  return hp
}
export function generateCreatureProfile(level:number,archetype:CreatureArchetype):CreatureProfile{
  const n=clamp(level,1,25)
  const t=["faune","predateur","gardien","mystique","colosse"].includes(archetype)?archetype:"faune"
  const base=clamp(3+Math.floor((n-1)/3),1,12)
  const hpRatio={faune:0.7,predateur:0.9,gardien:1.25,mystique:0.8,colosse:1.7}[t]
  const stats={
    physique:clamp(base+(t==="colosse"?3:t==="gardien"?2:0),1,12),
    agilite:clamp(base+(t==="predateur"?2:t==="faune"?1:t==="colosse"?-2:0),1,12),
    esprit:clamp(base+(t==="mystique"?2:t==="colosse"?-1:0),1,12),
    presence:clamp(base+(t==="gardien"?1:t==="mystique"?2:0),1,12)
  }
  const training=clamp(Math.floor((n-1)/2),0,12)
  return {
    level:n,stats,pvMax:Math.max(3,Math.round(baseHealth(n)*hpRatio)),
    manaMax:t==="mystique"?baseHealth(n):0,mastery:training,
    equipmentPhysical:t==="gardien"?clamp(Math.floor(n/5),0,5):0,
    equipmentMagic:t==="mystique"?clamp(Math.floor(n/5),0,5):0,
    resistancePhysical:t==="colosse"?3:t==="gardien"?2:0,
    resistanceMagic:t==="mystique"?2:0
  }
}
