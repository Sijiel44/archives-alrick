import {MODEL_LEVELS} from './data-model.mjs';
const problem=(code,path)=>({ok:false,code,issues:[{code,path,message:'Port natif absent ou valeur invalide'}],executable:false});
/** A read-only native M01 gateway; delegates every computation without backup formula. */
export function previewNativeLevel(level,{progressionAtLevel}={}){
 if(!Number.isSafeInteger(level)||level<1||level>25)return problem('LEVEL_OUT_OF_RANGE','level');
 if(typeof progressionAtLevel!=='function')return problem('NATIVE_M01_UNAVAILABLE','progressionAtLevel');
 try {const result=progressionAtLevel(level);
  if(!result||result.level!==level||!Number.isFinite(result.experience))return problem('INVALID_NATIVE_RESPONSE','progressionAtLevel');
  return {ok:true,level,source:'M01.progressionAtLevel',preview:structuredClone(result),executable:false,applied:false};
 }catch{return problem('NATIVE_M01_REJECTED','progressionAtLevel');}
}
export function previewLevelReferenceMatrix(ports={}){
 const levels=MODEL_LEVELS.map(level=>previewNativeLevel(level,ports));
 return {ok:levels.every(x=>x.ok),executable:false,levels};
}
/** Separate XP suggestion, MJ decision, and sheet application. Never call grantAward. */
export function inspectNativeXpSuggestion(request,{suggestXpFromM01}={}){
 if(!request||request.approved===true||request.commit===true)return problem('XP_AUTHORITY_FORBIDDEN','request');
 if(typeof suggestXpFromM01!=='function')return problem('NATIVE_XP_UNAVAILABLE','suggestXpFromM01');
 try{const r=suggestXpFromM01(structuredClone(request));
  if(!r||r.status!=='suggested'||!Number.isSafeInteger(r.nativeSuggestedXp)||r.nativeSuggestedXp<0)return problem('INVALID_NATIVE_XP','suggestXpFromM01');
  return {ok:true,source:'MATH.suggestXpFromM01',candidateXp:r.nativeSuggestedXp,awarded:false,levelValidated:false,executable:false};
 }catch{return problem('NATIVE_XP_REJECTED','suggestXpFromM01');}
}
/** This port must be offered by COMBAT; INDEX does not build AuthorizedM03Effect. */
export function previewNativeCombat(request,{previewM03}={}){
 if(!request||request.apply===true||request.approved===true||request.effectKind==='absorption'||request.itemNumeric===true)
  return problem('NON_HOMOLOGATED_EFFECT','request');
 if(typeof previewM03!=='function')return problem('NATIVE_M03_UNAVAILABLE','previewM03');
 try{const p=previewM03(structuredClone(request));
  if(!p||typeof p!=='object'||p.executable===true||p.applied===true)return problem('INVALID_NATIVE_RESPONSE','previewM03');
  return {ok:true,source:'COMBAT.previewM03',preview:structuredClone(p),executable:false};
 }catch{return problem('NATIVE_M03_REJECTED','previewM03');}
}
