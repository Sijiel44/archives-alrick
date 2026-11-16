import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { buildData } from "./build.mjs";

test("au moins 102 identités uniques pointent sur des sources uniques et documentées", async () => {
  const cards = await buildData();
  assert.ok(cards.length >= 102);
  assert.equal(new Set(cards.map((x) => x.code)).size, cards.length);
  assert.equal(new Set(cards.map((x) => x.file)).size, cards.length);
  assert.equal(cards.find((x) => x.id === "eren")?.file, "PER-CB2-SOREN.md");
  assert.equal(cards.find((x) => x.id === "soren")?.file, "PER-CB1-SOREN.md");
  assert.equal(cards.find((x) => x.id === "soren")?.statut, "a_verifier");
  assert.equal(cards.find((x) => x.id === "edric")?.spoiler, true);
  assert.equal(cards.find((x) => x.id === "mirelda")?.publicationSource, true);
  assert.equal(cards.find((x) => x.id === "tomas")?.spoiler, true);
  assert.equal(cards.find((x) => x.id === "celianne")?.file, "SEC-68.md");
  assert.equal(cards.find((x) => x.id === "mael")?.file, "PER-CB38-MAEL-TORVENN.md");
  assert.equal(cards.find((x) => x.id === "cesar")?.code, "PER-CB43-CESAR");
  assert.equal(cards.find((x) => x.id === "dorrik")?.publicationSource, true);
  assert.equal(cards.find((x) => x.id === "alriana")?.spoiler, true);
  assert.equal(cards.find((x) => x.id === "heimdall")?.illustrationValidee, true);
  assert.ok(cards.every((x) => x.sources && x.ancre && x.statut));
});

test("lot 004 : identités, consentement, publication sourcée et illustration conceptuelle", async () => {
  const cards = await buildData();
  const byId = Object.fromEntries(cards.map((x) => [x.id, x]));
  const lot = ["oren", "yse", "dagna_cuivre", "eren_valombre", "liora", "vaska", "nerys_silvenaine", "farwen", "lurne", "margha", "naeline", "nahla"];
  assert.equal(lot.filter((id) => byId[id]).length, 12);
  assert.equal(byId.eren_valombre.code, "RES-08");
  assert.notEqual(byId.eren_valombre.code, byId.eren.code);
  assert.equal(byId.nerys_silvenaine.code, "RES-13");
  assert.equal(byId.lurne.code, "RES-15");
  assert.equal(byId.margha.code, "RES-16");
  assert.equal(byId.nahla.code, "PER-CB43-NAHLA-SEREVIN");
  assert.deepEqual(["dagna_cuivre", "liora", "vaska", "nerys_silvenaine", "farwen"].map((id) => byId[id].publicationSource), [true, true, true, true, true]);
  assert.ok(lot.slice(2).every((id) => byId[id].spoiler));
  assert.match(byId.naeline.image, /naeline-concept-v01\.webp$/);
  assert.equal(byId.naeline.illustrationValidee, false);
  assert.ok(cards.filter((x) => x.image).length >= 18);
});

