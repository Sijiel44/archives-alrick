/**
 * Parcours de vie et affinités de jeu — PROPOSITION 5d6, non un fait de canon.
 * Quatre étapes (niveaux 1–4) préparent une fiche d'aventurier niveau 5.
 * Le bâtisseur ne touche jamais une sauvegarde existante.
 */
export const BASE_STATS=["physique","agilite","esprit","presence"] as const
export type OriginStat=typeof BASE_STATS[number]
export const ORIGIN_MASTERIES=[
 "lames","haches","arcs","runes","soins","negociation","survie","artisanat","magie",
 "commerce","histoire","commandement","intendance"
] as const
export type OriginMastery=typeof ORIGIN_MASTERIES[number]
export const AFFINITY_DOMAINS=[
 ["vent","Vents et mouvements d'air"],["foudre","Foudre et orages"],["climat","Climat et tempêtes"],
 ["eau","Eaux, marées et courants"],["glace","Givre et glace"],["feu","Feu et chaleur"],
 ["terre","Terre et roche"],["nature","Vivants et cycles"],["lumiere","Lumière"],
 ["ombre","Ombres"],["soins","Soin et restauration"],["magie","Magie"],
 ["creation","Création"],["origine","Origine"],["existence","Existence"],["union","Union"]
] as const
export type AffinityId=typeof AFFINITY_DOMAINS[number][0]
export type Affinity={id:AffinityId;rank:number;witness:string}
export type PowerGrade="heroique"|"transcendant"|"divin"
export type Power={id:string;name:string;domain:AffinityId;grade:PowerGrade;
  effect:string;condition:string;manaCost:number;approvedByGM:boolean}
export type OriginOption={
 id:string;label:string;description:string;bonuses:Record<OriginStat,number>;
 mastery:Partial<Record<OriginMastery,number>>;background:string;profession?:string
}
export type OriginStep={id:string;title:string;question:string;options:OriginOption[]}
const stats=(physique:number,agilite:number,esprit:number,presence:number)=>({physique,agilite,esprit,presence})
export const ORIGIN_STEPS:OriginStep[]=[
 {id:"famille",title:"Niveau 1 — Famille et milieu",question:"Dans quel milieu as-tu grandi ?",options:[
  {id:"marchands",label:"Famille de marchands",description:"Marchés, contrats, voyages et écoute.",bonuses:stats(0,1,2,3),mastery:{commerce:1,negociation:1},background:"Élevé parmi les étals, les négociations et les caravanes."},
  {id:"guerriers",label:"Famille de guerriers",description:"Discipline, armes et entraînement.",bonuses:stats(3,2,0,1),mastery:{lames:1,commandement:1},background:"Enfance marquée par les armes, la vigilance et l'entraînement."},
  {id:"nobles",label:"Famille noble",description:"Histoire, éducation, cérémonial, intendance.",bonuses:stats(0,1,3,2),mastery:{histoire:1,intendance:1},background:"Éduqué auprès d'une maison noble, avec ses devoirs et ses contradictions."},
  {id:"artisans",label:"Maison d'artisans",description:"Outils, patience et apprentissage.",bonuses:stats(2,1,3,0),mastery:{artisanat:2},background:"Issu d'une maison d'artisans où le savoir passe par le travail."},
  {id:"nomades",label:"Peuple de voyageurs",description:"Routes, survie, rencontres et adaptation.",bonuses:stats(1,3,1,1),mastery:{survie:2},background:"A grandi sur les routes et les terres sans demeure fixe."}
 ]},
 {id:"formation",title:"Niveau 2 — Éducation",question:"À quel apprentissage consacres-tu ton enfance ?",options:[
  {id:"lettres",label:"Études et chroniques",description:"Lire, comprendre et conserver la mémoire.",bonuses:stats(0,1,4,1),mastery:{histoire:2},background:"A étudié les livres, les cartes et les récits anciens."},
  {id:"armes",label:"Armes et tactique",description:"Posture, maîtrise et sang-froid.",bonuses:stats(3,2,0,1),mastery:{lames:1,commandement:1},background:"A suivi une formation martiale structurée."},
  {id:"routes",label:"Pistage et exploration",description:"Observation du terrain et endurance.",bonuses:stats(2,3,1,0),mastery:{survie:2},background:"A appris à lire les traces et le paysage."},
  {id:"ateliers",label:"Ateliers et intendance",description:"Fabrication et gestion des ressources.",bonuses:stats(1,1,3,1),mastery:{artisanat:1,intendance:1},background:"A appris à concevoir, réparer et répartir les ressources."},
  {id:"arcane",label:"Études magiques",description:"La théorie n'accorde aucun Cercle gratuitement.",bonuses:stats(0,1,4,1),mastery:{runes:1,magie:1},background:"A reçu une formation magique initiale, sans pouvoir canonique attribué."}
 ]},
 {id:"epreuve",title:"Niveau 3 — Épreuve de jeunesse",question:"Quel événement t'a le plus transformé ?",options:[
  {id:"voyage",label:"Un voyage difficile",description:"Routes, endurance et décisions rapides.",bonuses:stats(2,2,1,1),mastery:{survie:1,commerce:1},background:"A survécu à un voyage qui lui a appris l'entraide."},
  {id:"conflit",label:"Un conflit ou une défense",description:"Garder son calme et protéger les siens.",bonuses:stats(3,2,0,1),mastery:{lames:1,soins:1},background:"A connu un conflit dont les conséquences comptent encore."},
  {id:"responsabilite",label:"Une responsabilité précoce",description:"Organiser, parler et décider.",bonuses:stats(0,1,2,3),mastery:{commandement:1,intendance:1},background:"A dû prendre des responsabilités avant de s'y sentir prêt."},
  {id:"perte",label:"Une perte et une reconstruction",description:"Empathie et réflexion.",bonuses:stats(1,0,3,2),mastery:{soins:1,histoire:1},background:"A traversé une perte sans qu'elle définisse à elle seule sa vie."},
  {id:"decouverte",label:"Une découverte étrange",description:"Curiosité et étude d'un phénomène.",bonuses:stats(0,1,4,1),mastery:{magie:1,runes:1},background:"A découvert un mystère qu'il aimerait comprendre, non encore maîtrisé."}
 ]},
 {id:"vocation",title:"Niveau 4 — Choisir sa voie",question:"Pourquoi pars-tu finalement à l'aventure ?",options:[
  {id:"commerce",label:"Fonder des échanges",description:"Marchander, naviguer entre cultures et territoires.",bonuses:stats(0,1,2,3),mastery:{commerce:1,negociation:1},background:"Veut ouvrir des routes et relier des communautés.",profession:"Marchand aventurier"},
  {id:"protection",label:"Protéger",description:"Savoir se battre pour permettre aux autres de vivre.",bonuses:stats(3,2,0,1),mastery:{lames:1,soins:1},background:"Part pour protéger les voyageurs et les siens.",profession:"Protecteur"},
  {id:"savoir",label:"Comprendre l'histoire",description:"Explorer des ruines, enquêter et transmettre.",bonuses:stats(0,1,4,1),mastery:{histoire:1,runes:1},background:"Part à la recherche des histoires et des savoirs.",profession:"Érudit voyageur"},
  {id:"responsable",label:"Servir et gouverner justement",description:"Diriger sans imposer sa volonté.",bonuses:stats(1,0,2,3),mastery:{commandement:1,intendance:1},background:"Veut apprendre à prendre soin d'une communauté.",profession:"Intendant voyageur"},
  {id:"magie",label:"Étudier les arts magiques",description:"L'apprentissage n'accorde ni Autorité ni Cercle.",bonuses:stats(0,1,4,1),mastery:{magie:1,runes:1},background:"Part approfondir une discipline magique, dont les limites restent réelles.",profession:"Apprenti mage"},
  {id:"liberte",label:"Voyager librement",description:"S'adapter, écouter et tracer son chemin.",bonuses:stats(1,3,1,1),mastery:{survie:1,negociation:1},background:"Part pour rencontrer le monde sans devoir incarner un rôle prédéfini.",profession:"Voyageur"}
 ]}
]
export type OriginBuild={stats:Record<OriginStat,number>;masteries:Record<OriginMastery,number>;
  lifeSteps:string[];summary:string;profession:string;level:5;pvMax:36;manaMax:number}
