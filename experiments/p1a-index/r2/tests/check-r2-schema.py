"""Draft 2020-12 real validation, not a schema-engine substitute. std run: python tests/check-r2-schema.py"""
import json,copy,sys
from pathlib import Path
from jsonschema import Draft202012Validator
root=Path(__file__).resolve().parents[1]
s=json.loads((root/'schema/DATA_MODEL_P1A_R2.profile.schema.json').read_text())
Draft202012Validator.check_schema(s)
validator=Draft202012Validator(s)
f=json.loads((root/'fixtures/R2_SYNTHETIC_CHAIN.json').read_text())
valid=0
for i,r in enumerate(f['records']):
 errors=list(validator.iter_errors(r))
 if errors:raise AssertionError((i,r.get('recordId'),[(e.json_path,e.message) for e in errors]))
 valid+=1
negative=[]
for label,change in [
 ('missing-node',lambda x:x.pop('nodeType')),
 ('wrong-version',lambda x:x.update(schema='unknown.p1')),
 ('played-without-evidence',lambda x:(x['continuity'].update(scope='universe',playedStatus='played'))),
 ('canon-without-evidence',lambda x:(x['continuity'].update(scope='universe',referenceStatus='canon'))),
 ('published-without-evidence',lambda x:(x['continuity'].update(scope='universe',publicationStatus='published'))),
 ('rights-unknown-public',lambda x:x['media'][0].update(visibility='public-candidate')),
 ('private-public-fields',lambda x:x['privacy'].update(publicFields=['privacy.notes'])),
 ('wrong-node',lambda x:x.update(nodeType='something-else')),
 ('missing-variant-base',lambda x:x['data'].pop('variantOf',None)),
]:
 x=copy.deepcopy(f['records'][6] if label=='missing-variant-base' else f['records'][0]);change(x)
 if validator.is_valid(x):raise AssertionError('Schema negative unexpectedly passed: '+label)
 negative.append(label)
# The prior 11 R1 records remain R1-valid; R2 does not silently upgrade them.
r1=json.loads((root.parent/'fixtures/P1A_FICTION_11_RECORDS.json').read_text())
baseSchema=json.loads((root.parent/'schema/DATA_MODEL_P1A.schema.json').read_text())
Draft202012Validator.check_schema(baseSchema)
assert len(r1)==11
assert all(Draft202012Validator(baseSchema).is_valid(x) for x in r1)
assert all(not validator.is_valid(x) for x in r1)
print(json.dumps({'schema':'Draft202012','schemaCheck':'PASS','r2_positive':valid,'r2_negative':len(negative),'negative_cases':negative,'original_r1_untouched':len(r1),'no_implicit_upgrade':True},ensure_ascii=False))
