import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { browserFixture } from "./browser.mjs";

const heroPath = "/media/entre-rives-accueil.webp";
const guardianPath = "/media/gardien-des-salines.webp";
const foxPath = "/media/renarde-de-brume.webp";
const heronPath = "/media/heron-des-lanternes.webp";

async function assertDecodedImage(locator) {
  await locator.scrollIntoViewIfNeeded();
  const image = await locator.evaluate(async element => {
    await element.decode();
    return { width: element.naturalWidth, height: element.naturalHeight, alt: element.getAttribute("alt") };
  });
  assert.ok(image.width > 0 && image.height > 0);
  assert.ok(image.alt?.trim(), "Le visuel doit disposer d’une alternative textuelle");
}

async function assertResponsive(page) {
  for (const width of [1280, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Largeur ${width}px`);
  }
}

test("Les illustrations locales se chargent dans l’accueil et le catalogue à trois largeurs", { timeout: 35000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open("illustrations-locales", {
    viewport: { width: 1280, height: 900 }, reducedMotion: "reduce",
  });
  const response = await page.goto(fixture.url);
  assert.match(response.headers()["content-security-policy"], /(?:^|;\s*)img-src 'self' data: https:(?:;|$)/);
  await assertDecodedImage(page.locator(`img.hero-illustration[src$="${heroPath}"]`));
  await assertResponsive(page);

  await page.locator("#nav-library").click();
  await page.locator('#library-shelves a[href="#rayon/bestiaire"]').click();
  for (const path of [guardianPath, foxPath, heronPath]) {
    await assertDecodedImage(page.locator(`#catalogue-list figure.catalogue-art img[src$="${path}"]`));
  }
  await assertResponsive(page);

  for (const path of [heroPath, guardianPath, foxPath, heronPath]) {
    const asset = await fetch(new URL(path, fixture.url), { method: "HEAD" });
    assert.equal(asset.status, 200);
    assert.match(asset.headers.get("content-type"), /^image\/webp\b/);
  }
});

test("Le catalogue se replie sans image et ignore les illustrations étrangères au contrat d’import", { timeout: 40000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open("illustration-provenance");
  const requestedUrls = [];
  const externalImage = "https://images.invalid/illustration-importee.webp";
  page.on("request", request => requestedUrls.push(request.url()));
  await page.route(externalImage, route => route.abort());
  await page.route(`**${heronPath}`, route => route.abort());
  await page.goto(fixture.url);
  await page.locator("#campaign-name").fill("Campagne des illustrations fictives");
  await page.locator("#create-campaign-submit").click();
  await page.locator("#view-prepare").waitFor();
  await page.locator("#nav-library").click();
  await page.locator('#library-shelves a[href="#rayon/bestiaire"]').click();

  const heron = page.locator("#catalogue-list article").filter({
    has: page.getByRole("heading", { name: "Héron des lanternes", exact: true }),
  });
  await heron.scrollIntoViewIfNeeded();
  await heron.locator(".catalogue-art-fallback").waitFor();
  await heron.locator("img.catalogue-illustration").waitFor({ state: "hidden" });
  assert.ok(requestedUrls.some(url => url.endsWith(heronPath)), "Le repli doit suivre un véritable échec de chargement");

  await page.locator("#copy-creature").click();
  await page.waitForFunction(() => document.querySelector("#save-status").textContent.trim() === "Gardien des Salines · copie sauvegardée");
  await page.locator("#nav-prepare").click();
  await page.getByRole("button", { name: "Adapter Gardien des Salines" }).click();
  const editor = page.locator("#creature-dialog");
  await assertDecodedImage(editor.locator(`#creature-art img[src$="${guardianPath}"]`));
  await page.keyboard.press("Escape");

  const archive = JSON.parse(await readFile(new URL("fixtures/campagne-pilote-v1.json", import.meta.url), "utf8"));
  const [creature] = archive.payload.campaign.creatures;
  creature.source.version = 999;
  creature.source.illustration = { src: externalImage, alt: "Illustration importée" };
  creature.illustration = creature.source.illustration;
  archive.sha256 = createHash("sha256").update(JSON.stringify(archive.payload)).digest("hex");

  await page.locator("#nav-backups").click();
  await page.locator("#backup-file").setInputFiles({
    name: "illustration-exterieure-fictive.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(archive)),
  });
  await page.locator("#backup-preview").getByRole("heading", { name: archive.payload.campaign.name }).waitFor();
  await page.locator("#restore-backup").click();
  await page.getByRole("button", { name: `Adapter ${creature.name}` }).click();
  await editor.waitFor();
  assert.equal(await editor.locator("#creature-art img").count(), 0, "Une provenance de version inconnue ne sélectionne aucune figure");
  assert.equal(requestedUrls.includes(externalImage), false);
});
