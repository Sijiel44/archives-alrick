/** M05 — rendu DOM accessible des fiches, sans mutation ni HTML injecté. */
import type {BestiaryCard,Matchup} from "./atelier5d6-bestiary-workshop"
import {deriveM05Sheet} from "./atelier5d6-m05-sheet-view"

type NodeParent=HTMLElement
const node=<K extends keyof HTMLElementTagNameMap>(tag:K,cls="",value=""):HTMLElementTagNameMap[K]=>{
  const e=document.createElement(tag)
  if(cls)e.className=cls
  if(value)e.textContent=value
  return e
}
function line(parent:NodeParent,label:string,value:string){
  const row=node("div","m05-line")
  row.append(node("span","m05-label",label),node("strong","",value))
  parent.append(row)
}
function paragraph(parent:NodeParent,value:string,cls=""){
  parent.append(node("p",cls,value))
}
function section(host:NodeParent,key:string,title:string,previous:Set<string>){
  const details=node("details","m05-panel")
  details.dataset.m05Panel=key
  details.open=previous.has(key)
  details.append(node("summary","",title))
  const body=node("div","m05-panel-body")
  details.append(body);host.append(details)
  return body
}
const pct=(v:number)=>(v*100).toFixed(2).replace(".",",")+" %"
const num=(v:number)=>v.toLocaleString("fr-CA",{maximumFractionDigits:2})
export function renderM05Sheet(host:HTMLElement,card:BestiaryCard,matchup?:Matchup){
  const root=host.querySelector<HTMLElement>("[data-m05-content]")
  if(!root)return
  const opened=new Set(Array.from(root.querySelectorAll<HTMLDetailsElement>("details[data-m05-panel]"))
    .filter(d=>d.open).map(d=>d.dataset.m05Panel??""))
  const v=deriveM05Sheet(card,matchup)
  const format=host.querySelector<HTMLSelectElement>("[data-m05-format]")?.value??"essentielle"
  root.dataset.m05Format=format
  const header=node("div","m05-heading")
  const imageSlot=node("div","m05-portrait")
  if(v.artwork){
    const img=node("img")
    img.src=v.artwork.url;img.alt=v.artwork.alt;img.loading="lazy";img.decoding="async"
    imageSlot.append(img)
  }else imageSlot.append(node("span","", "Portrait facultatif"))
  const identity=node("div","m05-identity")
  identity.append(node("p","m05-eyebrow",
    (v.kind==="pnj"?"Personnage non joueur":"Créature")+" · "+
    v.archetype+" · Niveau "+v.level))
  identity.append(node("h3","",v.name))
  if(v.profession)paragraph(identity,v.profession)
  paragraph(identity,(v.status==="brouillon"?"Brouillon":
    v.status==="jeu_valide"?"Profil de jeu validé localement":
    "Documentaire approuvée localement")+" · ne vaut pas validation canonique","m05-status")
  header.append(imageSlot,identity);root.replaceChildren(header)
  if(v.description)paragraph(root,v.description,"m05-teaser")
  const essential=node("div","m05-essential")
  const stats=node("div","m05-stats")
  for(const s of v.stats){
    const block=node("div","m05-stat")
    block.append(node("span","m05-stat-title",s.title),
      node("strong","m05-stat-raw",String(s.raw)),
      node("span","m05-stat-bonus","Bonus +"+s.bonus))
    stats.append(block)
  }
  essential.append(stats)
  const quick=node("div","m05-quick")
  line(quick,"PV maximum",String(v.pvMax))
  if(v.manaMax)line(quick,"Mana maximum",String(v.manaMax))
  line(quick,"Attaque de mêlée","5d6 + "+(v.attack.statBonus+v.attack.masteryBonus)+" (+ situation)")
  line(quick,"Seuil défensif physique",String(v.defenses[0].threshold))
  line(quick,"Absorption physique",String(v.defenses[0].absorption))
  line(quick,"Rôle",v.role)
  essential.append(quick);root.append(essential)
  const profiles=node("div","m05-panels")
  root.append(profiles)
  const attributes=section(profiles,"stats","Caractéristiques et maîtrises",opened)
  paragraph(attributes,"Un score brut n'est pas directement ajouté au jet : il est converti en bonus logarithmique.")
  for(const s of v.stats)line(attributes,s.title,
    s.raw+" → +"+s.bonus+" (référence M03 : "+s.initial+
    (s.delta?", écart actuel "+(s.delta>0?"+":"")+s.delta:"")+")")
  if(v.masteries.length){
    for(const m of v.masteries)line(attributes,"Maîtrise "+m.name,"Rang "+m.rank+" → +"+m.bonus)
  }else paragraph(attributes,"Aucune maîtrise positive enregistrée.")
  const defenses=section(profiles,"defenses","Défense, protections et résistances",opened)
  paragraph(defenses,"Le seuil de résistance indique s'il est possible de toucher. La protection absorbe ensuite une partie des dégâts.")
  for(const d of v.defenses){
    const part=node("div","m05-def-block")
    line(part,"Défense "+d.kind,String(d.threshold)+" (bonus de seuil MJ +"+d.defensiveBonus+")")
    line(part,"Maîtrise défensive retenue",String(d.defensiveMastery))
    line(part,"Protection innée",String(d.innate))
    line(part,"Protection d'équipement",String(d.equipment))
    line(part,"Protection MJ amortie",String(d.extra))
    line(part,"Absorption totale",String(d.absorption))
    defenses.append(part)
  }
  const combat=section(profiles,"combat","Combat et risques estimés",opened)
  paragraph(combat,"Modèle de référence : une attaque physique de mêlée, sans capacité narrative active.")
  line(combat,"Bonus d'attaque","Physique +"+v.attack.statBonus+
    " + maîtrise "+v.attack.masteryBonus)
  line(combat,"Dégâts bruts sur réussite","Base "+v.attack.baseDamage+
    " + impact N"+v.level+" ("+v.attack.impactBonus+") + maîtrise "+
    v.attack.masteryBonus)
  line(combat,"Pénétration",String(v.attack.penetration))
  if(v.matchup){
    line(combat,"Réussite de l'attaque",pct(v.matchup.creature.hits))
    line(combat,"Contact (dont effleurement)",pct(v.matchup.creature.contacts))
    line(combat,"Blessure effective",pct(v.matchup.creature.woundChance))
    line(combat,"Dégâts attendus par tentative",num(v.matchup.creature.expectedDamage))
    line(combat,"Attaque adverse, réussite",pct(v.matchup.opponent.hits))
    line(combat,"Attaque adverse, blessure",pct(v.matchup.opponent.woundChance))
    paragraph(combat,v.matchup.assumptions,"m05-caution")
  }else paragraph(combat,"Choisir un adversaire dans l'Atelier pour calculer les probabilités exactes.")
  const abilities=section(profiles,"abilities","Capacités et limitations",opened)
  if(v.abilities.length)for(const a of v.abilities){
    const item=node("div","m05-ability")
    item.append(node("strong","",a.name))
    if(a.description)paragraph(item,a.description)
    if(a.limitations)paragraph(item,"Limites : "+a.limitations)
    paragraph(item,a.approvedByGM?"Mention MJ locale : approuvée":"Non approuvée","m05-caution")
    abilities.append(item)
  }else paragraph(abilities,"Aucune capacité enregistrée : ne pas en déduire une incapacité de l'espèce.")
  paragraph(abilities,"Les capacités narratives ne deviennent jamais des effets M03 exécutables par leur seule description.","m05-caution")
  const lore=section(profiles,"lore","Histoire et comportement",opened)
  if(v.origin)line(lore,"Origine déclarée",v.origin)
  if(v.description)paragraph(lore,v.description)
  if(!v.description&&!v.origin)paragraph(lore,"Aucune information documentaire sourcée associée.")
  paragraph(lore,"Les notes privées du MJ ne sont jamais incluses dans cette fiche de consultation ou l'impression.","m05-caution")
  const sources=section(profiles,"sources","Sources, statuts et lien documentaire",opened)
  line(sources,"Profil de jeu",v.id)
  line(sources,"Moteur",v.sourceRuleset+" · modules M01/M03")
  line(sources,"Validation mécanique",v.status+" (statut local de fiche)")
  if(v.documentary){
    line(sources,"Document lié (déclaratif)",v.documentary.id+" · "+v.documentary.type)
    if(v.documentary.source)line(sources,"Provenance déclarée",v.documentary.source)
    if(v.documentary.sourceVersion)line(sources,"Version déclarée",v.documentary.sourceVersion)
    if(v.documentary.canonStatut)line(sources,"Canon documentaire déclaré",v.documentary.canonStatut)
    paragraph(sources,"Lien non vérifié : B-001 doit contrôler le code, la source, le statut et la publication. Aucune canonisation ni navigation automatique.","m05-caution")
  }else paragraph(sources,"Aucun dossier documentaire lié. L'absence de lien n'est pas une preuve d'absence dans le monde.")
  if(v.artwork)paragraph(sources,"Image autorisée : "+v.artwork.author+" · droit "+v.artwork.rights+
    " · "+v.artwork.status)
  const explanation=section(profiles,"math","Inspecteur mathématique — calculs détaillés",opened)
  paragraph(explanation,"La valeur de base de la génération dépend du niveau : 3 + partie entière de (niveau − 1) × 0,55. Les écarts d'archétype sont fournis par M03.")
  // Le détail de génération officiel est le profil initial retourné par M03 ;
  // la formule ci-dessus est pédagogique et non un calcul substitutif.
  line(explanation,"Profil initial M03",v.stats.map(s=>s.title+" "+s.initial).join(" / "))
  line(explanation,"Base de PV officielle",String(v.baseHealth))
  line(explanation,"PV initiaux "+v.archetype,String(v.referenceHealth))
  line(explanation,"PV de la fiche actuelle",String(v.pvMax))
  paragraph(explanation,"Bonus caractéristique E(c) = partie entière de 3 × log2(1 + c/3).")
  paragraph(explanation,"Bonus de maîtrise = partie entière de log2(1 + rang).")
  paragraph(explanation,"Résistance physique : 15 + bonus du meilleur de Physique/Agilité + meilleur bonus de maîtrise défensive + bonus de seuil MJ.")
  paragraph(explanation,"Protection : innée + équipement + bonus d'absorption MJ amorti. Toucher et blesser sont deux événements distincts.")
  paragraph(explanation,"Les probabilités proviennent de 7 776 issues équiprobables de 5d6, avec échec naturel 5–7. Le moteur M03 décide le contact, l'absorption et les dégâts.")
  if(v.matchup){
    line(explanation,"Réussite / blessure de la créature",pct(v.matchup.creature.hits)+" / "+pct(v.matchup.creature.woundChance))
    line(explanation,"Dégâts moyens créature / adversaire",num(v.matchup.creature.expectedDamage)+" / "+num(v.matchup.opponent.expectedDamage))
    paragraph(explanation,"Ce sont des espérances théoriques, non des résultats de playtest.","m05-caution")
  }
}
