import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import YAML from 'yaml'
import { fromHtml } from 'hast-util-from-html'
import { visit } from 'unist-util-visit'

const root = path.resolve('public')
const base = new URL('https://sijiel44.github.io/archives-alrick/')
const walk = async dir => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name)))).flat()
const files = await walk(root)
const htmlFiles = files.filter(f => f.endsWith('.html'))
assert(files.includes(path.join(root, 'index.html')), 'Accueil index.html absent : build vide / 404 assuré')
const pages = new Map()
for (const file of htmlFiles) {
  const source = await readFile(file, 'utf8')
  const refs = [], ids = new Set()
  visit(fromHtml(source), 'element', node => {
    if (node.properties?.id) ids.add(String(node.properties.id))
    for (const key of ['href', 'src']) if (node.properties?.[key]) refs.push(String(node.properties[key]))
  })
  pages.set(file, { source, refs, ids })
}
let checked = 0
const failures = []
const exists = async file => { try { return (await stat(file)).isFile() } catch { return false } }
async function check(ref, fromFile, checkAnchor = true) {
  if (/^(data:|mailto:|tel:|javascript:)/.test(ref)) return
  const relative = path.relative(root, fromFile).split(path.sep).join('/')
  const pageUrl = new URL(relative.replace(/index\.html$/, ''), base)
  const url = new URL(ref, pageUrl)
  if (url.origin !== base.origin) return
  if (!url.pathname.startsWith(base.pathname)) { failures.push(`${relative} → hors sous-chemin Pages : ${ref}`); return }
  const target = path.resolve(root, decodeURIComponent(url.pathname.slice(base.pathname.length)))
  if (target !== root && !target.startsWith(root + path.sep)) { failures.push(`Chemin hors public : ${ref}`); return }
  const candidates = [target, `${target}.html`, path.join(target, 'index.html')]
  const found = (await Promise.all(candidates.map(exists))).findIndex(Boolean)
  if (found < 0) { failures.push(`${relative} → 404 : ${ref}`); return }
  if (checkAnchor && url.hash && pages.has(candidates[found]) && !pages.get(candidates[found]).ids.has(decodeURIComponent(url.hash.slice(1)))) failures.push(`${relative} → ancre absente : ${ref}`)
  checked++
}
for (const [file, page] of pages) {
  for (const ref of page.refs) await check(ref, file)
  if (path.relative(root, file).startsWith('mj' + path.sep)) {
    assert(page.source.includes('class="spoiler-disclosure"'), `Avertissement MJ absent : ${file}`)
    assert(page.source.includes('noindex, nofollow, nosnippet'), `noindex MJ absent : ${file}`)
    assert(!/<details[^>]*\sopen(?:=|\s|>)/.test(page.source), `MJ dévoilé par défaut : ${file}`)
  }
}
for (const file of files.filter(f => f.endsWith('.css'))) {
  const css = await readFile(file, 'utf8')
  for (const match of css.matchAll(/url\(["']?([^\s)'";]+)["']?\)/g)) await check(match[1], file, false)
}
const index = JSON.parse(await readFile(path.join(root, 'static', 'contentIndex.json'), 'utf8'))
assert(!Object.keys(index).some(key => key === 'mj' || key.startsWith('mj/')), 'Spoiler MJ dans la recherche')
const sourceFiles = await walk(path.resolve('content'))
for (const file of sourceFiles.filter(f => f.endsWith('.md'))) {
  const source = await readFile(file, 'utf8')
  const front = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!front) continue
  const fm = YAML.parse(front[1])
  const relative = path.relative(path.resolve('content'), file).split(path.sep).join('/')
  if (fm.publish !== true || fm.spoilers !== true || relative.startsWith('mj/')) continue
  const slug = relative.replace(/\.md$/, '').toLowerCase()
  assert(fm.unlisted === true, `Fiche publique à spoilers non masquée des index : ${relative}`)
  const htmlPath = path.join(root, `${slug}.html`)
  const html = await readFile(htmlPath, 'utf8')
  assert(html.includes('class="spoiler-disclosure"'), `Avertissement public absent : ${relative}`)
  assert(html.includes('noindex, nofollow, nosnippet'), `Indexation publique non bloquée : ${relative}`)
  assert(!/<details[^>]*\sopen(?:=|\s|>)/.test(html), `Fiche à spoilers ouverte par défaut : ${relative}`)
  assert(!Object.keys(index).some(key => key === slug), `Fiche publique à spoilers présente dans la recherche : ${relative}`)
}
// Contrat de publication de l'Atelier 5d6 : les modes et les champs doivent exister dans le HTML.
// Les tests de navigateur réels restent nécessaires pour les interactions et le stockage local.
// L'accueil est un portail de choix ; le catalogue complet n'y figure plus.
const homepageHtml = await readFile(path.join(root, 'index.html'), 'utf8')
const catalogHtml = await readFile(path.join(root, 'bibliotheque.html'), 'utf8')
for(const token of ['id="alrick-home-title"', 'id="home-paths-title"', 'class="home-path-grid"', 'home-catalog-link', 'bibliotheque']){
  assert(homepageHtml.includes(token), `Accueil guidé incomplet : ${token}`)
}
assert(!homepageHtml.includes('class="archive-grid"'), 'Catalogue exhaustif encore sur l’accueil')
for(const token of ['id="library-search"', 'id="library-category"', 'class="archive-grid"']){
  assert(catalogHtml.includes(token), `Bibliothèque dédiée incomplète : ${token}`)
}
const publicCatalogCards = (catalogHtml.match(/class="archive-card internal"/g) ?? []).length
assert(publicCatalogCards > 20, 'Le nouveau catalogue ne contient pas les fiches publiques attendues')

const atelierFile = path.join(root, 'jouer', 'atelier-5d6.html')
const atelierHtml = await readFile(atelierFile, 'utf8')
for (const token of ['id="atelier-5d6"', 'data-mode="pj"', 'data-mode="mj"', 'data-mode="ia"', 'data-import', 'data-ai-prompt', 'data-roll']) {
  assert(atelierHtml.includes(token), `Outil Atelier 5d6 incomplet dans le build : ${token}`)
}
for(const token of ['data-field="description"', 'data-portrait', 'data-portrait-preview', 'data-clear-portrait', 'data-mastery="lames"', 'data-mastery-points', 'max="24"']){
  assert(atelierHtml.includes(token), `Atelier progression/portrait : contrôle HTML absent : ${token}`)
}
const guideHtml=await readFile(path.join(root,'jouer','guide-aventurier-12-rangs.html'),'utf8')
assert(guideHtml.includes('Les balises éteintes') && guideHtml.includes('La marche des frontières'),'Banque de missions manquante')
for(const token of ['data-export-campaign','data-import-campaign','data-group-create',
  'data-group-select','data-group-members','data-certification','data-mission-select',
  'data-mission-record','data-mission-log','data-item-category','data-item-make-template',
  'data-template-grant','data-inventory-list','data-inventory-transfer','data-convert-credits',
  'data-talent-points','data-ascension']){
  assert(atelierHtml.includes(token), `Atelier compagnies/inventaire : élément absent : ${token}`)
}
const publicMissions=JSON.parse(await readFile(path.join(root,'static','atelier5d6-missions.json'),'utf8'))
assert(publicMissions.publicOnly===true && publicMissions.schema==='alrick.missions.v1','Catalogue public de missions absent ou invalide')
assert(publicMissions.missions.length===24,'La banque ne contient pas 24 contrats publics')
assert(publicMissions.missions.every(m=>m.statut==='proposition_non_jouee' && !('gmNotes' in m) && !('secrets' in m)),
  'Risque de divulgation MJ dans les contrats publics')
const rulesHtml = await readFile(path.join(root, 'jouer', 'systeme-5d6-base12.html'), 'utf8')
assert(rulesHtml.includes('5d6'), 'La page des règles 5d6 est absente du HTML final')

const atelierVersion = await readFile(path.join(root, 'jouer', 'atelier-5d6.html'), 'utf8')
for (const token of ['data-reset', 'data-field="level"', 'data-field="vocation"', 'data-field="boons"', 'data-field="curses"', 'data-roll-domain', 'data-reference-query', 'data-reference-results', 'data-incident']) {
  assert(atelierVersion.includes(token), `Atelier v1.1 : contrôle HTML absent : ${token}`)
}
const demoData = JSON.parse(await readFile(path.join(root, 'static', 'atelier5d6-profils-demo.json'), 'utf8'))
assert(demoData.schema === 'alrick.sheets.v2' && Array.isArray(demoData.sheets) && demoData.sheets.length === 3, 'Profils JSON d’essai absents ou invalides')
assert(demoData.sheets.every(s => typeof s.name === 'string' && Object.keys(s.stats ?? {}).length === 4), 'Profils 5d6 invalides')

// Lot éditorial : chaque courant, Grande Puissance et dragon créé possède une page construite.
const currents = ['jardiniers','legislateurs','heritiers','liberateurs','preservateurs','conquerants','devoreurs']
for(const slug of currents){
 const page = await readFile(path.join(root,'monde','courants',slug+'.html'),'utf8')
 assert(page.includes('Emblème') || page.includes('emblème'), `Courant sans repère graphique : ${slug}`)
 const svg=await readFile(path.join(root,'static','images','courants',slug+'.svg'),'utf8')
 assert(svg.includes('<svg') && svg.includes('<title'),`Emblème SVG absent ou non accessible : ${slug}`)
}
for(const slug of ['astrae','aionel','nymea','orevan','syrka','dhorea'])
  assert((await readFile(path.join(root,'monde','puissances',slug+'.html'),'utf8')).length>1000,`Fiche de puissance absente : ${slug}`)
for(const slug of ['thessoryn','velmora','orzeyl'])
  assert((await readFile(path.join(root,'creatures','dragons',slug+'.html'),'utf8')).length>1000,`Dragon absent : ${slug}`)
// Les pages à spoilers peuvent être volontairement réduites à une page d'avertissement.
await readFile(path.join(root,'personnages','PER-CB31-ELYRA.html'),'utf8')
const ruptureHtml=await readFile(path.join(root,'monde','failles-et-ruptures.html'),'utf8')
assert(ruptureHtml.includes('imprévisib') || ruptureHtml.includes('impr&eacute;visib'), 'Les Failles imprévisibles sont absentes')
for(const slug of ['evenements-aleatoires-failles','protocole-failles-guildes'])
  assert((await readFile(path.join(root,'jouer',slug+'.html'),'utf8')).length>1000,`Guide de jeu Faille absent : ${slug}`)

const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8')
assert(!sitemap.includes('/mj/'), 'Page MJ dans le sitemap')
assert(!files.some(f => /\.(docx|xlsx|csv|zip)$/i.test(f) || /atelier-mj|archives-source|inventaire_592|CONSIGNES_CONFIDENTIELLES/i.test(f)), 'Document source privé présent dans le site')
assert.equal(failures.length, 0, failures.join('\n'))
console.log(`${htmlFiles.length} pages HTML, ${checked} liens et ressources internes vérifiés sous /archives-alrick/. Recherche, sitemap et avertissements MJ contrôlés.`)
