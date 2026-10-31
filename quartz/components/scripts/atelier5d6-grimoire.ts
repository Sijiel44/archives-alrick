/**
 * Grimoire 5d6 v1 — prototype mécanique, JAMAIS une source de canon.
 * Moteur indépendant de l'interface et des futures tables en réseau.
 * Les Cercles sont attestés par le MJ, jamais calculés depuis le niveau.
 */
import {AFFINITY_DOMAINS,affinityImpactBonus} from "./atelier5d6-origins"
import {attackMastery,effectiveProtection,resistanceScore,resolveOpposition} from "./atelier5d6-opposition"
import type {ResistanceKind,DefenseProfile} from "./atelier5d6-opposition"
import type {Affinity} from "./atelier5d6-origins"

export type SpellStatus="demo"|"campagne"|"adaptation_validee"|"canon_confirme"
export type SpellCategory="utilitaire"|"protection"|"soin"|"perception"|"artisanat"|"attaque"|"deplacement"
export type SpellDuration="instant"|"round"|"scene"|"permanent"
export type Spell={
  id:string;version:number;name:string;description:string;tradition:string;category:SpellCategory;
  domain:string;circle:number|null;status:SpellStatus;source:string;practice?:"activation"|"composition";
  manaCost:number;minimumMastery:number;requiredAffinityRank:number;requiresPreparation:boolean;
  difficulty:number;range:string;target:string;duration:SpellDuration;durationValue:number;
  concentration:boolean;upkeepMana:number;effect:"narratif"|"degats"|"soins";baseImpact:number;
  resistance:ResistanceKind|null;limits:string
}
export type KnownSpell={id:string;approvedBy:string;learnedAt:string;prepared:boolean}
export type PreparedMatrix={id:string;itemId:string;spellId:string;architectureCircle:number;
  activationCircle:number;energySource:"matrix"|"caster";charges:number;approvedBy:string;source:string}
export type SpellEvent={id:string;at:string;type:"apprentissage"|"lancer"|"interruption"|"entretien"|"expiration"|"refus";
  spellId:string;target:string;manaDelta:number;dice:number[];total:number;threshold:number;result:string;deviceId?:string}
export type ActiveSpell={id:string;spellId:string;target:string;duration:SpellDuration;remaining:number;concentration:boolean;upkeepMana:number;startedAt:string}
export type Grimoire={schema:"alrick.grimoire.v1";circlesAttested:number[];known:KnownSpell[];
  requests:string[];personalSpells:Spell[];effects:ActiveSpell[];history:SpellEvent[];
  matrices:PreparedMatrix[];divineNinthApproved:boolean;divineNinthWitness:string}
export type MagicSheet=DefenseProfile&{id:string;name:string;mana:number;manaMax:number;level:number;
  stats:DefenseProfile["stats"];masteries:Record<string,number>;affinities:Affinity[];grimoire:Grimoire;inventory?:{id:string;name:string}[]}
