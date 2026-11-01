// B-003.1 — contrôle documentaire du catalogue, hors moteur mathématique.
import assert from 'node:assert/strict'
import {readFile,readdir,access} from 'node:fs/promises'
import {join,resolve,dirname} from 'node:path'

const root='docs/bestiaire/B003_FICHES'
const names=(await readdir(root)).filter(n=>/^P\d{2}_.+\.md$/.test(n)).sort()
const expected=Array.from({length:41},(_,i)=>'P'+String(i+1).padStart(2,'0'))
const ids=names.map(n=>n.slice(0,3))
let checks=0
function ok(cond,message){checks++;assert.ok(cond,message)}
ok(names.length===41,'B-003.1 attend exactement 41 fiches Pxx')
ok(JSON.stringify(ids)===JSON.stringify(expected),'Absence, doublon ou ordre incohérent P01–P41')
const habitats=new Set(Array.from({length:9},(_,i)=>'H'+(i+1)))
const evolutionIDs=new Set(['P21','P22','P23','P24','P28','P30','P34','P35','P36'])
const approved=JSON.parse(await readFile('docs/bestiaire/B002_CODES_VALIDES.json','utf8'))
ok(Array.isArray(approved.attributions),'Registre B-002 sans liste des validations')
const matrix=await readFile('docs/bestiaire/B003_1_MATRICE_VALIDATION_ESPECES.md','utf8')
const evol=await readFile('docs/bestiaire/B003_1_RECONCILIATION_EVOLUTIONS.md','utf8')
const images=await readFile('docs/bestiaire/B003_1_ILLUSTRATIONS.md','utf8')
const contract=await readFile('CONTRAT_EDITORIAL.md','utf8')
ok(contract.includes("Autonomie du monde et canonisation du vivant indépendamment de l'Odyssée d'Orin"),'Règle d’autonomie absente du contrat')
const approvedByPath=new Map()
for(const a of approved.attributions){
  ok(typeof a.code==='string' && /^(ESP|FAMT|INDC|BIO|P5C|VARC)-/.test(a.code),'Code inconnu dans B-002')
  ok(typeof (a.fichier??a.chemin)==='string','Code B-002 sans chemin')
  ok(Boolean(a.preuve_validation_createur??a.preuve_validation??a.preuve),'Code B-002 sans preuve explicite du créateur')
  const file=a.fichier??a.chemin
  ok(!approvedByPath.has(file),'Plusieurs codes sur un même chemin sans arbitrage')
  approvedByPath.set(file,a.code)
}
let declaredImages=0
for(const [i,name] of names.entries()){
  const id=expected[i]
  const file=join(root,name)
  const source=await readFile(file,'utf8')
  ok(source.trim().startsWith('# B-003'),id+' titre documentaire manquant')
  ok(source.includes('proposition_non_jouee'),id+' statut de proposition absent')
  ok(/publish:\s*false/.test(source),id+' publication involontaire')
  ok(source.includes('5d6') || source.includes('M03'),id+' garde-fou de jeu absent')
  ok(!/^\s*(?:code|identifiant_permanent):\s*["']?(?:ESP|FAMT|INDC|BIO|P5C|VARC)-/m.test(source) || approvedByPath.has(file),id+' attribution non validée')
  const h=source.match(/\bH[1-9]\b/g)||[]
  ok(h.some(x=>habitats.has(x)),id+' sans catégorie H1–H9')
  ok(new RegExp('\\|\\s*'+id+'\\s*\\|').test(matrix),id+' absent de la matrice')
  // Chaque fiche B-003 conserve sa proposition et sa scène distinctes.
  ok(/(?:non jou[ée]|non-jou[ée]|non jouee|non-jouee)/i.test(source),id+' récit non joué non signalé')
  if(evolutionIDs.has(id)){
    ok(/N10[–-]14/.test(source),id+' trajectoire conditionnelle historique absente')
    ok(evol.includes(id),id+' décision de réconciliation absente')
  }
  if(i>=36){
    declaredImages++
    const jpg=join('docs/bestiaire/B003_ILLUSTRATIONS_LOT_04',name.replace(/\.md$/,'.jpg'))
    ok(images.includes(jpg.split('/').at(-1)),id+' image non inventoriée')
  }
  // N'autoriser des liens image locaux que si le binaire cible existe réellement.
  for(const m of source.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)){
    const target=m[1].split(/\s+/)[0]
    if(/^(?:https?:|data:)/.test(target))continue
    const full=resolve(dirname(file),target)
    ok(full.startsWith(resolve(root)),'Chemin d’image non sûr dans '+id)
    await access(full)
  }
  for(const m of source.matchAll(/content\/lieux\/(GEO-[\dA-Z-]+\.md)/g)){
    await access(join('content/lieux',m[1]))
  }
}
ok(evolutionIDs.size===9,'Neuf trajectoires attendues')
ok(declaredImages===5,'Cinq illustrations attendues')
const classificationRows=matrix.split('\n').filter(x=>/^\| P\d{2} \|/.test(x))
ok(classificationRows.length===82,'Matrice : 41 classifications et 41 lignes de décision requises')
ok(!approved.attributions.some(x=>!x.preuve_validation_createur&&!x.preuve_validation&&!x.preuve),'Codes sans preuve')
console.log('B-003.1 OK : 41 fiches, 9 réconciliations, 5 médias inventoriés, '+checks+' assertions ; aucune fusion, publication ni canonisation déclenchée.')
