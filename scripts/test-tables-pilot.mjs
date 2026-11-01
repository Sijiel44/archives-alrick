import assert from "node:assert/strict"
import { mkdtemp, rm, readFile, writeFile, copyFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import WebSocket from "ws"
import { createTableServer, resolve5d6, resolveTableCombat, TABLES_ENGINE_VERSION,
  TABLES_CHARACTER_SCHEMA } from "../tables-pilot/server.mjs"
import { resolveProgressionAction, effectiveStat, effectiveMastery } from "../quartz/components/scripts/atelier5d6-progression.ts"
import { resolveCombatM03 } from "../quartz/components/scripts/atelier5d6-combat-m03.ts"

const fixtures = JSON.parse(await readFile(new URL("./fixtures/5d6-parity-v1.json", import.meta.url), "utf8"))
assert.equal(fixtures.rulesVersion, TABLES_ENGINE_VERSION)
assert.equal(TABLES_CHARACTER_SCHEMA, "alrick.tables.character.v2")
for (const c of fixtures.cases) {
  assert([5,10,15,20,25].includes(c.level) && c.rawStat > 12)
  const natural = c.dice.reduce((a,b)=>a+b,0)
  const reference = resolveProgressionAction({ natural, rawStat:c.rawStat, masteryRank:c.masteryRank,
    situation:0, threshold:c.threshold, feasible:true })
  const observed = resolve5d6(c.dice, c.rawStat, c.masteryRank, 0, c.threshold)
  assert.equal(observed.total, reference.total, "Parité M01 niveau " + c.level)
  assert.equal(observed.success, reference.success, "Réussite M01 niveau " + c.level)
  assert.equal(observed.stat, effectiveStat(c.rawStat))
  assert.equal(observed.skill, effectiveMastery(c.masteryRank))
  assert.equal(observed.rawStat, c.rawStat)
  assert.equal(observed.masteryRank, c.masteryRank)
  const input = { rawStat:c.rawStat, masteryRank:c.masteryRank, level:c.level,
    situation:fixtures.m03.situation, difficulty:c.threshold, kind:c.kind, mode:c.mode,
    baseDamage:fixtures.m03.baseDamage, penetration:fixtures.m03.penetration,
    defender:fixtures.m03.defender, feasible:fixtures.m03.feasible }
  assert.deepEqual(resolveTableCombat(c.dice,input),resolveCombatM03({...input,natural}),
    "Parité défense / résistance / absorption / critiques M03 niveau " + c.level)
}
const regression=fixtures.regression
const reg=resolve5d6(regression.dice,regression.rawStat,regression.masteryRank,0,regression.threshold)
assert.equal(reg.stat,6)
assert.equal(reg.total,26)
assert.equal(reg.success,false)
assert.notEqual(reg.total,29) // DG04-01 : brut 9 n'est pas un bonus +9
for(const dice of fixtures.naturalFailures) {
  assert.equal(resolve5d6(dice,39,18,2,15).success,false)
  assert.equal(resolveTableCombat(dice,{rawStat:39,masteryRank:18,situation:2,
    level:25,difficulty:15,kind:"physique",mode:"melee",baseDamage:12,
    defender:fixtures.m03.defender,feasible:true}).success,false)
}
assert.equal(resolve5d6([6,6,6,6,6],39,18,0,27,false).success,false)


const all = new Array(5).fill(1)
assert.equal(resolve5d6(all, 3, 0, 0, 15).outcome, "Échec critique exceptionnel")
assert.equal(resolve5d6(new Array(5).fill(6), 3, 0, 0, 15).outcome, "Succès exceptionnel")
assert.equal(resolve5d6(new Array(5).fill(4), 3, 0, 0, 24).outcome, "Échec de justesse")
assert.throws(() => resolve5d6([0, 6, 6, 6, 6], 3, 0, 0, 21))
assert.throws(() => resolve5d6([6, 6, 6, 6, 6], 3, 0, 11, 21))

const dir = await mkdtemp(join(tmpdir(), "alrick-tables-test-"))
const dataPath = join(dir, "local.json")
const peers = []

async function connect(server) {
  const ws = new WebSocket("ws://127.0.0.1:" + server.port + "/ws")
  const messages = [], listeners = []
  const peer = {
    ws, token: null,
    send(type, data = {}) { ws.send(JSON.stringify({ type, ...data })) },
    wait(check, timeout = 3000) {
      const found = messages.findIndex(check)
      if (found !== -1) return Promise.resolve(messages.splice(found, 1)[0])
      return new Promise((resolve, reject) => {
        const handler = { check, resolve: (m) => { clearTimeout(timer); resolve(m) } }
        const timer = setTimeout(() => {
          const index = listeners.indexOf(handler)
          if (index !== -1) listeners.splice(index, 1)
          reject(new Error("Attente expirée : " + JSON.stringify(messages.slice(-3))))
        }, timeout)
        listeners.push(handler)
      })
    }
  }
  ws.on("message", raw => {
    const msg = JSON.parse(raw.toString())
    const i = listeners.findIndex(x => x.check(msg))
    if (i >= 0) listeners.splice(i, 1)[0].resolve(msg)
    else messages.push(msg)
  })
  await new Promise((resolve, reject) => { ws.once("open", resolve); ws.once("error", reject) })
  peers.push(peer)
  return peer
}
async function register(server, pseudo) {
  const peer = await connect(server)
  peer.send("register", { pseudo })
  const reply = await peer.wait(m => m.type === "registered")
  peer.token = reply.token
  assert(reply.user.id)
  assert(!reply.user.token)
  return { peer, id: reply.user.id, token: reply.token }
}
async function error(peer, action, data, code) {
  peer.send(action, data)
  const reply = await peer.wait(m => m.type === "error" && m.code === code)
  assert.equal(reply.code, code)
}
async function snap(peer, predicate = () => true) {
  return peer.wait(m => m.type === "snapshot" && predicate(m))
}
let server
try {
  server = await createTableServer({ port: 0, dataPath })
  const mj = await register(server, "Conteur")
  const p1 = await register(server, "Edda")
  const p2 = await register(server, "Bran")

  mj.peer.send("create_room", { name: "Le Col", maxPlayers: 2, campaign: "Aventure d'essai" })
  const created = await mj.peer.wait(m => m.type === "room_created")
  const roomId = created.roomId, code = created.invite
  assert.equal(code.length, 12)
  await snap(mj.peer, m => m.room.id === roomId)

  p1.peer.send("join_room", { code })
  await p1.peer.wait(m => m.type === "joined")
  await snap(p1.peer, m => m.myself.approved === false)
  p2.peer.send("join_room", { code })
  await p2.peer.wait(m => m.type === "joined")
  await snap(p2.peer, m => m.myself.approved === false)

  await error(p1.peer, "roll", { roomId, stat: "physique", target: 21, situation: 0 }, "FORBIDDEN")
  await error(p1.peer, "approve_member", { roomId, userId: p2.id }, "FORBIDDEN")
  await error(p1.peer, "gm_note", { roomId, note: "Spoilers" }, "FORBIDDEN")

  mj.peer.send("approve_member", { roomId, userId: p1.id })
  await snap(p1.peer, m => m.myself.approved === true)
  mj.peer.send("approve_member", { roomId, userId: p2.id })
  await snap(p2.peer, m => m.myself.approved === true)
  const roster = await snap(mj.peer, m => m.members.length === 3 && m.members.every(x => x.approved))
  assert.equal(roster.members.filter(m => m.role === "mj").length, 1)

  p1.peer.send("create_character", { roomId, name: "Valk" })
  const c1 = (await snap(p1.peer, m => m.characters.some(c => c.name === "Valk"))).characters.find(c => c.name === "Valk")
  assert.equal(c1.level, 5)
  assert.equal(c1.pv, 36)
  p2.peer.send("create_character", { roomId, sourceSchema: "alrick.sheets.v3", sheet: {
    id: "source-documentaire-unique", name: "Nora", ruleset: "m02",
    stats: { physique: 15, agilite: 7, esprit: 8, presence: 8 },
    level: 15, pvMax: 194, pv: 178, manaMax: 6, mana: 6, skill: 1,
    masteries: { lames: 12, esquive: 3, volonte: 2 },
    resistanceBonus: { physique: 2, magie: 0, mental: 0 },
    protection: { physique: 6, magie: 2, mental: 0 },
    equipmentGrades: { physique: 2, magie: 1, mental: 0 }
  } })
  const c2 = (await snap(p2.peer, m => m.characters.some(c => c.name === "Nora"))).characters.find(c => c.name === "Nora")
  assert.equal(c2.approved, false)
  assert.equal(c2.stats.physique, 15)
  assert.equal(c2.masteries.lames, 12)
  assert.equal(c2.origin.sourceId, "source-documentaire-unique")
  assert.notEqual(c2.id, c2.origin.sourceId)
  assert.notEqual(c2.campaignInstanceId, c2.origin.sourceId)
  assert.equal(c2.protection.physique, 6)
  assert.equal(c2.rulesVersion, TABLES_ENGINE_VERSION)
  await error(p2.peer, "roll", { roomId, stat: "esprit", target: 21, situation: 0 }, "FORBIDDEN")
  mj.peer.send("approve_character", { roomId, characterId: c2.id })
  await snap(p2.peer, m => m.characters.some(c => c.id === c2.id && c.approved))

  mj.peer.send("gm_note", { roomId, note: "Le guet-apens se prépare." })
  const gmNote = await snap(mj.peer, m => m.gmNote === "Le guet-apens se prépare.")
  const other = await snap(p1.peer, m => m.events.length >= gmNote.events.length)
  assert.equal(other.gmNote, undefined)

  mj.peer.send("roll", { roomId, stat: "physique", target: 21, situation: 0, visibility: "mj" })
  const gmSecret = await snap(mj.peer, m => m.events.some(e => e.kind === "jet" && e.visibility === "mj"))
  assert(gmSecret.events.some(e => e.kind === "jet" && e.visibility === "mj"))
  const playerAfterSecret = await snap(p1.peer, m => m.events.length >= 3)
  assert(playerAfterSecret.events.every(e => e.visibility === "public"))
  await error(p1.peer, "roll", { roomId, stat: "physique", target: 21, situation: 0, visibility: "mj" }, "FORBIDDEN")

  p1.peer.send("roll", { roomId, stat: "physique", target: 21, situation: 0, dice: [6,6,6,6,6] })
  const rolled = await snap(p1.peer, m => m.events.some(e => e.kind === "jet" && e.by === p1.id))
  const result = rolled.events.find(e => e.kind === "jet" && e.by === p1.id).detail
  assert.equal(result.dice.length, 5)
  assert(result.dice.every(x => x >= 1 && x <= 6))
  assert.deepEqual(result, { ...resolve5d6(result.dice, 9, 0, 0, 21),
    masteryName: null, characterName: "Valk" })
  assert.equal(result.rulesVersion, TABLES_ENGINE_VERSION)
  assert.equal(result.stat, 6)

  // Serveur WS M03 vs moteur pur, mêmes dés et paramètres ; pas d'application automatique de PV.
  p1.peer.send("combat_roll", { roomId, defenderId: c2.id, stat: "physique",
    kind: "physique", mode: "melee", difficulty: 21, situation: 0, baseDamage: 6,
    penetration: 1, actionId: "combat-test-parity-01" })
  const combatSnap=await snap(p1.peer,m=>m.events.some(e=>e.kind==="combat"))
  const combat=combatSnap.events.find(e=>e.kind==="combat").detail
  const refCombat=resolveCombatM03({natural:combat.dice.reduce((a,b)=>a+b,0),
    rawStat:9,masteryRank:0,situation:0,level:5,difficulty:21,kind:"physique",
    mode:"melee",defender:{level:15,stats:c2.stats,masteries:c2.masteries,
      resistanceBonus:c2.resistanceBonus,protection:c2.protection,
      equipmentGrades:c2.equipmentGrades},feasible:true,baseDamage:6,penetration:1,
    mjMinimum:0,effects:[]})
  for(const [key,value] of Object.entries(refCombat))assert.deepEqual(combat[key],value)
  assert.equal(combat.resourcesApplied,false)
  assert.equal(combat.rulesVersion,TABLES_ENGINE_VERSION)
  await error(p1.peer,"combat_roll",{roomId,defenderId:c2.id,stat:"physique",
    kind:"physique",mode:"melee",difficulty:21,situation:0,baseDamage:6,
    penetration:1,visibility:"mj"},"FORBIDDEN")
  const battleReplay={roomId,defenderId:c2.id,stat:"physique",kind:"physique",
    mode:"melee",difficulty:21,situation:0,baseDamage:6,penetration:1,
    actionId:"combat-test-parity-01"}
  p1.peer.send("combat_roll",battleReplay)
  assert.equal((await p1.peer.wait(m=>m.type==="action_ack" && m.actionId===battleReplay.actionId)).replay,true)
  assert.equal((await snap(p1.peer,m=>m.events.some(e=>e.kind==="combat"))).events.filter(e=>e.kind==="combat").length,1)

  await error(p1.peer, "adjust_resource", { roomId, characterId: c1.id,
    expectedRevision: 0, pvDelta: -1, manaDelta: 0 }, "FORBIDDEN")
  mj.peer.send("adjust_resource", { roomId, characterId: c1.id,
    expectedRevision: 0, pvDelta: -3, manaDelta: 0 })
  const changed = await snap(p1.peer, m => m.characters.some(c => c.id === c1.id && c.revision === 1))
  assert.equal(changed.characters.find(c => c.id === c1.id).pv, 33)
  await error(mj.peer, "adjust_resource", { roomId, characterId: c1.id,
    expectedRevision: 0, pvDelta: -1, manaDelta: 0 }, "CONFLICT")
  await error(mj.peer, "adjust_resource", { roomId, characterId: c1.id,
    expectedRevision: 1, pvDelta: -99, manaDelta: 0 }, "BOUNDS")


  // Même action malgré ACK perdu : exactement une mutation, sans CONFLICT au replay.
  const resourceAction={roomId,characterId:c1.id,expectedRevision:1,pvDelta:-1,manaDelta:0,
    actionId:"res-retry-20261031"}
  mj.peer.send("adjust_resource",resourceAction)
  const firstAction=await mj.peer.wait(m=>m.type==="action_ack"&&m.actionId===resourceAction.actionId)
  assert.equal(firstAction.replay,false)
  mj.peer.send("adjust_resource",resourceAction)
  const replayAction=await mj.peer.wait(m=>m.type==="action_ack"&&m.actionId===resourceAction.actionId)
  assert.equal(replayAction.replay,true)
  const afterRetry=await snap(p1.peer,m=>m.characters.some(c=>c.id===c1.id&&c.revision===2))
  assert.equal(afterRetry.characters.find(c=>c.id===c1.id).pv,32)
  // Le même actionId avec paramètres différents doit être refusé.
  await error(mj.peer,"adjust_resource",{...resourceAction,pvDelta:-2},"IDEMPOTENCY")
  // Deux connexions du MJ à révision égale : exactement une modification.
  const secondGm=await connect(server)
  secondGm.send("auth",{token:mj.token})
  await secondGm.wait(m=>m.type==="authenticated")
  secondGm.send("select_room",{roomId})
  await snap(secondGm,m=>m.room.id===roomId)
  const aId="concurrent-a-20261031",bId="concurrent-b-20261031"
  mj.peer.send("adjust_resource",{roomId,characterId:c1.id,expectedRevision:2,
    pvDelta:-1,manaDelta:0,actionId:aId})
  secondGm.send("adjust_resource",{roomId,characterId:c1.id,expectedRevision:2,
    pvDelta:-1,manaDelta:0,actionId:bId})
  const [aResult,bResult]=await Promise.all([
    mj.peer.wait(m=>m.actionId===aId&&(m.type==="action_ack"||m.type==="error")),
    secondGm.wait(m=>m.actionId===bId&&(m.type==="action_ack"||m.type==="error"))
  ])
  assert.deepEqual([aResult.type,bResult.type].sort(),["action_ack","error"])
  assert.equal([aResult,bResult].find(r=>r.type==="error").code,"CONFLICT")
  const finalSnap=await snap(mj.peer,m=>m.characters.some(c=>c.id===c1.id&&c.revision===3))
  assert.equal(finalSnap.characters.find(c=>c.id===c1.id).pv,31)
  const backupPath=join(dir,"backup.json")
  await copyFile(dataPath,backupPath)
  // La restauration annule une mutation plus récente et conserve les reçus plus anciens.
  mj.peer.send("adjust_resource",{roomId,characterId:c1.id,expectedRevision:3,
    pvDelta:-1,manaDelta:0,actionId:"after-backup-20261031"})
  await mj.peer.wait(m=>m.type==="action_ack"&&m.actionId==="after-backup-20261031")
  for (const p of peers) p.ws.terminate()
  peers.length = 0
  await server.close()
  await writeFile(dataPath,"{invalid json")
  await assert.rejects(createTableServer({port:0,dataPath}))
  await copyFile(backupPath,dataPath)
  const restored=JSON.parse(await readFile(dataPath,"utf8"))
  assert.equal(restored.schema,"alrick.tables.local.v2")
  assert(restored.operations[mj.id+":"+resourceAction.actionId])
  server = await createTableServer({ port: 0, dataPath })
  const returning = await connect(server)
  returning.send("auth", { token: p1.token })
  const loggedIn = await returning.wait(m => m.type === "authenticated")
  assert.equal(loggedIn.user.id, p1.id)
  returning.send("select_room", { roomId })
  const resume = await snap(returning, m => m.characters.some(c => c.id === c1.id))
  assert.equal(resume.characters.find(c => c.id === c1.id).pv, 31)
  returning.send("adjust_resource",{...resourceAction})
  // Rejeu enregistré avant la restauration, sans double écriture.
  // Une connexion de joueur ne peut évidemment pas réémettre une action MJ.
  assert.equal((await returning.wait(m=>m.type==="error"&&m.code==="FORBIDDEN")).code,"FORBIDDEN")
  assert(resume.events.some(e => e.kind === "jet" && e.by === p1.id))
  assert(resume.events.every(e => e.visibility === "public"))
  assert.equal(resume.gmNote, undefined)
  console.log("OK : MJ + 2 joueurs, permissions, dés serveur, secrets, conflits, reconnexion et sauvegarde.")
} finally {
  for (const p of peers) p.ws.terminate()
  if (server) await server.close()
  await rm(dir, { recursive: true, force: true })
}
