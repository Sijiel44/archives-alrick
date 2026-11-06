/**
 * DG-LOT-004 / L004-B — recommandations XP et journal de décisions MJ.
 * Prototype local PUR, non canonique. Les formules XP/coûts/progression M01 restent la seule autorité.
 * Aucun retour n'applique des XP, caractéristiques ou niveaux à une fiche PJ.
 * Référence applicative : prototype/dg003-integrated @ 2ab809ef5351940e0fc272b859d10f21de894d00.
 */
import {
  experienceAward,experienceRequired,legacyExperienceRequired,canReachLevel,
  progressionAtLevel,developmentBudget,statCost,masteryCost
} from "../../../../quartz/components/scripts/atelier5d6-progression"
import type {ExperienceEvent} from "../../../../quartz/components/scripts/atelier5d6-progression"

export const XP_DECISION_SCHEMA = "cer.math.xp-decision.provisional.v1" as const
export type SessionMode = "campagne"|"one-shot"
export type CharacterOrigin = "creation"|"pretire"|"import"
export type PaceNote = "libre"|"rapide"|"etale"
export type LedgerSeed={
  campaignId:string;characterId:string;initialLevel:number;initialXp:number;
  sessionMode:SessionMode;characterOrigin:CharacterOrigin;paceNote:PaceNote;
  sourceRef?:string;initialMilestones?:readonly number[]
}
export type DecisionMeta={
  id:string;expectedRevision:number;at:string;decidedBy:string;reason:string;approvedByMJ:true
}
export type ExperienceCommand=
 |(DecisionMeta&{kind:"award";event:ExperienceEvent;decidedXp:number})
 |(DecisionMeta&{kind:"correction";targetId:string;deltaXp:number})
 |(DecisionMeta&{kind:"milestone";level:number})
 |(DecisionMeta&{kind:"promotion";targetLevel:number})
export type DecisionEntry={
  command:ExperienceCommand;fingerprint:string;nativeSuggestedXp?:number
}
export type ExperienceLedger={
  schema:typeof XP_DECISION_SCHEMA;seed:LedgerSeed;revision:number;
  entries:readonly DecisionEntry[]
}
export type LedgerView={
  xp:number;level:number;milestones:readonly number[];revision:number;
  /** Indication de réexamen, jamais une rétrogradation automatique. */
  advancementNeedsReview:boolean
}
export type DecisionResponse=
 |{status:"recorded";state:ExperienceLedger;view:LedgerView;entry:DecisionEntry;appliedToSheet:false}
 |{status:"duplicate";state:ExperienceLedger;view:LedgerView;entry:DecisionEntry;appliedToSheet:false}
 |{status:"rejected";state:ExperienceLedger;code:string;reason:string;appliedToSheet:false}
export type XpSuggestion=
 |{status:"suggested";nativeSuggestedXp:number;sourceAlreadyRecorded:boolean;informationalOnly:true;engine:"M01"}
 |{status:"rejected";code:string;reason:string;informationalOnly:true}

const isRecord=(x:unknown):x is Record<string,unknown>=>x!==null&&typeof x==="object"&&!Array.isArray(x)
const validId=(x:unknown):x is string=>typeof x==="string"&&x.trim().length>0&&x.length<=150
const safeNat=(x:unknown):x is number=>Number.isSafeInteger(x)&&Number(x)>=0
const safeLevel=(x:unknown):x is number=>Number.isSafeInteger(x)&&Number(x)>=1&&Number(x)<=25
const allowedDomains=["combat","artisanat","savoir","diplomatie","exploration","magie","secours","transmission"] as const
const allowedScopes=["ordinaire","majeur","legendaire"] as const
const modes:readonly string[]=["campagne","one-shot"]
const origins:readonly string[]=["creation","pretire","import"]
const paces:readonly string[]=["libre","rapide","etale"]
const keys=(x:Record<string,unknown>,allowed:readonly string[])=>Object.keys(x).every(k=>allowed.includes(k))
const iso=(x:unknown):x is string=>typeof x==="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(x)&&
  !Number.isNaN(Date.parse(x))&&new Date(x).toISOString()===x
