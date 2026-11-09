import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { browserFixture } from "./browser.mjs";
import { SESSION_ARCHIVES_KEY } from "../store.mjs";

const fixturePath = new URL("./fixtures/campagne-pilote-v1.json", import.meta.url);
const original = JSON.parse(await readFile(fixturePath, "utf8"));
const [active, confirmed] = original.payload.campaign.scenes;
const privateSummary = "CANARI_MJ_ARCHIVE · L’accord secret du veilleur.";
const nextSession = "CANARI_MJ_REPRISE · Préparer la barque.";
const chronicle = "Les aventuriers ont traversé le gué.\n<La pluie reprend.>";
const sessionTitle = "CANARI_MJ_TITRE · La nuit du gué";

async function importArchive(page, url, contents) {
  await page.goto(url);
  await page.locator("#nav-backups").click();
  await page.locator("#save-status").getByText("Stockage local prêt").waitFor();
  await page.locator("#backup-file").setInputFiles({
    name: "campagne-fictive.json", mimeType: "application/json", buffer: Buffer.from(contents),
  });
  await page.locator("#restore-backup").click();
  await page.locator("#prepare-title").waitFor();
}

async function saveSession(page) {
  await page.locator("#archive-form button[type=submit]").click();
  await page.locator("#archive-dialog").waitFor({ state: "hidden" });
}

async function download(page, selector) {
  const [file] = await Promise.all([page.waitForEvent("download"), page.locator(selector).click()]);
  return readFile(await file.path(), "utf8");
}

test("Cockpit, archive v3 et chronique approuvée avec révocation entre onglets", { timeout: 75000 }, async t => {
  const browser = await browserFixture(t);
  const { context, page } = await browser.open("archives-mj", { viewport: { width: 768, height: 1024 } });
  await importArchive(page, browser.url, JSON.stringify(original));
  await page.locator("#nav-play").click();
  await page.locator("#quick-search").click();
  assert.equal(await page.evaluate(() => document.activeElement.id), "cockpit-search");
  await page.locator("#quick-present").click();
  assert.equal(await page.evaluate(() => document.activeElement.id), "player-share-title");
  assert.equal(await page.locator("#scene-share-fields input:checked").count(), 0);
  await page.keyboard.press("Escape");
  await page.locator("#quick-notes").click();
  assert.equal(await page.evaluate(() => document.activeElement.id), "scene-private-notes");
  await page.keyboard.press("Escape");
  await page.getByRole("group", { name: "Actions rapides de séance" }).getByRole("button", { name: "Archiver la séance" }).click();
  await page.locator("#add-session").click();
  await page.locator("#session-title").fill(sessionTitle);
  await page.locator("#session-date").fill("2026-11-07");
  assert.equal(await page.locator("#session-scenes input:checked").count(), 0);
  await page.locator("#session-scenes").getByRole("checkbox", { name: confirmed.title, exact: true }).check();
  await page.locator("#session-summary").fill(privateSummary);
  await page.locator("#session-next").fill(nextSession);
  await page.locator("#session-chronicle").fill(chronicle);
  await saveSession(page);
  await page.locator("#chronicle-state").getByText("Brouillon à relire").waitFor();
  assert.equal(await page.locator("#download-chronicle").isDisabled(), true);
  assert.equal(await page.locator("#chronicle-preview").textContent(), chronicle);
  assert.equal(await page.locator("#archive-confirmed li").count(), 1);
  assert.equal(await page.locator("#archive-confirmed li").textContent(), confirmed.title);

  await page.locator("#nav-prepare").click();
  await page.locator(`[data-scene-id="${active.id}"]`).getByText("Préparée", { exact: true }).waitFor();
  await page.locator(`[data-scene-id="${confirmed.id}"]`).getByText("Jouée et confirmée", { exact: true }).waitFor();
  await page.locator("#nav-archive").click();
  await page.locator("#approve-chronicle").click();
  await page.locator("#chronicle-state").getByText("Approuvée", { exact: true }).waitFor();
  assert.equal(await download(page, "#download-chronicle"), chronicle);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async text => { window.chroniqueCopiee = text; } },
    });
  });
  await page.locator("#copy-chronicle").click();
  await page.locator("#save-status").getByText("Chronique copiée").waitFor();
  assert.equal(await page.evaluate(() => window.chroniqueCopiee), chronicle);

  const other = await context.newPage();
  await other.goto(browser.url);
  await other.locator('#campaign-dashboard [data-dashboard-view="archive"]').click();
  await other.locator("#revoke-chronicle").click();
  await other.locator("#chronicle-state").getByText("Brouillon à relire").waitFor();
  const unintendedDownloads = [];
  page.on("download", file => unintendedDownloads.push(file.suggestedFilename()));
  await page.locator("#download-chronicle").click();
  await page.getByRole("alert").getByText(/chronique ou son approbation a changé/).waitFor();
  assert.deepEqual(unintendedDownloads, []);
  await other.locator("#approve-chronicle").click();
  await other.locator("#revoke-chronicle").waitFor();
  await other.locator("#edit-session").click();
  await other.locator("#session-chronicle").fill("Une chronique corrigée.");
  await saveSession(other);
  await other.locator("#chronicle-state").getByText("Brouillon à relire").waitFor();

  await other.locator("#nav-backups").click();
  const exported = await download(other, "#export-backup");
  const archive = JSON.parse(exported);
  assert.equal(archive.version, 3);
  assert.equal(archive.payload.campaign.activeSceneId, active.id);
  assert.equal(archive.payload.campaign[SESSION_ARCHIVES_KEY][0].privateSummary, privateSummary);
  assert.equal(archive.payload.campaign[SESSION_ARCHIVES_KEY][0].chronicleApproved, false);

  const { page: restored } = await browser.open("archives-restaurees", { viewport: { width: 390, height: 844 } });
  await importArchive(restored, browser.url, exported);
  await restored.locator("#nav-home").click();
  assert.equal(await restored.locator("#dashboard-scene").textContent(), active.title);
  assert.equal(await restored.locator("#dashboard-next-text").textContent(), nextSession);
  await restored.locator('#campaign-dashboard [data-dashboard-view="archive"]').click();
  await restored.locator("#archive-summary").getByText(privateSummary).waitFor();
  assert.equal(await restored.locator("#chronicle-preview").textContent(), "Une chronique corrigée.");
  assert.equal(await restored.locator("#copy-chronicle").isDisabled(), true);
  assert.equal(await restored.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
});

