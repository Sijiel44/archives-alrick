import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PLAY_ACTIONS_KEY, PLAY_STATS } from "../store.mjs";
import { browserFixture } from "./browser.mjs";

const initial = await readFile(new URL("./fixtures/campagne-pilote-v1.json", import.meta.url), "utf8");
const original = JSON.parse(initial).payload.campaign;

async function restore(page, url, archive, count = 0) {
  await page.goto(url);
  await page.locator("#nav-backups").click();
  await page.locator("#save-status").getByText("Stockage local prêt", { exact: true }).waitFor();
  await page.locator("#backup-file").setInputFiles({
    name: "campagne-fictive.json", mimeType: "application/json", buffer: Buffer.from(archive),
  });
  if (count) await page.locator("#backup-summary").getByText(`${count} action(s) consignée(s)`, { exact: false }).waitFor();
  await page.locator("#restore-backup").click();
  await page.locator("#prepare-title").waitFor();
}

async function saveConsequence(page, text) {
  await page.locator("#play-consequence").fill(text);
  await page.getByRole("button", { name: "Consigner dans le journal" }).click();
  await page.locator("#play-action-dialog").waitFor({ state: "hidden" });
}

test("Protocole, annonce verrouillée, dés de table et restauration du journal privé", { timeout: 65000 }, async t => {
  const browser = await browserFixture(t);
  const { page } = await browser.open("jeu-protocole", { viewport: { width: 1280, height: 920 } });
  await restore(page, browser.url, initial);
  const guide = page.locator("#play-protocol-dialog");
  await page.getByRole("button", { name: "Consulter le protocole" }).click();
  await guide.getByText(/Le joueur choisit ce que son personnage tente/).waitFor();
  await guide.getByText("Combat, magie et autres modules historiques").click();
  await guide.getByText(/Une riposte est une action distincte/).waitFor();
  assert.match(await guide.getByRole("link", { name: "Vérification documentaire du MJ" }).getAttribute("href"), /88f774f.*PROTOCOLE_RECHERCHE_AVANT_REPONSE_JDR\.md$/);
  await page.keyboard.press("Escape");

  await page.locator("#nav-play").click();
  await page.locator("#open-play-action").click();
  const dialog = page.locator("#play-action-dialog");
  const outcome = page.locator("#play-resolution");
  const intent = "Tenir la passerelle";
  const consequence = "CANARI_JOURNAL_MJ Le prochain jet concerne le groupe.";
  await page.locator("#play-intent").fill(intent);
  await page.locator("#play-actor").fill(original.characters[0].name);
  await page.locator("#play-stakes").fill("L’amarre tient ou cède sous la crue.");
  await page.locator("#play-lock").click();
  assert.equal(await page.locator("#play-dice-step").isVisible(), false);
  await page.locator("#play-raw-stat").fill("40");
  await page.locator("#play-mastery").fill("15");
  await page.locator("#play-situation").fill("2");
  await page.locator("#play-threshold").fill("15");
  await page.locator("#play-lock").click();
  await page.locator("#play-locked-parameters").getByText(/Physique 40.*seuil 15/).waitFor();
  assert.equal(await page.locator("#play-threshold").isDisabled(), true);
  await page.locator("#play-dice-source").selectOption("table");
  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `régie ${width}px`);
    assert.equal(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth), true, `dés de table ${width}px`);
  }
  for (const input of await page.locator("#play-manual-dice input").all()) await input.fill("1");
  await page.locator("#play-resolve").click();
  await outcome.getByText("Échec critique exceptionnel", { exact: true }).waitFor();
  await outcome.getByText(/Naturel 5 · total 22 \/ seuil 15/).waitFor();
  assert.deepEqual(await outcome.locator("li").allTextContents(), ["1", "1", "1", "1", "1"]);
  assert.equal(await page.locator("#play-revise").isVisible(), false);
  await saveConsequence(page, consequence);
  const journal = page.locator("#play-actions-list");
  await journal.locator("summary").filter({ hasText: intent }).click();
  await journal.getByText(consequence, { exact: true }).waitFor();

  await page.locator("#show-projection").waitFor();
  await page.locator("#share-title").check();
  await page.locator("#show-projection").click();
  assert.doesNotMatch(await page.locator("#projection iframe").getAttribute("srcdoc"), /CANARI_JOURNAL_MJ|Tenir la passerelle|Échec critique/);
  await page.locator("#stop-projection").click();
  await page.locator("#jump-scene").selectOption(original.scenes[1].id);
  await page.locator("#current-scene-title").getByText(original.scenes[1].title, { exact: true }).waitFor();
  assert.equal(await journal.locator("summary").count(), 0);
  await page.locator("#open-play-action").click();
  await page.locator("#play-intent").fill("Forcer une porte scellée sans outil");
  await page.locator("#play-stakes").fill("La compagnie doit chercher un autre accès.");
  await page.locator("#play-mode").selectOption("blocked");
  await page.locator("#play-lock").click();
  await outcome.getByText("Action impossible · sans jet", { exact: true }).waitFor();
  assert.equal(await outcome.locator("li").count(), 0);
  await saveConsequence(page, "Le groupe recherche une clé.");
  assert.equal(await journal.locator("summary").count(), 1);

  await page.locator("#journal-add-action").click();
  await page.locator("#play-intent").fill("Suivre une trace dans la boue");
  await page.locator("#play-stakes").fill("La trace indique quelle route le groupe peut essayer.");
  await page.locator("#play-stat").selectOption("esprit");
  await page.locator("#play-raw-stat").fill("3");
  await page.locator("#play-lock").click();
  await page.getByRole("button", { name: "Lancer les 5d6" }).click();
  await outcome.getByText(/Jet du Studio · Naturel/).waitFor();
  const generatedDice = (await outcome.locator("li").allTextContents()).map(Number);
  assert.equal(generatedDice.length, 5);
  assert.ok(generatedDice.every(face => Number.isInteger(face) && face >= 1 && face <= 6));
  await saveConsequence(page, "Le groupe tranche après le jet.");

  await page.locator("#nav-backups").click();
  const [file] = await Promise.all([page.waitForEvent("download"), page.locator("#export-backup").click()]);
  const saved = await readFile(await file.path(), "utf8");
  const archive = JSON.parse(saved);
  assert.equal(archive.version, 6);
  const [checked, blocked, generated] = archive.payload.campaign[PLAY_ACTIONS_KEY];
  assert.deepEqual(checked.roll, { ruleset: "m01", source: "table", stat: "physique", rawStat: 40, masteryRank: 15,
    situation: 2, threshold: 15, dice: [1, 1, 1, 1, 1] });
  assert.equal(checked.sceneId, original.activeSceneId);
  assert.equal(blocked.roll, null);
  assert.equal(generated.roll.source, "studio");
  assert.deepEqual(generated.roll.dice, generatedDice);
  assert.deepEqual(archive.payload.campaign.characters, original.characters);
  assert.deepEqual(archive.payload.campaign.creatures, original.creatures);
  assert.deepEqual(archive.payload.campaign.scenes, original.scenes);

  const { page: restored } = await browser.open("jeu-restaure", { viewport: { width: 390, height: 844 } });
  await restore(restored, browser.url, saved, 3);
  await restored.locator("#nav-play").click();
  await restored.locator("#jump-scene").selectOption(original.activeSceneId);
  const restoredJournal = restored.locator("#play-actions-list");
  await restoredJournal.locator("summary").filter({ hasText: intent }).click();
  await restoredJournal.getByText(consequence, { exact: true }).waitFor();
});

