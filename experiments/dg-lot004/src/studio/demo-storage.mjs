/** L004 demo isolation wrapper. Does not implement, replace or inspect ARCHIVES formats. */
export const DEMO_NAMESPACE = 'cer.dg004.demo.only.v0.';
export const DEMO_MARKER = 'cer.dg004.fictional.session.v0';
const ARCHIVE_KEY = 'cer.dg003.private.campaign.v0';
const ALLOW_KEY = 'approved-backup-sha256';
const clone = value => structuredClone(value);
const isObject = x => x !== null && typeof x === 'object' && !Array.isArray(x);

/** The only storage key used by L003 is mapped into a separate namespace.
 * No generic localStorage iteration, delete or access to existing MJ keys.
 */
export function createDemoStorageArea(area) {
  if (!area || typeof area.getItem !== 'function' || typeof area.setItem !== 'function')
    throw new TypeError('Stockage local nécessaire pour le mode fictif');
  const key = input => {
    if (![ARCHIVE_KEY, ALLOW_KEY].includes(input)) throw Error('Clé de démonstration non autorisée');
    return DEMO_NAMESPACE + input;
  };
  return Object.freeze({
    getItem(input) { return area.getItem(key(input)); },
    setItem(input,value) { area.setItem(key(input),String(value)); },
    removeItem(input) { if (typeof area.removeItem !== 'function') throw Error('Suppression indisponible');area.removeItem(key(input)); },
  });
}

function tagged(campaign) {
  if (!isObject(campaign)) throw Error('Campagne fictive invalide');
  const safe = clone(campaign);
  safe.extensions = isObject(safe.extensions) ? safe.extensions : {};
  safe.extensions.__dg004_fictional_demo = DEMO_MARKER;
  return safe;
}
function requireTagged(campaign) {
  if (!isObject(campaign) || campaign.extensions?.__dg004_fictional_demo !== DEMO_MARKER)
    throw Error('Refus : campagne externe au mode démonstration');
  return campaign;
}
async function digest(bytes, cryptoAPI) {
  if (!(bytes instanceof Uint8Array) || !cryptoAPI?.subtle?.digest) throw Error('SHA-256 natif indisponible');
  const data = await cryptoAPI.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(data), b => b.toString(16).padStart(2,'0')).join('');
}
function allowlisted(area) {
  try {const raw=JSON.parse(area.getItem(ALLOW_KEY)??'[]');
    return Array.isArray(raw) ? raw.filter(s => typeof s === 'string' && /^[a-f0-9]{64}$/.test(s)).slice(-24) : [];
  } catch{return [];}
}
/** Wraps the REAL ARCHIVES-backed L003 storage adapter and never invents restore logic.
 * Only previously exported demo backups are admitted for restoration in this mode.
 */
export function isolateDemoAdapter(base, area, {cryptoAPI}={}) {
  if (!base || ['save','load','exportPrivate','previewRestore','restore'].some(method => typeof base[method] !== 'function'))
    throw new TypeError('Adaptateur ARCHIVES natif requis');
  if (!area || typeof area.getItem !== 'function') throw new TypeError('Espace fictif requis');
  return Object.freeze({
    async load(){const value=await base.load();return value ? clone(requireTagged(value)) : null;},
    async save(campaign){return base.save(tagged(campaign));},
    async beginEdit(){
      if(typeof base.beginEdit!=='function')throw Error('P0 causal edit unavailable');
      const ticket=await base.beginEdit();
      return {handle:ticket.handle,base:clone(requireTagged(ticket.base))};
    },
    async commitEdit(handle,operations){
      if(typeof base.commitEdit!=='function')throw Error('P0 causal commit unavailable');
      const saved=await base.commitEdit(handle,operations);
      return clone(requireTagged(saved));
    },
    forkEdit(handle){
      if(typeof base.forkEdit!=='function')throw Error('P0 causal fork unavailable');
      return base.forkEdit(handle);
    },
    async exportPrivate(campaign){
      const result=await base.exportPrivate(tagged(campaign));
      if (!(result instanceof Uint8Array)) throw Error('Archive native en octets requise');
      const sha=await digest(result,cryptoAPI);
      const hashes=allowlisted(area).filter(x=>x!==sha);
      hashes.push(sha);area.setItem(ALLOW_KEY,JSON.stringify(hashes.slice(-24)));
      return result;
    },
    async previewRestore({bytes}){
      if (!(bytes instanceof Uint8Array)) throw Error('Restauration en octets requise');
      const sha=await digest(bytes,cryptoAPI);
      if (!allowlisted(area).includes(sha)) throw Error('Archive non reconnue comme export fictif : restauration refusée');
      // Content/schema/hash/collision verification belongs ONLY to ARCHIVES.
      const p=await base.previewRestore({bytes});
      return {...p,__dg004_expected_sha:sha};
    },
    async restore(preview,{previous}={}){
      if (!preview || !allowlisted(area).includes(preview.__dg004_expected_sha))
        throw Error('Aperçu de restauration non autorisé');
      const {__dg004_expected_sha:ignored,...nativePreview}=preview;
      const restored=await base.restore(nativePreview,{previous:previous ? tagged(previous) : null});
      return clone(requireTagged(restored));
    },
    async appendCatalog(...args){
      if (typeof base.appendCatalog !== 'function') throw Error('Catalogue persistant non intégré');
      return base.appendCatalog(...args);
    },
  });
}

export function fictionalCharacterBytes() {
  const sheet={schema:'alrick.sheet.v3',id:'l004-hero-fiction',name:'Aëlia — héroïne fictive',
    level:5,stats:{physique:14,agilite:8,esprit:11,presence:6},
    inventory:[{id:'l004-objet-fiction',name:'Lanterne d’argile',notes:'Objet purement descriptif'}],
    extensionFictive:{origin:'L004-A',status:'proposition'}};
  return new TextEncoder().encode(JSON.stringify({schema:'alrick.sheets.v3',sheets:[sheet],demoOnly:true}));
}
