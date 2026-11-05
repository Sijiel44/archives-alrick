/** L004-A / BUILDER — reversible local preview contract. No 5d6, campaign or player data. */
export const SOURCE_PRODUCT_SHA = '2ab809ef5351940e0fc272b859d10f21de894d00';
export const SOURCE_QA_SHA = '20679f7bf5c744f29dd041413cc63801ce5daea1';
export const MJ_ORIGIN = 'http://127.0.0.1:4173';
export const PLAYER_ORIGIN = 'http://127.0.0.1:4174';
export const PREVIEW_SCHEMA = 'cer.builder.preview.l004.provisional.v0';
export const NAVIGATION = Object.freeze([
  Object.freeze({id:'campagne',label:'1. Campagne',selector:'input[aria-label="Nom de la campagne"]',needsCampaign:false}),
  Object.freeze({id:'fiches',label:'2. Fiches PJ',selector:'input[aria-label="Fichier PJ v2/v3"]',needsCampaign:true}),
  Object.freeze({id:'creature',label:'3. Créature',selector:'input[aria-label="Code ou référence créature"]',needsCampaign:true}),
  Object.freeze({id:'scene',label:'4. Scène et notes MJ',selector:'input[aria-label="Titre de nouvelle scène"]',needsCampaign:true}),
  Object.freeze({id:'projection',label:'5. Projection joueur',selector:'div[aria-label="Aperçu public"]',needsCampaign:true}),
  Object.freeze({id:'sauvegarde',label:'6. Export / restauration',selector:'input[aria-label="Fichier de restauration confidentiel"]',needsCampaign:true}),
  Object.freeze({id:'createurs',label:'7. Créateurs descriptifs',selector:'[aria-label="Créateurs descriptifs DG-LOT-003"]',needsCampaign:false}),
]);
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
export function getPreviewPlan(options={}) {
  if(!isObject(options))throw new TypeError('Options de prévisualisation invalides');
  const keys=Object.keys(options);
  if(keys.some(k=>!['mjOrigin','playerOrigin'].includes(k)))throw new Error('Option inconnue interdite');
  const mjOrigin=options.mjOrigin??MJ_ORIGIN,playerOrigin=options.playerOrigin??PLAYER_ORIGIN;
  if(mjOrigin!==MJ_ORIGIN||playerOrigin!==PLAYER_ORIGIN||mjOrigin===playerOrigin)
    throw new Error('Prévisualisation refusée : deux origines loopback fixes obligatoires');
  return Object.freeze({
    schema:PREVIEW_SCHEMA,sourceProductSha:SOURCE_PRODUCT_SHA,sourceQaSha:SOURCE_QA_SHA,
    audience:'donnees-synthetiques-exclusivement',mode:'local-no-internet',
    mj:Object.freeze({origin:mjOrigin,entry:mjOrigin+'/',allowedPaths:Object.freeze(['/','/index.html','/assets/mj.js','/assets/app.css','/assets/creators.css'])}),
    player:Object.freeze({origin:playerOrigin,entry:playerOrigin+'/',allowedPaths:Object.freeze(['/','/player.html','/assets/player.js','/assets/app.css'])}),
    navigation:NAVIGATION,
    rollback:Object.freeze({stop:'SIGINT/SIGTERM serveur local',restore:'restaurer une archive CONFIDENTIELLE via prévisualisation/confirmation ; ne pas effacer le navigateur à l’aveugle',git:'aucune mutation des branches produit ou QA'})
  });
}
export function classifyPreviewUrl(raw,{plan=getPreviewPlan()}={}) {
  if(typeof raw!=='string')return {ok:false,reason:'URL absente'};
  let url;
  try{url=new URL(raw);}catch{return {ok:false,reason:'URL invalide'};}
  if(url.username||url.password||url.search||url.hash)return {ok:false,reason:'Identifiants, query ou fragment interdits'};
  if(url.origin!==plan.mj.origin&&url.origin!==plan.player.origin)return {ok:false,reason:'Origine non autorisée'};
  const surface=url.origin===plan.mj.origin?'mj':'player';
  if(!plan[surface].allowedPaths.includes(url.pathname))return {ok:false,reason:'Route non autorisée'};
  return {ok:true,surface,pathname:url.pathname};
}
/** Readiness is not authentication. localhost may be reachable by other processes/users on this host. */
export function securityDisclosure(){return 'Aucune authentification, aucun chiffrement : données fictives uniquement ; ne jamais partager l’URL MJ, les sauvegardes privées ou le profil navigateur.';}