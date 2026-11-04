/** DG-LOT-003 STORAGE — provisional local-only, never a canonical schema.
 * No side effects, no browser storage, no normalization, no rules evaluation.
 * Raw input MUST be supplied as Uint8Array/ArrayBuffer for byte exactness.
 */
export const STORAGE_SCHEMA = 'cer.studio.dg003.provisional.v0'
export const PRIVATE_EXPORT_KIND = 'cer.studio.dg003.private-export.v0'
export const MAX_SOURCE_BYTES = 2 * 1024 * 1024
export const MAX_EXPORT_BYTES = 16 * 1024 * 1024
const idPattern = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/
const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', {fatal:true, ignoreBOM:true})
const own = (o,k)=>Object.prototype.hasOwnProperty.call(o,k)
const fail = (code,msg)=>{const e=new Error(msg);e.code=code;throw e}
const isObj = v=>v!==null && typeof v==='object' && !Array.isArray(v)
const clone = obj=>JSON.parse(JSON.stringify(obj))
function assertId(value,name='identifiant'){if(typeof value!=='string'||!idPattern.test(value))fail('INVALID_ID',`${name} invalide`)}
function assertPlainJSON(v,depth=0){
  if(depth>48)fail('DEPTH_LIMIT','JSON trop profond')
  if(Array.isArray(v)){for(const item of v)assertPlainJSON(item,depth+1);return}
  if(isObj(v)){
    for(const [k,value] of Object.entries(v)){
      if(['__proto__','constructor','prototype'].includes(k))fail('UNSAFE_KEY','Clé JSON interdite')
      assertPlainJSON(value,depth+1)
    }
    return
  }
  if(typeof v==='string'||typeof v==='boolean'||v===null||typeof v==='number'&&Number.isFinite(v))return
  fail('INVALID_JSON','Type JSON invalide')
}
function bytesOf(input,max=MAX_SOURCE_BYTES){
  let b
  if(input instanceof Uint8Array)b=new Uint8Array(input)
  else if(input instanceof ArrayBuffer)b=new Uint8Array(input.slice(0))
  else if(typeof input==='string')b=encoder.encode(input) // only bytes are fully faithful to original files
  else fail('INVALID_INPUT','Attendu : Uint8Array, ArrayBuffer ou texte UTF-8')
  if(b.byteLength===0||b.byteLength>max)fail('SIZE_LIMIT','Taille vide ou hors limite')
  return b
}
function b64(bytes){let out='';for(let i=0;i<bytes.length;i+=8192)out+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(out)}
function fromB64(value){
  // Linear validation: repeated quantified regexp groups overflow on multi-MiB backups.
  // Bound the encoded length before scanning/decoding to avoid allocation amplification.
  if(typeof value!=='string'||value.length===0||value.length%4!==0||
      value.length>4*Math.ceil(MAX_EXPORT_BYTES/3))fail('BAD_BASE64','Base64 invalide')
  const n=value.length
  const padding=value[n-1]==='='?(value[n-2]==='='?2:1):0
  for(let i=0;i<n-padding;i++){
    const c=value.charCodeAt(i)
    if(!((c>=65&&c<=90)||(c>=97&&c<=122)||(c>=48&&c<=57)||c===43||c===47))
      fail('BAD_BASE64','Base64 invalide')
  }
  for(let i=n-padding;i<n;i++)if(value.charCodeAt(i)!==61)fail('BAD_BASE64','Base64 invalide')
  let binary;try{binary=atob(value)}catch{fail('BAD_BASE64','Base64 invalide')}
  const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0))
  if(b64(bytes)!==value)fail('BAD_BASE64','Base64 non canonique')
  return bytes
}

