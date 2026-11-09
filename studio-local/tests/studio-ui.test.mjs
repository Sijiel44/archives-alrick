import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { browserFixture } from "./browser.mjs";

const campaignName = "Les Lanternes du gué fictif";
const firstScene = "Une lumière au gué";
const secondScene = "Le sentier des saules";
const publicText = "Une lanterne <brille> & indique le passage.";
const privateNote = "CANARI_MJ_479FB8_SOUS_LA_PIERRE";

async function waitForText(page, selector, expected) {
  await page.waitForFunction(
    ({ selector, expected }) => document.querySelector(selector)?.textContent.trim() === expected,
    { selector, expected },
  );
}

async function createCharacter(page, name, level) {
  await page.locator("#add-character").click();
  await page.locator("#character-name").fill(name);
  await page.locator("#character-level").fill(String(level));
  await page.locator("#character-form button[type=submit]").click();
  await page.locator("#character-dialog").waitFor({ state: "hidden" });
  await page.locator("#character-list").getByText(name, { exact: true }).waitFor();
}

async function createScene(page, title, description, note, participantCount) {
  await page.locator("#add-scene").click();
  await page.locator("#scene-title").fill(title);
  await page.locator("#scene-description").fill(description);
  await page.locator("#scene-private-notes").fill(note);
  const participants = page.locator("#scene-participants input[type=checkbox]");
  assert.equal(await participants.count(), 3);
  for (let index = 0; index < participantCount; index++) {
    await participants.nth(index).check();
  }
  await page.locator("#scene-form button[type=submit]").click();
  await page.locator("#scene-dialog").waitFor({ state: "hidden" });
  await page.locator("#scene-list").getByText(title, { exact: true }).waitFor();
}

async function downloadBackup(page, target) {
  await page.locator("#nav-backups").click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("#export-backup").click(),
  ]);
  assert.match(download.suggestedFilename(), /\.json$/i);
  await download.saveAs(target);
  return JSON.parse(await readFile(target, "utf8"));
}

