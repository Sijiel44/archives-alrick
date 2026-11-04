import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(await readFile(resolve(root,'manifest.json')));
const executable=process.env.CHROMIUM_PATH || ['chromium','chromium-browser','google-chrome'].find(name=>{try{return requireCheck(name)}catch{return false}});
function requireCheck(name){const {spawnSync}=requireSpawn();return spawnSync('which',[name],{stdio:'ignore'}).status===0;}
function requireSpawn(){return {spawnSync:globalSpawnSync}}
import {spawnSync as globalSpawnSync} from 'node:child_process';
if(!executable){console.error('NON EXÉCUTÉ : Chromium absent. Définir CHROMIUM_PATH.');process.exit(2);}
const server=spawn(process.execPath,[resolve(root,'tools/serve.mjs')],{stdio:['ignore','pipe','pipe']});
let browser;
try{
 for(let i=0;i<30;i++){try{const r=await fetch('http://127.0.0.1:4173/');const p=await fetch('http://127.0.0.1:4174/');if(r.ok&&p.ok)break;}catch{}await delay(200);}
 const mj=await fetch('http://127.0.0.1:4173/');const player=await fetch('http://127.0.0.1:4174/');
 if(!mj.ok || !player.ok)throw Error('Serveurs non démarrés');
 if((await fetch('http://127.0.0.1:4174/index.html')).status!==404)throw Error('Fuite HTML MJ via joueur');
 browser=spawn(executable,['--headless=new','--no-first-run','--no-default-browser-check','--disable-gpu','--remote-debugging-port=0','--user-data-dir=/tmp/dg003-chrome-'+process.pid,'--dump-dom','http://127.0.0.1:4173/'],{stdio:['ignore','pipe','pipe']});
 let output='';let errors='';
 browser.stdout.on('data',b=>output+=b);browser.stderr.on('data',b=>errors+=b);
 const exit=await new Promise(resolve=>browser.once('close',(code)=>resolve(code)));
 if(exit!==0 || !output.includes('Studio DG-LOT-003'))throw Error('Chromium MJ : '+errors.slice(0,400));
 console.log('CHROMIUM_MJ_OK',mj.url,'joueur',player.url);
 if(!manifest.components.some(c=>c.role==='studio') || !manifest.components.some(c=>c.role==='player'))throw Error('RECETTE PARTIELLE : modules STUDIO/player absents');
 throw Error('RECETTE E2E NON IMPLÉMENTÉE : attendre QA et tests sur les interactions réelles');
} catch(e){console.error('BROWSER_FAIL',e.message);process.exitCode=1;}finally{browser?.kill();server.kill();}
