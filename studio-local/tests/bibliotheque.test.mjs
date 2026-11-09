import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { FRESQUE_MARKERS_KEY, FRESQUE_REFERENCE_KEY, LIBRARY_SOURCE_SCHEMAS } from "../store.mjs";
import { browserFixture } from "./browser.mjs";

const initial = await readFile(new URL("./fixtures/campagne-pilote-v1.json", import.meta.url), "utf8");
const original = JSON.parse(initial).payload.campaign;
const archivesSource = {
  sourceSchema: LIBRARY_SOURCE_SCHEMAS.archives,
  sourceId: "GEO-013",
  sourceVersion: "0f6c38013bda50d4ad9470f8672a0343b6959c5d",
};
const archivesUrl = "https://github.com/Sijiel44/archives-alrick/blob/88f774f3d0d6d520d8d11443b72202b9caf4f94b/content/lieux/GEO-013.md";

async function restore(page, url, text) {
  await page.goto(url);
  await page.locator("#nav-backups").click();
  await page.locator("#save-status").getByText("Stockage local prêt").waitFor();
  await page.locator("#backup-file").setInputFiles({
    name: "campagne-fictive.json", mimeType: "application/json", buffer: Buffer.from(text),
  });
  await page.locator("#restore-backup").click();
  await page.locator("#prepare-title").waitFor();
}

async function exportArchive(page) {
  await page.locator("#nav-backups").click();
  const [file] = await Promise.all([page.waitForEvent("download"), page.locator("#export-backup").click()]);
  return readFile(await file.path(), "utf8");
}

async function saveForm(page, id) {
  await page.locator(`#${id}-form button[type=submit]`).click();
  await page.locator(`#${id}-dialog`).waitFor({ state: "hidden" });
}

test("Fiches des Archives, recherche en séance et restauration d’une variante privée", { timeout: 65000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open("bibliotheque-archives", { viewport: { width: 1280, height: 860 } });
  await page.goto(fixture.url);
  await page.locator("#nav-library").click();
  await page.locator('#library-shelves a[href="#rayon/atlas"]').click();
  const cards = page.locator("#catalogue-list article");
  const preview = page.locator("#resource-dialog");
  await page.locator("#catalogue-origin").selectOption("archives");
  await page.locator("#catalogue-type").selectOption("place");
  await page.locator("#catalogue-group").selectOption("Villes");
  await page.locator("#catalogue-count").getByText("7 fiches", { exact: true }).waitFor();
  await page.locator("#catalogue-search").fill("eaux dornael");
  assert.equal(await cards.count(), 1);
  const open = cards.getByRole("button", { name: "Voir la fiche de Dornaël" });
  await open.focus();
  await page.keyboard.press("Enter");
  assert.equal(await preview.locator("#resource-source-link").getAttribute("href"), archivesUrl);
  assert.equal(await preview.getByRole("button", { name: "Créer une variante" }).isDisabled(), true);
  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 840 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `bibliothèque ${width}px`);
    assert.equal(await preview.evaluate(el => el.scrollWidth <= el.clientWidth), true, `fiche ${width}px`);
  }
  await page.keyboard.press("Escape");
  assert.equal(await open.evaluate(el => el === document.activeElement), true);

  await page.setViewportSize({ width: 1280, height: 860 });
  await restore(page, fixture.url, initial);
  await page.locator("#nav-play").click();
  await page.locator("#cockpit-search").fill("GEO-013");
  await page.locator("#cockpit-results").getByRole("button", { name: "Ouvrir la fiche de Dornaël" }).click();
  const officialDescription = await page.locator("#resource-description").textContent();
  await preview.getByRole("button", { name: "Créer une variante" }).click();
  assert.equal(await page.locator("#marker-title").inputValue(), "Dornaël");
  assert.equal(await page.locator("#marker-kind").inputValue(), "place");
  assert.equal(await page.locator("#marker-scene").inputValue(), original.activeSceneId);
  assert.equal(await page.locator("#marker-description").inputValue(), officialDescription);
  const title = "Dornaël sous la pluie";
  const secret = "CANARI_FICTIF_VARIANTE_MJ";
  await page.locator("#marker-title").fill(title);
  await page.locator("#marker-description").fill(secret);
  await saveForm(page, "marker");
  const card = page.locator("#play-marker-list li").filter({ hasText: title });
  await card.locator("summary").click();
  await card.getByText(/Provenance · Archives · Dornaël · GEO-013/).waitFor();
  await page.locator("#share-title").check();
  await page.locator("#show-projection").click();
  assert.doesNotMatch(await page.locator("#projection iframe").getAttribute("srcdoc"), /CANARI_FICTIF_VARIANTE_MJ|GEO-013|Dornaël/);
  await page.locator("#stop-projection").click();

  await page.locator("#nav-library").click();
  await page.locator('#library-shelves a[href="#rayon/atlas"]').click();
  await page.locator("#catalogue-origin").selectOption("archives");
  await cards.getByRole("button", { name: "Voir la fiche de Dornaël" }).click();
  assert.equal(await page.locator("#resource-description").textContent(), officialDescription);
  await preview.getByRole("button", { name: "Fermer la fiche" }).click();
  await page.locator("#catalogue-origin").selectOption("variant");
  await cards.getByRole("button", { name: `Voir la fiche de ${title}` }).click();
  assert.equal(await preview.locator("#resource-source-link").getAttribute("href"), archivesUrl);
  await preview.getByRole("button", { name: "Modifier le repère" }).click();
  await page.locator("#marker-scene").selectOption("");
  await saveForm(page, "marker");

  const saved = await exportArchive(page);
  const archive = JSON.parse(saved);
  assert.equal(archive.version, 5);
  const [marker] = archive.payload.campaign[FRESQUE_MARKERS_KEY];
  assert.equal(marker.sceneId, null);
  assert.equal(marker.description, secret);
  assert.deepEqual(marker[FRESQUE_REFERENCE_KEY], archivesSource);
  const { page: restored } = await fixture.open("bibliotheque-restauree", { viewport: { width: 390, height: 844 } });
  await restore(restored, fixture.url, saved);
  const reserve = restored.locator("#marker-reserve-list");
  await reserve.getByText(title, { exact: true }).click();
  await reserve.getByText(/Provenance · Archives · Dornaël · GEO-013/).waitFor();
});

