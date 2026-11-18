import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {createServer} from 'node:http';
import {browserFixture} from '../studio-local/tests/browser.mjs';
test('Bibliothèque commune : catégories, recherche, deux lectures, retour, mobile et erreurs réseau', {skip:!process.env.SITES_CHECKOUT&&!process.env.PUBLIC_LIBRARY_URL,timeout:60000},async t=>{
 let base=process.env.PUBLIC_LIBRARY_URL;
 if(!base){const root=path.join(process.env.SITES_CHECKOUT,'dist');const server=createServer(async(req,res)=>{const route=new URL(req.url,'http://localhost').pathname;const file=path.resolve(root,'.'+route+(route.endsWith('/')?'index.html':''));if(!file.startsWith(path.resolve(root)+path.sep))return res.writeHead(404).end();try{const bytes=await readFile(file);res.writeHead(200,{'Content-Type':({html:'text/html',mjs:'text/javascript',css:'text/css',json:'application/json',webp:'image/webp',md:'text/plain'})[file.split('.').at(-1)]??'application/octet-stream'}).end(bytes);}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));base=`http://127.0.0.1:${server.address().port}`;}
 const f=await browserFixture(t),{page}=await f.open('common-library');const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [1365,390]){
  await page.setViewportSize({width,height:900});await page.goto(`${base}/bibliotheque.html`);await page.locator('#cards article').first().waitFor();
  assert.equal(await page.locator('#shelves button').count(),12);
  await mkdir('artifacts/library',{recursive:true});await page.screenshot({path:`artifacts/library/accueil-${width}.png`});
  await page.locator('#search').fill('ESP-ER-001');assert.equal(await page.locator('#cards article').count(),1);assert.equal(await page.locator('#cards article a').count(),2);
  await page.locator('#cards article a').first().click();await page.locator('#archive-dialog[open]').waitFor();await page.locator('#archive-close').click();await page.waitForURL('**/bibliotheque.html?q=ESP-ER-001');assert.equal(await page.locator('#search').inputValue(),'ESP-ER-001');
  await page.locator('#cards article a').last().click();await page.locator('#reader:not([hidden])').waitFor();await page.locator('#common-library').click();await page.waitForURL('**/bibliotheque.html?q=ESP-ER-001');
  await page.locator('#reset').click();await page.locator('[data-shelf="magie"]').click();await page.locator('#usage').selectOption('game');assert((await page.locator('#cards article').count())>0);assert.equal(await page.locator('#cards a').filter({hasText:'Lire le dossier'}).count(),0);
  await page.locator('#search').fill('ZZZinconnu');await page.locator('#empty:not([hidden])').waitFor();await page.locator('#empty-reset').click();
  await page.locator('#more').click();assert.equal(await page.locator('#cards article').count(),48);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await page.locator('a[href*="github.com"],a[href*="sijiel44.github.io"]').count(),0);
 }
 await page.goto(`${base}/#library`);await page.waitForURL('**/bibliotheque.html');
 await page.route('**/library-index.json',r=>r.fulfill({status:503,body:'Unavailable'}));await page.reload();await page.locator('#error').getByText('La bibliothèque ne peut pas être chargée.',{exact:false}).waitFor();assert.deepEqual(errors,[]);
});
