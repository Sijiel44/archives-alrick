import {spawnSync} from 'node:child_process';
import {readdir,readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(await readFile(resolve(root,'manifest.json'),'utf8'));
const roles=['ports','rules','catalog','storage','studio','player','creators'];
let failed=false;
for(const role of roles){
 const directory=resolve(root,'tests',role);
 let names;
 try{names=(await readdir(directory)).filter(n=>n.endsWith('.test.mjs')).sort();}catch{names=[];}
 if(names.length===0){console.error('NON LIVRÉ / PAS DE TEST',role);failed=true;continue;}
 const run=spawnSync(process.execPath,['--test',...names.map(n=>resolve(directory,n))],{stdio:'inherit'});
 if(run.status!==0){console.error('ÉCHEC',role);failed=true;}
 if(!manifest.components.some(c=>c.role===role)){console.error('MODULE NON INTÉGRÉ',role);failed=true;}
}
if(failed)process.exitCode=1;else console.log('TOUS TESTS UNITAIRES INTÉGRÉS OK');
