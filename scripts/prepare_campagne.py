#!/usr/bin/env python3
"""Extraire en LOCAL et EN PRIVÉ les chapitres d'un DOCX de campagne d'Alrick.

Aucun réseau, publication, changement de canon ni commit GitHub.
Bibliothèque standard Python 3.12+ uniquement.
"""
import argparse
import csv
import hashlib
import json
import re
import sys
import unicodedata
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
CHAPITRE = re.compile(r"(?i)(?:^|[🎲📖]\s*)chapitre\s+([IVXLCDM]+|\d+)\s*[—–:\-]\s*(.*)")
TOUR = re.compile(r"^\s*(\d+)\s+(.+?)\s+(\d{4}-\d\d-\d\d\s+\d\d:\d\d\s+UTC)\s*$")
MAX_XML = 100 * 1024 * 1024


def titre_fichier(s):
    a = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", a).strip("-")[:62].rstrip("-") or "sans-titre"


def lire_docx(source):
    if source.suffix.lower() != ".docx" or not zipfile.is_zipfile(source):
        raise ValueError("Un véritable fichier .docx est nécessaire.")
    with zipfile.ZipFile(source) as archive:
        if "word/document.xml" not in archive.namelist():
            raise ValueError("Le DOCX ne contient pas word/document.xml.")
        if archive.getinfo("word/document.xml").file_size > MAX_XML:
            raise ValueError("XML décompressé trop volumineux (> 100 Mio).")
        racine = ET.fromstring(archive.read("word/document.xml"))
    corps = racine.find(W + "body")
    if corps is None:
        raise ValueError("Corps de document introuvable.")
    for i, p in enumerate(corps.iter(W + "p"), 1):
        style_node = p.find("./" + W + "pPr/" + W + "pStyle")
        style = style_node.get(W + "val", "") if style_node is not None else ""
        parties = []
        for x in p.iter():
            if x.tag == W + "t" and x.text:
                parties.append(x.text)
            elif x.tag == W + "tab":
                parties.append("\t")
            elif x.tag in (W + "br", W + "cr"):
                parties.append("\n")
        t = "".join(parties).strip()
        if t:
            yield {"paragraphe": i, "style": style, "texte": t}


