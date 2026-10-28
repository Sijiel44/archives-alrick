import sharp from 'sharp'
import { readFile } from 'node:fs/promises'

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="20" fill="#0b141d"/><path d="M28 21h72v65l-36 23-36-23z" stroke="#dcb877" stroke-width="3" fill="#172b38"/><path d="m42 83 22-49 22 49M49 68h30" stroke="#e6cb95" stroke-width="5" stroke-linejoin="round"/></svg>`
await sharp(Buffer.from(icon)).png().toFile('quartz/static/icon.png')
const mountains = (await readFile('quartz/static/montagnes.svg')).toString('base64')
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><image href="data:image/svg+xml;base64,${mountains}" width="1200" height="630"/><rect width="1200" height="630" fill="#0b141d" opacity=".38"/><rect x="28" y="28" width="1144" height="574" fill="none" stroke="#b99b69"/><text x="80" y="185" font-family="Georgia,serif" font-size="28" fill="#dcb877" letter-spacing="6">LES ARCHIVES D’ALRICK</text><text x="80" y="315" font-family="Georgia,serif" font-size="94" fill="#f3eadb">L’Odyssée d’Orin</text><text x="82" y="390" font-family="sans-serif" font-size="25" fill="#c4d2da">Entre montagne, magie et mémoire.</text></svg>`
await sharp(Buffer.from(social)).png().toFile('quartz/static/og-image.png')
console.log('Favicon et image sociale d’Alrick générés.')
