/** Standalone real loopback HTTP check. Exit nonzero unless BOTH actual servers respond. */
import assert from 'node:assert/strict';
const endpoints=[['MJ','http://127.0.0.1:4173/',4173],['player','http://127.0.0.1:4174/',4174]];
let failed=false;
for(const [name,uri,port] of endpoints){try{
 const u=new URL(uri);assert.equal(u.hostname,'127.0.0.1');assert.equal(Number(u.port),port);
 const res=await fetch(uri,{signal:AbortSignal.timeout(2500)});assert.equal(res.status,200);assert(/text\/html/.test(res.headers.get('content-type')||''));
 const body=await res.text();assert(body.startsWith('<!doctype html')||body.startsWith('<!DOCTYPE html'),'HTML document missing');
 assert(/DG-LOT-003|Studio/i.test(body),'Unexpected served product');console.log(`${name} HTTP PASS ${uri} status=200 bytes=${Buffer.byteLength(body)}`);
 }catch(e){failed=true;console.error(`${name} HTTP NOT EXECUTABLE: ${e.message}`)}}
if(failed)process.exitCode=1;