import {resistanceScore,resolveOpposition,attackMastery,effectiveProtection,innateProtection,equipmentProtection} from "./atelier5d6-opposition"
import type {ResistanceKind,ImpactMode,OppositionResult} from "./atelier5d6-opposition"
type Stat = "physique" | "agilite" | "esprit" | "presence"
type Role = "pj" | "pnj" | "creature"
type Mastery = "lames" | "haches" | "arcs" | "runes" | "soins" | "negociation" | "survie" | "artisanat" | "magie"
const MASTERIES: Mastery[] = ["lames","haches","arcs","runes","soins","negociation","survie","artisanat","magie"]
const blankMasteries = (): Record<Mastery,number> => ({lames:0,haches:0,arcs:0,runes:0,soins:0,negociation:0,survie:0,artisanat:0,magie:0})
const totalMasteries = (m:Record<Mastery,number>) => MASTERIES.reduce((sum,k)=>sum+m[k],0)
type Domain = "magie" | "melee" | "tir" | "nego" | "autre"
const DOMAINS: Domain[] = ["magie", "melee", "tir", "nego", "autre"]
const makeStreaks = (): Record<Domain,number> => ({magie:0,melee:0,tir:0,nego:0,autre:0})
const validSourceRef = (v:unknown):string => typeof v==="string" && /^(personnages|creatures)\/[A-Za-z0-9-]{2,100}(?:\/[A-Za-z0-9-]{2,100}){0,2}$/.test(v) ? v : ""
type Mode = "pj" | "mj" | "ia"
const ITEM_CATEGORIES = {monnaie:"🪙",arme:"⚔️",armure:"🛡️",artefact:"✨",consommable:"🧪",ingredient:"🌿",outil:"🔧",munition:"🏹",livre:"📜",bijou:"💍",provision:"🥖",materiau:"🪵",quete:"🗝️",autre:"🎒"} as const
type ItemCategory = keyof typeof ITEM_CATEGORIES
type GameItem = {id:string;templateId:string;name:string;category:ItemCategory;quantity:number;description:string;value:string}
type Group = {id:string;name:string;rank:number;members:string[];certifications:string[];awards:string[];promotionEntries:string[]}
type Mission = {id:string;level:number;title:string;category:string;brief:string;reward:string;certifications:string[];statut:string}
type MissionEntry = {id:string;groupId:string;missionId:string;category:string;rank:number;status:"terminee"|"repli"|"echouee";summary:string;reward:string;date:string}
const CERTIFICATIONS = [
  ["premiers-secours","Premiers secours et extraction"],["orientation","Orientation, navigation et rapports"],
  ["protection-civile","Protection des civils et discipline"],["reconnaissance-avancee","Reconnaissance en terrain dangereux"],
  ["risques-magiques","Risques magiques et runes"],["intervention-specialisee","Intervention spécialisée / crise majeure"]
] as const
const maxStatCredits = (level:number) => 12+6*(level-1)
const xpRequired = (level:number) => level<=1?0:5*(level-1)**3
const missionXpReward = (rank:number) => 10*rank
const levelResourceGain = (level:number) => level>=25?36:level>=21?24:level>=13?12:6
const gainBetween = (first:number,last:number) => {
  let gain=0
  for(let l=first+1;l<=last;l++)gain+=levelResourceGain(l)
  return gain
}
function validatedItem(raw:unknown):GameItem|null{
  if(!raw||typeof raw!=="object")return null
  const o=raw as Record<string,unknown>
  if(typeof o.name!=="string"||!o.name.trim())return null
  const cat=typeof o.category==="string"&&o.category in ITEM_CATEGORIES?o.category as ItemCategory:"autre"
  return {id:typeof o.id==="string"?o.id.slice(0,80):uniqueId(),templateId:clean(o.templateId,80),
    name:clean(o.name,90),category:cat,quantity:clamp(o.quantity,1,999,1),
    description:clean(o.description,600),value:clean(o.value,100)}
}
function validatedGroup(raw:unknown):Group|null{
  if(!raw||typeof raw!=="object")return null
  const o=raw as Record<string,unknown>
  if(typeof o.name!=="string"||!o.name.trim())return null
  return {id:clean(o.id,80)||uniqueId(),name:clean(o.name,90),rank:clamp(o.rank,1,12,1),
    members:Array.isArray(o.members)?o.members.filter((x:unknown):x is string=>typeof x==="string").slice(0,60).map(x=>x.slice(0,100)):[],
    certifications:Array.isArray(o.certifications)?o.certifications.filter((x:unknown):x is string=>typeof x==="string"&&CERTIFICATIONS.some(c=>c[0]===x)).slice(0,6):[],
    awards:Array.isArray(o.awards)?o.awards.filter((x:unknown):x is string=>typeof x==="string").slice(-30).map(x=>x.slice(0,280)):[],
    promotionEntries:Array.isArray(o.promotionEntries)?o.promotionEntries.filter((x:unknown):x is string=>typeof x==="string").slice(0,200).map(x=>x.slice(0,80)):[]}
}
function validatedEntry(raw:unknown):MissionEntry|null{
  if(!raw||typeof raw!=="object")return null
  const o=raw as Record<string,unknown>
  if(!["terminee","repli","echouee"].includes(String(o.status)))return null
  return {id:clean(o.id,80)||uniqueId(),groupId:clean(o.groupId,80),missionId:clean(o.missionId,80),
    category:clean(o.category,90),rank:clamp(o.rank,1,12,1),
    status:o.status as MissionEntry["status"],summary:clean(o.summary,1200),
    reward:clean(o.reward,280),date:clean(o.date,30)}
}

type Defenses = Record<ResistanceKind,number>
const freshDefenses=():Defenses=>({physique:0,magie:0,mental:0})
const DEFENSE_KINDS:ResistanceKind[]=["physique","magie","mental"]
type Sheet = {
  id: string; name: string; kind: Role; profession: string; skill: number
  stats: Record<Stat, number>; pv: number; pvMax: number
  resistanceBonus:Defenses; protection:Defenses; equipmentGrades:Defenses
  mana: number; manaMax: number; emprise: number
  level: number; highestLevel: number; masteries: Record<Mastery,number>
  ascensionAuthorized:boolean; divineLimit:number; ascensionWitness:string; divineMilestones:string[]; inventory:GameItem[]
  convertedCredits:number; talentPointsSpent:number; xp:number
  description: string; portrait: string
  vocation: string; talents: string; boons: string; curses: string; items: string
  sourceRef: string; sourceTitle: string
  streaks: Record<Domain,number>; lastIncident: string
  notes: string; gmNotes: string
}
type Roll = { name: string; dice: number[]; total: number; target: number; text: string }
type State = { sheets: Sheet[]; activeId: string; mode: Mode; log: Roll[]
  groups:Group[]; activeGroupId:string; templates:GameItem[]; missionLog:MissionEntry[] }
