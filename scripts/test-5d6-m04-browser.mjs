/** M04.1 : recette réelle Chromium/Chrome sur la sortie Quartz. */
import assert from "node:assert/strict"
import {spawn} from "node:child_process"
import {createServer} from "node:http"
import {readFile,writeFile,readdir,mkdir,mkdtemp,rm} from "node:fs/promises"
import {tmpdir} from "node:os"
import path from "node:path"
import {WebSocket} from "ws"
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))
const root=path.resolve("public"),tmp=await mkdtemp(path.join(tmpdir(),"m041-"))
const downloads=path.join(tmp,"downloads");await mkdir(downloads)
let server,chrome,ws,nextId=0,dialogs=0,checks=0
const runtimeErrors=[]
const pending=new Map()
function cdp(method,params={}){
  return new Promise((resolve,reject)=>{
    const id=++nextId
    pending.set(id,{resolve,reject})
    ws.send(JSON.stringify({id,method,params}))
  })
}
async function runJS(expression){
  const x=await cdp("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true})
  if(x.exceptionDetails)throw Error(x.exceptionDetails.exception?.description||x.exceptionDetails.text)
  return x.result?.value
}
function browserFn(fn,...args){
  return runJS("("+fn.toString()+")("+args.map(x=>JSON.stringify(x)).join(",")+")")
}
async function waitFor(expression,label){
  for(let i=0;i<140;i++){
    try{if(await runJS(expression))return}catch{}
    await sleep(150)
  }
  throw Error("Délai navigateur dépassé : "+label)
}
async function test(name,fn){await fn();checks++;console.log("✓ Chrome : "+name)}
const click=s=>browserFn(q=>{const e=document.querySelector(q);if(!e)throw Error(q);e.click()},s)
const set=(s,v,event="input")=>browserFn((q,value,which)=>{
  const e=document.querySelector(q);if(!e)throw Error(q)
  e.value=String(value);e.dispatchEvent(new Event(which,{bubbles:true}))
},s,v,event)
async function inputFile(selector,filename){
  const {root:doc}=await cdp("DOM.getDocument")
  const {nodeId}=await cdp("DOM.querySelector",{nodeId:doc.nodeId,selector})
  assert.ok(nodeId,selector+" absent")
  await cdp("DOM.setFileInputFiles",{nodeId,files:[filename]})
  await browserFn(q=>document.querySelector(q).dispatchEvent(new Event("change",{bubbles:true})),selector)
}
/** Les clics CDP ne reçoivent pas toujours l'activation utilisateur nécessaire au
 * téléchargement sur disque. Capturer le Blob réellement créé et passé à a.click(). */
async function installDownloadRecorder(){
  await browserFn(()=>{
    if(window.__alrickRecorderInstalled)return
    window.__alrickRecorderInstalled=true
    window.__alrickExports=[]
    const originalURL=URL.createObjectURL.bind(URL)
    URL.createObjectURL=blob=>{
      window.__alrickLastBlob=blob
      return originalURL(blob)
    }
    const original=HTMLAnchorElement.prototype.click
    HTMLAnchorElement.prototype.click=function(){
      if(this.download&&window.__alrickLastBlob){
        const item={name:this.download,promise:window.__alrickLastBlob.text()}
        window.__alrickExports.push(item)
        // Empêche la navigation vers blob: lorsque CDP ne donne pas d'activation utilisateur.
        return
      }
      return original.call(this)
    }
  })
}
async function downloaded(prefix){
  for(let i=0;i<90;i++){
    const present=await runJS("window.__alrickExports?.length||0")
    if(present>0){
      const exportData=await browserFn(async ()=>{
        const record=window.__alrickExports.shift()
        return {name:record.name,body:await record.promise}
      })
      assert.ok(exportData.name.startsWith(prefix),"Export inattendu "+exportData.name)
      const dest=path.join(downloads,exportData.name)
      await writeFile(dest,exportData.body)
      return dest
    }
    await sleep(100)
  }
  throw Error("Aucun Blob d'export créé : "+prefix+" ; statut : "+await runJS("document.querySelector('[data-status]')?.textContent")+" ; erreurs JS : "+runtimeErrors.slice(-3).join(" | "))
}
async function navigate(url){
  await cdp("Page.navigate",{url})
  await waitFor('document.readyState==="complete"',"navigation "+url)
}
async function start(){
  server=createServer(async(req,res)=>{
    try{
      const u=new URL(req.url||"/","http://127.0.0.1")
      const p=decodeURIComponent(u.pathname).replace(/^\/archives-alrick(?=\/|$)/,"")||"/"
      const file=path.resolve(root,"."+p)
      if(file!==root&&!file.startsWith(root+path.sep))throw Error("Chemin interdit")
      const choices=[file,file+".html",path.join(file,"index.html")]
      let buf,chosen
      for(const name of choices)try{buf=await readFile(name);chosen=name;break}catch{}
      if(!buf){res.writeHead(404);res.end("404");return}
      const ext=path.extname(chosen)
      const type={".html":"text/html; charset=utf-8",".js":"application/javascript",".css":"text/css",
        ".json":"application/json",".png":"image/png",".svg":"image/svg+xml",".woff2":"font/woff2"}
      res.writeHead(200,{"Content-Type":type[ext]||"application/octet-stream"})
      res.end(buf)
    }catch(e){res.writeHead(500);res.end(String(e))}
  })
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve))
  const bin=process.env.CHROME_BIN||"/usr/bin/google-chrome"
  chrome=spawn(bin,["--headless=new","--no-sandbox","--disable-dev-shm-usage",
    "--remote-allow-origins=*","--remote-debugging-port=0",
    "--user-data-dir="+path.join(tmp,"profile"),"--window-size=1280,900","about:blank"],{stdio:"ignore"})
  let port=0
  for(let i=0;i<160;i++){
    if(chrome.exitCode!==null)throw Error("Chrome inaccessible : "+bin)
    try{port=Number((await readFile(path.join(tmp,"profile","DevToolsActivePort"),"utf8")).split("\n")[0]);break}catch{}
    await sleep(100)
  }
  if(!port)throw Error("Impossible d'obtenir le port de Chromium")
  const tabs=await (await fetch("http://127.0.0.1:"+port+"/json/list")).json()
  const tab=tabs.find(x=>x.type==="page")
  assert.ok(tab)
  ws=new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((resolve,reject)=>{ws.once("open",resolve);ws.once("error",reject)})
  ws.on("message",raw=>{
    const x=JSON.parse(raw.toString())
    if(x.method==="Runtime.exceptionThrown"){
      runtimeErrors.push(x.params?.exceptionDetails?.exception?.description||x.params?.exceptionDetails?.text||"Erreur JS")
    }
    if(x.method==="Page.javascriptDialogOpening"){
      dialogs++
      void cdp("Page.handleJavaScriptDialog",{accept:true})
    }
    if(x.id&&pending.has(x.id)){
      const cb=pending.get(x.id);pending.delete(x.id)
      if(x.error)cb.reject(Error(JSON.stringify(x.error)))
      else cb.resolve(x.result)
    }
  })
  await cdp("Page.enable");await cdp("Runtime.enable");await cdp("DOM.enable")
  await cdp("Browser.setDownloadBehavior",{behavior:"allow",downloadPath:downloads,eventsEnabled:true})
  return "http://127.0.0.1:"+server.address().port+"/archives-alrick"
}
try{
  const base=await start()
  await navigate(base+"/jouer/atelier-bestiary-5d6")
  await waitFor('document.querySelector("#bestiary-workshop [data-active]")?.options.length>0',"Bestiaire initial")
  await test("Trois modes, création Colosse N15",async()=>{
    for(const m of ["guide","expert","rapide","expert"]){
      await click("[data-mode="+m+"]")
      assert.equal(await runJS('document.querySelector("[data-mode='+m+']").getAttribute("aria-pressed")'),"true")
    }
    await set("[data-level]",15,"change")
    await set("[data-archetype]","colosse","change")
    const a=await browserFn(()=>{
      const q=s=>document.querySelector(s)
      return {stats:["physique","agilite","esprit","presence"].map(k=>Number(q("[data-stat="+k+"]").value)),
        bonuses:["physique","agilite","esprit","presence"].map(k=>q("[data-stat-effective="+k+"]").textContent),
        pv:Number(q("[data-number=pvMax]").value)}
    })
    assert.deepEqual(a.stats,[15,7,8,8]);assert.equal(a.pv,194)
    assert.deepEqual(a.bonuses,["Bonus effectif +7","Bonus effectif +5","Bonus effectif +5","Bonus effectif +5"])
  })
  await test("Maîtrise et protection recalculées",async()=>{
    const before=await runJS('document.querySelector("[data-math]").textContent')
    await set("[data-mastery=lames]",21)
    const after=await runJS('document.querySelector("[data-math]").textContent')
    assert.notEqual(before,after)
    const again=after
    await set("[data-def=protection][data-kind=physique]",60)
    assert.notEqual(again,await runJS('document.querySelector("[data-math]").textContent'))
    await set("[data-def=protection][data-kind=physique]",0)
  })
  await test("Sauvegarde, rechargement, duplication, suppression",async()=>{
    await set("[data-text=name]","Colosse recette M04.1")
    await cdp("Page.reload")
    await waitFor('document.querySelector("#bestiary-workshop [data-text=name]")?.value==="Colosse recette M04.1"',"persistance")
    const n=await runJS('document.querySelector("[data-active]").options.length')
    await click("[data-action=duplicate]")
    assert.equal(await runJS('document.querySelector("[data-active]").options.length'),n+1)
    const d=dialogs
    await click("[data-action=delete]")
    await waitFor("document.querySelector('[data-active]').options.length==="+n,"suppression")
    assert.ok(dialogs>d)
    await sleep(400) // confirmation native fermée : navigateur pleinement disponible
  })
  let exportedCard
  await test("Export/import JSON propre au Bestiaire",async()=>{
    const n=await runJS('document.querySelector("[data-active]").options.length')
    await installDownloadRecorder()
    console.log("Avant export Bestiaire",await browserFn(()=>({ready:document.readyState,
      recorder:window.__alrickRecorderInstalled,button:document.querySelector("[data-action=export]")?.outerHTML,
      statuses:document.querySelectorAll("#bestiary-workshop").length,
      active:document.querySelector("[data-active]")?.value})))
    await click("[data-action=export]")
    console.log("Après export Bestiaire",await browserFn(()=>({count:window.__alrickExports?.length,
      blob:!!window.__alrickLastBlob,status:document.querySelector("[data-status]")?.textContent})),runtimeErrors.slice(-3))
    exportedCard=await downloaded("alrick-bestiary-")
    assert.equal(JSON.parse(await readFile(exportedCard,"utf8")).pvMax,194)
    await inputFile("#bestiary-workshop [data-import]",exportedCard)
    await waitFor("document.querySelector('[data-active]').options.length==="+(n+1),"réimportation")
  })
  let exportedAtelier
  await test("Export M03 vers Atelier principal",async()=>{
    await click("[data-action=export-atelier]")
    console.log("Export Atelier - statut:",await runJS("document.querySelector('[data-status]')?.textContent"),"blobs:",await runJS("window.__alrickExports?.length"),"exceptions:",runtimeErrors.slice(-3))
    exportedAtelier=await downloaded("alrick-creature-pour-atelier")
    const data=JSON.parse(await readFile(exportedAtelier,"utf8"))
    assert.equal(data.schema,"alrick.sheets.v3")
    assert.equal(data.sheets[0].ruleset,"m03-bestiary")
  })
  await test("Interface mobile et navigation Quartz",async()=>{
    await cdp("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true})
    await sleep(350)
    const m=await browserFn(()=>{const a=document.querySelector("#bestiary-workshop");return {
      width:a.getBoundingClientRect().width,viewport:innerWidth,overflow:a.scrollWidth-a.clientWidth}})
    assert.ok(m.width<=m.viewport+3,"débordement de page mobile")
    assert.ok(m.overflow<=5,"débordement horizontal des contrôles")
    await cdp("Emulation.clearDeviceMetricsOverride")
    await navigate(base+"/jouer/atelier-5d6")
    await waitFor('document.querySelector("#atelier-5d6 [data-active]")?.options.length>0',"Atelier M02")
  })
  await test("Import M03, champs et règles hors budget PJ",async()=>{
    const n=await runJS('document.querySelector("#atelier-5d6 [data-active]").options.length')
    await inputFile("#atelier-5d6 [data-import]",exportedAtelier)
    await waitFor('document.querySelector("#atelier-5d6 [data-active]").options.length>'+n,"import principal")
    const state=await browserFn(()=>{
      const raw=localStorage.getItem("archives-alrick-atelier-5d6-v2")
      return raw&&JSON.parse(raw)
    })
    assert.ok(state)
    const imported=state.sheets.find(x=>x.ruleset==="m03-bestiary")
    assert.ok(imported,"Contrat M03 perdu")
    assert.equal(imported.level,15);assert.equal(imported.pvMax,194)
    assert.deepEqual(imported.stats,{physique:15,agilite:7,esprit:8,presence:8})
    assert.equal(imported.resistanceBonus.physique,3)
    assert.equal(imported.protection.physique,0)
    assert.equal(imported.bestiarySource.schema,"alrick.bestiary.v1")
  })
  await test("Préservation legacy et préparation d'un attaquant M02",async()=>{
    const pj={name:"PJ recette",kind:"pj",ruleset:"m02",level:5,highestLevel:5,
      stats:{physique:3,agilite:3,esprit:3,presence:3},masteries:{lames:0},
      pvMax:36,pv:36,development:{startingStats:{physique:3,agilite:3,esprit:3,presence:3},
        abilities:[],awards:[],approvedMilestones:[],history:[]}}
    const legacy={name:"Témoin historique",kind:"pnj",level:5,pvMax:33,pv:33,
      stats:{physique:6,agilite:4,esprit:4,presence:3},uniqueHistorique:"à préserver"}
    const file=path.join(tmp,"fixtures.json")
    await writeFile(file,JSON.stringify({schema:"alrick.sheets.v3",sheets:[pj,legacy]}))
    const n=await runJS('document.querySelector("#atelier-5d6 [data-active]").options.length')
    await inputFile("#atelier-5d6 [data-import]",file)
    await waitFor('document.querySelector("#atelier-5d6 [data-active]").options.length==='+String(n+2),"profils de référence")
    const saved=await browserFn(()=>JSON.parse(localStorage.getItem("archives-alrick-atelier-5d6-v2")))
    assert.equal(saved.sheets.find(x=>x.name==="Témoin historique").legacyOriginal.uniqueHistorique,"à préserver")
  })
  await test("Jet moderne M02 → M03 et confirmation MJ des dégâts",async()=>{
    const saved=await browserFn(()=>JSON.parse(localStorage.getItem("archives-alrick-atelier-5d6-v2")))
    const pj=saved.sheets.find(x=>x.name==="PJ recette"),creature=saved.sheets.find(x=>x.ruleset==="m03-bestiary")
    assert.ok(pj&&creature)
    await set("#atelier-5d6 [data-active]",pj.id,"change")
    await click('#atelier-5d6 [data-mode="mj"]')
    await set("#atelier-5d6 [data-opposition-target]",creature.id,"change")
    await browserFn(()=>{document.querySelector("#atelier-5d6 [data-opposition-enabled]").checked=true;Math.random=()=>.999999999})
    await set("#atelier-5d6 [data-opposition-mode]","melee","change")
    await set("#atelier-5d6 [data-opposition-base]",12,"change")
    await click("#atelier-5d6 [data-roll]")
    await waitFor('document.querySelector("#atelier-5d6 [data-opposition-apply]")?.hidden===false',"attaque M03 réussie")
    const old=dialogs
    await click("#atelier-5d6 [data-opposition-apply]")
    await waitFor("JSON.parse(localStorage.getItem('archives-alrick-atelier-5d6-v2')).sheets.some(x=>x.ruleset==='m03-bestiary'&&x.pv<x.pvMax)","PV confirmés")
    assert.ok(dialogs>old)
    await cdp("Page.reload")
    await waitFor('document.querySelector("#atelier-5d6 [data-active]")?.options.length>3',"rechargement après attaque")
    const again=await browserFn(()=>JSON.parse(localStorage.getItem("archives-alrick-atelier-5d6-v2")))
    assert.ok(again.sheets.find(x=>x.ruleset==="m03-bestiary").pv<194)
    assert.equal(again.sheets.find(x=>x.name==="Témoin historique").legacyOriginal.uniqueHistorique,"à préserver")
  })
  console.log("M04.1 CHROME : "+checks+" scénarios complets, "+dialogs+" dialogues de confirmation.")
}finally{
  try{ws?.close()}catch{}
  try{chrome?.kill("SIGKILL")}catch{}
  if(server)await new Promise(resolve=>server.close(resolve))
  await sleep(450)
  try{await rm(tmp,{recursive:true,force:true,maxRetries:5,retryDelay:400})}catch(e){console.warn("Nettoyage du profil Chrome incomplet :",String(e))}
}
