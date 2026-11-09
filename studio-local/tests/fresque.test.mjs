import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { FRESQUE_LINKS_KEY } from "../store.mjs";
import { browserFixture } from "./browser.mjs";

// Export fictif généré par le store du commit 28cd269, avant la Fresque.
const v1Text = await readFile(new URL("fixtures/campagne-pilote-v1.json", import.meta.url), "utf8");
const v1 = JSON.parse(v1Text);
const original = v1.payload.campaign;
const [ford, ruins, tower] = original.scenes;
const condition = "Si la cloche sonne <deux fois>";
const link = { id: "lien-cloche-tour", fromId: ford.id, toId: tower.id, label: condition };
const improvisedNote = "CANARI_IMPRO_LAB_MJ";
const improvisedDescription = "Un guetteur descend la berge.";

async function openStore(page, url) {
  await page.goto(url);
  await page.evaluate(async () => {
    const { openStudioStore } = await import("/store.mjs");
    window.fresqueTestStore = await openStudioStore({ name: "fresque-test-fictive" });
  });
}

async function run(page, method, ...args) {
  const result = await page.evaluate(async ({ method, args }) => {
    const store = window.fresqueTestStore;
    try {
      if (method === "import") return { value: await store.restoreBackup(await store.previewBackup(args[0])) };
      return { value: await store[method](...args) };
    } catch (error) {
      return { error: error.code ?? error.message };
    }
  }, { method, args });
  if (result.error) throw Object.assign(new Error(result.error), { code: result.error });
  return result.value;
}

function operation(operationId, expectedRevision, type, data, id = original.id) {
  return { id, operationId, expectedRevision, type, data };
}

test("Fresque dans IndexedDB réel, archive v1 d’origine, causalité et restauration v2", { timeout: 40000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open("fresque-ecriture");
  const second = await context.newPage();
  await Promise.all([openStore(page, fixture.url), openStore(second, fixture.url)]);

  assert.deepEqual(await run(page, "import", v1Text), original);
  assert.deepEqual(JSON.parse(await run(second, "exportBackup", original.id)), v1);
  const withExtension = structuredClone(v1);
  withExtension.payload.campaign.id = "archive-v1-extension";
  withExtension.payload.campaign.sceneLinks = { extensionExterieure: ["à préserver"] };
  withExtension.sha256 = createHash("sha256").update(JSON.stringify(withExtension.payload)).digest("hex");
  const extension = await run(second, "import", JSON.stringify(withExtension));
  const extended = await run(second, "execute", operation("ordre-extension", 6, "move-scene", {
    id: tower.id, direction: "left",
  }, extension.id));
  assert.deepEqual(extended.sceneLinks, withExtension.payload.campaign.sceneLinks);
  const move = operation("ordre-1", 6, "move-scene", { id: tower.id, direction: "left" });
  const moved = await run(page, "execute", move);
  assert.deepEqual(moved.scenes.map(scene => scene.id), [ford.id, tower.id, ruins.id]);
  assert.equal(moved.activeSceneId, ford.id);
  assert.deepEqual(await run(second, "execute", move), moved);

  await assert.rejects(
    run(second, "execute", operation("lien-perime", 6, "add-scene-link", link)),
    { code: "conflict" },
  );
  const foreignId = "campagne-fictive-exterieure";
  const foreignScene = { ...tower, id: "scene-exterieure" };
  await run(second, "execute", operation("creer-exterieure", 0, "create", {
    name: "Campagne extérieure", description: "", style: "campaign", startingLevel: 6,
  }, foreignId));
  await run(second, "execute", operation("scene-exterieure", 1, "save-scene", foreignScene, foreignId));
  await assert.rejects(
    run(second, "execute", operation("lien-exterieur", 7, "add-scene-link", { ...link, toId: foreignScene.id })),
    { code: "foreign-key" },
  );
  await assert.rejects(
    run(second, "execute", operation("bord-de-la-fresque", 7, "move-scene", { id: ford.id, direction: "left" })),
    { code: "invalid-command" },
  );
  assert.deepEqual(await run(page, "get", original.id), moved);

  const linked = await run(page, "execute", operation("lien-1", 7, "add-scene-link", link));
  assert.deepEqual(linked[FRESQUE_LINKS_KEY], [link]);
  await assert.rejects(
    run(second, "execute", operation("lien-double", 8, "add-scene-link", { ...link, id: "lien-duplique" })),
    { code: "conflict" },
  );
  const v2Text = await run(second, "exportBackup", original.id);
  const v2 = JSON.parse(v2Text);
  assert.equal(v2.version, 2);
  assert.deepEqual(v2.payload.campaign, linked);
  await assert.rejects(
    run(second, "previewBackup", JSON.stringify({ ...v2, version: 1 })),
    { code: "backup-version" },
  );

  const { page: restored } = await fixture.open("fresque-restauration");
  await openStore(restored, fixture.url);
  assert.deepEqual(await run(restored, "import", v2Text), linked);
  assert.deepEqual(JSON.parse(await run(restored, "exportBackup", original.id)), v2);
  const unlinked = await run(restored, "execute", operation("supprimer-lien-1", 8, "remove-scene-link", { id: link.id }));
  assert.equal(unlinked[FRESQUE_LINKS_KEY]?.length ?? 0, 0);
  assert.deepEqual(unlinked.scenes, moved.scenes);
  assert.deepEqual((await run(second, "get", original.id))[FRESQUE_LINKS_KEY], [link]);
});

