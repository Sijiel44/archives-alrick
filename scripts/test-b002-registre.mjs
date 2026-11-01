import assert from 'node:assert/strict'
import { readFile, access, mkdir, writeFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import YAML from 'yaml'

const load = async file => JSON.parse(await readFile(file, 'utf8'))
const inventory = await load('docs/bestiaire/B002_INVENTAIRE.json')
const register = await load('docs/bestiaire/B002_REGISTRE_RELATIONS.json')
const b001 = await load('docs/bestiaire/B001_REGISTRE_INITIAL.json')
const codeApprovals = await load('docs/bestiaire/B002_CODES_VALIDES.json')
const allowedCanon = new Set(['faits_joues','lore_valide','declaration','projet_en_cours','hypothese','proposition_non_jouee','historique','a_verifier'])
const allowedEditorial = new Set(['valide','en_cours','en_chantier'])
const scoped = ['content/creatures/','content/personnages/','content/groupes/','content/lieux/','content/monde/','modeles/']
const isScoped = p => scoped.some(root => p.startsWith(root))
const knownFiles = new Set(inventory.entrees.map(x => x.chemin))
let checks = 0
function check(condition, message) { checks++; assert(condition, message) }
check(inventory.schema === 'alrick.b002.inventaire.v1', 'Schéma inventaire non reconnu')
check(register.schema === 'alrick.b002.relations.v1-proposition', 'Schéma registre non reconnu')

const prefixesAttendus = new Map([['ESP-','espece'],['FAMT-','famille_taxonomique'],['INDC-','individu_creature'],['BIO-','biome'],['P5C-','profil_5d6_partage'],['VARC-','variante_creature']])
check(codeApprovals.schema === 'alrick.bestiaire.codes-valides.v1', 'Schéma des identifiants approuvés invalide')
check(codeApprovals.statut_nomenclature === 'approuvee_par_createur', 'La nomenclature n’est pas validée')
check(register.adoption_nomenclature === 'approuvee_par_createur_2026_10_31', 'Décision de nomenclature absente du registre central')
check(register.registre_attribution_codes === 'docs/bestiaire/B002_CODES_VALIDES.json', 'Référence du registre des codes absente')
check(Array.isArray(codeApprovals.prefixes) && codeApprovals.prefixes.length === prefixesAttendus.size, 'Six préfixes attendus')
for (const p of codeApprovals.prefixes) {
 check(prefixesAttendus.get(p.prefixe) === p.nature, 'Préfixe/nature inconnus : '+p.prefixe)
}
check(new Set(codeApprovals.prefixes.map(p=>p.prefixe)).size === prefixesAttendus.size, 'Préfixe dupliqué')
check(Array.isArray(codeApprovals.attributions), 'Table des validations individuelles absente')

check(inventory.source_commit === register.source_commit, 'Référence de commit incohérente')
check(inventory.entrees.length === inventory.stats.fichiers, 'Total inventaire incohérent')
check(new Set(inventory.entrees.map(x => x.chemin)).size === inventory.entrees.length, 'Chemin dupliqué')
check(register.identites.length === b001.entrees.length, 'Identité B-001 perdue')
check(register.relations_documentaire_profils_5d6.length === 0, 'Lien de profil local prétendument approuvé')
check(register.autorisation_liens_publics === false, 'Activation publique interdite en B-002')
check(register.liens_principaux_M05 === 'documentaryLink_declaratif_uniquement', 'Contrat M05 modifié')
check(inventory.stats.cible === inventory.entrees.filter(x => isScoped(x.chemin)).length, 'Périmètre incorrect')
const keySet = new Set(),codeSet = new Set()
for (const e of register.identites) {
 check(typeof e.cle_registre === 'string' && !keySet.has(e.cle_registre), 'Clé B-001 absente ou dupliquée')
 keySet.add(e.cle_registre)
 check(e.code === null || (typeof e.code === 'string' && !codeSet.has(e.code)), 'Code historique dupliqué')
 if (e.code !== null) codeSet.add(e.code)
 check(allowedCanon.has(e.canon_statut), 'Statut canonique B-001 invalide')
 check(allowedEditorial.has(e.etat_editorial), 'État éditorial B-001 invalide')
 if (e.fichier) check(knownFiles.has(e.fichier), 'Référence documentaire manquante')
 check(e.profil_5d6 === 'non_associe', 'Association 5d6 inventée')
}
for (const relation of register.relations_documentaires) {
 check(keySet.has(relation.source), 'Source de relation B-001 introuvable')
 check(knownFiles.has(relation.cible), 'Cible de relation documentaire introuvable')
 check(relation.publication_autorisee === false, 'Publication implicite interdite')
}
const verifiedCodes = new Map(), duplicateCodes = [],invalidCanon = [],invalidEditorial = [],unsafeSpoilers = [],missingExplicitTargets = [],enriched = [],legacyDraftValues = []
let examined = 0, filesWithCode = 0, published = 0, spoiling = 0, wikilinks = 0
for (const item of inventory.entrees) {
 check(!path.isAbsolute(item.chemin) && !item.chemin.split('/').includes('..'), 'Chemin non sûr')
 check(/^[a-f0-9]{40}$/.test(item.sha_blob), 'SHA Git invalide')
 await access(item.chemin)
 if (!isScoped(item.chemin) || !item.chemin.endsWith('.md')) continue
 examined++
 const source = await readFile(item.chemin,'utf8')
 const matched = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
 check(matched !== null, 'Frontmatter manquant: '+item.chemin)
 const meta = YAML.parse(matched[1])
 const safeLinks = meta.spoilers === true ? [] : [...source.matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1].split('|')[0].split('#')[0].trim()).filter(t => /^(creatures|personnages|groupes|lieux|monde)\//.test(t)).map(t => 'content/'+t+(t.endsWith('.md')?'':'.md'))
 enriched.push({chemin:item.chemin,code:meta.code ?? null,nom:meta.title ?? null,categorie:meta.categorie ?? null,canon_statut:meta.canon_statut ?? null,etat_editorial:meta.etat_editorial ?? null,publish:meta.publish ?? null,spoilers:meta.spoilers === true,unlisted:meta.unlisted ?? null,liens_editoriaux: [...new Set(safeLinks)].map(t => ({cible:t,existe:knownFiles.has(t),nature:'renvoi_editorial_non_taxonomique'})),preuve:'frontmatter_et_texte_lus_par_CI'})
 if (meta.publish === true) published++
 if (meta.spoilers === true) spoiling++
 if (meta.canon_statut && !allowedCanon.has(meta.canon_statut)) {
  if (item.chemin === 'content/monde/index-brouillons-cb42.md' && meta.canon_statut === 'brouillons' && meta.publish === false) legacyDraftValues.push(item.chemin)
  else invalidCanon.push(item.chemin)
 }
 if (meta.etat_editorial && !allowedEditorial.has(meta.etat_editorial)) invalidEditorial.push(item.chemin)
 if (meta.spoilers === true && meta.publish === true && (meta.unlisted !== true || meta.visibilite !== 'publique_avec_avertissement')) unsafeSpoilers.push(item.chemin)
 if (meta.code && !item.chemin.startsWith('modeles/')) {
  filesWithCode++
  if (verifiedCodes.has(meta.code)) duplicateCodes.push({code:meta.code,paths:[verifiedCodes.get(meta.code),item.chemin]})
  else verifiedCodes.set(meta.code,item.chemin)
 }
 for (const m of source.matchAll(/\[\[([^\]]+)\]\]/g)) {
  wikilinks++
  const target = m[1].split('|')[0].split('#')[0].trim().replace(/^\//,'')
  if (/^(creatures|personnages|groupes|lieux|monde)\//.test(target)) {
   const candidate = 'content/'+target+(target.endsWith('.md')?'':'.md')
   if (!knownFiles.has(candidate)) missingExplicitTargets.push({path:item.chemin,target:candidate})
  }
 }
}
check(duplicateCodes.length === 0, 'Codes effectivement dupliqués dans les fiches du périmètre: '+JSON.stringify(duplicateCodes))
check(unsafeSpoilers.length === 0, 'Fiches publiées avec spoilers sans protections')
check(invalidCanon.length === 0, 'Valeurs canon_statut non permises: '+JSON.stringify(invalidCanon))
check(invalidEditorial.length === 0, 'Valeurs etat_editorial non permises: '+JSON.stringify(invalidEditorial))
for (const row of register.identites.filter(x => x.fichier && x.code)) {
 const item = inventory.entrees.find(x => x.chemin === row.fichier)
 check(item && item.code === row.code, 'Code historique de fiche non préservé: '+row.cle_registre)
 const fmText = await readFile(row.fichier,'utf8')
 const fm = YAML.parse(fmText.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1])
 check(fm.code === row.code, 'Écart registre B-001 / frontmatter: '+row.cle_registre)
}
// Ce module ne raccorde PAS la navigation M05. Le lien principal reste déclaratif.
function canOfferB002Link(card, publicAuthority) {
 if (!publicAuthority?.approved || !publicAuthority?.accessProof) return false
 if (!card?.documentaryLink?.id || card.documentaryLink.spoilers !== false || card.documentaryLink.publish !== true) return false
 // B-002 n'est pas l'autorité de publication ; même un objet séduisant reste refusé.
 return false
}
for (const specimen of [
 {documentaryLink:{id:'DRG-01',publish:true,spoilers:false,publicPath:'/archives-alrick/creatures/test'}},
 {documentaryLink:{id:'IMP-13',publish:true,spoilers:true,publicPath:'/archives-alrick/creatures/secret'}},
 {status:'documentaire_approuve',documentaryLink:{id:'DRG-02',publish:true,spoilers:false}},
 {documentaryLink:{id:'INEXISTANT',publish:true,spoilers:false}}
]) {
 check(canOfferB002Link(specimen, {approved:true,accessProof:'declared'}) === false, 'Lien public activé sans décision éditoriale et contrôle réel')
}

