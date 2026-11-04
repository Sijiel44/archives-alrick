import { build } from 'esbuild';
import { readFile, writeFile, mkdir, copyFile, rm, stat } from 'node:fs/promises';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repository = resolve(project, '..', '..');
const dist = resolve(project, 'dist');
const manifest = JSON.parse(await readFile(resolve(project, 'manifest.json'),'utf8'));
if (manifest.schema !== 'cer.dg003.integration-manifest.v0' || !Array.isArray(manifest.components)) throw Error('Manifeste invalide');
const roles = new Set(['ports','rules','catalog','storage','studio','player','creators']);
for (const component of manifest.components) {
  if (!roles.has(component.role) || !/^[a-f0-9]{40}$/.test(component.commit ?? '') || !/^[a-f0-9]{40}$/.test(component.blobSha ?? '') || typeof component.branch !== 'string' || !Array.isArray(component.paths)) throw Error('Provenance incomplète');
  const file = resolve(repository, component.entry ?? '');
  if (!file.startsWith(resolve(project,'src') + sep)) throw Error('Entrée hors périmètre');
  await stat(file);
}
await rm(dist,{recursive:true,force:true});
await mkdir(resolve(dist,'assets'),{recursive:true});
await Promise.all(['index.html','player.html'].map(f=>copyFile(resolve(project,f),resolve(dist,f))));
await writeFile(resolve(dist,'assets','app.css'), 'body{font:1rem system-ui,sans-serif;margin:0 auto;max-width:72rem;padding:2rem;background:#f4f5f8;color:#182332}section{padding:1rem;border:1px solid #abb7c5;border-radius:.5rem;margin:1rem 0}button,input,select,textarea{font:inherit}button:focus-visible,input:focus-visible{outline:3px solid #286cc4}main{min-width:0}');
// Owner entry modules are loaded only after their exact origin and SHA are recorded.
const forRole = role => manifest.components.filter(c=>c.role===role);
function source(role) {
 const entries=forRole(role);
 const imports=entries.map((c,i)=>`import * as mod${i} from ${JSON.stringify(resolve(repository,c.entry))};`).join('\n');
 const mounts=entries.map((c,i)=>`if(typeof mod${i}.mount === 'function') await mod${i}.mount({root:document.getElementById(${JSON.stringify(c.slot ?? (role==='mj'?'studio-root':'player-root'))}),role:${JSON.stringify(role)},origin:location.origin}); else throw Error('Export mount manquant : '+${JSON.stringify(c.entry)});`).join('\n');
 return imports+'\n'+`const root=document.getElementById('status');if(root)root.textContent=${JSON.stringify(entries.length ? 'Modules enregistrés (validation fonctionnelle requise)' : 'Prototype incomplet — modules propriétaires non reçus')};\n`+mounts;
}
const mj = manifest.components.filter(c=>c.role!=='player');
for (const [name, entries] of [['mj',mj],['player',forRole('player')]]) {
 const imports=entries.map((c,i)=>`import * as module${i} from ${JSON.stringify(resolve(repository,c.entry))};`).join('\n');
 const mounts=entries.map((c,i)=>`if(typeof module${i}.mount !== 'function')throw new Error('mount manquant : '+${JSON.stringify(c.entry)});await module${i}.mount({root:document.getElementById(${JSON.stringify(c.slot ?? (name==='mj'?'studio-root':'player-root'))}),origin:location.origin});`).join('\n');
 const js = imports + `\nconst status=document.getElementById('status');status.textContent=${JSON.stringify(entries.length ? 'Modules chargés — vérifier les tests' : 'Prototype incomplet — modules non intégrés')};\n` + `try {\n${mounts}\n} catch(error){status.textContent='Échec du module : '+error.message;throw error;}\n`;
 await build({stdin:{contents:js,resolveDir:repository,sourcefile:name+'-entry.js',loader:'js'},bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:resolve(dist,'assets',name+'.js'),logLevel:'warning'});
}
await writeFile(resolve(dist,'manifest.json'), JSON.stringify(manifest,null,2));
console.log('BUILD_OK',dist,'modules',manifest.components.length,'qualification',manifest.components.length?'À TESTER':'INCOMPLET');
