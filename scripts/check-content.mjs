import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import YAML from 'yaml'

const walk = async (dir) => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name)))).flat()
const files = await walk('content')
const codes = new Set()
const editorialStates = new Set(['valide', 'en_cours', 'en_chantier'])
let published = 0
for (const file of files) {
  assert(!/(atelier-mj|archives-source|\.obsidian|private)/i.test(file), `Dossier privé dans content : ${file}`)
  if (!file.endsWith('.md')) {
    const relative = path.relative('content', file).split(path.sep).join('/')
    const imageFormat = ['.webp', '.avif', '.png', '.jpg', '.jpeg'].some(ext => relative.toLowerCase().endsWith(ext))
    assert(relative.startsWith('images/') && imageFormat && !relative.includes('..'), `Média non approuvé : ${file}. Utiliser content/images/.`)
    assert((await stat(file)).size <= 3 * 1024 * 1024, `Illustration trop lourde (> 3 Mio) : ${file}`)
    continue
  }
  const text = await readFile(file, 'utf8')
  const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  assert(front, `Métadonnées absentes : ${file}`)
  const fm = YAML.parse(front[1])
  assert(fm.title && typeof fm.publish === 'boolean', `Titre ou publish explicite manquant : ${file}`)
  if (fm.code) assert(editorialStates.has(fm.etat_editorial), `État éditorial manquant ou invalide : ${file}`)
  if (/(^|[\\/])index-brouillons[^\\/]*\.md$/i.test(file)) assert(fm.publish === false, 'Index de relecture publié par erreur : ' + file)
  if (!fm.publish) continue
  published++
  if (fm.code) {
    assert(!codes.has(fm.code), `Code dupliqué : ${fm.code}`)
    codes.add(fm.code)
    for (const field of ['categorie', 'canon_statut', 'ancre_documentaire', 'source_brute', 'visibilite']) assert(fm[field], `${field} absent : ${file}`)
    assert(['publique', 'publique_avec_avertissement'].includes(fm.visibilite), `Fiche publiée avec visibilité incohérente : ${file}`)
    if (fm.spoilers === true) assert(fm.visibilite === 'publique_avec_avertissement', `Avertissement de visibilité manquant : ${file}`)
  }
  if (file.split(path.sep).includes('mj')) {
    assert(fm.spoilers === true && fm.unlisted === true, `Protections anti-spoilers absentes : ${file}`)
    assert(!fm.tags && !fm.aliases, `Un tag ou alias pourrait exposer un extrait MJ : ${file}`)
  } else if (fm.spoilers === true) {
    assert(fm.unlisted === true, `Une fiche publique à spoilers doit être masquée des index et accessible par lien après avertissement : ${file}`)
  }
}
assert(published > 0, 'Aucune page choisie pour le build')
console.log(`${published} pages choisies explicitement, ${codes.size} codes uniques ; périmètre et métadonnées MJ vérifiés.`)
