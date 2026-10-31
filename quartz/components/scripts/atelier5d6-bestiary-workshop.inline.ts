import { ARCHETYPES, BESTIARY_STORAGE,
  createBestiaryCard, validateBestiaryCard, evaluateMatchup, describeFormula, toDefense } from "./atelier5d6-bestiary-workshop"
import type { BestiaryCard, BestiaryKind, BestiaryRole, BestiaryStatus } from "./atelier5d6-bestiary-workshop"
import { effectiveStat, effectiveMastery } from "./atelier5d6-progression"
import { resistanceScoreM03, effectiveProtectionM03 } from "./atelier5d6-combat-m03"
import type { CreatureArchetype } from "./atelier5d6-bestiary"

function startBestiary(){
  const foundHost=document.querySelector<HTMLElement>("#bestiary-workshop")
  if(!foundHost)return
  const host:HTMLElement=foundHost
  const controller=new AbortController(), opts={signal:controller.signal}
  const one=<T extends HTMLElement>(selector:string):T=>{
    const el=host.querySelector<T>(selector)
    if(!el)throw Error("Contrôle de l'Atelier manquant : "+selector)
    return el
  }
  const msg=(value:string)=>{one<HTMLElement>("[data-status]").textContent=value}
  const nr=(el:HTMLInputElement,min:number,max:number):number|null=>{
    if(el.value.trim()===""||!Number.isSafeInteger(Number(el.value))||
      Number(el.value)<min||Number(el.value)>max)return null
    return Number(el.value)
  }
  const pct=(n:number)=>(100*n).toFixed(2).replace(".",",")+" %"
  let cards:BestiaryCard[]=[]
  let storageDamaged=false
  try{
    const raw=localStorage.getItem(BESTIARY_STORAGE)
    if(raw){
      const data=JSON.parse(raw) as unknown
      if(!Array.isArray(data)||data.length>60)throw Error("Stockage invalide")
      cards=data.map(validateBestiaryCard)
    }
  }catch{storageDamaged=true;msg("Sauvegarde locale illisible : données conservées sans écrasement. Utilisez « Nouvelle fiche » pour repartir après confirmation.")}
  if(!cards.length)cards=[createBestiaryCard(5,"predateur")]
  let active=cards[0].id
  let mode:"rapide"|"guide"|"expert"="rapide"
  const current=()=>cards.find(x=>x.id===active)??cards[0]
  function persist(){
    if(storageDamaged)return // Évite de détruire silencieusement un stockage corrompu.
    try{localStorage.setItem(BESTIARY_STORAGE,JSON.stringify(cards))}
    catch{msg("Stockage saturé ou indisponible. Exportez vos créations pour les conserver.")}
  }
  function download(filename:string,value:unknown){
    host.dataset.downloadStage="begin"
    const data=new Blob([JSON.stringify(value,null,2)],{type:"application/json"})
    host.dataset.downloadStage="blob"
    const url=URL.createObjectURL(data),a=document.createElement("a")
    host.dataset.downloadStage="url"
    a.href=url;a.download=filename;document.body.append(a);a.click();a.remove()
    setTimeout(()=>URL.revokeObjectURL(url),1500)
  }
  const inputValue=(selector:string,value:string|number)=>{
    const el=one<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>(selector)
    el.value=String(value)
  }
  function displayMode(){
    host.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach(el=>
      el.setAttribute("aria-pressed",String(el.dataset.mode===mode)))
    host.querySelectorAll<HTMLElement>("[data-advanced]").forEach(el=>{
      // Rapide : réglage de l'archétype et du niveau, évaluation à tout instant.
      el.hidden=mode==="rapide"
    })
    host.querySelectorAll<HTMLElement>("[data-stat], [data-mastery], [data-def], [data-ability-name]").forEach(el=>{
      // Expert voit et édite toutes les valeurs. Guidé reste simplifié, avec ressources.
      const fieldset=el.closest<HTMLElement>("fieldset")
      if(fieldset?.hasAttribute("data-advanced")&&mode==="guide")
        fieldset.hidden=fieldset.querySelector("[data-stat]")!==null||fieldset.querySelector("[data-ability-name]")!==null
    })
  }
  function renderMath(){
    const c=current()
    const level=Number(one<HTMLInputElement>("[data-opponent-level]").value)||5
    const grade=Number(one<HTMLSelectElement>("[data-opponent-equipment]").value)||0
    const count=Number(one<HTMLInputElement>("[data-opponent-count]").value)||1
    const situation=Number(one<HTMLInputElement>("[data-situation]").value)||0
    const profile=one<HTMLSelectElement>("[data-opponent-profile]").value as "polyvalent"|"offensif"|"defensif"
    const v=evaluateMatchup(c,level,profile,grade,count,situation)
    const sides=v.creature,other=v.opponent
    one<HTMLElement>("[data-formula]").textContent="Jet d'attaque de "+c.name+" = "+describeFormula(c)
    const mathLines=[
      "Attaque de la créature : "+pct(sides.hits)+" de réussite ; "+pct(sides.contacts)+" de contact.",
      "Dégâts attendus par attaque de la créature : "+sides.expectedDamage.toFixed(2)+".",
      "Attaques du groupe : "+pct(other.hits)+" de réussite ; "+pct(other.woundChance)+" de blessures réelles.",
      "Dégâts moyens par personnage et tentative : "+other.expectedDamage.toFixed(2)+".",
      "Défense de la cible adverse : "+sides.defense+" ; absorption : "+sides.protection+".",
      "Défense de la créature : "+other.defense+" ; absorption : "+other.protection+".",
      "Résistance physique de la créature = 15 + bonus effectif de max(Physique, Agilité) + maîtrise défensive + bonus MJ = "+
        resistanceScoreM03(toDefense(c),"physique")+".",
      "Protection physique de la créature = innée + équipement + protection additionnelle amortie = "+
        effectiveProtectionM03(toDefense(c),"physique")+".",
      "Décompte exact : somme sur les 26 naturels de 5 à 30, pondérée par leurs occurrences parmi 7 776 combinaisons.",
      v.assumptions
    ]
    const math=one<HTMLElement>("[data-math]")
    math.replaceChildren(...mathLines.map(line=>{
      const p=document.createElement("p");p.textContent=line;return p
    }))
    const turns=v.roundsEstimate===null?"aucun dommage : blocage possible":v.roundsEstimate.toFixed(1)+" rounds théoriques"
    let classification="non déterminée"
    if(v.roundsEstimate===null)classification="blocage mécanique"
    else if(v.roundsEstimate<=2&&sides.expectedDamage<other.expectedDamage)classification="faible"
    else if(v.roundsEstimate<=5&&sides.expectedDamage<=other.expectedDamage*1.5)classification="modérée"
    else if(v.roundsEstimate<=10&&sides.expectedDamage<=other.expectedDamage*3)classification="élevée"
    else classification="extrême"
    one<HTMLElement>("[data-danger]").textContent="Évaluation exploratoire : "+classification+
      " ; "+turns+" pour "+v.opponentCount+" personnages. Critères provisoires : faible si ≤2 rounds et pression inférieure, modérée si ≤5 rounds et pression ≤1,5×, élevée si ≤10 rounds et pression ≤3×, extrême autrement. Non calibrée par playtest."
  }
  function render(){
    const c=current()
    const selector=one<HTMLSelectElement>("[data-active]")
    selector.replaceChildren(...cards.map(s=>{
      const opt=document.createElement("option");opt.value=s.id;opt.textContent=s.name+" · N"+s.level;return opt
    }))
    selector.value=c.id
    for(const key of ["name","description","origin","profession","notes"] as const)
      inputValue("[data-text="+key+"]",c[key])
    for(const key of ["kind","role","status"] as const)
      inputValue("[data-choice="+key+"]",c[key])
    inputValue("[data-level]",c.level)
    inputValue("[data-archetype]",c.archetype)
    for(const key of ["physique","agilite","esprit","presence"] as const){
      inputValue("[data-stat="+key+"]",c.stats[key])
      one<HTMLElement>("[data-stat-effective="+key+"]").textContent="Bonus effectif +"+effectiveStat(c.stats[key])
    }
    for(const key of ["lames","esquive","magie","runes","survie","volonte","negociation"] as const){
      inputValue("[data-mastery="+key+"]",c.masteries[key]??0)
      one<HTMLElement>("[data-mastery-effective="+key+"]").textContent="Bonus effectif +"+effectiveMastery(c.masteries[key]??0)
    }
    for(const key of ["pvMax","manaMax","baseDamage","penetration"] as const)
      inputValue("[data-number="+key+"]",c[key])
    for(const attr of ["resistanceBonus","protection","equipmentGrades"] as const)
      for(const key of ["physique","magie","mental"] as const)
        inputValue("[data-def="+attr+"][data-kind="+key+"]",c[attr][key])
    const list=one<HTMLElement>("[data-abilities]")
    list.replaceChildren()
    c.abilities.forEach((ability,i)=>{
      const box=document.createElement("div")
      const p=document.createElement("p")
      p.textContent=ability.name+" — "+ability.description+" · "+ability.limitations+
        (ability.approvedByGM?" · approbation MJ déclarée":" · non approuvée")
      const b=document.createElement("button");b.type="button";b.textContent="Retirer cette capacité"
      b.dataset.abilityRemove=String(i);box.append(p,b);list.append(box)
    })
    displayMode();renderMath()
  }
  function regenerate(resetNumeric=false){
    const c=current()
    const p=createBestiaryCard(c.level,c.archetype,c.kind,c.role)
    const replacement={...p,id:c.id,name:c.name,description:c.description,profession:c.profession,
      origin:c.origin,notes:c.notes,status:c.status,abilities:c.abilities}
    if(resetNumeric===false)replacement.name=c.name
    cards=cards.map(x=>x.id===c.id?replacement:x)
    persist();render();msg("Valeurs mathématiques rétablies à partir du moteur M03.")
  }
  host.addEventListener("input",event=>{
    const t=event.target
    if(!(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement))return
    const c=current()
    if(t.dataset.text){
      const key=t.dataset.text as "name"|"description"|"origin"|"profession"|"notes"
      c[key]=t.value.slice(0,key==="notes"?2000:key==="description"?1500:150)
    }else if(t.dataset.stat){
      const n=nr(t as HTMLInputElement,1,9999);if(n===null){msg("Score brut invalide : entier positif requis.");return}
      c.stats[t.dataset.stat as "physique"]=n
    }else if(t.dataset.mastery){
      const n=nr(t as HTMLInputElement,0,9999);if(n===null){msg("Maîtrise invalide.");return}
      c.masteries[t.dataset.mastery]=n
    }else if(t.dataset.number){
      const k=t.dataset.number as "pvMax"|"manaMax"|"baseDamage"|"penetration"
      const n=nr(t as HTMLInputElement,k==="pvMax"||k==="baseDamage"?1:0,
        k==="baseDamage"?12:k==="penetration"?8:999999)
      if(n===null){msg("Ressource invalide : vérifier les limites.");return}
      c[k]=n
    }else if(t.dataset.def){
      const key=t.dataset.def as "resistanceBonus"|"protection"|"equipmentGrades"
      const kind=t.dataset.kind as "physique"|"magie"|"mental"
      const n=nr(t as HTMLInputElement,0,key==="resistanceBonus"?8:key==="protection"?60:5)
      if(n===null){msg("Défense invalide.");return}
      c[key][kind]=n
    }else if(t.dataset.opponentLevel||t.dataset.opponentCount||t.dataset.situation){
      const min=t.dataset.situation!==undefined?-2:1
      const max=t.dataset.opponentLevel!==undefined?25:t.dataset.opponentCount!==undefined?8:2
      if(nr(t as HTMLInputElement,min,max)===null)return
    }else return
    persist()
    if(t.dataset.text==="name")one<HTMLSelectElement>("[data-active]").selectedOptions[0].textContent=c.name+" · N"+c.level
    if(t.dataset.stat||t.dataset.mastery||t.dataset.def||t.dataset.number||t.dataset.opponentLevel||t.dataset.opponentCount||t.dataset.situation)
      renderMath()
    if(t.dataset.stat||t.dataset.mastery) {
      const rank=t.dataset.stat?c.stats[t.dataset.stat as "physique"]:c.masteries[t.dataset.mastery!]
      const bonus=t.dataset.stat?effectiveStat(rank):effectiveMastery(rank)
      const e=one<HTMLElement>(t.dataset.stat?"[data-stat-effective="+t.dataset.stat+"]":"[data-mastery-effective="+t.dataset.mastery+"]")
      e.textContent="Bonus effectif +"+bonus
    }
  },opts)
  host.addEventListener("change",event=>{
    const t=event.target
    if(!(t instanceof HTMLSelectElement||t instanceof HTMLInputElement))return
    if(t.dataset.active!==undefined){active=t.value;render();return}
    if(t.dataset.import!==undefined){
      const file=(t as HTMLInputElement).files?.[0];t.value=""
      if(!file)return
      if(file.size>1024*1024){msg("Import refusé : fichier supérieur à 1 Mio.");return}
      void file.text().then(raw=>{
        const parsed=JSON.parse(raw) as unknown
        const rows=Array.isArray(parsed)?parsed:[parsed]
        if(!rows.length||rows.length>60||cards.length+rows.length>60)throw Error("Trop de fiches")
        const imported=rows.map(validateBestiaryCard)
        const existing=new Set(cards.map(x=>x.id))
        for(const x of imported){
          if(existing.has(x.id))x.id="bestiary-"+Math.random().toString(36).slice(2)
          existing.add(x.id)
        }
        cards.push(...imported);active=imported[0].id;persist();render()
        msg(imported.length+" fiche(s) importée(s). Aucun pouvoir ni statut canonique accordé automatiquement.")
      }).catch(()=>msg("Import refusé : schéma alrick.bestiary.v1 attendu, données incorrectes ou limite atteinte."))
      return
    }
    const c=current()
    if(t.dataset.choice==="status"){
      if(t.value==="documentaire_approuve"&&!window.confirm("Confirmation MJ : cette mention locale n'intègre PAS automatiquement l'entrée au bestiaire canonique. Continuer ?")){
        render();return
      }
      c.status=t.value as BestiaryStatus
    }else if(t.dataset.choice==="kind"||t.dataset.choice==="role"){
      if(!window.confirm("Changer le profil de référence régénère ses statistiques. Continuer ?")){render();return}
      if(t.dataset.choice==="kind")c.kind=t.value as BestiaryKind
      else c.role=t.value as BestiaryRole
      regenerate();return
    }else if(t.dataset.archetype!==undefined){
      if(!ARCHETYPES.includes(t.value as CreatureArchetype)){render();return}
      if(!window.confirm("Régénérer les valeurs depuis ce nouvel archétype ?")){render();return}
      c.archetype=t.value as CreatureArchetype;regenerate();return
    }else if(t.dataset.level!==undefined){
      const n=nr(t as HTMLInputElement,1,25)
      if(n===null){msg("Niveau invalide : 1–25.");render();return}
      if(!window.confirm("Modifier le niveau régénère les valeurs initiales (vous pourrez les personnaliser ensuite). Continuer ?")){render();return}
      c.level=n;regenerate();return
    }else if(t.dataset.opponentProfile!==undefined||t.dataset.opponentEquipment!==undefined){renderMath();return}
    else return
    persist();renderMath()
  },opts)
  host.addEventListener("click",event=>{
    const target=event.target
    if(!(target instanceof HTMLElement))return
    const button=target.closest<HTMLButtonElement>("button");if(!button)return
    if(button.dataset.mode){
      mode=button.dataset.mode as "rapide"|"guide"|"expert";displayMode();return
    }
    if(button.dataset.abilityRemove!==undefined){
      const n=Number(button.dataset.abilityRemove)
      if(Number.isInteger(n)&&n>=0&&n<current().abilities.length&&window.confirm("Retirer cette capacité ?")){
        current().abilities.splice(n,1);persist();render()
      }
      return
    }
    const action=button.dataset.action
    host.dataset.lastAction=action??"" // diagnostic des contrôles de l'Atelier
    if(action==="new"){
      if(storageDamaged){
        if(!window.confirm("La sauvegarde locale existante est illisible. La remplacer par une nouvelle partie ? Exportez d’abord les données si vous souhaitez essayer de les récupérer."))return
        storageDamaged=false
      }
      if(cards.length>=60){msg("Limite de 60 fiches atteinte.");return}
      const c=createBestiaryCard(5,"faune")
      cards.push(c);active=c.id;persist();render();msg("Nouvelle fiche non canonique.")
    }else if(action==="duplicate"){
      if(cards.length>=60){msg("Limite de 60 fiches atteinte.");return}
      const clone=validateBestiaryCard(JSON.parse(JSON.stringify(current())))
      clone.id="bestiary-"+Math.random().toString(36).slice(2)
      clone.name+=" (copie)";clone.status="brouillon"
      cards.push(clone);active=clone.id;persist();render()
    }else if(action==="delete"){
      if(!window.confirm("Supprimer définitivement cette fiche locale ? Exportez-la d'abord si nécessaire."))return
      cards=cards.filter(x=>x.id!==current().id)
      if(!cards.length)cards=[createBestiaryCard(5,"faune")]
      active=cards[0].id;persist();render()
    }else if(action==="reset"||action==="regenerate"){
      if(!window.confirm("Rétablir les valeurs M03 et perdre les modifications numériques ?"))return
      regenerate(action==="reset")
    }else if(action==="export"){
      host.dataset.exportStage="before"
      download("alrick-bestiary-"+current().id+".json",current())
      host.dataset.exportStage="after"
      msg("Export JSON versionné créé.")
    }else if(action==="export-atelier"){
      const c=current()
      // L'import est volontaire : aucun stockage PJ, campagne ou legacy n'est écrasé.
      // Adapter explicitement le contrat pour les fiches importables par l'Atelier.
      // Quartz inline doit conserver le transfert dans cette ressource client.
      const source=validateBestiaryCard(c)
      const transfer={schema:"alrick.sheets.v3",sheets:[{
        schema:"alrick.sheet.v3",ruleset:"m03-bestiary",kind:source.kind,
        name:source.name,profession:source.profession||source.archetype,
        description:source.description,level:source.level,highestLevel:source.level,
        stats:source.stats,masteries:source.masteries,
        pv:source.pvMax,pvMax:source.pvMax,mana:source.manaMax,manaMax:source.manaMax,
        resistanceBonus:source.resistanceBonus,protection:source.protection,
        equipmentGrades:source.equipmentGrades,notes:source.notes,
        bestiarySource:source
      }]}
      download("alrick-creature-pour-atelier.json",transfer)
      msg("Export M03 de jeu créé : import volontaire dans l'Atelier principal, sans budget de PJ ni changement du bestiaire canonique.")
    }else if(action==="add-ability"){
      const name=one<HTMLInputElement>("[data-ability-name]").value.trim()
      if(!name||current().abilities.length>=25){msg("Nom requis, maximum 25 capacités.");return}
      current().abilities.push({name:name.slice(0,100),
        description:one<HTMLTextAreaElement>("[data-ability-desc]").value.slice(0,1000),
        limitations:one<HTMLInputElement>("[data-ability-limit]").value.slice(0,500),
        approvedByGM:one<HTMLInputElement>("[data-ability-approved]").checked})
      for(const q of ["[data-ability-name]","[data-ability-desc]","[data-ability-limit]"])
        (one<HTMLInputElement|HTMLTextAreaElement>(q)).value=""
      one<HTMLInputElement>("[data-ability-approved]").checked=false
      persist();render()
      msg("Capacité narrative enregistrée sans effet mécanique automatique.")
    }
  },opts)
  render()
  host.dataset.initialized="true" // signal de recette : données ET événements interactifs prêts.
  window.addCleanup(()=>{host.dataset.initialized="false";controller.abort()})
}
document.addEventListener("nav",startBestiary)
