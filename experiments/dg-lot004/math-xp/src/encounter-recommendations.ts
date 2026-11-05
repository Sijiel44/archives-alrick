/**
 * DG-LOT-004 / L004-B.R2 : comparateur XP non homologué et décisions collectives MJ.
 * ZÉRO écriture de fiche. Modèle A délègue le montant uniquement à experienceAward M01
 * via suggestXpFromM01 ; modèle B est une sensibilité expérimentale alternative,
 * jamais additionnée au modèle A, ni adoptée dans une règle ou une sauvegarde canonique.
 */
import {suggestXpFromM01,recordXpMjDecision,inspectXpLedger,previewXpProgression} from './xp-decision'
import type {ExperienceLedger,ExperienceCommand} from './xp-decision'
import type {ExperienceEvent,ExperienceDomain,AccomplishmentScope} from '../../../../quartz/components/scripts/atelier5d6-progression'

export const XP_ENCOUNTER_SCHEMA='cer.math.encounter-xp.provisional.v0' as const
export type SceneType='encounter'|'quest'|'accomplishment'
export type ActualDifficulty='facile'|'moderee'|'difficile'|'heroique'
export type ActorRole='pj'|'pnj'
export type SceneActor={instanceId:string;role:ActorRole;level:number;contributionNote?:string}
export type ThreatFact={instanceId:string;level:number;count:number;boss:boolean;dangerNote?:string}
export type AssistanceFact={level:'none'|'secondary'|'decisive';npcIds:readonly string[];reason:string}
export type XpEncounterInput={
  campaignId:string;runId:string;accomplishmentId:string;kind:SceneType;
  eventPattern:string;eventDomain:ExperienceDomain;scope:AccomplishmentScope;
  /** Saisi par le MJ, non fabriqué par la passerelle. M01 exige true pour majeur/légendaire. */
  eventApprovedByMJ:boolean;
  difficultyBeforeAssistance:ActualDifficulty;
  /** Facultatif : difficulté effectivement réalisée *déjà* estimée par le MJ. */
  realizedDifficulty?:ActualDifficulty;
  /** Indice M01 explicite du MJ, 1–12 ; prioritaire sur l'étiquette expérimentale. */
  explicitM01Index?:number;
  actors:readonly SceneActor[];
  selectedPjIds:readonly string[];
  threats:readonly ThreatFact[];
  assistance:AssistanceFact;
  /** Historique individuel, non remplacé par un historique unique de groupe. */
  ledgersByPj:Readonly<Record<string,ExperienceLedger>>;
}
export type ParticipantProposal={
  instanceId:string;level:number;contributionNote:string;
  modelA:{index:number;scope:AccomplishmentScope;nativeSuggestedXp:number;repeatedSource:boolean};
  modelB:{baselineIndex:number;coefficient:number;hypotheticalXp:number;scopeIncluded:false};
  xpToNextLevel:number|null;
}
export type XpEncounterPreview={
  status:'preview';schema:typeof XP_ENCOUNTER_SCHEMA;experimental:true;
  amountSource:'M01.experienceAward';canAutoApply:false;appliedToSheet:false;
  source:{campaignId:string;runId:string;accomplishmentId:string;eventId:string;kind:SceneType;eventPattern:string;eventDomain:ExperienceDomain;scope:AccomplishmentScope;eventApprovedByMJ:boolean};
  proposedIndex:number;indexOrigin:'explicit_mj'|'experimental_label_mapping';
  difficultyBeforeAssistance:ActualDifficulty;realizedDifficulty:ActualDifficulty;
  selectedPjIds:readonly string[];suggestions:readonly ParticipantProposal[];
  context:{threatLevels:readonly number[];threatCount:number;boss:boolean;highestThreatLevel:number|null;
    selectedPjLevels:readonly number[];npcLevels:readonly number[];decisiveAssistance:boolean;
    dangerNotes:readonly string[]};
  warnings:readonly string[];
}
export type XpEncounterRejection={status:'rejected'|'unavailable';schema:typeof XP_ENCOUNTER_SCHEMA;
  code:string;reason:string;canAutoApply:false;appliedToSheet:false}