const ordered=(a:Record<OriginStat,number>,b:Record<OriginStat,number>):OriginStat[]=>
  [...BASE_STATS].sort((x,y)=>b[y]-b[x]||a[x]-a[y]||BASE_STATS.indexOf(x)-BASE_STATS.indexOf(y))
export function buildOrigin(choiceIds:string[]):OriginBuild{
  if(!Array.isArray(choiceIds)||choiceIds.length!==ORIGIN_STEPS.length)throw Error("Quatre périodes obligatoires.")
  const selected=ORIGIN_STEPS.map((step,i)=>{
    const choice=step.options.find(opt=>opt.id===choiceIds[i])
    if(!choice)throw Error("Choix d'origine inconnu pour "+step.id)
    return choice
  })
  const stats:Record<OriginStat,number>={physique:3,agilite:3,esprit:3,presence:3}
  const mastery=Object.fromEntries(ORIGIN_MASTERIES.map(k=>[k,0])) as Record<OriginMastery,number>
  for(const opt of selected){
    let points=0
    for(const k of BASE_STATS){
      const gain=opt.bonuses[k]
      if(!Number.isInteger(gain)||gain<0)throw Error("Bonification invalide")
      const accepted=Math.min(gain,12-stats[k])
      stats[k]+=accepted
      points+=gain-accepted
    }
    while(points>0){
      const next=ordered(stats,opt.bonuses).find(k=>stats[k]<12)
      if(!next)throw Error("Plafond des caractéristiques dépassé")
      stats[next]++;points--
    }
    for(const key of ORIGIN_MASTERIES)mastery[key]+=(opt.mastery[key]??0)
  }
  if(BASE_STATS.reduce((a,k)=>a+stats[k],0)!==36)throw Error("Crédits incomplets")
  if(ORIGIN_MASTERIES.reduce((a,k)=>a+mastery[k],0)!==8)throw Error("Maîtrises incomplètes")
  const profession=selected[3].profession??"Voyageur"
  // Avoir étudié les bases d'un art magique donne une réserve d'essai ; pas un sort,
  // pas un Cercle, pas une Autorité.
  const manaMax=mastery.magie+mastery.runes>=2?36:0
  return {stats,masteries:mastery,lifeSteps:[...choiceIds],
    summary:selected.map((c,i)=>ORIGIN_STEPS[i].title+" : "+c.background).join("\n"),
    profession,level:5,pvMax:36,manaMax}
}
export function affinityRankLimit(level:number):number{
 const lvl=Math.max(1,Math.min(25,Math.floor(Number(level)||1)))
 return lvl>=21?5:lvl>=17?4:lvl>=13?3:lvl>=9?2:1
}
export function affinityImpactBonus(rank:number):number{
 return Math.max(0,Math.min(5,Math.floor(Number(rank)||0)))*2
}
export function divinePowerMinimumLevel(grade:PowerGrade):number{
 return grade==="divin"?21:grade==="transcendant"?17:5
}
