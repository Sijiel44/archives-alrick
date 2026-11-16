/**
 * Illustration MATH-SITE-001 : rendus WebP déterministes, sans source narrative.
 * SVG auteurs dans docs/rapports-missions/illustrations ; formats éditoriaux
 * publiables sous content/images/regles (WebP < 3 Mio). Aucune mise en ligne.
 * node scripts/render-math-site-001-illustrations.mjs
 */
import {readFile, mkdir, stat} from 'node:fs/promises'
import sharp from 'sharp'
import assert from 'node:assert/strict'

const target='content/images/regles'
await mkdir(target,{recursive:true})
const names=['jet','degats','divin']
for(const name of names){
  const from=`docs/rapports-missions/illustrations/math-site-001-${name}.svg`
  const output=`${target}/math-site-001-${name}.webp`
  const xml=await readFile(from)
  await sharp(xml,{density:144}).webp({quality:91,effort:6}).toFile(output)
  const metadata=await sharp(output).metadata()
  const stats=await stat(output)
  assert.equal(metadata.format,'webp')
  assert(metadata.width>=1000&&metadata.height>=600)
  assert(stats.size<3*1024*1024,`Image au-dessus de 3 Mio : ${output}`)
  console.log(`${output} — ${metadata.width}×${metadata.height}, ${stats.size} octets`)
}
