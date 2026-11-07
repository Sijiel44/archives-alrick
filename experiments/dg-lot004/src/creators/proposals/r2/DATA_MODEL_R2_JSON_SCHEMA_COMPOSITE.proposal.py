#!/usr/bin/env python3
"""DATA-MODEL-001.R2: normative Draft2020-12 checks, COMPOSITE checkout only.
Requires: #102 + #105 modules present, Python jsonschema package, node.
No write to repository, database, source historical records or site.
"""
import json
import pathlib
import subprocess
import sys
from jsonschema import Draft202012Validator

ROOT = pathlib.Path(__file__).resolve().parents[6]
ATELIERS = ROOT / "experiments/dg-lot004/src/creators/proposals"
INDEX = ROOT / "experiments/p1a-index"
schema_a = json.loads((ATELIERS / "DATA_MODEL_001_SCHEMA.proposal.json").read_text(encoding="utf-8"))
schema_i = json.loads((INDEX / "schema/DATA_MODEL_P1A.schema.json").read_text(encoding="utf-8"))
fixture_a = json.loads((ATELIERS / "DATA_MODEL_001_FIXTURES.proposal.json").read_text(encoding="utf-8"))["records"]
for schema in (schema_a, schema_i):
    Draft202012Validator.check_schema(schema)
def assert_valid(schema, records):
    validator = Draft202012Validator(schema)
    errors = []
    for n, record in enumerate(records):
        errors.extend((n, e.json_path, e.message) for e in validator.iter_errors(record))
    if errors:
        raise AssertionError(json.dumps(errors[:30], ensure_ascii=False))
assert_valid(schema_a, fixture_a)

# The exact #105 JS validator is applied before using its proposed index envelope.
code = """import {readFileSync} from 'node:fs';
import {bridgeR2AteliersToIndex} from './experiments/dg-lot004/src/creators/proposals/r2/DATA_MODEL_R2_BRIDGE.proposal.mjs';
import {validateModelRecord,validateModelDataset}
from './experiments/p1a-index/src/data-model.mjs';
const fixtures=JSON.parse(readFileSync('./experiments/dg-lot004/src/creators/proposals/DATA_MODEL_001_FIXTURES.proposal.json','utf8')).records;
const r=bridgeR2AteliersToIndex(fixtures,{validateRecord:validateModelRecord,validateDataset:validateModelDataset});
process.stdout.write(JSON.stringify(r.records));
"""
proc = subprocess.run(["node","--input-type=module","-e",code],cwd=ROOT,text=True,
                      capture_output=True,check=False,timeout=30)
if proc.returncode:
    raise RuntimeError("Node #105 non exécutable : " + proc.stderr[:1000])
fixture_i = json.loads(proc.stdout)
assert len(fixture_a) == len(fixture_i) == 14
assert_valid(schema_i, fixture_i)

# Negative assertions: invalid statuses or schema fields must not accidentally pass.
bad_a = json.loads(json.dumps(fixture_a[0]))
bad_a["continuity"]["referenceStatus"] = "auto-canon"
assert not Draft202012Validator(schema_a).is_valid(bad_a)
bad_i = json.loads(json.dumps(fixture_i[0]))
bad_i["state"]["layer"] = "auto-canon"
assert not Draft202012Validator(schema_i).is_valid(bad_i)
print(json.dumps({"status":"PASS","dialect":"Draft2020-12",
                  "schema_a":"valid","schema_i":"valid",
                  "ateliers_records":len(fixture_a),"index_records":len(fixture_i),
                  "negative_cases":2,"note":"structural only; no native mechanics or real IDB"}))