test("Studio MJ en navigateur réel, reprise après fermeture et restauration dans un autre profil", { timeout: 75000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open("maitre-du-jeu");
  const pageErrors = [];
  const requests = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  page.on("request", request => requests.push([request.url(), request.postData()]));
  await page.addInitScript(() => {
    window.observedMessages = [];
    window.addEventListener("message", event => window.observedMessages.push(event.data));
    const original = window.postMessage;
    window.postMessage = function (data, ...options) {
      window.observedMessages.push(data);
      return original.call(this, data, ...options);
    };
  });
  await page.goto(fixture.url);
  await page.locator("#campaign-name").fill(campaignName);
  await page.locator("#starting-level").fill("10");
  await page.locator("#create-campaign-submit").click();
  await page.locator("#guided-steps").waitFor();
  await waitForText(page, "#active-campaign", campaignName);
  await createCharacter(page, "Ada du Gué", 10);
  await createCharacter(page, "Éloi des Saules", 25);

  await page.locator("#nav-library").click();
  await page.locator('#library-shelves a[href="#rayon/bestiaire"]').click();
  const copy = page.locator("#copy-creature");
  await copy.waitFor();
  await page.locator("#catalogue-search").fill("recherche sans résultat");
  await page.locator("#catalogue-empty").waitFor();
  await page.locator("#catalogue-search").clear();
  await copy.click();
  await waitForText(page, "#save-status", "Gardien des Salines · copie sauvegardée");
  await page.locator("#nav-prepare").click();
  await page.waitForFunction(() => document.querySelectorAll("#creature-list > li").length === 1);
  await page.locator("#creature-list").getByRole("button", { name: "Adapter Gardien des Salines" }).click();
  await page.locator("#creature-name").fill("Gardien du gué");
  await page.locator("#creature-form button[type=submit]").click();
  await page.locator("#creature-list").getByText("Gardien du gué", { exact: true }).waitFor();
  await page.locator("#nav-library").click();
  await page.locator('#library-shelves a[href="#rayon/bestiaire"]').click();
  await page.locator("#catalogue-list").getByRole("heading", { name: "Gardien des Salines" }).waitFor();
  await page.locator("#nav-prepare").click();
  await createScene(page, firstScene, publicText, "Brouillon privé", 3);
  await createScene(page, secondScene, "Deux voix derrière les saules.", "Piste fictive.", 1);

  await page.locator("#nav-play").click();
  await waitForText(page, "#current-scene-title", firstScene);
  assert.equal(await page.locator("#participant-list > li").count(), 3);
  await page.locator("#edit-current-scene").click();
  await page.locator("#scene-private-notes").fill(privateNote);
  await page.locator("#scene-form button[type=submit]").click();
  await waitForText(page, "#current-private-notes", privateNote);

  const projection = page.locator("#projection iframe");
  assert.equal(await projection.count(), 0);
  assert.equal(await page.locator("#show-projection").isDisabled(), true);
  await page.locator("#share-title").check();
  assert.equal(await projection.count(), 0);
  await page.locator("#show-projection").click();
  const player = page.frameLocator("#projection iframe");
  await player.getByRole("heading", { name: firstScene, exact: true }).waitFor();
  assert.equal(await projection.getAttribute("sandbox"), "");
  assert.doesNotMatch(await projection.getAttribute("srcdoc"), /CANARI_MJ|lanterne &lt;brille&gt;/);
  assert.equal(await page.locator("#projection-dialog").evaluate(dialog => {
    const bounds = dialog.getBoundingClientRect();
    return dialog.matches(":modal") && bounds.x === 0 && bounds.y === 0 &&
      bounds.width === innerWidth && bounds.height === innerHeight;
  }), true);
  await page.keyboard.press("Escape");
  await projection.waitFor({ state: "detached" });
  assert.equal(await page.locator("#share-title").isChecked(), false);

  await page.locator("#share-title").check();
  await page.locator("#share-description").check();
  await page.locator("#show-projection").click();
  await player.getByText(publicText, { exact: true }).waitFor();
  assert.doesNotMatch(await player.locator("body").innerText(), new RegExp(privateNote));
  assert.doesNotMatch(await projection.getAttribute("srcdoc"), new RegExp(privateNote));
  assert.deepEqual(await page.evaluate(() => window.observedMessages), []);
  assert.doesNotMatch(JSON.stringify(requests), new RegExp(privateNote));
  for (const path of ["", "projection.mjs", "app.mjs", "store.mjs", "studio.css"]) {
    const response = await fetch(new URL(path, fixture.url));
    assert.equal(response.status, 200);
    assert.doesNotMatch(await response.text(), new RegExp(privateNote));
  }

  await page.locator("#stop-projection").click();
  await projection.waitFor({ state: "detached" });
  await page.locator("#share-title").check();
  await page.locator("#jump-scene").selectOption({ label: secondScene });
  await waitForText(page, "#current-scene-title", secondScene);
  await projection.waitFor({ state: "detached" });
  assert.equal(await page.locator("#share-title").isChecked(), false);
  assert.equal(await page.locator("#show-projection").isDisabled(), true);
  assert.deepEqual(pageErrors, []);
  await context.close();

  const resumed = await fixture.open("maitre-du-jeu");
  await resumed.page.goto(fixture.url);
  await resumed.page.locator("#resume-campaign").click();
  await waitForText(resumed.page, "#current-scene-title", secondScene);
  assert.equal(await resumed.page.locator("#projection iframe").count(), 0);

  const backupPath = join(fixture.directory, "campagne-fictive.json");
  const backup = await downloadBackup(resumed.page, backupPath);
  assert.equal(backup.format, "chroniques-entre-rives.studio-local");
  assert.equal(backup.version, 1);
  const { campaign } = backup.payload;
  assert.deepEqual(campaign.characters.map(({ name, level }) => [name, level]), [
    ["Ada du Gué", 10],
    ["Éloi des Saules", 25],
  ]);
  assert.equal(campaign.creatures.length, 1);
  assert.equal(campaign.creatures[0].name, "Gardien du gué");
  assert.deepEqual(campaign.creatures[0].source, { id: "gardien-des-salines", version: 1 });
  assert.deepEqual(new Set(campaign.scenes[0].participantIds), new Set([
    ...campaign.characters.map(({ id }) => id),
    campaign.creatures[0].id,
  ]));
  assert.equal(campaign.scenes[0].privateNotes, privateNote);
  assert.equal(campaign.activeSceneId, campaign.scenes[1].id);

  const restored = await fixture.open("profil-restauration");
  await restored.page.goto(fixture.url);
  await restored.page.locator("#campaigns-empty").waitFor();
  await waitForText(restored.page, "#save-status", "Stockage local prêt");
  await restored.page.locator("#nav-backups").click();
  await restored.page.locator("#backup-file").setInputFiles(backupPath);
  await restored.page.locator("#backup-preview").getByRole("heading", { name: campaignName }).waitFor();
  await restored.page.locator("#restore-backup").click();
  await restored.page.locator("#scene-list").getByText(firstScene, { exact: true }).waitFor();
  const restoredBackup = await downloadBackup(restored.page, join(fixture.directory, "campagne-restauree.json"));
  assert.deepEqual(restoredBackup, backup);
  await restored.page.locator("#backup-file").setInputFiles(backupPath);
  await restored.page.locator("#backup-conflict").waitFor();
  assert.equal(await restored.page.locator("#restore-backup").isDisabled(), true);
});

