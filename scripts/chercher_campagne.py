"""Recherche locale dans les transcriptions de campagne, sans modifier les sources."""
import argparse
import json
import re
from pathlib import Path

MARK = re.compile(r"<!--\s*paragraphe\s+(\d+)\s*-->")

def chercher(racine, terme, code=None, chapitre=None):
    resultats = []
    for fichier in sorted(Path(racine).glob('*/transcription_integrale.md')):
        if code and fichier.parent.name.casefold() != code.casefold():
            continue
        texte = fichier.read_text(encoding='utf-8-sig')
        sections = list(MARK.finditer(texte))
        for i, match in enumerate(sections):
            passage = texte[match.end():sections[i+1].start() if i+1 < len(sections) else len(texte)].strip()
            if terme.casefold() not in passage.casefold():
                continue
            numero = int(match.group(1))
            manifeste = fichier.parent / 'manifest.json'
            chapitres = []
            if manifeste.is_file():
                data = json.loads(manifeste.read_text(encoding='utf-8-sig'))
                chapitres = [c.get('id') for c in data.get('chapitres', []) if c.get('debut', 0) <= numero <= c.get('fin', -1)]
            if chapitre and not any(chapitre.casefold() in (c or '').casefold() for c in chapitres):
                continue
            resultats.append({'source': fichier.as_posix(), 'campagne': fichier.parent.name, 'paragraphe': numero, 'chapitres': chapitres, 'passage': passage, 'statut': 'a_verifier'})
    return resultats

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('terme'); p.add_argument('--racine', type=Path, default=Path('sources/campagnes')); p.add_argument('--code'); p.add_argument('--chapitre')
    a=p.parse_args()
    if not a.terme.strip(): p.error('Le terme ne peut pas être vide')
    print(json.dumps(chercher(a.racine,a.terme,a.code,a.chapitre),ensure_ascii=False,indent=2))
if __name__ == '__main__': main()
