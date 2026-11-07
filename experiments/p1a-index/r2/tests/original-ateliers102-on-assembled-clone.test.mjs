/** Requires actual #102 owner files copied into the assembled testing checkout; not a local synthetic test. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {adaptAteliers102,recoverAteliers102,validateR2Dataset} from '../src/model-r2.mjs';
const repositoryRoot=resolve(dirname(fileURLToPath(import.meta.url)),'../../../..');
const source=JSON.parse(readFileSync(resolve(repositoryRoot,'experiments/dg-lot004/src/creators/proposals/DATA_MODEL_001_FIXTURES.proposal.json'),'utf8'));
const records=source.records;
test('14 fixtures ORIGINALes #102 conservées et identités non normalisées',()=>{
 assert.equal(records.length,14);
 const adapted=records.map(x=>{const a=adaptAteliers102(x);assert.equal(a.ok,true,JSON.stringify({id:x.recordId,issues:a.issues}));
  const recovered=recoverAteliers102(a.value);assert.equal(recovered.ok,true);
  assert.equal(JSON.stringify(recovered.value),JSON.stringify(x));assert.equal(a.value.recordId,x.recordId);return a.value;
 });
 assert.equal(validateR2Dataset(adapted).ok,true);
});
