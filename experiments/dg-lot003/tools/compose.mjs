/** L003 integrator-owned composition. Services are not DOM components. */
import { resolve } from 'node:path';
const SERVICE_ROLES = new Set(['ports','rules','catalog','storage']);
const VIEW_ROLES = new Set(['studio','creators','player']);
const ROLES = new Set([...SERVICE_ROLES,...VIEW_ROLES]);
const ORIGINS = Object.freeze({mj:'http://127.0.0.1:4173',player:'http://127.0.0.1:4174'});
function requireEntry(item, repository) {
 if (!ROLES.has(item.role) || typeof item.entry!=='string' ||
     !Array.isArray(item.paths) || !item.paths.includes(item.entry) ||
     !/^[a-f0-9]{40}$/.test(item.commit ?? '') ||
     !/^[a-f0-9]{40}$/.test(item.blobSha ?? '') ||
     typeof item.branch!=='string' || item.branch.length===0) throw Error('Invalid owner provenance');
 const normalized=resolve(repository,item.entry);
 const prefix=resolve(repository,'experiments/dg-lot003/src')+'/';
 if(!normalized.startsWith(prefix))throw Error('Owner entry outside prototype src');
 if (!normalized.includes('/'+item.role+'/'))throw Error('Entry belongs to another role');
 return normalized;
}
export function makeEntry({target,manifest,repository}) {
 if(!['mj','player'].includes(target))throw Error('Invalid build target');
 const owners=manifest.components;
 if(!Array.isArray(owners) || manifest.schema!=='cer.dg003.integration-manifest.v0')throw Error('Invalid manifest');
 const used=owners.filter(item=>target==='player'?item.role==='player':item.role!=='player');
 const imports=used.map((item,i)=>`import * as owner${i} from ${JSON.stringify(requireEntry(item,repository))};`).join('\n');
 const lines=[imports,'const rootStatus=document.getElementById("status");','const slots={studio:document.getElementById("studio-root"),creators:document.getElementById("creators-root"),player:document.getElementById("player-root")};',
 `const expectedOrigin=${JSON.stringify(ORIGINS[target])};`,
 'if(location.origin!==expectedOrigin)throw Error("Origine locale non autorisée");',
 'const owners=Object.create(null);'];
 for(let i=0;i<used.length;i++)lines.push(`owners[${JSON.stringify(used[i].role)}]=owner${i};`);
 if(target==='player'){
   lines.push('if(!owners.player){rootStatus.textContent="Projection joueur indisponible — module STUDIO absent";} else {',
   'if(typeof owners.player.mount!=="function")throw Error("Export player.mount manquant");',
   'await owners.player.mount({root:slots.player,origin:location.origin,expectedMjOrigin:"http://127.0.0.1:4173"});',
   'rootStatus.textContent="Module joueur monté — recette QA requise";','}');
 }else{
   lines.push('const services=Object.create(null);',
   'if(owners.ports){if(typeof owners.ports.createPorts!=="function")throw Error("Export createPorts absent");services.ports=owners.ports.createPorts();}',
   '// No native rules, catalog or storage delegate is invented. Only actual approved bindings may be passed later.',
   'if(owners.storage)services.storage=owners.storage;',
   'if(owners.catalog)services.catalog=owners.catalog;',
   'if(owners.rules)services.rules=owners.rules;',
   'const context=Object.freeze({services,ports:services.ports,origin:location.origin,playerOrigin:"http://127.0.0.1:4174"});',
   'let mounted=0;',
   'for(const role of ["studio","creators"]){const view=owners[role];if(!view)continue;if(typeof view.mount!=="function")throw Error(role+".mount absent : wiring à adapter après contrat");await view.mount({root:slots[role],...context});mounted++;}',
   'rootStatus.textContent=mounted ? "Vues propriétaires montées — validation complète en attente" : "Prototype incomplet — vues STUDIO et ATELIERS absentes";');
 }
 return lines.join('\n');
}
