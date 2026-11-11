import assert from "node:assert/strict";
import { test } from "node:test";
import { browserFixture } from "./browser.mjs";

test("Accueil de découverte illustré, navigation clavier et formats étroits", { timeout: 40000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open("accueil", { reducedMotion: "reduce" });
  const response = await page.goto(new URL("accueil", fixture.url).href);
  assert.equal(response.status(), 200);
  assert.match(response.headers()["content-security-policy"], /script-src http:\/\/127\.0\.0\.1:\d+\/accueil\.mjs;/);
  await page.getByRole("heading", { level: 1, name: "Les Chroniques d’Entre-Rives" }).waitFor();
  assert.equal(await page.locator(".cover-image").evaluate(async img => {
    await img.decode();
    return img.naturalWidth;
  }), 1200);

  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), "Aller au contenu");
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => document.activeElement.id), "contenu");

  const trigger = page.getByRole("button", { name: "Parcours" });
  const menu = page.locator("#parcours-menu");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await menu.waitFor();
  assert.equal(await menu.evaluate(el => getComputedStyle(el).animationName), "none");
  await page.keyboard.press("Escape");
  await menu.waitFor({ state: "hidden" });
  assert.equal(await trigger.evaluate(el => document.activeElement === el), true);

  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 840 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `page ${width}px`);
    await trigger.click();
    assert.equal(await menu.evaluate(el => el.scrollWidth <= el.clientWidth), true, `menu ${width}px`);
    await menu.getByRole("button", { name: "Fermer" }).click();
  }

  await trigger.click();
  await menu.getByRole("link", { name: /Joueurs/ }).click();
  await menu.waitFor({ state: "hidden" });
  assert.equal(await page.evaluate(() => location.hash), "#joueurs");

  await page.getByRole("navigation", { name: "Étapes du parcours Joueurs" }).getByRole("link", { name: /Comprendre les 5d6/ }).click();
  assert.equal(await page.evaluate(() => location.hash), "#joueurs-essai");
  await page.getByText(/le total monte à 19/).waitFor();
  assert.equal(await page.locator("#joueurs-des").getAttribute("open"), "");
  await page.getByRole("navigation", { name: "Étapes du parcours Joueurs" }).getByRole("link", { name: /Préparer notre table/ }).click();
  await page.getByText("Un moyen de demander une pause ou de revenir sur une scène.", { exact: true }).waitFor();
  await page.getByRole("link", { name: "Choisir un lieu de départ" }).click();
  assert.equal(await page.evaluate(() => location.hash), "#univers-territoires");
  const atlas = page.getByRole("link", { name: "Consulter le schéma de l’Atlas" });
  assert.equal((await page.request.get(new URL(await atlas.getAttribute("href"), fixture.url).href)).status(), 200);

  await page.getByRole("link", { name: /Ouvrir le bestiaire de démonstration/ }).click();
  await page.getByRole("heading", { level: 1, name: "Bestiaire" }).waitFor();
  await page.locator("#catalogue-filter-summary").getByText("Filtres de recherche · 1", { exact: true }).waitFor();
  await page.getByRole("link", { name: "Découvrir l’univers" }).click();
  await page.getByRole("heading", { level: 1, name: "Les Chroniques d’Entre-Rives" }).waitFor();
});

test("Reprise depuis l’accueil sans transfert de données MJ dans la page de découverte", { timeout: 45000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open("reprise-accueil");
  const requests = [];
  page.on("request", request => requests.push(new URL(request.url()).pathname));
  const discovery = new URL("accueil", fixture.url).href;

  await page.goto(discovery);
  await page.getByRole("link", { name: /Reprendre ma partie/ }).click();
  await page.getByRole("status").getByText("Aucune campagne enregistrée dans ce profil.").waitFor();
  assert.equal(await page.evaluate(() => document.activeElement.id), "campaign-name");
  await page.getByRole("link", { name: "Découvrir l’univers" }).click();
  await page.getByRole("link", { name: /Créer une campagne/ }).click();
  await page.waitForFunction(() => document.activeElement.id === "campaign-name");

  const name = "Campagne fictive accueil";
  const secret = "CANARI_MJ_ACCUEIL_FICTIF";
  await page.locator("#campaign-name").fill(name);
  await page.locator("#create-campaign-submit").click();
  await page.locator("#add-scene").click();
  await page.locator("#scene-title").fill("Le passage du soir");
  await page.locator("#scene-private-notes").fill(secret);
  await page.locator("#scene-form button[type=submit]").click();
  await page.locator("#scene-dialog").waitFor({ state: "hidden" });

  requests.length = 0;
  await page.getByRole("link", { name: "Découvrir l’univers" }).click();
  await page.locator(".cover-image").evaluate(img => img.decode());
  const publicContent = await page.locator("body").textContent();
  assert.ok(!publicContent.includes(name) && !publicContent.includes(secret));
  assert.ok(!requests.some(path => path.startsWith("/moteur/") ||
    ["/app.mjs", "/bibliotheque.mjs", "/catalogue-archives.json", "/store.mjs", "/projection.mjs", "/protocole.mjs", "/atelier-bestiaire.mjs", "/opposition.mjs", "/pj-m02.mjs", "/creations.mjs"].includes(path)));

  await page.getByRole("link", { name: /Reprendre ma partie/ }).click();
  await page.locator("#current-scene-title").getByText("Le passage du soir", { exact: true }).waitFor();
  await page.locator("#current-private-notes").getByText(secret, { exact: true }).waitFor();
  assert.equal(await page.locator("#active-campaign").textContent(), name);
});
