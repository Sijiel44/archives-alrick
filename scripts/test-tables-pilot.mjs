import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import WebSocket from "ws"
import { createTableServer, resolve5d6 } from "../tables-pilot/server.mjs"

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
  p2.peer.send("create_character", { roomId, sheet: {
    name: "Nora", stats: { physique: 4, agilite: 8, esprit: 9, presence: 6 },
    level: 5, pvMax: 36, pv: 28, manaMax: 6, mana: 6, skill: 1
  } })
  const c2 = (await snap(p2.peer, m => m.characters.some(c => c.name === "Nora"))).characters.find(c => c.name === "Nora")
  assert.equal(c2.approved, false)
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
  assert.deepEqual(result, { ...resolve5d6(result.dice, 9, 0, 0, 21), characterName: "Valk" })

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

  for (const p of peers) p.ws.terminate()
  peers.length = 0
  await server.close()
  server = await createTableServer({ port: 0, dataPath })
  const returning = await connect(server)
  returning.send("auth", { token: p1.token })
  const loggedIn = await returning.wait(m => m.type === "authenticated")
  assert.equal(loggedIn.user.id, p1.id)
  returning.send("select_room", { roomId })
  const resume = await snap(returning, m => m.characters.some(c => c.id === c1.id))
  assert.equal(resume.characters.find(c => c.id === c1.id).pv, 33)
  assert(resume.events.some(e => e.kind === "jet" && e.by === p1.id))
  assert(resume.events.every(e => e.visibility === "public"))
  assert.equal(resume.gmNote, undefined)
  console.log("OK : MJ + 2 joueurs, permissions, dés serveur, secrets, conflits, reconnexion et sauvegarde.")
} finally {
  for (const p of peers) p.ws.terminate()
  if (server) await server.close()
  await rm(dir, { recursive: true, force: true })
}
