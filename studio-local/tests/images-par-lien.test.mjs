import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { LINKED_IMAGES_KEY } from '../store.mjs';
import { browserFixture } from './browser.mjs';

const portrait = 'https://images.example.invalid/maree.webp';
const broken = 'https://images.example.invalid/ruines.webp';
const alt = 'Une batelière avec une lanterne';
const credit = 'Illustration IA · réalisée pour la campagne';
const imageBytes = await readFile(new URL('../media/gardien-des-salines.webp', import.meta.url));

async function openImagerie(page) {
  await page.locator('#nav-library').click();
  await page.locator('#library-shelves a[href="#rayon/imagerie"]').click();
}

async function showImageFromSearch(page, name) {
  await page.locator('#catalogue-search').fill(name);
  await page.getByRole('button', { name: `Voir la fiche de ${name}`, exact: true }).click();
}

async function submitImage(page) {
  await page.getByRole('button', { name: 'Enregistrer l’image', exact: true }).click();
  await page.locator('#resource-dialog').waitFor();
}

async function selectBackup(page, buffer) {
  await page.locator('#backup-file').setInputFiles({ name: 'images.json', mimeType: 'application/json', buffer });
}

test('Ajouter, rattacher, restaurer et retirer une image liée sans l’exposer à la fenêtre joueur', { timeout: 60000 }, async t => {
  const browser = await browserFixture(t);
  const { page } = await browser.open('images-mj', { viewport: { width: 390, height: 844 } });
  const referrers = [];
  await page.route(portrait, route => {
    referrers.push(route.request().headers().referer);
    return route.fulfill({ contentType: 'image/webp', body: imageBytes });
  });
  await page.route(broken, route => route.fulfill({ status: 404 }));
  await page.goto(browser.url);
  await page.locator('#campaign-name').fill('Carnet illustré');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#add-character').click();
  await page.locator('#character-name').fill('Marée');
  await page.getByRole('button', { name: 'Enregistrer le PJ' }).click();
  await page.getByRole('button', { name: 'Voir la fiche de Marée', exact: true }).click();
  await page.getByRole('button', { name: 'Ajouter une image par lien' }).click();
  const url = page.getByLabel('Lien direct de l’image');
  await url.fill('http://images.example.invalid/maree.webp');
  await page.getByRole('button', { name: 'Enregistrer l’image' }).click();
  assert.equal(await url.evaluate(field => field.validity.customError), true);
  await url.fill(portrait);
  await page.getByLabel('Titre de l’image').fill('Portrait de la batelière');
  await page.getByLabel('Description courte de l’image').fill(alt);
  await page.getByLabel('Provenance et droits').selectOption({ label: 'Générée pour le projet' });
  await page.getByLabel('Auteur, crédit ou licence').fill(credit);
  await submitImage(page);
  const resource = page.locator('#resource-dialog');
  await resource.getByText(credit, { exact: true }).waitFor();
  await resource.getByText('Générée pour le projet', { exact: true }).waitFor();
  await resource.getByRole('link', { name: 'Marée', exact: true }).click();
  await page.locator('#resource-title').getByText('Marée', { exact: true }).waitFor();
  const image = resource.getByRole('img', { name: alt });
  assert.ok(await image.evaluate(async element => { await element.decode(); return element.naturalWidth; }));
  assert.ok(referrers.length > 0 && referrers.every(value => !value));
  assert.equal(await resource.getByRole('button', { name: 'Préparer la projection de l’image' }).count(), 0);
  assert.ok(await resource.evaluate(element => element.scrollWidth <= element.clientWidth));
  await page.keyboard.press('Escape');

  await openImagerie(page);
  await showImageFromSearch(page, 'Portrait de la batelière');
  await page.keyboard.press('Escape');
  await page.locator('#library-add-image').click();
  assert.deepEqual(await page.locator('#linked-image-target option').allTextContents(), ['Image indépendante']);
  await url.fill(broken);
  await page.getByLabel('Titre de l’image').fill('Vue des ruines');
  await submitImage(page);
  await resource.getByText('Image indisponible. Vérifiez le lien direct.').waitFor();
  await resource.getByRole('button', { name: 'Modifier le lien de l’image' }).click();
  await url.fill(portrait);
  await submitImage(page);
  await resource.locator('.catalogue-art.has-image').waitFor();
  await page.keyboard.press('Escape');

  await page.locator('#nav-backups').click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const buffer = await readFile(await download.path());
  const archive = JSON.parse(buffer);
  const campaign = archive.payload.campaign;
  assert.equal(archive.version, 15);
  assert.equal(campaign[LINKED_IMAGES_KEY][0].targetId, campaign.characters[0].id);
  assert.equal(campaign[LINKED_IMAGES_KEY][1].targetId, null);
  for (const [path, policy] of [['/joueur', 'img-src data:;'], ['/accueil', "img-src 'self';"]]) {
    const response = await page.request.get(new URL(path, browser.url).href);
    assert.ok(response.headers()['content-security-policy'].includes(policy));
  }

  const { page: restored } = await browser.open('images-restaurees', { viewport: { width: 1280, height: 900 } });
  await restored.route(portrait, route => route.fulfill({ contentType: 'image/webp', body: imageBytes }));
  await restored.goto(browser.url);
  await restored.locator('#save-status').filter({ hasText: 'Stockage local prêt' }).waitFor();
  await restored.locator('#nav-backups').click();
  await selectBackup(restored, Buffer.from(JSON.stringify({ ...archive, version: 14 })));
  await restored.getByRole('alert').getByText(/version incompatible/).waitFor();
  campaign[LINKED_IMAGES_KEY][0].url = 'javascript:alert(1)';
  archive.sha256 = createHash('sha256').update(JSON.stringify(archive.payload)).digest('hex');
  await selectBackup(restored, Buffer.from(JSON.stringify(archive)));
  await restored.getByRole('alert').getByText('Un lien d’image est invalide.').waitFor();
  await selectBackup(restored, buffer);
  await restored.locator('#backup-summary').getByText(/2 image/).waitFor();
  await restored.locator('#restore-backup').click();
  await restored.getByRole('button', { name: 'Voir la fiche de Marée', exact: true }).click();
  await restored.locator('#resource-art .has-image').waitFor();
  await restored.keyboard.press('Escape');
  await openImagerie(restored);
  await showImageFromSearch(restored, 'Portrait de la batelière');
  restored.once('dialog', dialog => dialog.accept());
  await restored.getByRole('button', { name: 'Retirer l’image' }).click();
  await restored.locator('#catalogue-count').getByText('0 fiches', { exact: true }).waitFor();
  await restored.locator('#nav-prepare').click();
  await restored.getByRole('button', { name: 'Voir la fiche de Marée', exact: true }).click();
  assert.equal(await restored.locator('#resource-art').isHidden(), true);
});
