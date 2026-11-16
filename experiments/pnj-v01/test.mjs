import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { buildData } from "./build.mjs";

test("30 identités uniques pointent sur des sources uniques et documentées", async () => {
  const cards = await buildData();
  assert.equal(cards.length, 30);
  assert.equal(new Set(cards.map((x) => x.code)).size, 30);
  assert.equal(new Set(cards.map((x) => x.file)).size, 30);
  assert.equal(cards.find((x) => x.id === "eren")?.file, "PER-CB2-SOREN.md");
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