const rejected=(state:ExperienceLedger,code:string,reason:string):DecisionResponse=>({status:"rejected",state,code,reason,appliedToSheet:false})

/** Formulaire volontairement séparé de la fiche. N1–25 sans XP implicite, même au N5 prétiré. */
export function createXpDecisionLedger(options:LedgerSeed):ExperienceLedger {
  if(!isRecord(options)||!keys(options,["campaignId","characterId","initialLevel","initialXp","sessionMode","characterOrigin","paceNote","sourceRef","initialMilestones"]))
    throw new RangeError("Options de création non reconnues.")
  if(!validId(options.campaignId)||!validId(options.characterId)||!safeLevel(options.initialLevel)||!safeNat(options.initialXp))
    throw new RangeError("Campagne, personnage, niveau initial 1–25 et XP explicites obligatoires.")
  if(!modes.includes(options.sessionMode)||!origins.includes(options.characterOrigin)||!paces.includes(options.paceNote))
    throw new RangeError("Mode, origine ou rythme descriptif invalide.")
  if(options.sourceRef!==undefined&&!validId(options.sourceRef))throw new RangeError("Référence source invalide.")
  if(options.initialMilestones!==undefined&&!Array.isArray(options.initialMilestones))throw new RangeError("Paliers initiaux invalides.")
  const ms=[...(options.initialMilestones??[])]
  if(ms.some((n,i)=>!safeLevel(n)||n<21||n>options.initialLevel||n!==21+i))
    throw new RangeError("Paliers initiaux 21–25 ordonnés et explicitement attestés seulement.")
  // Le niveau initial et les XP sont CHOISIS indépendamment, jamais calculés ou crédités ici.
  const seed:LedgerSeed={campaignId:options.campaignId,characterId:options.characterId,
    initialLevel:options.initialLevel,initialXp:options.initialXp,
    sessionMode:options.sessionMode,characterOrigin:options.characterOrigin,paceNote:options.paceNote,
    ...(options.sourceRef===undefined?{}:{sourceRef:options.sourceRef}),initialMilestones:ms}
  return {schema:XP_DECISION_SCHEMA,seed,revision:0,entries:[]}
}

const validEvent=(e:unknown):e is ExperienceEvent=>isRecord(e)&&
  keys(e,["id","pattern","domain","difficulty","scope","approved"])&&
  validId(e.id)&&validId(e.pattern)&&allowedDomains.includes(e.domain as typeof allowedDomains[number])&&
  Number.isSafeInteger(e.difficulty)&&Number(e.difficulty)>=1&&Number(e.difficulty)<=12&&
  allowedScopes.includes(e.scope as typeof allowedScopes[number])&&typeof e.approved==="boolean"

function awardRemaining(entry:DecisionEntry,entries:readonly DecisionEntry[]):number {
  if(entry.command.kind!=="award")throw new Error("Référence de récompense invalide.")
  const changes=entries.filter(x=>x.command.kind==="correction"&&x.command.targetId===entry.command.id)
  const total=changes.reduce((n,x)=>n+(x.command.kind==="correction"?x.command.deltaXp:0),entry.command.decidedXp)
  if(!safeNat(total))throw new RangeError("Journal de correction incohérent.")
  return total
}
function adoptedEvents(state:ExperienceLedger):ExperienceEvent[]{
  return state.entries.filter(x=>x.command.kind==="award"&&awardRemaining(x,state.entries)>0)
    .map(x=>(x.command as Extract<ExperienceCommand,{kind:"award"}>).event)
}
function sourceRecorded(state:ExperienceLedger,id:string):boolean{
  return state.entries.some(x=>x.command.kind==="award"&&x.command.event.id===id)
}

