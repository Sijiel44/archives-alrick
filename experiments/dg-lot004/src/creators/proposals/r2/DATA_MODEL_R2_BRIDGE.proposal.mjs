/** 21 ATELIERS / P1 R2 — read-only candidate bridge from #102 to INDEX #105.
 * No runtime rule execution, no canonisation, no native migration and no actor creation.
 * Preserves the entire #102 record (including unknowns, private notes and media)
 * in INDEX's private payload. Provisional until 11 INDEX + 04 ARCHIVES arbitrate.
 */
const kindMap=Object.freeze({pj:'pj',creature:'creature',npc:'npc',item:'item',
 capability:'ability',spell:'spell-ref',ritual:'ritual-ref',scene:'scene'});
const clone=x=>JSON.parse(JSON.stringify(x));
const fail=(code,detail)=>{const e=new Error(detail??code);e.code=code;throw e};
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
function inspectSourceRecord(x,byId){
 if(!record(x)||x.schema!=='cer.p1.data-model.record.proposal.v0'||!kindMap[x.entityType])
  fail('SOURCE_FORMAT','Enveloppe ATELIERS #102 inconnue');
 if(!['definition','variant','instance'].includes(x.nodeType))fail('SOURCE_NODE','Type de nœud incompatible');
 if(x.nodeType==='instance'&&!byId.has(x.definitionRef))
  fail('MISSING_DEFINITION','Définition ou variante de l’instance introuvable');
 if(x.nodeType==='variant'&&!byId.has(x.baseDefinitionRef))
  fail('MISSING_VARIANT_BASE','Définition de variante absente');
}
export function bridgeR2AteliersToIndex(records,{validateRecord,validateDataset}={}){
 if(!Array.isArray(records)||typeof validateRecord!=='function'||typeof validateDataset!=='function')
  fail('PORT_MISSING','Lecteurs et validateurs INDEX #105 requis');
 if(records.length>100)fail('TOO_MANY_RECORDS','INDEX limite le jeu de fiches à 100');
 const byId=new Map(records.map(x=>[x.recordId,x]));
 if(byId.size!==records.length)fail('ID_COLLISION','IDs du modèle #102 dupliqués');
 const converted=records.map(x=>{
  inspectSourceRecord(x,byId);
  let definition=x.recordId,base=x.nodeType==='variant'?byId.get(x.baseDefinitionRef):null;
  if(x.nodeType==='variant')definition=x.baseDefinitionRef;
  if(x.nodeType==='instance'){
   const referred=byId.get(x.definitionRef);
   definition=referred.nodeType==='variant'?referred.baseDefinitionRef:x.definitionRef;
  }
  const definitionSource=byId.get(definition);
  if(!definitionSource||definitionSource.nodeType!=='definition')fail('BAD_DEFINITION','Source de définition non pure');
  const identity={definitionId:definition,definitionVersion:definitionSource.recordVersion};
  if(x.nodeType==='variant')identity.variantId=x.recordId;
  if(x.nodeType==='instance'){identity.instanceId=x.recordId;identity.campaignId=x.campaignId;}
  // Never infer native approval from illustrative mechanics or lore status.
  const convertedRecord={
   schema:'cer.index.data-model.p1a.proposal.v0',recordKind:kindMap[x.entityType],
   recordId:x.recordId,version:x.recordVersion,revision:x.nodeType==='instance'?x.state.revision:0,
   identity,
   provenance:{origin:'synthetic',sourceSchema:x.schema,sourceId:x.recordId,
    sourceVersion:x.recordVersion,r2PreviousProvenance:clone(x.provenance)},
   state:{lifecycle:'draft',layer:'proposal',attestation:{status:'unverified',evidenceRefs:[]},
    r2EditorialTruth:clone(x.continuity)},
   mechanics:{status:x.mechanics.mode==='pending'?'blocked':'not-evaluated',
    validationStatus:'unvalidated',r2LegacyReference:clone(x.mechanics)},
   narrative:{name:x.narrative.title,summary:x.narrative.publicDescription},
   privacy:{visibility:'mj-private',notes:'Source P1 fictive, privée, non validée.',
    originalAteliersRecord:clone(x)}, // unknowns, media and GM secrets preserved here
   media:(x.media??[]).map(m=>({assetId:m.mediaId,rights:'pending',visibility:'mj-private',
    alt:m.alt,credit:m.credit??null,previousRights:m.rights})),
   data:{r2NodeType:x.nodeType,r2OriginalDefinitionRef:x.definitionRef??x.baseDefinitionRef??null,
    r2SourceRecordId:x.recordId}
  };
  if(x.entityType==='pj'&&x.nodeType==='instance')convertedRecord.data.level=x.state.current.level;
  if(x.nodeType==='variant')convertedRecord.data.variantOf=x.baseDefinitionRef;
  if(x.entityType==='scene'){
   convertedRecord.data.participants=(x.links??[]).filter(y=>y.relation==='participant').map(l=>{
    const actor=byId.get(l.targetId);
    if(!actor||actor.nodeType!=='instance'||!['pj','npc','creature'].includes(actor.entityType)||
       actor.campaignId!==x.campaignId)fail('INVALID_PARTICIPANT','Participant sans instance de même campagne');
    return {recordId:actor.recordId,instanceId:actor.recordId,
     role:actor.entityType==='npc'?'pnj':actor.entityType};
   });
  }
  const checked=validateRecord(convertedRecord);
  if(checked?.ok!==true)fail('INDEX_REJECTED',JSON.stringify(checked?.issues??checked?.code));
  return convertedRecord;
 });
 const checked=validateDataset(converted);
 if(checked?.ok!==true)fail('INDEX_DATASET_REJECTED',JSON.stringify(checked?.issues??checked?.code));
 return {status:'proposal-only',records:converted,sourceRecords:records.length,executable:false};
}
export function recoverR2Originals(indexRecords,{validateDataset}={}){
 if(typeof validateDataset!=='function'||validateDataset(indexRecords)?.ok!==true)
  fail('INDEX_DATASET_REJECTED','Jeu INDEX non validé');
 const originals=indexRecords.map(x=>{
  const original=x?.privacy?.originalAteliersRecord;
  if(!record(original)||original.recordId!==x.recordId||
     original.schema!=='cer.p1.data-model.record.proposal.v0')
   fail('MISSING_ORIGINAL','Original ATELIERS non attesté dans le colis privé');
  return clone(original);
 });
 return originals;
}
/** ARCHIVES #104 supports a private creatorDrafts collection but currently has no
 * transactional addCreatorDraft event. This is an initial-campaign TEST PROJECTION
 * ONLY. A product importer must wait for a dedicated, versioned ARCHIVES command.
 */
