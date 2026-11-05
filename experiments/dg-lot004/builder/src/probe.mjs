/** Real HTTP, read-only checks on a running L003 dual-loopback preview. */
import {getPreviewPlan} from './contract.mjs';
export async function probeLocalPreview({fetchImpl=globalThis.fetch,plan=getPreviewPlan(),timeoutMs=2000}={}){
  if(typeof fetchImpl!=='function')throw new TypeError('fetch requis');
  const checks=[
    ['MJ','/',200,'text/html'],['Joueur','/',200,'text/html'],
    ['MJ','/assets/mj.js',200,'text/javascript'],['Joueur','/assets/player.js',200,'text/javascript'],
    ['MJ','/player.html',404,null],['Joueur','/index.html',404,null],
    ['Joueur','/assets/mj.js',404,null],['Joueur','/manifest.json',404,null]
  ];
  const result=[];
  for(const [role,path,expected,mime] of checks){
    const surface=role==='MJ'?plan.mj:plan.player;
    const url=surface.origin+path;
    try{
      const response=await fetchImpl(url,{redirect:'manual',signal:AbortSignal.timeout(timeoutMs)});
      const csp=response.headers.get('content-security-policy')??'';
      const cache=response.headers.get('cache-control')??'';
      const ct=response.headers.get('content-type')??'';
      const noSniff=response.headers.get('x-content-type-options')??'';
      const referrer=response.headers.get('referrer-policy')??'';
      const origin=response.url?new URL(response.url).origin:surface.origin;
      const ok=response.status===expected&&origin===surface.origin&&
        (response.status!==200||(
          ct.includes(mime)&&cache.includes('no-store')&&
          csp.includes("default-src 'none'")&&csp.includes("script-src 'self'")&&
          csp.includes("connect-src 'none'")&&csp.includes("frame-ancestors 'none'")&&
          noSniff==='nosniff'&&referrer==='no-referrer'));
      result.push({role,path,expected,status:response.status,ok});
      await response.body?.cancel?.();
    }catch(error){result.push({role,path,expected,status:null,ok:false,reason:String(error.message??error)});}
  }
  return {ok:result.every(item=>item.ok),originMJ:plan.mj.origin,originPlayer:plan.player.origin,checks:result};
}