export type XpEncounterResult=XpEncounterPreview|XpEncounterRejection
export type AllocationInput={
  mode:'common'|'individual';
  /** XP identiques à tous les PJ sélectionnés, sauf exceptions motivées. */
  commonXp?:number;overrides?:Readonly<Record<string,number>>;
  /** XP choisis séparément pour chaque PJ sélectionné. */
  individualXp?:Readonly<Record<string,number>>;
  decision:{id:string;at:string;decidedBy:string;reason:string;approvedByMJ:true}
}
export type DistributionResult=
 |{status:'recorded'|'duplicate';schema:typeof XP_ENCOUNTER_SCHEMA;appliedToSheet:false;
   nextLedgers:Readonly<Record<string,ExperienceLedger>>;
   receipts:readonly {pjId:string;decidedXp:number;decisionId:string;status:'recorded'|'duplicate'}[]}
 |{status:'rejected'|'unavailable';schema:typeof XP_ENCOUNTER_SCHEMA;code:string;reason:string;appliedToSheet:false}

const isObj=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v)
const onlyKeys=(v:Record<string,unknown>,keys:readonly string[])=>Object.keys(v).every(k=>keys.includes(k))
const validId=(v:unknown):v is string=>typeof v==='string'&&/^[A-Za-z0-9][A-Za-z0-9:._-]{0,39}$/.test(v)
const validText=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=150
const level=(v:unknown):v is number=>Number.isSafeInteger(v)&&Number(v)>=1&&Number(v)<=25
const nat=(v:unknown):v is number=>Number.isSafeInteger(v)&&Number(v)>=0
const difficulties:readonly ActualDifficulty[]=['facile','moderee','difficile','heroique']
const labelsIndex:Readonly<Record<ActualDifficulty,number>>={facile:3,moderee:6,difficile:9,heroique:12}
const factor:Readonly<Record<ActualDifficulty,number>>={facile:.75,moderee:1,difficile:1.25,heroique:1.5}
const domains:readonly string[]=['combat','artisanat','savoir','diplomatie','exploration','magie','secours','transmission']
const scopes:readonly string[]=['ordinaire','majeur','legendaire']
const refus=(code:string,reason:string,status:'rejected'|'unavailable'='rejected'):XpEncounterRejection=>
  ({status,schema:XP_ENCOUNTER_SCHEMA,code,reason,canAutoApply:false,appliedToSheet:false})

/**
 * Compare A (M01 natif, indice proposé explicitement) et B (coefficient illustratif).
 * Menace, niveaux de PJ, boss et nombre d'ennemis : éléments de diagnostic, jamais
 * un niveau hostile converti en indice M01 par une formule non homologuée.
 * L'aide PNJ "decisive", attestée par le MJ, abaisse d'un cran l'étiquette
 * expérimentale SAUF si le MJ a explicitement fixé difficulté réalisée ou indice.
 */