async function importInStudio(page, url, archive, filename) {
  await page.goto(url);
  await page.locator("#nav-backups").click();
  await page.waitForFunction(() => !document.querySelector("#backup-file").disabled);
  await page.locator("#backup-file").setInputFiles({
    name: filename,
    mimeType: "application/json",
    buffer: Buffer.from(archive),
  });
  await page.locator("#backup-preview").getByRole("heading", { name: original.name, exact: true }).waitFor();
  await page.locator("#restore-backup").click();
  await page.locator("#scene-list").getByText(ford.title, { exact: true }).waitFor();
}

function card(page, scene) {
  return page.locator(`#scene-list > [data-scene-id="${scene.id}"]`);
}

function order(page) {
  return page.locator("#scene-list > [data-scene-id]").evaluateAll(cards => cards.map(card => card.dataset.sceneId));
}

async function improvise(page, title, destination, description = "", note = "") {
  await page.locator("#improvise-scene").click();
  await page.locator("#scene-title").fill(title);
  await page.locator("#scene-description").fill(description);
  await page.locator("#scene-private-notes").fill(note);
  assert.equal(await page.locator("#improvise-destination").inputValue(), "reserve");
  await page.locator("#improvise-destination").selectOption(destination);
  await page.locator("#scene-form button[type=submit]").click();
  await page.locator("#scene-dialog").waitFor({ state: "hidden" });
}

