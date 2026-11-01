/**
 * Pilote LAN des tables d'Alrick. JAMAIS un backend de production Internet.
 * Serveur faisant autorité pour les dés, rôles, ressources et journal.
 * Démarrage local : npm run tables:dev
 */
import { createServer } from "node:http"
import { readFile, writeFile, mkdir, rename } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { createHash, randomBytes, randomInt, randomUUID } from "node:crypto"
import { WebSocketServer, WebSocket } from "ws"
import { resolveProgressionAction, effectiveStat, effectiveMastery } from "../quartz/components/scripts/atelier5d6-progression.ts"
import { resolveCombatM03 } from "../quartz/components/scripts/atelier5d6-combat-m03.ts"

const HERE = dirname(fileURLToPath(import.meta.url))
const STATS = ["physique", "agilite", "esprit", "presence"]
const TARGETS = [15, 18, 21, 24, 27, 30]
const STATUSES = ["preparation", "en_cours", "en_pause", "terminee"]
export const TABLES_ENGINE_VERSION = "m01-m03-2026-10-31"
export const TABLES_CHARACTER_SCHEMA = "alrick.tables.character.v2"
const MUTATIONS = new Set(["create_room","join_room","approve_member","set_status","gm_note",
  "create_character","approve_character","roll","combat_roll","message","adjust_resource"])
const clean = (s, max) => typeof s === "string" ? s.trim().slice(0, max) : ""
const tokenHash = (token) => createHash("sha256").update(token).digest("hex")
const fail = (code, message) => { const e = new Error(message); e.code = code; throw e }
const integer = (n, a, b) => Number.isInteger(n) && n >= a && n <= b
const uid = () => randomUUID()
const now = () => new Date().toISOString()
const safeSend = (ws, data) => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data)) }
const emptyDatabase = () => ({ schema: "alrick.tables.local.v2", rulesVersion: TABLES_ENGINE_VERSION,
  users: {}, rooms: {}, operations: {} })

/** M01 fait foi. Les caractéristiques et maîtrises reçues restent brutes. */
export function resolve5d6(dice, rawStat, masteryRank, situation, target, feasible = true) {
  if (!Array.isArray(dice) || dice.length !== 5 || !dice.every(d => integer(d, 1, 6)))
    fail("DICE", "Cinq dés entre 1 et 6 sont requis.")
  if (!Number.isSafeInteger(rawStat) || rawStat < 1 || !Number.isSafeInteger(masteryRank) ||
      masteryRank < 0 || !integer(situation, -2, 2) || !TARGETS.includes(target) ||
      typeof feasible !== "boolean") fail("RULES", "Paramètres de jet M01 invalides.")
  const natural = dice.reduce((sum, d) => sum + d, 0)
  const result = resolveProgressionAction({ natural, rawStat, masteryRank, situation,
    threshold: target, feasible })
  const outcome = natural === 5 ? "Échec critique exceptionnel" :
    natural <= 7 ? "Échec critique mineur" :
    result.success && natural === 30 ? "Succès exceptionnel" :
    result.criticalApplied ? "Réussite critique" :
    result.success ? "Réussite" :
    !feasible ? "Action impossible" :
    target - result.total <= 2 ? "Échec de justesse" : "Échec"
  return { dice: [...dice], natural, rawStat, masteryRank, stat: effectiveStat(rawStat),
    skill: effectiveMastery(masteryRank), situation, bonus: result.bonus,
    total: result.total, target, feasible, naturalFailure: result.naturalFailure,
    numericSuccess: result.numericSuccess, success: result.success,
    criticalPotential: result.criticalPotential, criticalApplied: result.criticalApplied,
    rulesVersion: TABLES_ENGINE_VERSION, outcome }
}

