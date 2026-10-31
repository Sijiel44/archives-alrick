type Stat = "physique" | "agilite" | "esprit" | "presence"
type Role = "pj" | "pnj" | "creature"
type Mastery = "lames" | "haches" | "arcs" | "runes" | "soins" | "negociation" | "survie" | "artisanat" | "magie"
const MASTERIES: Mastery[] = ["lames","haches","arcs","runes","soins","negociation","survie","artisanat","magie"]
const blankMasteries = (): Record<Mastery,number> => ({lames:0,haches:0,arcs:0,runes:0,soins:0,negociation:0,survie:0,artisanat:0,magie:0})
const totalMasteries = (m:Record<Mastery,number>) => MASTERIES.reduce((sum,k)=>sum+m[k],0)
type Domain = "magie" | "melee" | "tir" | "nego" | "autre"
const DOMAINS: Domain[] = ["magie", "melee", "tir", "nego", "autre"]
const makeStreaks = (): Record<Domain,number> => ({magie:0,melee:0,tir:0,nego:0,autre:0})
const validSourceRef = (v:unknown):string => typeof v==="string" && /^(personnages|creatures)\/[A-Za-z0-9-]{2,100}$/.test(v) ? v : ""
type Mode = "pj" | "mj" | "ia"
type Sheet = {
  id: string; name: string; kind: Role; profession: string; skill: number
  stats: Record<Stat, number>; pv: number; pvMax: number
  mana: number; manaMax: number; emprise: number
  level: number; highestLevel: number; masteries: Record<Mastery,number>
  description: string; portrait: string
  vocation: string; talents: string; boons: string; curses: string; items: string
  sourceRef: string; sourceTitle: string
  streaks: Record<Domain,number>; lastIncident: string
  notes: string; gmNotes: string
}
type Roll = { name: string; dice: number[]; total: number; target: number; text: string }
type State = { sheets: Sheet[]; activeId: string; mode: Mode; log: Roll[] }
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
    pv:12, pvMax:12, mana:0, manaMax:0, emprise:0, level:1, highestLevel:1, masteries:blankMasteries(), description:"", portrait:"", vocation:"", talents:"", boons:"", curses:"", items:"",
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
  const level=clamp(obj.level,1,24,1)
  const masteries=blankMasteries()
  const storedMasteries=obj.masteries && typeof obj.masteries==="object" ? obj.masteries as Record<string,unknown> : {}
  for(const k of MASTERIES) masteries[k]=clamp(storedMasteries[k],0,12,0)
  const portrait=typeof obj.portrait==="string" && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(obj.portrait) && obj.portrait.length<180000 ? obj.portrait : ""
  return {id:uniqueId(),name:clean(obj.name,90),kind, profession:clean(obj.profession,90),
    skill:clamp(obj.skill,0,2,0),
    stats:{physique:clamp(values.physique,1,12,3),agilite:clamp(values.agilite,1,12,3),
      esprit:clamp(values.esprit,1,12,3),presence:clamp(values.presence,1,12,3)},
    pv:clamp(obj.pv,0,pvMax,pvMax),pvMax,
    mana:clamp(obj.mana,0,manaMax,0),manaMax,
    emprise:clamp(obj.emprise,0,12,0),level,highestLevel:clamp(obj.highestLevel,level,24,level),
    masteries,description:clean(obj.description,1200),portrait,
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
  let state: State = {sheets:[fresh()],activeId:"",mode:"pj",log:[]}
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
    const limit=12+s.highestLevel-1
    const legal=s.kind!=="pj" || (used>=12 && used<=limit && (s.highestLevel!==1 || (used===12 && STATS.every(k=>s.stats[k]<=5))))
    el.textContent=s.kind==="pj" ? `${used} / ${limit} points · ${limit-used} en réserve` : `${used} points (MJ)`
    el.style.color=!legal ? "#e7ac9c" : ""
    const masteryUsed=totalMasteries(s.masteries), masteryLimit=2*(s.highestLevel-1)
    const masteryEl=q<HTMLElement>("[data-mastery-points]")
    masteryEl.textContent=`${masteryUsed} / ${masteryLimit} points · ${Math.max(0,masteryLimit-masteryUsed)} en réserve`
    masteryEl.style.color=masteryUsed>masteryLimit?"#e7ac9c":""

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
    const portrait=q<HTMLImageElement>("[data-portrait-preview]")
    portrait.hidden=!s.portrait
    if(s.portrait)portrait.src=s.portrait
    else portrait.removeAttribute("src")
    q<HTMLSelectElement>("[data-roll-skill]").value=String(s.skill)
    refreshPoints()
    const source=q<HTMLElement>("[data-source-meta]")
    source.textContent=s.sourceRef
      ? `Source : ${s.sourceTitle || s.sourceRef} (${s.sourceRef}). Les statistiques 5d6 sont une adaptation libre non canonique.`
      : "Fiche libre sans référence encyclopédique. Les valeurs de jeu restent des propositions."
    refreshStreaks()
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
  function render(){refreshRoster();setForm();refreshMode();refreshLog()}
  function renderAI(){
    const s=current(), include=q<HTMLInputElement>("[data-ai-roster]").checked
    const roster = include ? state.sheets.filter(x=>x.id!==s.id).map(x=>
      `- ${x.name} (${x.kind}, ${x.profession}) : Phys ${x.stats.physique}, Agi ${x.stats.agilite}, Esp ${x.stats.esprit}, Prés ${x.stats.presence}, PV ${x.pv}/${x.pvMax}, mana ${x.mana}/${x.manaMax}, Emprise ${x.emprise}.`).join("\n") : "(non transmis)"
    const text = `MJ IA — Nouvelle aventure indépendante dans le monde d'Alrick
RÈGLES EN TEST : 5d6 + caractéristique + compétence (0,1,2) + situation (-2,0,+2).
Difficultés 15,18,21,24,27,30 ; critiques sur les 5 dés naturels :
5 = échec critique exceptionnel, 6-7 = échec critique mineur, 27-29 = critique favorable possible, 30 = succès exceptionnel si l'action est réalisable.
Base 12 : PV et mana d'essai, sans modifier les lois du Codex.
Progression pilote : niveaux 1–24 (+1 caractéristique et +2 maîtrises par niveau), sans effet rétroactif sur le canon. Les maîtrises sont suivies mais ne remplacent pas encore les compétences +0/+1/+2 des jets. Voies libres, talents narratifs et effets conditionnels.
Après 3 échecs de même catégorie (magie, mêlée, tir ou négociation), proposer un incident narratif d12 facultatif ; un 5 naturel ne se cumule pas à l'incident.

PERSONNAGE ACTIF : ${s.name} (${s.kind}), ${s.profession}.
Physique ${s.stats.physique}, Agilité ${s.stats.agilite}, Esprit ${s.stats.esprit}, Présence ${s.stats.presence}.
Spécialité +${s.skill}, PV ${s.pv}/${s.pvMax}, mana ${s.mana}/${s.manaMax}, Emprise ${s.emprise}/12.
Niveau ${s.level}/24 ; voies : ${s.vocation || "aucune"}.
Description : ${s.description || "non renseignée"}.
Maîtrises de progression (sans bonus de jet automatique) : ${MASTERIES.map(k=>k+" "+s.masteries[k]+"/12").join(", ")}.
Talents : ${s.talents || "aucun"}.
Bénédictions / avantages conditionnels : ${s.boons || "aucun"}.
Malédictions / limites : ${s.curses || "aucune"}.
Objets à effet narratif : ${s.items || "aucun"}.
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
      if(s.kind==="pj" && (used>12+s.highestLevel-1 || (s.highestLevel===1 && next>5))){
        s.stats[stat]=before;el.value=String(before)
        message("Points de caractéristique insuffisants ou limite de création dépassée.")
      }
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
        case "notes":s.notes=clean(el.value,2500);break
        case "gmNotes":s.gmNotes=clean(el.value,2500);break
        case "level":{
          const next=clamp(el.value,1,24,s.level)
          if(next>s.highestLevel){
            const gained=next-s.highestLevel
            s.pvMax=clamp(s.pvMax+2*gained,1,999,s.pvMax)
            if(s.manaMax>0)s.manaMax=clamp(s.manaMax+2*gained,0,999,s.manaMax)
            s.highestLevel=next
          }
          s.level=next
          q<HTMLInputElement>('[data-field="level"]').value=String(next)
          q<HTMLInputElement>('[data-field="pvMax"]').value=String(s.pvMax)
          q<HTMLInputElement>('[data-field="manaMax"]').value=String(s.manaMax)
          break
        }
        case "description":s.description=clean(el.value,1200);break
        case "vocation":s.vocation=clean(el.value,160);break
        case "talents":s.talents=clean(el.value,1600);break
        case "boons":s.boons=clean(el.value,1400);break
        case "curses":s.curses=clean(el.value,1400);break
        case "items":s.items=clean(el.value,1400);break
      }
    }
    refreshRoster();refreshPoints();refreshStreaks();renderAI();persist()
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
  function roll(){
    const s=current(), used=STATS.reduce((a,k)=>a+s.stats[k],0)
    if(s.kind==="pj"&&(used<12||used>12+s.highestLevel-1||(s.highestLevel===1&&STATS.some(k=>s.stats[k]>5))||totalMasteries(s.masteries)>2*(s.highestLevel-1))){
      message("Répartition invalide : 12 points à la création, puis +1 caractéristique et +2 maîtrises par niveau, plafonds à 12.")
      return
    }
    const stat=q<HTMLSelectElement>("[data-roll-stat]").value as Stat
    const skill=clamp(q<HTMLSelectElement>("[data-roll-skill]").value,0,2,0)
    const target=clamp(q<HTMLSelectElement>("[data-roll-target]").value,15,30,21)
    const situation=clamp(q<HTMLSelectElement>("[data-roll-situation]").value,-2,2,0)
    const chosenDomain=q<HTMLSelectElement>("[data-roll-domain]").value
    const domain:Domain=DOMAINS.includes(chosenDomain as Domain)?chosenDomain as Domain:"autre"
    const dice=Array.from({length:5},()=>1+Math.floor(Math.random()*6))
    const natural=dice.reduce((a,b)=>a+b,0), total=natural+s.stats[stat]+skill+situation
    let outcome="",detail="",favorable=false
    if(natural===5){outcome="Échec critique exceptionnel";detail="Choisir −2 aux trois prochains jets du groupe OU +2 aux actions ennemies pendant trois tours."}
    else if(natural<=7){outcome="Échec critique mineur";detail="L'action échoue et provoque une complication ciblée."}
    else if(natural===30 && total>=target){outcome="Succès exceptionnel";detail="Choisir +2 aux jets de l'équipe pendant trois tours OU une récompense narrative durable validée par le MJ.";favorable=true}
    else if(natural>=27 && total>=target){outcome="Réussite critique";detail="Action renforcée, sans avantage collectif automatique.";favorable=true}
    else if(total>=target){outcome="Réussite";detail="L'action réussit dans les limites des moyens disponibles.";favorable=true}
    else if(target-total<=2){outcome="Échec de justesse";detail="Le MJ peut proposer une réussite avec contrepartie."}
    else {outcome="Échec";detail="L'action échoue, avec conséquences adaptées à la situation."}
    host.querySelectorAll<HTMLElement>("[data-die]").forEach((e,i)=>{e.textContent=String(dice[i])})
    const result=q<HTMLElement>("[data-result]")
    result.dataset.outcome=favorable?"success":"failure"
    result.textContent=`${outcome} — Dés ${natural} + ${s.stats[stat]} + ${skill} ${situation>=0?"+":""}${situation} = ${total} / ${target}.\n${detail}`
    const incident = natural===5 ? "" : trackFailure(s,domain,!favorable)
    if(incident)detail += "\n"+incident
    s.lastIncident=incident
    result.textContent=`${outcome} — Dés ${natural} + ${s.stats[stat]} + ${skill} ${situation>=0?"+":""}${situation} = ${total} / ${target}.\n${detail}`
    state.log.unshift({name:s.name || "Sans nom",dice,total,target,text:incident ? `${outcome} · ${incident}` : outcome})
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
  const controller=new AbortController(), opts={signal:controller.signal}
  host.addEventListener("input",e=>{
    const el=e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    if(el?.dataset?.field || el?.dataset?.stat || el?.dataset?.mastery)changeField(el)
    if(el?.hasAttribute("data-reference-query"))renderRefs()
  },opts)
  host.addEventListener("change",e=>{
    const el=e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    if(el?.dataset?.field || el?.dataset?.stat || el?.dataset?.mastery)changeField(el)
    if(el?.hasAttribute("data-reference-query"))renderRefs()
    if(el?.hasAttribute("data-ai-roster"))renderAI()
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
    if(el?.hasAttribute("data-active")){state.activeId=el.value;render();persist()}
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
    if(button.dataset.mode){state.mode=button.dataset.mode as Mode;refreshMode();persist();return}
    if(button.hasAttribute("data-clear-portrait")){
      current().portrait="";setForm();persist();message("Portrait retiré de cette fiche.");return
    }
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
    if(button.hasAttribute("data-clear-log")){state.log=[];refreshLog();persist();message("Journal local effacé.");return}
    if(button.hasAttribute("data-ai-refresh")){renderAI();message("Contexte actualisé à partir des fiches locales.");return}
    if(button.hasAttribute("data-ai-copy")){
      const area=q<HTMLTextAreaElement>("[data-ai-prompt]")
      void navigator.clipboard?.writeText(area.value).then(()=>message("Contexte copié ; aucun envoi automatique à une IA."))
        .catch(()=>{area.focus();area.select();message("Copie automatique indisponible : sélectionne puis copie le texte.");})
      if(!navigator.clipboard){area.focus();area.select();message("Copie automatique indisponible : sélectionne puis copie le texte.")}
    }
  },opts)
  render();persist()
  window.addCleanup(()=>controller.abort())
}
document.addEventListener("nav",setupAtelier5d6)
