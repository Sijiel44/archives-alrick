import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { validPJSource } from '../studio-local/store.mjs'

async function load(file) {
  const out = await build({ entryPoints: [file], bundle: true, platform: 'node',
    format: 'esm', target: 'es2022', write: false, logLevel: 'silent' })
  return import('data:text/javascript;base64,' +
    Buffer.from(out.outputFiles[0].text).toString('base64'))
}
const lab = await load('quartz/components/scripts/atelier5d6-bestiary-workshop.ts')
const combat = await load('quartz/components/scripts/atelier5d6-combat-m03.ts')
const levels = [1, 5, 10, 15, 20, 21, 25]

let cases = 0
for (const kind of ['pnj', 'creature'])
  for (const archetype of lab.ARCHETYPES)
    for (const from of levels)
      for (const to of levels) {
        const base = lab.createBestiaryCard(from, archetype, kind, 'soutien')
        base.name = 'Modèle de rencontre'
        base.stats.presence += 4
        base.masteries.lames += 2
        base.masteries.feu = 7 // maîtrise distincte des niveaux et Cercles
        base.pvMax += 4
        base.manaMax += 3
        base.protection.physique = 2
        base.baseDamage = 7
        base.notes = 'Secret du MJ : ne pas exposer dans une fenêtre joueur'
        base.catalogLinks = [{type:'spell',id:'MAG-SORT-001',revision:1}]
        base.abilities = [{ name: 'Marque de cendre', description: 'Proposition',
          limitations: 'À vérifier', approvedByGM: true }]
        const before = structuredClone(base)
        const next = lab.createBestiaryLevelVariant(base, to)
        const fromDefault = lab.createBestiaryCard(from, archetype, kind, 'soutien')
        const toDefault = lab.createBestiaryCard(to, archetype, kind, 'soutien')

        assert.deepEqual(base, before, 'La fiche originale ne doit jamais muter')
        assert.notEqual(next.id, base.id)
        assert.equal(next.kind, kind)
        assert.equal(next.level, to)
        assert.equal(next.stats.presence - toDefault.stats.presence,
          base.stats.presence - fromDefault.stats.presence)
        assert.equal(next.masteries.lames - toDefault.masteries.lames,
          base.masteries.lames - fromDefault.masteries.lames)
        assert.equal(next.masteries.feu, 7, 'Aucune progression gratuite des écoles')
        assert.equal(next.pvMax - toDefault.pvMax, 4)
        assert.equal(next.manaMax - toDefault.manaMax, 3)
        assert.equal(next.protection.physique, 2)
        assert.equal(next.baseDamage, 7)
        assert.equal(next.abilities[0].approvedByGM, false,
          'L’approbation de la source n’est pas automatiquement transmise')
        assert.deepEqual(next.catalogLinks,base.catalogLinks.map(link=>
          ({...link,approvedByGM:false})))
        assert.equal(next.status, 'brouillon')
        assert.equal(next.visibility, 'mj')
        assert.deepEqual(next.variantOrigin, {
          sourceId: base.id, sourceLevel: from, targetLevel: to,
          sourceRuleset: 'm03', sourceSchema: lab.BESTIARY_SCHEMA,
          sourceStatus: 'brouillon', method: 'm04-specialty-deltas-v1'
        })
        assert.deepEqual(lab.validateBestiaryCard(JSON.parse(JSON.stringify(next))), next)
        // Les références descriptives ne produisent pas de dégâts automatiques.
        const opponent = lab.referenceOpponent(Math.min(to,20), 'defensif', 2)
        const beforeAttack = lab.attackMath(next, opponent)
        next.catalogLinks.push({type:'object',id:'OBJ-TEST',revision:1})
        assert.deepEqual(lab.attackMath(next, opponent), beforeAttack)
        // Pas de second moteur : les confrontations reposent sur M03.
        const m03 = combat.resolveCombatM03({natural:18,rawStat:next.stats.physique,
          masteryRank:next.masteries.lames,level:to,situation:0,difficulty:21,
          kind:'physique',mode:'melee',feasible:true,baseDamage:next.baseDamage,
          defender:lab.toDefense(opponent),penetration:next.penetration})
        assert.equal(typeof m03.damage, 'number')
        cases++
      }

const original = lab.createBestiaryCard(5,'gardien','pnj')
for (const invalid of [0, 26, -1, 1.2, NaN, Infinity, '15', null])
  assert.throws(() => lab.createBestiaryLevelVariant(original, invalid))
assert.throws(()=>lab.createBestiaryLevelVariant({kind:'pnj'},10),
  'Une fiche sans schéma M04 valide est refusée')
assert.equal(lab.createBestiaryLevelVariant(original,25).variantOrigin.sourceId,
  original.id)