function migrateDb(raw) {
  if (!raw || !raw.users || !raw.rooms || !["alrick.tables.local.v1","alrick.tables.local.v2"].includes(raw.schema))
    throw new Error("Schéma de tables inconnu : conserver le fichier et restaurer une sauvegarde valide.")
  if (raw.schema === "alrick.tables.local.v1") {
    raw.schema = "alrick.tables.local.v2"
    raw.migratedFrom = "alrick.tables.local.v1"
    for (const room of Object.values(raw.rooms)) for (const character of Object.values(room.characters ?? {})) {
      character.characterSchema = "alrick.tables.character.v1"
      character.rulesVersion = "legacy-tables-v1"
      character.masteries ??= {}
      character.resistanceBonus ??= { physique: 0, magie: 0, mental: 0 }
      character.protection ??= { physique: 0, magie: 0, mental: 0 }
      character.equipmentGrades ??= { physique: 0, magie: 0, mental: 0 }
      character.preMigrationApproved = character.approved === true
      character.approved = false
      character.campaignInstanceId ??= character.id
    }
  }
  raw.rulesVersion = TABLES_ENGINE_VERSION
  raw.operations ??= {}
  return raw
}
function importMasteries(input) {
  if (input == null) return {}
  if (typeof input !== "object" || Array.isArray(input) || Object.keys(input).length > 80)
    fail("FORMAT", "Registre de maîtrises invalide.")
  const value = Object.create(null)
  for (const [key, rank] of Object.entries(input)) {
    if (!key.trim() || key.length > 80 || !Number.isSafeInteger(rank) || rank < 0)
      fail("FORMAT", "Rang de maîtrise invalide.")
    value[key] = rank
  }
  return value
}
function importDefenses(input, maximum) {
  if (input != null && (typeof input !== "object" || Array.isArray(input)))
    fail("FORMAT", "Modificateurs de défense invalides.")
  const value = {}
  for (const kind of ["physique","magie","mental"]) {
    const n = input?.[kind] ?? 0
    if (!integer(n, 0, maximum)) fail("FORMAT", "Modificateur de défense hors limites.")
    value[kind] = n
  }
  return value
}
function combatProfile(c) {
  return { level: c.level, stats: c.stats, masteries: c.masteries ?? {},
    resistanceBonus: c.resistanceBonus ?? importDefenses(null, 8),
    protection: c.protection ?? importDefenses(null, 60),
    equipmentGrades: c.equipmentGrades ?? importDefenses(null, 5) }
}

