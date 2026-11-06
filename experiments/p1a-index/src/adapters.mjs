import {DATA_MODEL_SCHEMA,validateModelRecord,clonePrivateJSON} from './data-model.mjs';
/** No Markdown parser: callers explicitly attest extracted frontmatter; original stays private. */
export function proposeHistoricalReference(input){
 let x;try{x=clonePrivateJSON(input);}catch{return {ok:false,code:'INVALID_SOURCE_INPUT',issues:[{path:'input',code:'INVALID_SOURCE_INPUT'}]};}
 const f=x.frontmatter??{},kind=x.recordKind;
 if(!['pj','creature','npc','item','ability','spell-ref','ritual-ref','scene'].includes(kind))return {ok:false,code:'INVALID_KIND',issues:[{path:'recordKind',code:'INVALID_KIND'}]};
 const record={
  schema:DATA_MODEL_SCHEMA,recordId:x.recordId,version:'0.1.0',revision:0,recordKind:kind,
  identity:{definitionId:x.definitionId,definitionVersion:'0.1.0',...(x.instanceId?{instanceId:x.instanceId,campaignId:x.campaignId}:{})},
  provenance:{origin:'historical-reference',sourceSchema:'quartz.markdown.frontmatter',sourceId:f.code??x.path,sourcePath:x.path,sourceCommit:x.commit,sourceBlob:x.blob},
  state:{lifecycle:'in-review',layer:'proposal',attestation:{status:'unverified',evidenceRefs:[]}},
  mechanics:{status:'not-evaluated',validationStatus:'unvalidated'},
  narrative:{name:f.title??'Titre non vérifié',summary:f.description??''},
  privacy:{visibility:'mj-private',notes:'Conversion proposée ; canon_statut historique non transposé.',originalSource:{format:'markdown',text:x.originalMarkdown,frontmatter:f}},
  media:[],data:{historicalCategory:f.categorie??null},
 };
 const v=validateModelRecord(record);
 return v.ok?{...v,adaptationStatus:'proposed-only',fieldClassification:{
  reused:['title','description','code','source_brute','canon_statut','etat_editorial'],
  adaptable:['categorie','visibilite','ancre_documentaire','tags'],
  obsolete:['publish comme bouton de publication automatique'],
  unknown:['niveau M01','attribution d’instance','effets M03','droit média','preuves de jeu indépendantes']
 }}:v;
}
/** Retain original JSON verbatim as private data. Never infer mechanical validity. */
export function proposeNativeReference(input){
 let x;try{x=clonePrivateJSON(input);}catch{return {ok:false,code:'INVALID_SOURCE_INPUT',issues:[{path:'input',code:'INVALID_SOURCE_INPUT'}]};}
 const record={schema:DATA_MODEL_SCHEMA,recordKind:x.recordKind,recordId:x.recordId,version:'0.1.0',revision:0,
  identity:{definitionId:x.definitionId,definitionVersion:'0.1.0',...(x.instanceId?{instanceId:x.instanceId,campaignId:x.campaignId}:{})},
  provenance:{origin:'native-reference',sourceSchema:x.sourceSchema,sourceId:x.sourceId,sourceVersion:x.sourceVersion,sourceCommit:x.sourceCommit,sourceBlob:x.sourceBlob},
  state:{lifecycle:'in-review',layer:'proposal',attestation:{status:'unverified',evidenceRefs:[]}},
  mechanics:{status:'native-reference',validationStatus:'unvalidated',nativeRef:{module:x.nativeModule,sourceBlob:x.sourceBlob}},
  narrative:{name:x.name,summary:x.summary??''},
  media:[],data:{},privacy:{visibility:'mj-private',notes:'Règles non résolues par INDEX',nativeOriginal:x.originalJson}};
 const r=validateModelRecord(record);
 return r.ok?{...r,adaptationStatus:'reference-only'}:r;
}
