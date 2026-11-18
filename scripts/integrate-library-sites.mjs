import assert from 'node:assert/strict';
import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import YAML from 'yaml';
import {mergeLibrary} from '../publication/library-model.mjs';

// Additive integration only: retain the current Site's articles, images and Studio.
const root=path.resolve(process.argv[2]??'.publication/chroniques');
const appPath=path.join(root,'app.mjs');
let app=await readFile(appPath,'utf8');
const names=[...app.match(/const readingEntries = \[([^;]+)\];/)?.[1].matchAll(/\.\.\.(\w+)/g)??[]].map(m=>m[1]);
assert(names.length,'Current Site reading catalogue not found');
const readings=[];
for(const name of names){
 const declaration=new RegExp(`import \\{[^}]*\\b${name}\\b[^}]*\\} from '([^']+)'`).exec(app);
 assert(declaration,`Import absent: ${name}`);
 const filename=path.resolve(root,declaration[1]);assert(filename.startsWith(root+path.sep));
 const module=await import(pathToFileURL(filename));assert(Array.isArray(module[name]));readings.push(...module[name]);
}
const localImage=(image,base='./')=>{
 if(!image || /^(?:[a-z]+:|\/\/)/i.test(image) || image.includes('..'))return undefined;
 return image.startsWith('/')?`.${image}`:base+image.replace(/^\.\//,'');
};
const prepared=[];
for(const entry of readings){
 let fm={};
 if(entry.articlePath){const filename=path.resolve(root,entry.articlePath);assert(filename.startsWith(root+path.sep));const text=await readFile(filename,'utf8');const front=/^---\r?\n([\s\S]*?)\r?\n---/.exec(text);if(front)fm=YAML.parse(front[1]);}
 prepared.push({...entry,hidden:fm.publish===false || fm.spoilers===true || fm.unlisted===true || /révélations? de campagne|spoilers?/i.test(entry.notice??''),
   image:localImage(entry.art?.src),imageAlt:entry.art?.alt,href:`./#fiche/${encodeURIComponent(entry.id)}`});
}
const game=JSON.parse(await readFile(path.join(root,'studio/public-documents.json'),'utf8')).entries.map(entry=>({...entry,hidden: /révélations? sur l’histoire|révélations? de campagne|spoilers?/i.test(entry.description??''),image:localImage(entry.image,'./studio/'),href:`./studio/fiches.html#fiche/${encodeURIComponent(entry.id)}`}));
const entries=mergeLibrary(prepared,game);
await writeFile(path.join(root,'library-index.json'),JSON.stringify({schema:'entre-rives.library.v1',entries}));
for(const filename of ['bibliotheque.html','bibliotheque.css','bibliotheque.mjs','library-model.mjs'])await copyFile(`publication/${filename}`,path.join(root,filename));
// Keep all old deep links. Only discovery navigation moves to the common library.
if(!app.includes('function commonLibraryURL(')){
 app=app.replace('function navigate(next, moveFocus = true) {',`function commonLibraryURL(category = '') {
  const back = new URLSearchParams(location.search).get('bibliotheque') ?? '';
  const filters = new URLSearchParams(back);
  if (category) filters.set('category', category);
  return './bibliotheque.html' + (filters.size ? '?' + filters : '');
}
function navigate(next, moveFocus = true) {
  if (next === 'library' && !location.hash.startsWith('#fiche/')) { location.assign(commonLibraryURL()); return; }`);
 app=app.replace("if (location.hash === '#univers') openUniverse();","if (location.hash === '#univers') { location.replace(commonLibraryURL('univers')); return; }");
 app=app.replace("else if (location.hash === '#bestiaire') openBestiary();","else if (location.hash === '#bestiaire') { location.replace(commonLibraryURL('bestiaire')); return; }");
 // Buttons to Universe/Bestiary must not lose their category.
 app=app.replace('function openUniverse() {',"function openUniverse() { location.assign(commonLibraryURL('univers')); return;");
 app=app.replace('function openBestiary() {',"function openBestiary() { location.assign(commonLibraryURL('bestiaire')); return;");
 await writeFile(appPath,app);
}
await writeFile(appPath,app.replace(/return; +\r?\n/g,'return;\n'));
let reader=await readFile(path.join(root,'studio/fiches.html'),'utf8');
if(!reader.includes('id="common-library"'))reader=reader.replace('<main id="content">','<main id="content"><p><a id="common-library" href="../bibliotheque.html">← Bibliothèque commune</a></p>');
await writeFile(path.join(root,'studio/fiches.html'),reader);
let studio=await readFile(path.join(root,'studio/index.html'),'utf8');
if(!studio.includes('id="common-library-link"'))studio=studio.replace('<h1 id="library-title" tabindex="-1">Bibliothèque</h1>','<h1 id="library-title" tabindex="-1">Bibliothèque</h1><p><a id="common-library-link" href="../bibliotheque.html">Explorer toute la bibliothèque commune →</a></p>');
await writeFile(path.join(root,'studio/index.html'),studio);
let readerJS=await readFile(path.join(root,'studio/fiches.mjs'),'utf8');
if(!readerJS.includes('common-library')){
 readerJS += `\nconst commonLibrary = document.getElementById('common-library');
if (commonLibrary) {
 const filters = new URLSearchParams(new URLSearchParams(location.search).get('bibliotheque') ?? '');
 commonLibrary.href = '../bibliotheque.html' + (filters.size ? '?' + filters : '');
}\n`;
 await writeFile(path.join(root,'studio/fiches.mjs'),readerJS);
}
const report={reading:readings.length,hiddenReading:prepared.filter(e=>e.hidden).length,game:game.length,hiddenGame:game.filter(e=>e.hidden).length,unique:entries.length,paired:entries.filter(e=>e.variants.length>1).length};
await mkdir('.publication',{recursive:true});await writeFile('.publication/library-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
