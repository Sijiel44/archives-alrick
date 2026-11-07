import json,copy
from pathlib import Path
root=Path(__file__).resolve().parents[2]
source=json.loads((root/'schema/DATA_MODEL_P1A.schema.json').read_text())
s=copy.deepcopy(source)
s['$id']='urn:cer:index:p1a:proposal:v0:profile:r2'
s['title']='Profil de validation R2 ADDITIF du schéma #105 P1 v0 — NON second standard'
s['description']='Le champ schema reste cer.index.data-model.p1a.proposal.v0; contraintes de profil R2 sans autorité mécanique ni éditoriale.'
s['required'] += ['nodeType','continuity','extensions']
s['properties']['nodeType']={'enum':['definition','instance','variant']}
s['properties']['continuity']={
 'type':'object','required':['referenceStatus','playedStatus','publicationStatus','scope'],
 'properties':{
  'referenceStatus':{'enum':['proposal','canon','not-applicable','unverified']},
  'playedStatus':{'enum':['not-played','played','unverified']},
  'publicationStatus':{'enum':['unpublished','published','unverified']},
  'scope':{'enum':['sandbox-fixture','campaign','universe']},
  'canonEvidenceRef':{'type':'string','minLength':1},
  'playedEvidenceRef':{'type':'string','minLength':1},
  'publicationEvidenceRef':{'type':'string','minLength':1},
 },'additionalProperties':True,
 'allOf':[
  {'if':{'properties':{'referenceStatus':{'const':'canon'}},'required':['referenceStatus']},'then':{'required':['canonEvidenceRef']}},
  {'if':{'properties':{'playedStatus':{'const':'played'}},'required':['playedStatus']},'then':{'required':['playedEvidenceRef']}},
  {'if':{'properties':{'publicationStatus':{'const':'published'}},'required':['publicationStatus']},'then':{'required':['publicationEvidenceRef']}},
  {'if':{'properties':{'scope':{'const':'sandbox-fixture'}},'required':['scope']},'then':{'properties':{
   'referenceStatus':{'const':'proposal'},'playedStatus':{'const':'not-played'},'publicationStatus':{'const':'unpublished'}}}},
 ]}
s['properties']['extensions']={'type':'object','required':['profile'], 'properties':{'profile':{'const':'cer.index.data-model.p1a.profile.r2.experimental'}},'additionalProperties':True}
p=s['properties']['privacy'];p['required']+=['publicFields','playerProjection'];p['properties']['publicFields']={'type':'array','uniqueItems':True,'items':{'enum':['narrative.name','narrative.summary','media.public']}}
p['properties']['playerProjection']={'const':'explicit-approval-only'}
s['allOf']=[
 {'if':{'properties':{'nodeType':{'const':'definition'}},'required':['nodeType']},'then':{'properties':{'identity':{'not':{'anyOf':[{'required':['instanceId']},{'required':['variantId']}]}}}}},
 {'if':{'properties':{'nodeType':{'const':'instance'}},'required':['nodeType']},'then':{'properties':{'identity':{'required':['instanceId','campaignId'],'not':{'required':['variantId']}}}}},
 {'if':{'properties':{'nodeType':{'const':'variant'}},'required':['nodeType']},'then':{'properties':{'identity':{'required':['variantId'],'not':{'required':['instanceId']}},'data':{'required':['variantOf']}}}},
]
media=s['properties']['media']['items'];media['allOf']=[{'if':{'properties':{'visibility':{'const':'public-candidate'}},'required':['visibility']},'then':{'properties':{'rights':{'const':'confirmed'}}}}]
out=Path(__file__).resolve().parents[1]/'schema/DATA_MODEL_P1A_R2.profile.schema.json'
out.write_text(json.dumps(s,ensure_ascii=False,indent=2)+'\n')
print(out)