test("Fresque et cockpit en navigateur réel, clavier, improvisation et projection", { timeout: 65000 }, async t => {
  const fixture = await browserFixture(t);
  const { page, context } = await fixture.open("fresque-tablette", {
    viewport: { width: 768, height: 1024 }, hasTouch: true, reducedMotion: "reduce",
  });
  await importInStudio(page, fixture.url, v1Text, "campagne-pilote-v1.json");
  assert.deepEqual(await order(page), [ford.id, ruins.id, tower.id]);
  assert.equal(await card(page, ford).getAttribute("aria-current"), "true");

  const listView = page.locator("#toggle-scene-list");
  await listView.focus();
  await page.keyboard.press("Enter");
  assert.equal(await listView.getAttribute("aria-pressed"), "true");
  const moveLeft = card(page, tower).getByRole("button", { name: `Déplacer ${tower.title} vers la gauche` });
  await moveLeft.focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(id => document.querySelectorAll("#scene-list > [data-scene-id]")[1]?.dataset.sceneId === id, tower.id);
  assert.deepEqual(await order(page), [ford.id, tower.id, ruins.id]);
  assert.equal(await card(page, ford).getAttribute("aria-current"), "true");
  assert.equal(await moveLeft.evaluate(button => button === document.activeElement), true);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

  await page.locator("#scene-link-tools summary").click();
  await page.locator("#scene-link-from").selectOption(ford.id);
  await page.locator("#scene-link-to").selectOption(tower.id);
  await page.locator("#scene-link-label").fill(condition);
  await page.locator("#add-scene-link").click();
  await card(page, ford).getByText(condition, { exact: false }).waitFor();

  await page.reload();
  await page.locator("#resume-campaign").click();
  await page.locator("#current-scene-title").getByText(ford.title, { exact: true }).waitFor();
  const branches = page.locator("#play-branch-list");
  await branches.getByText(condition, { exact: true }).waitFor();
  await branches.getByRole("button", { name: `Jouer ${tower.title}` }).click();
  await page.locator("#current-scene-title").getByText(tower.title, { exact: true }).waitFor();
  await page.locator("#play-branches").waitFor({ state: "hidden" });
  const search = page.locator("#cockpit-search");
  const results = page.locator("#cockpit-results");
  await search.fill("eloise");
  await results.getByRole("button", { name: "Ouvrir la fiche de Éloïse des Saules" }).click();
  assert.equal(await page.locator("#character-name").inputValue(), original.characters[0].name);
  await page.keyboard.press("Escape");
  await search.fill("renarde");
  await results.getByRole("button", { name: "Ouvrir la fiche de Renarde de brume" }).click();
  assert.equal(await page.locator("#creature-name").inputValue(), original.creatures[0].name);
  await page.keyboard.press("Escape");
  await search.fill(original.characters[0].notes);
  assert.equal(await results.getByRole("button").count(), 0);
  await search.fill("ruines");
  await results.getByRole("button", { name: `Jouer ${ruins.title}` }).click();
  await page.locator("#current-scene-title").getByText(ruins.title, { exact: true }).waitFor();

  await improvise(page, "Le billet en réserve", "reserve");
  await page.locator("#current-scene-title").getByText(ruins.title, { exact: true }).waitFor();
  assert.ok(await page.locator("#jump-scene").locator("option").getByText("Le billet en réserve", { exact: true }).count());
  await improvise(page, "Le guetteur", "play", improvisedDescription, improvisedNote);
  await page.locator("#current-scene-title").getByText("Le guetteur", { exact: true }).waitFor();
  await page.locator("#current-private-notes").getByText(improvisedNote, { exact: true }).waitFor();
  await page.locator("#share-description").check();
  await page.locator("#show-projection").click();
  const player = page.frameLocator("#projection iframe");
  await player.getByText(improvisedDescription, { exact: true }).waitFor();
  assert.equal(await player.getByText("Le guetteur", { exact: true }).count(), 0);
  assert.doesNotMatch(await player.locator("body").innerText(), /CANARI|Si la cloche sonne/);
  await page.locator("#stop-projection").click();

  await page.locator("#nav-backups").click();
  const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#export-backup").click()]);
  const v2Text = await readFile(await download.path(), "utf8");
  assert.equal(JSON.parse(v2Text).version, 2);
  await context.close();

  const { page: restored } = await fixture.open("fresque-echange", { viewport: { width: 390, height: 844 }, hasTouch: true });
  await importInStudio(restored, fixture.url, v2Text, "campagne-fresque-v2.json");
  assert.deepEqual((await order(restored)).slice(0, 3), [ford.id, tower.id, ruins.id]);
  await card(restored, ford).getByText(condition, { exact: false }).waitFor();
  assert.equal(await restored.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await restored.locator("#nav-play").click();
  await restored.locator("#current-scene-title").getByText("Le guetteur", { exact: true }).waitFor();
  await restored.locator("#current-private-notes").getByText(improvisedNote, { exact: true }).waitFor();
  await restored.locator("#nav-prepare").click();
  await card(restored, ford).locator("[data-remove-link]").click();
  await card(restored, ford).getByText(condition, { exact: true }).waitFor({ state: "detached" });
  assert.deepEqual((await order(restored)).slice(0, 3), [ford.id, tower.id, ruins.id]);
});
