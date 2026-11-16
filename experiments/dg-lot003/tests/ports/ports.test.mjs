import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createPorts, createDocumentReader, createRulesGateway, createCatalogResolver, createCharacterImport, createBestiaryAdapter } from '../../src/ports/index.ts'

const src={kind:'source',id:'demo-bestiary-source',version:'fixture-1'}
const doc={kind:'document',code:'CRE-DEMO-001'}
const profile={kind:'profile',id:'p5-demo-001',schema:'alrick.bestiary.v1',ruleset:'m03'}
const ref={document:doc,source:src,profile}
const fixture={schema:'alrick.bestiary.v1',name:'Bête de test fictive',stats:{physique:14,agilite:3,esprit:2,presence:3},unknown:{futureRule:'conserver'},notes:'SECRET-MJ-SENTINEL'}
const reply={document:doc,source:src,profile,snapshot:fixture}
const instance={kind:'instance',id:'instance-001',campaignId:'campaign-fixture'}
const ready=value=>({status:'ready',value})

// These tests import the actual TypeScript production files, not a parallel implementation.
test('L003-PORT-01: all five injectable factories exist',()=>{
 const p=createPorts()
 assert.deepEqual(Object.keys(p).sort(),['bestiaryAdapter','catalogResolver','characterImport','documentReader','rulesGateway'])
})
test('L003-PORT-02: absent delegates fail closed',async()=>{
 const p=createPorts()
 assert.equal((await p.documentReader.read({document:doc,source:src})).status,'unavailable')
 assert.equal((await p.rulesGateway.preview({operation:'m03-combat',ruleset:'m03',input:{}})).status,'unavailable')
 assert.equal((await p.catalogResolver.resolve({namespace:'demo',id:'cap:demo',version:'1.0.0'})).status,'unavailable')
 assert.equal((await p.characterImport.preview(new Uint8Array([123]))).status,'unavailable')
 assert.equal((await p.bestiaryAdapter.makeInstance(ref,instance)).status,'unavailable')
})
test('L003-PORT-03: document reader remains source-read-only and validates identity',async()=>{
 const request={document:doc,source:src}
 const reader=createDocumentReader({read:r=>{r.source.version='fake';return ready({document:doc,source:{...src,version:'fake'},snapshot:{status:'prototype'}})}})
 assert.equal((await reader.read(request)).status,'invalid')
 assert.equal(request.source.version,src.version)
})
test('L003-PORT-04: document reader preserves copies and novel fields',async()=>{
 const source={document:doc,source:src,snapshot:{title:'Test',extra:{future:14}}}
 const reader=createDocumentReader({read:()=>ready(source)})
 const r=await reader.read({document:doc,source:src})
 assert.equal(r.status,'ready')
 r.value.snapshot.extra.future=15
 assert.equal(source.snapshot.extra.future,14)
})
test('L003-PORT-05: invalid document refs rejected',async()=>{
 const reader=createDocumentReader()
 assert.equal((await reader.read({document:{...doc,kind:'profile'},source:src})).status,'invalid')
 assert.equal((await reader.read({document:doc,source:{...src,version:''}})).status,'invalid')
})
test('L003-PORT-06: catalog resolves exact scoped version and detaches',async()=>{
 const cr={namespace:'demo',id:'cap:training:demo',version:'1.0.0'}
 const origin={ref:cr,snapshot:{name:'Fictif',version:1,extra:{x:14}}}
 const catalog=createCatalogResolver({resolve:()=>ready(origin)})
 const r=await catalog.resolve(cr)
 assert.equal(r.status,'ready')
 r.value.snapshot.extra.x=19
 assert.equal(origin.snapshot.extra.x,14)
})
test('L003-PORT-07: catalog rejects version drift and identity collisions',async()=>{
 const cr={namespace:'demo',id:'a',version:'1.0.0'}
 const r=await createCatalogResolver({resolve:()=>ready({ref:{...cr,version:'2.0.0'},snapshot:{}})}).resolve(cr)
 assert.equal(r.status,'invalid')
 assert.equal((await createCatalogResolver().resolve({...cr,namespace:''})).status,'invalid')
})
test('L003-PORT-08: unsupported rules never fall through to a new formula',async()=>{
 const g=createRulesGateway({previewNative:()=>ready({source:'native-M03',output:{damage:3}})})
 assert.equal((await g.preview({operation:'m03-absorption',ruleset:'m03',input:{}})).status,'blocked')
 assert.equal((await g.preview({operation:'object-charge',ruleset:'m03',input:{}})).status,'blocked')
 assert.equal((await g.preview({operation:'authority-25+',ruleset:'m03',input:{}})).status,'blocked')
})
test('L003-PORT-09: MATH/native preview is delegated and copies input/output',async()=>{
 const request={operation:'m03-combat',ruleset:'m03',input:{natural:24,stats:{physique:14}}}
 let calls=0
 const origin={source:'atelier5d6-combat-m03.ts',output:{success:true,observed:14}}
 const gateway=createRulesGateway({previewNative:q=>{calls++;q.input.stats.physique=900;return ready(origin)}})
 const r=await gateway.preview(request)
 assert.equal(r.status,'ready');assert.equal(calls,1)
 assert.equal(request.input.stats.physique,14)
 r.value.output.observed=0;assert.equal(origin.output.observed,14)
})
test('L003-PORT-10: no injected native engine means no preview success',async()=>{
 const r=await createRulesGateway().preview({operation:'grimoire-readonly',ruleset:'m02',input:{spell:'demo'}})
 assert.equal(r.status,'unavailable')
})
test('L003-PORT-11: native failures remain failures',async()=>{
 const r=await createRulesGateway({previewNative:()=>({status:'blocked',reason:'M03 absorption non homologuée'})}).preview({operation:'m03-combat',ruleset:'m03',input:{effects:[{kind:'absorption'}]}})
 assert.deepEqual(r,{status:'blocked',reason:'M03 absorption non homologuée'})
})
test('L003-PORT-12: character preview passes raw octets to ARCHIVES without mutating source bytes',async()=>{
 const bytes=new TextEncoder().encode(JSON.stringify({schema:'alrick.sheets.v2',sheets:[{name:'Fictif',stats:{physique:14},unknown:'kept'}]}))
 const original=new Uint8Array(bytes)
 let calls=0
 const adapter=createCharacterImport({preview:input=>{
   calls++
   assert.notStrictEqual(input,bytes)
   const digest=createHash('sha256').update(input).digest('hex')
   const parsed=JSON.parse(new TextDecoder().decode(input))
   input.fill(0)
   return ready({schema:parsed.schema,sourceDigestSHA256:digest,preview:parsed,warnings:[]})
 }})
 const r=await adapter.preview(bytes)
 assert.equal(calls,1);assert.equal(r.status,'ready')
 assert.deepEqual(bytes,original)
 assert.equal(r.value.preview.sheets[0].stats.physique,14)
 assert.equal(r.value.preview.sheets[0].unknown,'kept')
 assert.equal(r.value.sourceDigestSHA256,createHash('sha256').update(original).digest('hex'))
})
test('L003-PORT-13: malformed ARCHIVES preview cannot be called successful',async()=>{
 const p=createCharacterImport({preview:()=>ready({schema:'alrick.sheets.v3',sourceDigestSHA256:'wrong',preview:{},warnings:[]})})
 assert.equal((await p.preview(new Uint8Array([1,2,3]))).status,'invalid')
})
test('L003-PORT-14: zero-byte import is refused without invoking ARCHIVES',async()=>{
 let n=0
 const p=createCharacterImport({preview:()=>{n++;return ready({})}})
 assert.equal((await p.preview(new Uint8Array())).status,'invalid');assert.equal(n,0)
})
test('L003-PORT-15: Bestiary resolves matching documentary/source/profile identities only',async()=>{
 const b=createBestiaryAdapter({readProfile:()=>ready(reply)})
 assert.equal((await b.readProfile(ref)).status,'ready')
 assert.equal((await b.readProfile({...ref,profile:{...profile,id:'other'}})).status,'invalid')
 assert.equal((await b.readProfile({...ref,source:{...src,version:'v2'}})).status,'invalid')
 assert.equal((await b.readProfile({...ref,document:{...doc,code:'OTHER'}})).status,'invalid')
})
test('L003-PORT-16: Bestiary makes independent instance preserving raw 14 and extensions',async()=>{
 const original=JSON.stringify(reply)
 const b=createBestiaryAdapter({readProfile:()=>ready(reply)})
 const r=await b.makeInstance(ref,instance)
 assert.equal(r.status,'ready')
 assert.equal(r.value.instance.kind,'instance')
 assert.equal(r.value.instance.id,'instance-001')
 assert.equal(r.value.profile.id,profile.id)
 assert.equal(r.value.source.id,src.id)
 assert.equal(r.value.document.code,doc.code)
 assert.equal(r.value.snapshot.stats.physique,14)
 assert.equal(r.value.snapshot.unknown.futureRule,'conserver')
 r.value.snapshot.stats.physique=888
 assert.equal(JSON.stringify(reply),original)
})
test('L003-PORT-17: invalid instance never calls source loader',async()=>{
 let calls=0
 const b=createBestiaryAdapter({readProfile:()=>{calls++;return ready(reply)}})
 assert.equal((await b.makeInstance(ref,{kind:'profile',id:'I',campaignId:'C'})).status,'invalid')
 assert.equal(calls,0)
})
test('L003-PORT-18: optional document identity supports noncanonical fictitious creature',async()=>{
 const noDocument={...ref,document:null}
 const b=createBestiaryAdapter({readProfile:()=>ready({...reply,document:null})})
 const r=await b.makeInstance(noDocument,instance)
 assert.equal(r.status,'ready');assert.equal(r.value.document,null)
})
test('L003-PORT-19: injected delegate exceptions are surfaced, not treated as valid results',async()=>{
 const g=createRulesGateway({previewNative:()=>{throw Error('moteur absent')}})
 const r=await g.preview({operation:'m03-combat',ruleset:'m03',input:{}})
 assert.equal(r.status,'invalid');assert.match(r.reason,/moteur absent/)
})
test('L003-PORT-20: no imports from other owners are required',async()=>{
 const {readFile}=await import('node:fs/promises')
 const srcText=await readFile(new URL('../../src/ports/ports.ts',import.meta.url),'utf8')
 assert.ok(srcText.includes('from "./types.ts"'))
 assert.ok(!srcText.includes('../rules/'))
 assert.ok(!srcText.includes('../catalog/'))
 assert.ok(!srcText.includes('../storage/'))
 assert.ok(!srcText.includes('../studio/'))
})

test('L003-PORT-21: catalog is independent of JSON object key ordering',async()=>{
 const ref={namespace:'unit',id:'unit:a',version:'3'}
 const resolver=createCatalogResolver({resolve:()=>ready({ref:{version:'3',id:'unit:a',namespace:'unit'},snapshot:{}})})
 assert.equal((await resolver.resolve(ref)).status,'ready')
})
test('L003-PORT-22: multiple instances of same source have independent snapshots',async()=>{
 const b=createBestiaryAdapter({readProfile:()=>ready(reply)})
 const a=await b.makeInstance(ref,{...instance,id:'local-A'})
 const c=await b.makeInstance(ref,{...instance,id:'local-C'})
 assert.equal(a.status,'ready');assert.equal(c.status,'ready')
 a.value.snapshot.stats.physique=70
 assert.equal(c.value.snapshot.stats.physique,14)
 assert.equal(reply.snapshot.stats.physique,14)
})
test('L003-PORT-23: malformed delegate return is rejected rather than treated as success',async()=>{
 const r=await createDocumentReader({read:()=>({status:'ready',value:undefined})}).read({document:doc,source:src})
 assert.equal(r.status,'invalid')
})