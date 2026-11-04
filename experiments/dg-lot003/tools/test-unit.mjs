import {spawnSync} from 'node:child_process';
import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(await readFile(resolve(root,'manifest.json')));
const expected=['ports','rules','catalog','storage','studio','player','creators'];
const missing=expected.filter(role=>!manifest.components.some(c=>c.role===role));
const tests=expected.map(role=>resolve(root,'tests',role));
let failures=0;
for(let i=0;i<tests.length;i++){
 try{await stat(tests[i]);}catch{console.error('NON LIVRÉ',expected[i]);failures++;continue;}
 const run=spawnSync(process.execPath,['--test',tests[i]],{encoding:'utf8',stdio:'inherit'});
 if(run.status!==0){console.error('ÉCHEC',expected[i]);failures++;}
}
if(missing.length){console.error('MODULES NON INTÉGRÉS',missing.join(', '));failures++;}
if(failures)process.exitCode=1;else console.log('TESTS UNITAIRES COMPLETS');
