/**
 * MAG-003.C — UI locale pour la récupération, les rites et les dossiers d'atelier.
 * Démonstration non canonique ; aucune autorité réseau, aucun miracle ou débit collectif.
 * Les champs historiques Grimoire/matrices/charges ne sont jamais interprétés ni modifiés ici.
 */
import {MANA_SCHEMA,createManaState,applyManaOperation,importManaState,dailyCeiling,MANA_POLICIES} from "./atelier5d6-mana-recovery"
import type {ManaState,RestKind,ManaOperation} from "./atelier5d6-mana-recovery"
import {RITUAL_SCHEMA,createRitualInstance,transitionRitual,importRitual,applicationPlan} from "./atelier5d6-rituals-mag003b"
import type {RitualDefinition,RitualInstance,RitualParticipant,RitualRole,RitualContribution} from "./atelier5d6-rituals-mag003b"

export const RITES_UI_SCHEMA="alrick.mag003c.local.v1" as const
export type WorkOrder={id:string;kind:"matrice"|"stabilisation"|"consecration"|"fabrication"|"entretien"|"recherche"|"variante";itemId:string;description:string;status:"proposition_mj";createdAt:string}
export type RiteWorkspace={schema:typeof RITES_UI_SCHEMA;recovery?:ManaState;knownRites:string[];rituals:RitualInstance[];workOrders:WorkOrder[]}
export type RiteSheet={id:string;name:string;mana:number;manaMax:number;stats:{esprit:number};masteries:Record<string,number>;inventory?:{id:string;name:string}[];grimoire?:{circlesAttested:number[];matrices:{id:string;itemId:string;charges:number}[]};ritualWorkshop?:RiteWorkspace}
export type RecoveryRequest={dayKey:string;restId:string;kind:RestKind;safe:boolean;completed:boolean;focused:boolean;exceptionalApproved:boolean;isMJ:boolean}
const kinds:RestKind[]=["shortFirst","shortSecond","shortDeep","shortRitual","longOrdinary","longRetreat"]
const labels:Record<RestKind,string>={
  shortFirst:"Premier repos court sûr",shortSecond:"Deuxième repos court",
  shortDeep:"Repos court avec pratique approfondie",shortRitual:"Rite court exceptionnel (MJ)",
  longOrdinary:"Repos long ordinaire",longRetreat:"Retraite exceptionnelle (MJ)"
}
const safeId=(x:string)=>x.trim().slice(0,100)
const esc=(x:unknown)=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c))
const fresh=():RiteWorkspace=>({schema:RITES_UI_SCHEMA,knownRites:[],rituals:[],workOrders:[]})
export function readWorkspace(sheet:RiteSheet):RiteWorkspace{
  if(sheet.ritualWorkshop===undefined)return fresh()
  const w=sheet.ritualWorkshop
  if(!w||w.schema!==RITES_UI_SCHEMA||!Array.isArray(w.knownRites)||!Array.isArray(w.rituals)||!Array.isArray(w.workOrders))
    throw new Error("Extension MAG-003.C non reconnue : exportez une copie, aucune migration silencieuse.")
  if(w.recovery){
    importManaState(JSON.stringify(w.recovery))
    if(w.recovery.characterId!==sheet.id)throw new Error("Identité du registre importé différente : réconciliation MJ requise, sans écriture automatique.")
  }
  for(const r of w.rituals)importRitual(JSON.stringify(r))
  return w
}
function newOp(s:ManaState,req:RecoveryRequest):ManaOperation{
  if(!safeId(req.restId)||!safeId(req.dayKey))throw new Error("Journée de jeu et période de repos obligatoires.")
  if(!kinds.includes(req.kind))throw new Error("Pratique inconnue.")
  return {id:"mag003c:rest:"+s.characterId+":"+s.dayKey+":"+safeId(req.restId),
    type:"recover",characterId:s.characterId,dayKey:req.dayKey,
    validation:{approved:true,authority:req.isMJ?"mj":"simulation",origin:req.isMJ?"mag003c-local-mj":"mag003c-local-pj"},
    kind:req.kind,rest:{restId:safeId(req.restId),safe:req.safe,completed:req.completed,
      focused:req.focused,exceptionalApproved:req.isMJ&&req.exceptionalApproved}}
}
export function previewRecovery(sheet:RiteSheet,req:RecoveryRequest){
  const w=readWorkspace(sheet)
  if(!Number.isSafeInteger(sheet.mana)||!Number.isSafeInteger(sheet.manaMax)||sheet.mana<0||sheet.mana>sheet.manaMax)
    throw new Error("Réserve de mana invalide.")
  const s=w.recovery??createManaState(sheet.id,req.dayKey,sheet.manaMax,sheet.mana,MANA_POLICIES.reference)
  if(s.mana!==sheet.mana||s.manaMax!==sheet.manaMax)
    throw new Error("Désaccord avec le Grimoire/fiche : aucune récupération possible avant réconciliation explicite.")
  const result=applyManaOperation(s,newOp(s,req))
  return {before:s,result,remaining:Math.max(0,dailyCeiling(result.state)-result.state.recoveredToday)}
}
export function commitRecovery(sheet:RiteSheet,req:RecoveryRequest){
  const p=previewRecovery(sheet,req)
  // Seule la récupération personnelle peut créditer la fiche locale.
  // Le moteur porte l'idempotence de l'identifiant de repos (double clic / import).
  if(!p.result.entry.accepted)return p
  const w=readWorkspace(sheet)
  w.recovery=p.result.state
  sheet.ritualWorkshop=w
  sheet.mana=p.result.state.mana
  return p
}
export function trackGrimoireManaChange(sheet:RiteSheet,before:number,after:number,reason:string):boolean{
  const w=readWorkspace(sheet)
  if(!w.recovery)return false // aucun registre initialisé, l'état Grimoire reste la source
  if(w.recovery.mana!==before||after>before||after<0||!Number.isSafeInteger(after))
    return false // conflit explicite ; prochaine récupération sera bloquée
  if(after===before)return true
  const s=w.recovery
  const operation:ManaOperation={id:"mag003c:external:"+s.characterId+":"+
    s.dayKey+":"+(s.journal.length+1)+":"+safeId(reason),type:"spend",
    characterId:s.characterId,dayKey:s.dayKey,validation:{approved:true,authority:"simulation",
      origin:"grimoire-g001-local"},cost:before-after,purpose:safeId(reason)||"Grimoire"}
  const r=applyManaOperation(s,operation)
  if(!r.entry.accepted||r.state.mana!==after)return false
  w.recovery=r.state;sheet.ritualWorkshop=w
  return true
}
export function nextRecoveryDay(sheet:RiteSheet,nextDay:string,isMJ:boolean){
  const w=readWorkspace(sheet),s=w.recovery
  if(!s)throw new Error("Initialiser d'abord la journée par un repos.")
  if(s.mana!==sheet.mana||s.manaMax!==sheet.manaMax)throw new Error("État de mana divergent.")
  if(!safeId(nextDay))throw new Error("Nouvelle journée obligatoire.")
  const r=applyManaOperation(s,{id:"mag003c:day:"+s.characterId+":"+s.dayKey+":"+safeId(nextDay),
    type:"nextDay",characterId:s.characterId,dayKey:s.dayKey,nextDay:safeId(nextDay),
    validation:{approved:true,authority:isMJ?"mj":"simulation",origin:"mag003c-explicit-day"}})
  if(r.entry.accepted){w.recovery=r.state;sheet.ritualWorkshop=w}
  return r
}
export const DEMO_RITES:readonly RitualDefinition[]=[
  {schema:RITUAL_SCHEMA,id:"demo-recueillement",version:"1.0.0",title:"Recueillement personnel (démo)",
    practice:"recueillement",resolution:"automatique",leadRole:"officiant",feasible:true,requiresSafePlace:true,
    requiredRoles:["officiant"],components:{},effects:[]},
  {schema:RITUAL_SCHEMA,id:"demo-priere",version:"1.0.0",title:"Prière personnelle (démo, sans intervention)",
    practice:"priere",resolution:"automatique",leadRole:"officiant",feasible:true,requiresSafePlace:true,
    requiredRoles:["officiant"],components:{},effects:[]},
  {schema:RITUAL_SCHEMA,id:"demo-tradition",version:"1.0.0",title:"Ronde des artisans (démo non religieuse)",
    practice:"tradition",traditionLabel:"Transmission d'atelier",resolution:"automatique",leadRole:"officiant",
    feasible:true,requiresSafePlace:true,requiredRoles:["officiant","artisan"],components:{},effects:[]},
  {schema:RITUAL_SCHEMA,id:"demo-ceremonie",version:"1.0.0",title:"Cérémonie de coopération (démo)",
    practice:"preparation_rituel",resolution:"m01",difficulty:21,leadRole:"officiant",
    feasible:true,requiresSafePlace:true,requiredRoles:["officiant","gardien"],components:{},effects:[]}
] as const
export function buildParticipant(sheet:RiteSheet,role:RitualRole):RitualParticipant{
  // Des attestations de Cercle ne permettent PAS de concevoir, comprendre ou assister implicitement.
  return {id:sheet.id,role,rawStat:sheet.stats.esprit,masteryRank:sheet.masteries.magie??0,
    mage:(sheet.masteries.magie??0)>0,skills:[],circleRights:{}}
}
export function startCeremony(def:RitualDefinition,id:string,participants:RitualParticipant[],safePlace:boolean,assist:boolean){
  const instance=createRitualInstance(def,id,participants)
  const contributions:RitualContribution[]=assist&&participants.length>1
    ?[{id:id+":support",participantId:participants[1].id,kind:"support",detail:"Aide contextuelle (laboratoire)",
      approved:true}]:[]
  return transitionRitual(instance,{id:id+":prepare",type:"preparer",tick:1,safePlace,contributions})
}
export function resolveCeremony(source:RitualInstance,natural:number,isMJ:boolean){
  if(!isMJ)throw new Error("Résolution collective : validation MJ locale obligatoire.")
  const engaged=source.status==="prepare"
    ?transitionRitual(source,{id:source.id+":engage",type:"engager",tick:source.tick+1}):source
  const solved=transitionRitual(engaged,{id:source.id+":resolve",type:"resoudre",
    tick:engaged.tick+1,...(engaged.definition.resolution==="automatique"?{}:{natural})})
  // Aucun commit de ressources ni effets ; simulation explicite.
  return {instance:solved,plan:applicationPlan(solved)}
}
export function addWorkOrder(sheet:RiteSheet,order:WorkOrder){
  const w=readWorkspace(sheet)
  if(w.workOrders.some(x=>x.id===order.id))throw new Error("Dossier déjà consigné.")
  if(order.itemId&&!sheet.inventory?.some(x=>x.id===order.itemId))throw new Error("Objet absent de l'inventaire.")
  w.workOrders.push({...order,status:"proposition_mj"})
  sheet.ritualWorkshop=w
}
export function createRitesPanel(args:{root:HTMLElement;getSheet:()=>RiteSheet;getSheets:()=>RiteSheet[];
  isMJ:()=>boolean;persist:()=>void;message:(s:string)=>void;onChange:()=>void}){
  const grimoire=args.root.querySelector<HTMLElement>('[data-hub="grimoire"]')
  const nav=args.root.querySelector<HTMLElement>(".atelier-quicknav")
  if(!grimoire||!nav)return {render:()=>{},onManaChanged:trackGrimoireManaChange}
  const button=document.createElement("button");button.type="button";button.dataset.hubNav="rites"
  button.textContent="🕯️ Rites et repos";nav.insertBefore(button,nav.querySelector('[data-hub-nav="affinites"]'))
  const section=document.createElement("details")
  section.className="atelier-hub-section";section.dataset.hub="rites"
  section.innerHTML='<summary>🕯️ Rites, récupération et cérémonies — laboratoire</summary>'+
   '<div class="atelier-hub-inner" data-rites-root>'+
   '<p><strong>Prototype non canonique, local.</strong> Les repos personnels peuvent modifier la fiche locale après confirmation. Les cérémonies sont simulées : aucune synchronisation des Tables, aucun débit collectif, aucun effet ou pouvoir octroyé. Les prières ne donnent pas automatiquement de foi.</p>'+
   '<p data-rites-status role="status" aria-live="polite"></p>'+
   '<div class="atelier-fields"><label>Journée de jeu (clé décidée à la table)<input data-rites-day placeholder="ex. jour-campagne-12"></label>'+
   '<label>Période unique de repos<input data-rites-rest-id placeholder="ex. nuit-camp-12"></label>'+
   '<label>Pratique / repos<select data-rites-kind>'+kinds.map(k=>'<option value="'+k+'">'+labels[k]+'</option>').join("")+'</select></label></div>'+
   '<div class="atelier-fields"><label><input type="checkbox" data-rites-safe> Lieu sûr attesté</label>'+
   '<label><input type="checkbox" data-rites-complete> Repos terminé</label>'+
   '<label><input type="checkbox" data-rites-focus> Pratique structurée accomplie</label>'+
   '<label><input type="checkbox" data-rites-exception> Condition exceptionnelle approuvée par MJ local</label></div>'+
   '<p data-rites-mana></p><p data-rites-preview></p>'+
   '<button type="button" data-rites-action="preview">Prévisualiser la récupération</button> '+
   '<button type="button" data-rites-action="recover">Confirmer le repos personnel</button> '+
   '<button type="button" data-rites-action="next-day">Passer explicitement à la journée indiquée</button>'+
   '<hr><h4>Mes rites connus / Mes pratiques</h4><p data-rites-known></p>'+
   '<label>Rite de démonstration<select data-rites-definition>'+DEMO_RITES.map(x=>'<option value="'+x.id+'">'+esc(x.title)+'</option>').join("")+'</select></label> '+
   '<button type="button" data-rites-action="learn">MJ local : enregistrer un rite connu</button>'+
   '<h4>Préparer une cérémonie</h4><p>Officiant : fiche active. Ajouter d’autres fiches comme participants. Compétences et rôles sont vérifiés par MAG-003.B ; aide plafonnée à +1.</p>'+
   '<div class="atelier-fields"><label>Participant<select data-rites-participant></select></label>'+
   '<label>Rôle<select data-rites-role><option value="gardien">Gardien</option><option value="artisan">Artisan</option><option value="chantre">Chantre</option><option value="assistant">Assistant</option><option value="runiste">Runiste</option><option value="canaliseur">Canaliseur</option></select></label></div>'+
   '<button type="button" data-rites-action="add-person">Ajouter au groupe</button> '+
   '<button type="button" data-rites-action="clear-persons">Vider le groupe</button>'+
   '<p data-rites-people></p><label><input type="checkbox" data-rites-assist> Assistance préparée et validée localement (+1 maximum)</label>'+
   '<div class="atelier-fields"><label>Naturel 5d6 (5–30, si rite incertain)<input type="number" min="5" max="30" value="18" data-rites-natural></label></div>'+
   '<button type="button" data-rites-action="prepare">Préparer (sans débit)</button> '+
   '<button type="button" data-rites-action="resolve">MJ local : simuler la résolution</button> '+
   '<button type="button" data-rites-action="interrupt">Interrompre</button>'+
   '<p data-rites-ceremony></p><h4>Recherche, variantes et objets</h4>'+
   '<p>Proposition documentaire uniquement : aucune recharge, consécration, fabrication ou création d’artefact automatique.</p>'+
   '<div class="atelier-fields"><label>Type de dossier<select data-rites-work-kind>'+
   '<option value="variante">Variante de rite</option><option value="matrice">Préparation de matrice</option>'+
   '<option value="stabilisation">Stabiliser un dispositif</option><option value="consecration">Consacrer un objet</option>'+
   '<option value="fabrication">Organisation de fabrication</option><option value="entretien">Entretien</option>'+
   '<option value="recherche">Recherche magique</option></select></label>'+
   '<label>Objet existant (facultatif)<select data-rites-item></select></label></div>'+
   '<label>Hypothèse / limites / contributions<textarea data-rites-work-description rows="2"></textarea></label>'+
   '<button type="button" data-rites-action="work">Consigner une proposition à soumettre au MJ</button>'+
   '<p data-rites-work-list></p><h4>Historique des pratiques et décisions</h4><div data-rites-history></div>'+
   '<p>Intégration Tables : préparation locale seulement. Le serveur T-001 n’expose pas ici d’opération transactionnelle rituelle ; ni validation MJ réseau ni synchronisation ne sont simulées.</p></div>'
  grimoire.insertAdjacentElement("afterend",section)
  const q=<T extends HTMLElement>(s:string)=>section.querySelector<T>(s)!
  let draft:Array<{sheetId:string;role:RitualRole}>=[]
  let activeId=""
  let lastPreview=""
  const status=(txt:string)=>{q<HTMLElement>("[data-rites-status]").textContent=txt;args.message(txt)}
  const uid=()=>String(Date.now())+"-"+Math.random().toString(36).slice(2,9)
  const req=():RecoveryRequest=>({dayKey:q<HTMLInputElement>("[data-rites-day]").value.trim(),
    restId:q<HTMLInputElement>("[data-rites-rest-id]").value.trim(),
    kind:q<HTMLSelectElement>("[data-rites-kind]").value as RestKind,
    safe:q<HTMLInputElement>("[data-rites-safe]").checked,
    completed:q<HTMLInputElement>("[data-rites-complete]").checked,
    focused:q<HTMLInputElement>("[data-rites-focus]").checked,
    exceptionalApproved:q<HTMLInputElement>("[data-rites-exception]").checked,isMJ:args.isMJ()})
  function render(){
    const s=args.getSheet()
    if(activeId!==s.id){activeId=s.id;draft=[];lastPreview="";q<HTMLInputElement>("[data-rites-rest-id]").value=""}
    try{
      const w=readWorkspace(s)
      q<HTMLElement>("[data-rites-mana]").textContent=
        "Mana "+s.mana+"/"+s.manaMax+" · "+(w.recovery?"Jour "+w.recovery.dayKey+
        " · récupéré "+w.recovery.recoveredToday+" · plafond atteint "+dailyCeiling(w.recovery)+
        " · repos courts "+w.recovery.shortCount+"/2":"Registre non initialisé (premier repos requis)")
      q<HTMLElement>("[data-rites-known]").textContent=w.knownRites.length?w.knownRites.map(x=>
        DEMO_RITES.find(d=>d.id===x)?.title??x).join(" · "):"Aucun rite personnel enregistré comme connu."
      q<HTMLElement>("[data-rites-history]").textContent=[
        ...(w.recovery?.journal.slice(-12).map(e=>e.dayKey+" · "+e.kind+" : "+(e.accepted?
          (e.gain?"+"+e.gain+" mana":e.spent?"−"+e.spent+" mana":"0 mana"):"refus "+e.reason))??[]),
        ...w.rituals.slice(-8).map(x=>x.definition.title+" : "+x.status+" (simulation locale)")
      ].join("\n")||"Aucun événement."
      q<HTMLElement>("[data-rites-history]").style.whiteSpace="pre-line"
      q<HTMLElement>("[data-rites-work-list]").textContent=w.workOrders.slice(-8).map(x=>
        x.kind+" / "+(s.inventory?.find(i=>i.id===x.itemId)?.name??"sans objet")+
        " : "+x.description+" [proposition MJ]").join(" ; ")||"Aucun dossier."
      q<HTMLElement>("[data-rites-ceremony]").textContent=w.rituals.length?
        w.rituals[w.rituals.length-1].definition.title+" — "+w.rituals[w.rituals.length-1].status+
        (w.rituals[w.rituals.length-1].result?
          " · succès proposé : "+w.rituals[w.rituals.length-1].result!.success+
          " · P="+Math.round(w.rituals[w.rituals.length-1].result!.probability*100)+" % · AUCUN effet appliqué":"")
        :"Aucune cérémonie préparée."
      const participant=q<HTMLSelectElement>("[data-rites-participant]"),old=participant.value
      participant.innerHTML=args.getSheets().filter(x=>x.id!==s.id).map(x=>
        '<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join("")
      if([...participant.options].some(o=>o.value===old))participant.value=old
      const item=q<HTMLSelectElement>("[data-rites-item]"),itemValue=item.value
      item.innerHTML='<option value="">Sans objet</option>'+(s.inventory??[]).map(x=>
        '<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join("")
      if([...item.options].some(o=>o.value===itemValue))item.value=itemValue
      q<HTMLElement>("[data-rites-people]").textContent=draft.map(x=>
        (args.getSheets().find(s=>s.id===x.sheetId)?.name||x.sheetId)+" ("+x.role+")").join(" · ")||
        "Participants : officiant seul."
      q<HTMLButtonElement>('[data-rites-action="learn"]').disabled=!args.isMJ()
      q<HTMLButtonElement>('[data-rites-action="resolve"]').disabled=!args.isMJ()
    }catch(e){q<HTMLElement>("[data-rites-mana]").textContent=String(e);status("Extension de rites en lecture bloquée : "+String(e))}
  }
  section.addEventListener("click",e=>{
    const b=(e.target as HTMLElement).closest<HTMLButtonElement>("button[data-rites-action]")
    if(!b)return
    const action=b.dataset.ritesAction||"",s=args.getSheet()
    try{
      if(action==="preview"||action==="recover"){
        const p=previewRecovery(s,req())
        lastPreview=p.result.entry.accepted?
          "Gain prévu : +"+p.result.entry.gain+" mana ; après "+p.result.state.mana+
          "/"+p.result.state.manaMax+" ; restant du plafond "+p.remaining:
          "Action refusée : "+p.result.entry.reason
        q<HTMLElement>("[data-rites-preview]").textContent=lastPreview
        if(action==="recover"&&p.result.entry.accepted&&window.confirm(lastPreview+
          "\nConfirmer l'inscription locale ? Aucun serveur ne valide cet acte.")){
          const done=commitRecovery(s,req())
          status(done.result.duplicate?"Période déjà enregistrée — aucun crédit en double.":
            "Repos consigné : +"+done.result.entry.gain+" mana (validation locale uniquement).")
          args.onChange();args.persist()
        }
      }else if(action==="next-day"){
        if(!window.confirm("Passer à une nouvelle journée de jeu explicite, sans récupérer de mana ?"))return
        const outcome=nextRecoveryDay(s,req().dayKey,args.isMJ())
        status(outcome.entry.accepted?"Nouvelle journée enregistrée.":outcome.entry.reason)
        args.persist()
      }else if(action==="learn"){
        if(!args.isMJ())throw new Error("Validation MJ locale requise.")
        const w=readWorkspace(s),id=q<HTMLSelectElement>("[data-rites-definition]").value
        if(!DEMO_RITES.some(x=>x.id===id))throw new Error("Rite absent.")
        if(!w.knownRites.includes(id))w.knownRites.push(id)
        s.ritualWorkshop=w;args.persist();status("Rite de démo marqué connu localement, sans nouveau Cercle.")
      }else if(action==="add-person"){
        const id=q<HTMLSelectElement>("[data-rites-participant]").value
        const role=q<HTMLSelectElement>("[data-rites-role]").value as RitualRole
        if(!args.getSheets().some(x=>x.id===id)||draft.some(x=>x.sheetId===id))throw new Error("Participant invalide ou doublon.")
        draft.push({sheetId:id,role});status("Participant ajouté à la préparation locale.")
      }else if(action==="clear-persons"){draft=[];status("Groupe vidé.")}
      else if(action==="prepare"){
        const w=readWorkspace(s),id=q<HTMLSelectElement>("[data-rites-definition]").value
        const def=DEMO_RITES.find(x=>x.id===id)
        if(!def)throw new Error("Rite inconnu.")
        const participants=[buildParticipant(s,"officiant"),...draft.map(x=>{
          const member=args.getSheets().find(z=>z.id===x.sheetId)
          if(!member)throw new Error("Participant absent du répertoire.")
          return buildParticipant(member,x.role)
        })]
        const instance=startCeremony(def,"mag003c:ritual:"+uid(),participants,req().safe,
          q<HTMLInputElement>("[data-rites-assist]").checked)
        w.rituals.push(instance);s.ritualWorkshop=w;args.persist()
        status("Rite préparé ; aucune ressource dépensée, aucune exécution multijoueur.")
      }else if(action==="resolve"){
        const w=readWorkspace(s),latest=w.rituals[w.rituals.length-1]
        if(!latest)throw new Error("Préparer d'abord un rite.")
        const natural=Number(q<HTMLInputElement>("[data-rites-natural]").value)
        const result=resolveCeremony(latest,natural,args.isMJ())
        w.rituals[w.rituals.length-1]=result.instance;s.ritualWorkshop=w;args.persist()
        status("Résultat simulé "+(result.instance.result?.success?"réussi":"échoué")+
          ", P="+Math.round((result.instance.result?.probability??0)*100)+" %. "+result.plan.warning)
      }else if(action==="interrupt"){
        const w=readWorkspace(s),latest=w.rituals[w.rituals.length-1]
        if(!latest||!["prepare","engage"].includes(latest.status))throw new Error("Aucun rite interruptible.")
        w.rituals[w.rituals.length-1]=transitionRitual(latest,{id:latest.id+":interrupt",type:"interrompre",
          tick:latest.tick+1,reason:"Interruption confirmée en local"})
        s.ritualWorkshop=w;args.persist();status("Rite interrompu ; aucune dépense déclenchée.")
      }else if(action==="work"){
        const description=q<HTMLTextAreaElement>("[data-rites-work-description]").value.trim().slice(0,800)
        if(!description)throw new Error("Décrire l'hypothèse et les limites.")
        addWorkOrder(s,{id:"mag003c:work:"+uid(),
          kind:q<HTMLSelectElement>("[data-rites-work-kind]").value as WorkOrder["kind"],
          itemId:q<HTMLSelectElement>("[data-rites-item]").value,description,status:"proposition_mj",
          createdAt:new Date().toISOString()})
        args.persist();status("Proposition d'atelier enregistrée ; aucune énergie/charge modifiée.")
      }
    }catch(error){status("Action non appliquée : "+(error instanceof Error?error.message:String(error)))}
    render()
  })
  return {render,onManaChanged:trackGrimoireManaChange}
}
