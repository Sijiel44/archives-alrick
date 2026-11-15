import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

async function seed(page, url, withPJ = true) {
  await page.goto(url); await page.locator('#campaign-name').fill('Table des objets');
  await page.locator('#create-campaign-submit').click(); await page.locator('#prepare-title').waitFor();
  if (withPJ) {
    const source = await page.evaluate(async () => {
      const {createFreePJ,buildFreePJ}=await import('./pj-m02.mjs');
      const stats={physique:3,agilite:3,esprit:3,presence:3};
      const {source}=createFreePJ(buildFreePJ({level:5,startingStats:stats,stats,masteries:{}}),{id:'pj-objet',name:'Néria',profession:'Batelière',backstory:'',connections:'',goal:''});
      return {...source,gmNotes:'CANARI_FICHE_MJ',inventory:[{id:'ancien',name:'Souvenir',quantity:1,future:'CANARI_OBJET_PRIVE'}]};
    });
    await page.locator('#import-pj').click();
    await page.locator('#pj-import-file').setInputFiles({name:'pj-fictif.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({schema:'alrick.sheets.v3',sheets:[source]}))});
    await page.locator('#pj-import-submit').click(); await page.locator('#pj-import-dialog').waitFor({state:'hidden'});
  }
  await page.locator('#nav-creations').click(); await page.getByRole('button',{name:'Créer · Objet',exact:true}).click();
  await page.locator('#creation-name').fill('Lanterne du passeur');
  await page.locator('#creation-description').fill('Une lanterne à poignée de cuivre.');
  await page.locator('#creation-notes').fill('CANARI_MODELE_SECRET');
  await page.locator('#creation-form button[type=submit]').click(); await page.locator('#creation-dialog').waitFor({state:'hidden'});
  await openGrant(page);
}
async function openGrant(page) {
  await page.locator('#nav-library').click();
  await page.locator('#catalogue-search').fill('Lanterne du passeur');
  await page.getByRole('button',{name:'Voir la fiche de Lanterne du passeur',exact:true}).click();
  await page.getByRole('button',{name:'Attribuer une copie à un PJ',exact:true}).click();
  await page.locator('#object-grant-dialog').waitFor();
}
async function inspect(page) {
  return page.evaluate(async()=>{const s=await(await import('./store.mjs')).openStudioStore();try{return(await s.list())[0];}finally{s.close();}});
}
test('Attribuer le modèle garde son secret et prépare un échange relu pour le joueur', {timeout:50000}, async t=>{
  const f=await browserFixture(t),{page}=await f.open('objets-mj-ui',{reducedMotion:'reduce'});
  await seed(page,f.url); const before=await inspect(page);
  assert.equal(await page.locator('#object-grant-submit').isDisabled(),true);
  assert.doesNotMatch(await page.locator('#object-grant-form').textContent(),/CANARI_MODELE_SECRET/);
  await page.locator('#object-grant-reviewed').check(); await page.locator('#object-grant-quantity').fill('2');
  assert.equal(await page.locator('#object-grant-reviewed').isChecked(),false);
  for(const width of [1440,768,390,320]){await page.setViewportSize({width,height:900});assert.equal(await page.locator('#object-grant-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth),true);}
  await page.locator('#object-grant-reviewed').check(); await page.locator('#object-grant-submit').click();
  await page.locator('#pj-export-dialog').waitFor(); await page.locator('#pj-export-download:not(:disabled)').waitFor();
  const [file]=await Promise.all([page.waitForEvent('download'),page.locator('#pj-export-download').click()]);
  const packet=JSON.parse(await readFile(await file.path(),'utf8'));
  assert.doesNotMatch(JSON.stringify(packet),/CANARI_|Table des objets|entreRivesCreations/);
  assert.equal(packet.payload.sheet.inventory.at(-1).name,'Lanterne du passeur');assert.equal(packet.payload.sheet.inventory.at(-1).quantity,2);
  const after=await inspect(page);
  assert.deepEqual(after.entreRivesCreationsV10,before.entreRivesCreationsV10);
  assert.equal(after.characters[0].entreRivesPJUpdatesV17.length,1);
  assert.equal(after.characters[0].entreRivesPJSourceV9.inventory[0].future,'CANARI_OBJET_PRIVE');
});
test('Une attribution périmée conserve le modèle et les champs de la copie à relire', {timeout:45000}, async t=>{
  const f=await browserFixture(t),{page,context}=await f.open('objets-mj-stale');await seed(page,f.url);
  const other=await context.newPage();await other.goto(f.url);await other.getByRole('button',{name:'Ouvrir Table des objets',exact:true}).click();
  await other.locator('#add-scene').click();await other.locator('#scene-title').fill('Scène ajoutée ailleurs');await other.locator('#scene-form button[type=submit]').click();await other.locator('#scene-dialog').waitFor({state:'hidden'});
  const before=await inspect(page);await page.locator('#object-grant-reviewed').check();await page.locator('#object-grant-submit').click();
  await page.locator('#object-grant-form .form-error').getByText(/campagne a changé/i).waitFor();
  assert.deepEqual(await inspect(page),before);assert.equal(await page.locator('#object-grant-name').inputValue(),'Lanterne du passeur');
});
test('Le modèle reste consultable quand aucun PJ compatible ne peut recevoir une copie', {timeout:40000}, async t=>{
  const f=await browserFixture(t),{page}=await f.open('objets-mj-vide');await seed(page,f.url,false);
  await page.locator('#object-grant-reviewed').check();assert.equal(await page.locator('#object-grant-submit').isDisabled(),true);
  await page.locator('#object-grant-close').click();assert.equal(await page.locator('#object-grant-dialog').isVisible(),false);
});
