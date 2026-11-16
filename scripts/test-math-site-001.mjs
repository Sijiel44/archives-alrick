/**
 * Recette documentaire autonome du chapitre MATH-SITE-001.
 * Vérifie qu'il reste non publié, que ses images sont présentes et accessibles,
 * et que les garde-fous fondamentaux figurent dans l'aide de jeu.
 * node scripts/test-math-site-001.mjs
 */
import assert from 'node:assert/strict'
import {readFile, stat} from 'node:fs/promises'
import {dirname, resolve} from 'node:path'
import sharp from 'sharp'

const pagePath='content/jouer/systeme-5d6-unifie-reference.md'
const page=await readFile(pagePath,'utf8')
const frontmatter=page.match(/^---\n([\s\S]*?)\n---\n/)
assert(frontmatter,'Frontmatter YAML introuvable')
assert.match(`\n${frontmatter[1]}\n`,/\npublish: false\n/)
assert.match(page,/visibilite: "brouillon"/)
assert.match(page,/aucune perte automatique de PV/i)
assert.match(page,/MAG-SORT-001/)
assert.match(page,/demo-etincelle/)
assert.match(page,/\*\*Niveau 20\*\*/)
assert.match(page,/\*\*Niveau 21\*\*/)
assert.match(page,/PNJ uniquement/)

const images=[...page.matchAll(/!\[([^\]]+)\]\((\.\.\/images\/regles\/[^)]+)\)/g)]
assert.equal(images.length,3,'Trois figures explicatives doivent être présentes')
for(const [,alt,rel] of images){
  assert(alt.length>=50,`Texte alternatif trop bref pour ${rel}`)
  const path=resolve(dirname(pagePath),rel)
  const bytes=(await stat(path)).size
  assert(bytes>10_000&&bytes<3*1024*1024,`Taille image invalide : ${path}`)
  const meta=await sharp(path).metadata()
  assert.equal(meta.format,'webp')
  assert(meta.width>=1000&&meta.height>=600)
}
console.log('MATH-SITE-001 PASS — brouillon préservé, 3 WebP, textes alternatifs et garde-fous éditoriaux.')
