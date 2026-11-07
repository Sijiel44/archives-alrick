/** DG004 P0 integration-only: fail-closed, namespaced creator journal.
 * Cooperative cross-tab serialisation: Web Locks + revision CAS + readback.
 * This is NOT a server transaction across ARCHIVES and the creator store.
 */
export const CYCLE_KEY='cer.dg004.creators.private.demo.v0';
export const ENVELOPE='cer.dg004.creators.demo-owned.v1';
export const CYCLE_SCHEMA='cer.creators.dg004.private.v0';
const LOCK='cer.dg004.creators.private.demo.lock.v1';
const fail=message=>{throw Error(message);};
const json=x=>JSON.parse(JSON.stringify(x));
const valid=x=>x&&typeof x==='object'&&!Array.isArray(x);
function parseOwned(raw){
 if(raw===null)return null;
 let e;try{e=JSON.parse(raw);}catch{fail('FOREIGN_CREATOR_KEY: JSON opaque existant conservé');}
 if(!valid(e)||e.kind!==ENVELOPE||!valid(e.cycle)||
    e.cycle.schema!==CYCLE_SCHEMA||typeof e.cycle.id!=='string'||
    !Number.isSafeInteger(e.cycle.revision)||e.cycle.revision<0||
    e.cycleId!==e.cycle.id||e.revision!==e.cycle.revision||
    typeof e.digest!=='string'||!/^[a-f0-9]{64}$/.test(e.digest))
  fail('FOREIGN_CREATOR_KEY: données préexistantes non attestées, conservation obligatoire');
 return e;
}
async function sha256(data,cryptoAPI){
 if(typeof data!=='string'||!cryptoAPI?.subtle?.digest)fail('Crypto SHA-256 indisponible');
 const digest=await cryptoAPI.subtle.digest('SHA-256',new TextEncoder().encode(data));
 return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
export function createGuardedCreatorPersistence({area,locks,cryptoAPI,key=CYCLE_KEY}={}){
 if(!area||typeof area.getItem!=='function'||typeof area.setItem!=='function'||
    typeof area.removeItem!=='function')fail('Stockage local en lecture/écriture requis');
 if(key!==CYCLE_KEY)fail('Clé de cycle non contractuelle');
 if(!locks||typeof locks.request!=='function')fail('Web Locks requis : écriture concurrente interdite');
 // Fail closed before mounting any creator UI or writing to a preexisting key.
 parseOwned(area.getItem(key));
 const withLock=fn=>locks.request(LOCK,{mode:'exclusive'},fn);
 async function loadEnvelope(){
  const e=parseOwned(area.getItem(key));
  if(!e)return null;
  const actual=await sha256(JSON.stringify(e.cycle),cryptoAPI);
  if(e.digest!==actual)fail('CREATOR_DIGEST_DRIFT: conservation sans mutation');
  return e;
 }
 return Object.freeze({
  async load(){
   const e=await loadEnvelope();
   return e?json(e.cycle):null;
  },
  async save(next){
   if(!valid(next)||next.schema!==CYCLE_SCHEMA||typeof next.id!=='string'||
      !Number.isSafeInteger(next.revision)||next.revision<1)
     fail('CREATOR_SCHEMA_OR_REVISION_INVALID');
   return withLock(async()=>{
    const previous=await loadEnvelope(); // Reject foreign/older preexisting key.
    if(previous){
     if(previous.cycleId!==next.id)fail('CREATOR_IDENTITY_CONFLICT: données conservées');
     if(next.revision!==previous.revision+1)
      fail('CREATOR_REVISION_CONFLICT: recharger avant écriture depuis cet onglet');
    }else if(next.revision!==1)fail('CREATOR_INITIAL_REVISION_CONFLICT');
    const clone=json(next);
    const digest=await sha256(JSON.stringify(clone),cryptoAPI);
    const envelope={kind:ENVELOPE,cycleId:clone.id,revision:clone.revision,digest,cycle:clone};
    const raw=JSON.stringify(envelope);
    area.setItem(key,raw); // Throws on quota: no false acknowledgement.
    if(area.getItem(key)!==raw)fail('CREATOR_WRITE_NOT_CONFIRMED');
    return {saved:true,revision:clone.revision};
   });
  },
  async deleteIfOwned({cycleId,revision}={}){
   return withLock(async()=>{
    const e=await loadEnvelope();
    if(!e)return {deleted:false,reason:'absent'};
    if(e.cycleId!==cycleId||e.revision!==revision)
     fail('CREATOR_CLEANUP_CONFLICT: identité ou révision changée');
    const observed=area.getItem(key);
    if(observed===null)fail('CREATOR_CLEANUP_CONFLICT');
    // Under the cooperative Web Lock no second DG004 writer can interleave.
    const verified=await loadEnvelope();
    if(verified?.cycleId!==cycleId||verified.revision!==revision||area.getItem(key)!==observed)
     fail('CREATOR_CLEANUP_CONFLICT: nouvelles données');
    area.removeItem(key);
    if(area.getItem(key)!==null)fail('CREATOR_CLEANUP_NOT_CONFIRMED');
    return {deleted:true,cycleId,revision};
   });
  }
 });
}