def preparer(source, session, sortie, depot_public):
    source, sortie, depot_public = source.resolve(), sortie.resolve(), depot_public.resolve()
    if not re.fullmatch(r"CB\d{1,4}", session):
        raise ValueError("Session attendue : CB44, CB45, etc.")
    if not source.is_file():
        raise FileNotFoundError(source)
    if source.is_relative_to(depot_public) or sortie.is_relative_to(depot_public):
        raise ValueError("Refus : la source et la sortie doivent rester HORS du dépôt public.")
    if sortie.exists() and any(sortie.iterdir()):
        raise FileExistsError("Dossier de sortie non vide : " + str(sortie))
    lignes = list(lire_docx(source))
    if not lignes:
        raise ValueError("Aucun texte trouvé.")
    sha = hashlib.sha256(source.read_bytes()).hexdigest()
    chapitres = []
    nombres = Counter()
    tour_courant = None
    tours = 0
    chapitre_courant = None
    for ligne in lignes:
        texte, idx = ligne["texte"], ligne["paragraphe"]
        t = TOUR.match(texte) if ligne["style"].lower().startswith("heading1") else None
        if t:
            tour_courant = {"numero": int(t.group(1)), "auteur": t.group(2), "source": t.group(3)}
            tours += 1
        match = CHAPITRE.search(texte)
        if match:
            numero, titre = match.group(1).upper(), match.group(2).strip()
            nombres[numero] += 1
            n = nombres[numero]
            identifiant = f"{session}-CH-{numero}-{n:03d}"
            fichier = f"chapitres/{identifiant}-{titre_fichier(titre)}.md"
            chapitre_courant = {
                "id": identifiant, "numero": numero, "titre": titre,
                "debut": idx, "fin": idx, "tour": tour_courant, "fichier": fichier, "_lignes": []
            }
            chapitres.append(chapitre_courant)
        if chapitre_courant:
            chapitre_courant["fin"] = idx
            chapitre_courant["_lignes"].append(ligne)
    sortie.mkdir(parents=True)
    (sortie / "chapitres").mkdir()
    with (sortie / "transcription_integrale.md").open("w", encoding="utf-8") as out:
        out.write(f"# Transcription PRIVÉE {session}\n\nSource : {source.name}; SHA256 : {sha}\n\n")
        for ligne in lignes:
            out.write(f"<!-- paragraphe {ligne['paragraphe']} -->\n{ligne['texte']}\n\n")
    for c in chapitres:
        with (sortie / c["fichier"]).open("w", encoding="utf-8") as out:
            out.write(f"# Chapitre {c['numero']} — {c['titre']}\n\n")
            out.write(f"> Source privée : {session}, paragraphes {c['debut']}–{c['fin']}.\n")
            out.write("> Transcription : ne constitue pas à elle seule le canon joué.\n\n")
            for ligne in c["_lignes"]:
                out.write(f"<!-- paragraphe {ligne['paragraphe']} -->\n{ligne['texte']}\n\n")
    with (sortie / "index_chapitres.csv").open("w", encoding="utf-8-sig", newline="") as out:
        writer = csv.writer(out)
        writer.writerow(["id", "chapitre", "titre", "paragraphe_debut", "paragraphe_fin", "fichier", "auteur"])
        for c in chapitres:
            writer.writerow([c["id"], c["numero"], c["titre"], c["debut"], c["fin"], c["fichier"], (c["tour"] or {}).get("auteur", "")])
    manifest = {
        "schema": "alrick-import-v1", "session": session, "original": source.name,
        "sha256_original": sha, "extraction_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "paragraphes_extraits": len(lignes), "tours_detectes": tours,
        "chapitres_detectes": len(chapitres),
        "chapitres": [{k: v for k, v in c.items() if k != "_lignes"} for c in chapitres],
        "limites": [
            "Images, commentaires, pieds de page et mise en forme non entièrement extraits.",
            "Les paragraphes ne sont pas des pages Word.",
            "Une narration ou proposition MJ ne vaut pas automatiquement fait joué.",
            "Les numéros de chapitre répétés sont conservés comme occurrences séparées."
        ]
    }
    (sortie / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (sortie / "A_RECONCILIER.md").write_text(
        f"# Relecture canonique — {session}\n\n"
        "- [ ] Faits joués et corrections annulées : noter ID du chapitre et paragraphe.\n"
        "- [ ] Personnages, relations et engagements réellement acceptés.\n"
        "- [ ] Atlas, magie, institutions, Maison, projets et créations non jouées.\n"
        "- [ ] Rechercher les anciens codes/alias avant toute nouvelle fiche.\n"
        "- [ ] Questions de canon numérotées pour le créateur.\n"
        "- [ ] Point de reprise exact (lieu, présents, dernière action, projets ouverts).\n"
        "- [ ] Rédiger une PR publique après revue et autorisation.\n"
        "- [ ] Composer une chronique éditoriale DISTINCTE du brut.\n\n"
        "Aucun fichier n'a été publié ou envoyé sur GitHub.\n", encoding="utf-8"
    )
    return manifest


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("docx", type=Path)
    cli.add_argument("--session", required=True, help="Exemple : CB44")
    cli.add_argument("--sortie", type=Path, required=True, help="Dossier PRIVÉ et vide hors du dépôt")
    a = cli.parse_args()
    try:
        result = preparer(a.docx, a.session.upper(), a.sortie, Path(__file__).resolve().parent.parent)
    except (OSError, ValueError, ET.ParseError, zipfile.BadZipFile) as exc:
        cli.exit(2, "Erreur : " + str(exc) + "\n")
    print(f"Import PRIVÉ {result['session']}: {result['chapitres_detectes']} chapitres, {result['tours_detectes']} tours.")
    print("Aucun changement GitHub, aucun fait canonique créé.")


if __name__ == "__main__":
    main()
