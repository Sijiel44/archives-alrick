import test from 'node:test'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {
  STORAGE_SCHEMA,createCampaign,previewImport,commitImport,exportPrivate,
  previewRestore,commitRestore,recoverOriginalBytes
} from '../../src/storage/storage.mjs'
const enc=new TextEncoder()
const bytes=v=>enc.encode(JSON.stringify(v))
const sha=v=>createHash('sha256').update(v).digest('hex')
const p=()=>createCampaign({id:'campaign-alpha',name:'Projet fictif'})
const sheet=(id='hero',extra={})=>({schema:'alrick.sheet.v3',id,name:'Personnage fictif',stats:{physique:14,esprit:4},inventory:[{id:'obj',charges:7,customCharges:'ne pas convertir'}],...extra})
const source=(schema='alrick.sheets.v3',sheets=[sheet()],extra={})=>({schema,sheets,...extra})
const error=code=>err=>err?.code===code

test('01 preview v3 is pure; score 14 and unknown extension',async()=>{
 const x=p();const old=JSON.stringify(x);const raw=bytes(source('alrick.sheets.v3',[sheet('hero',{futureRule:{v:99}})],{newEnvelope:true}));const pre=await previewImport(raw,x)
 assert.equal(JSON.stringify(x),old);assert.equal(pre.entries[0].rawStat14,true);assert.equal(pre.source.sha256,sha(raw));assert.equal(pre.source.schema,'alrick.sheets.v3')
})
test('02 v2 original remains byte-identical and rules unmigrated',async()=>{
 const raw=bytes(source('alrick.sheets.v2',[{...sheet('v2'),schema:'alrick.sheet.v2',inventory:[{charges:11}]}]));const next=await commitImport(p(),await previewImport(raw,p()));assert.deepEqual(await recoverOriginalBytes(next.characters[0]),raw);assert.equal(next.characters[0].sheet.inventory[0].charges,11)
})
test('03 UTF-8 BOM, whitespace and accents recovered exactly',async()=>{
 const raw=new Uint8Array([239,187,191,...enc.encode('\n  '+JSON.stringify(source('alrick.sheets.v3',[sheet('heros',{name:'Élève 🐉'})]))+'  \n')]);const x=p();const y=await commitImport(x,await previewImport(raw,x));assert.deepEqual(await recoverOriginalBytes(y.characters[0]),raw)
})
test('04 multi-sheet import and reimport preserve same source bytes',async()=>{
 const raw=bytes(source('alrick.sheets.v3',[sheet('a'),sheet('b')],{plugin:{author:'fictif'}}));let campaign=p();campaign=await commitImport(campaign,await previewImport(raw,campaign));assert.equal(campaign.characters.length,2);for(const c of campaign.characters)assert.deepEqual(await recoverOriginalBytes(c),raw)
})
test('05 duplicate source ID inside document refused',async()=>{await assert.rejects(previewImport(bytes(source('alrick.sheets.v3',[sheet('a'),sheet('a')])),p()),error('ID_COLLISION'))})
test('06 collision with already imported character refused with no mutation',async()=>{
 const raw=bytes(source()),x=p(),y=await commitImport(x,await previewImport(raw,x));const snap=JSON.stringify(y);await assert.rejects(previewImport(raw,y),error('ID_COLLISION'));assert.equal(JSON.stringify(y),snap)
})
test('07 unknown envelope schema refused, no fallback',async()=>{await assert.rejects(previewImport(bytes(source('alrick.sheets.v4')),p()),error('UNSUPPORTED_SCHEMA'))})
test('08 truncated JSON and invalid UTF8 refused',async()=>{
 await assert.rejects(previewImport(enc.encode('{"schema":"alrick.sheets.v3","sheets":['),p()),error('BAD_JSON'))
 await assert.rejects(previewImport(new Uint8Array([255,254,0]),p()),error('BAD_UTF8'))
})
test('09 unsafe keys and malformed instance ID refused',async()=>{
 await assert.rejects(previewImport(enc.encode('{"schema":"alrick.sheets.v3","sheets":[{"id":"hero","__proto__":{"polluted":true}}]}'),p()),error('UNSAFE_KEY'))
 await assert.rejects(previewImport(bytes(source()),p(),{instancePrefix:'not allowed'}),error('INVALID_ID'))
})
test('10 stale preview refusal; original input not mutated',async()=>{
 const x=p(),raw=bytes(source()),pre=await previewImport(raw,x),changed={...x,name:'modifié'}
 await assert.rejects(commitImport(changed,pre),error('STALE_PREVIEW'))
 assert.equal(x.characters.length,0);assert.equal(raw.byteLength,bytes(source()).byteLength)
})
test('11 private export => restore => reexport => original SHA parity',async()=>{
 const x=p(),raw=bytes(source());const y=await commitImport(x,await previewImport(raw,x));y.privateNotes.push('SECRET_MJ_100%_FICTIF')
 const exp=await exportPrivate(y);assert.equal(exp.confidential,true);assert.equal(exp.sha256,sha(exp.bytes))
 const preview=await previewRestore(exp.bytes,{expectedSha256:exp.sha256});const restored=await commitRestore(preview)
 assert.deepEqual(restored,y);assert.deepEqual(await recoverOriginalBytes(restored.characters[0]),raw)
 const exp2=await exportPrivate(restored);assert.equal(exp2.sha256,exp.sha256);assert.deepEqual(exp2.bytes,exp.bytes)
})
test('12 tampered source base64/hash fails restore without modifying old project',async()=>{
 const x=p(),raw=bytes(source());const y=await commitImport(x,await previewImport(raw,x));const e=await exportPrivate(y)
 const payload=JSON.parse(new TextDecoder().decode(e.bytes));payload.project.characters[0].source.base64='YQ=='
 const malicious=bytes(payload),old=JSON.stringify(y)
 await assert.rejects(previewRestore(malicious),error('HASH_MISMATCH'))
 assert.equal(JSON.stringify(y),old)
})
test('13 corrupt private SHA or wrong export kind rejected',async()=>{
 const exp=await exportPrivate(p());await assert.rejects(previewRestore(exp.bytes,{expectedSha256:'0'.repeat(64)}),error('HASH_MISMATCH'))
 await assert.rejects(previewRestore(bytes({kind:'wrong',project:p()})),error('UNSUPPORTED_SCHEMA'))
})
test('14 restore cannot overwrite existing project unless explicitly replace=true',async()=>{
 const exp=await exportPrivate(p()),prev=await previewRestore(exp.bytes)
 await assert.rejects(commitRestore(prev,{existingProject:p()}),error('RESTORE_CONFLICT'))
 assert.deepEqual(await commitRestore(prev,{existingProject:p(),replace:true}),p())
})
test('15 tampered preview after import prohibited by source digest',async()=>{
 const x=p(),pre=await previewImport(bytes(source()),x);pre.source.base64='e30='
 await assert.rejects(commitImport(x,pre),error('HASH_MISMATCH'))
})
test('16 project retains unknown private extensions and never creates player DTO',async()=>{
 const x={...p(),experimental:{unknown:{active:false}},privateNotes:['secret fictif']};const e=await exportPrivate(x);const restored=await commitRestore(await previewRestore(e.bytes))
 assert.deepEqual(restored.experimental,x.experimental);assert.equal('playerProjection' in restored,false)
})