test("Fiches du MJ, niveaux exacts et copie d’un repère entre deux campagnes", { timeout: 65000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open("bibliotheque-mj");
  await restore(page, fixture.url, initial);
  await page.locator("#add-character").click();
  await page.locator("#character-name").fill("Noé le batelier");
  await page.locator("#character-level").fill("16");
  await saveForm(page, "character");
  await page.locator("#nav-library").click();
  await page.locator('#library-shelves a[href="#rayon/campagne"]').click();
  const cards = page.locator("#catalogue-list");
  const query = page.locator("#catalogue-search");
  await page.locator("#catalogue-level").selectOption("6");
  assert.deepEqual(await cards.getByRole("heading").allTextContents(), [original.characters[0].name]);
  await page.locator("#catalogue-level").selectOption("");
  await query.fill("niveau 6");
  assert.deepEqual(await cards.getByRole("heading").allTextContents(), [original.characters[0].name]);
  await query.fill(original.characters[0].notes);
  await page.locator("#catalogue-empty").waitFor();
  await query.clear();

  const title = "La boussole muette";
  const detail = "Canari fictif du repère · la boussole tremble à marée basse.";
  await page.locator("#library-add-marker").click();
  await page.locator("#marker-title").fill(title);
  await page.locator("#marker-description").fill(detail);
  await saveForm(page, "marker");
  const source = JSON.parse(await exportArchive(page)).payload.campaign;

  await page.locator("#nav-home").click();
  await page.locator("#campaign-name").fill("Seconde campagne fictive");
  await page.locator("#create-campaign-submit").click();
  await page.locator("#active-campaign").getByText("Seconde campagne fictive", { exact: true }).waitFor();
  await page.locator("#nav-play").click();
  await page.locator("#cockpit-search").fill("boussole muette");
  assert.equal(await page.locator("#cockpit-results li").count(), 0);
  await page.locator("#nav-library").click();
  await page.locator('#library-shelves a[href="#rayon/campagne"]').click();
  await page.locator("#catalogue-origin").selectOption("personal");
  await query.fill("boussole maree");
  assert.equal(await cards.getByText(detail).count(), 0);
  await cards.getByRole("button", { name: `Voir la fiche de ${title}` }).click();
  const preview = page.locator("#resource-dialog");
  await preview.getByText(detail, { exact: true }).waitFor();
  assert.equal(await preview.getByRole("link").count(), 0);
  await preview.getByRole("button", { name: "Copier comme repère" }).click();
  assert.equal(await page.locator("#marker-description").inputValue(), detail);
  await page.locator("#marker-title").fill("La boussole du marin");
  await saveForm(page, "marker");
  const copy = JSON.parse(await exportArchive(page));
  const [copied] = copy.payload.campaign[FRESQUE_MARKERS_KEY];
  assert.equal(copy.version, 5);
  assert.notEqual(copied.id, source[FRESQUE_MARKERS_KEY][0].id);
  assert.deepEqual(copied[FRESQUE_REFERENCE_KEY], {
    sourceSchema: LIBRARY_SOURCE_SCHEMAS.campaign,
    sourceId: source[FRESQUE_MARKERS_KEY][0].id,
    sourceCampaignId: source.id,
    sourceVersion: source.revision,
  });

  await page.locator("#nav-library").click();
  await page.locator('#library-shelves a[href="#rayon/campagne"]').click();
  await cards.getByRole("button", { name: `Voir la fiche de ${title}` }).click();
  await preview.getByRole("button", { name: "Ouvrir la campagne source" }).click();
  await page.locator("#catalogue-context").getByText(`Destination des copies · ${source.name}`, { exact: true }).waitFor();
  await cards.getByRole("button", { name: `Voir la fiche de ${title}` }).click();
  await preview.getByRole("button", { name: "Modifier le repère" }).click();
  assert.equal(await page.locator("#marker-title").inputValue(), title);
  assert.equal(await page.locator("#marker-description").inputValue(), detail);
});