test("Navigation au clavier et absence de défilement horizontal à largeur tablette", { timeout: 30000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open("tablette", { viewport: { width: 768, height: 1024 }, hasTouch: true });
  await page.goto(fixture.url);
  await waitForText(page, "#save-status", "Stockage local prêt");
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute("href")), "#workspace");
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => document.activeElement.id), "workspace");
  const name = page.locator("#campaign-name");
  await name.focus();
  await page.keyboard.type("Campagne de test clavier");
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.id), "campaign-style");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.id), "create-campaign-submit");
  await page.keyboard.press("Enter");
  await page.locator("#prepare-title").waitFor();
  assert.equal(await page.locator("#guided-steps").isVisible(), false);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
});

test("Un conflit entre onglets laisse le brouillon MJ dans le formulaire", { timeout: 40000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open("conflit-mj");
  await page.goto(fixture.url);
  await page.locator("#campaign-name").fill("Le bac des deux gués");
  await page.locator("#create-campaign-submit").click();
  await page.locator("#add-scene").click();
  await page.locator("#scene-title").fill("Traversée");
  await page.locator("#scene-form button[type=submit]").click();
  await page.locator("#scene-list").getByText("Traversée", { exact: true }).waitFor();
  await page.locator("#nav-play").click();
  await page.locator("#edit-current-scene").click();
  await page.locator("#scene-private-notes").fill("Brouillon conservé du premier onglet");

  const second = await context.newPage();
  await second.goto(fixture.url);
  await second.locator("#resume-campaign").click();
  await second.locator("#edit-current-scene").click();
  await second.locator("#scene-private-notes").fill("Note confirmée dans le second onglet");
  await second.locator("#scene-form button[type=submit]").click();
  await waitForText(second, "#current-private-notes", "Note confirmée dans le second onglet");

  await page.locator("#scene-form button[type=submit]").click();
  await page.locator("#scene-form .form-error").getByText("La campagne a changé.", { exact: false }).waitFor();
  assert.equal(await page.locator("#scene-private-notes").inputValue(), "Brouillon conservé du premier onglet");
  await page.locator("#scene-form .reload-draft").click();
  await waitForText(page, "#current-private-notes", "Note confirmée dans le second onglet");
});
