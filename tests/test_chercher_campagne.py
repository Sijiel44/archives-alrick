import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('search',Path(__file__).resolve().parent.parent/'scripts/chercher_campagne.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class SearchTest(unittest.TestCase):
 def test_reference_code_chapitre_utf8(self):
  with tempfile.TemporaryDirectory() as tmp:
   d=Path(tmp)/'CB03-01';d.mkdir()
   (d/'transcription_integrale.md').write_text('<!-- paragraphe 12 -->\nÉpreuve de forêt.\n',encoding='utf8')
   (d/'manifest.json').write_text(json.dumps({'chapitres':[{'id':'CB03-01-CH-IV-001','debut':10,'fin':15}]}),encoding='utf8')
   hits=m.chercher(tmp,'FORÊT','cb03-01','CH-IV');self.assertEqual(hits[0]['paragraphe'],12);self.assertEqual(hits[0]['statut'],'a_verifier')
   self.assertEqual(m.chercher(tmp,'forêt','CB02'),[])
if __name__=='__main__': unittest.main()
