/** DG003 L003-01..10. Real MJ/player pages; no product mock and no secret window API. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {build} from 'esbuild';
import {launch,readDownload,playerNoLeak,noCanary,CANARIES} from './qa-browser.mjs';

const repo=process.cwd(), folder=path.dirname(new URL(import.meta.url).pathname);
const integration=process.env.DG003_INTEGRATION_HEAD;
assert.match(integration??'',/^[a-f0-9]{40}$/,'Provide the final frozen DG003_INTEGRATION_HEAD');
const git=(...args)=>spawnSync('git',args,{cwd:repo,encoding:'utf8'});
const rev=git('rev-parse','HEAD');assert.equal(rev.status,0,'Git checkout required');
const testedHead=rev.stdout.trim();assert.match(testedHead,/^[a-f0-9]{40}$/);
assert.equal(git('cat-file','-e',`${integration}^{commit}`).status,0,'Integrated HEAD absent locally');
assert.equal(git('merge-base','--is-ancestor',integration,testedHead).status,0,'QA checkout must descend from integrated HEAD');
const expectedTestedHead=process.env.DG003_TESTED_HEAD;
assert.match(expectedTestedHead??'',/^[a-f0-9]{40}$/,'DG003_TESTED_HEAD must be provided by CI or operator');
assert.equal(testedHead,expectedTestedHead,'Checkout HEAD differs from DG003_TESTED_HEAD');
// GITHUB_SHA on pull_request may identify GitHub's virtual merge commit. Record, do not compare.

const evidence={sourceIntegrationHead:integration,testedHead,expectedTestedHead,githubEventSha:process.env.GITHUB_SHA??null,githubEventName:process.env.GITHUB_EVENT_NAME??null,ciRunId:process.env.GITHUB_RUN_ID??null,
 ciUrl:process.env.GITHUB_RUN_ID?`https://github.com/${process.env.GITHUB_REPOSITORY??'Sijiel44/archives-alrick'}/actions/runs/${process.env.GITHUB_RUN_ID}`:null,
 environment:'Node/Chromium; HTTP 127.0.0.1:4173 / 4174',results:[]};
const digest=b=>createHash('sha256').update(b).digest('hex');
function assertByteExact(actual,expected,context){
 const a=Buffer.from(actual),b=Buffer.from(expected);
 const hashA=digest(a),hashB=digest(b);
 if(a.length===b.length && Buffer.compare(a,b)===0)return;
 let offset=0;const limit=Math.min(a.length,b.length);
 while(offset<limit && a[offset]===b[offset])offset++;
 const actualByte=offset<a.length?a[offset]:null,expectedByte=offset<b.length?b[offset]:null;
 assert.fail(`${context}: BYTE_EXACT_MISMATCH actualBytes=${a.length} expectedBytes=${b.length} actualSHA256=${hashA} expectedSHA256=${hashB} firstDiffOffset=${offset} actualByte=${actualByte} expectedByte=${expectedByte}`);
}
const fixture={};for(const name of ['v2','v3','multi','collision','invalid'])fixture[name]=await readFile(path.join(folder,'fixtures',`storage-compatible-${name}.json`));
for(const key of ['v2','v3','multi']){const v=JSON.parse(fixture[key]);assert(['alrick.sheets.v2','alrick.sheets.v3'].includes(v.schema));assert(Array.isArray(v.sheets)&&v.sheets.length>0)}
const contract=JSON.parse(await readFile(path.join(folder,'integration-contract.json'),'utf8'));
assert.equal(contract.schema,'cer.dg003.qa.e2e-contract.v6');
assert.equal(contract.inspectedSourceHead,'2ab809ef5351940e0fc272b859d10f21de894d00');
assert.equal(contract.origins.mj,'http://127.0.0.1:4173');
assert.equal(contract.origins.player,'http://127.0.0.1:4174');
assert.equal(contract.tests.entry,'dg003-e2e.test.mjs');
assert.equal(contract.tests.integrationHeadFrom,'DG003_INTEGRATION_HEAD');
assert.equal(contract.tests.testedHeadFrom,'DG003_TESTED_HEAD');
const E=s=>JSON.stringify(s);
const sel={campaign:'input[aria-label="Nom de la campagne"]',file:'input[aria-label="Fichier PJ v2/v3"]',
 newScene:'input[aria-label="Titre de nouvelle scène"]',description:'textarea[aria-label="Description destinée à être proposée au public"]',
 notes:'textarea[aria-label="Notes privées MJ"]',sceneTitle:'input[aria-label="Titre de la scène"]',
 sceneDescription:'textarea[aria-label="Description publique de la scène"]',sceneNotes:'textarea[aria-label="Notes MJ — privées"]',
 creature:'input[aria-label="Code ou référence créature"]', restore:'input[aria-label="Fichier de restauration confidentiel"]'};
assert.deepEqual(sel,contract.selectors,'QA selectors and contract disagree');
const buttonExpr=(label,scope='#studio-root')=>`Array.from(document.querySelectorAll(${E(`${scope} button`)})).find(x=>x.textContent.trim()===${E(label)})`;
async function clickText(c,label,scope='#studio-root'){
 const expr=buttonExpr(label,scope);
 await c.wait(`Boolean(${expr})`);
 await c.evaluate(`(()=>{const b=${expr};if(!b || b.disabled)throw Error('Missing/disabled button '+${E(label)});b.click();return true})()`);
}
async function text(c,match,scope='#studio-root'){return c.evaluate(`document.querySelector(${E(scope)})?.textContent.includes(${E(match)})===true`)}
async function waitText(c,value,scope='#studio-root'){await c.wait(`document.querySelector(${E(scope)})?.textContent.includes(${E(value)})===true`,15000)}
async function tickLabel(c,label){await c.evaluate(`(()=>{const l=Array.from(document.querySelectorAll('#studio-root label')).find(x=>x.textContent.trim()===${E(label)});const b=l?.querySelector('input[type="checkbox"]');if(!b)throw Error('Checkbox missing '+${E(label)});if(!b.checked)b.click();return true})()`)}
async function publicFlags(c){return c.evaluate(`(()=>Object.fromEntries(Array.from(document.querySelectorAll('#studio-root label')).filter(x=>['Partager le titre de la scène','Partager la description publique'].includes(x.textContent.trim())).map(x=>[x.textContent.trim(),x.querySelector('input[type="checkbox"]')?.checked])))()`)}
async function consentAfterReady(c){
 const before=await publicFlags(c);
 assert.equal(before['Partager le titre de la scène'],false,'Title must require renewed consent after popup READY');
 assert.equal(before['Partager la description publique'],false,'Description must require renewed consent after popup READY');
 console.log('[QA_PRE_READY_SELECTION_RESET]',JSON.stringify(before));
 await tickLabel(c,'Partager le titre de la scène');
 await tickLabel(c,'Partager la description publique');
 const chosen=await publicFlags(c);
 assert.equal(chosen['Partager le titre de la scène'],true,'Public title not explicitly selected after READY');
 assert.equal(chosen['Partager la description publique'],true,'Public description not explicitly selected after READY');
 console.log('[QA_CONSENT_POST_READY]',JSON.stringify(chosen));
}
async function create(c){await c.fill(sel.campaign,`QA-l003-${Date.now()}`);await clickText(c,'Créer campagne');await waitText(c,'Campagne active :')}
async function scene(c,{title='QA titre public sélectionné',description='QA description publique sélectionnée',note=CANARIES.join(' ')}={}){
 await c.fill(sel.newScene,title);await c.fill(sel.description,description);await c.fill(sel.notes,note);
 await clickText(c,'Créer scène');await c.wait(`Boolean(document.querySelector(${E(sel.sceneNotes)}))`);
}
async function upload(c,file){await c.upload(sel.file,file);await clickText(c,'Prévisualiser PJ')}
async function accept(c,expected){await c.wait(`Boolean(${buttonExpr('Accepter copie PJ')})`);await waitText(c,'À importer :');await clickText(c,'Accepter copie PJ');await waitText(c,`PJ copiés :`);await waitText(c,expected)}
async function download(c,label,folder){const before=await import('node:fs/promises').then(m=>m.readdir(folder));await clickText(c,label);return readDownload(folder,await before,15000)}
function archiveCheck(bytes,requested){const payload=JSON.parse(bytes.toString('utf8'));assert.equal(payload.kind,'cer.studio.dg003.private-export.v0');
 const chars=payload.project?.characters;assert(Array.isArray(chars),'STORAGE character records missing');
 for(const key of requested){const original=fixture[key],doc=JSON.parse(original),found=chars.filter(c=>c.source?.sha256===digest(original));
  assert.equal(found.length,doc.sheets.length,`${key}: expected one character per sheet, raw document repetition legal`);
  for(const sheet of doc.sheets){const c=found.find(v=>v.sourceId===sheet.id);assert(c,`Missing ${sheet.id}`);
   assert.deepEqual(Buffer.from(c.source.base64,'base64'),original,`${key}: raw bytes changed`);
   assert.deepEqual(c.source.sheetIds,doc.sheets.map(s=>s.id));assert.equal(c.source.byteLength,original.length);
   assert.equal(c.source.sha256,digest(original));assert.deepEqual(c.sheet,sheet);
   assert.notEqual(c.id,c.sourceId,'Instance and source IDs must differ');}
 }
 return payload;
}
async function native(){const entry=path.join(repo,'quartz/components/scripts/atelier5d6-combat-m03.ts');const out=await build({entryPoints:[entry],bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent'});
 return import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'))}
const resultOf=async(c,selector)=>JSON.parse(await c.evaluate(`document.querySelector(${E(selector)})?.textContent`));
const outfile=process.env.DG003_QA_EVIDENCE_PATH??path.join(tmpdir(),`dg003-qa-${testedHead.slice(0,12)}.json`);
async function persistEvidence(){await writeFile(outfile,JSON.stringify(evidence,null,2));console.log('[QA_EVIDENCE_WRITTEN]',outfile,'count=',evidence.results.length)}
async function run(id,fn){
 await test(id,{timeout:180000},async()=>{
  const began=new Date().toISOString();let browser=null;let failure=null;let status='NON EXÉCUTÉ';
  console.log('[QA_SCENARIO_BEGIN]',id,'testedHead=',testedHead,'at=',began);
  try{
   browser=await launch({});
   status='FAIL'; // A browser actually launched; assertion failures remain failures.
   await fn(browser);
   status='PASS';
  }catch(e){failure=e;console.error('[QA_SCENARIO_ERROR]',id,String(e?.stack??e))}
  finally{
   if(browser){try{await browser.close()}catch(e){console.error('[QA_CHROME_CLEANUP_ERROR]',id,String(e));failure??=e;status='FAIL'}}
   const record={id,status,startedAt:began,finishedAt:new Date().toISOString(),
    message:failure?String(failure?.stack??failure):null};
   evidence.results.push(record);
   await persistEvidence(); // Always record the scenario, including FAIL and infra NON EXÉCUTÉ.
   console.log('[QA_SCENARIO_END]',id,status);
  }
  if(failure)throw failure;
  if(status!=='PASS')throw Error('Scenario not executed: '+id);
 });
}

await run('L003-01 real HTTP/build/DOM',async s=>{
 const a=await s.clients.mj.inspect();assert.equal(new URL(a.url).origin,'http://127.0.0.1:4173');
 assert(await text(s.clients.mj,'Studio MJ — prototype DG-LOT-003'));
 assert(!a.html.includes('Chargement…'),'MJ bootstrap stuck');
});
await run('L003-02 two scenes A/B, reselect A, persisted selection, CLEAR and no auto-publication',async s=>{
 const c=s.clients.mj;
 const A='QA scène A sélection persistante',B='QA scène B momentanée';
 await create(c);
 await scene(c,{title:A,description:'Description A publique sans envoi automatique'});
 await scene(c,{title:B,description:'Description B publiée puis effacée'});
 // True browser localStorage, written by STORAGE through the integrated app (no component hook).
 const persisted=E('cer.dg003.private.campaign.v0');
 const archiveInfo=`(()=>{try{const v=JSON.parse(localStorage.getItem(${persisted}));const p=JSON.parse(v.raw).project;return {scenes:p.scenes.map(x=>({id:x.id,title:x.title})),active:p.__cer_dg003_studio_projection_v0?.fields?.activeSceneId}}catch{return null}})()`;
 await c.wait(`(${archiveInfo})?.scenes?.length===2`,18000);
 // Pre-connection selection is erased by the real PLAYER_READY render: observe it, do not treat as leaked content.
 await tickLabel(c,'Partager le titre de la scène');
 await tickLabel(c,'Partager la description publique');
 await s.openPlayerFromMJ(null,{buttonText:'Ouvrir la fenêtre joueur'});
 await c.wait(`document.querySelector('#studio-root')?.textContent.includes('Fenêtre joueur connectée.')===true`);
 await consentAfterReady(c);
 await clickText(c,'Publier uniquement la sélection');
 const player=s.clients.player;
 await player.wait(`document.querySelector('#player-root h2')?.textContent===${E(B)}`);
 const sceneAId=await c.evaluate(`(()=>Array.from(document.querySelectorAll('select[aria-label="Scène active"] option')).find(x=>x.textContent===${E(A)})?.value)()`);
 assert(sceneAId,'Scene A absent from actual selector');
 await c.evaluate(`(()=>{const e=document.querySelector('select[aria-label="Scène active"]');e.value=${E(sceneAId)};e.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
 await player.wait(`document.querySelector('#player-root')?.textContent.includes('Aucune information publique transmise.')===true`);
 const playerEvents=(await player.inspect()).events;
 assert(playerEvents.some(e=>e.type==='incoming'&&e.data?.includes('cer.dg003.player.clear')),
  'Expected an actual player CLEAR after switching B -> A');
 const showCount=playerEvents.filter(e=>e.type==='incoming'&&e.data?.includes('cer.dg003.player.show')).length;
 // Switching scenes must reset the public sharing checkboxes and must persist active A.
 const sharing=`(()=>Array.from(document.querySelectorAll('#studio-root label')).filter(x=>['Partager le titre de la scène','Partager la description publique'].includes(x.textContent.trim())).every(x=>x.querySelector('input[type="checkbox"]')?.checked===false))()`;
 await c.wait(sharing);
 await c.wait(`(${archiveInfo})?.active===${E(sceneAId)}`,18000);
 const beforeReload=await c.evaluate(archiveInfo);assert.equal(beforeReload.active,sceneAId);
 await c.goto(s.mj);
 // Studio deliberately restores only after an explicit real UI gesture.
 await clickText(c,'Recharger campagne');
 await c.wait(`Boolean(document.querySelector('select[aria-label="Scène active"]'))`);
 assert.equal(await c.evaluate(`document.querySelector('select[aria-label="Scène active"]')?.value`),sceneAId,
  'Scene A not active after true browser page reload');
 assert.equal(await c.evaluate(`document.querySelector(${E(sel.sceneTitle)})?.value`),A);
 assert.equal(await c.evaluate(sharing),true,'Public selection not reset after reload');
 assert.equal(await player.evaluate(`document.querySelector('#player-root')?.textContent.includes('Aucune information publique transmise.')`),true,
  'Player content unexpectedly returned after MJ reload');
 const afterEvents=(await player.inspect()).events;
 assert.equal(afterEvents.filter(e=>e.type==='incoming'&&e.data?.includes('cer.dg003.player.show')).length,showCount,
  'Unexpected automatic publication after reload');
});
await run('L003-03 raw v2/v3 and multi-sheet explicit refusal',async s=>{
 const c=s.clients.mj;await create(c);
 for(const [key,label] of [['v2','v2-hero'],['v3','v3-hero']]){const f=path.join(folder,'fixtures',`storage-compatible-${key}.json`);await upload(c,f);await accept(c,label)}
 const before=await download(c,'Exporter campagne CONFIDENTIELLE',s.downloads);archiveCheck(before.raw,['v2','v3']);
 await upload(c,path.join(folder,'fixtures','storage-compatible-multi.json'));await waitText(c,'Import multi-fiches refusé');
 const after=await download(c,'Exporter campagne CONFIDENTIELLE',s.downloads);assertByteExact(after.raw,before.raw,'Rejected multisheet import mutated archive');
 archiveCheck(after.raw,['v2','v3']);assert(!JSON.parse(after.raw).project.characters.some(x=>x.source?.sha256===digest(fixture.multi)));
});
await run('L003-04 creature source/instance isolation',async s=>{
 const c=s.clients.mj;await create(c);await c.fill(sel.creature,'fixture-source-001');await clickText(c,'Prévisualiser référence');await waitText(c,'fixture-profile-001');await clickText(c,'Créer copie d’instance');
 const d=await download(c,'Exporter campagne CONFIDENTIELLE',s.downloads),p=JSON.parse(d.raw);const creature=p.project.creatures?.[0];
 assert(creature,'Creature absent');assert.equal(creature.source.profileId,'fixture-profile-001');assert.equal(creature.source.ruleset,'m03');assert.notEqual(creature.id,creature.source.profileId);assert.notEqual(creature.id,creature.source.documentId);
 // Genuine duplicate instance ID: import one sheet, then preview the same sheet again.
 await upload(c,path.join(folder,'fixtures','storage-compatible-v3.json'));await accept(c,'v3-hero');
 const stable=await download(c,'Exporter campagne CONFIDENTIELLE',s.downloads);
 await upload(c,path.join(folder,'fixtures','storage-compatible-collision.json'));
 await waitText(c,'ID déjà présent');
 const afterward=await download(c,'Exporter campagne CONFIDENTIELLE',s.downloads);
 assertByteExact(afterward.raw,stable.raw,'Collision altered campaign');
});
await run('L003-05 genuine opener public-positive and private-negative',async s=>{
 const mj=s.clients.mj;await create(mj);await scene(mj);await tickLabel(mj,'Partager le titre de la scène');await tickLabel(mj,'Partager la description publique');
 const privateFile=await download(mj,'Exporter campagne CONFIDENTIELLE',s.downloads);assert(privateFile.raw.toString('utf8').includes(CANARIES[0]),'Private canary not persisted');
 const popup=await s.openPlayerFromMJ(null,{buttonText:'Ouvrir la fenêtre joueur'});
 assert(popup.playerTargetId);await mj.wait(`document.querySelector('#studio-root')?.textContent.includes('Fenêtre joueur connectée.')===true`);
 await consentAfterReady(mj);
 await clickText(mj,'Publier uniquement la sélection');const player=s.clients.player;
 await player.wait(`document.querySelector('#player-root h2')?.textContent===${E('QA titre public sélectionné')}`);
 await player.wait(`Array.from(document.querySelectorAll('#player-root p')).some(x=>x.textContent===${E('QA description publique sélectionnée')})`);
 const publicFile=await download(mj,'Exporter projection publique',s.downloads);const publicObj=JSON.parse(publicFile.raw);
 assert.equal(publicObj.scene.title,'QA titre public sélectionné');assert.equal(publicObj.scene.description,'QA description publique sélectionnée');
 noCanary(publicFile.raw.toString('utf8'),'public export');await playerNoLeak(s,publicFile.raw.toString('utf8'));
});
await run('L003-07 three real creator forms persisted',async s=>{
 const c=s.clients.mj;await create(c);
 for(const [kind,name] of [['capacity','QA capacité descriptive'],['spell','QA sort descriptif'],['item','QA objet descriptif']]){
  const root=`#creators-root form[data-creator-kind="${kind}"]`;
  const tab=kind==='capacity'?'Capacité':kind==='spell'?'Sort':'Objet';await clickText(c,tab,'#creators-root');
  for(const [field,value] of Object.entries({name,description:'Description fictive sans effet mécanique.',limitations:'Usage narratif uniquement',provenance:'QA DG003',version:'1.0.0'}))await c.fill(`${root} [name="${field}"]`,value);
  await clickText(c,'Enregistrer localement',root);await waitText(c,'Enregistré localement',root);
 }
 await c.goto(s.mj);for(const name of ['QA capacité descriptive','QA sort descriptif','QA objet descriptif'])await waitText(c,name,'#catalog-saved');
});
await run('L003-08 native M03 parity; unavailable families not invokable',async s=>{
 const c=s.clients.mj;await create(c);await scene(c);await clickText(c,'Mode expert');await clickText(c,'Prévisualiser calcul M03 natif autorisé');
 await c.wait(`document.querySelector('#native-preview-details')?.hidden===false`);
 const args=await resultOf(c,'#native-preview-input'),wrapper=await resultOf(c,'#native-preview-result');
 assert.equal(args.kind,'combat');assert(args.combat);assert.equal(wrapper.status,'ok');assert.equal(wrapper.engine,'M03');assert.equal(wrapper.applied,false);
 const m03=await native(),direct=m03.resolveCombatM03(args.combat);assert.deepEqual(wrapper.result,direct,'Wrapper M03 output != native resolver');
 assert(await text(c,'Indisponible — règle/validateur non homologué pour absorption M03, objet numérique, Autorités 25+, débits mana/charges'));
 for(const field of await c.evaluate(`Array.from(document.querySelectorAll('#creators-root .cer-restricted input')).map(e=>({disabled:e.disabled,checked:e.checked}))`))assert(field.disabled&&!field.checked,'Unauthorized numeric creator field active');
});
await run('L003-09 keyboard labels/focus',async s=>{
 const c=s.clients.mj;await c.key('Tab');const focused=await c.evaluate(`Boolean(document.activeElement && document.activeElement!==document.body && document.activeElement.matches('button,input,textarea,select,a'))`);assert(focused);
 const labels=await c.evaluate(`Array.from(document.querySelectorAll('#studio-root input,#studio-root textarea,#studio-root select,#creators-root input,#creators-root textarea')).filter(x=>!x.disabled).every(x=>Boolean(x.labels?.length||x.getAttribute('aria-label')||x.getAttribute('aria-labelledby')))`);assert(labels,'Missing accessible labels');
});
await run('L003-10 exact SHA provenance',async s=>{
 const a=await s.clients.mj.inspect();assert.equal(new URL(a.url).origin,'http://127.0.0.1:4173');assert.equal(git('merge-base','--is-ancestor',integration,testedHead).status,0);
 assert.equal(git('rev-parse','HEAD').stdout.trim(),testedHead);
});
await run('L003-06 real STORAGE 6 MiB private restore + persistence + byte-exact reexport',async s=>{
 const c=s.clients.mj;
 await create(c);
 for(const [key,label] of [['v2','v2-hero'],['v3','v3-hero']]){
  await upload(c,path.join(folder,'fixtures',`storage-compatible-${key}.json`));await accept(c,label);
 }
 const baseline=await download(c,'Exporter campagne CONFIDENTIELLE',s.downloads);
 archiveCheck(baseline.raw,['v2','v3']);
 const original=JSON.parse(baseline.raw.toString('utf8'));
 assert.equal(original.kind,'cer.studio.dg003.private-export.v0');
 // Generate a >5 MiB document at runtime FROM the genuine UI archive using
 // ARCHIVES' actual production export module, not a product mock / handwritten serializer.
 const storageModule=pathToFileURL(path.join(repo,'experiments/dg-lot003/src/storage/storage.mjs')).href;
 const {exportPrivate:storageExport}=await import(storageModule);
 const project=structuredClone(original.project);
 const marker='DG003_QA_SYNTHETIC_OPAQUE_V7';
 project.qaUnknownLargeExtension={marker,payload:'Q'.repeat(6*1024*1024)};
 const generated=await storageExport(project);
 assert.equal(generated.confidential,true);
 assert(generated.bytes.length>5*1024*1024,`Generated backup unexpectedly <=5MiB: ${generated.bytes.length}`);
 assert(generated.bytes.length<16*1024*1024,'Synthetic backup exceeds ARCHIVES 16MiB limit');
 assert.equal(generated.sha256,digest(generated.bytes));
 const largePath=path.join(s.downloads,'QA_SYNTHETIC_PRIVATE_6M.json');
 await writeFile(largePath,generated.bytes);
 const storedBefore=await c.evaluate(`localStorage.getItem('cer.dg003.private.campaign.v0')`);
 await c.upload(sel.restore,largePath);
 await clickText(c,'Prévisualiser restauration');
 const status=`document.querySelector('#studio-root [role="status"]')?.textContent||''`;
 // Fail CLOSED: rejected oversized files or browser quota must not be misreported as PASS.
 // A failure branch still proves that the previous browser state and export are intact.
 const isPreview=await c.evaluate(`document.querySelector('#studio-root')?.textContent.includes('Restauration proposée :')===true`);
 if(!isPreview){
  try{await c.wait(`document.querySelector('#studio-root')?.textContent.includes('Restauration proposée :')===true`,7000)}catch{}
 }
 if(!await text(c,'Restauration proposée :')){
  const current=await download(c,'Exporter campagne CONFIDENTIELLE',s.downloads);
  assertByteExact(current.raw,baseline.raw,'Failed preview destroyed prior campaign');
  assert.equal(await c.evaluate(`localStorage.getItem('cer.dg003.private.campaign.v0')`),storedBefore,
   'Failed preview changed persisted campaign');
  assert.fail('P1: >5MiB native ARCHIVES backup was refused by the real Studio UI: '+await c.evaluate(status));
 }
 await clickText(c,'Confirmer restauration');
 try{await c.wait(`document.querySelector('#studio-root [role="status"]')?.textContent.includes('Campagne restaurée')===true`,18000)}catch{}
 const success=await c.evaluate(`(${status}).includes('Campagne restaurée')`);
 if(!success){
  const current=await download(c,'Exporter campagne CONFIDENTIELLE',s.downloads);
  assertByteExact(current.raw,baseline.raw,'Failed restore destroyed prior campaign');
  assert.equal(await c.evaluate(`localStorage.getItem('cer.dg003.private.campaign.v0')`),storedBefore,
   'Failed restore changed persisted campaign');
  assert.fail('P1: 6MiB restore did not commit (possibly browser storage quota): '+await c.evaluate(status));
 }
 let output=await download(c,'Exporter campagne CONFIDENTIELLE',s.downloads);
 archiveCheck(output.raw,['v2','v3']);
 assertByteExact(output.raw,generated.bytes,'Large restored archive differs byte-for-byte from ARCHIVES export');
 assert.equal(digest(output.raw),generated.sha256);
 assert.equal(JSON.parse(output.raw).project.qaUnknownLargeExtension.payload.length,6*1024*1024);
 await c.goto(s.mj);
 await clickText(c,'Recharger campagne');
 await waitText(c,'Campagne rechargée.');
 output=await download(c,'Exporter campagne CONFIDENTIELLE',s.downloads);
 assertByteExact(output.raw,generated.bytes,'Large archive changed across browser reload and STORAGE read');
 assert.equal(digest(output.raw),generated.sha256);
 archiveCheck(output.raw,['v2','v3']);
 // A corrupt restore must be rejected and cannot destroy the large campaign.
 await c.upload(sel.restore,path.join(folder,'fixtures','storage-compatible-invalid.json'));
 await clickText(c,'Prévisualiser restauration');
 const unchanged=await download(c,'Exporter campagne CONFIDENTIELLE',s.downloads);
 assertByteExact(unchanged.raw,output.raw,'Rejected invalid restore changed 6MiB campaign');
});
await persistEvidence();console.log('[QA_FINAL_EVIDENCE]',JSON.stringify({sourceIntegrationHead:integration,testedHead,ciRunId:evidence.ciRunId,results:evidence.results.map(({id,status})=>({id,status}))}));