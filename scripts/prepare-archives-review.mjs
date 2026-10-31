import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// Prépare uniquement un état de revue depuis un MANIFESTE PRIVÉ hors dépôt.
// Aucune création de fiche, aucun appel réseau, aucune publication, aucun secret en sortie.
const file=process.argv[2]
if(!file){
  console.error('Usage: node scripts/prepare-archives-review.mjs <chemin-prive/manifeste.json>')
  process.exitCode=2
}else{
  const input=await readFile(file,'utf8')
  assert(input.length<=2*1024*1024,'Manifeste trop volumineux')
  const data=JSON.parse(input)
  assert.equal(data.schema,'alrick.archive-review.v1','Schéma de revue invalide')
  assert(typeof data.sourceDocument==='string'&&data.sourceDocument.length<160)
  assert(typeof data.sourceVersion==='string'&&data.sourceVersion.length<60)
  assert(Array.isArray(data.entries)&&data.entries.length<=200)
  const seen=new Set()
  let eligible=0,blocked=0
  for(const e of data.entries){
    assert(e&&typeof e==='object','Entrée invalide')
    const code=typeof e.code==='string'&&/^[A-Z][A-Z0-9-]{2,50}$/.test(e.code)?e.code:'CODE-INCONNU'
    assert(!seen.has(code),'Code dupliqué : '+code)
    seen.add(code)
    const slug=typeof e.slug==='string'&&/^(personnages|creatures)\/[a-zA-Z0-9/-]{2,120}$/.test(e.slug)?e.slug:null
    const source=typeof e.sourceRef==='string'&&e.sourceRef.trim().length>4
    const publicSafe=e.spoilers===false && e.approvedPublic===true && e.mjOnly!==true
      && typeof e.publicTitle==='string' && e.publicTitle.trim().length>2
      && typeof e.publicSummary==='string' && e.publicSummary.trim().length>5
      && source && slug
    if(publicSafe){
      eligible++
      console.log('CANDIDAT_PUBLIC_APRES_REVUE_MANUELLE '+code+' / '+slug+' / référence présente')
    }else{
      blocked++
      // N'afficher ni titre, ni résumé, ni notes MJ si une entrée n'est pas sûre.
      console.log('NON_PUBLIC_OU_INCOMPLET '+code+' / revoir spoiler, approbation, source et slug')
    }
  }
  console.log('Manifeste '+data.sourceVersion+' : '+eligible+' candidat(s), '+blocked+' bloqué(s). Aucun fichier publié.')
  if(blocked>0)process.exitCode=1
}