export function previewEncounterXp(raw:unknown):XpEncounterResult {
  if(!isObj(raw)||!onlyKeys(raw,['campaignId','runId','accomplishmentId','kind','eventPattern','eventDomain','scope',
    'eventApprovedByMJ','difficultyBeforeAssistance','realizedDifficulty','explicitM01Index',
    'actors','selectedPjIds','threats','assistance','ledgersByPj']))return refus('INVALID_REQUEST','Structure de scène XP invalide.')
  if(!validId(raw.campaignId)||!validId(raw.runId)||!validId(raw.accomplishmentId)||!validText(raw.eventPattern)||
    !['encounter','quest','accomplishment'].includes(raw.kind as string)||
    !domains.includes(raw.eventDomain as string)||!scopes.includes(raw.scope as string)||
    typeof raw.eventApprovedByMJ!=='boolean'||!difficulties.includes(raw.difficultyBeforeAssistance as ActualDifficulty)||
    (raw.realizedDifficulty!==undefined&&!difficulties.includes(raw.realizedDifficulty as ActualDifficulty))||
    (raw.explicitM01Index!==undefined&&(!level(raw.explicitM01Index)||raw.explicitM01Index>12)))
    return refus('INVALID_SCENE','Accomplissement, indice, portée ou difficulté invalide.')
  if(!Array.isArray(raw.actors)||!Array.isArray(raw.selectedPjIds)||!Array.isArray(raw.threats)||
    !isObj(raw.assistance)||!isObj(raw.ledgersByPj))return refus('INVALID_PARTICIPANTS','Participants, menaces, aide ou journaux invalides.')
  if(raw.actors.length>60||raw.threats.length>60||raw.selectedPjIds.length<1||raw.selectedPjIds.length>60)
    return refus('INVALID_PARTICIPANTS','Au moins un PJ sélectionné et au plus 60 entrées.')
  const actors=new Map<string,SceneActor>()
  for(const a of raw.actors){
    if(!isObj(a)||!onlyKeys(a,['instanceId','role','level','contributionNote'])||
      !validId(a.instanceId)||!['pj','pnj'].includes(a.role as string)||!level(a.level)||
      (a.contributionNote!==undefined&&typeof a.contributionNote!=='string')||
      (typeof a.contributionNote==='string'&&a.contributionNote.length>500))
      return refus('INVALID_ACTOR','Personnage ou niveau hors périmètre M01 1–25.')
    if(actors.has(a.instanceId))return refus('DUPLICATE_ACTOR','Instance participant dupliquée.')
    actors.set(a.instanceId,a as SceneActor)
  }
  const selected=raw.selectedPjIds as unknown[]
  if(selected.some(x=>!validId(x)||actors.get(x)?.role!=='pj')||new Set(selected).size!==selected.length)
    return refus('INVALID_PJ_SELECTION','Le MJ doit sélectionner des IDs uniques de PJ existants, jamais un PNJ.')
  const threats:ThreatFact[]=[];const threatIds=new Set<string>()
  for(const x of raw.threats){
    if(!isObj(x)||!onlyKeys(x,['instanceId','level','count','boss','dangerNote'])||
      !validId(x.instanceId)||!level(x.level)||!Number.isSafeInteger(x.count)||Number(x.count)<1||Number(x.count)>60||
      typeof x.boss!=='boolean'||(x.dangerNote!==undefined&&
      (typeof x.dangerNote!=='string'||x.dangerNote.length>300)))
      return refus('INVALID_THREAT','Menace hors N1–25, nombre ou danger invalide.', 'unavailable')
    if(threatIds.has(x.instanceId))return refus('DUPLICATE_THREAT','Même menace instanciée deux fois.')
    threatIds.add(x.instanceId);threats.push(x as ThreatFact)
  }
  const assist=raw.assistance
  if(!onlyKeys(assist,['level','npcIds','reason'])||!['none','secondary','decisive'].includes(assist.level as string)||
    !Array.isArray(assist.npcIds)||assist.npcIds.some((x:unknown)=>!validId(x)||actors.get(x)?.role!=='pnj')||
    new Set(assist.npcIds).size!==assist.npcIds.length||typeof assist.reason!=='string'||assist.reason.length>500)
    return refus('INVALID_ASSISTANCE','L’aide doit identifier les PNJ présents et le degré réel déclaré par le MJ.')
  if(assist.level==='decisive'&&(assist.npcIds.length===0||!assist.reason.trim()))
    return refus('INVALID_ASSISTANCE','Aide décisive sans PNJ attesté ni justification.')
  // Aucun montant M01 pour majeur/légendaire sans l'approbation MJ déjà donnée.
  if(raw.scope!=='ordinaire'&&raw.eventApprovedByMJ!==true)
    return refus('SCOPE_NOT_APPROVED','M01 requiert une approbation MJ pour majeur/légendaire.','unavailable')
  const eventId=JSON.stringify([raw.campaignId,raw.runId,raw.accomplishmentId])
  if(eventId.length>150)return refus('EVENT_ID_TOO_LONG','Identité de source trop longue pour le port M01.')
  const before=raw.difficultyBeforeAssistance as ActualDifficulty
  const hadDecisive=assist.level==='decisive'
  const bandIndex=difficulties.indexOf(before)
  const realized=(raw.realizedDifficulty??(hadDecisive?difficulties[Math.max(0,bandIndex-1)]:before)) as ActualDifficulty
  const index=(raw.explicitM01Index??labelsIndex[realized]) as number
  const indexOrigin=raw.explicitM01Index===undefined?'experimental_label_mapping':'explicit_mj'
  const sourceEvent:ExperienceEvent={id:eventId,pattern:raw.eventPattern as string,
    domain:raw.eventDomain as ExperienceDomain,difficulty:index,scope:raw.scope as AccomplishmentScope,
    approved:raw.eventApprovedByMJ as boolean}
  // Modèle B exclusivement : base native ordinaire indice 6 puis coefficient expérimental.
  const baseline:ExperienceEvent={...sourceEvent,difficulty:6,scope:'ordinaire',approved:false}
  const suggestions:ParticipantProposal[]=[]
  for(const id of selected as string[]){
    if(!Object.hasOwn(raw.ledgersByPj,id))return refus('LEDGER_MISSING','Journal PJ sélectionné manquant.')
    const state=raw.ledgersByPj[id] as ExperienceLedger
    const a=actors.get(id)!
    try {
      const view=inspectXpLedger(state)
      if(state.seed.characterId!==id||state.seed.campaignId!==raw.campaignId||view.level!==a.level)
        return refus('LEDGER_MISMATCH','Identité, campagne ou niveau PJ du journal non conforme.')
      const native=suggestXpFromM01(state,sourceEvent)
      const nativeBase=suggestXpFromM01(state,baseline)
      if(native.status!=='suggested'||nativeBase.status!=='suggested')return refus('NATIVE_M01_UNAVAILABLE','M01 n’a pas accepté l’événement.', 'unavailable')
      const hypotheticalXp=Math.round(nativeBase.nativeSuggestedXp*factor[realized])
      const progress=view.level===25?null:previewXpProgression(state,view.level+1)
      const toNext=progress?.status==='preview'?progress.missingXp:null
      suggestions.push({instanceId:id,level:a.level,contributionNote:a.contributionNote??'',
        modelA:{index,scope:raw.scope as AccomplishmentScope,nativeSuggestedXp:native.nativeSuggestedXp,repeatedSource:native.sourceAlreadyRecorded},
        modelB:{baselineIndex:6,coefficient:factor[realized],hypotheticalXp,scopeIncluded:false},
        xpToNextLevel:toNext})
    }catch {return refus('INVALID_LEDGER','Journal PJ invalide ou non lisible.')}
  }
  const selectedLevels=(selected as string[]).map(id=>actors.get(id)!.level)
  const warnings=[
    'Propositions expérientielles ; aucun niveau ennemi ne devient un indice M01 automatiquement.',
    'Modèle B = comparaison hypothétique distincte, jamais cumulée aux portées M01.',
    'Aucune attribution automatique, aucune division par le nombre de PJ ; PNJ exclus.'
  ]
  if(hadDecisive)warnings.push('Aide PNJ décisive attestée : étiquette candidate descend d’un cran sauf choix explicite MJ.')
  if(threats.some(x=>x.boss))warnings.push('Boss : la portée majeure/légendaire demande un choix MJ distinct ; pas de multiplicateur boss gratuit.')
  if(suggestions.some(x=>x.modelA.repeatedSource))warnings.push('Accomplissement source déjà consigné : aucun second crédit, même si la quête et le boss partagent le même ID.')
  return {status:'preview',schema:XP_ENCOUNTER_SCHEMA,experimental:true,amountSource:'M01.experienceAward',
    canAutoApply:false,appliedToSheet:false,
    source:{campaignId:raw.campaignId as string,runId:raw.runId as string,
      accomplishmentId:raw.accomplishmentId as string,eventId,kind:raw.kind as SceneType,
      eventPattern:raw.eventPattern as string,eventDomain:raw.eventDomain as ExperienceDomain,
      scope:raw.scope as AccomplishmentScope,eventApprovedByMJ:raw.eventApprovedByMJ as boolean},
    proposedIndex:index,indexOrigin,difficultyBeforeAssistance:before,realizedDifficulty:realized,
    selectedPjIds:[...selected] as string[],suggestions,
    context:{threatLevels:threats.map(x=>x.level),threatCount:threats.reduce((s,x)=>s+x.count,0),
      boss:threats.some(x=>x.boss),highestThreatLevel:threats.length?Math.max(...threats.map(x=>x.level)):null,
      selectedPjLevels:selectedLevels,npcLevels:[...actors.values()].filter(a=>a.role==='pnj').map(a=>a.level),
      decisiveAssistance:hadDecisive,dangerNotes:threats.map(x=>x.dangerNote??'').filter(Boolean)},
    warnings}
}