test("lot 005 : homonymes marins, morts non rappelés, emplois joués et images conceptuelles", async () => {
  const cards = await buildData();
  const byId = Object.fromEntries(cards.map((x) => [x.id, x]));
  const lot = ["saelor", "silan", "orvak", "soren_malderive", "bromvar", "edran", "aurelian", "hroldan", "tavian", "elwen", "beren", "mara_ventrevent"];
  assert.equal(lot.filter((id) => byId[id]).length, 12);
  assert.deepEqual(["saelor", "soren_malderive", "edran"].map((id) => byId[id].publicationSource), [true, true, true]);
  assert.deepEqual(["saelor", "soren_malderive"].map((id) => byId[id].statut), ["projet_en_cours", "projet_en_cours"]);
  assert.equal(byId.edran.statut, "lore_valide");
  assert.equal(byId.edran.code, "RES-20");
  assert.equal(byId.hroldan.code, "SEC-75");
  assert.equal(byId.elwen.code, "SEC-66");
  assert.equal(byId.beren.code, "RES-26");
  assert.equal(byId.mara_ventrevent.code, "RES-27");
  assert.notEqual(byId.soren_malderive.code, byId.soren.code);
  assert.notEqual(byId.soren_malderive.code, byId.eren.code);
  assert.notEqual(byId.mara_ventrevent.code, byId.mara.code);
  assert.ok(lot.every((id) => byId[id].spoiler));
  assert.match(byId.mara_ventrevent.image, /mara-ventrevent-concept-v01\.webp$/);
  assert.equal(byId.mara_ventrevent.illustrationValidee, false);
  assert.ok(cards.filter((x) => x.image).length >= 18);

  const edranSource = await readFile(new URL("../../content/personnages/PER-CB42-RES-20-EDRAN-VEILLE-AU-FEU.md", import.meta.url), "utf8");
  assert.match(edranSource, /Edran est \*\*décédé\*\*/i);
  assert.match(edranSource, /aucun Rappel joué/i);
  const elwenSource = await readFile(new URL("../../content/personnages/PER-CB43-ELWEN-SAUREL.md", import.meta.url), "utf8");
  assert.match(elwenSource, /espèce actuelle n'est pas déterminée/i);
});

test("lot 006 : cultures, représentations non signées et homonymes documentaires", async () => {
  const cards = await buildData();
  const byId = Object.fromEntries(cards.map((x) => [x.id, x]));
  const lot = ["teodan", "mara_belden", "helene_varrec", "jorven", "hervald", "corin_avarenne", "sigrun_varek", "dorsa", "sigrun_pierreval", "reginald", "yrsa", "garrik"];
  assert.equal(lot.filter((id) => byId[id]).length, 12);
  assert.ok(lot.every((id) => byId[id].publicationSource === true));
  assert.equal(byId.hervald.file, "SEC-73.md");
  assert.equal(byId.hervald.spoiler, true);
  assert.match(byId.hervald.image, /hervald-trois-sillons-concept-v01\.webp$/);
  assert.equal(byId.hervald.illustrationValidee, false);
  assert.ok(cards.filter((x) => x.image).length >= 18);
  assert.notEqual(byId.mara_belden.code, byId.mara.code);
  assert.notEqual(byId.mara_belden.code, byId.mara_ventrevent.code);
  assert.notEqual(byId.sigrun_varek.code, byId.sigrun_pierreval.code);
  assert.notEqual(byId.reginald.code, byId.garrik.code);
  assert.deepEqual([byId.sigrun_varek.statut, byId.dorsa.statut], ["projet_en_cours", "projet_en_cours"]);
  for (const id of ["hervald", "reginald", "dorsa"]) {
    const source = await readFile(new URL(`../../content/personnages/${byId[id].file}`, import.meta.url), "utf8");
    assert.match(source, /pistes proposées, non jouées/i);
  }
  const catalogue = await readFile(new URL("../../content/personnages/cabinet-des-rencontres-v01.md", import.meta.url), "utf8");
  assert.match(catalogue, /publish: true/);
  assert.match(catalogue, /spoilers: true/);
  assert.match(catalogue, /unlisted: true/);
});

test("lot 007 : scènes recoupées, limites temporelles et source unique", async () => {
  const cards = await buildData();
  const byId = Object.fromEntries(cards.map((x) => [x.id, x]));
  const lot = ["borin", "corven", "dac", "tairin", "amelia", "maelys", "nevane", "levara", "harald_lion", "halstor", "sevrane", "vardhena"];
  assert.equal(lot.filter((id) => byId[id]).length, 12);
  assert.ok(lot.every((id) => byId[id].publicationSource));
  assert.equal(byId.borin.code, "FAM-04");
  assert.equal(byId.dac.code, "SEC-07");
  assert.equal(byId.amelia.code, "IMP-15");
  assert.equal(byId.harald_lion.code, "REV-13");
  assert.notEqual(byId.harald_lion.code, byId.harald.code);
  assert.notEqual(byId.maelys.code, byId.garrik.code);
  assert.equal(byId.sevrane.code, "REN-63");
  assert.match(byId.sevrane.image, /sevrane-concept-v01\.webp$/);
  assert.equal(byId.sevrane.illustrationValidee, false);
  assert.ok(cards.filter((x) => x.image).length >= 18);
  for (const id of ["borin", "nevane", "sevrane", "amelia"]) {
    const source = await readFile(new URL(`../../content/personnages/${byId[id].file}`, import.meta.url), "utf8");
    assert.match(source, /propositions non jouées/i);
  }
  const borin = await readFile(new URL("../../content/personnages/FAM-04.md", import.meta.url), "utf8");
  assert.match(borin, /décédé, non Rappelé en CB43/i);
  const nevane = await readFile(new URL("../../content/personnages/REV-09.md", import.meta.url), "utf8");
  assert.match(nevane, /première Revenante d'honneur/i);
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