export function seedR2ProposalOnInitialCampaign(campaign,indexRecords,{assertCampaign}={}){
 if(typeof assertCampaign!=='function'||!record(campaign)||campaign.revision!==1||
    campaign.creatorDrafts?.length||campaign.characters?.length||campaign.scenes?.length)
  fail('ARCHIVES_NOT_EMPTY','Injection uniquement au premier état de fixture vierge');
 const next=clone(campaign);
 next.creatorDrafts=indexRecords.map(x=>({kind:'index-proposal-reference',
  recordId:x.recordId,version:x.version,privateIndexRecord:clone(x)}));
 next.extensions={...next.extensions,p1R2:{schema:'cer.ateliers.r2-fixtures-only.v0',
  noPublication:true,sourceSchemas:['cer.p1.data-model.record.proposal.v0',
   'cer.index.data-model.p1a.proposal.v0']}};
 assertCampaign(next);
 return next;
}
export function recoverR2FromArchiveCampaign(campaign,{assertCampaign,validateDataset}={}){
 if(typeof assertCampaign!=='function'||typeof validateDataset!=='function')fail('PORT_MISSING');
 assertCampaign(campaign);
 if(campaign.extensions?.p1R2?.schema!=='cer.ateliers.r2-fixtures-only.v0')
  fail('UNKNOWN_ARCHIVE','Enveloppe de fixture R2 absente');
 const records=campaign.creatorDrafts.map(x=>x.privateIndexRecord);
 return recoverR2Originals(records,{validateDataset});
}
/** Privacy tripwire: deliberate public whitelist, *never* stringify a saved campaign. */
export function previewR2PlayerLabel(indexRecord){
 return {kind:'cer.ateliers.p1r2.public-preview.proposal.v0',
  label:indexRecord.narrative?.name??'',description:indexRecord.narrative?.summary??'',
  requiresExplicitSelection:true,executable:false};
}