test("Provenance validée, copie idempotente et refus d’une archive rétrogradée", { timeout: 35000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open("bibliotheque-contrat");
  await page.goto(fixture.url);
  const result = await page.evaluate(async ({ text, provenance }) => {
    const { openStudioStore, FRESQUE_MARKERS_KEY } = await import("/store.mjs");
    const store = await openStudioStore({ name: "contrat-bibliotheque-fictive" });
    const attempt = async operation => {
      try { return await operation(); }
      catch (error) { return error.code; }
    };
    try {
      const campaign = await store.restoreBackup(await store.previewBackup(text));
      const data = { id: "variante-fictive", kind: "place", title: "Dornaël", description: "", sceneId: null, provenance };
      const command = { id: campaign.id, expectedRevision: campaign.revision, operationId: "variante-1", type: "copy-library-marker", data };
      const foreign = await attempt(() => store.execute({ ...command, data: { ...data, sceneId: "autre-campagne" } }));
      const invalid = await attempt(() => store.execute({ ...command, data: { ...data, provenance: { ...provenance, sourceVersion: 1 } } }));
      const saved = await store.execute(command);
      const reordered = { sourceVersion: provenance.sourceVersion, sourceId: provenance.sourceId, sourceSchema: provenance.sourceSchema };
      const retried = await store.execute({ ...command, data: { ...data, provenance: reordered } });
      const duplicate = await attempt(() => store.execute({ ...command, expectedRevision: saved.revision, operationId: "variante-2" }));
      const archive = JSON.parse(await store.exportBackup(campaign.id));
      const downgrade = await attempt(() => store.previewBackup(JSON.stringify({ ...archive, version: 4 })));
      return { foreign, invalid, duplicate, downgrade, version: archive.version,
        count: saved[FRESQUE_MARKERS_KEY].length, revisions: [saved.revision, retried.revision] };
    } finally { store.close(); }
  }, { text: initial, provenance: archivesSource });
  assert.deepEqual(result, {
    foreign: "foreign-key", invalid: "invalid-command", duplicate: "conflict", downgrade: "backup-version",
    version: 5, count: 1, revisions: [original.revision + 1, original.revision + 1],
  });
});

test("La bibliothèque pagine les fiches et repart au début après un filtre", { timeout: 35000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open("bibliotheque-pagination");
  await page.goto(fixture.url);
  await page.evaluate(async () => {
    const { openStudioStore } = await import("/store.mjs");
    const store = await openStudioStore();
    try {
      const id = "campagne-pagination-fictive";
      let campaign = await store.execute({ id, expectedRevision: 0, operationId: "creation", type: "create",
        data: { name: "Campagne de pagination fictive", description: "", style: "campaign", startingLevel: 1 } });
      for (let index = 1; index <= 25; index += 1) {
        const markerId = `repere-${index}`;
        campaign = await store.execute({ id, expectedRevision: campaign.revision, operationId: markerId, type: "save-fresque-marker",
          data: { id: markerId, title: `Repère de recette ${index}`, kind: "lead", description: "", sceneId: null } });
      }
    } finally { store.close(); }
  });
  await page.reload();
  await page.locator("#save-status").getByText("Stockage local prêt").waitFor();
  await page.locator("#nav-library").click();
  await page.locator('#library-shelves a[href="#rayon/campagne"]').click();
  const cards = page.locator("#catalogue-list article");
  const status = page.locator("#catalogue-count");
  await status.getByText("25 fiches · page 1 sur 2", { exact: true }).waitFor();
  assert.equal(await cards.count(), 24);
  await page.locator("#catalogue-next").click();
  await status.getByText("25 fiches · page 2 sur 2", { exact: true }).waitFor();
  assert.equal(await cards.count(), 1);
  assert.equal(await status.evaluate(el => el === document.activeElement), true);
  await page.locator("#catalogue-search").fill("recette 25");
  assert.deepEqual(await cards.getByRole("heading").allTextContents(), ["Repère de recette 25"]);
  await page.locator("#catalogue-pages").waitFor({ state: "hidden" });
});
