import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { buildData } from "./build.mjs";

test("54 identités uniques pointent sur des sources uniques et documentées", async () => {
  const cards = await buildData();
  assert.equal(cards.length, 54);
  assert.equal(new Set(cards.map((x) => x.code)).size, 54);
  assert.equal(new Set(cards.map((x) => x.file)).size, 54);
  assert.equal(cards.find((x) => x.id === "eren")?.file, "PER-CB2-SOREN.md");
  assert.equal(cards.find((x) => x.id === "soren")?.file, "PER-CB1-SOREN.md");
  assert.equal(cards.find((x) => x.id === "soren")?.statut, "a_verifier");
  assert.equal(cards.find((x) => x.id === "edric")?.spoiler, true);
  assert.equal(cards.find((x) => x.id === "mirelda")?.publicationSource, true);
  assert.equal(cards.find((x) => x.id === "tomas")?.spoiler, true);
  assert.equal(cards.find((x) => x.id === "celianne")?.file, "SEC-68.md");
  assert.equal(cards.find((x) => x.id === "mael")?.file, "PER-CB38-MAEL-TORVENN.md");
  assert.equal(cards.find((x) => x.id === "cesar")?.code, "PER-CB43-CESAR");
  assert.equal(cards.find((x) => x.id === "dorrik")?.publicationSource, false);
  assert.equal(cards.find((x) => x.id === "alriana")?.spoiler, true);
  assert.equal(cards.find((x) => x.id === "heimdall")?.illustrationValidee, true);
  assert.ok(cards.every((x) => x.sources && x.ancre && x.statut));
});

test("aucune mécanique fictive ni document privé dans les accroches", async () => {
  const cards = await buildData();
  const prose = cards.map((x) => [x.accroche, x.enScene, x.rencontre, x.choix].join(" ")).join(" ");
  assert.doesNotMatch(prose, /\b(?:niveau\s*\d+|\+\d+|\d+\s*XP|bonus\s*de\s*\d+)\b/i);
  assert.doesNotMatch(prose, /(?:mot de passe|clé privée|secret MJ)/i);
  assert.ok(cards.every((x) => x.enScene && x.rencontre && x.choix));
});

test("les trois images externes sont sourcées, libres selon leur notice et non chargées par défaut", async () => {
  const cards = await buildData();
  const externes = cards.filter((x) => x.externe);
  assert.equal(externes.length, 3);
  assert.deepEqual(externes.map((x) => x.id).sort(), ["celianne", "durgan", "thalea"]);
  for (const item of externes) {
    assert.equal(item.image, null, "une référence d'ambiance ne devient pas un portrait local");
    assert.equal(item.illustrationValidee, false);
    assert.ok(item.externe.credit && item.externe.licence && item.externe.nature);
    assert.ok(item.externe.source.startsWith("https://commons.wikimedia.org/wiki/File:"));
  }
  const preview = await readFile(new URL("./preview.html", import.meta.url), "utf8");
  assert.match(preview, /let allowExternalImages=false/);
  assert.match(preview, /referrerPolicy="no-referrer"/);
  assert.match(preview, /Images externes désactivées/);
});

test("aperçu autonome reprend les données et conserve l'avertissement", async () => {
  const preview = await readFile(new URL("./preview.html", import.meta.url), "utf8");
  assert.match(preview, /id="pnj-payload"/);
  assert.match(preview, /prototype local/);
  assert.match(preview, /Proposition non jouée/);
  assert.match(preview, /png|webp/);
  assert.doesNotMatch(preview, /__PNJ_DATA__/);
  const inlineScript = preview.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];
  assert.ok(inlineScript, "Le JavaScript de navigation doit être présent");
  assert.doesNotThrow(() => new vm.Script(inlineScript), "Le JavaScript embarqué doit être syntaxiquement valide");
});