test("Le stockage refuse une date invalide, une scène étrangère et un export v3 rétrogradé", { timeout: 35000 }, async t => {
  const browser = await browserFixture(t);
  const { page } = await browser.open("contrats-archives");
  await page.goto(browser.url);
  const results = await page.evaluate(async ({ source, activeId }) => {
    const { openStudioStore } = await import("/store.mjs");
    const store = await openStudioStore({ name: "contrats-archives-fictives" });
    const run = async action => {
      try { return await action(); }
      catch (error) { return error.code; }
    };
    try {
      const campaign = await store.restoreBackup(await store.previewBackup(source));
      const base = {
        id: campaign.id, expectedRevision: campaign.revision,
        type: "save-session", operationId: "premiere-archive",
      };
      const data = {
        id: "session-fictive", title: "Séance fictive", date: "2026-11-07", resumeSceneId: activeId,
        confirmedSceneIds: [], privateSummary: "", nextSession: "", chronicle: "",
      };
      const invalidDate = await run(() => store.execute({ ...base, data: { ...data, date: "2026-02-29" } }));
      const foreignScene = await run(() => store.execute({ ...base, data: { ...data, confirmedSceneIds: ["scene-etrangere"] } }));
      const saved = await store.execute({ ...base, data });
      const retry = await store.execute({ ...base, data });
      const stale = await run(() => store.execute({ ...base, operationId: "autre-operation", data }));
      const emptyApproval = await run(() => store.execute({
        id: campaign.id, expectedRevision: saved.revision, operationId: "approval-empty",
        type: "set-chronicle-approval", data: { id: data.id, approved: true },
      }));
      const backup = JSON.parse(await store.exportBackup(campaign.id));
      const downgrade = await run(() => store.previewBackup(JSON.stringify({ ...backup, version: 2 })));
      return { invalidDate, foreignScene, stale, emptyApproval, downgrade, version: backup.version,
        revisions: [campaign.revision, saved.revision, retry.revision, backup.payload.campaign.revision] };
    } finally { store.close(); }
  }, { source: JSON.stringify(original), activeId: active.id });
  const revision = original.payload.campaign.revision;
  assert.deepEqual(results, {
    invalidDate: "invalid-command", foreignScene: "foreign-key", stale: "conflict", emptyApproval: "invalid-command",
    downgrade: "backup-version", version: 3, revisions: [revision, revision + 1, revision + 1, revision + 1],
  });
});
