/** L004 standalone loopback build. It imports L003 owner blobs without modifying them. */
import {build} from 'esbuild';
import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {makeEntry} from '../../dg-lot003/tools/compose.mjs';
const project=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const l003=resolve(project,'../dg-lot003');
const repo=resolve(project,'../..');
const dist=resolve(project,'dist');
const ownerManifest=JSON.parse(await readFile(resolve(l003,'manifest.json'),'utf8'));
if(ownerManifest.schema!=='cer.dg003.integration-manifest.v0'||ownerManifest.components.length!==7)
 throw Error('DG004 requires the seven pinned DG003 owner modules');
const spec=JSON.parse(await readFile(resolve(project,'manifest.json'),'utf8'));
if(spec.schema!=='cer.dg004.integration-manifest.v0'||spec.baseSha!=='2ab809ef5351940e0fc272b859d10f21de894d00')
 throw Error('Wrong DG004 integration ancestry/manifest');
await rm(dist,{recursive:true,force:true,maxRetries:5,retryDelay:100});
await mkdir(resolve(dist,'assets'),{recursive:true});
const originalHTML=await readFile(resolve(l003,'index.html'),'utf8');
if(!originalHTML.includes('<div id="studio-root"></div>'))throw Error('DG003 HTML slot changed');
const html=originalHTML.replaceAll('Studio DG-LOT-003','Studio DG-LOT-004')
 .replace('<div id="studio-root"></div>','<section id="dg004-demo-root" aria-label="Mode démonstration fictif"></section><div id="studio-root"></div>');
await writeFile(resolve(dist,'index.html'),html);
await copyFile(resolve(l003,'player.html'),resolve(dist,'player.html'));
const css='body{font:1rem system-ui,sans-serif;margin:0 auto;max-width:72rem;padding:2rem;background:#f4f5f8;color:#182332}section{padding:1rem;border:1px solid #abb7c5;border-radius:.5rem;margin:1rem 0}button,input,select,textarea{font:inherit}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #286cc4}main{min-width:0}#dg004-demo-root{border:2px solid #536f8d;background:#f8fbff}#dg004-demo-root button{padding:.6rem;margin:.2rem;min-height:44px}';
await writeFile(resolve(dist,'assets/app.css'),css);
let mj=makeEntry({target:'mj',manifest:ownerManifest,repository:repo});
const mount='mountIntegratedMJ({owners,doc:document});';
if(mj.split(mount).length!==2)throw Error('DG003 MJ composition does not have one mount call');
const demoImport='import {installDemo} from '+JSON.stringify(resolve(project,'tools/demo-controller.mjs'))+';\n';
const builderImport='import {mountPreviewNavigation} from '+JSON.stringify(resolve(project,'builder/src/navigation.mjs'))+';\n';
mj=demoImport+builderImport+mj.replace(mount,'const dg004Application=mountIntegratedMJ({owners,doc:document}); installDemo(dg004Application,document); mountPreviewNavigation(document.getElementById("dg004-demo-root"));');
const sources={mj,player:makeEntry({target:'player',manifest:ownerManifest,repository:repo})};
for(const [target,source] of Object.entries(sources))
 await build({stdin:{contents:source,resolveDir:repo,sourcefile:'dg004-'+target+'.js',loader:'js'},
  bundle:true,format:'esm',platform:'browser',target:'es2022',
  outfile:resolve(dist,'assets/'+target+'.js'),logLevel:'warning'});
const creators=ownerManifest.components.find(x=>x.role==='creators');
const module=await import(pathToFileURL(resolve(repo,creators.entry)).href);
if(typeof module.CREATOR_STYLES!=='string')throw Error('CREATOR_STYLES missing');
await writeFile(resolve(dist,'assets/creators.css'),module.CREATOR_STYLES);
await writeFile(resolve(dist,'style-csp.json'),JSON.stringify({hash:null}));
await writeFile(resolve(dist,'manifest.json'),JSON.stringify({schema:spec.schema,
 sourceSha:spec.baseSha,mode:'local-fake-opt-in',ownerBlobs:ownerManifest.components.map(x=>({role:x.role,blobSha:x.blobSha}))},null,2));
console.log('DG004_BUILD_OK',dist,'inheritedModules',ownerManifest.components.length,'publicHosting',false);
