"""Deterministic FICTION only. Historical files referenced in documentation, never copied."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
SCHEMA='cer.index.data-model.p1a.proposal.v0'
CAMP='camp:demo-rives-p1a'
SHA_M02='39a91de6c21d42c7bf66b2c575024cd8164fa521'
SHA_BEST='4dd84b20ee0ff213a0c8f17ad172fafbd5bd9c10'
SHA_GRIM='4f6d97ce1a6e57b427be6a0d22651a8ec0db899f'
BASE='88f774f3d0d6d520d8d11443b72202b9caf4f94b'
def make(key,kind,name,summary,level=None,inst=None,definition=None,variant=None,mechanics=None,provenance=None,**data):
    identity={'definitionId':definition or f'def:demo:{key}','definitionVersion':'0.1.0'}
    if inst:identity.update(instanceId=inst,campaignId=CAMP)
    if variant: identity['variantId']=variant
    payload=dict(data)
    if level is not None: payload['level']=level
    return {'schema':SCHEMA,'recordKind':kind,'recordId':f'rec:demo:{key}',
        'version':'0.1.0','revision':0,'identity':identity,
        'provenance':provenance or {'origin':'synthetic','sourceSchema':'cer.p1a.synthetic.v0','sourceId':f'fixture:{key}'},
        'state':{'lifecycle':'draft','layer':'proposal','attestation':{'status':'unverified','evidenceRefs':[]}},
        'mechanics':dict({'validationStatus':'unvalidated'},**(mechanics or {'status':'not-evaluated'})),
        'narrative':{'name':name,'summary':summary},
        'privacy':{'visibility':'mj-private','notes':'LAB_PRIVATE_FICTIF_P1A_'+key,
             'legacyOriginal':{'futureField':{'count':7,'text':'ne jamais perdre'},'legacyState':'fictif'}},
        'media':[],'data':payload}

records=[]
records.append(make('pj-n1','pj','Néri, messagère fictive','PJ de démonstration, débutant.',level=1,inst='pj:p1a-neri',originNote='prétirage fictif'))
records.append(make('pj-n10','pj','Talven, artisan fictif','PJ de démonstration, aguerri.',level=10,inst='pj:p1a-talven',originNote='personnage fictif'))
records.append(make('pj-n25','pj','Iria, éclaireuse fictive','PJ de démonstration, accomplie ; aucune Autorité ajoutée.',level=25,inst='pj:p1a-iria',originNote='niveau initial déclaré, pas calculé'))
records.append(make('creature-base','creature','Mouflon de verre fictif','Créature fictive de laboratoire, profil non chiffré.',level=10,inst='creature:p1a-mouflon',
                    profileReference={'schema':'alrick.bestiary.v1','sourceId':'fixture-fiction-mouflon','ruleset':'m03','resolved':False},
                    mechanics={'status':'native-reference','nativeRef':{'module':'atelier5d6-bestiary-workshop.ts','sourceBlob':SHA_BEST}}))
records.append(make('creature-variant','creature','Mouflon des crêtes (variante fictive)','Variante narrative, aucune règle nouvelle.',level=15,inst='creature:p1a-mouflon-var',definition='def:demo:creature-base',variant='var:demo:crete',
                    variantOf='rec:demo:creature-base',difference='Pelage argenté, passage en montagne ; mécanique non recalculée.'))
records.append(make('npc','npc','Archiviste fictif du gué','PNJ interprétable, sans niveau obligatoire.',inst='pnj:p1a-archiviste',role='temoin'))
records.append(make('item','item','Flûte fictive du gué','Objet narratif ; aucun malus ni bonus chiffré.',inst='item:p1a-flute',effectText='Le son rappelle un chemin de retour, sans effet numérique.'))
records[-1]['media']=[{'assetId':'media:demo:flute-dessin-en-attente','rights':'pending','visibility':'mj-private'}]
records.append(make('ability','ability','Signe fictif du ralliement','Capacité descriptive, pas de bonus.',sourceKind='narrative',effectText='Rassembler le groupe par un signe.') )
records.append(make('spell','spell-ref','Lueur de veille (référence démo)','Référence documentaire à un sort d’essai, sans lancer.',
 provenance={'origin':'native-reference','sourceSchema':'alrick.grimoire.v1','sourceId':'demo-lueur-guide','sourceVersion':'1','sourceCommit':BASE,'sourceBlob':SHA_GRIM},
 mechanics={'status':'native-reference','nativeRef':{'module':'atelier5d6-grimoire.ts','sourceBlob':SHA_GRIM}},
 nativeSpellId='demo-lueur-guide',nativeVersion=1,castAllowed=False))
records.append(make('ritual','ritual-ref','Rite fictif de halte','Référence proposée, rite non enregistré dans moteur.',
 sourceSchema='alrick.ritual.v1',nativeRitualId=None,resolved=False))
participants=[
 {'recordId':'rec:demo:pj-n1','instanceId':'pj:p1a-neri','role':'pj'},
 {'recordId':'rec:demo:pj-n10','instanceId':'pj:p1a-talven','role':'pj'},
 {'recordId':'rec:demo:pj-n25','instanceId':'pj:p1a-iria','role':'pj'},
 {'recordId':'rec:demo:npc','instanceId':'pnj:p1a-archiviste','role':'pnj'},
 {'recordId':'rec:demo:creature-variant','instanceId':'creature:p1a-mouflon-var','role':'creature'}]
scene=make('scene','scene','Le Gué des miroirs (fiction)','Scène non jouée, locale au MJ.',inst='scene:p1a-gue',participants=participants,
           privateGoal='SCENE_PRIVATE_FICTIVE_CANARY',published=False)
records.append(scene)
p=root/'fixtures'/'P1A_FICTION_11_RECORDS.json'
p.write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(p.name, 'recordCount', len(records), 'bytes',p.stat().st_size)
