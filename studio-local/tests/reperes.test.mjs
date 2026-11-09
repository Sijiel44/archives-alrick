import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { FRESQUE_MARKERS_KEY } from "../store.mjs";
import { browserFixture } from "./browser.mjs";

const source = await readFile(new URL("./fixtures/campagne-pilote-v1.json", import.meta.url), "utf8");
const original = JSON.parse(source).payload.campaign;
const [ford, , tower] = original.scenes;
const secret = "CANARI_REPERE_MJ <une deuxième cloche sous le pont>";

async function restore(page, url, text) {
  await page.goto(url);
  await page.locator("#nav-backups").click();
  await page.locator("#save-status").getByText("Stockage local prêt").waitFor();
  await page.locator("#backup-file").setInputFiles({
    name: "campagne-reperes-fictive.json", mimeType: "application/json", buffer: Buffer.from(text),
  });
  await page.locator("#restore-backup").click();
  await page.locator("#prepare-title").waitFor();
}

async function saveMarker(page) {
  await page.locator("#marker-form button[type=submit]").click();
  await page.locator("#marker-dialog").waitFor({ state: "hidden" });
}

test("Repères en réserve ou en séance, filtre, projection et restauration v4", { timeout: 65000 }, async t => {
  const browser = await browserFixture(t);
  const { page } = await browser.open("fresque-reperes", { viewport: { width: 1280, height: 900 } });
  await restore(page, browser.url, source);

  const firstScene = page.locator(`#scene-list > [data-scene-id="${ford.id}"]`);
  const normal = (await firstScene.boundingBox()).width;
  await page.locator("#fresque-density").selectOption("large");
  assert.ok((await firstScene.boundingBox()).width > normal);
  await page.locator("#fresque-density").selectOption("compact");
  assert.ok((await firstScene.boundingBox()).width < normal);

  await page.locator("#add-marker").click();
  await page.locator("#marker-title").fill("Berge engloutie");
  await page.locator("#marker-kind").selectOption("place");
  assert.equal(await page.locator("#marker-scene").inputValue(), "");
  await saveMarker(page);
  const reserve = page.locator("#marker-reserve-list");
  await reserve.getByText("Berge engloutie", { exact: true }).waitFor();

  await page.locator("#add-marker").click();
  await page.locator("#marker-title").fill("Le courant coupe la route");
  await page.locator("#marker-kind").selectOption("consequence");
  await page.locator("#marker-scene").selectOption(ford.id);
  await page.locator("#marker-description").fill("Si la pluie reprend, le gué pourrait devenir impraticable.");
  await saveMarker(page);
  await firstScene.getByText("Conséquence possible", { exact: true }).waitFor();
  await firstScene.getByText("Préparée", { exact: true }).waitFor();
  await page.locator("#marker-filter").selectOption("consequence");
  assert.equal(await reserve.isVisible(), false);
  assert.match(await page.locator("#marker-filter-status").textContent(), /^1 /);
  await page.locator("#marker-filter").selectOption("");
  await reserve.getByText("Berge engloutie", { exact: true }).waitFor();

  await page.locator("#nav-play").click();
  await page.locator("#play-add-marker").click();
  assert.equal(await page.locator("#marker-scene").inputValue(), ford.id);
  await page.locator("#marker-title").fill("La cloche fêlée");
  await page.locator("#marker-description").fill(secret);
  await saveMarker(page);
  const playMarkers = page.locator("#play-marker-list");
  await playMarkers.getByText("La cloche fêlée", { exact: true }).click();
  assert.equal(await playMarkers.locator(".narrative").getByText(secret, { exact: true }).count(), 1);
  await page.locator("#share-title").check();
  await page.locator("#show-projection").click();
  const projection = page.locator("#projection iframe");
  await projection.waitFor();
  assert.doesNotMatch(await projection.getAttribute("srcdoc"), /CANARI_REPERE_MJ|cloche fêlée|coupe la route/);
  await page.locator("#stop-projection").click();
  await playMarkers.getByRole("button", { name: "Modifier le repère La cloche fêlée" }).click();
  await page.locator("#marker-scene").selectOption(tower.id);
  await saveMarker(page);
  assert.equal(await playMarkers.getByText("La cloche fêlée", { exact: true }).count(), 0);

  await page.locator("#nav-backups").click();
  const [file] = await Promise.all([page.waitForEvent("download"), page.locator("#export-backup").click()]);
  const saved = await readFile(await file.path(), "utf8");
  const archive = JSON.parse(saved);
  assert.equal(archive.version, 4);
  assert.deepEqual(archive.payload.campaign[FRESQUE_MARKERS_KEY].map(({ kind, sceneId }) => [kind, sceneId]), [
    ["place", null], ["consequence", ford.id], ["lead", tower.id],
  ]);
  assert.equal(archive.payload.campaign.activeSceneId, ford.id);

  const { page: restored } = await browser.open("fresque-reperes-restaures", { viewport: { width: 390, height: 844 } });
  await restore(restored, browser.url, saved);
  await restored.locator("#toggle-scene-list").click();
  assert.equal(await restored.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await restored.locator(`[data-scene-id="${tower.id}"]`).getByText("La cloche fêlée", { exact: true }).click();
  await restored.getByText(secret, { exact: true }).waitFor();
  await restored.locator("#marker-reserve-list").getByText("Berge engloutie", { exact: true }).click();
  restored.once("dialog", dialog => dialog.dismiss());
  await restored.getByRole("button", { name: "Supprimer le repère Berge engloutie" }).click();
  await restored.locator("#marker-reserve").waitFor();
  restored.once("dialog", dialog => dialog.accept());
  await restored.getByRole("button", { name: "Supprimer le repère Berge engloutie" }).click();
  await restored.locator("#marker-reserve").waitFor({ state: "hidden" });
});

test("Repère transactionnel, références locales et conservation des extensions en v4", { timeout: 35000 }, async t => {
  const browser = await browserFixture(t);
  const { page } = await browser.open("contrats-reperes");
  await page.goto(browser.url);
  const marker = { id: "repere-fictif", kind: "lead", title: "Cloche", description: "", sceneId: ford.id };
  const result = await page.evaluate(async ({ input, card }) => {
    const { openStudioStore } = await import("/store.mjs");
    const store = await openStudioStore({ name: "contrat-reperes-fictifs" });
    const attempt = async operation => {
      try { return await operation(); }
      catch (error) { return error.code; }
    };
    try {
      const campaign = await store.restoreBackup(await store.previewBackup(input));
      const command = { id: campaign.id, expectedRevision: campaign.revision, type: "save-fresque-marker",
        operationId: "repere-1", data: card };
      const foreign = await attempt(() => store.execute({ ...command, data: { ...card, sceneId: "ailleurs" } }));
      const invalid = await attempt(() => store.execute({ ...command, data: { ...card, kind: "autre" } }));
      const saved = await store.execute(command);
      const retried = await store.execute(command);
      const stale = await attempt(() => store.execute({ ...command, operationId: "repere-perime" }));
      const archive = JSON.parse(await store.exportBackup(campaign.id));
      const downgrade = await attempt(() => store.previewBackup(JSON.stringify({ ...archive, version: 3 })));
      return { foreign, invalid, stale, downgrade, archive, revisions: [saved.revision, retried.revision] };
    } finally { store.close(); }
  }, { input: source, card: marker });
  assert.equal(result.foreign, "foreign-key");
  assert.equal(result.invalid, "invalid-command");
  assert.equal(result.stale, "conflict");
  assert.equal(result.downgrade, "backup-version");
  assert.deepEqual(result.revisions, [original.revision + 1, original.revision + 1]);
  assert.equal(result.archive.version, 4);

  const external = result.archive;
  external.payload.campaign[FRESQUE_MARKERS_KEY][0].extensionFictive = { note: "à conserver" };
  external.sha256 = createHash("sha256").update(JSON.stringify(external.payload)).digest("hex");
  const updated = await page.evaluate(async ({ text, card, key }) => {
    const { openStudioStore } = await import("/store.mjs");
    const store = await openStudioStore({ name: "contrat-reperes-importes" });
    try {
      const old = await store.restoreBackup(await store.previewBackup(text));
      const campaign = await store.execute({ id: old.id, expectedRevision: old.revision,
        operationId: "repere-2", type: "save-fresque-marker", data: { ...card, sceneId: null } });
      return campaign[key][0];
    } finally { store.close(); }
  }, { text: JSON.stringify(external), card: marker, key: FRESQUE_MARKERS_KEY });
  assert.deepEqual(updated, { ...marker, sceneId: null, extensionFictive: { note: "à conserver" } });
});