const pj = {
  schema:'alrick.sheet.v3',ruleset:'m02',kind:'pj',id:'pj-essai',name:'Maëla',
  profession:'Éclaireuse',level:10,sourceTitle:'Création libre',xp:100,
  stats:{physique:12,agilite:14,esprit:8,presence:6},
  masteries:{lames:7,esquive:9,magie:3,feu:15},
  pv:66,pvMax:66,mana:36,manaMax:36,
  notes:'NE PAS EXPORTER : secret personnel',
  resistanceBonus:{physique:0,magie:0,mental:0},
  protection:{physique:0,magie:0,mental:0},
  equipmentGrades:{physique:2,magie:0,mental:0},
  development:{startingStats:{physique:3,agilite:3,esprit:3,presence:3},
    abilities:[{id:'cap-1',name:'Pointe de feu',domain:'magie',
      provenance:'Banc fictif',kind:'technique',rank:1,levelRequired:1,
      status:'defined',description:'Proposition non homologuée',
      limitations:'À confirmer',approvedByGM:true}]}
}
assert.equal(validPJSource(pj),true,'Source PJ reconnue par le Studio')
const pjBefore=structuredClone(pj)
const npc=lab.createNPCFromM02Source(pj)
assert.equal(npc.kind,'pnj')
assert.equal(npc.ruleset,'m03')
assert.equal(npc.name,'Maëla')
assert.equal(npc.level,10)
assert.deepEqual(npc.stats,pj.stats)
for(const [name,rank] of Object.entries(pj.masteries))
  assert.equal(npc.masteries[name],rank)
for(const name of ['runes','survie','volonte','negociation'])
  assert.equal(npc.masteries[name],0,'Aucun rang PNJ gratuit lors de l’import')
assert.equal(npc.pvMax,66)
assert.equal(npc.manaMax,36)
assert.equal(npc.abilities[0].approvedByGM,false)
assert.equal(npc.abilities[0].sourceAbilityId,'cap-1')
assert.deepEqual(npc.sourceM02,{
  sourceId:'pj-essai',sourceLevel:10,sourceRuleset:'m02',
  sourceTitle:'Création libre',trainedMasteries:['lames','esquive','magie','feu']
})
assert.equal(JSON.stringify(npc).includes('secret personnel'),false)
assert.deepEqual(pj,pjBefore)
const promoted=lab.createNPCFromM02Source(pj,15)
assert.equal(promoted.level,15)
assert.equal(promoted.kind,'pnj')
assert.equal(promoted.variantOrigin.sourceLevel,10)
assert.equal(promoted.sourceM02.sourceId,'pj-essai')
assert.equal(promoted.masteries.feu,15,'L’école du feu ne progresse pas sans décision')
assert.equal(promoted.masteries.runes,0,'Pas de nouvelle maîtrise inventée')
assert.equal(promoted.status,'brouillon')
assert.deepEqual(lab.validateBestiaryCard(JSON.parse(JSON.stringify(promoted))),promoted)
const atelierView=lab.exportBestiaryForAtelier(promoted)
assert.equal(atelierView.sheets[0].ruleset,'m03-bestiary',
  'Un PNJ ne devient pas un PJ M02 automatiquement')
assert.equal(atelierView.sheets[0].bestiarySource.sourceM02.sourceId,'pj-essai')
for(const patch of [{kind:'pnj'},{ruleset:'legacy'},{stats:{...pj.stats,agilite:-3}},
  {masteries:{...pj.masteries,feu:10000}},{pvMax:0},
  {development:{abilities:[{name:'Sans identifiant'}]}}]){
  assert.throws(()=>lab.createNPCFromM02Source({...pj,...patch}))
}

const linkSource=lab.createBestiaryCard(12,'mystique','pnj','soutien')
const beforeLink=structuredClone(linkSource)
let linked=lab.addBestiaryCatalogReference(linkSource,{
  type:'spell',id:'MAG-SORT-001',revision:1,
  provenance:'Catalogue MAG non homologué',approvedByGM:true
})
assert.deepEqual(linkSource,beforeLink)
assert.equal(linked.status,'brouillon')
assert.equal(linked.catalogLinks[0].approvedByGM,false)
assert.equal(linked.catalogLinks[0].type,'spell')
assert.equal(linked.catalogLinks[0].id,'MAG-SORT-001')
const linkedBeforeMath=lab.attackMath(linked,lab.referenceOpponent(12,'defensif',2))
for(const [type,id] of [['ability','CAP-TEST'],['object','OBJ-TEST'],
  ['ritual','MAG-RITE-TEST']]){
  linked=lab.addBestiaryCatalogReference(linked,{
    type,id,revision:1,provenance:'Proposition du MJ'
  })
}
assert.equal(linked.catalogLinks.length,4)
assert.deepEqual(lab.attackMath(linked,lab.referenceOpponent(12,'defensif',2)),
  linkedBeforeMath,'Lien vers un sort ou objet ne donne aucun bonus')
linked=lab.addBestiaryCatalogReference(linked,{
  type:'spell',id:'MAG-SORT-001',revision:2,provenance:'Version candidate'
})
assert.equal(linked.catalogLinks.length,4,'Une nouvelle version remplace le lien')
const latestSpell=linked.catalogLinks.find(link=>link.id==='MAG-SORT-001')
assert.equal(latestSpell.revision,2)
assert.equal(latestSpell.approvedByGM,false)
for(const wrong of [{type:'object',id:'',revision:1,provenance:'Source'},
  {type:'spell',id:'demo',revision:0,provenance:'Source'},
  {type:'spell',id:'demo',revision:1,provenance:''},
  {type:'arbitrary',id:'demo',revision:1,provenance:'Source'}]){
  assert.throws(()=>lab.addBestiaryCatalogReference(linkSource,wrong))
}

console.log('MATH-CREATE-003 : '+cases+
  ' variantes contrôlées (5 archétypes × 2 types × 7 niveaux origine × 7 niveaux cible) ; '+
  'PJ M02 vers PNJ M03, liens CAP/MAG/OBJETS sans bonus, provenance, '+
  'non-mutation, effet désactivé, rejet d’import : PASS.')
