import { readFile, writeFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { selection } from "./selection.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(here, "../..");

function field(frontmatter, name) {
  const match = frontmatter.match(new RegExp(`^${name}:\\s*(.*)$`, "m"));
  if (!match) return "";
  return match[1].trim().replace(/^['"]|['"]$/g, "");
}

export async function buildData() {
  const codes = new Set();
  const ids = new Set();
  const cards = [];
  for (const record of selection) {
    if (!/^[A-Za-z0-9-]+\.md$/.test(record.file)) throw new Error(`Nom de fichier invalide : ${record.file}`);
    if (ids.has(record.id)) throw new Error(`Doublon d'identifiant : ${record.id}`);
    ids.add(record.id);
    const fullPath = path.join(repository, "content/personnages", record.file);
    const markdown = await readFile(fullPath, "utf8");
    const [, meta] = markdown.split(/^---\s*$/m);
    if (!meta) throw new Error(`Métadonnées absentes : ${record.file}`);
    const code = field(meta, "code");
    if (field(meta, "categorie") !== "personnage" && !record.file.startsWith("REV-") && record.file !== "FAM-06.md") {
      throw new Error(`Catégorie non PNJ : ${record.file}`);
    }
    const title = field(meta, "title").split(" — ")[0];
    if (!code || codes.has(code)) throw new Error(`Code manquant ou doublon : ${record.file} / ${code}`);
    codes.add(code);
    if (!title || !field(meta, "canon_statut") || !field(meta, "source_brute")) {
      throw new Error(`Fiche source insuffisante : ${record.file}`);
    }
    if (["enScene", "rencontre", "choix", "accroche"].some((x) => !record[x]?.trim())) {
      throw new Error(`Vignette narrative incomplète : ${record.id}`);
    }
    const image = record.image ? `../../content/images/personnages/${record.image}` : null;
    if (record.image) {
      const info = await stat(path.join(repository, "content/images/personnages", record.image));
      if (info.size > 3 * 1024 * 1024) throw new Error(`Illustration >3 Mio : ${record.image}`);
    }
    cards.push({
      id: record.id,
      code,
      file: record.file,
      nom: title,
      groupe: record.groupe,
      symbole: record.symbole,
      accroche: record.accroche,
      enScene: record.enScene,
      rencontre: record.rencontre,
      choix: record.choix,
      image,
      illustrationValidee: Boolean(record.illustrationValidee),
      statut: field(meta, "canon_statut"),
      ancre: field(meta, "ancre_documentaire"),
      sources: field(meta, "source_brute"),
      spoiler: field(meta, "spoilers") === "true",
      publicationSource: field(meta, "publish") === "true",
    });
  }
  if (cards.length !== 42) throw new Error(`42 cartes attendues, ${cards.length} obtenues`);
  return cards;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const cards = await buildData();
  const template = await readFile(path.join(here, "index.template.html"), "utf8");
  const payload = JSON.stringify(cards).replaceAll("<", "\\u003c");
  const output = template.replace("__PNJ_DATA__", payload);
  if (output === template) throw new Error("Emplacement des données non trouvé");
  await writeFile(path.join(here, "preview.html"), output, "utf8");
  process.stdout.write(`PNJ-001 : ${cards.length} cartes, ${cards.filter((c) => c.image).length} portraits, aperçu régénéré.\n`);
}