// Décision éditoriale : chaque NOUVEL identifiant préfixé doit être validé pour SA fiche.
// L'inventaire B-002 est un instantané : le contrôle ci-dessous parcourt aussi les futurs fichiers.
const approvedCodes = new Map()
for (const entry of codeApprovals.attributions) {
 check(typeof entry.code === 'string' && !approvedCodes.has(entry.code), 'Attribution absente ou dupliquée')
 approvedCodes.set(entry.code,entry)
 const prefixe=[...prefixesAttendus.keys()].find(p=>entry.code.startsWith(p))
 check(Boolean(prefixe) && /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(entry.code.slice(prefixe?.length ?? 0)), 'Code nouveau non conforme : '+entry.code)
 check(prefixesAttendus.get(prefixe) === entry.nature, 'Nature erronée du code '+entry.code)
 check(typeof entry.fichier === 'string' && entry.fichier.startsWith('content/') && entry.fichier.endsWith('.md'), 'Chemin de fiche invalide pour '+entry.code)
 check(typeof entry.source_documentaire === 'string' && entry.source_documentaire.trim().length>0, 'Source de fiche requise : '+entry.code)
 check(typeof entry.preuve_validation_createur === 'string' && entry.preuve_validation_createur.trim().length>0, 'Validation explicite du créateur requise : '+entry.code)
 check(allowedCanon.has(entry.canon_statut) && allowedEditorial.has(entry.etat_editorial), 'États éditoriaux invalides : '+entry.code)
 check(!codeSet.has(entry.code), 'Collision avec le registre historique : '+entry.code)
 await access(entry.fichier)
}
async function allMarkdown(dir) {
 const rows=await readdir(dir,{withFileTypes:true})
 const found=[]
 for(const r of rows) {
  const p=path.posix.join(dir,r.name)
  if(r.isDirectory()) found.push(...await allMarkdown(p))
  else if(r.isFile() && p.endsWith('.md')) found.push(p)
 }
 return found
}
const matchedCodes=new Set(),seenNewCodes=new Set()
for (const file of await allMarkdown('content')) {
 const source=await readFile(file,'utf8')
 const front=source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
 if(!front) continue
 const meta=YAML.parse(front[1])
 if (typeof meta?.code!=='string') continue
 const pref=[...prefixesAttendus.keys()].find(p=>meta.code.startsWith(p))
 if (!pref) continue // les codes historiques restent inchangés
 check(!seenNewCodes.has(meta.code), 'Code futur dupliqué : '+meta.code)
 seenNewCodes.add(meta.code)
 const entry=approvedCodes.get(meta.code)
 check(Boolean(entry), 'Nouvelle fiche sans validation individuelle : '+file+' ('+meta.code+')')
 check(entry.fichier===file, 'Code approuvé pour une autre fiche : '+meta.code)
 check(prefixesAttendus.get(pref)===entry.nature, 'Préfixe incompatible avec la fiche : '+file)
 check(meta.canon_statut===entry.canon_statut && meta.etat_editorial===entry.etat_editorial, 'Statut source/registre incohérent : '+file)
 matchedCodes.add(meta.code)
}
check(matchedCodes.size===approvedCodes.size, 'Attribution approuvée sans fiche vérifiée')