test("Les verdicts du Studio suivent le moteur historique M01 servi au navigateur", { timeout: 35000 }, async t => {
  const browser = await browserFixture(t);
  const { page } = await browser.open("jeu-parite");
  await page.goto(browser.url);
  const result = await page.evaluate(async () => {
    const { resolveProgressionAction, STAT_NAMES } = await import("/moteur/atelier5d6-progression.js");
    const { resolvePlayAction, studioDice } = await import("/protocole.mjs");
    const cases = [
      { dice: [1, 1, 1, 1, 2], threshold: 6, rawStat: 40, masteryRank: 15 },
      { dice: [6, 6, 6, 6, 6], threshold: 40, rawStat: 1, masteryRank: 0 },
      { dice: [6, 6, 6, 6, 6], threshold: 30, rawStat: 1, masteryRank: 0 },
      { dice: [6, 6, 6, 6, 3], threshold: 27, rawStat: 1, masteryRank: 0 },
      { dice: [3, 3, 3, 3, 3], threshold: 20, rawStat: 3, masteryRank: 0 },
      { dice: [4, 4, 4, 4, 4], threshold: 21, rawStat: 13, masteryRank: 3 },
    ].map(roll => {
      const data = { ...roll, situation: 0, source: "table", stat: "physique" };
      const natural = data.dice.reduce((sum, die) => sum + die, 0);
      const native = resolveProgressionAction({ ...data, natural, feasible: true });
      const studio = resolvePlayAction({ mode: "check", roll: data });
      return [studio.title, studio.state === "success", native.success,
        studio.balance, `Naturel ${native.natural} · total ${native.total} / seuil ${data.threshold}`];
    });
    return { cases, stats: STAT_NAMES, random: studioDice(), certain: resolvePlayAction({ mode: "certain", roll: null }).title };
  });
  assert.deepEqual(result.stats, Object.keys(PLAY_STATS));
  assert.equal(result.random.length, 5);
  assert.ok(result.random.every(face => Number.isInteger(face) && face >= 1 && face <= 6));
  assert.equal(result.certain, "Action certaine · sans jet");
  assert.deepEqual(result.cases.map(([label]) => label), [
    "Échec critique mineur", "Échec", "Succès exceptionnel", "Réussite critique", "Échec de justesse", "Réussite",
  ]);
  for (const [, studio, native, balance, expected] of result.cases) {
    assert.equal(studio, native);
    assert.equal(balance, expected);
  }
});

