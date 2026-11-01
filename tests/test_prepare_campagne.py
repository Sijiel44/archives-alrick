"""Tests sans aucune donnée privée : DOCX synthétique construit à la volée."""
import importlib.util
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

SCRIPT = Path(__file__).resolve().parent.parent / "scripts" / "prepare_campagne.py"
spec = importlib.util.spec_from_file_location("prepare_campagne", SCRIPT)
imp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(imp)


def docx_test(path):
    # Ce test ne télécharge ni ne copie une vraie campagne.
    xml = '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'
    rows = [
        ("Heading1", "1  Alexandre    2026-10-30 10:00 UTC"),
        ("Normal", "Une action libre du joueur."),
        ("Heading2", "Chapitre CCCX — Un nouveau départ"),
        ("Normal", "Une scène sans titre."),
        ("Heading2", "Chapitre CCCX — Suite du même chapitre"),
        ("Normal", "Un second passage."),
    ]
    for style, title in rows:
        xml += f'<w:p><w:pPr><w:pStyle w:val="{style}"/></w:pPr><w:r><w:t>{title}</w:t></w:r></w:p>'
    xml += '</w:body></w:document>'
    with ZipFile(path, "w") as f:
        f.writestr("word/document.xml", xml)


class ImportPriveTest(unittest.TestCase):
    def test_chapitres_et_occurrences_distinctes(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / "CB44.docx"
            docx_test(source)
            sortie = root / "index"
            data = imp.preparer(source, "CB44", sortie, SCRIPT.parent.parent)
            self.assertEqual(data["chapitres_detectes"], 2)
            self.assertEqual(data["tours_detectes"], 1)
            self.assertEqual(data["chapitres"][0]["id"], "CB44-CH-CCCX-001")
            self.assertEqual(data["chapitres"][1]["id"], "CB44-CH-CCCX-002")
            self.assertTrue((sortie / "transcription_integrale.md").exists())
            self.assertTrue((sortie / "index_chapitres.csv").exists())
            self.assertIn("Une action libre", (sortie / "transcription_integrale.md").read_text())

    def test_depot_sources_autorise_et_sha(self):
        import hashlib
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / "CB03-01.docx"
            docx_test(source)
            sortie = root / "depot" / "sources" / "campagnes" / "CB03-01"
            data = imp.preparer(source, "CB03-01", sortie, root / "depot")
            self.assertEqual(data["sha256_original"], hashlib.sha256(source.read_bytes()).hexdigest())
            self.assertTrue((sortie / "transcription_integrale.md").exists())

    def test_sortie_dans_depot_public_refusee(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / "CB44.docx"
            docx_test(source)
            with self.assertRaisesRegex(ValueError, "sources/campagnes"):
                imp.preparer(source, "CB44", SCRIPT.parent.parent / "test-sortie", SCRIPT.parent.parent)

    def test_source_dans_depot_public_refusee(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / "CB44.docx"
            docx_test(source)
            with self.assertRaisesRegex(ValueError, "sources/campagnes"):
                imp.preparer(source, "CB44", root / "index", root)


if __name__ == "__main__":
    unittest.main()