async function sha256(b){
  if(!globalThis.crypto?.subtle)fail('NO_CRYPTO','WebCrypto SHA256 requis')
  const data=await globalThis.crypto.subtle.digest('SHA-256', b)
  return Array.from(new Uint8Array(data),x=>x.toString(16).padStart(2,'0')).join('')
}
function parseBytes(bytes){
  let text;try{text=decoder.decode(bytes)}catch{fail('BAD_UTF8','UTF-8 invalide')}
  // TextDecoder(ignoreBOM:true) includes a leading BOM in the result.
  if(text.charCodeAt(0)===0xfeff)text=text.slice(1)
  let json;try{json=JSON.parse(text)}catch{fail('BAD_JSON','JSON tronqué ou invalide')}
  assertPlainJSON(json)
  return json
}
function validateSheetDocument(doc){
  if(!isObj(doc)||!['alrick.sheets.v2','alrick.sheets.v3'].includes(doc.schema))fail('UNSUPPORTED_SCHEMA','Import de fiches v2/v3 uniquement')
  if(!Array.isArray(doc.sheets)||doc.sheets.length===0||doc.sheets.length>200)fail('INVALID_SHEETS','Liste de fiches invalide')
  const seen=new Set()
  for(const sheet of doc.sheets){
    if(!isObj(sheet))fail('INVALID_SHEET','Fiche invalide')
    assertId(sheet.id,'ID fiche')
    if(seen.has(sheet.id))fail('ID_COLLISION','Collision interne de fiche')
    seen.add(sheet.id)
    if(sheet.schema!==undefined && !['alrick.sheet.v2','alrick.sheet.v3'].includes(sheet.schema))fail('UNSUPPORTED_SHEET','Schéma de fiche inconnu')
    // A doc may contain legacy sheets under a v3 envelope. Preserve, never coerce.
  }
  return doc
}
function validateCampaign(p){
  if(!isObj(p)||p.schema!==STORAGE_SCHEMA)fail('UNSUPPORTED_SCHEMA','Campagne provisoire incompatible')
  assertId(p.id,'ID campagne')
  if(!Array.isArray(p.characters)||!Array.isArray(p.scenes)||!Array.isArray(p.creatures))fail('INVALID_PROJECT','Collections manquantes')
  if(p.characters.length>200||p.scenes.length>1000||p.creatures.length>1000)fail('SIZE_LIMIT','Trop de documents')
  const ids=new Set()
  for(const c of p.characters){
    if(!isObj(c)||!isObj(c.source))fail('INVALID_PROJECT','Source personnage absente')
    assertId(c.id,'ID instance');if(ids.has(c.id))fail('ID_COLLISION','Collision personnage');ids.add(c.id)
    if(!Array.isArray(c.source.sheetIds)||!['alrick.sheets.v2','alrick.sheets.v3'].includes(c.source.schema))fail('INVALID_SOURCE','Métadonnées source invalides')
    if(typeof c.source.sha256!=='string'||!/^[a-f0-9]{64}$/.test(c.source.sha256))fail('INVALID_HASH','SHA source invalide')
    if(!Number.isSafeInteger(c.source.byteLength)||c.source.byteLength<1||c.source.byteLength>MAX_SOURCE_BYTES)fail('SIZE_LIMIT','Taille source invalide')
    if(typeof c.source.base64!=='string')fail('INVALID_SOURCE','Original absent')
    for(const sid of c.source.sheetIds)assertId(sid,'ID source')
  }
  for(const x of [...p.scenes,...p.creatures]){if(!isObj(x))fail('INVALID_PROJECT','Entrée invalide');assertId(x.id);if(ids.has(x.id))fail('ID_COLLISION','Collision globale');ids.add(x.id)}
  assertPlainJSON(p)
  return p
}
export function createCampaign({id,name='Campagne fictive'}={}){
  assertId(id,'ID campagne')
  if(typeof name!=='string'||name.length>200)fail('INVALID_PROJECT','Nom invalide')
  return {schema:STORAGE_SCHEMA,id,name,characters:[],creatures:[],scenes:[],privateNotes:[]}
}
/** Read-only preview. Copies input and returns an import plan, never changes project. */
export async function previewCharacterImport(input,project,{instancePrefix='pj'}={}){
  validateCampaign(project);assertId(instancePrefix,'Préfixe')
  const bytes=bytesOf(input);const source=validateSheetDocument(parseBytes(bytes))
  const existing=new Set([...project.characters,...project.creatures,...project.scenes].map(x=>x.id))
  const entries=source.sheets.map(sheet=>({sourceId:sheet.id,instanceId:`${instancePrefix}:${sheet.id}`,name:typeof sheet.name==='string'?sheet.name:'',rawStat14:Object.values(isObj(sheet.stats)?sheet.stats:{}).some(x=>x===14)}))
  for(const entry of entries){assertId(entry.instanceId,'ID instance');if(existing.has(entry.instanceId))fail('ID_COLLISION',`ID déjà présent : ${entry.instanceId}`)}
  return {kind:'character-import-preview',schema:STORAGE_SCHEMA,projectId:project.id,projectFingerprint:await projectFingerprint(project),source:{schema:source.schema,base64:b64(bytes),sha256:await sha256(bytes),byteLength:bytes.length,sheetIds:source.sheets.map(x=>x.id)},entries}
}
async function projectFingerprint(project){return sha256(encoder.encode(JSON.stringify(project)))}
/** Explicit commit returns a NEW project. Never mutates project or calls storage. */
export async function commitCharacterImport(project,preview){
  validateCampaign(project)
  if(!isObj(preview)||preview.kind!=='character-import-preview'||preview.schema!==STORAGE_SCHEMA||preview.projectId!==project.id)fail('INVALID_PREVIEW','Aperçu invalide')
  if(await projectFingerprint(project)!==preview.projectFingerprint)fail('STALE_PREVIEW','Projet changé depuis aperçu')
  const bytes=fromB64(preview.source?.base64)
  if(bytes.length!==preview.source.byteLength||await sha256(bytes)!==preview.source.sha256)fail('HASH_MISMATCH','Source altérée')
  const doc=validateSheetDocument(parseBytes(bytes))
  if(doc.schema!==preview.source.schema||JSON.stringify(doc.sheets.map(x=>x.id))!==JSON.stringify(preview.source.sheetIds))fail('INVALID_PREVIEW','Source différente')
  if(!Array.isArray(preview.entries)||preview.entries.length!==doc.sheets.length)fail('INVALID_PREVIEW','Entrées absentes')
  const occupied=new Set([...project.characters,...project.creatures,...project.scenes].map(x=>x.id));const next=clone(project)
  for(let i=0;i<doc.sheets.length;i++){
    const original=doc.sheets[i], e=preview.entries[i]
    if(!isObj(e)||e.sourceId!==original.id||typeof e.instanceId!=='string')fail('INVALID_PREVIEW','Identité différente')
    assertId(e.instanceId,'ID instance')
    if(occupied.has(e.instanceId))fail('ID_COLLISION','ID existant ou dupliqué')
    occupied.add(e.instanceId)
    next.characters.push({id:e.instanceId,sourceId:original.id,source:clone(preview.source),sheet:clone(original)})
  }
  return next
}
async function validateSource(c){
  const bytes=fromB64(c.source.base64)
  if(bytes.length!==c.source.byteLength||bytes.length>MAX_SOURCE_BYTES||await sha256(bytes)!==c.source.sha256)fail('HASH_MISMATCH','Original ou empreinte altéré')
  const doc=validateSheetDocument(parseBytes(bytes))
  if(doc.schema!==c.source.schema||JSON.stringify(doc.sheets.map(x=>x.id))!==JSON.stringify(c.source.sheetIds))fail('SOURCE_MISMATCH','Identité source incohérente')
  const matching=doc.sheets.find(s=>s.id===c.sourceId)
  if(!matching||JSON.stringify(matching)!==JSON.stringify(c.sheet))fail('SOURCE_MISMATCH','Fiche dérivée incohérente avec original')
  return bytes
}
/** Raw bytes of the original input, including UTF-8 BOM, spaces and unknown fields. */
export async function recoverOriginalBytes(character){await validateSource(character);return fromB64(character.source.base64)}
/** Export contains PRIVATE campaign data. Never send to the player origin. */
export async function serializePrivateCampaign(project){
  validateCampaign(project)
  for(const c of project.characters)await validateSource(c)
  const body=encoder.encode(JSON.stringify({kind:PRIVATE_EXPORT_KIND,project:clone(project)}))
  if(body.length>MAX_EXPORT_BYTES)fail('SIZE_LIMIT','Export privé trop volumineux')
  return {confidential:true,mediaType:'application/json',bytes:body,sha256:await sha256(body)}
}
/** Restore preview verifies all source hashes, no mutation or persistence. */
export async function previewPrivateRestore(input,{expectedSha256}={}){
  const bytes=bytesOf(input,MAX_EXPORT_BYTES)
  const digest=await sha256(bytes)
  if(expectedSha256!==undefined&&expectedSha256!==digest)fail('HASH_MISMATCH','Empreinte export différente')
  const envelope=parseBytes(bytes)
  if(!isObj(envelope)||envelope.kind!==PRIVATE_EXPORT_KIND)fail('UNSUPPORTED_SCHEMA','Export privé incompatible')
  const project=validateCampaign(envelope.project)
  for(const c of project.characters)await validateSource(c)
  return {kind:'private-restore-preview',schema:STORAGE_SCHEMA,sha256:digest,byteLength:bytes.length,projectId:project.id,characterCount:project.characters.length,sourceHashes:project.characters.map(c=>c.source.sha256),base64:b64(bytes)}
}
/** Explicit replacement only: returns a new project; never updates localStorage or caller. */
export async function commitPrivateRestore(preview,{existingProject=null,replace=false}={}){
  if(!isObj(preview)||preview.kind!=='private-restore-preview'||preview.schema!==STORAGE_SCHEMA)fail('INVALID_PREVIEW','Aperçu restauration invalide')
  if(existingProject!==null){validateCampaign(existingProject);if(!replace)fail('RESTORE_CONFLICT','Remplacement interdit sans replace=true')}
  const bytes=fromB64(preview.base64)
  if(bytes.length!==preview.byteLength||await sha256(bytes)!==preview.sha256)fail('HASH_MISMATCH','Export modifié après aperçu')
  const fresh=await previewPrivateRestore(bytes,{expectedSha256:preview.sha256})
  if(fresh.projectId!==preview.projectId||fresh.characterCount!==preview.characterCount||JSON.stringify(fresh.sourceHashes)!==JSON.stringify(preview.sourceHashes))fail('INVALID_PREVIEW','Métadonnées restauration altérées')
  return clone(parseBytes(bytes).project)
}
/** Alias explicit for consumers; never normalizes or commits automatically. */
export const previewImport = previewCharacterImport
export const commitImport = commitCharacterImport
export const exportPrivate = serializePrivateCampaign
export const previewRestore = previewPrivateRestore
export const commitRestore = commitPrivateRestore