test("Un jet validé résiste aux réessais, aux doublons et aux écritures périmées", { timeout: 35000 }, async t => {
  const browser = await browserFixture(t);
  const { page } = await browser.open("jeu-contrats");
  await page.goto(browser.url);
  const result = await page.evaluate(async text => {
    const { PLAY_ACTIONS_KEY, openStudioStore } = await import("/store.mjs");
    let disconnect = true;
    const store = await openStudioStore({ name: "protocole-fictif", injectFailure(phase, input) {
      if (disconnect && phase === "after-commit" && input.type === "record-play-action") {
        disconnect = false;
        throw new Error("acquittement perdu");
      }
    } });
    const attempt = async operation => {
      try { return await operation(); }
      catch (error) { return error.code ?? error.message; }
    };
    try {
      const campaign = await store.restoreBackup(await store.previewBackup(text));
      const roll = { ruleset: "m01", source: "studio", stat: "esprit", rawStat: 3, masteryRank: 0, situation: 0,
        threshold: 21, dice: [4, 4, 4, 4, 4] };
      const data = { id: "action-fictive", sceneId: campaign.activeSceneId, actor: "", intent: "Lire un indice", stakes: "Le temps presse",
        consequence: "Une piste se précise", mode: "check", roll, recordedAt: "2026-11-07T16:30:00.000Z" };
      const command = { id: campaign.id, operationId: "test-action", expectedRevision: campaign.revision, type: "record-play-action", data };
      const invalid = await attempt(() => store.execute({ ...command, data: { ...data, roll: { ...roll, dice: [4, 4, 4, 4, 7] } } }));
      const inactive = await attempt(() => store.execute({ ...command, data: { ...data, sceneId: campaign.scenes[1].id } }));
      const lost = await attempt(() => store.execute(command));
      const { dice, ...params } = roll;
      const retried = await store.execute({ ...command, data: { ...data, roll: { dice, ...params } } });
      const stale = await attempt(() => store.execute({ ...command, operationId: "action-perimee", data: { ...data, id: "autre-action" } }));
      const duplicate = await attempt(() => store.execute({ ...command, operationId: "action-double", expectedRevision: retried.revision }));
      const archive = JSON.parse(await store.exportBackup(campaign.id));
      const downgrade = await attempt(() => store.previewBackup(JSON.stringify({ ...archive, version: 5 })));
      return { invalid, inactive, lost, stale, duplicate, downgrade, version: archive.version,
        revision: retried.revision, actions: retried[PLAY_ACTIONS_KEY].length };
    } finally { store.close(); }
  }, initial);
  assert.deepEqual(result, { invalid: "invalid-command", inactive: "foreign-key", lost: "acquittement perdu",
    stale: "conflict", duplicate: "conflict", downgrade: "backup-version", version: 6,
    revision: original.revision + 1, actions: 1 });
});
