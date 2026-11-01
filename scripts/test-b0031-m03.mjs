// B-003.1 — recettes représentatives sur le moteur M03 installé, sans moteur parallèle.
import assert from 'node:assert/strict'
import {build} from 'esbuild'
async function load(path){
  const out=await build({entryPoints:[path],bundle:true,platform:'node',format:'esm',
    target:'es2022',write:false,logLevel:'silent'})
  return import('data:text/javascript;base64,'+
    Buffer.from(out.outputFiles[0].text).toString('base64'))
}
const [creatures,combat,prob]=await Promise.all([
  load('quartz/components/scripts/atelier5d6-bestiary.ts'),
  load('quartz/components/scripts/atelier5d6-combat-m03.ts'),
  load('quartz/components/scripts/atelier5d6-probabilities.ts')
])
// Profils purement expérimentaux. Ces rôles ne désignent aucune espèce ni capacité canonique.
const cases=[
  {id:'P02',label:'petite faune',role:'faune',levels:[5]},
  {id:'P20',label:'prédateur',role:'predateur',levels:[10]},
  {id:'P21',label:'défenses naturelles hypothétiques',role:'gardien',levels:[15]},
  {id:'P12',label:'cavernicole',role:'faune',levels:[20]},
  {id:'P35',label:'grand gabarit',role:'colosse',levels:[25]},
  {id:'P32',label:'microfaune hors combat',role:null,levels:[]}
]
const rows=[]
for(const fixture of cases){
  if(fixture.role===null){assert.equal(fixture.levels.length,0);rows.push({id:fixture.id,combat:'non applicable'});continue}
  for(const level of fixture.levels){
    const p=creatures.generateCreatureProfileM03(level,fixture.role)
    assert.equal(p.level,level)
    assert(Object.values(p.stats).every(n=>Number.isSafeInteger(n)&&n>0))
    const defender={level:p.level,stats:p.stats,masteries:{esquive:p.mastery},
      resistanceBonus:{physique:0,magie:0,mental:0},
      protection:{physique:0,magie:0,mental:0},
      equipmentGrades:{physique:0,magie:0,mental:0}}
    let success=0,damage=0,failure=0,critical=0
    for(let natural=5;natural<=30;natural++){
      const n=prob.sumOccurrences(natural)
      const r=combat.resolveCombatM03({natural,rawStat:p.stats.physique,
        masteryRank:p.mastery,situation:0,level:p.level,difficulty:21,
        kind:'physique',mode:'melee',defender,feasible:true,baseDamage:3})
      if(natural<=7){assert.equal(r.success,false);failure+=n}
      if(natural>=27)critical+=n
      success+=n*Number(r.success);damage+=n*r.damage
      assert(r.damage>=0)
    }
    assert.equal(failure,21)
    assert.equal(critical,126)
    assert(success>=0&&success<=7776)
    for(const group of [1,2,4])rows.push({id:fixture.id,level,role:fixture.role,
      groupe:group,probabiliteSucces:success/7776,
      degatsAttendusParTour:damage/7776*group,statut:'hypothèse mécanique, pas équilibrage'})
    // L'illustration et le rôle ne donnent pas une armure : seul un paramètre de test explicite la modifie.
    if(fixture.id==='P21'){
      const defended={...defender,protection:{physique:3,magie:0,mental:0}}
      assert(combat.effectiveProtectionM03(defended,'physique')>=
        combat.effectiveProtectionM03(defender,'physique'))
    }
  }
}
// Les niveaux ne définissent ni âge ni métamorphose : aucune transition n'est calculée ici.
for(const level of [5,10,15,20,25])
  assert(creatures.generateCreatureProfileM03(level,'faune').pvMax>0)
console.table(rows)
console.log('B-003.1/M03 : 5 profils représentatifs + 1 microfaune non combattante, groupes 1/2/4, 5 niveaux ; 7 776 issues pondérées par profil.')