export const DEMO_SPELLS:readonly Spell[]=[
  {id:"demo-lueur-guide",version:1,name:"Lueur de veille",description:"Une petite lumière stable accompagne le voyageur et éclaire un objet ou une alcôve.",tradition:"Démonstration — magie organisée",category:"utilitaire",domain:"lumiere",circle:1,status:"demo",source:"Prototype 5d6 — NON CANONIQUE",manaCost:2,minimumMastery:0,requiredAffinityRank:0,requiresPreparation:false,difficulty:15,range:"Proche",target:"Objet ou espace",duration:"scene",durationValue:1,concentration:false,upkeepMana:0,effect:"narratif",baseImpact:0,resistance:null,limits:"Ne révèle pas un secret, ne traverse pas un sceau et n'aveugle pas automatiquement."},
  {id:"demo-brise-outils",version:1,name:"Souffle d'atelier",description:"Une brise légère emporte poussières et copeaux sans remplacer la main de l'artisan.",tradition:"Démonstration — manipulation de l'air",category:"artisanat",domain:"vent",circle:1,status:"demo",source:"Prototype 5d6 — NON CANONIQUE",manaCost:2,minimumMastery:0,requiredAffinityRank:0,requiresPreparation:false,difficulty:18,range:"Proche",target:"Plan de travail",duration:"round",durationValue:3,concentration:true,upkeepMana:1,effect:"narratif",baseImpact:0,resistance:null,limits:"Ne soulève ni une créature ni une charge lourde ; aucune précision artisanale automatique."},
  {id:"demo-lecture-eau",version:1,name:"Lecture des remous",description:"Rend un courant local plus lisible, sans prédire tous les dangers du fleuve.",tradition:"Démonstration — observation des eaux",category:"perception",domain:"eau",circle:1,status:"demo",source:"Prototype 5d6 — NON CANONIQUE",manaCost:3,minimumMastery:1,requiredAffinityRank:0,requiresPreparation:false,difficulty:18,range:"Quelques pas",target:"Eau visible",duration:"instant",durationValue:0,concentration:false,upkeepMana:0,effect:"narratif",baseImpact:0,resistance:null,limits:"Exige une eau observable ; ne sonde pas les pensées ni les profondeurs fermées."},
  {id:"demo-voile-protecteur",version:1,name:"Voile de fortune",description:"Une protection fragile se déploie contre une gêne momentanée ; ses effets sont arbitrés par le MJ.",tradition:"Démonstration — protection",category:"protection",domain:"magie",circle:2,status:"demo",source:"Prototype 5d6 — NON CANONIQUE",manaCost:4,minimumMastery:2,requiredAffinityRank:0,requiresPreparation:true,difficulty:21,range:"Contact",target:"Soi-même ou allié",duration:"round",durationValue:2,concentration:true,upkeepMana:1,effect:"narratif",baseImpact:0,resistance:null,limits:"N'accorde ni immunité ni absorption chiffrée sans règle spécifique du MJ."},
  {id:"demo-etincelle",version:1,name:"Étincelle contrôlée",description:"Une décharge brève peut provoquer un impact magique sur une cible ordinaire.",tradition:"Démonstration — foudre",category:"attaque",domain:"foudre",circle:1,status:"demo",source:"Prototype 5d6 — NON CANONIQUE",manaCost:4,minimumMastery:1,requiredAffinityRank:0,requiresPreparation:false,difficulty:21,range:"Courte",target:"Cible visible",duration:"instant",durationValue:0,concentration:false,upkeepMana:0,effect:"degats",baseImpact:3,resistance:"magie",limits:"Aucun effet sur une immunité à la foudre reconnue ; pas de pénétration ontologique."}
]
const categories:SpellCategory[]=["utilitaire","protection","soin","perception","artisanat","attaque","deplacement"]
const domains=new Set<string>(AFFINITY_DOMAINS.map(x=>x[0]))
const bounded=(v:unknown,min:number,max:number,def:number):number=>{
  const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.trunc(n))):def
}
const str=(v:unknown,max=300):string=>typeof v==="string"?v.slice(0,max):""
const idOk=(v:unknown):v is string=>typeof v==="string"&&/^[a-z0-9][a-z0-9_-]{2,95}$/i.test(v)
const now=()=>new Date().toISOString()
const makeId=()=>("g-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,11))
export const newGrimoire=():Grimoire=>({schema:"alrick.grimoire.v1",circlesAttested:[],known:[],requests:[],personalSpells:[],effects:[],history:[],matrices:[],divineNinthApproved:false,divineNinthWitness:""})
function normalizeSpell(value:unknown):Spell|null{
  if(!value||typeof value!=="object")return null
  const p=value as Record<string,unknown>,id=p.id
  if(!idOk(id)||!str(p.name,90).trim()||!domains.has(String(p.domain))||!categories.includes(p.category as SpellCategory))return null
  const duration=(["instant","round","scene","permanent"].includes(String(p.duration))?p.duration:"instant") as SpellDuration
  return {id,version:1,name:str(p.name,90),description:str(p.description,800),tradition:str(p.tradition,120),
    category:p.category as SpellCategory,domain:String(p.domain),circle:p.circle===null?null:bounded(p.circle,1,9,1),
    status:"campagne",source:str(p.source,180)||"Création locale non canonique",
    practice:p.practice==="activation"?"activation":p.practice==="composition"?"composition":(bounded(p.circle,1,9,1)===1?"activation":"composition"),
    manaCost:bounded(p.manaCost,0,999,0),minimumMastery:bounded(p.minimumMastery,0,12,0),
    requiredAffinityRank:bounded(p.requiredAffinityRank,0,5,0),requiresPreparation:p.requiresPreparation===true,
    difficulty:bounded(p.difficulty,15,30,21),range:str(p.range,90),target:str(p.target,100),
    duration,durationValue:bounded(p.durationValue,0,99,0),concentration:p.concentration===true,
    upkeepMana:bounded(p.upkeepMana,0,99,0),effect:["degats","soins"].includes(String(p.effect))?p.effect as "degats"|"soins":"narratif",
    baseImpact:bounded(p.baseImpact,0,12,0),resistance:["physique","magie","mental"].includes(String(p.resistance))?p.resistance as ResistanceKind:null,
    limits:str(p.limits,600)}
}
export function normalizeGrimoire(raw:unknown):Grimoire{
  const g=newGrimoire()
  if(!raw||typeof raw!=="object")return g
  const o=raw as Record<string,unknown>
  if(Array.isArray(o.personalSpells)){
    for(const row of o.personalSpells.slice(0,80)){const s=normalizeSpell(row);if(s&&!DEMO_SPELLS.some(d=>d.id===s.id)&&!g.personalSpells.some(d=>d.id===s.id))g.personalSpells.push(s)}
  }
  const catalog=new Set([...DEMO_SPELLS,...g.personalSpells].map(x=>x.id))
  if(Array.isArray(o.circlesAttested))g.circlesAttested=[...new Set(o.circlesAttested.map(x=>bounded(x,0,9,0)).filter(x=>x>=1))].slice(0,9)
  g.divineNinthApproved=o.divineNinthApproved===true&&str(o.divineNinthWitness,300).trim().length>=15
  g.divineNinthWitness=g.divineNinthApproved?str(o.divineNinthWitness,300):""
  if(Array.isArray(o.known)){
    for(const row of o.known.slice(0,100)){
      if(!row||typeof row!=="object")continue
      const p=row as Record<string,unknown>
      if(!idOk(p.id)||!catalog.has(p.id)||g.known.some(x=>x.id===p.id))continue
      g.known.push({id:p.id,approvedBy:str(p.approvedBy,90),learnedAt:str(p.learnedAt,40),prepared:p.prepared===true})
    }
  }
  if(Array.isArray(o.requests))g.requests=[...new Set(o.requests.filter((x:unknown)=>idOk(x)&&catalog.has(x) && !g.known.some(k=>k.id===x)))].slice(0,100) as string[]
  if(Array.isArray(o.effects))for(const row of o.effects.slice(-80)){
    if(!row||typeof row!=="object")continue
    const p=row as Record<string,unknown>
    if(!idOk(p.id)||!catalog.has(String(p.spellId))||!["round","scene","permanent"].includes(String(p.duration)))continue
    g.effects.push({id:p.id,spellId:String(p.spellId),target:str(p.target,150),
      duration:p.duration as SpellDuration,remaining:bounded(p.remaining,0,999,0),
      concentration:p.concentration===true,upkeepMana:bounded(p.upkeepMana,0,99,0),startedAt:str(p.startedAt,40)})
  }
  if(Array.isArray(o.history))for(const row of o.history.slice(-150)){
    if(!row||typeof row!=="object")continue
    const p=row as Record<string,unknown>
    if(!idOk(p.id)||!["apprentissage","lancer","interruption","entretien","expiration","refus"].includes(String(p.type)))continue
    const dice=Array.isArray(p.dice)&&p.dice.length===5&&p.dice.every(d=>Number.isInteger(d)&&d>=1&&d<=6)?p.dice as number[]:[]
    g.history.push({id:p.id,at:str(p.at,40),type:p.type as SpellEvent["type"],spellId:str(p.spellId,100),
      target:str(p.target,150),manaDelta:bounded(p.manaDelta,-999,0,0),dice,total:bounded(p.total,0,100,0),
      threshold:bounded(p.threshold,0,50,0),result:str(p.result,300),deviceId:idOk(p.deviceId)?p.deviceId:undefined})
  }
  return g
}
export function libraryFor(g:Grimoire):Spell[]{return [...DEMO_SPELLS,...g.personalSpells]}
export function eligibility(sheet:MagicSheet,spell:Spell):string[]{
  const errors:string[]=[]
  const known=sheet.grimoire.known.find(x=>x.id===spell.id)
  if(!known)errors.push("Sort non appris et non validé par le MJ")
  if(spell.circle!==null&&!sheet.grimoire.circlesAttested.includes(spell.circle))errors.push("Cercle "+spell.circle+" non attesté")
  if((sheet.masteries.magie??0)<spell.minimumMastery)errors.push("Maîtrise Magie "+spell.minimumMastery+" requise")
  if(spell.requiredAffinityRank>0&&(sheet.affinities.find(x=>x.id===spell.domain)?.rank??0)<spell.requiredAffinityRank)errors.push("Affinité "+spell.domain+" "+spell.requiredAffinityRank+" requise")
  if(spell.requiresPreparation&&!known?.prepared)errors.push("Préparation requise")
  if(sheet.mana<spell.manaCost)errors.push("Mana insuffisant")
  if(spell.concentration&&sheet.grimoire.effects.some(x=>x.concentration))errors.push("Une concentration est déjà active")
  return errors
}
export function resolveSpellCast(sheet:MagicSheet,spell:Spell,target:MagicSheet|null,aim:string,dice:number[]){
  const errors=eligibility(sheet,spell)
  if(!aim.trim())errors.push("Cible ou intention manquante")
  if(dice.length!==5||dice.some(n=>!Number.isInteger(n)||n<1||n>6))errors.push("Jet 5d6 invalide")
  if(errors.length)return {ok:false,errors}
  const natural=dice.reduce((a,b)=>a+b,0)
  // Les maîtrises complémentaires 0..12 ne donnent pas ici de bonus universel au jet.
  const skill=Math.min(2,Math.floor((sheet.masteries.magie??0)/6))
  const total=natural+sheet.stats.esprit+skill
  const resistance=spell.resistance&&target?resistanceScore(target,spell.resistance):0
  const threshold=Math.max(spell.difficulty,resistance)
  const rank=sheet.affinities.find(a=>a.id===spell.domain)?.rank??0
  const opposition=spell.resistance?resolveOpposition({natural,total,difficulty:spell.difficulty,resistance,
    damageBase:spell.baseImpact||1,mastery:attackMastery(sheet.masteries,"magie"),level:sheet.level,
    protection:target?effectiveProtection(target,spell.resistance):0,mode:spell.resistance==="mental"?"mental":"magie",
    affinityBonus:spell.effect==="degats"?affinityImpactBonus(rank):0}):null
  const success=opposition?opposition.success:natural>7&&total>=threshold
  const glancing=!!opposition?.glancing
  const result=natural<=7?"Échec critique":success?"Réussite":glancing?"Contact sans pénétration":"Échec"
  return {ok:true,errors:[],natural,total,threshold,success,glancing,result,damage:spell.effect==="degats"?(opposition?.damage??0):0,
    absorbed:opposition?.absorbed??0,critical:natural>=27,affinityRank:rank}
}
export function recordSpellEvent(g:Grimoire,event:Omit<SpellEvent,"id"|"at">){
  g.history.push({...event,id:makeId(),at:now()})
  g.history=g.history.slice(-150)
}
export function activateSpell(g:Grimoire,spell:Spell,target:string){
  if(spell.duration==="instant")return
  g.effects.push({id:makeId(),spellId:spell.id,target,duration:spell.duration,remaining:spell.durationValue,
    concentration:spell.concentration,upkeepMana:spell.upkeepMana,startedAt:now()})
  g.effects=g.effects.slice(-80)
}
export function progressEffects(sheet:MagicSheet,unit:"round"|"scene"){
  let spent=0
  for(const e of [...sheet.grimoire.effects]){
    if(e.duration!==unit)continue
    if(e.upkeepMana>0&&sheet.mana-spent<e.upkeepMana){
      sheet.grimoire.effects=sheet.grimoire.effects.filter(x=>x.id!==e.id)
      recordSpellEvent(sheet.grimoire,{type:"interruption",spellId:e.spellId,target:e.target,manaDelta:0,dice:[],total:0,threshold:0,result:"Entretien impossible : mana insuffisant"})
      continue
    }
    if(e.upkeepMana>0){spent+=e.upkeepMana;recordSpellEvent(sheet.grimoire,{type:"entretien",spellId:e.spellId,target:e.target,manaDelta:-e.upkeepMana,dice:[],total:0,threshold:0,result:"Entretien "+unit})}
    e.remaining--
    if(e.remaining<=0){sheet.grimoire.effects=sheet.grimoire.effects.filter(x=>x.id!==e.id);
      recordSpellEvent(sheet.grimoire,{type:"expiration",spellId:e.spellId,target:e.target,manaDelta:0,dice:[],total:0,threshold:0,result:"Fin de durée"})}
  }
  sheet.mana-=spent
  return spent
}
const esc=(s:unknown)=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]||ch))
const glyph:Record<SpellCategory,string>={utilitaire:"✦",protection:"◇",soin:"✚",perception:"◉",artisanat:"⚒",attaque:"ϟ",deplacement:"➶"}
export function createGrimoirePanel(args:{root:HTMLElement;getSheet:()=>MagicSheet;getSheets:()=>MagicSheet[];isMJ:()=>boolean;
  persist:()=>void;message:(s:string)=>void;onChange?:()=>void}){
  const root=args.root.querySelector<HTMLElement>("[data-grimoire-root]")
  if(!root)return {render:()=>{}}
  const query=<T extends HTMLElement>(s:string)=>root.querySelector<T>(s)!
  const selected=()=>libraryFor(args.getSheet().grimoire)
  const find=(id:string)=>selected().find(x=>x.id===id)
  const notify=(s:string)=>{args.message(s);query<HTMLElement>("[data-grimoire-status]").textContent=s}
  let lastSheetId=""
  function render(){
    const sheet=args.getSheet(),g=sheet.grimoire,mj=args.isMJ()
    if(lastSheetId!==sheet.id){
      lastSheetId=sheet.id
      query<HTMLElement>("[data-grimoire-result]").textContent="Aucune incantation pour cette fiche dans cette session."
    }
    const filter=query<HTMLInputElement>("[data-grimoire-search]").value.toLocaleLowerCase("fr")
    const category=query<HTMLSelectElement>("[data-grimoire-category]").value
    const scope=query<HTMLSelectElement>("[data-grimoire-scope]").value
    const list=query<HTMLElement>("[data-grimoire-cards]")
    const cards=selected().filter(sp=>{
      const known=g.known.some(x=>x.id===sp.id)
      return (!category||sp.category===category)&&(!filter||[sp.name,sp.description,sp.domain].join(" ").toLocaleLowerCase("fr").includes(filter))&&
        (scope!=="known"||known)&&(scope!=="available"||eligibility(sheet,sp).length===0)
    })
    list.innerHTML=cards.map(sp=>{
      const known=g.known.find(x=>x.id===sp.id),request=g.requests.includes(sp.id),block=eligibility(sheet,sp)
      return `<article class="grimoire-card" data-spell-card="${esc(sp.id)}">
        <div class="grimoire-card-head"><span class="grimoire-glyph" aria-hidden="true">${glyph[sp.category]}</span>
        <div><strong>${esc(sp.name)}</strong><small>${esc(sp.category)} · ${esc(sp.domain)} · Cercle ${sp.circle??"non assigné"}</small></div>
        <span class="grimoire-stamp">${sp.status==="demo"?"DÉMO NON CANON":esc(sp.status)}</span></div>
        <p>${esc(sp.description)}</p><p class="atelier-hint">${sp.manaCost} mana · DD ${sp.difficulty} · ${esc(sp.range)} · ${esc(sp.duration)}${sp.concentration?" · concentration":""}</p>
        <p class="atelier-hint">${known?(known.prepared?"Appris · préparé":"Appris"):(request?"Apprentissage demandé":"Inconnu")}${block.length?" · Indisponible : "+esc(block.join("; ")):" · Utilisable"}</p>
        <details><summary>Conditions, limites et source</summary>
        <p>Tradition : ${esc(sp.tradition)}. Maîtrise magie : ${sp.minimumMastery}. Affinité ${esc(sp.domain)} : ${sp.requiredAffinityRank}. Préparation : ${sp.requiresPreparation?"obligatoire":"libre"}.</p>
        <p>Cible : ${esc(sp.target)} · Durée : ${sp.durationValue} ${esc(sp.duration)} · Entretien : ${sp.upkeepMana} mana · Effet : ${esc(sp.effect)}</p>
        <p>${esc(sp.limits)}</p><p class="atelier-hint">Source : ${esc(sp.source)}.</p></details>
        <div class="grimoire-card-actions">
        ${!known&&!request?`<button type="button" data-spell-request="${esc(sp.id)}">${mj?"MJ : enseigner":"Demander l'apprentissage"}</button>`:""}
        ${request&&mj?`<button type="button" data-spell-approve="${esc(sp.id)}">MJ : approuver</button><button type="button" data-spell-deny="${esc(sp.id)}">Refuser</button>`:""}
        ${known?`<button type="button" data-spell-prepare="${esc(sp.id)}">${known.prepared?"Dépréparer":"Préparer"}</button><button type="button" data-spell-select="${esc(sp.id)}">Choisir pour lancer</button>`:""}
        ${known&&mj?`<button type="button" data-spell-revoke="${esc(sp.id)}">MJ : retirer</button>`:""}</div>
      </article>`
    }).join("")||'<p class="atelier-hint">Aucun sort selon les filtres.</p>'
    const cast=query<HTMLSelectElement>("[data-grimoire-cast]")
    const previous=cast.value
    cast.replaceChildren(new Option("Choisir un sort appris…",""))
    for(const k of g.known){const sp=find(k.id);if(sp)cast.add(new Option(sp.name,k.id))}
    if(g.known.some(x=>x.id===previous))cast.value=previous
    const targetSelect=query<HTMLSelectElement>("[data-grimoire-other-sheet]")
    const previousTarget=targetSelect.value
    targetSelect.replaceChildren(new Option("Sans fiche cible — difficulté du sort",""))
    for(const other of args.getSheets().filter(x=>x.id!==sheet.id)){
      targetSelect.add(new Option(other.name+" · niveau "+other.level,other.id))
    }
    if(args.getSheets().some(x=>x.id===previousTarget&&x.id!==sheet.id))targetSelect.value=previousTarget
    query<HTMLElement>("[data-grimoire-circle-summary]").textContent=g.circlesAttested.length?
      "Cercles attestés par le MJ : "+g.circlesAttested.slice().sort((a,b)=>a-b).join(", "):"Aucun Cercle attesté. Le niveau n'en attribue aucun."
    query<HTMLElement>("[data-grimoire-mj]").hidden=!mj
    const eff=query<HTMLElement>("[data-grimoire-effects]")
    eff.innerHTML=g.effects.length?g.effects.map(e=>{
      const s=find(e.spellId)
      return `<li>${esc(s?.name||e.spellId)} · ${esc(e.target)} · ${e.duration==="permanent"?"permanent":e.remaining+" "+esc(e.duration)}
      ${e.concentration?" · concentration":""} · ${e.upkeepMana} mana d'entretien
      <button type="button" data-spell-interrupt="${esc(e.id)}">Interrompre</button></li>`
    }).join(""):"<li>Aucun effet actif.</li>"
    const hist=query<HTMLElement>("[data-grimoire-history]")
    hist.innerHTML=g.history.length?g.history.slice().reverse().slice(0,25).map(e=>
      `<li>${esc(e.at.slice(0,16).replace("T"," "))} · ${esc(e.type)} · ${esc(find(e.spellId)?.name||e.spellId)} : ${esc(e.result)}
      ${e.dice.length?" ["+e.dice.join(", ")+"] "+e.total+"/"+e.threshold:""} · ${e.manaDelta} mana · ${esc(e.target)}</li>`).join(""):"<li>Aucun usage enregistré.</li>"
    query<HTMLElement>("[data-grimoire-mana]").textContent="Réserve actuelle : "+sheet.mana+"/"+sheet.manaMax+" mana"
  }
  function update(){args.onChange?.();args.persist();render()}
  root.addEventListener("input",e=>{if((e.target as HTMLElement).hasAttribute("data-grimoire-search"))render()})
  root.addEventListener("change",e=>{const el=e.target as HTMLElement;if(el.hasAttribute("data-grimoire-category")||el.hasAttribute("data-grimoire-scope"))render()})
  root.addEventListener("click",e=>{
    const b=(e.target as HTMLElement).closest<HTMLButtonElement>("button");if(!b)return
    const s=args.getSheet(),g=s.grimoire,mj=args.isMJ(),id=b.dataset.spellRequest||b.dataset.spellApprove||b.dataset.spellDeny||
      b.dataset.spellPrepare||b.dataset.spellRevoke||b.dataset.spellSelect
    const spell=id?find(id):undefined
    if(spell&&b.dataset.spellSelect){query<HTMLSelectElement>("[data-grimoire-cast]").value=spell.id;query<HTMLInputElement>("[data-grimoire-target]").focus();return}
    if(spell&&b.dataset.spellRequest){
      if(mj){g.known.push({id:spell.id,approvedBy:"MJ local",learnedAt:now(),prepared:false});
        recordSpellEvent(g,{type:"apprentissage",spellId:spell.id,target:"",manaDelta:0,dice:[],total:0,threshold:0,result:"Appris avec validation MJ locale"})}
      else if(!g.requests.includes(spell.id))g.requests.push(spell.id)
      update();notify(mj?"Sort appris sur cette fiche.":"Demande locale enregistrée ; le MJ doit passer en mode MJ pour l'approuver.");return
    }
    if(spell&&b.dataset.spellApprove&&mj){
      if(!g.known.some(x=>x.id===spell.id))g.known.push({id:spell.id,approvedBy:"MJ local",learnedAt:now(),prepared:false})
      g.requests=g.requests.filter(x=>x!==spell.id)
      recordSpellEvent(g,{type:"apprentissage",spellId:spell.id,target:"",manaDelta:0,dice:[],total:0,threshold:0,result:"Apprentissage approuvé"})
      update();notify("Apprentissage approuvé.");return
    }
    if(spell&&b.dataset.spellDeny&&mj){g.requests=g.requests.filter(x=>x!==spell.id);update();notify("Demande refusée.");return}
    if(spell&&b.dataset.spellRevoke&&mj){
      if(!window.confirm("Retirer l'apprentissage de « "+spell.name+" » ?"))return
      g.known=g.known.filter(x=>x.id!==spell.id)
      g.effects=g.effects.filter(x=>x.spellId!==spell.id)
      update();notify("Sort retiré de la fiche.");return
    }
    if(spell&&b.dataset.spellPrepare){
      const known=g.known.find(x=>x.id===spell.id);if(!known)return
      known.prepared=!known.prepared;update();notify("Préparation mise à jour.");return
    }
    if(b.hasAttribute("data-grimoire-attest")&&mj){
      const circle=Number(query<HTMLSelectElement>("[data-grimoire-circle]").value)
      const witness=query<HTMLInputElement>("[data-grimoire-witness]").value.trim()
      if(!witness){notify("Indiquer une preuve d'apprentissage ou une validation MJ.");return}
      if(!g.circlesAttested.includes(circle))g.circlesAttested.push(circle)
      recordSpellEvent(g,{type:"apprentissage",spellId:"cercle-"+circle,target:"",manaDelta:0,dice:[],total:0,threshold:0,result:"Cercle attesté : "+witness.slice(0,120)})
      update();notify("Cercle "+circle+" attesté, sans octroi automatique de sorts.");return
    }
    if(b.hasAttribute("data-grimoire-create")&&mj){
      const name=query<HTMLInputElement>("[data-grimoire-new-name]").value.trim().slice(0,90)
      const domain=query<HTMLSelectElement>("[data-grimoire-new-domain]").value
      const desc=query<HTMLInputElement>("[data-grimoire-new-desc]").value.trim().slice(0,800)
      if(!name||!desc||!domains.has(domain)){notify("Nom, description et domaine nécessaires.");return}
      const template={...DEMO_SPELLS[0],id:makeId(),name,description:desc,domain,
        category:query<HTMLSelectElement>("[data-grimoire-new-category]").value as SpellCategory,
        circle:Number(query<HTMLSelectElement>("[data-grimoire-new-circle]").value),
        manaCost:bounded(query<HTMLInputElement>("[data-grimoire-new-cost]").value,0,999,2),
        status:"campagne" as SpellStatus,source:"Création de table — NON CANONIQUE"}
      if(g.personalSpells.length>=80){notify("Limite de sorts locaux atteinte.");return}
      g.personalSpells.push(template);update();notify("Sort local créé. Il devra être appris séparément.");return
    }
    if(b.hasAttribute("data-grimoire-cast-button")){
      const spell=find(query<HTMLSelectElement>("[data-grimoire-cast]").value)
      const aim=query<HTMLInputElement>("[data-grimoire-target]").value.trim().slice(0,150)
      if(!spell){notify("Choisir un sort connu.");return}
      const errors=eligibility(s,spell)
      if(!aim)errors.push("Indiquer la cible ou l'intention")
      if(errors.length){notify(errors.join(" ; "));return}
      const targetId=query<HTMLSelectElement>("[data-grimoire-other-sheet]").value
      const target=args.getSheets().find(x=>x.id===targetId&&x.id!==s.id)||null
      if(!window.confirm("Lancer « "+spell.name+" » vers « "+aim+" » ? Coût "+spell.manaCost+
        " mana, même si le jet échoue. Aucun PV ou état d'une autre fiche ne sera modifié automatiquement."))return
      const dice=Array.from({length:5},()=>1+Math.floor(Math.random()*6))
      const result=resolveSpellCast(s,spell,target,aim,dice)
      if(!result.ok){notify(result.errors.join(" ; "));return}
      s.mana-=spell.manaCost
      recordSpellEvent(g,{type:"lancer",spellId:spell.id,target:aim,manaDelta:-spell.manaCost,dice,
        total:result.total!,threshold:result.threshold!,
        result:result.result!+(result.damage?" · "+result.damage+" dégâts potentiels (application MJ distincte)":"")})
      if(result.success)activateSpell(g,spell,aim)
      query<HTMLElement>("[data-grimoire-result]").textContent=
        result.result+" — "+dice.join(", ")+" ; total "+result.total+"/"+result.threshold+
        (result.glancing?" (la résistance reste intacte)":"")+(result.damage?" ; "+result.damage+" PV potentiels, non appliqués.":"")
      query<HTMLInputElement>("[data-grimoire-target]").value=""
      const manaInput=args.root.querySelector<HTMLInputElement>('[data-field="mana"]')
      if(manaInput)manaInput.value=String(s.mana)
      update();notify("Lancer consigné et mana dépensé. Les conséquences sur autrui exigent l'accord du MJ.");return
    }
    if(b.dataset.spellInterrupt){
      const effect=g.effects.find(x=>x.id===b.dataset.spellInterrupt)
      if(!effect)return
      if(!window.confirm("Interrompre cet effet actif ?"))return
      g.effects=g.effects.filter(x=>x.id!==effect.id)
      recordSpellEvent(g,{type:"interruption",spellId:effect.spellId,target:effect.target,manaDelta:0,dice:[],total:0,threshold:0,result:"Interruption manuelle"})
      update();notify("Effet interrompu.");return
    }
    if(b.dataset.grimoireAdvance==="round"||b.dataset.grimoireAdvance==="scene"){
      const unit=b.dataset.grimoireAdvance as "round"|"scene"
      const expense=g.effects.filter(x=>x.duration===unit).reduce((n,x)=>n+x.upkeepMana,0)
      if(!window.confirm("Avancer d'un "+(unit==="round"?"tour":"segment narratif")+
        " ? Entretien demandé : jusqu'à "+expense+" mana (les effets impossibles cesseront)."))return
      const spent=progressEffects(s,unit)
      const manaInput=args.root.querySelector<HTMLInputElement>('[data-field="mana"]')
      if(manaInput)manaInput.value=String(s.mana)
      update();notify("Durées avancées ; "+spent+" mana d'entretien consommé(s).");return
    }
  })
  return {render}
}
