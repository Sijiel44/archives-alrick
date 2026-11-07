/** DATA-MODEL-001 prototype-only structural test helpers. NOT a JSON Schema engine.
 * Separate from M01-M05, catalog, STUDIO and any production import.
 */
export function inspectFixtureSet(schema,fixtureSet){
 const issues=[],records=fixtureSet?.records;
 const note=(code,path,detail)=>issues.push({code,path,detail});
 if(schema?.$schema!=='https://json-schema.org/draft/2020-12/schema')note('SCHEMA_DIALECT','schema.$schema','Draft 2020-12 requis');
 if(schema?.properties?.schema?.const!=='cer.p1.data-model.record.proposal.v0')note('RECORD_KIND','schema.properties.schema','Enveloppe de proposition incorrecte');
 if(!Array.isArray(records))return {ok:false,issues:[...issues,{code:'NO_RECORDS',path:'records'}],stats:null};
 const byId=new Map(),kinds=new Set(),levels=[];
 for(const [i,r] of records.entries()){
  const where='records['+i+']';
  if(!r||typeof r!=='object'||Array.isArray(r)){note('BAD_RECORD',where,'Objet requis');continue;}
  const allowed=new Set(Object.keys(schema.properties??{}));
  for(const key of Object.keys(r))if(!allowed.has(key))note('UNKNOWN_ROOT',where+'.'+key,'Champ racine non prévu');
  for(const field of schema.required??[])if(!Object.hasOwn(r,field))note('MISSING',where+'.'+field,'Champ absent');
  if(r.schema!==schema.properties.schema.const)note('WRONG_SCHEMA',where+'.schema','Version candidate divergente');
  if(typeof r.recordId!=='string'||!/^[a-z][a-z0-9_-]{1,25}:[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/.test(r.recordId))
   note('BAD_ID',where+'.recordId','Identifiant logique invalide');
  if(typeof r.recordVersion!=='string'||!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(r.recordVersion))
   note('BAD_VERSION',where+'.recordVersion','SemVer enveloppe requis');
  if(byId.has(r.recordId))note('DUPLICATE_ID',where+'.recordId','ID déjà présent');
  byId.set(r.recordId,r);kinds.add(r.entityType);
  if(!['definition','variant','instance'].includes(r.nodeType))note('BAD_NODE',where+'.nodeType','Type inconnu');
  if(!['pj','creature','npc','item','capability','spell','ritual','scene'].includes(r.entityType))note('BAD_ENTITY',where+'.entityType','Famille inconnue');
  if(r.nodeType==='definition'&&(r.state!==undefined||r.definitionRef!==undefined||r.variantChanges!==undefined))
   note('BAD_DEFINITION',where,'Une définition ne porte pas d’état');
  if(r.nodeType==='variant'&&(!r.baseDefinitionRef||!r.variantChanges||r.state!==undefined||r.variantChanges.mechanicPolicy!=='native-recalculation-required'))
   note('BAD_VARIANT',where,'Variante non destructive requise');
  if(r.nodeType==='instance'&&(!r.definitionRef||!r.campaignId||!r.state||!Number.isSafeInteger(r.state.revision)||r.state.revision<0))
   note('BAD_INSTANCE',where,'Instance, campagne et état courant requis');
  if(!r.provenance||typeof r.provenance.sourceId!=='string'||r.provenance.sourceId.length===0||
     !['string','number'].includes(typeof r.provenance.sourceVersion))
   note('BAD_PROVENANCE',where+'.provenance','Source/version native exigées');
  if(r.continuity?.referenceStatus!=='proposal'||r.continuity?.playedStatus!=='not-played'||
     r.continuity?.publicationStatus!=='unpublished'||r.continuity?.scope!=='sandbox-fixture')
   note('NOT_FICTIVE',where+'.continuity','Fixture jamais canon ni jouée ni publiée');
  if(!r.mechanics||!['none','native-reference','pending'].includes(r.mechanics.mode)||
     r.mechanics.mode==='native-reference'&&!['M01','M02','M03','M04','M05','Grimoire','Ritual','INDEX'].includes(r.mechanics.engine))
   note('MOTOR_INVENTED',where+'.mechanics','Référence au moteur natif seulement');
  if(r.mechanics?.mode==='native-reference'&&(typeof r.mechanics.nativeId!=='string'||r.mechanics.authority!=='native-only'))
   note('MECHANIC_AUTHORITY',where+'.mechanics','Port natif requis');
  if(!r.narrative||typeof r.narrative.title!=='string'||r.narrative.title.length<1)
   note('MISSING_TITLE',where+'.narrative','Titre requis');
  if(!r.privacy||!Array.isArray(r.privacy.publicFields)||
     r.privacy.publicFields.some(f=>!['narrative.title','narrative.publicDescription','media.public'].includes(f))||
     r.privacy.playerProjection!=='explicit-approval-only')
   note('PUBLIC_LEAK',where+'.privacy','Liste blanche stricte');
  if(!r.legacy||typeof r.legacy.unknownFields!=='object'||!Array.isArray(r.legacy.fieldDecisions))
   note('LOSSY_LEGACY',where+'.legacy','Inconnus et décision par champ requis');
  for(const f of r.legacy?.fieldDecisions??[])
   if(!['reused','adaptable','obsolete','unknown'].includes(f.decision))
    note('MAP_CLASS',where+'.legacy.fieldDecisions','Statut d’étude inconnu');
  for(const m of r.media??[]){
   if(!['cleared','restricted','unknown'].includes(m.rights)||!m.alt)
    note('MEDIA_RIGHTS',where+'.media','Alt et droits obligatoires');
   if(m.rights!=='cleared'&&m.audience==='public-after-approval')
    note('MEDIA_PUBLIC_UNVERIFIED',where+'.media','Image non homologuée interdite en sortie joueur');
  }
  if(r.entityType==='pj'&&r.nodeType==='instance')levels.push(r.state?.current?.level);
  if(/approved:true|autoApply:true|xpGrant|resolveSpellCast/.test(JSON.stringify(r.mechanics??{})))
   note('FORBIDDEN_EFFECT',where+'.mechanics','Ne pas forger d’autorisation');
 }
 for(const [id,r] of byId){
  if(r.nodeType==='instance'&&!byId.has(r.definitionRef))note('MISSING_DEFINITION',id,r.definitionRef);
  if(r.nodeType==='variant'&&!byId.has(r.baseDefinitionRef))note('MISSING_BASE',id,r.baseDefinitionRef);
  for(const l of r.links??[]){
   if(!byId.has(l.targetId)&&!/^ref:/.test(l.targetId))note('DANGLING_LINK',id+'.links',l.targetId);
  }
 }
 for(const level of [1,10,25])if(!levels.includes(level))note('MISSING_LEVEL','pj',String(level));
 for(const kind of ['pj','creature','npc','item','capability','spell','ritual','scene'])
  if(!kinds.has(kind))note('MISSING_FAMILY','entityType',kind);
 return {ok:issues.length===0,issues,stats:{count:records.length,recordTypes:[...kinds].sort(),pjLevels:[...levels].sort((a,b)=>a-b)}};
}
export function contrastRatio(a,b){
 const l=h=>{if(typeof h!=='string'||!/^#[0-9a-f]{6}$/i.test(h))throw Error('Hex CSS invalide');
  const vals=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255)
   .map(n=>n<=0.04045?n/12.92:Math.pow((n+0.055)/1.055,2.4));
  return vals[0]*0.2126+vals[1]*0.7152+vals[2]*0.0722;
 };
 const x=l(a),y=l(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