/** Retourne UNIQUEMENT une suggestion M01 ; aucune attribution de points. */
export function suggestXpFromM01(state:ExperienceLedger,event:unknown):XpSuggestion{
  if(!validEvent(event))return {status:"rejected",code:"INVALID_EVENT",reason:"Événement M01 invalide.",informationalOnly:true}
  try {
    return {status:"suggested",nativeSuggestedXp:experienceAward(event,adoptedEvents(state)),
      sourceAlreadyRecorded:sourceRecorded(state,event.id),informationalOnly:true,engine:"M01"}
  }catch(e){return {status:"rejected",code:"NATIVE_SUGGESTION_REJECTED",reason:e instanceof Error?e.message:"Erreur M01.",informationalOnly:true}}
}

/** Vue du seul JOURNAL ; ne lit ni ne mute la fiche ni le registre XP M02. */
export function inspectXpLedger(state:ExperienceLedger):LedgerView{
  if(!isRecord(state)||state.schema!==XP_DECISION_SCHEMA||!Array.isArray(state.entries)||
    !Number.isSafeInteger(state.revision)||state.revision!==state.entries.length)
    throw new RangeError("Journal non conforme ou révision incohérente.")
  let xp=state.seed.initialXp,level=state.seed.initialLevel
  const milestones=[...(state.seed.initialMilestones??[])]
  for(const entry of state.entries){
    if(entry.command.kind==="award")xp+=entry.command.decidedXp
    if(entry.command.kind==="correction")xp+=entry.command.deltaXp
    if(entry.command.kind==="milestone")milestones.push(entry.command.level)
    if(entry.command.kind==="promotion")level=entry.command.targetLevel
    if(!safeNat(xp))throw new RangeError("Total XP non représentable ou négatif.")
  }
  return {xp,level,milestones,revision:state.revision,
    advancementNeedsReview:level>state.seed.initialLevel&&xp<experienceRequired(level)}
}

/** Application native du seuil M01, suivie d'une décision MJ TOUJOURS distincte. */
export function previewXpProgression(state:ExperienceLedger,targetLevel:number){
  if(!safeLevel(targetLevel))return {status:"rejected" as const,code:"INVALID_LEVEL",requiresMjDecision:true}
  const view=inspectXpLedger(state)
  const nativeRequiredXp=experienceRequired(targetLevel)
  const eligibleNative=canReachLevel(targetLevel,view.xp,view.milestones)
  return {status:"preview" as const,targetLevel,currentLevel:view.level,
    nextLevelOnly:targetLevel===view.level+1,nativeRequiredXp,
    missingXp:Math.max(0,nativeRequiredXp-view.xp),eligibleNative,
    maySubmitDecision:targetLevel===view.level+1&&eligibleNative,
    requiresMjDecision:true,appliedToSheet:false}
}

/** Coûts et seuils = appels directs à M01, jamais une courbe recalculée. */
export function nativeXpAndCosts(level:number,statFrom:number,statTo:number,masteryFrom:number,masteryTo:number){
  return {progression:progressionAtLevel(level),nativeExperience:experienceRequired(level),
    nativeLegacyExperience:legacyExperienceRequired(level),
    nativeDevelopmentBudget:developmentBudget(level),
    nativeStatCost:statCost(statFrom,statTo),nativeMasteryCost:masteryCost(masteryFrom,masteryTo)}
}

const commonKeys=["id","expectedRevision","at","decidedBy","reason","approvedByMJ","kind"] as const
function validCommand(c:unknown):c is ExperienceCommand{
  if(!isRecord(c)||!validId(c.id)||!safeNat(c.expectedRevision)||!validId(c.decidedBy)||
    !validId(c.reason)||!iso(c.at)||c.approvedByMJ!==true)return false
  if(c.kind==="award")return keys(c,[...commonKeys,"event","decidedXp"])&&validEvent(c.event)&&safeNat(c.decidedXp)
  if(c.kind==="correction")return keys(c,[...commonKeys,"targetId","deltaXp"])&&
    validId(c.targetId)&&Number.isSafeInteger(c.deltaXp)&&c.deltaXp!==0
  if(c.kind==="milestone")return keys(c,[...commonKeys,"level"])&&safeLevel(c.level)&&c.level>=21
  if(c.kind==="promotion")return keys(c,[...commonKeys,"targetLevel"])&&safeLevel(c.targetLevel)
  return false
}
function fingerprint(c:ExperienceCommand):string {
  const m=[c.kind,c.id,c.expectedRevision,c.at,c.decidedBy,c.reason,c.approvedByMJ]
  if(c.kind==="award")return JSON.stringify([...m,c.decidedXp,c.event.id,c.event.pattern,c.event.domain,c.event.difficulty,c.event.scope,c.event.approved])
  if(c.kind==="correction")return JSON.stringify([...m,c.targetId,c.deltaXp])
  return JSON.stringify([...m,c.kind==="milestone"?c.level:c.targetLevel])
}

