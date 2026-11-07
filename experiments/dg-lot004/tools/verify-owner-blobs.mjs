/** Verify byte-identical owner source and executable tests on the checked-out HEAD.
 * Git blob SHA-1 is SHA-1("blob " + byteLength + NUL + raw bytes).
 */
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const project=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const repo=resolve(project,'../..');
const manifest=JSON.parse(await readFile(resolve(project,'manifest.json'),'utf8'));
if(manifest.schema!=='cer.dg004.integration-manifest.v0')throw Error('Invalid DG004 manifest');
const expected={builder:'ee3f428843fea64a285366032e677c5bc7284b9d',
 studio:'35e2de3bcc702def3d37906997fb07155d2c44a3',
 math:'86cf1d57eb2d587b88e253c7f0c207db8edf2db2',
 index:'d071842639d0adc952dedf3e279c6a1b7004855c',
 creators:'1542891066ee88d5f6f4414856b7cf13a6199572'};
for(const [role,commit] of Object.entries(expected))
 if(manifest.ownerDeliveries?.[role]?.commit!==commit)throw Error('Owner reference diverged: '+role);
if(!Array.isArray(manifest.provenance)||manifest.provenance.length!==33)
 throw Error('Owner file count changed');
for(const item of manifest.provenance){
 if(!expected[item.role]||item.sourceCommit!==expected[item.role]||
    !item.path.startsWith('experiments/dg-lot004/')||
    !/^[a-f0-9]{40}$/.test(item.blobSha))
  throw Error('Wrong owner provenance element '+item.path);
 const bytes=await readFile(resolve(repo,item.path));
 const actual=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
 if(actual!==item.blobSha)throw Error('OWNER_BLOB_MISMATCH '+JSON.stringify({path:item.path,expected:item.blobSha,actual}));
}
console.log('DG004_OWNER_BLOBS_OK',JSON.stringify({exact:manifest.provenance.length,ownerCommits:expected,noModifiedOwnerSources:true}));
