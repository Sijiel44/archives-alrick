/**
 * T-001 — recette Chrome headless : trois vrais profils de navigateur MJ + 2 joueurs
 * sur 127.0.0.1, avec serveur Tables réel. Complément aux tests WebSocket purs.
 * Aucun service distant ni canon manipulé.
 */
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { WebSocket } from "ws"
import { createTableServer } from "../tables-pilot/server.mjs"

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const tmp = await mkdtemp(path.join(tmpdir(), "tables-browser-"))
const browsers = []
let server
async function browser(name,base) {
  const profile = path.join(tmp,name)
  await mkdir(profile)
  const chrome = spawn(process.env.CHROME_BIN || "/usr/bin/google-chrome",
    ["--headless=new","--no-sandbox","--disable-dev-shm-usage","--remote-allow-origins=*",
      "--remote-debugging-port=0","--user-data-dir="+profile,"--window-size=1280,900","about:blank"],{stdio:"ignore"})
  const client = { chrome, socket:null, pending:new Map(), nextId:0, errors:[] }
  browsers.push(client)
  let port = 0
  for(let i=0;i<160;i++) {
    if(chrome.exitCode !== null)throw Error("Chrome inaccessible "+name)
    try{port=Number((await readFile(path.join(profile,"DevToolsActivePort"),"utf8")).split("\n")[0]);break}catch{}
    await sleep(100)
  }
  if(!port)throw Error("Port DevTools manquant "+name)
  const tabs=await (await fetch("http://127.0.0.1:"+port+"/json/list")).json()
  const target=tabs.find(x=>x.type==="page")
  if(!target)throw Error("Onglet Chrome manquant "+name)
  const ws=new WebSocket(target.webSocketDebuggerUrl)
  client.socket=ws
  await new Promise((resolve,reject)=>{ws.once("open",resolve);ws.once("error",reject)})
  ws.on("message",raw=>{
    const msg=JSON.parse(raw.toString())
    if(msg.method==="Runtime.exceptionThrown")
      client.errors.push(msg.params?.exceptionDetails?.exception?.description ?? msg.params?.exceptionDetails?.text ?? "JS")
    if(msg.id && client.pending.has(msg.id)){
      const item=client.pending.get(msg.id);client.pending.delete(msg.id)
      if(msg.error)item.reject(Error(JSON.stringify(msg.error)))
      else item.resolve(msg.result)
    }
  })
  client.cdp=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++client.nextId
    client.pending.set(id,{resolve,reject})
    ws.send(JSON.stringify({id,method,params}))
  })
  client.js=async expression=>{
    const value=await client.cdp("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true})
    if(value.exceptionDetails)throw Error(value.exceptionDetails.exception?.description || value.exceptionDetails.text)
    return value.result?.value
  }
  client.do=async(fn,...args)=>client.js("("+fn.toString()+")("+args.map(v=>JSON.stringify(v)).join(",")+")")
  client.until=async(predicate,label)=>{
    for(let i=0;i<180;i++){
      if(await client.do(predicate))return
      await sleep(100)
    }
    throw Error(name+" : attente "+label+" ; "+client.errors.join(" | "))
  }
  client.submit=(selector,values)=>client.do((s,vals)=>{
    const form=document.querySelector(s)
    if(!form)throw Error("Formulaire introuvable "+s)
    for(const [key,value] of Object.entries(vals)){
      const e=document.querySelector(key);if(!e)throw Error("Champ introuvable "+key)
      e.value=String(value);e.dispatchEvent(new Event("input",{bubbles:true}))
    }
    form.requestSubmit()
  },selector,values)
  await client.cdp("Page.enable");await client.cdp("Runtime.enable")
  await client.cdp("Page.navigate",{url:base})
  await client.until(()=>document.querySelector("#connection")?.textContent==="Serveur local connecté","connexion WebSocket")
  return client
}
try {
  server=await createTableServer({host:"127.0.0.1",port:0,dataPath:path.join(tmp,"tables.json")})
  const base="http://127.0.0.1:"+server.port+"/"
  const [gm,p1,p2]=await Promise.all(["MJ","Joueur1","Joueur2"].map(n=>browser(n,base)))
  for(const [client,pseudo] of [[gm,"ConteurChrome"],[p1,"AlyaChrome"],[p2,"BorinChrome"]]){
    await client.submit("#register-form",{"#pseudo":pseudo})
    await client.until(()=>document.querySelector("#identity")?.textContent.startsWith("Connecté comme"),"authentification")
    assert.equal(await client.do(()=>document.querySelector("#download-key").disabled),false)
  }
  await gm.submit("#create-form",{"#room-name":"Le Col des Trois"})
  await gm.until(()=>document.querySelector("#session")?.hidden===false,"table créée")
  const code=await gm.do(()=>document.querySelector("#room-invite").textContent)
  assert.equal(code.length,12)
  for(const client of [p1,p2]){
    await client.submit("#join-form",{"#invite-code":code})
    await client.until(()=>document.querySelector("#pending")?.hidden===false,"en attente MJ")
    assert.equal(await client.do(()=>document.querySelector("#session-grid").hidden),true)
  }
  await gm.until(()=>document.querySelectorAll("#roster button").length===2,"deux candidatures")
  await gm.do(()=>document.querySelector("#roster button").click())
  await gm.until(()=>document.querySelectorAll("#roster button").length===1,"première approbation")
  await gm.do(()=>document.querySelector("#roster button").click())
  await Promise.all([p1,p2].map(c=>c.until(()=>document.querySelector("#session-grid")?.hidden===false,"approbation joueur")))
  await p1.submit("#character-form",{"#character-name":"Alya"})
  await p2.submit("#character-form",{"#character-name":"Borin"})
  await Promise.all([p1,p2].map(c=>c.until(()=>document.querySelector("#character .character-card")!==null,"personnage créé")))
  await p1.submit("#roll-form",{})
  await Promise.all([gm,p1,p2].map(c=>c.until(()=>document.querySelector("#event-log")?.textContent.includes("Alya :"),"jet partagé")))
  const rollText=await p1.do(()=>document.querySelector("#event-log").textContent)
  assert(rollText.includes("brut 9") && rollText.includes(" + 6 (brut 9)"))
  await gm.do(()=>{const e=document.querySelector("#gm-note");e.value="Secret Chrome MJ";document.querySelector("#save-note").click()})
  await gm.until(()=>document.querySelector("#feedback")?.textContent.includes("Connecté")===false||document.querySelector("#gm-note").value==="Secret Chrome MJ","note MJ")
  assert.equal(await p1.do(()=>document.body.textContent.includes("Secret Chrome MJ")),false)
  assert.equal(await p2.do(()=>document.body.textContent.includes("Secret Chrome MJ")),false)
  await p1.cdp("Page.reload")
  await p1.until(()=>document.querySelector("#session")?.hidden===false,"reconnexion et restauration de la session")
  assert.equal(await p1.do(()=>document.querySelector("#event-log")?.textContent.includes("Alya :")),true)
  assert.deepEqual(browsers.flatMap(x=>x.errors),[])
  console.log("T-001 CHROME : 3 profils indépendants MJ+2, approbations, permissions, jet M01 partagé, secrets MJ, reconnexion : OK")
} finally {
  for(const c of browsers){
    try{c.socket?.close()}catch{}
    try{c.chrome.kill("SIGKILL")}catch{}
  }
  if(server)await server.close()
  await rm(tmp,{recursive:true,force:true,maxRetries:5,retryDelay:200})
}
