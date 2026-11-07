import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {adaptAteliers102,validateR2Dataset, R2_PROFILE} from '../src/model-r2.mjs';
const base=dirname(fileURLToPath(import.meta.url));
const campaign='camp:p1r2-fiction';
function original({recordId,nodeType,entityType,definitionRef,baseDefinitionRef,level,campaignId,role='participant',sourceRef}){
 const x={schema:'cer.p1.data-model.record.proposal.v0',recordId,recordVersion:'0.1.0',nodeType,entityType,
  provenance:{originKind:'proposal',sourceId:`P1-fixture-${recordId}`,sourceSchema:'cer.synthetic.source.v0',sourceVersion:'fixture-0',fidelity:'reference-only'},
  continuity:{referenceStatus:'proposal',playedStatus:'not-played',publicationStatus:'unpublished',scope:'sandbox-fixture'},
  mechanics:{mode:entityType==='npc'?'none':'native-reference',engine:'M01',nativeSchema:'alrick.sheets.v3',nativeId:recordId,nativeVersion:'v3',authority:'native-only'},
  narrative:{title:recordId,publicDescription:'Fiction de test; aucune règle appliquée'},
  privacy:{visibility:'gm-private',gmOnly:{PRIVATE_CANARY:'NE_JAMAIS_PARTAGER',unknownJson:{future:true,nested:{foo:'bar'}}},publicFields:['narrative.title','narrative.publicDescription'],playerProjection:'explicit-approval-only'},
  media:[{mediaId:'med:p1r2-fake',mediaType:'image',rights:'unknown',audience:'gm',alt:'Dessin fictif non validé'}],
  legacy:{originalSchema:'legacy.test.v0',fieldDecisions:[{field:'unknownJson',decision:'unknown',targetOrReason:'Conserver'}],unknownFields:{inventedFuture:{foo:'preserved'}}},
  extensions:{unrecognizedProvider:{recordId,marker:'unknown-kept'}}};
 if(nodeType==='instance'){x.definitionRef=definitionRef;x.campaignId=campaignId??campaign;x.state={revision:0,status:'draft',current:{...(level===undefined?{}:{level}),futureState:{flag:'kept'}},historyRefs:[]};}
 if(nodeType==='variant'){x.baseDefinitionRef=baseDefinitionRef;x.variantChanges={mechanicPolicy:'native-recalculation-required',descriptive:{note:'Cornes argentées (fiction); aucun modificateur de dégâts'}};}
 return x;
}
const originals=[
 original({recordId:'def:pj:explorateur-test',nodeType:'definition',entityType:'pj'}),
 ...[1,10,25].map(level=>original({recordId:`inst:pj:temoin-n${level}`,nodeType:'instance',entityType:'pj',definitionRef:'def:pj:explorateur-test',level})),
 original({recordId:'def:creature:veilleur-fictif',nodeType:'definition',entityType:'creature'}),
 original({recordId:'inst:creature:veilleur-1',nodeType:'instance',entityType:'creature',definitionRef:'def:creature:veilleur-fictif',level:10}),
 original({recordId:'var:creature:veilleur-argente',nodeType:'variant',entityType:'creature',baseDefinitionRef:'def:creature:veilleur-fictif'}),
 original({recordId:'def:npc:archiviste',nodeType:'definition',entityType:'npc'}),
 original({recordId:'inst:npc:archiviste-1',nodeType:'instance',entityType:'npc',definitionRef:'def:npc:archiviste'}),
 original({recordId:'def:item:flute-fictive',nodeType:'definition',entityType:'item'}),
 original({recordId:'def:capability:souffle-descriptif',nodeType:'definition',entityType:'capability'}),
 original({recordId:'def:spell:lueur-demo',nodeType:'definition',entityType:'spell'}),
 original({recordId:'def:ritual:chant-demo',nodeType:'definition',entityType:'ritual'}),
 original({recordId:'def:scene:pont-fictif',nodeType:'definition',entityType:'scene'}),
 original({recordId:'inst:scene:pont-fictif',nodeType:'instance',entityType:'scene',definitionRef:'def:scene:pont-fictif'})
];
const records=originals.map(o=>{const a=adaptAteliers102(o);if(!a.ok)throw Error(JSON.stringify({id:o.recordId,issues:a.issues}));return a.value});
const scene=records.find(r=>r.recordId==='inst:scene:pont-fictif');
scene.data.participants=[
 ...[1,10,25].map(n=>({role:'pj',recordId:`inst:pj:temoin-n${n}`,instanceId:`inst:pj:temoin-n${n}`})),
 {role:'creature',recordId:'inst:creature:veilleur-1',instanceId:'inst:creature:veilleur-1'},
 {role:'pnj',recordId:'inst:npc:archiviste-1',instanceId:'inst:npc:archiviste-1'}
];
scene.privacy.notes='PRIVATE_SCENE_CANARY_P1R2';
// R1 validation has no explicit definition graph for R2; strict R2 does.
const valid=validateR2Dataset(records);if(!valid.ok)throw Error('INVALID R2 FIXTURE '+JSON.stringify(valid.issues));
const out={profile:R2_PROFILE,warning:'Fiction indépendante. #102-shaped synthetic reproductions, NOT original #102 fixture bytes.',referenceSources:{ateliers102:'85f473d2005903a6fc81d37a83fcc6b3c6d16466',index105:'4f3dffd51f16c0c1881f925a94a677a87feff17c',arch104:'f84f8c54361b3701ebb0251700f2d0d09d4acf4d'},
 originals,records};
writeFileSync(resolve(base,'../fixtures/R2_SYNTHETIC_CHAIN.json'),JSON.stringify(out,null,2)+'\n');
console.log('R2_FIXTURES_GENERATED',{originals:originals.length,records:records.length,roles:[...new Set(records.map(x=>x.nodeType))],levels:[1,10,25],participants:scene.data.participants.length});