/**
 * Journalisation PURE d'une décision du MJ, avec révision optimiste et ID idempotent.
 * Ne jamais remplacer cette méthode par M02.grantAward, qui crédite son montant suggéré.
 * Les corrections sont des entrées append-only ; les promotions sont des décisions
 * consignées, non des modifications de fiche.
 */
export function recordXpMjDecision(state:ExperienceLedger,raw:unknown):DecisionResponse{
  if(!validCommand(raw))return rejected(state,"INVALID_DECISION","Décision MJ incomplète, invalide ou non approuvée.")
  const fp=fingerprint(raw)
  const prior=state.entries.find(x=>x.command.id===raw.id)
  if(prior){
    if(prior.fingerprint!==fp)return rejected(state,"ID_COLLISION","Même ID avec un autre contenu.")
    return {status:"duplicate",state,entry:prior,view:inspectXpLedger(state),appliedToSheet:false}
  }
  if(raw.expectedRevision!==state.revision)return rejected(state,"STALE_REVISION","Révision attendue différente : relire le journal.")
  const view=inspectXpLedger(state)
  let suggested:number|undefined
  if(raw.kind==="award"){
    if(sourceRecorded(state,raw.event.id))return rejected(state,"SOURCE_DUPLICATE","Événement source déjà décidé ; utiliser une correction.")
    const preview=suggestXpFromM01(state,raw.event)
    if(preview.status!=="suggested")return rejected(state,"INVALID_SOURCE_EVENT","Événement incompatible avec M01.")
    suggested=preview.nativeSuggestedXp // Le montant MJ peut être différent, y compris zéro.
    if(!safeNat(view.xp+raw.decidedXp))return rejected(state,"XP_OVERFLOW","Total XP hors précision entière.")
  }
  if(raw.kind==="correction"){
    const target=state.entries.find(x=>x.command.kind==="award"&&x.command.id===raw.targetId)
    if(!target)return rejected(state,"UNKNOWN_AWARD","Correction sans attribution antérieure.")
    const total=awardRemaining(target,state.entries)+raw.deltaXp
    if(!safeNat(total)||!safeNat(view.xp+raw.deltaXp))return rejected(state,"INVALID_CORRECTION","Correction négative ou hors précision.")
  }
  if(raw.kind==="milestone"){
    if(view.milestones.includes(raw.level))return rejected(state,"MILESTONE_DUPLICATE","Palier déjà attesté.")
    if(raw.level>21&&!view.milestones.includes(raw.level-1))
      return rejected(state,"MILESTONE_ORDER","Attester les paliers exceptionnels dans l'ordre, comme M02.")
  }
  if(raw.kind==="promotion"){
    const p=previewXpProgression(state,raw.targetLevel)
    if(p.status!=="preview"||!p.maySubmitDecision)
      return rejected(state,"PROGRESSION_NOT_ELIGIBLE","Le niveau suivant exige le seuil M01 et les paliers nécessaires.")
  }
  // Snapshot autonome : une modification du formulaire après validation ne peut altérer le journal.
  const savedCommand:ExperienceCommand=raw.kind==="award"?{...raw,event:{...raw.event}}:{...raw}
  const entry:DecisionEntry={command:savedCommand,fingerprint:fp,...(suggested===undefined?{}:{nativeSuggestedXp:suggested})}
  const next:ExperienceLedger={...state,revision:state.revision+1,entries:[...state.entries,entry]}
  return {status:"recorded",state:next,entry,view:inspectXpLedger(next),appliedToSheet:false}
}
