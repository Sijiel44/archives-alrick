import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
 R2_PROFILE, ATELIERS_INPUT_SCHEMA,ARCH_STORAGE_CAMPAIGN_SCHEMA,
 adaptAteliers102,recoverAteliers102,validateR2Record,validateR2Dataset,
 makeArchStorageCandidate,recoverArchStorageCandidate,exportR2Private,importR2Private,
 previewCandidateViaNative,selectedPublicCandidate
} from '../src/model-r2.mjs';
import {validateModelDataset,clonePrivateJSON} from '../../src/data-model.mjs';
import {previewNativeLevel,previewNativeCombat} from '../../src/core-ports.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const fixture=JSON.parse(readFileSync(resolve(here,'../fixtures/R2_SYNTHETIC_CHAIN.json'),'utf8'));
const rows=fixture.records;
const originals=fixture.originals;
const copy=x=>JSON.parse(JSON.stringify(x));
const row=id=>rows.find(x=>x.recordId===id);
const bad=(v,code,path)=>{assert.equal(v.ok,false,JSON.stringify(v));assert.equal(v.code,code);if(path)assert.ok(v.issues.some(x=>x.path===path),JSON.stringify(v.issues));};

test('R2 porte le schéma unique #105 (pas un second standard)',()=>{
 assert.equal(rows.length,15);assert.equal(fixture.profile,R2_PROFILE);
 assert.ok(rows.every(x=>x.schema==='cer.index.data-model.p1a.proposal.v0'));
 assert.equal(ATELIERS_INPUT_SCHEMA,'cer.p1.data-model.record.proposal.v0');
});
test('adapteur conservateur des 15 fiches #102-shaped fictives',()=>{
 for(let i=0;i<originals.length;i++){
  const result=adaptAteliers102(originals[i]);assert.equal(result.ok,true,JSON.stringify(result.issues));
  if(originals[i].recordId==='inst:scene:pont-fictif'){
   const enriched=copy(rows[i]);enriched.privacy.notes=result.value.privacy.notes;enriched.data.participants=[];
   assert.equal(JSON.stringify(result.value),JSON.stringify(enriched));
  }else assert.equal(JSON.stringify(result.value),JSON.stringify(rows[i]));
 }
});
test('rétablissement de chaque source #102-shaped sans perte d’inconnus',()=>{
 originals.forEach((v,i)=>{const r=recoverAteliers102(rows[i]);assert.equal(r.ok,true);assert.equal(JSON.stringify(r.value),JSON.stringify(v));});
});
test('identités source/version/rôle conservées',()=>{
 for(const [i,x] of rows.entries()){
  assert.equal(x.recordId,originals[i].recordId);
  assert.equal(x.version,originals[i].recordVersion);
  assert.equal(x.provenance.sourceId,originals[i].provenance.sourceId);
  assert.equal(x.continuity.publicationStatus,originals[i].continuity.publicationStatus);
  assert.equal(x.extensions.sourceNodeType,originals[i].nodeType);
 }
});
test('source version et champs inconnus restent privés',()=>{
 for(const x of rows){assert.equal(x.privacy.ateliersOriginal.legacy.unknownFields.inventedFuture.foo,'preserved');
  assert.equal(x.privacy.ateliersOriginal.extensions.unrecognizedProvider.marker,'unknown-kept');}
});
test('rôles définition→instance→variante sont séparés',()=>{
 assert.equal(row('def:creature:veilleur-fictif').nodeType,'definition');
 assert.equal(row('inst:creature:veilleur-1').identity.definitionId,'def:creature:veilleur-fictif');
 assert.equal(row('var:creature:veilleur-argente').data.variantOf,'def:creature:veilleur-fictif');
 assert.equal(row('var:creature:veilleur-argente').identity.instanceId,undefined);
});
test('PJ N1/10/25 et scène à cinq participants',()=>{
 assert.deepEqual(rows.filter(x=>x.recordKind==='pj'&&x.nodeType==='instance').map(x=>x.data.level),[1,10,25]);
 assert.equal(row('inst:scene:pont-fictif').data.participants.length,5);
});
test('PNJ narratif sans niveau automatique, flûte sans malus',()=>{
 assert.equal(row('inst:npc:archiviste-1').data.level,undefined);
 assert.equal(row('def:item:flute-fictive').mechanics.status,'blocked');
 assert.equal(row('def:item:flute-fictive').data.damageBonus,undefined);
});
test('port moteur natif #102 représenté uniquement comme bloqué tant que non épinglé',()=>{
 for(const x of rows){if(x.privacy.ateliersOriginal.mechanics.mode==='native-reference')
   assert.equal(x.mechanics.status,'blocked');assert.equal(x.mechanics.validationStatus,'unvalidated');}
});
test('une instance avec ID `:` natif est acceptée sans alias',()=>{
 const x=copy(row('inst:pj:temoin-n1'));x.identity.instanceId='pj:l004-hero-fiction';
 assert.equal(validateR2Record(x).ok,true);assert.equal(x.identity.instanceId,'pj:l004-hero-fiction');
});
test('document sans nodeType explicite bloqué',()=>{const x=copy(rows[0]);delete x.nodeType;bad(validateR2Record(x),'INVALID_NODE_TYPE','nodeType');});
test('definition possédant instanceId bloquée',()=>{const x=copy(rows[0]);x.identity.instanceId='pj:fake';x.identity.campaignId='camp:fiction';bad(validateR2Record(x),'DEFINITION_HAS_STATE','identity');});
test('instance sans campagne bloquée',()=>{const x=copy(row('inst:pj:temoin-n1'));delete x.identity.campaignId;bad(validateR2Record(x),'MISSING_CAMPAIGN','identity.campaignId');});
test('instance mal classifiée bloque identité',()=>{const x=copy(rows[0]);x.nodeType='instance';bad(validateR2Record(x),'INSTANCE_ID_REQUIRED','identity.instanceId');});
test('variante sans base explicite bloquée',()=>{const x=copy(row('var:creature:veilleur-argente'));delete x.data.variantOf;bad(validateR2Record(x),'VARIANT_BASE_REQUIRED','data.variantOf');});
test('variante sans sa définition du dataset bloquée',()=>{
 const arr=copy(rows).filter(r=>r.recordId!=='def:creature:veilleur-fictif');
 assert.equal(validateR2Dataset(arr).ok,false);
});
test('référence de définition de mauvaise famille bloquée',()=>{
 const arr=copy(rows);const x=arr.find(r=>r.recordId==='inst:npc:archiviste-1');x.identity.definitionId='def:item:flute-fictive';
 const r=validateR2Dataset(arr);bad(r,'DEFINITION_KIND_MISMATCH');
});
test('doublon d’instance dans une campagne bloqué',()=>{
 const arr=copy(rows);const x=arr.find(r=>r.recordId==='inst:pj:temoin-n10');x.identity.instanceId='inst:pj:temoin-n1';
 const r=validateR2Dataset(arr);bad(r,'DUPLICATE_INSTANCE');
});
test('doublon variante de même définition bloqué',()=>{
 const arr=copy(rows);const variant=copy(row('var:creature:veilleur-argente'));variant.recordId='var:creature:autre';arr.push(variant);
 bad(validateR2Dataset(arr),'DUPLICATE_VARIANT');
});
test('participant inexistant bloqué',()=>{
 const arr=copy(rows);arr.find(r=>r.recordKind==='scene'&&r.nodeType==='instance').data.participants[0].instanceId='pj:intrus';
 bad(validateR2Dataset(arr),'UNRESOLVED_PARTICIPANT');
});
test('participant PNJ déguisé en PJ bloqué',()=>{
 const arr=copy(rows);arr.find(r=>r.recordKind==='scene'&&r.nodeType==='instance').data.participants[4].role='pj';
 bad(validateR2Dataset(arr),'UNRESOLVED_PARTICIPANT');
});
test('statuts canon/joué/public indépendants avec preuve externe requise',()=>{
 for(const [key,value,ev] of [['referenceStatus','canon','canonEvidenceRef'],['playedStatus','played','playedEvidenceRef'],['publicationStatus','published','publicationEvidenceRef']]){
  const x=copy(rows[0]);x.continuity.scope='universe';x.continuity[key]=value;
  bad(validateR2Record(x),'EXTERNAL_EVIDENCE_REQUIRED',`continuity.${ev}`);
 }
});
test('fixture ne s’auto-homologue jamais',()=>{
 const x=copy(rows[0]);x.continuity.publicationStatus='published';x.continuity.publicationEvidenceRef='ref:publication';
 bad(validateR2Record(x),'FIXTURE_CANNOT_PROMOTE','continuity');
});
test('couche R1 dérivée ne doit jamais masquer le statut joué',()=>{
 const x=copy(rows[0]);x.state.layer='played';x.state.attestation={status:'externally-attested',evidenceRefs:['ref:external-only']};bad(validateR2Record(x),'LEGACY_LAYER_MISMATCH','state.layer');
});
test('aucun `approved:true` dans la zone mécanique',()=>{
 const x=copy(rows[0]);x.mechanics.approved=true;bad(validateR2Record(x),'AUTHORITY_FORBIDDEN');
});
test('une source historique native sans SHA blob est refusée, sans faux SHA',()=>{
 const x=copy(originals[0]);x.provenance.originKind='native';x.provenance.sourceCommit='1'.repeat(40);
 bad(adaptAteliers102(x),'SOURCE_BLOB_REQUIRED','provenance.sourceBlob');
});
test('un format #102 inconnu refusé',()=>{const x=copy(originals[0]);x.schema='une-autre-version';bad(adaptAteliers102(x),'ATELIERS_SCHEMA_MISMATCH','schema');});
test('les droits inconnus ne sont pas élevés au rang publics',()=>{
 const x=rows[0];assert.equal(x.media[0].rights,'pending');assert.equal(x.media[0].visibility,'mj-private');
});
test('un média candidat public sans droits confirmés est refusé',()=>{
 const x=copy(rows[0]);x.media[0].visibility='public-candidate';bad(validateR2Record(x),'MEDIA_RIGHTS_REQUIRED','media');
});
test('un DTO candidat joueur n’inclut ni canaris, ni original, ni provenance',()=>{
 const x=rows[0];const r=selectedPublicCandidate(x,{selected:true});assert.equal(r.ok,true);
 const s=JSON.stringify(r);for(const secret of ['NE_JAMAIS_PARTAGER','ateliersOriginal','unknownJson','legacy','sourceCommit','PRIVATE_CANARY'])assert.ok(!s.includes(secret),secret);
});
test('sélection explicite obligatoire avant toute projection candidate',()=>bad(selectedPublicCandidate(rows[0]),'EXPLICIT_SELECTION_REQUIRED','selected'));
test('aucune méthode de projection réelle sur origine joueur',()=>{
 const r=selectedPublicCandidate(rows[0],{selected:true});assert.equal(r.requiresStudioWhitelist,true);assert.equal(r.executable,false);
});
test('aller-retour privé R2 conserve tous les champs sources et les IDs',()=>{
 const out=exportR2Private(rows);assert.equal(out.ok,true,JSON.stringify(out.issues));
 const inp=importR2Private(out.json);assert.equal(inp.ok,true,JSON.stringify(inp.issues));
 assert.equal(JSON.stringify(inp.value),JSON.stringify(rows));
});
test('un export R2 modifié échoue par validation sans transaction',()=>{
 const out=exportR2Private(rows);const pkg=JSON.parse(out.json);pkg.records[0].continuity.referenceStatus='canon';
 const ret=importR2Private(JSON.stringify(pkg));assert.equal(ret.ok,false);
});
test('projection P1-ARCH STORAGE ne persiste pas et conserve le dataset complet',()=>{
 const p=makeArchStorageCandidate(rows);assert.equal(p.ok,true,JSON.stringify(p.issues));
 assert.equal(p.persisted,false);assert.equal(p.requiresExplicitCommit,true);
 assert.equal(p.campaign.schema,ARCH_STORAGE_CAMPAIGN_SCHEMA);
 assert.equal(p.campaign.characters.length,3);assert.equal(p.campaign.instances.length,1);
 assert.equal(p.campaign.scenes.length,1);assert.equal(p.campaign.privateNotes.length,1);
 assert.equal(p.campaign.scenes[0].participantIds.length,5);
 assert.equal(p.campaign.extensions.indexP1R2.records.length,15);
 const recovered=recoverArchStorageCandidate(p.campaign);
 assert.equal(recovered.ok,true,JSON.stringify(recovered.issues));
 assert.equal(JSON.stringify(recovered.value),JSON.stringify(rows));
});
test('le pont stockage conserve provenance et extension future',()=>{
 const p=makeArchStorageCandidate(rows);const r=recoverArchStorageCandidate(p.campaign);
 assert.equal(r.value[0].privacy.ateliersOriginal.legacy.unknownFields.inventedFuture.foo,'preserved');
 assert.equal(r.value[0].provenance.sourceId,rows[0].provenance.sourceId);
});
test('la sortie P1 stockage ne doit jamais devenir DTO joueur',()=>{
 const p=makeArchStorageCandidate(rows);assert.equal(p.campaign.extensions.indexP1R2.confidential,true);
 assert.match(JSON.stringify(p.campaign),/NE_JAMAIS_PARTAGER/);
 assert.equal(p.requiresExplicitCommit,true);
});
test('stockage inconnu refusé à la restauration',()=>{
 bad(recoverArchStorageCandidate({schema:'other',extensions:{}}),'ARCH_STORAGE_UNAVAILABLE','campaign.extensions.indexP1R2');
});
test('P1 bridge distinct des garanties transactionnelles de #104',()=>{
 const x=makeArchStorageCandidate(rows);assert.equal(x.campaign.revision,1);
 assert.equal(x.campaign.extensions.indexP1R2.notApplied,true);
 assert.equal(Object.hasOwn(x,'commit'),false);
});
test('pas d’effet chiffré créé à partir de capacités descriptives',()=>{
 const x=rows.find(r=>r.recordKind==='ability');
 bad(previewCandidateViaNative(x),'NATIVE_MECHANICS_UNAVAILABLE','mechanics.status');
});
test('un PJ instance non validé M01 rend UNAVAILABLE et ne reçoit aucun XP',()=>{
 bad(previewCandidateViaNative(row('inst:pj:temoin-n10')),'NATIVE_MECHANICS_UNAVAILABLE');
});
test('M01 port inj. : preview délègue, ne calcule ni ne mute la fiche',()=>{
 const x=copy(row('inst:pj:temoin-n10'));x.mechanics={status:'native-reference',validationStatus:'unvalidated',nativeRef:{module:'M01.progressionAtLevel',sourceBlob:'d2040829ea0da7c0f6eae08dc8c701226bfc53c5'}};
 const before=JSON.stringify(x);let calls=0;
 const r=previewCandidateViaNative(x,{progressionAtLevel:n=>{calls++;assert.equal(n,10);return{level:10,experience:123,origin:'sentinel-not-official'}}});
 assert.equal(r.ok,true);assert.equal(calls,1);assert.equal(r.preview.experience,123);assert.equal(r.executable,false);assert.equal(r.applied,false);
 assert.equal(JSON.stringify(x),before);
});
test('M01 erreur native ne produit pas de valeur inventée',()=>{
 const x=copy(row('inst:pj:temoin-n10'));x.mechanics={status:'native-reference',validationStatus:'unvalidated',nativeRef:{module:'M01',sourceBlob:'d2040829ea0da7c0f6eae08dc8c701226bfc53c5'}};
 const r=previewCandidateViaNative(x,{progressionAtLevel:()=>{throw Error('native blocked')}});
 bad(r,'NATIVE_M01_REJECTED','progressionAtLevel');
});
test('M01 absence de port produit UNAVAILABLE',()=>{
 const x=copy(row('inst:pj:temoin-n10'));x.mechanics={status:'native-reference',validationStatus:'unvalidated',nativeRef:{module:'M01',sourceBlob:'d2040829ea0da7c0f6eae08dc8c701226bfc53c5'}};
 bad(previewCandidateViaNative(x),'NATIVE_M01_UNAVAILABLE','progressionAtLevel');
});
test('M03 port injecté readOnly et retour non mutateur',()=>{
 const x=copy(row('inst:creature:veilleur-1'));x.mechanics={status:'native-reference',validationStatus:'unvalidated',nativeRef:{module:'M03',sourceBlob:'09929f1b852a971d73d40474847bae036bf11ffb'}};
 const before=JSON.stringify(x);let calls=0;
 const r=previewCandidateViaNative(x,{previewM03:q=>{calls++;assert.equal(q.readOnly,true);return{executable:false,applied:false,label:'native-injected-preview'}}});
 assert.equal(r.ok,true);assert.equal(calls,1);assert.equal(r.preview.label,'native-injected-preview');assert.equal(JSON.stringify(x),before);
});
test('M03 effet absorption indisponible dans port',()=>bad(previewNativeCombat({effectKind:'absorption'},{previewM03:()=>({})}),'NON_HOMOLOGATED_EFFECT','request'));
test('M03 demande d’application rejetée même avec faux port',()=>bad(previewNativeCombat({apply:true},{previewM03:()=>({})}),'NON_HOMOLOGATED_EFFECT'));
test('test exclusif du validateur R1 continue de passer',()=>assert.equal(validateModelDataset(rows).ok,true));
test('la fixture et les fonctions ne mutent pas les objets sources',()=>{
 const x=copy(originals[0]);const before=JSON.stringify(x);adaptAteliers102(x);assert.equal(JSON.stringify(x),before);
 const dataset=copy(rows);const state=JSON.stringify(dataset);makeArchStorageCandidate(dataset);assert.equal(JSON.stringify(dataset),state);
});
test('refus du proto dangereux injecté',()=>{
 const x=copy(originals[0]);x.extensions.__proto__={oops:true};
 const forged=Object.create({inherited:true});Object.assign(forged,x);bad(adaptAteliers102(forged),'INVALID_PRIVATE_JSON');
});
test('stockage refuse un autre campaignId même si son ID est valide',()=>{
 bad(makeArchStorageCandidate(rows,{campaignId:'camp:foreign'}),'CAMPAIGN_MISMATCH','records[1].identity.campaignId');
});
test('stockage refuse un ID natif contenant un point non supporté par #104, sans alias',()=>{
 const changed=copy(rows);const actor=changed.find(r=>r.recordId==='inst:pj:temoin-n10');actor.identity.instanceId='pj:dot.name';
 changed.find(r=>r.recordId==='inst:scene:pont-fictif').data.participants[1].instanceId='pj:dot.name';
 bad(makeArchStorageCandidate(changed),'ARCH_ID_UNSUPPORTED');
});
test('round-trip stockage détecte une instance altérée dans la projection matérialisée',()=>{
 const p=makeArchStorageCandidate(rows);assert.equal(p.ok,true);
 p.campaign.characters[0].id='pj:forged';
 bad(recoverArchStorageCandidate(p.campaign),'STORAGE_PROJECTION_MISMATCH','campaign.characters');
});
test('round-trip stockage détecte une note MJ altérée',()=>{
 const p=makeArchStorageCandidate(rows);p.campaign.privateNotes[0].text='REMPLACEE';
 bad(recoverArchStorageCandidate(p.campaign),'STORAGE_PROJECTION_MISMATCH','campaign.privateNotes');
});
