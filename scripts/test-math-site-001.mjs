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

const pages=[
  {path:'content/jouer/systeme-5d6-unifie-reference.md',expectedImages:3},
  {path:'content/jouer/atelier-creation-5d6-guide-illustre.md',expectedImages:5}
]
let totalImages=0
for(const {path,expectedImages} of pages){
  const page=await readFile(path,'utf8')
  const frontmatter=page.match(/^---\n([\s\S]*?)\n---\n/)
  assert(frontmatter,`Frontmatter YAML introuvable : ${path}`)
  assert.match(`\n${frontmatter[1]}\n`,/\npublish: false\n/)
  assert.match(page,/visibilite: "brouillon"/)
  assert.match(page,/MAG-SORT-001/)
  assert.match(page,/demo-etincelle/)
  const images=[...page.matchAll(/!\[([^\]]+)\]\((\.\.\/images\/regles\/[^)]+)\)/g)]
  assert.equal(images.length,expectedImages,`Figures explicatives manquantes : ${path}`)
  totalImages+=images.length
  for(const [,alt,rel] of images){
    assert(alt.length>=50,`Texte alternatif trop bref pour ${rel}`)
    const imagePath=resolve(dirname(path),rel)
    const bytes=(await stat(imagePath)).size
    assert(bytes>10_000&&bytes<3*1024*1024,`Taille image invalide : ${imagePath}`)
    const meta=await sharp(imagePath).metadata()
    assert.equal(meta.format,'webp')
    assert(meta.width>=1000&&meta.height>=600)
  }
}
const main=await readFile(pages[0].path,'utf8')
const creation=await readFile(pages[1].path,'utf8')
assert.match(main,/aucune perte automatique de PV/i)
assert.match(main,/\*\*Niveau 20\*\*/)
assert.match(main,/\*\*Niveau 21\*\*/)
assert.match(main,/PNJ uniquement/)
assert.match(main,/atelier-creation-5d6-guide-illustre/)
for(const phrase of ['budget','Maëla','Traqueur','Fente précise','Étincelle','Lame des braises','Scène A','Scène B','Scène C']){
  assert(creation.includes(phrase),`Exemple ou conception absente : ${phrase}`)
}
assert.match(creation,/\*\*24 \/ 24\*\*/)
assert.match(creation,/\*\*0 PV\*\*/)

// Recette mathématique indépendante des exemples chiffrés du chapitre.
const E=c=>Math.floor(3*Math.log2(1+c/3))
const M=r=>Math.floor(Math.log2(1+r))
const costStat=r=>1+Math.floor((r-1)/8)
const costMastery=r=>1+Math.floor((r-1)/6)
const price=(from,to,fn)=>Array.from({length:to-from},(_,i)=>fn(from+i+1)).reduce((a,b)=>a+b,0)
const maelaCost=price(3,8,costStat)+price(3,6,costStat)+price(3,4,costStat)+
  price(3,5,costStat)+price(0,7,costMastery)+price(0,2,costMastery)+3
assert.equal(maelaCost,24,'Budget M01 Maëla N5')
assert.equal(18+E(8)+M(7),26,'Jet Maëla')
assert.equal(6+Math.floor(.7*5)+M(7),12,'Impact Maëla')
assert.equal(15+E(6)+M(2),20,'Défense Traqueur')
assert.equal(17+E(5)+M(3),23,'Morsure Traqueur')
assert.equal(4+Math.floor(.7*5)+M(3),9,'Impact morsure')
assert.equal(15+E(8)+M(7),23,'Résistance Maëla')
assert.equal(12-1,11,'PV de la frappe sur protection 1')
assert.equal(9-2,7,'PV de la morsure sur protection 2')
assert.equal(18+E(8)+M(7),26,'Étincelle, toucher fictif')
assert.equal(16+E(5)+M(3),22,'Artisanat, réussite sans enchantement')
assert.equal(17+E(5)+M(3),23,'Négociation, zéro PV')
console.log(`MATH-SITE-001 PASS — 2 guides en brouillon, ${totalImages} WebP, textes alternatifs, budget et 11 invariants chiffrés.`)