// Tables d'incidents de playtest : une suggestion à interpréter, jamais un malus automatique supplémentaire.
const INCIDENTS: Record<Exclude<Domain,"autre">,string[]> = {
  magie: [
    "Une résonance perturbe un objet proche : le groupe doit sécuriser le lieu.",
    "Le sort laisse une signature facile à suivre par un observateur compétent.",
    "L'énergie résiduelle attire une créature curieuse, pas nécessairement hostile.",
    "Une propriété inattendue du lieu complique le prochain essai.",
    "L'échec révèle que la formule employée vient d'une tradition différente.",
    "Un témoin reconnaît le phénomène et demande une faveur en échange de son aide.",
    "L'effet a échoué, mais un symbole ancien devient visible quelques secondes.",
    "Un allié comprend ce qui manque et peut proposer un autre rituel.",
    "Une conséquence gênante met au jour une ancienne protection oubliée.",
    "Le faux départ révèle comment arrêter le sort sans danger.",
    "Une trace de magie attire plus tard l'attention d'un possible mentor.",
    "Le raté fait apparaître une issue inattendue, à vérifier avant de l'utiliser."
  ],
  melee: [
    "Une arme ou prise reste coincée dans le décor ; il faut se repositionner.",
    "L'adversaire comprend la garde et exploite une ouverture visible.",
    "La mêlée renverse un objet important qu'il faudra protéger.",
    "Le choc bloque momentanément un passage pour tous.",
    "Un appui cède : l'environnement devient un enjeu de la scène.",
    "Un témoin intervient, mais son intention est incertaine.",
    "Une parade ratée révèle la faiblesse de l'armure ennemie.",
    "Un camarade voit une ouverture pour protéger un civil.",
    "Le terrain offre un détour plus sûr que l'assaut frontal.",
    "La collision pousse l'ennemi loin d'une personne menacée.",
    "Un rival hésite, laissant envisager une issue négociée.",
    "Un coup manqué brise une vieille entrave utile aux héros."
  ],
  tir: [
    "Le projectile se perd et dévoile votre position.",
    "Une mauvaise trajectoire oblige à sécuriser des témoins.",
    "La cible change de couvert ; la prochaine position doit être choisie.",
    "La corde ou le mécanisme exige une inspection avant un autre tir.",
    "Le tir touche un obstacle qui modifie les lignes de vue.",
    "Une silhouette surgit dans le champ : suspendre le tir devient prudent.",
    "Le projectile signale une trace cachée dans le décor.",
    "Le rebond révèle un mécanisme ou une surface inhabituelle.",
    "L'impact détache une pièce du décor et ouvre une piste.",
    "Un allié repère un meilleur angle de tir.",
    "Un son attire l'attention d'un renfort allié possible.",
    "La flèche manque sa cible mais coupe un lien entravant un passage."
  ],
  nego: [
    "Le ton employé offense un témoin ; il faudra restaurer la confiance.",
    "Une information est mal interprétée et la discussion se crispe.",
    "Le partenaire exige une garantie que personne n'avait prévue.",
    "Un rival profite publiquement du malentendu.",
    "Une ancienne querelle refait surface au mauvais moment.",
    "Un accord semble proche mais révèle un coût caché.",
    "La réaction hostile montre à quel point un sujet est sensible.",
    "Un interlocuteur secondaire se révèle moins opposé qu'annoncé.",
    "Le refus dévoile la véritable priorité de l'autre partie.",
    "Une porte se ferme mais une médiation indépendante devient possible.",
    "Un témoin décide de partager discrètement une information utile.",
    "La négociation échoue, mais une nouvelle alliance se dessine pour plus tard."
  ]
}
const STORAGE = "archives-alrick-atelier-5d6-v1"
const STATS: Stat[] = ["physique", "agilite", "esprit", "presence"]
const clamp = (n: unknown, min: number, max: number, def: number) => {
  const value = typeof n === "number" || typeof n === "string" ? Number(n) : NaN
  return Number.isFinite(value) ? Math.max(min, Math.min(max, Math.trunc(value))) : def
}
const clean = (x: unknown, max: number) => typeof x === "string" ? x.slice(0, max) : ""
const uniqueId = () => `${Date.now()}-${Math.random().toString(36).slice(2,10)}`
function fresh(kind: Role = "pj"): Sheet {
  return { id: uniqueId(), name: kind === "pj" ? "Mon personnage" : "Nouveau profil",
    kind, profession: "Voyageur", skill: 0,
    stats: {physique:3, agilite:3, esprit:3, presence:3},
    resistanceBonus:freshDefenses(),protection:freshDefenses(),equipmentGrades:freshDefenses(),
    pv:12, pvMax:12, mana:0, manaMax:0, emprise:0, level:1, highestLevel:1, masteries:blankMasteries(), ascensionAuthorized:false, divineLimit:20, ascensionWitness:"", divineMilestones:[], inventory:[],
    convertedCredits:0,talentPointsSpent:0,xp:0,
    description:"", portrait:"", vocation:"", talents:"", boons:"", curses:"", items:"",
    sourceRef:"", sourceTitle:"", streaks:makeStreaks(), lastIncident:"", notes:"", gmNotes:"" }
}
function validateSheet(raw: unknown): Sheet | null {
  if (!raw || typeof raw !== "object") return null
  const obj = raw as Record<string, unknown>
  if (typeof obj.name !== "string" || !obj.name.trim()) return null
  const values = (obj.stats ?? obj.attributes) as Record<string,unknown> | undefined
  if (!values || typeof values !== "object" || !STATS.every(key => Number.isFinite(Number(values[key])))) return null
  const kind: Role = obj.kind === "pnj" || obj.kind === "creature" ? obj.kind : "pj"
  const pvMax = clamp(obj.pvMax, 1, 999, 12), manaMax = clamp(obj.manaMax, 0, 999, 0)
  const priorStreaks = obj.streaks && typeof obj.streaks==="object" ? obj.streaks as Record<string,unknown> : {}
  const streaks = makeStreaks()
  for(const d of DOMAINS)streaks[d]=clamp(priorStreaks[d],0,2,0)
  const resistanceBonus=freshDefenses(),protection=freshDefenses(),equipmentGrades=freshDefenses()
  const previousResistance=obj.resistanceBonus&&typeof obj.resistanceBonus==="object"?obj.resistanceBonus as Record<string,unknown>:{}
  const previousProtection=obj.protection&&typeof obj.protection==="object"?obj.protection as Record<string,unknown>:{}
  const oldEquipment=obj.equipmentGrades&&typeof obj.equipmentGrades==="object"?obj.equipmentGrades as Record<string,unknown>:{}
  for(const key of DEFENSE_KINDS){
    resistanceBonus[key]=clamp(previousResistance[key],0,8,0)
    protection[key]=clamp(previousProtection[key],0,60,0)
    equipmentGrades[key]=clamp(oldEquipment[key],0,5,0)
  }
  const level=clamp(obj.level,1,25,1)
  const masteries=blankMasteries()
  const storedMasteries=obj.masteries && typeof obj.masteries==="object" ? obj.masteries as Record<string,unknown> : {}
  for(const k of MASTERIES) masteries[k]=clamp(storedMasteries[k],0,12,0)
  const portrait=typeof obj.portrait==="string" && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(obj.portrait) && obj.portrait.length<180000 ? obj.portrait : ""
  return {id:uniqueId(),name:clean(obj.name,90),kind, profession:clean(obj.profession,90),
    skill:clamp(obj.skill,0,2,0),
    stats:{physique:clamp(values.physique,1,12,3),agilite:clamp(values.agilite,1,12,3),
      esprit:clamp(values.esprit,1,12,3),presence:clamp(values.presence,1,12,3)},
    pv:clamp(obj.pv,0,pvMax,pvMax),pvMax,
    mana:clamp(obj.mana,0,manaMax,0),manaMax,resistanceBonus,protection,equipmentGrades,
    emprise:clamp(obj.emprise,0,12,0),level,highestLevel:clamp(obj.highestLevel,level,25,level),
    masteries,convertedCredits:clamp(obj.convertedCredits,0,6*(level-1),0),
    talentPointsSpent:clamp(obj.talentPointsSpent,0,24,0),
    xp:clamp(obj.xp,0,999999,0),
    ascensionAuthorized:obj.ascensionAuthorized===true||level>20,
    divineLimit:clamp(obj.divineLimit,20,25,level>20?level:20),
    ascensionWitness:clean(obj.ascensionWitness,300),
    divineMilestones:Array.isArray(obj.divineMilestones)?obj.divineMilestones.slice(0,5).map(x=>clean(x,300)):[],
    inventory:Array.isArray(obj.inventory)?obj.inventory.slice(0,150).map(validatedItem).filter((x):x is GameItem=>x!==null):[],
    description:clean(obj.description,1200),portrait,
    vocation:clean(obj.vocation,160),talents:clean(obj.talents,1600),boons:clean(obj.boons,1400),
    curses:clean(obj.curses,1400),items:clean(obj.items,1400),
    sourceRef:validSourceRef(obj.sourceRef),sourceTitle:clean(obj.sourceTitle,160),
    streaks,lastIncident:clean(obj.lastIncident,500),
    notes:clean(obj.notes,2500),gmNotes:clean(obj.gmNotes,2500)}
}
function setupAtelier5d6() {
  const root = document.querySelector<HTMLElement>("#atelier-5d6")
  if (!root) return
  const host: HTMLElement = root
  const q = <T extends HTMLElement>(selector: string) => host.querySelector<T>(selector)!
  const status = q<HTMLElement>("[data-status]")
  const message = (s: string) => { status.textContent = s }
  const publicRefs = new Map<string,{title:string,description:string}>()
  let refsLoaded = false
  let refsLoading = false
  const rootPath = window.location.pathname.includes("/jouer/") ? window.location.pathname.split("/jouer/")[0] : ""
  const normalize = (s:string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("fr")
  function renderRefs(){
    const box=q<HTMLElement>("[data-reference-results]")
    box.replaceChildren()
    const query=normalize(q<HTMLInputElement>("[data-reference-query]").value.trim())
    if(!refsLoaded){box.textContent=refsLoading?"Chargement de l'index public…":"Index public indisponible.";return}
    const matches=Array.from(publicRefs.entries()).filter(([slug,item])=> !query || normalize(item.title+" "+item.description+" "+slug).includes(query))
      .sort((a,b)=>a[1].title.localeCompare(b[1].title,"fr")).slice(0,15)
    if(!matches.length){box.textContent="Aucun personnage ou créature public ne correspond à cette recherche.";return}
    for(const [slug,item] of matches){
      const row=document.createElement("div")
      const link=document.createElement("a")
      link.textContent=item.title
      link.href=`${rootPath}/${slug}`
      link.target="_blank"
      link.rel="noopener noreferrer"
      link.title="Ouvrir la fiche publique sans télécharger"
      const button=document.createElement("button")
      button.type="button";button.dataset.adaptRef=slug
      button.textContent="Créer adaptation 5d6"
      row.append(link,button);box.append(row)
    }
  }
  async function loadPublicRefs(signal:AbortSignal){
    if(refsLoaded || refsLoading)return
    refsLoading=true;renderRefs()
    try{
      const response=await fetch(`${rootPath}/static/contentIndex.json`,{signal})
      if(!response.ok)throw Error("Index non accessible")
      const data:unknown=await response.json()
      if(!data || typeof data!=="object" || Array.isArray(data))throw Error("Format d'index incompatible")
      for(const [slug,obj] of Object.entries(data as Record<string,unknown>)){
        if(!validSourceRef(slug) || !obj || typeof obj!=="object")continue
        const value=obj as Record<string,unknown>
        if(typeof value.title!=="string" || !value.title.trim())continue
        publicRefs.set(slug,{title:clean(value.title,160),description:clean(value.description,240)})
      }
      refsLoaded=true
      renderRefs()
    }catch{
      if(!signal.aborted)q<HTMLElement>("[data-reference-results]").textContent="Recherche indisponible. Les fiches peuvent être consultées depuis la Bibliothèque."
    }finally{refsLoading=false}
  }
  let state: State = {sheets:[fresh()],activeId:"",mode:"pj",log:[],
    groups:[],activeGroupId:"",templates:[],missionLog:[]}
  try {
    const data = localStorage.getItem(STORAGE)
    if (data) {
      const parsed = JSON.parse(data) as Partial<State>
      if (Array.isArray(parsed.sheets)) {
        const loaded = parsed.sheets.slice(0,60).map(validateSheet).filter((s):s is Sheet => s !== null)
        if (loaded.length) {
          // Conserver les identifiants utilisés pour le personnage actif, sans faire confiance à leur contenu.
          parsed.sheets.slice(0,60).forEach((item,i)=>{
            if (loaded[i] && item && typeof item === "object" && typeof item.id === "string") loaded[i].id = clean(item.id,100)
          })
          state.sheets = loaded
          state.activeId = typeof parsed.activeId === "string" ? parsed.activeId : loaded[0].id
          if (!state.sheets.some(s=>s.id===state.activeId)) state.activeId = loaded[0].id
        }
      }
      state.mode = parsed.mode === "mj" || parsed.mode === "ia" ? parsed.mode : "pj"
      if(Array.isArray(parsed.groups))state.groups=parsed.groups.slice(0,20).map(validatedGroup).filter((x):x is Group=>x!==null)
      if(Array.isArray(parsed.templates))state.templates=parsed.templates.slice(0,150).map(validatedItem).filter((x):x is GameItem=>x!==null)
      if(Array.isArray(parsed.missionLog))state.missionLog=parsed.missionLog.slice(-400).map(validatedEntry).filter((x):x is MissionEntry=>x!==null)
      state.activeGroupId=typeof parsed.activeGroupId==="string" && state.groups.some(g=>g.id===parsed.activeGroupId)
        ?parsed.activeGroupId:(state.groups[0]?.id??"")
      if (Array.isArray(parsed.log)) state.log = parsed.log.slice(0,20).filter((x):x is Roll =>
        !!x && typeof x === "object" && typeof x.text === "string" && typeof x.name === "string" &&
        Array.isArray(x.dice) && x.dice.length === 5 && x.dice.every((d:unknown)=>typeof d==="number" && d>=1 && d<=6)
      ).map(x=>({...x,name:clean(x.name,90),text:clean(x.text,180)}))
    }
  } catch { message("Une sauvegarde locale n'a pas pu être lue. Une fiche neuve est disponible.") }
  if (!state.activeId) state.activeId = state.sheets[0].id
  function current(): Sheet { return state.sheets.find(s=>s.id===state.activeId) ?? state.sheets[0] }
  function persist() {
    try { localStorage.setItem(STORAGE,JSON.stringify(state)) }
    catch { message("Stockage indisponible ou saturé. Exportez votre fiche en JSON pour la conserver.") }
  }
  function refreshPoints() {
    const s=current()
    const used=STATS.reduce((acc,k)=>acc+s.stats[k],0)
    const el=q<HTMLElement>("[data-points]")
    const limit=maxStatCredits(s.highestLevel)-s.convertedCredits
    const legal=s.kind!=="pj" || (used>=12 && used<=limit && (s.highestLevel!==1 || (used===12 && STATS.every(k=>s.stats[k]<=5))))
    el.textContent=s.kind==="pj" ? String(used)+" points investis · "+String(Math.max(0,limit-used))+" crédits restants · plafond 12/score" : String(used)+" points (MJ)"
    el.style.color=!legal ? "#e7ac9c" : ""
    const masteryUsed=totalMasteries(s.masteries), masteryLimit=2*(s.highestLevel-1)
    const masteryEl=q<HTMLElement>("[data-mastery-points]")
    masteryEl.textContent=`${masteryUsed} / ${masteryLimit} points · ${Math.max(0,masteryLimit-masteryUsed)} en réserve`
    masteryEl.style.color=masteryUsed>masteryLimit?"#e7ac9c":""
    const earnedTalents=Math.floor(s.convertedCredits/6)
    q<HTMLElement>("[data-talent-points]").textContent="Talents : "+s.talentPointsSpent+" / "+earnedTalents+
      " utilisés · "+(earnedTalents-s.talentPointsSpent)+" disponibles"
    q<HTMLInputElement>("[data-talent-spent]").value=String(s.talentPointsSpent)
    q<HTMLElement>("[data-xp-info]").textContent="Expérience : "+s.xp+
      " XP · seuil du niveau "+Math.min(25,s.level+1)+" : "+xpRequired(Math.min(25,s.level+1))+
      " XP cumulés. Les niveaux élevés exigent des épreuves spécifiques."

    q<HTMLSelectElement>("[data-active]").selectedOptions[0]?.setAttribute("data-active-points",String(used))
  }
  function refreshRoster() {
    const sel=q<HTMLSelectElement>("[data-active]")
    sel.replaceChildren()
    for(const s of state.sheets) sel.add(new Option(`${s.name || "Sans nom"} · ${s.kind.toUpperCase()}`,s.id))
    sel.value=current().id
  }
  function setForm() {
    const s=current()
    host.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[data-field]").forEach(el=>{
      const key=el.dataset.field as keyof Sheet
      el.value=String(s[key] ?? "")
    })
    for(const k of STATS) q<HTMLInputElement>(`[data-stat="${k}"]`).value=String(s.stats[k])
    for(const k of MASTERIES) q<HTMLInputElement>(`[data-mastery="${k}"]`).value=String(s.masteries[k])
    for(const k of DEFENSE_KINDS)
      q<HTMLInputElement>(`[data-defense-gear="${k}"]`).value=String(s.equipmentGrades[k])
    for(const k of DEFENSE_KINDS){
      q<HTMLInputElement>(`[data-defense-resistance="${k}"]`).value=String(s.resistanceBonus[k])
      q<HTMLInputElement>(`[data-defense-protection="${k}"]`).value=String(s.protection[k])
    }
    q<HTMLElement>("[data-resistance-summary]").textContent=DEFENSE_KINDS.map(k=>
      k+" : seuil "+resistanceScore(s,k)+" · protection totale "+effectiveProtection(s,k)+
      " (innée "+innateProtection(s.level,k)+", équipement "+equipmentProtection(s.equipmentGrades[k],k)+
      ", bonus MJ "+s.protection[k]+")").join(" | ")
    const portrait=q<HTMLImageElement>("[data-portrait-preview]")
    portrait.hidden=!s.portrait
    if(s.portrait)portrait.src=s.portrait
    else portrait.removeAttribute("src")
    q<HTMLSelectElement>("[data-roll-skill]").value=String(s.skill)
    q<HTMLInputElement>("[data-ascension]").checked=s.ascensionAuthorized
    q<HTMLSelectElement>("[data-divine-limit]").value=String(s.divineLimit)
    q<HTMLElement>("[data-divine-history]").textContent=s.divineMilestones.length
      ?s.divineMilestones.map((x,i)=>"Niveau "+(i+21)+" : "+(x||"non documenté")).join(" · ")
      :"Aucune épreuve divine consignée."
    q<HTMLElement>("[data-ascension-status]").textContent=s.level>=21
      ?"Ascension exceptionnelle : niveau "+s.level+"/25 — autorisation MJ jusqu'à "+s.divineLimit+"."
       :"Niveaux 21–25 : cinq épreuves divines indépendantes, validées par le MJ."
    refreshPoints()
    const source=q<HTMLElement>("[data-source-meta]")
    source.textContent=s.sourceRef
      ? `Source : ${s.sourceTitle || s.sourceRef} (${s.sourceRef}). Les statistiques 5d6 sont une adaptation libre non canonique.`
      : "Fiche libre sans référence encyclopédique. Les valeurs de jeu restent des propositions."
    refreshStreaks()
    renderInventory()
    renderOpposition()
  }
  function refreshStreaks(){
    const s=current()
    q<HTMLElement>("[data-streaks]").textContent=`Échecs suivis : ${DOMAINS.filter(d=>d!=="autre").map(d=>`${d} ${s.streaks[d]}/3`).join(" · ")}. Trois échecs du même type déclenchent un incident d12 facultatif.`
    const box=q<HTMLElement>("[data-incident]")
    box.hidden=!s.lastIncident
    box.textContent=s.lastIncident
  }
  function refreshMode(){
    host.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.mode===state.mode)))
    q<HTMLElement>("[data-mj-tools]").hidden=state.mode==="pj"
    q<HTMLElement>("[data-ai-only]").hidden=state.mode!=="ia"
    renderAI()
    if(state.mode!=="pj")void loadPublicRefs(controller.signal)
  }
  function refreshLog(){
    const log=q<HTMLOListElement>("[data-log]")
    log.replaceChildren()
    if(!state.log.length){const li=document.createElement("li");li.textContent="Aucun jet enregistré.";log.append(li);return}
    for(const r of state.log){
      const li=document.createElement("li")
      li.textContent=`${r.name} — [${r.dice.join(", ")}] = ${r.total} / ${r.target} : ${r.text}`
      log.append(li)
    }
  }

  let pendingTransfer=""
  let pendingImpact:{targetId:string;damage:number;attackerName:string}|null=null
  let pendingCounter:{attackerId:string;defenderId:string}|null=null
  let missions:Mission[]=[]
  async function loadMissions(signal:AbortSignal){
    try{
      const response=await fetch(rootPath+"/static/atelier5d6-missions.json",{signal})
      if(!response.ok)throw Error("catalogue inaccessible")
      const parsed:unknown=await response.json()
      if(!parsed||typeof parsed!=="object"||!("missions" in parsed)||!Array.isArray(parsed.missions))throw Error("format")
      missions=parsed.missions.filter((x:unknown):x is Mission=>{
        if(!x||typeof x!=="object")return false
        const m=x as Record<string,unknown>
        return typeof m.id==="string"&&/^AV-[0-9]{2}$/.test(m.id)
          &&typeof m.title==="string"&&typeof m.category==="string"
          &&typeof m.level==="number"&&m.level>=1&&m.level<=12
          &&m.statut==="proposition_non_jouee"&&Array.isArray(m.certifications)
      }).slice(0,60)
      const menu=q<HTMLSelectElement>("[data-mission-select]")
      menu.replaceChildren(new Option("Sélectionner une mission",""))
      for(const m of missions)menu.add(new Option("G"+m.level+" · "+m.id+" · "+m.title,m.id))
      renderMissionPreview()
    }catch{
      if(!signal.aborted)q<HTMLElement>("[data-mission-preview]").textContent="Catalogue public de missions indisponible. Réessayer au prochain chargement."
    }
  }
  function activeGroup():Group|undefined{return state.groups.find(g=>g.id===state.activeGroupId)}
  function renderMissionPreview(){
    const id=q<HTMLSelectElement>("[data-mission-select]").value
    const mission=missions.find(x=>x.id===id)
    const group=activeGroup()
    const missing=mission&&group?mission.certifications.filter(c=>!group.certifications.includes(c)):[]
    q<HTMLElement>("[data-mission-preview]").textContent=mission
      ?"Niveau "+mission.level+" · "+mission.category+". "+mission.brief+
      " Récompense envisagée : "+mission.reward+(missing.length?" Qualifications manquantes : "+missing.join(", ")+".":"")
      :"Choisir une mission du catalogue public pour voir son accroche sans spoilers."
  }
  function renderInventory(){
    const list=q<HTMLUListElement>("[data-inventory-list]")
    list.replaceChildren()
    const sheet=current()
    if(!sheet.inventory.length){const li=document.createElement("li");li.textContent="Sac vide.";list.append(li)}
    for(const item of sheet.inventory){
      const li=document.createElement("li")
      li.append(document.createTextNode(ITEM_CATEGORIES[item.category]+" "+item.name+" ×"+item.quantity+
        (item.value?" · "+item.value:"")+(item.description?" — "+item.description:"")))
      const give=document.createElement("button");give.type="button"
      give.dataset.itemSelect=item.id;give.textContent=pendingTransfer===item.id?"À transférer ✓":"Transférer"
      const remove=document.createElement("button");remove.type="button"
      remove.dataset.itemRemove=item.id;remove.textContent="Retirer"
      li.append(give,remove);list.append(li)
    }
    const templates=q<HTMLSelectElement>("[data-template-select]")
    const selected=templates.value
    templates.replaceChildren(new Option("Choisir un modèle MJ",""))
    for(const t of state.templates)templates.add(new Option(ITEM_CATEGORIES[t.category]+" "+t.name,t.id))
    if(state.templates.some(t=>t.id===selected))templates.value=selected
    const recipient=q<HTMLSelectElement>("[data-item-recipient]")
    const prior=recipient.value
    recipient.replaceChildren()
    for(const sheet of state.sheets)recipient.add(new Option(sheet.name+" ("+sheet.kind+")",sheet.id))
    recipient.value=state.sheets.some(x=>x.id===prior)?prior:current().id
  }
  function renderGroup(){
    const sel=q<HTMLSelectElement>("[data-group-select]")
    sel.replaceChildren(new Option("Aucune compagnie",""))
    for(const g of state.groups)sel.add(new Option(g.name+" · rang "+g.rank,g.id))
    sel.value=state.activeGroupId
    const group=activeGroup()
    const members=q<HTMLElement>("[data-group-members]")
    members.replaceChildren()
    if(!group){members.textContent="Créer ou sélectionner une compagnie."}
    else{
      for(const sheet of state.sheets){
        const label=document.createElement("label");label.className="atelier-check"
        const box=document.createElement("input");box.type="checkbox";box.dataset.groupMember=sheet.id
        box.checked=group.members.includes(sheet.id)
        label.append(box,document.createTextNode(sheet.name+" · niveau "+sheet.level))
        members.append(label)
      }
    }
    host.querySelectorAll<HTMLInputElement>("[data-certification]").forEach(el=>{
      el.checked=!!group&&group.certifications.includes(el.dataset.certification||"")
      el.disabled=!group
    })
    const entries=group?state.missionLog.filter(x=>x.groupId===group.id):[]
    const used=group?.promotionEntries??[]
    const candidates=group?entries.filter(x=>(x.status==="terminee"||x.status==="repli")&&x.rank>=group.rank&&!used.includes(x.id)):[]
    const distinct=new Set(candidates.map(x=>x.category))
    q<HTMLElement>("[data-group-status]").textContent=group
      ? "Rang "+group.rank+"/12 · "+group.members.length+" membres · "+group.certifications.length+
        " certifications · "+entries.length+" comptes rendus. "+
        (distinct.size>=2?"Progression de groupe admissible (validation MJ).":"Deux réussites de domaines distincts sont requises pour le prochain rang.")
      :"Aucune compagnie créée. Les missions ne peuvent pas être enregistrées sans compagnie."
    const log=q<HTMLOListElement>("[data-mission-log]")
    log.replaceChildren()
    if(!entries.length){const li=document.createElement("li");li.textContent="Aucune mission consignée.";log.append(li)}
    for(const entry of entries.slice(-30).reverse()){
      const li=document.createElement("li")
      const m=missions.find(x=>x.id===entry.missionId)
      li.textContent=entry.date+" — "+(m?.title||entry.missionId)+" · "+entry.status+
        (entry.reward?" · Récompense : "+entry.reward:"")+
        (entry.summary?" · "+entry.summary:"")
      log.append(li)
    }
    renderMissionPreview()
  }
  function createItem(){
    const name=clean(q<HTMLInputElement>("[data-item-name]").value.trim(),90)
    if(!name){message("Le nom de l'objet est obligatoire.");return null}
    const category=q<HTMLSelectElement>("[data-item-category]").value
    const item:GameItem={id:uniqueId(),templateId:"",name,category:category in ITEM_CATEGORIES?category as ItemCategory:"autre",
      quantity:clamp(q<HTMLInputElement>("[data-item-quantity]").value,1,999,1),
      description:clean(q<HTMLTextAreaElement>("[data-item-description]").value,600),
      value:clean(q<HTMLInputElement>("[data-item-value]").value,100)}
    return item
  }
  function recordMission(){
    const group=activeGroup(),mission=missions.find(x=>x.id===q<HTMLSelectElement>("[data-mission-select]").value)
    if(!group||!mission){message("Choisir une compagnie et un contrat valide.");return}
    if(state.mode==="pj"){message("Passer en mode MJ pour valider les bilans des missions.");return}
    const missing=mission.certifications.filter(x=>!group.certifications.includes(x))
    if(missing.length){message("Qualifications à vérifier avant mission : "+missing.join(", ")+". Aucun bilan enregistré.");return}
    const result=q<HTMLSelectElement>("[data-mission-result]").value
    const entry:MissionEntry={id:uniqueId(),groupId:group.id,missionId:mission.id,
      category:mission.category,rank:mission.level,
      status:result==="repli"?"repli":result==="echouee"?"echouee":"terminee",
      summary:clean(q<HTMLTextAreaElement>("[data-mission-summary]").value,1200),
      reward:clean(q<HTMLInputElement>("[data-mission-award]").value,280),
      date:new Date().toISOString().slice(0,10)}
    if(entry.status!=="echouee"){
      const reward=missionXpReward(mission.level)
      for(const id of group.members){
        const participant=state.sheets.find(x=>x.id===id)
        if(participant?.kind==="pj")participant.xp=clamp(participant.xp+reward,0,999999,participant.xp)
      }
      entry.reward=clean((entry.reward?entry.reward+" · ":"")+"+"+reward+" XP par PJ membre",280)
    }
    state.missionLog.push(entry)
    state.missionLog=state.missionLog.slice(-400)
    if(entry.reward&&entry.status!=="echouee")group.awards.push(entry.reward)
    group.awards=group.awards.slice(-30)
    q<HTMLTextAreaElement>("[data-mission-summary]").value=""
    q<HTMLInputElement>("[data-mission-award]").value=""
    renderGroup();refreshPoints();persist();renderAI()
    q<HTMLInputElement>('[data-field="xp"]').value=String(current().xp)
    message("Mission consignée : récompense narrative et XP locaux attribués aux PJ membres.")
  }
  function render(){refreshRoster();setForm();refreshMode();refreshLog();renderInventory();renderGroup()}
  function renderAI(){
    const s=current(), include=q<HTMLInputElement>("[data-ai-roster]").checked
    const group=state.groups.find(g=>g.members.includes(s.id))
    const inventory=s.inventory.slice(0,60).map(x=>x.name+" ×"+x.quantity).join(", ")
    const roster = include ? state.sheets.filter(x=>x.id!==s.id).map(x=>
      `- ${x.name} (${x.kind}, ${x.profession}) : Phys ${x.stats.physique}, Agi ${x.stats.agilite}, Esp ${x.stats.esprit}, Prés ${x.stats.presence}, PV ${x.pv}/${x.pvMax}, mana ${x.mana}/${x.manaMax}, Emprise ${x.emprise}.`).join("\n") : "(non transmis)"
    const text = `MJ IA — Nouvelle aventure indépendante dans le monde d'Alrick
RÈGLES EN TEST : 5d6 + caractéristique + compétence (0,1,2) + situation (-2,0,+2).
Difficultés 15,18,21,24,27,30 ; critiques sur les 5 dés naturels :
5 = échec critique exceptionnel, 6-7 = échec critique mineur, 27-29 = critique favorable possible, 30 = succès exceptionnel si l'action est réalisable.
Base 12 : PV et mana d'essai, sans modifier les lois du Codex.
Progression pilote : niveaux 1–25 (+6 points de caractéristique cumulés et +2 maîtrises par niveau). Le maximum reste 12 par caractéristique; le surplus demeure non investi. Au-delà de 20, autorisation exceptionnelle du MJ. Ressources +6/+12/+24 selon le palier, sans effet rétroactif sur le canon. Les maîtrises sont suivies mais ne remplacent pas encore les compétences +0/+1/+2 des jets. Voies libres, talents narratifs et effets conditionnels.
Après 3 échecs de même catégorie (magie, mêlée, tir ou négociation), proposer un incident narratif d12 facultatif ; un 5 naturel ne se cumule pas à l'incident.

PERSONNAGE ACTIF : ${s.name} (${s.kind}), ${s.profession}.
Physique ${s.stats.physique}, Agilité ${s.stats.agilite}, Esprit ${s.stats.esprit}, Présence ${s.stats.presence}.
Spécialité +${s.skill}, PV ${s.pv}/${s.pvMax}, mana ${s.mana}/${s.manaMax}, Emprise ${s.emprise}/12.
Niveau ${s.level}/25 ; voies : ${s.vocation || "aucune"}.
Crédits convertis : ${s.convertedCredits}; points de talents attribués ${s.talentPointsSpent}/${Math.floor(s.convertedCredits/6)}. Pouvoirs à valider par le MJ.
Description : ${s.description || "non renseignée"}.
Maîtrises de progression (sans bonus de jet automatique) : ${MASTERIES.map(k=>k+" "+s.masteries[k]+"/12").join(", ")}.
Talents : ${s.talents || "aucun"}.
Bénédictions / avantages conditionnels : ${s.boons || "aucun"}.
Malédictions / limites : ${s.curses || "aucune"}.
Objets à effet narratif : ${s.items || "aucun"}.
Inventaire (noms et quantités) : ${inventory || "aucun"}.
Compagnie : ${group ? group.name+" (rang "+group.rank+"/12)" : "aucune"}.
Certifications reconnues par la table : ${group?.certifications.join(", ") || "aucune"}.
Niveaux 21–25 : ascension exceptionnelle approuvée par le MJ, sans capacités divines automatiques.
Référence de la fiche : ${s.sourceRef || "adaptation sans source"} — ${s.sourceTitle || ""} (scores 5d6 non canoniques).
Notes du personnage : ${s.notes || "aucune"}.

AUTRES FICHES LOCALES (sans notes secrètes) :
${roster}

DIRECTIVES : utilise uniquement le canon et les extraits documentaires fournis ; distingue faits joués, lore validé, projets et propositions.
Le joueur décide de ses paroles et actes. Fais vivre les PNJ librement, sans connaître les secrets que leur personnage ignore.
Demande un jet quand l'issue est incertaine, explicite la difficulté avant le jet, et n'invente pas une victoire cosmique sur un seul résultat.
Ne considère pas les aventures proposées comme déjà vécues dans la campagne d'Orin.
Maintiens un journal distinct de cette partie et propose des conséquences plausibles. Tu ne disposes PAS automatiquement du reste du site ni des notes secrètes du MJ.`
    q<HTMLTextAreaElement>("[data-ai-prompt]").value=text
  }
  function changeField(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
    const s=current(), field=el.dataset.field as keyof Sheet | undefined
    const stat=el.dataset.stat as Stat | undefined
    if(stat && STATS.includes(stat)){
      const before=s.stats[stat],next=clamp(el.value,1,12,before)
      s.stats[stat]=next
      const used=STATS.reduce((sum,k)=>sum+s.stats[k],0)
      if(s.kind==="pj" && (used+s.convertedCredits>maxStatCredits(s.highestLevel) || (s.highestLevel===1 && next>5))){
        s.stats[stat]=before;el.value=String(before)
        message("Points de caractéristique insuffisants ou limite de création dépassée.")
      }
    } else if(el.dataset.defenseResistance && DEFENSE_KINDS.includes(el.dataset.defenseResistance as ResistanceKind)){
      const k=el.dataset.defenseResistance as ResistanceKind
      s.resistanceBonus[k]=clamp(el.value,0,8,s.resistanceBonus[k])
      el.value=String(s.resistanceBonus[k])
      q<HTMLElement>("[data-resistance-summary]").textContent=DEFENSE_KINDS.map(t=>
        t+" : seuil "+resistanceScore(s,t)+" · protection totale "+effectiveProtection(s,t)+
        " (innée "+innateProtection(s.level,t)+", équipement "+equipmentProtection(s.equipmentGrades[t],t)+
        ", bonus MJ "+s.protection[t]+")").join(" | ")
    } else if(el.dataset.defenseProtection && DEFENSE_KINDS.includes(el.dataset.defenseProtection as ResistanceKind)){
      const k=el.dataset.defenseProtection as ResistanceKind
      s.protection[k]=clamp(el.value,0,60,s.protection[k])
      el.value=String(s.protection[k])
      q<HTMLElement>("[data-resistance-summary]").textContent=DEFENSE_KINDS.map(t=>
        t+" : seuil "+resistanceScore(s,t)+" · protection totale "+effectiveProtection(s,t)+
        " (innée "+innateProtection(s.level,t)+", équipement "+equipmentProtection(s.equipmentGrades[t],t)+
        ", bonus MJ "+s.protection[t]+")").join(" | ")
    } else if(el.dataset.defenseGear && DEFENSE_KINDS.includes(el.dataset.defenseGear as ResistanceKind)){
      if(state.mode==="pj"){el.value=String(s.equipmentGrades[el.dataset.defenseGear as ResistanceKind]);message("Le grade d'équipement est validé en mode MJ.");return}
      const k=el.dataset.defenseGear as ResistanceKind
      s.equipmentGrades[k]=clamp(el.value,0,5,s.equipmentGrades[k])
      el.value=String(s.equipmentGrades[k])
      refreshDefenseSummary()
    } else if(el.dataset.mastery && MASTERIES.includes(el.dataset.mastery as Mastery)){
      const k=el.dataset.mastery as Mastery,before=s.masteries[k]
      s.masteries[k]=clamp(el.value,0,12,before)
      if(s.kind==="pj" && totalMasteries(s.masteries)>2*(s.highestLevel-1)){
        s.masteries[k]=before;el.value=String(before)
        message("Pas assez de points de maîtrise disponibles à ce niveau.")
      }
    } else if(field){
      switch(field){
        case "name":s.name=clean(el.value,90);break
        case "kind":s.kind=el.value==="pnj"||el.value==="creature"?el.value:"pj";break
        case "profession":s.profession=clean(el.value,90);break
        case "skill":s.skill=clamp(el.value,0,2,0);q<HTMLSelectElement>("[data-roll-skill]").value=String(s.skill);break
        case "pvMax":s.pvMax=clamp(el.value,1,999,12);s.pv=Math.min(s.pv,s.pvMax);break
        case "pv":s.pv=clamp(el.value,0,s.pvMax,s.pv);break
        case "manaMax":s.manaMax=clamp(el.value,0,999,0);s.mana=Math.min(s.mana,s.manaMax);break
        case "mana":s.mana=clamp(el.value,0,s.manaMax,s.mana);break
        case "emprise":s.emprise=clamp(el.value,0,12,0);break
        case "xp":{
          if(s.kind==="pj"&&state.mode==="pj"){
            el.value=String(s.xp);message("Modification directe des XP réservée au MJ.");return
          }
          s.xp=clamp(el.value,0,999999,s.xp);break
        }
        case "notes":s.notes=clean(el.value,2500);break
        case "gmNotes":s.gmNotes=clean(el.value,2500);break
        case "level":{
          const next=clamp(el.value,1,25,s.level)
          if(next>s.level&&s.kind==="pj"&&state.mode==="pj"&&s.xp<xpRequired(next)){
            el.value=String(s.level)
            message("XP insuffisants pour atteindre ce niveau. Le MJ peut valider une exception narrative.");return
          }
          if(next>20&&(!s.ascensionAuthorized||next>s.divineLimit||s.ascensionWitness.trim().length<15)){
            el.value=String(s.level)
            message("Ascension divine refusée : chaque palier exige une autorisation du MJ et un témoignage de l'épreuve (15 caractères minimum).")
            return
          }
          if(next>s.highestLevel){
            const gained=gainBetween(s.highestLevel,next)
            s.pvMax=clamp(s.pvMax+gained,1,999,s.pvMax)
            if(s.manaMax>0)s.manaMax=clamp(s.manaMax+gained,0,999,s.manaMax)
            s.highestLevel=next
          }
          s.level=next
          q<HTMLInputElement>('[data-field="level"]').value=String(next)
          q<HTMLInputElement>('[data-field="pvMax"]').value=String(s.pvMax)
          q<HTMLInputElement>('[data-field="manaMax"]').value=String(s.manaMax)
          break
        }
        case "description":s.description=clean(el.value,1200);break
        case "ascensionWitness":s.ascensionWitness=clean(el.value,300);break
        case "vocation":s.vocation=clean(el.value,160);break
        case "talents":s.talents=clean(el.value,1600);break
        case "boons":s.boons=clean(el.value,1400);break
        case "curses":s.curses=clean(el.value,1400);break
        case "items":s.items=clean(el.value,1400);break
      }
    }
    refreshRoster();refreshPoints();refreshStreaks();refreshDefenseSummary();renderOpposition();renderAI();persist()
  }
  function trackFailure(sheet:Sheet,domain:Domain,failed:boolean):string {
    if(domain==="autre")return ""
    if(!failed){sheet.streaks[domain]=0;return ""}
    sheet.streaks[domain]=Math.min(3,sheet.streaks[domain]+1)
    if(sheet.streaks[domain]<3)return ""
    sheet.streaks[domain]=0
    const face=1+Math.floor(Math.random()*12)
    return `Incident ${domain} [1d12 = ${face}] : ${INCIDENTS[domain][face-1]} (suggestion optionnelle du MJ)`
  }
  function refreshDefenseSummary(){
    const sheet=current()
    q<HTMLElement>("[data-resistance-summary]").textContent=DEFENSE_KINDS.map(k=>
      k+" : seuil "+resistanceScore(sheet,k)+" · absorption "+effectiveProtection(sheet,k)+
      " (innée "+innateProtection(sheet.level,k)+", équipement "+equipmentProtection(sheet.equipmentGrades[k],k)+
      ", MJ "+sheet.protection[k]+")").join(" | ")
  }
  function renderOpposition(){
    const opponent=q<HTMLSelectElement>("[data-opposition-target]")
    const selected=opponent.value
    opponent.replaceChildren(new Option("Cible libre (seuil saisi par MJ)",""))
    for(const sheet of state.sheets.filter(x=>x.id!==current().id))
      opponent.add(new Option(sheet.name+" · "+sheet.kind.toUpperCase()+" · niv. "+sheet.level,sheet.id))
    if(selected&&state.sheets.some(x=>x.id===selected&&x.id!==current().id))opponent.value=selected
    const defender=state.sheets.find(x=>x.id===opponent.value)
    const kind=q<HTMLSelectElement>("[data-opposition-kind]").value as ResistanceKind
    const mode=q<HTMLSelectElement>("[data-opposition-mode]").value as ImpactMode
    const resistance=defender?resistanceScore(defender,kind):0
    const custom=clamp(q<HTMLInputElement>("[data-opposition-min]").value,0,45,0)
    const difficulty=clamp(q<HTMLSelectElement>("[data-roll-target]").value,15,30,21)
    const threshold=Math.max(difficulty,resistance,custom)
    const mastery=attackMastery(current().masteries,mode)
    q<HTMLElement>("[data-opposition-preview]").textContent=
      "Seuil de pénétration : "+threshold+
      " (difficulté "+difficulty+(defender?", défense "+resistance:"")+(custom?", seuil MJ "+custom:"")+"). "+
      (mode==="mental"?"Effet social / mental : aucun PV retiré automatiquement.":
        "Sur pénétration : base + maîtrise "+mastery+
        " + palier de puissance, moins l'absorption. Un contact héroïque peut effleurer la cible sans la blesser.")+
      (defender?" "+defender.name+" possède "+defender.pv+"/"+defender.pvMax+
        " PV ; absorption "+effectiveProtection(defender,kind)+
        " (innée "+innateProtection(defender.level,kind)+", équipement "+
        equipmentProtection(defender.equipmentGrades[kind],kind)+").":"")
    if(!q<HTMLInputElement>("[data-opposition-enabled]").checked){
      q<HTMLElement>("[data-opposition-result]").textContent="Mode opposition désactivé : jets ordinaires inchangés."
    }
  }
  function clearPendingImpact(){
    pendingImpact=null
    q<HTMLButtonElement>("[data-opposition-apply]").hidden=true
  }
  function clearPendingCounter(){
    pendingCounter=null
    q<HTMLButtonElement>("[data-opposition-counter]").hidden=true
  }
  function roll(){
    const s=current(), used=STATS.reduce((a,k)=>a+s.stats[k],0)
    if(s.kind==="pj"&&(used<12||used+s.convertedCredits>maxStatCredits(s.highestLevel)||(s.highestLevel===1&&STATS.some(k=>s.stats[k]>5))||totalMasteries(s.masteries)>2*(s.highestLevel-1))){
      message("Répartition invalide : 12 points de base, puis +6 caractéristiques et +2 maîtrises par niveau ; chaque score reste limité à 12.")
      return
    }
    const stat=q<HTMLSelectElement>("[data-roll-stat]").value as Stat
    const skill=clamp(q<HTMLSelectElement>("[data-roll-skill]").value,0,2,0)
    const difficulty=clamp(q<HTMLSelectElement>("[data-roll-target]").value,15,30,21)
    const situation=clamp(q<HTMLSelectElement>("[data-roll-situation]").value,-2,2,0)
    const chosenDomain=q<HTMLSelectElement>("[data-roll-domain]").value
    const domain:Domain=DOMAINS.includes(chosenDomain as Domain)?chosenDomain as Domain:"autre"
    const dice=Array.from({length:5},()=>1+Math.floor(Math.random()*6))
    const natural=dice.reduce((a,b)=>a+b,0), total=natural+s.stats[stat]+skill+situation
    clearPendingImpact()
    clearPendingCounter()
    const enabled=q<HTMLInputElement>("[data-opposition-enabled]").checked
    const defender=state.sheets.find(x=>x.id===q<HTMLSelectElement>("[data-opposition-target]").value && x.id!==s.id)
    const kind=q<HTMLSelectElement>("[data-opposition-kind]").value as ResistanceKind
    const mode=q<HTMLSelectElement>("[data-opposition-mode]").value as ImpactMode
    const custom=clamp(q<HTMLInputElement>("[data-opposition-min]").value,0,45,0)
    const resistance=defender?resistanceScore(defender,kind):0
    const opposition:OppositionResult|null=enabled?resolveOpposition({
      natural,total,difficulty,resistance:Math.max(custom,resistance),
      damageBase:clamp(q<HTMLSelectElement>("[data-opposition-base]").value,1,12,3),
      mastery:attackMastery(s.masteries,mode),level:s.level,
      protection:defender?effectiveProtection(defender,kind):0,mode
    }):null
    const target=opposition?.threshold??difficulty
    let outcome="",detail="",favorable=false
    if(natural===5){outcome="Échec critique exceptionnel";detail="Choisir −2 aux trois prochains jets du groupe OU +2 aux actions ennemies pendant trois tours."}
    else if(natural<=7){outcome="Échec critique mineur";detail="L'action échoue et provoque une complication ciblée."}
    else if(natural===30 && total>=target){outcome="Succès exceptionnel";detail="Choisir +2 aux jets de l'équipe pendant trois tours OU une récompense narrative durable validée par le MJ.";favorable=true}
    else if(natural>=27 && total>=target){outcome="Réussite critique";detail="Action renforcée, sans avantage collectif automatique.";favorable=true}
    else if(total>=target){outcome="Réussite";detail="L'action réussit dans les limites des moyens disponibles.";favorable=true}
    else if(target-total<=2){outcome=opposition?"Résistance de justesse":"Échec de justesse"
      detail=opposition?"Le seuil de résistance n'est pas atteint : aucun effet sur la cible.":"Le MJ peut proposer une réussite avec contrepartie."}
    else {outcome="Échec";detail="L'action échoue, avec conséquences adaptées à la situation."}
    host.querySelectorAll<HTMLElement>("[data-die]").forEach((e,i)=>{e.textContent=String(dice[i])})
    const result=q<HTMLElement>("[data-result]")
    result.dataset.outcome=favorable?"success":"failure"
    result.textContent=`${outcome} — Dés ${natural} + ${s.stats[stat]} + ${skill} ${situation>=0?"+":""}${situation} = ${total} / ${target}.\n${detail}`
    const incident = natural===5 ? "" : trackFailure(s,domain,!favorable)
    if(opposition){
      if(opposition.success){
        if(mode==="mental")detail+="\nRésistance mentale franchie : le MJ décrit l'effet, sans dégâts PV automatiques."
        else {
          detail+="\nImpact : "+opposition.grossDamage+" dégâts bruts − "+opposition.absorbed+
            " de protection = "+opposition.damage+" PV potentiels."
          if(defender&&opposition.damage>0){
            pendingImpact={targetId:defender.id,damage:opposition.damage,attackerName:s.name}
            q<HTMLButtonElement>("[data-opposition-apply]").hidden=state.mode==="pj"
          }
        }
      }else if(!opposition.criticalFailure){
        if(opposition.reaction==="riposte_possible"&&defender){
          pendingCounter={attackerId:s.id,defenderId:defender.id}
          q<HTMLButtonElement>("[data-opposition-counter]").hidden=state.mode==="pj"
        }
        detail+="\nLa cible résiste (écart "+opposition.gap+"). "+
          (opposition.reaction==="riposte_possible"
            ?"Le défenseur peut envisager une riposte seulement s'il dispose d'une réaction et d'une position favorable ; faire un jet distinct."
            :"Parade, esquive ou résistance : aucune riposte gratuite.")
      }else detail+="\nÉchec critique : aucune contre-attaque supplémentaire automatique."
      q<HTMLElement>("[data-opposition-result]").textContent=
        opposition.success?(mode==="mental"?"Effet mental à arbitrer par le MJ.":"Impact calculé : "+opposition.damage+" PV. "+
        (defender?"En mode MJ, confirmer l'application des dégâts.":"Pas de fiche cible : aucun PV modifié.")):
        "Seuil "+target+" non franchi. "+
        (opposition.reaction==="riposte_possible"?"Fenêtre de riposte narrative possible, sur action distincte.":"Aucun dégât.")
    }
    if(incident)detail += "\n"+incident
    s.lastIncident=incident
    result.textContent=`${outcome} — Dés ${natural} + ${s.stats[stat]} + ${skill} ${situation>=0?"+":""}${situation} = ${total} / ${target}.\n${detail}`
    state.log.unshift({name:s.name || "Sans nom",dice,total,target,text:
      (incident ? `${outcome} · ${incident}` : outcome)+
      (opposition?" · "+(opposition.success?(mode==="mental"?"effet mental":"dégâts potentiels "+opposition.damage):"résistance"):"")})
    state.log=state.log.slice(0,20)
    refreshLog();refreshStreaks();persist();message(incident ? "Incident d12 déclenché et ajouté au journal local." : "Jet ajouté au journal local.")
  }
  function exportSheets(){
    const blob=new Blob([JSON.stringify({schema:"alrick.sheets.v2",created:new Date().toISOString(),sheets:state.sheets},null,2)],{type:"application/json"})
    const url=URL.createObjectURL(blob),a=document.createElement("a")
    a.href=url;a.download="archives-alrick-fiches-5d6.json";document.body.append(a);a.click();a.remove()
    setTimeout(()=>URL.revokeObjectURL(url),1500)
    message("Fichier JSON exporté : conserve-le pour retrouver tes fiches sur un autre appareil.")
  }

  function exportCampaign(){
    const content={schema:"alrick.campaign.v1",created:new Date().toISOString(),state}
    const blob=new Blob([JSON.stringify(content,null,2)],{type:"application/json"})
    const url=URL.createObjectURL(blob),link=document.createElement("a")
    link.href=url;link.download="archives-alrick-campagne-5d6-complete.json";document.body.append(link);link.click();link.remove()
    setTimeout(()=>URL.revokeObjectURL(url),1500)
    message("Sauvegarde complète exportée : fiches, inventaires, modèles MJ, compagnies et journal de missions.")
  }
  function importCampaign(raw:unknown){
    if(!raw||typeof raw!=="object")throw Error("Format absent")
    const container=raw as Record<string,unknown>
    if(container.schema!=="alrick.campaign.v1"||!container.state||typeof container.state!=="object")throw Error("Schéma de campagne inconnu")
    const payload=container.state as Record<string,unknown>
    if(!Array.isArray(payload.sheets)||!payload.sheets.length||payload.sheets.length>60)throw Error("Fiches manquantes")
    const sheets=payload.sheets.map(validateSheet)
    if(sheets.some(x=>x===null))throw Error("Fiche corrompue")
    const restored=sheets as Sheet[]
    payload.sheets.forEach((item:unknown,i:number)=>{
      if(item&&typeof item==="object"){
        const id=(item as Record<string,unknown>).id
        if(typeof id==="string"&&id.length>0&&id.length<=100)restored[i].id=id
      }
    })
    if(new Set(restored.map(x=>x.id)).size!==restored.length)throw Error("Identifiants de fiches dupliqués")
    const ids=new Set(restored.map(x=>x.id))
    const groups=Array.isArray(payload.groups)?payload.groups.slice(0,20).map(validatedGroup).filter((x):x is Group=>x!==null):[]
    for(const group of groups)group.members=group.members.filter(id=>ids.has(id))
    const groupIds=new Set(groups.map(x=>x.id))
    const templates=Array.isArray(payload.templates)?payload.templates.slice(0,150).map(validatedItem).filter((x):x is GameItem=>x!==null):[]
    const missionLog=Array.isArray(payload.missionLog)?payload.missionLog.slice(-400).map(validatedEntry)
      .filter((x):x is MissionEntry=>x!==null&&groupIds.has(x.groupId)):[]
    const priorLog=Array.isArray(payload.log)?payload.log:[]
    const log=priorLog.slice(0,20).filter((x:unknown):x is Roll=>{
      if(!x||typeof x!=="object")return false
      const r=x as Record<string,unknown>
      return typeof r.name==="string"&&typeof r.text==="string"&&typeof r.total==="number"&&
        typeof r.target==="number"&&Array.isArray(r.dice)&&r.dice.length===5&&
        r.dice.every((d:unknown)=>typeof d==="number"&&d>=1&&d<=6)
    }).map(x=>({...x,name:clean(x.name,90),text:clean(x.text,180)}))
    if(!window.confirm("Restaurer cette sauvegarde complète ? La campagne locale actuellement ouverte sera remplacée. Exportez-la d'abord si nécessaire."))return
    state={sheets:restored,activeId:typeof payload.activeId==="string"&&ids.has(payload.activeId)?payload.activeId:restored[0].id,
      mode:payload.mode==="mj"||payload.mode==="ia"?payload.mode:"pj",
      log,groups,activeGroupId:typeof payload.activeGroupId==="string"&&groupIds.has(payload.activeGroupId)
        ?payload.activeGroupId:(groups[0]?.id??""),templates,missionLog}
    pendingTransfer=""
    render();persist();message("Campagne locale restaurée. Vérifier les portraits et récompenses après l'import.")
  }
  const controller=new AbortController(), opts={signal:controller.signal}
  host.addEventListener("input",e=>{
    const el=e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    if(el?.dataset?.field || el?.dataset?.stat || el?.dataset?.mastery ||
      el?.dataset?.defenseResistance || el?.dataset?.defenseProtection)changeField(el)
    if(el?.hasAttribute("data-reference-query"))renderRefs()
  },opts)
  host.addEventListener("change",e=>{
    const el=e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    if(el?.dataset?.field || el?.dataset?.stat || el?.dataset?.mastery ||
      el?.dataset?.defenseResistance || el?.dataset?.defenseProtection)changeField(el)
    if(el?.hasAttribute("data-reference-query"))renderRefs()
    if(el?.hasAttribute("data-ai-roster"))renderAI()
    if(el?.hasAttribute("data-opposition-enabled")||el?.hasAttribute("data-opposition-target")||
       el?.hasAttribute("data-opposition-kind")||el?.hasAttribute("data-opposition-mode")||
       el?.hasAttribute("data-opposition-min")||el?.hasAttribute("data-opposition-base")||
       el?.hasAttribute("data-roll-target")){
      clearPendingImpact();clearPendingCounter();renderOpposition()
    }
    if(el instanceof HTMLInputElement && el.hasAttribute("data-talent-spent")){
      const sheet=current()
      sheet.talentPointsSpent=clamp(el.value,0,Math.floor(sheet.convertedCredits/6),sheet.talentPointsSpent)
      el.value=String(sheet.talentPointsSpent);refreshPoints();renderAI();persist()
    }
    if(el instanceof HTMLInputElement && el.hasAttribute("data-ascension")){
      if(state.mode==="pj"){el.checked=current().ascensionAuthorized;message("Réglage réservé au mode MJ.");return}
      current().ascensionAuthorized=el.checked
      if(!el.checked)current().divineLimit=20
      persist();setForm()
      message(el.checked?"Ascension exceptionnelle autorisée dans cette campagne locale.":"Autorisation retirée ; niveaux déjà acquis conservés.")
    }
    if(el?.hasAttribute("data-divine-limit")){
      if(state.mode==="pj"){setForm();message("Validation des paliers divins réservée au MJ.");return}
      const character=current(), approved=clamp(el.value,20,25,20)
      if(approved>character.divineLimit+1){
        setForm();message("Les cinq paliers divins doivent être approuvés l'un après l'autre.");return
      }
      if(approved>character.divineLimit&&character.ascensionWitness.trim().length<15){
        setForm();message("Décrire d'abord une épreuve divine d'au moins 15 caractères.");return
      }
      if(approved>character.divineLimit)character.divineMilestones[approved-21]=character.ascensionWitness
      character.divineLimit=approved
      character.ascensionAuthorized=approved>20
      setForm();persist();message("Épreuve divine approuvée jusqu'au niveau "+approved+".")
    }
    if(el?.hasAttribute("data-group-select")){
      state.activeGroupId=el.value;renderGroup();persist()
    }
    if(el?.hasAttribute("data-mission-select"))renderMissionPreview()
    if(el instanceof HTMLInputElement && el.dataset.groupMember){
      const group=activeGroup();if(!group)return
      const id=el.dataset.groupMember
      group.members=el.checked?[...new Set([...group.members,id])]:group.members.filter(x=>x!==id)
      renderGroup();persist()
    }
    if(el instanceof HTMLInputElement && el.dataset.certification){
      if(state.mode==="pj"){renderGroup();message("Les certifications sont validées en mode MJ.");return}
      const group=activeGroup();if(!group)return
      const id=el.dataset.certification
      group.certifications=el.checked?[...new Set([...group.certifications,id])]:group.certifications.filter(x=>x!==id)
      renderGroup();persist()
    }
    if(el instanceof HTMLInputElement && el.hasAttribute("data-portrait")){
      const file=el.files?.[0];el.value=""
      if(!file)return
      if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>3*1024*1024){
        message("Portrait refusé : utiliser un JPG, PNG ou WebP de 3 Mio maximum.");return
      }
      const sheetId=current().id
      const url=URL.createObjectURL(file),img=new Image()
      img.onload=()=>{
        URL.revokeObjectURL(url)
        if(Math.max(img.naturalWidth,img.naturalHeight)>8192){message("Portrait trop grand en dimensions.");return}
        const canvas=document.createElement("canvas")
        const scale=Math.min(1,320/Math.max(img.naturalWidth,img.naturalHeight))
        canvas.width=Math.max(1,Math.round(img.naturalWidth*scale))
        canvas.height=Math.max(1,Math.round(img.naturalHeight*scale))
        const context=canvas.getContext("2d")
        if(!context){message("Conversion du portrait indisponible.");return}
        context.drawImage(img,0,0,canvas.width,canvas.height)
        const portrait=canvas.toDataURL("image/jpeg",0.68)
        if(portrait.length>=180000){message("Portrait trop volumineux après réduction.");return}
        const sheet=state.sheets.find(x=>x.id===sheetId)
        if(sheet){sheet.portrait=portrait;persist();if(current().id===sheetId)setForm();message("Portrait réduit et enregistré localement avec la fiche.")}
      }
      img.onerror=()=>{URL.revokeObjectURL(url);message("Image illisible.")}
      img.src=url
    }
    if(el instanceof HTMLInputElement&&el.hasAttribute("data-import-campaign")){
      const file=el.files?.[0];el.value=""
      if(!file)return
      if(file.size>16*1024*1024){message("Fichier de campagne trop grand (16 Mio maximum).");return}
      void file.text().then(raw=>{importCampaign(JSON.parse(raw))})
        .catch(()=>message("Restauration refusée : vérifier le schéma alrick.campaign.v1 et les identifiants."))
    }
    if(el?.hasAttribute("data-active")){
      clearPendingImpact();clearPendingCounter();state.activeId=el.value;render();persist()
    }
    if(el?.hasAttribute("data-import") && el instanceof HTMLInputElement) {
      const file=el.files?.[0];el.value=""
      if(!file)return
      if(file.size>5*1024*1024){message("Fichier trop grand : maximum 5 Mio (portraits compris).");return}
      void file.text().then(raw=>{
        const parsed=JSON.parse(raw) as unknown
        let list:unknown[]
        if(Array.isArray(parsed)) list=parsed
        else if(parsed && typeof parsed==="object" && "sheets" in parsed && Array.isArray(parsed.sheets))list=parsed.sheets
        else list=[parsed]
        if(!list.length||list.length>60)throw Error("Nombre de fiches hors limites.")
        const sheets=list.map(validateSheet)
        if(sheets.some(x=>x===null))throw Error("Chaque fiche doit contenir un nom et les quatre caractéristiques.")
        const free=Math.max(0,60-state.sheets.length)
        if(!free)throw Error("Répertoire plein (60 fiches).")
        const accepted=(sheets as Sheet[]).slice(0,free)
        state.sheets.push(...accepted);state.activeId=accepted[0].id;render();persist()
        message(`${accepted.length} fiche(s) importée(s). Vérifier les données et leur statut canonique avant de jouer.`)
      }).catch(()=>message("Import refusé : JSON absent, invalide ou format non reconnu."))
    }
  },opts)
  host.addEventListener("click",e=>{
    const target=e.target as HTMLElement
    const button=target.closest<HTMLButtonElement>("button")
    if(!button)return
    if(button.dataset.mode){
      state.mode=button.dataset.mode as Mode
      q<HTMLButtonElement>("[data-opposition-apply]").hidden=!pendingImpact || state.mode==="pj"
      q<HTMLButtonElement>("[data-opposition-counter]").hidden=!pendingCounter || state.mode==="pj"
      refreshMode();persist();return
    }
    if(button.hasAttribute("data-opposition-counter")){
      if(state.mode==="pj"){message("Le MJ doit valider les ripostes des autres fiches.");return}
      const attempt=pendingCounter
      if(!attempt){message("Aucune fenêtre de riposte en attente.");return}
      const defender=state.sheets.find(x=>x.id===attempt.defenderId)
      const attacker=state.sheets.find(x=>x.id===attempt.attackerId)
      clearPendingCounter();clearPendingImpact()
      if(!defender||!attacker){message("Une fiche de la riposte a disparu.");return}
      state.activeId=defender.id
      render()
      q<HTMLInputElement>("[data-opposition-enabled]").checked=true
      q<HTMLSelectElement>("[data-opposition-target]").value=attacker.id
      q<HTMLSelectElement>("[data-opposition-kind]").value="physique"
      q<HTMLSelectElement>("[data-opposition-mode]").value="melee"
      q<HTMLSelectElement>("[data-roll-stat]").value="physique"
      q<HTMLSelectElement>("[data-roll-domain]").value="melee"
      renderOpposition();persist()
      message("Riposte préparée : "+defender.name+" agit. Vérifier qu'une réaction est disponible et lancer un NOUVEAU jet.")
      return
    }
    if(button.hasAttribute("data-opposition-apply")){
      if(state.mode==="pj"){message("L'application des dégâts sur une autre fiche est réservée au MJ.");return}
      const pending=pendingImpact
      if(!pending){message("Aucun impact en attente. Effectuer d'abord un jet opposé réussi.");return}
      const victim=state.sheets.find(x=>x.id===pending.targetId)
      if(!victim){clearPendingImpact();message("La cible n'existe plus.");return}
      if(!window.confirm("Appliquer "+pending.damage+" PV de dégâts à « "+victim.name+" » ? (0 PV = hors de combat, pas une mort automatique)"))return
      const actual=Math.min(victim.pv,pending.damage)
      victim.pv=Math.max(0,victim.pv-pending.damage)
      if(state.log[0])state.log[0].text=clean(state.log[0].text+" · "+actual+" PV retirés à "+victim.name,180)
      clearPendingImpact();refreshLog();renderOpposition();renderAI();persist()
      message(actual+" PV effectivement retirés à "+victim.name+" ; reste "+victim.pv+"/"+victim.pvMax+" PV.")
      return
    }
    if(button.hasAttribute("data-clear-portrait")){
      current().portrait="";setForm();persist();message("Portrait retiré de cette fiche.");return
    }
    if(button.dataset.itemSelect){
      pendingTransfer=button.dataset.itemSelect;renderInventory()
      message("Objet sélectionné pour transfert. Choisir un destinataire et valider.");return
    }
    if(button.dataset.itemRemove){
      const sheet=current()
      const item=sheet.inventory.find(x=>x.id===button.dataset.itemRemove)
      if(!item||!window.confirm("Retirer « "+item.name+" » de cette fiche ?"))return
      sheet.inventory=sheet.inventory.filter(x=>x.id!==item.id)
      if(pendingTransfer===item.id)pendingTransfer=""
      renderInventory();persist();message("Objet retiré du sac.");return
    }
    if(button.hasAttribute("data-convert-credits")){
      const sheet=current()
      const used=STATS.reduce((sum,k)=>sum+sheet.stats[k],0)
      const available=maxStatCredits(sheet.highestLevel)-used-sheet.convertedCredits
      if(available<6){message("Il faut au moins six crédits de caractéristiques en réserve.");return}
      sheet.convertedCredits+=6
      refreshPoints();persist();renderAI()
      message("Six crédits convertis en un point de talent libre. Aucun pouvoir n'est accordé automatiquement.");return
    }
    if(button.hasAttribute("data-item-create")){
      const item=createItem();if(!item)return
      if(current().inventory.length>=150){message("Limite de 150 objets par fiche.");return}
      current().inventory.push(item);renderInventory();persist();renderAI()
      message("Objet ajouté au personnage actif.");return
    }
    if(button.hasAttribute("data-item-make-template")){
      if(state.mode==="pj"){message("Créer un modèle en mode MJ.");return}
      const item=createItem();if(!item)return
      if(state.templates.length>=150){message("Catalogue de modèles plein (150).");return}
      state.templates.push(item);renderInventory();persist();message("Modèle MJ ajouté au catalogue local.");return
    }
    if(button.hasAttribute("data-template-grant")){
      if(state.mode==="pj"){message("Attribution de modèle réservée au mode MJ.");return}
      const template=state.templates.find(x=>x.id===q<HTMLSelectElement>("[data-template-select]").value)
      const target=state.sheets.find(x=>x.id===q<HTMLSelectElement>("[data-item-recipient]").value)
      if(!template||!target){message("Choisir un modèle et un destinataire.");return}
      if(target.inventory.length>=150){message("Sac de destination plein.");return}
      target.inventory.push({...template,id:uniqueId(),templateId:template.id})
      renderInventory();persist();renderAI();message("Copie indépendante attribuée à "+target.name+".");return
    }
    if(button.hasAttribute("data-inventory-transfer")){
      const from=current(),to=state.sheets.find(x=>x.id===q<HTMLSelectElement>("[data-item-recipient]").value)
      const item=from.inventory.find(x=>x.id===pendingTransfer)
      if(!to||!item||from.id===to.id){message("Sélectionner un objet et un autre personnage destinataire.");return}
      if(to.inventory.length>=150){message("Sac de destination plein.");return}
      from.inventory=from.inventory.filter(x=>x.id!==pendingTransfer)
      to.inventory.push({...item,id:uniqueId()})
      pendingTransfer="";renderInventory();persist();renderAI();message("Objet transféré à "+to.name+".");return
    }
    if(button.hasAttribute("data-group-create")){
      const name=clean(q<HTMLInputElement>("[data-group-name]").value.trim(),90)
      if(!name){message("Entrer le nom de la compagnie.");return}
      if(state.groups.length>=20){message("Limite de 20 compagnies.");return}
      const g:Group={id:uniqueId(),name,rank:1,members:[current().id],certifications:[],awards:[],promotionEntries:[]}
      state.groups.push(g);state.activeGroupId=g.id;q<HTMLInputElement>("[data-group-name]").value=""
      renderGroup();persist();renderAI();message("Compagnie créée au rang 1.");return
    }
    if(button.hasAttribute("data-group-promote")){
      if(state.mode==="pj"){message("Progression collective à valider en mode MJ.");return}
      const group=activeGroup()
      if(!group||group.rank>=12){message("Aucune progression possible.");return}
      const available=state.missionLog.filter(x=>x.groupId===group.id&&x.rank>=group.rank
        &&(x.status==="terminee"||x.status==="repli")&&!group.promotionEntries.includes(x.id))
      const first=available.find(x=>available.some(y=>y.category!==x.category))
      const second=first&&available.find(x=>x.category!==first.category)
      if(!first||!second){message("Deux missions réussies de domaines différents et du rang actuel minimum sont nécessaires.");return}
      group.rank++;group.promotionEntries.push(first.id,second.id)
      renderGroup();persist();renderAI();message("Compagnie promue au rang "+group.rank+" (expérimental, sans nouveaux droits légaux).");return
    }
    if(button.hasAttribute("data-mission-record")){recordMission();return}
    if(button.hasAttribute("data-reset")){
      const before=current(), label=before.name||"Sans nom"
      if(!window.confirm(`Réinitialiser entièrement « ${label} » ? Toutes ses statistiques, ses effets, ses notes et ses incidents locaux seront remplacés par les valeurs de départ. Cette action n'est pas annulable sans sauvegarde JSON.`))return
      const reset=fresh(before.kind)
      reset.id=before.id
      state.sheets=state.sheets.map(s=>s.id===state.activeId?reset:s)
      const incidentBox=q<HTMLElement>("[data-result]")
      incidentBox.textContent="La fiche a été réinitialisée. Les autres personnages et le journal général sont conservés."
      incidentBox.removeAttribute("data-outcome")
      host.querySelectorAll<HTMLElement>("[data-die]").forEach(e=>{e.textContent="–"})
      render();persist();message("Fiche réinitialisée après confirmation. Pense à exporter une copie pour sauvegarder.");return
    }
    if(button.dataset.adaptRef){
      const ref=button.dataset.adaptRef, meta=publicRefs.get(ref)
      if(!meta){message("Référence indisponible dans l'index public.");return}
      if(state.sheets.length>=60){message("Limite de 60 fiches locales atteinte.");return}
      const sheet=fresh(ref.startsWith("creatures/")?"creature":"pnj")
      sheet.name=meta.title.slice(0,90)
      sheet.profession="Adaptation d'une fiche publique (valeurs à définir)"
      sheet.sourceRef=ref;sheet.sourceTitle=meta.title
      sheet.notes="Les statistiques 5d6 sont fictives, non tirées de la fiche de référence. Valider avec le MJ avant jeu."
      state.sheets.push(sheet);state.activeId=sheet.id
      render();persist();message("Référence ouverte en adaptation 5d6. Aucun chiffre canonique n'a été inventé.");return
    }
    if(button.hasAttribute("data-new")){
      if(state.sheets.length>=60){message("Limite de 60 fiches. Exporte et supprime des profils inutilisés.");return}
      const sheet=fresh(state.mode==="pj"?"pj":"pnj")
      state.sheets.push(sheet);state.activeId=sheet.id;render();persist();message("Nouvelle fiche créée.");return
    }
    if(button.hasAttribute("data-delete")){
      if(state.sheets.length===1){message("Conserve au moins une fiche dans le répertoire.");return}
      if(!window.confirm("Supprimer cette fiche locale ? Exporte d'abord le JSON si nécessaire."))return
      state.sheets=state.sheets.filter(s=>s.id!==state.activeId);state.activeId=state.sheets[0].id
      render();persist();message("Fiche supprimée.");return
    }
    if(button.hasAttribute("data-add-template")){
      if(state.sheets.length>=60){message("Limite de 60 fiches.");return}
      const type=q<HTMLSelectElement>("[data-template]").value
      const sheet=fresh(type==="creature"?"creature":"pnj")
      if(type==="acolyte"){sheet.name="Acolyte d'essai";sheet.profession="Serviteur mineur";sheet.stats={physique:2,agilite:3,esprit:3,presence:2};sheet.pv=sheet.pvMax=6;sheet.skill=0}
      if(type==="lieur"){sheet.name="Lieur d'essai";sheet.profession="Adversaire expérimenté";sheet.stats={physique:3,agilite:4,esprit:5,presence:4};sheet.pv=sheet.pvMax=12;sheet.skill=1;sheet.emprise=6}
      if(type==="creature"){sheet.name="Créature errante d'essai";sheet.profession="Créature sans lore défini";sheet.stats={physique:5,agilite:4,esprit:1,presence:1};sheet.pv=sheet.pvMax=12}
      sheet.notes="Profil de démonstration non canonique, ajustable par le MJ."
      state.sheets.push(sheet);state.activeId=sheet.id;render();persist()
      message("Profil d'essai ajouté. Les valeurs et l'existence de la créature ne sont pas canoniques.");return
    }
    if(button.hasAttribute("data-roll")){roll();return}
    if(button.hasAttribute("data-export")){exportSheets();return}
    if(button.hasAttribute("data-export-campaign")){exportCampaign();return}
    if(button.hasAttribute("data-clear-log")){state.log=[];refreshLog();persist();message("Journal local effacé.");return}
    if(button.hasAttribute("data-ai-refresh")){renderAI();message("Contexte actualisé à partir des fiches locales.");return}
    if(button.hasAttribute("data-ai-copy")){
      const area=q<HTMLTextAreaElement>("[data-ai-prompt]")
      void navigator.clipboard?.writeText(area.value).then(()=>message("Contexte copié ; aucun envoi automatique à une IA."))
        .catch(()=>{area.focus();area.select();message("Copie automatique indisponible : sélectionne puis copie le texte.");})
      if(!navigator.clipboard){area.focus();area.select();message("Copie automatique indisponible : sélectionne puis copie le texte.")}
    }
  },opts)
  render();persist();void loadMissions(controller.signal)
  window.addCleanup(()=>controller.abort())
}
document.addEventListener("nav",setupAtelier5d6)