export async function createTableServer({
  host = "127.0.0.1", port = 8787,
  dataPath = join(process.cwd(), ".tables-local", "tables.json")
} = {}) {
  let db
  try {
    db = JSON.parse(await readFile(dataPath, "utf8"))
    db = migrateDb(db)
  } catch (err) {
    if (err.code !== "ENOENT") throw err
    db = emptyDatabase()
  }
  const online = new Map()
  const roomFor = (roomId) => {
    const room = db.rooms[roomId]
    if (!room) fail("NOT_FOUND", "Table inexistante.")
    return room
  }
  const userFor = (ws) => {
    const session = online.get(ws)
    if (!session?.userId) fail("AUTH", "Identifiez-vous avant de continuer.")
    return db.users[session.userId]
  }
  const memberFor = (ws, roomId, approved = true) => {
    const user = userFor(ws), room = roomFor(roomId), member = room.members[user.id]
    if (!member || (approved && !member.approved)) fail("FORBIDDEN", "Accès non autorisé à cette table.")
    return { user, room, member }
  }
  const gmFor = (ws, roomId) => {
    const ctx = memberFor(ws, roomId)
    if (ctx.member.role !== "mj" || ctx.room.gmId !== ctx.user.id) fail("FORBIDDEN", "Action réservée au MJ principal.")
    return ctx
  }
  async function save() {
    await mkdir(dirname(dataPath), { recursive: true, mode: 0o700 })
    const tmp = dataPath + "." + process.pid + ".tmp"
    await writeFile(tmp, JSON.stringify(db, null, 2), { mode: 0o600 })
    await rename(tmp, dataPath)
  }
  const userPublic = (id) => ({ id, pseudo: db.users[id]?.pseudo ?? "Inconnu" })
  const active = (roomId, userId) => [...online.values()].some(s => s.roomId === roomId && s.userId === userId)
  function snapshot(ws, roomId) {
    const { room, user, member } = memberFor(ws, roomId, false)
    const isGm = member.approved && member.role === "mj"
    const members = Object.entries(room.members)
      .filter(([, m]) => isGm || m.approved || m === member)
      .map(([id, m]) => ({
        ...userPublic(id), role: m.role, approved: m.approved,
        connected: active(roomId, id), characterId: m.characterId || null
      }))
    if (!member.approved) {
      return { type: "snapshot", rulesVersion: TABLES_ENGINE_VERSION, room: { id: room.id, name: room.name, status: room.status },
        myself: { ...userPublic(user.id), role: member.role, approved: false },
        members: members.filter(m => m.id === user.id), characters: [], events: [] }
    }
    const events = room.events.filter(e => e.visibility === "public" || isGm).slice(-120)
    return {
      type: "snapshot", rulesVersion: TABLES_ENGINE_VERSION,
      characterSchema: TABLES_CHARACTER_SCHEMA,
      room: { id: room.id, name: room.name, description: room.description,
        campaign: room.campaign, maxPlayers: room.maxPlayers, status: room.status,
        invite: isGm ? room.invite : undefined },
      myself: { ...userPublic(user.id), role: member.role, approved: true },
      members,
      characters: Object.values(room.characters)
        .filter(c => isGm || c.ownerId === user.id || c.approved)
        .map(c => ({ ...c })),
      events, gmNote: isGm ? room.gmNote : undefined
    }
  }
  function notifyRoom(roomId) {
    for (const [ws, session] of online) {
      if (session.roomId === roomId && ws.readyState === WebSocket.OPEN) {
        try { safeSend(ws, snapshot(ws, roomId)) } catch { /* socket ou adhésion disparue */ }
      }
    }
  }
  function myRooms(ws) {
    const user = userFor(ws)
    return Object.values(db.rooms).filter(r => r.members[user.id])
      .map(r => ({ id: r.id, name: r.name, role: r.members[user.id].role,
        approved: r.members[user.id].approved, status: r.status }))
  }
  function addEvent(room, by, kind, detail, visibility = "public") {
    room.sequence += 1
    const event = { id: uid(), sequence: room.sequence, at: now(), by,
      kind, detail, visibility }
    room.events.push(event)
    if (room.events.length > 1000) room.events.splice(0, room.events.length - 1000)
    return event
  }
  function authenticate(ws, token) {
    if (typeof token !== "string" || !/^[A-Za-z0-9_-]{32,128}$/.test(token))
      fail("AUTH", "Clé de compte invalide.")
    const hash = tokenHash(token)
    const user = Object.values(db.users).find(u => u.tokenHash === hash)
    if (!user) fail("AUTH", "Clé inconnue. Utilisez votre clé de récupération.")
    online.get(ws).userId = user.id
    safeSend(ws, { type: "authenticated", user: userPublic(user.id), rooms: myRooms(ws) })
  }
  async function handle(ws, msg) {
    if (!msg || typeof msg !== "object" || Array.isArray(msg)) fail("FORMAT", "Message invalide.")
    const session = online.get(ws)
    if (!session) return
    if (msg.type === "register") {
      if (session.userId) fail("AUTH", "Compte déjà chargé.")
      const pseudo = clean(msg.pseudo, 32)
      if (pseudo.length < 2) fail("FORMAT", "Choisissez un pseudonyme de 2 à 32 caractères.")
      const token = randomBytes(32).toString("base64url")
      const id = uid()
      db.users[id] = { id, pseudo, tokenHash: tokenHash(token) }
      session.userId = id
      await save()
      safeSend(ws, { type: "registered", token, user: userPublic(id), rooms: [] })
      return
    }
    if (msg.type === "auth") { authenticate(ws, msg.token); return }
    const user = userFor(ws)
    if (msg.type === "create_room") {
      const name = clean(msg.name, 80), description = clean(msg.description, 300),
        campaign = clean(msg.campaign, 80)
      const maxPlayers = Number(msg.maxPlayers)
      if (name.length < 3 || !integer(maxPlayers, 2, 5)) fail("FORMAT", "Nom ou nombre de joueurs invalide (2–5).")
      const id = uid(), invite = randomBytes(9).toString("base64url")
      db.rooms[id] = {
        id, name, description, campaign, maxPlayers, status: "preparation",
        gmId: user.id, invite, gmNote: "", members: {
          [user.id]: { role: "mj", approved: true, joinedAt: now(), characterId: null }
        }, characters: {}, events: [], sequence: 0
      }
      session.roomId = id
      addEvent(db.rooms[id], user.id, "table", "Table créée.")
      await save()
      safeSend(ws, { type: "room_created", roomId: id, invite })
      safeSend(ws, { type: "rooms", rooms: myRooms(ws) })
      notifyRoom(id)
      return
    }
    if (msg.type === "join_room") {
      const code = clean(msg.code, 30)
      const room = Object.values(db.rooms).find(r => r.invite === code)
      if (!room) fail("NOT_FOUND", "Code d'invitation inconnu.")
      if (!room.members[user.id]) {
        if (room.status === "terminee") fail("CLOSED", "La table est terminée.")
        room.members[user.id] = { role: "joueur", approved: false, joinedAt: now(), characterId: null }
        await save()
      }
      session.roomId = room.id
      safeSend(ws, { type: "joined", roomId: room.id })
      safeSend(ws, { type: "rooms", rooms: myRooms(ws) })
      notifyRoom(room.id)
      return
    }
    if (msg.type === "select_room") {
      memberFor(ws, msg.roomId, false)
      session.roomId = msg.roomId
      safeSend(ws, { type: "selected", roomId: msg.roomId })
      notifyRoom(msg.roomId)
      return
    }
    if (msg.type === "approve_member") {
      const { room } = gmFor(ws, msg.roomId), id = clean(msg.userId, 80)
      const member = room.members[id]
      if (!member || member.role !== "joueur") fail("NOT_FOUND", "Candidature inexistante.")
      if (!member.approved) {
        const count = Object.values(room.members).filter(m => m.approved && m.role === "joueur").length
        if (count >= room.maxPlayers) fail("FULL", "Capacité atteinte.")
        member.approved = true
        addEvent(room, user.id, "table", db.users[id].pseudo + " rejoint la table.")
        await save()
      }
      notifyRoom(room.id)
      return
    }
    if (msg.type === "set_status") {
      const { room } = gmFor(ws, msg.roomId)
      if (!STATUSES.includes(msg.status)) fail("FORMAT", "Statut invalide.")
      room.status = msg.status
      addEvent(room, user.id, "table", "Statut : " + msg.status)
      await save(); notifyRoom(room.id)
      return
    }
    if (msg.type === "gm_note") {
      const { room } = gmFor(ws, msg.roomId)
      room.gmNote = clean(msg.note, 2000)
      await save(); notifyRoom(room.id)
      return
    }
    if (msg.type === "create_character") {
      const { room, member } = memberFor(ws, msg.roomId)
      if (member.characterId) fail("LIMIT", "Une seule fiche par participant dans ce pilote.")
      const source = msg.sheet && typeof msg.sheet === "object" && !Array.isArray(msg.sheet) ? msg.sheet : null
      const name = clean(source?.name ?? msg.name, 90)
      if (name.length < 2) fail("FORMAT", "Nom du personnage requis.")
      const stats = source?.stats
      if (source && (!stats || !STATS.every(k => Number.isSafeInteger(stats[k]) && stats[k] >= 1)))
        fail("FORMAT", "Caractéristiques brutes invalides (M01 : aucun plafond de 12).")
      const level = source ? source.level : 5
      if (!integer(level, 1, 25)) fail("FORMAT", "Niveau invalide.")
      const pvMax = source ? source.pvMax : 36, manaMax = source ? source.manaMax : 0
      if (!integer(pvMax, 1, 99999) || !integer(manaMax, 0, 99999))
        fail("FORMAT", "PV ou mana invalides.")
      if (source && (!integer(source.pv, 0, pvMax) || !integer(source.mana, 0, manaMax)))
        fail("FORMAT", "Ressources courantes invalides.")
      const masteries = importMasteries(source?.masteries)
      const skill = source?.skill == null ? 0 : source.skill
      if (!integer(skill, 0, 2)) fail("FORMAT", "Compétence legacy hors limites.")
      const id = uid()
      const sourceSchema = source ? clean(msg.sourceSchema, 90) || "alrick.sheet.inconnu" : null
      const modern = sourceSchema === "alrick.sheets.v3" && source?.ruleset !== "legacy"
      room.characters[id] = {
        id, campaignInstanceId: uid(), ownerId: user.id, name,
        characterSchema: TABLES_CHARACTER_SCHEMA,
        rulesVersion: modern || !source ? TABLES_ENGINE_VERSION : "import-a-revalider",
        level,
        stats: source ? Object.fromEntries(STATS.map(k => [k, stats[k]])) :
          { physique: 9, agilite: 9, esprit: 9, presence: 9 },
        masteries, skill,
        resistanceBonus: importDefenses(source?.resistanceBonus, 8),
        protection: importDefenses(source?.protection, 60),
        equipmentGrades: importDefenses(source?.equipmentGrades, 5),
        pvMax, pv: source ? source.pv : pvMax,
        manaMax, mana: source ? source.mana : manaMax,
        origin: source ? { schema: sourceSchema, sourceId: clean(source?.id, 120),
          importedAt: now(), transfer: "partiel" } : { schema: "pilot-demo", transfer: "partiel" },
        revision: 0, approved: !source, source: source ? "import_5d6_non_valide" : "exemple_pilote_non_canonique"
      }
      member.characterId = id
      addEvent(room, user.id, "fiche", source ? "Fiche importée en attente de validation du MJ." :
        "Personnage d'essai créé.")
      await save(); notifyRoom(room.id)
      return
    }
    if (msg.type === "approve_character") {
      const { room } = gmFor(ws, msg.roomId)
      const c = room.characters[msg.characterId]
      if (!c) fail("NOT_FOUND", "Fiche inexistante.")
      c.approved = true
      c.rulesVersion = TABLES_ENGINE_VERSION
      c.characterSchema = TABLES_CHARACTER_SCHEMA
      addEvent(room, user.id, "fiche", "Fiche de " + c.name + " validée pour " + TABLES_ENGINE_VERSION + ".")
      await save(); notifyRoom(room.id)
      return
    }
    if (msg.type === "roll") {
      const { room, member } = memberFor(ws, msg.roomId)
      const statName = msg.stat
      if (!STATS.includes(statName) || !TARGETS.includes(msg.target) ||
          ![-2, 0, 2].includes(msg.situation))
        fail("FORMAT", "Choix de jet non autorisé.")
      if (msg.visibility === "mj" && member.role !== "mj")
        fail("FORBIDDEN", "Jet secret réservé au MJ.")
      const character = room.characters[member.characterId]
      if (character && !character.approved) fail("FORBIDDEN", "Fiche en attente de validation.")
      if (!character && member.role !== "mj") fail("NO_CHARACTER", "Créez d'abord votre personnage.")
      if (character && character.rulesVersion !== TABLES_ENGINE_VERSION)
        fail("VERSION", "Fiche non validée pour le moteur M01/M03.")
      const rawStat = character ? character.stats[statName] : 3
      const masteryName = clean(msg.mastery, 80)
      if (masteryName && (!character || !Object.hasOwn(character.masteries ?? {}, masteryName)))
        fail("FORMAT", "Maîtrise inconnue de la fiche.")
      const masteryRank = masteryName ? character.masteries[masteryName] : (character?.skill ?? 0)
      const dice = Array.from({ length: 5 }, () => randomInt(1, 7))
      const roll = resolve5d6(dice, rawStat, masteryRank, msg.situation, msg.target, msg.feasible !== false)
      roll.masteryName = masteryName || null
      addEvent(room, user.id, "jet", { ...roll, characterName: character?.name ?? "MJ" },
        msg.visibility === "mj" ? "mj" : "public")
      await save(); notifyRoom(room.id)
      return
    }
    if (msg.type === "message") {
      const { room } = memberFor(ws, msg.roomId)
      const text = clean(msg.text, 500)
      if (!text) fail("FORMAT", "Message vide.")
      addEvent(room, user.id, "message", text)
      await save(); notifyRoom(room.id)
      return
    }
    if (msg.type === "combat_roll") {
      const { room, member } = memberFor(ws, msg.roomId)
      const attacker = room.characters[member.characterId]
      if (!attacker || !attacker.approved || attacker.rulesVersion !== TABLES_ENGINE_VERSION)
        fail("FORBIDDEN", "Attaquant sans fiche M01/M03 validée.")
      if (msg.visibility === "mj" && member.role !== "mj")
        fail("FORBIDDEN", "Combat secret réservé au MJ.")
      const defender = msg.defenderId ? room.characters[msg.defenderId] : null
      if (msg.defenderId && (!defender || !defender.approved || defender.rulesVersion !== TABLES_ENGINE_VERSION))
        fail("FORMAT", "Défenseur inexistant ou non validé M03.")
      if (!STATS.includes(msg.stat) || !["physique","magie","mental"].includes(msg.kind) ||
          !["melee","tir","magie","mental"].includes(msg.mode) ||
          !TARGETS.includes(msg.difficulty) || !integer(msg.situation, -2, 2) ||
          !integer(msg.baseDamage, 1, 12) || !integer(msg.penetration ?? 0, 0, 8))
        fail("FORMAT", "Paramètres de combat M03 invalides.")
      if (msg.mjMinimum !== undefined && (member.role !== "mj" || !integer(msg.mjMinimum, 0, 45)))
        fail("FORBIDDEN", "Seuil MJ réservé au MJ.")
      const masteryName = clean(msg.mastery, 80)
      if (masteryName && !Object.hasOwn(attacker.masteries, masteryName))
        fail("FORMAT", "Maîtrise de combat absente.")
      const masteryRank = masteryName ? attacker.masteries[masteryName] : attacker.skill
      const dice = Array.from({ length: 5 }, () => randomInt(1, 7))
      const natural = dice.reduce((a,b)=>a+b,0)
      const result = resolveCombatM03({
        natural, rawStat: attacker.stats[msg.stat], masteryRank, situation: msg.situation,
        level: attacker.level, difficulty: msg.difficulty, kind: msg.kind, mode: msg.mode,
        defender: defender ? combatProfile(defender) : null, feasible: msg.feasible !== false,
        baseDamage: msg.baseDamage, penetration: msg.penetration ?? 0,
        mjMinimum: member.role === "mj" ? (msg.mjMinimum ?? 0) : 0, effects: []
      })
      addEvent(room, user.id, "combat", { ...result, dice, attackerId: attacker.id,
        attackerName: attacker.name, defenderId: defender?.id ?? null,
        defenderName: defender?.name ?? null, masteryName, rulesVersion: TABLES_ENGINE_VERSION,
        resourcesApplied: false }, msg.visibility === "mj" ? "mj" : "public")
      await save(); notifyRoom(room.id)
      return
    }
    if (msg.type === "adjust_resource") {
      const { room } = gmFor(ws, msg.roomId)
      const c = room.characters[msg.characterId]
      if (!c) fail("NOT_FOUND", "Fiche inexistante.")
      if (!integer(msg.expectedRevision, 0, 10000000) || msg.expectedRevision !== c.revision)
        fail("CONFLICT", "Fiche modifiée entre-temps : actualisez puis réessayez.")
      if (!integer(msg.pvDelta, -99999, 99999) || !integer(msg.manaDelta, -99999, 99999))
        fail("FORMAT", "Variation de ressources invalide.")
      const pv = c.pv + msg.pvDelta, mana = c.mana + msg.manaDelta
      if (!integer(pv, 0, c.pvMax) || !integer(mana, 0, c.manaMax))
        fail("BOUNDS", "PV ou mana hors limites.")
      c.pv = pv; c.mana = mana; c.revision += 1
      addEvent(room, user.id, "ressources",
        c.name + " : PV " + c.pv + "/" + c.pvMax + " ; mana " + c.mana + "/" + c.manaMax)
      await save(); notifyRoom(room.id)
      return
    }
    fail("UNKNOWN", "Action inconnue.")
  }
  const files = {
    "/": ["index.html", "text/html; charset=utf-8"],
    "/table.js": ["table.js", "text/javascript; charset=utf-8"],
    "/table.css": ["table.css", "text/css; charset=utf-8"]
  }
  const httpServer = createServer(async (req, res) => {
    const entry = files[new URL(req.url, "http://localhost").pathname]
    res.setHeader("X-Content-Type-Options", "nosniff")
    res.setHeader("Cache-Control", "no-store")
    res.setHeader("Content-Security-Policy",
      "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self' ws: wss:; img-src 'self' data:; base-uri 'none'; form-action 'none'")
    if (!entry) { res.writeHead(404); res.end("Introuvable"); return }
    try {
      const body = await readFile(join(HERE, "client", entry[0]))
      res.writeHead(200, { "Content-Type": entry[1] }); res.end(body)
    } catch { res.writeHead(500); res.end("Interface indisponible") }
  })
  const wss = new WebSocketServer({
    server: httpServer, path: "/ws", maxPayload: 65536,
    verifyClient: ({ req }) => {
      if (!req.headers.origin) return true // clients de test Node ; jamais identité
      try { return new URL(req.headers.origin).host === req.headers.host } catch { return false }
    }
  })
  wss.on("connection", (ws) => {
    let windowStart = Date.now(), windowCount = 0
    online.set(ws, { userId: null, roomId: null })
    safeSend(ws, { type: "hello", protocol: "alrick.tables.local.v2", rulesVersion: TABLES_ENGINE_VERSION })
    ws.on("close", () => {
      const old = online.get(ws)
      online.delete(ws)
      if (old?.roomId) notifyRoom(old.roomId)
    })
    ws.on("message", (raw) => {
      if (Date.now() - windowStart > 10000) { windowStart = Date.now(); windowCount = 0 }
      if (++windowCount > 60) { ws.close(1008, "Débit dépassé"); return }
      let msg
      try { msg = JSON.parse(raw.toString("utf8")) }
      catch { safeSend(ws, { type: "error", code: "FORMAT", message: "JSON invalide." }); return }
      // Toutes les écritures passent dans une file globale, même entre connexions.
      tasks = tasks.then(async () => {
        // Reçus persistants : une réponse perdue ne doit pas provoquer de double mutation.
        // Les anciens clients sans actionId restent possibles mais sans garantie de déduplication.
        if (!MUTATIONS.has(msg?.type) || msg.actionId === undefined) return handle(ws, msg)
        if (typeof msg.actionId !== "string" || !/^[a-zA-Z0-9_-]{8,100}$/.test(msg.actionId))
          fail("FORMAT", "Identifiant d'action invalide.")
        const actor = userFor(ws)
        const key = actor.id + ":" + msg.actionId
        const { actionId, ...payload } = msg
        const digest = tokenHash(JSON.stringify(payload))
        const previous = db.operations[key]
        if (previous) {
          if (previous.digest !== digest) fail("IDEMPOTENCY", "Clé utilisée pour une autre action.")
          if (previous.roomId) {
            memberFor(ws, previous.roomId, false)
            online.get(ws).roomId = previous.roomId
            notifyRoom(previous.roomId)
          }
          safeSend(ws, { type: "action_ack", actionId, replay: true, roomId: previous.roomId ?? null })
          safeSend(ws, { type: "rooms", rooms: myRooms(ws) })
          return
        }
        db.operations[key] = { digest, type: msg.type, roomId: msg.roomId ?? null, at: now() }
        try {
          await handle(ws, msg)
          db.operations[key].roomId = online.get(ws)?.roomId ?? msg.roomId ?? null
          // Persistance du reçu AVANT accusé de réception.
          await save()
          safeSend(ws, { type: "action_ack", actionId, replay: false, roomId: db.operations[key].roomId })
        } catch (e) { delete db.operations[key]; throw e }
      }).catch(e => {
        safeSend(ws, { type: "error", actionId: msg?.actionId,
          code: e.code ?? "ERROR", message: e.message ?? "Erreur serveur." })
      })
    })
  })
  let tasks = Promise.resolve()
  await new Promise((resolve, reject) => {
    httpServer.once("error", reject)
    httpServer.listen(port, host, resolve)
  })
  return {
    port: httpServer.address().port, host, dataPath,
    close: async () => {
      for (const ws of online.keys()) ws.terminate()
      await new Promise(resolve => wss.close(resolve))
      await new Promise(resolve => httpServer.close(resolve))
      await tasks
    }
  }
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  createTableServer({
    host: process.env.TABLES_HOST || "127.0.0.1",
    port: Number(process.env.TABLES_PORT || 8787),
    dataPath: process.env.TABLES_DATA || join(process.cwd(), ".tables-local", "tables.json")
  }).then(server => {
    console.log("Tables d'Alrick — pilote local : http://" + server.host + ":" + server.port)
    console.log("Usage local seulement. Ne pas exposer ce serveur sur Internet.")
  }).catch(err => { console.error(err); process.exitCode = 1 })
}