const audit = {
 schema:'alrick.b002.integrite.v1',base_commit:inventory.source_commit,
 compteur_assertions:checks,arbre_git_reference:inventory.entrees.length,
 fiches_md_examined:examined,codes_frontmatter_uniques:verifiedCodes.size,
 fichiers_code:filesWithCode, fiches_publish_true:published, fiches_spoilers:spoiling,
 identites_b001:register.identites.length, codes_b001:codeSet.size,
 relations_sourcées:register.relations_documentaires.length, relations_profils_5d6:0,
 doublons_codes:duplicateCodes.length, valeurs_canon_invalides:invalidCanon.length,
 valeurs_editoriales_invalides:invalidEditorial.length,exceptions_heritage_brouillons:legacyDraftValues.length,protections_spoilers_manquantes:unsafeSpoilers.length,
 prefixes_approuves:prefixesAttendus.size,attributions_individuelles_validees:matchedCodes.size,
 liens_wiki_scannes:wikilinks,liens_explicites_a_revoir:missingExplicitTargets.length,
 NOTE:'Les liens wiki explicites non trouvés sont des alertes, pas des erreurs définitives de Quartz; aucune auto-publication.'
}
await mkdir('artifacts/b002',{recursive:true})
await writeFile('artifacts/b002/integrite.json',JSON.stringify(audit,null,2)+'\n')
await writeFile('artifacts/b002/inventaire-enrichi.json',JSON.stringify({schema:'alrick.b002.inventaire-enrichi.v1',source_commit:inventory.source_commit,perimetre:scoped,entrees:enriched},null,2)+'\n')
console.log('B-002 intégrité:',JSON.stringify(audit))
if (missingExplicitTargets.length) console.log('B-002: chemins wiki explicites à revoir (compte uniquement):',missingExplicitTargets.length)
