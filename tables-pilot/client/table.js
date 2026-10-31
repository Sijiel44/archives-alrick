// Interface sans framework du pilote LAN. Aucun résultat de dé officiel n'est tiré ici.
// Tous les contenus provenant des joueurs sont affichés avec textContent (jamais innerHTML).
const $ = (id) => document.getElementById(id)
const STORAGE_KEY = "alrick.tables.pilot.token.v1"
const ROOM_KEY = "alrick.tables.pilot.room.v1"
let socket, token = localStorage.getItem(STORAGE_KEY), user = null
let roomId = null, rooms = [], state = null

function feedback(text) { $("feedback").textContent = text }
function send(type, body = {}) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    feedback("Connexion perdue : actualisez la page pour reprendre.")
    return
  }
  socket.send(JSON.stringify({ type, ...body }))
}
function el(tag, text, className) {
  const e = document.createElement(tag)
  if (text !== undefined) e.textContent = text
  if (className) e.className = className
  return e
}
function button(text, callback) {
  const b = el("button", text)
  b.type = "button"; b.addEventListener("click", callback)
  return b
}
function setAuth(u) {
  user = u
  $("register-form").hidden = !!u
  $("identity").textContent = u ? "Connecté comme " + u.pseudo : "Non connecté"
  $("download-key").disabled = !u || !token
  $("forget-key").disabled = !u
  $("lobby-panel").hidden = !u
  refreshLobby()
}
function refreshLobby() {
  const box = $("room-list"); box.replaceChildren()
  if (!rooms.length) { box.append(el("p", "Aucune table enregistrée.")); return }
  for (const r of rooms) {
    box.append(button(r.name + " · " + (r.role === "mj" ? "MJ" : "joueur") +
      " · " + (r.approved ? r.status : "en attente"), () => selectRoom(r.id)))
  }
}
function selectRoom(id) {
  roomId = id
  localStorage.setItem(ROOM_KEY, id)
  send("select_room", { roomId: id })
}
function onSnapshot(s) {
  state = s; roomId = s.room.id
  localStorage.setItem(ROOM_KEY, roomId)
  $("landing").hidden = true; $("session").hidden = false
  const gm = s.myself.role === "mj" && s.myself.approved
  $("table-name").textContent = s.room.name
  $("table-desc").textContent = [s.room.campaign, s.room.description].filter(Boolean).join(" · ")
  $("role-heading").textContent = gm ? "MAÎTRE DU JEU" : "AVENTURIER · " + s.myself.pseudo
  $("table-state").textContent = s.room.status
  $("pending").hidden = s.myself.approved
  $("session-grid").hidden = !s.myself.approved
  if (!s.myself.approved) return
  $("gm-panel").hidden = !gm
  $("secret-roll").disabled = !gm
  if (!gm) $("secret-roll").checked = false
  renderRoster(s, gm)
  renderCharacters(s, gm)
  renderEvents(s)
  if (gm) {
    $("room-invite").textContent = s.room.invite || "—"
    $("status-select").value = s.room.status
    if (document.activeElement !== $("gm-note")) $("gm-note").value = s.gmNote || ""
    renderGm(s)
  }
}
function renderRoster(s, gm) {
  const box = $("roster"); box.replaceChildren()
  for (const p of s.members) {
    const row = el("div", undefined, "roster-entry")
    row.append(el("strong", (p.connected ? "● " : "○ ") + p.pseudo))
    row.append(el("div", (p.role === "mj" ? "MJ" : "Joueur") +
      " · " + (p.approved ? "accepté" : "candidature") +
      " · " + (p.connected ? "en ligne" : "hors ligne"), "meta"))
    if (gm && !p.approved && p.role === "joueur")
      row.append(button("Accepter ce joueur", () =>
        send("approve_member", { roomId, userId: p.id })))
    box.append(row)
  }
}
function renderCharacters(s, gm) {
  const box = $("character"); box.replaceChildren()
  const mine = s.characters.find(c => c.ownerId === user.id)
  const mineCard = mine ? renderCharacterCard(mine) : el("p", "Aucun personnage associé.")
  box.append(mineCard)
  $("character-form").hidden = !!mine
  $("import-label").hidden = !!mine
  if (!gm && mine && !mine.approved)
    box.append(el("p", "Fiche importée : validation du MJ nécessaire avant les jets.", "small"))
}
function renderCharacterCard(c) {
  const card = el("div", undefined, "character-card")
  card.append(el("strong", c.name))
  card.append(el("div", "Niveau " + c.level + " · " +
    (c.approved ? "validé" : "en attente MJ") + " · révision " + c.revision, "meta"))
  card.append(el("div", "PV " + c.pv + "/" + c.pvMax +
    " · Mana " + c.mana + "/" + c.manaMax))
  card.append(el("div", "Phys " + c.stats.physique + " · Agi " + c.stats.agilite +
    " · Esp " + c.stats.esprit + " · Prés " + c.stats.presence, "meta"))
  return card
}
function renderGm(s) {
  const box = $("gm-chars"); box.replaceChildren()
  for (const c of s.characters) {
    const wrap = el("div", undefined, "gm-char")
    wrap.append(renderCharacterCard(c))
    if (!c.approved) wrap.append(button("Valider cette fiche", () =>
      send("approve_character", { roomId, characterId: c.id })))
    const actions = el("div", undefined, "actions")
    for (const [label, pv, mana] of [
      ["−1 PV", -1, 0], ["+1 PV", 1, 0], ["−1 mana", 0, -1], ["+1 mana", 0, 1]
    ]) actions.append(button(label, () =>
      send("adjust_resource", { roomId, characterId: c.id,
        expectedRevision: c.revision, pvDelta: pv, manaDelta: mana })))
    wrap.append(actions); box.append(wrap)
  }
  if (!s.characters.length) box.append(el("p", "Aucune fiche créée pour l'instant.", "small"))
}
function renderEvents(s) {
  const log = $("event-log")
  const wasNearBottom = log.scrollTop + log.clientHeight >= log.scrollHeight - 40
  log.replaceChildren()
  for (const event of s.events) {
    const row = el("li", undefined,
      event.kind === "jet" ? "roll-event" : event.visibility === "mj" ? "gm-event" : "")
    const who = s.members.find(x => x.id === event.by)?.pseudo || "Inconnu"
    row.append(el("small", new Date(event.at).toLocaleString("fr-CA") +
      " · " + who + " · " + event.kind + (event.visibility === "mj" ? " · SECRET MJ" : "")))
    if (event.kind === "jet") {
      const r = event.detail
      row.append(el("strong", r.characterName + " : " + r.outcome))
      row.append(el("div", "  [" + r.dice.join(" · ") + "] = " + r.natural +
        " + " + r.stat + " + " + r.skill + " " + (r.situation < 0 ? "−" + Math.abs(r.situation) : "+" + r.situation) +
        " = " + r.total + " / " + r.target))
    } else row.append(el("div", String(event.detail)))
    log.append(row)
  }
  if (!s.events.length) log.append(el("li", "Le carnet de séance est encore vierge."))
  if (wasNearBottom) log.scrollTop = log.scrollHeight
  const last = [...s.events].reverse().find(e => e.kind === "jet")
  if (last) {
    const r = last.detail
    $("last-roll").textContent = r.characterName + " · " + r.outcome +
      " · " + r.total + "/" + r.target
    $("dice-row").replaceChildren(...r.dice.map(d => el("span", String(d))))
  }
}
function connect() {
  socket = new WebSocket((location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws")
  socket.addEventListener("open", () => {
    $("signal").classList.add("online")
    $("connection").textContent = "Serveur local connecté"
    feedback("Connecté. Aucune donnée transmise à un service externe.")
    if (token) send("auth", { token })
  })
  socket.addEventListener("close", () => {
    $("signal").classList.remove("online")
    $("connection").textContent = "Hors ligne"
    feedback("Serveur local déconnecté. Rechargez la page une fois relancé.")
  })
  socket.addEventListener("message", (e) => {
    let m
    try { m = JSON.parse(e.data) } catch { return }
    switch (m.type) {
      case "hello": return
      case "registered":
        token = m.token; localStorage.setItem(STORAGE_KEY, token)
        rooms = []; setAuth(m.user); feedback("Identité créée. Exportez votre clé de récupération.")
        return
      case "authenticated": {
        rooms = m.rooms || []; setAuth(m.user)
        const saved = localStorage.getItem(ROOM_KEY)
        if (rooms.some(r => r.id === saved)) selectRoom(saved)
        return
      }
      case "room_created":
      case "joined":
        selectRoom(m.roomId); feedback(m.type === "joined" ?
          "Demande transmise : le MJ doit vous accepter." : "Table créée. Partagez le code d'invitation.")
        return
      case "selected": return
      case "rooms": rooms = m.rooms || []; refreshLobby(); return
      case "snapshot": onSnapshot(m); return
      case "error":
        feedback(m.code + " : " + m.message)
        if (m.code === "AUTH" && !user) {
          token = null; localStorage.removeItem(STORAGE_KEY)
          setAuth(null)
        }
        return
      default: return
    }
  })
}
$("register-form").addEventListener("submit", e => {
  e.preventDefault(); send("register", { pseudo: $("pseudo").value })
})
$("create-form").addEventListener("submit", e => {
  e.preventDefault()
  send("create_room", { name: $("room-name").value,
    campaign: $("campaign").value, description: $("description").value,
    maxPlayers: Number($("max-players").value) })
})
$("join-form").addEventListener("submit", e => {
  e.preventDefault(); send("join_room", { code: $("invite-code").value.trim() })
})
$("back-lobby").addEventListener("click", () => {
  $("session").hidden = true; $("landing").hidden = false
  feedback("Pour rejoindre une autre table, utilisez le code d'invitation.")
})
$("character-form").addEventListener("submit", e => {
  e.preventDefault(); send("create_character", { roomId, name: $("character-name").value })
})
$("import-sheet").addEventListener("change", async e => {
  const f = e.target.files?.[0]
  e.target.value = ""
  if (!f) return
  if (f.size > 5 * 1024 * 1024) { feedback("Fichier trop volumineux (5 Mio max)."); return }
  try {
    const json = JSON.parse(await f.text())
    const sheet = json?.sheets?.[0] ?? json?.sheet ?? json
    if (!sheet || typeof sheet !== "object" || typeof sheet.name !== "string" || !sheet.stats)
      throw new Error("Fiche 5d6 invalide.")
    // Liste blanche : aucune note MJ, image, inventaire ou secret n'est envoyé au pilote.
    send("create_character", { roomId, sheet: {
      name: sheet.name, level: sheet.level, stats: sheet.stats, skill: sheet.skill,
      pv: sheet.pv, pvMax: sheet.pvMax, mana: sheet.mana, manaMax: sheet.manaMax
    } })
    feedback("Import demandé : seule la fiche réduite est transmise au serveur local, puis soumise au MJ.")
  } catch (err) { feedback("Import refusé : " + err.message) }
})
$("message-form").addEventListener("submit", e => {
  e.preventDefault(); send("message", { roomId, text: $("message").value })
  $("message").value = ""
})
$("roll-form").addEventListener("submit", e => {
  e.preventDefault()
  send("roll", { roomId, stat: $("roll-stat").value,
    target: Number($("roll-target").value),
    situation: Number($("roll-situation").value),
    visibility: $("secret-roll").checked ? "mj" : "public" })
})
$("status-select").addEventListener("change", () =>
  send("set_status", { roomId, status: $("status-select").value }))
$("save-note").addEventListener("click", () =>
  send("gm_note", { roomId, note: $("gm-note").value }))
$("copy-invite").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("room-invite").textContent); feedback("Code d'invitation copié.") }
  catch { feedback("Sélectionnez puis copiez le code affiché.") }
})
$("download-key").addEventListener("click", () => {
  if (!token || !user) return
  const blob = new Blob([JSON.stringify({
    schema: "alrick.tables.recovery.v1", pseudo: user.pseudo, token
  }, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = "alrick-cle-de-recuperation.json"
  a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  feedback("Clé exportée : protégez ce fichier comme un mot de passe.")
})
$("restore-key").addEventListener("change", async e => {
  const f = e.target.files?.[0]; e.target.value = ""
  if (!f || f.size > 10000) return
  try {
    const data = JSON.parse(await f.text())
    if (data.schema !== "alrick.tables.recovery.v1" ||
        typeof data.token !== "string" || data.token.length < 32)
      throw new Error("Format de récupération invalide.")
    localStorage.setItem(STORAGE_KEY, data.token)
    localStorage.removeItem(ROOM_KEY)
    location.reload()
  } catch (err) { feedback("Récupération refusée : " + err.message) }
})
$("forget-key").addEventListener("click", () => {
  if (!confirm("Déconnecter ce navigateur ? Avez-vous bien exporté votre clé de récupération ?")) return
  localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(ROOM_KEY); location.reload()
})
setAuth(null)
connect()