/**
 * Une seule action explicite du MJ peut produire un journal par PJ sélectionné,
 * sans jamais changer les fiches. Toute validation est faite avant de retourner
 * un nouvel ensemble de journaux : échec => aucune mise à jour proposée.
 */
export function recordEncounterXpChoice(scene:unknown,choice:unknown):DistributionResult {
  const preview=previewEncounterXp(scene)
  if(preview.status!=='preview')return preview
  if(!isObj(scene)||!isObj(choice)||!onlyKeys(choice,['mode','commonXp','overrides','individualXp','decision'])||
    !['common','individual'].includes(choice.mode as string)||!isObj(choice.decision))
    return refus('INVALID_ALLOCATION','Répartition XP invalide.')
  const d=choice.decision
  if(!onlyKeys(d,['id','at','decidedBy','reason','approvedByMJ'])||!validId(d.id)||!validText(d.at)||
    !validText(d.decidedBy)||!validText(d.reason)||d.approvedByMJ!==true)
    return refus('MJ_APPROVAL_REQUIRED','Décision MJ explicite et métadonnées obligatoires.')
  const wanted=new Map<string,number>();const ids=preview.selectedPjIds
  if(choice.mode==='common'){
    if(!nat(choice.commonXp)||choice.individualXp!==undefined||
      (choice.overrides!==undefined&&!isObj(choice.overrides)))return refus('INVALID_COMMON_XP','Montant commun entier naturel obligatoire.')
    const overrides=(choice.overrides??{}) as Record<string,unknown>
    if(Object.keys(overrides).some(x=>!ids.includes(x)||!nat(overrides[x])))
      return refus('INVALID_OVERRIDE','Exception individuelle non sélectionnée ou montant invalide.')
    for(const id of ids)wanted.set(id, overrides[id]===undefined?choice.commonXp as number:overrides[id] as number)
  }else{
    if(choice.commonXp!==undefined||choice.overrides!==undefined||!isObj(choice.individualXp)||
      Object.keys(choice.individualXp).length!==ids.length||
      ids.some(id=>!Object.hasOwn(choice.individualXp as object,id)||!nat((choice.individualXp as Record<string,unknown>)[id])))
      return refus('INVALID_INDIVIDUAL_XP','Tous les PJ sélectionnés doivent avoir un montant individuel explicite.')
    for(const id of ids)wanted.set(id,(choice.individualXp as Record<string,number>)[id])
  }
  const state=scene.ledgersByPj as Record<string,ExperienceLedger>
  const next:Record<string,ExperienceLedger>={...state}
  const receipts:{pjId:string;decidedXp:number;decisionId:string;status:'recorded'|'duplicate'}[]=[]
  for(const id of ids){
    const decisionId=JSON.stringify([d.id,preview.source.eventId,id])
    if(decisionId.length>150)return refus('DECISION_ID_TOO_LONG','Identifiant de décision trop long.')
    const ledger=state[id]
    const previous=ledger.entries.find(entry=>entry.command.id===decisionId)
    const event:ExperienceEvent={id:preview.source.eventId,pattern:preview.source.eventPattern,
      domain:preview.source.eventDomain,difficulty:preview.proposedIndex,scope:preview.source.scope,
      approved:preview.source.eventApprovedByMJ}
    const command:ExperienceCommand={kind:'award',id:decisionId,
      expectedRevision:previous?.command.expectedRevision??ledger.revision,
      at:d.at as string,decidedBy:d.decidedBy as string,reason:d.reason as string,
      approvedByMJ:true,event,decidedXp:wanted.get(id)!}
    const result=recordXpMjDecision(ledger,command)
    if(result.status==='rejected')return refus(result.code,'Répartition rejetée pour PJ '+id+': '+result.reason)
    next[id]=result.state
    receipts.push({pjId:id,decidedXp:wanted.get(id)!,decisionId,status:result.status})
  }
  return {status:receipts.every(x=>x.status==='duplicate')?'duplicate':'recorded',
    schema:XP_ENCOUNTER_SCHEMA,appliedToSheet:false,nextLedgers:next,receipts}
}