/** M04.1 : recette réelle Chromium/Chrome sur la sortie Quartz. */
import assert from "node:assert/strict"
import {spawn} from "node:child_process"
import {createServer} from "node:http"
import {readFile,writeFile,readdir,mkdir,mkdtemp,rm} from "node:fs/promises"
import {tmpdir} from "node:os"
import path from "node:path"
import {WebSocket} from "ws"
import {build} from "esbuild"
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))
const root=path.resolve("public"),tmp=await mkdtemp(path.join(tmpdir(),"m041-"))
const downloads=path.join(tmp,"downloads");await mkdir(downloads)
let server,chrome,ws,nextId=0,dialogs=0,checks=0
const failures=[]
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
const screenshots=path.resolve("artifacts","m041")
async function screenshot(name){
  await mkdir(screenshots,{recursive:true})
  const result=await cdp("Page.captureScreenshot",{format:"png",captureBeyondViewport:false})
  await writeFile(path.join(screenshots,name),Buffer.from(result.data,"base64"))
}
async function test(name,fn){
  try{await fn();checks++;console.log("✓ Chrome : "+name)}
  catch(error){failures.push(name+": "+String(error));console.error("✗ Chrome : "+name+" — "+String(error))}
}
async function pureBestiaryFixture(){
  const output=await build({entryPoints:["quartz/components/scripts/atelier5d6-bestiary-workshop.ts"],
    bundle:true,platform:"node",format:"esm",target:"es2022",write:false,logLevel:"silent"})
  const lab=await import("data:text/javascript;base64,"+Buffer.from(output.outputFiles[0].text).toString("base64"))
  const card=lab.createBestiaryCard(15,"colosse")
  card.name="Colosse recette M04.1"
  return lab.exportBestiaryForAtelier(card)
}
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
// Page.navigate/ Page.reload retournent avant le chargement réel. Une lecture immédiate
// de readyState peut observer l'ANCIEN document ; attendre Page.loadEventFired.
async function awaitPageLoad(trigger,label){
  let cleanup=()=>{}
  const load=new Promise((resolve,reject)=>{
    let timer
    const listener=raw=>{
      const event=JSON.parse(raw.toString())
      if(event.method!=="Page.loadEventFired")return
      cleanup();resolve()
    }
    cleanup=()=>{clearTimeout(timer);ws.off("message",listener)}
    ws.on("message",listener)
    timer=setTimeout(()=>{cleanup();reject(Error("Chargement Chrome non terminé : "+label))},30000)
  })
  try{await trigger();await load}catch(error){cleanup();throw error}
}
async function navigate(url){
  await awaitPageLoad(()=>cdp("Page.navigate",{url}),"navigation "+url)
  await waitFor('document.readyState==="complete"',"document "+url)
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
  return process.env.PUBLIC_BASE?.replace(/\/$/,"") || "http://127.0.0.1:"+server.address().port+"/archives-alrick"
}
try{
  const base=await start()
  await navigate(base+"/jouer/atelier-bestiary-5d6")
  await waitFor('document.querySelector("#bestiary-workshop [data-active]")?.options.length>0',"Bestiaire initial")
  await waitFor('document.querySelector("#bestiary-workshop")?.dataset.initialized==="true"',"contrôleurs du Bestiaire initialisés")
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
    await screenshot("bestiary-desktop.png")
  })
  await test("M05 : fiche essentielle Colosse N15 et absence de portrait",async()=>{
    const data=await browserFn(()=>{
      const r=document.querySelector("[data-m05-content]")
      return {title:r.querySelector("h3")?.textContent,
        raws:[...r.querySelectorAll(".m05-stat-raw")].map(e=>Number(e.textContent)),
        bonuses:[...r.querySelectorAll(".m05-stat-bonus")].map(e=>e.textContent),
        hp:r.querySelector(".m05-quick")?.textContent,
        portrait:!!r.querySelector(".m05-portrait img"),
        sections:r.querySelectorAll("details[data-m05-panel]").length}
    })
    assert.deepEqual(data.raws,[15,7,8,8])
    assert.deepEqual(data.bonuses,["Bonus +7","Bonus +5","Bonus +5","Bonus +5"])
    assert.ok(data.hp.includes("194"))
    assert.equal(data.portrait,false)
    assert.ok(data.sections>=7)
    await screenshot("m05-colosse-essential.png")
  })
  await test("M05 : inspecteur, détails, clavier et statut documentaire",async()=>{
    await browserFn(()=>{
      const details=document.querySelector('[data-m05-panel="math"]')
      details.querySelector("summary").focus()
    })
    const active=await runJS("document.activeElement?.tagName")
    assert.equal(active,"SUMMARY","le panneau n'a pas reçu le focus clavier")
    await cdp("Input.dispatchKeyEvent",{type:"rawKeyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13,nativeVirtualKeyCode:13})
    await cdp("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13,nativeVirtualKeyCode:13})
    let opened=await runJS("document.querySelector('[data-m05-panel=math]')?.open===true")
    if(!opened){
      // Chromium headless peut ignorer Enter sans événement 'char'. Essayer Espace,
      // qui active nativement un summary au relâchement de la touche.
      await cdp("Input.dispatchKeyEvent",{type:"rawKeyDown",key:" ",code:"Space",windowsVirtualKeyCode:32,nativeVirtualKeyCode:32})
      await cdp("Input.dispatchKeyEvent",{type:"char",key:" ",code:"Space",text:" ",unmodifiedText:" "})
      await cdp("Input.dispatchKeyEvent",{type:"keyUp",key:" ",code:"Space",windowsVirtualKeyCode:32,nativeVirtualKeyCode:32})
      opened=await runJS("document.querySelector('[data-m05-panel=math]')?.open===true")
    }
    assert.equal(opened,true,"aucune activation clavier native du panneau M05")
    const content=await runJS("document.querySelector('[data-m05-panel=math]')?.textContent")
    assert.ok(content.includes("7 776"))
    assert.ok(content.includes("194"))
    await click("[data-mode=expert]")
    await set('[data-m05-link="id"]',"DRG-01","change")
    await set('[data-m05-link="source"]',"Audit B-001 — non vérifié","change")
    await click('[data-m05-panel="sources"] summary')
    const d=await runJS("document.querySelector('[data-m05-panel=sources]')?.textContent")
    assert.ok(d.includes("DRG-01"))
    assert.ok(d.includes("non vérifié"))
    assert.equal(await runJS("document.querySelector('[data-m05-content] a')===null"),true)
  })
  await test("M05 : impression réelle Chrome et formats",async()=>{
    await set("[data-m05-format]","combat","change")
    await cdp("Emulation.setEmulatedMedia",{media:"print"})
    const printRules=await browserFn(()=>({
      sidebar:getComputedStyle(document.querySelector(".left.sidebar")).display,
      intro:getComputedStyle(document.querySelector(".archive-intro")).display,
      title:getComputedStyle(document.querySelector(".m05-identity h3")).color
    }))
    assert.equal(printRules.sidebar,"none","navigation latérale encore imprimée")
    assert.equal(printRules.intro,"none","titre du site encore imprimé")
    assert.equal(printRules.title,"rgb(17, 17, 17)","contraste de la fiche insuffisant sur fond blanc")
    const result=await cdp("Page.printToPDF",{printBackground:true,preferCSSPageSize:true})
    const pdf=Buffer.from(result.data,"base64")
    assert.ok(pdf.length>5000,"PDF imprimé anormalement vide")
    await mkdir(screenshots,{recursive:true})
    await writeFile(path.join(screenshots,"m05-combat-print.pdf"),pdf)
    await cdp("Emulation.setEmulatedMedia",{media:"screen"})
    await set("[data-m05-format]","pedagogique","change")
    await cdp("Emulation.setEmulatedMedia",{media:"print"})
    const pedagogic=await cdp("Page.printToPDF",{printBackground:true,preferCSSPageSize:true})
    assert.ok(Buffer.from(pedagogic.data,"base64").length>5000)
    await cdp("Emulation.setEmulatedMedia",{media:"screen"})
    await set("[data-m05-format]","essentielle","change")
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
  let exportedCard
  await test("Export/import JSON propre au Bestiaire",async()=>{
    const n=await runJS('document.querySelector("[data-active]").options.length')
    await installDownloadRecorder()
    try{
      const target=await cdp("Runtime.evaluate",{expression:'document.querySelector("#bestiary-workshop")'})
      const events=await cdp("DOMDebugger.getEventListeners",{objectId:target.result.objectId})
      console.log("Écouteurs sur la racine Bestiaire",events.listeners?.map(e=>({type:e.type,scriptId:e.scriptId,useCapture:e.useCapture})))
    }catch(error){console.log("Inspection DOMDebugger indisponible",String(error))}
    console.log("Avant export Bestiaire",await browserFn(()=>({ready:document.readyState,
      recorder:window.__alrickRecorderInstalled,initialized:document.querySelector('#bestiary-workshop')?.dataset.initialized,lastAction:document.querySelector('#bestiary-workshop')?.dataset.lastAction,button:document.querySelector("[data-action=export]")?.outerHTML,
      statuses:document.querySelectorAll("#bestiary-workshop").length,
      active:document.querySelector("[data-active]")?.value})))
    await click("[data-action=export]")
    console.log("Après export Bestiaire",await browserFn(()=>({count:window.__alrickExports?.length,
      blob:!!window.__alrickLastBlob,initialized:document.querySelector('#bestiary-workshop')?.dataset.initialized,lastAction:document.querySelector('#bestiary-workshop')?.dataset.lastAction,exportStage:document.querySelector('#bestiary-workshop')?.dataset.exportStage,downloadStage:document.querySelector('#bestiary-workshop')?.dataset.downloadStage,status:document.querySelector("[data-status]")?.textContent})),runtimeErrors.slice(-3))
    exportedCard=await downloaded("alrick-bestiary-")
    assert.equal(JSON.parse(await readFile(exportedCard,"utf8")).pvMax,194)
    await inputFile("#bestiary-workshop [data-import]",exportedCard)
    await waitFor("document.querySelector('[data-active]').options.length==="+(n+1),"réimportation")
  })
  await test("Sauvegarde, rechargement, duplication, suppression",async()=>{
    await set("[data-text=name]","Colosse recette M04.1")
    await awaitPageLoad(()=>cdp("Page.reload"),"rechargement de la page")
    await waitFor('document.querySelector("#bestiary-workshop")?.dataset.initialized==="true"',"initialisation après rechargement")
    await installDownloadRecorder() // Installer bien AVANT les clics suivants, pas juste avant exporter.
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
  let exportedAtelier
  await test("Export M03 vers Atelier principal",async()=>{
    await click("[data-action=export-atelier]")
    console.log("Export Atelier - statut:",await runJS("document.querySelector('[data-status]')?.textContent"),"blobs:",await runJS("window.__alrickExports?.length"),"exceptions:",runtimeErrors.slice(-3))
    exportedAtelier=await downloaded("alrick-creature-pour-atelier")
    const data=JSON.parse(await readFile(exportedAtelier,"utf8"))
    assert.equal(data.schema,"alrick.sheets.v3")
    assert.equal(data.sheets[0].ruleset,"m03-bestiary")
  })
  if(!exportedAtelier){
    const fallback=await pureBestiaryFixture()
    exportedAtelier=path.join(tmp,"fixture-m03-bestiary.json")
    await writeFile(exportedAtelier,JSON.stringify(fallback,null,2))
    console.warn("ATTENTION : export UI non validé ; fixture du moteur PUR injectée pour tester les étapes suivantes.")
  }
  await test("Interface mobile et navigation Quartz",async()=>{
    await cdp("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true})
    await sleep(350)
    const m=await browserFn(()=>{const a=document.querySelector("#bestiary-workshop");return {
      width:a.getBoundingClientRect().width,viewport:innerWidth,overflow:a.scrollWidth-a.clientWidth}})
    assert.ok(m.width<=m.viewport+3,"débordement de page mobile")
    assert.ok(m.overflow<=5,"débordement horizontal des contrôles")
    await screenshot("bestiary-mobile.png")
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
    await awaitPageLoad(()=>cdp("Page.reload"),"rechargement de la page")
    await waitFor('document.querySelector("#atelier-5d6 [data-active]")?.options.length>3',"rechargement après attaque")
    const again=await browserFn(()=>JSON.parse(localStorage.getItem("archives-alrick-atelier-5d6-v2")))
    assert.ok(again.sheets.find(x=>x.ruleset==="m03-bestiary").pv<194)
    assert.equal(again.sheets.find(x=>x.name==="Témoin historique").legacyOriginal.uniqueHistorique,"à préserver")
    await screenshot("atelier-combat-m03.png")
  })
  await test("M05 : prédateur N5 et statistiques réellement calculées",async()=>{
    await navigate(base+"/jouer/atelier-bestiary-5d6")
    await waitFor('document.querySelector("#bestiary-workshop")?.dataset.initialized==="true"',"retour bestiaire M05")
    await click('[data-action="new"]')
    await set("[data-archetype]","predateur","change")
    const sample=await browserFn(()=>{
      const host=document.querySelector("#bestiary-workshop")
      return {level:Number(host.querySelector("[data-level]").value),
        archetype:host.querySelector("[data-archetype]").value,
        stats:[...host.querySelectorAll(".m05-stat-raw")].map(e=>Number(e.textContent)),
        hp:Number(host.querySelector("[data-number=pvMax]").value)}
    })
    assert.equal(sample.level,5)
    assert.equal(sample.archetype,"predateur")
    assert.deepEqual(sample.stats,[6,8,3,4])
    assert.equal(sample.hp,32)
    await screenshot("m05-predateur-n5.png")
  })
  await test("M05 : PNJ de soutien non combattant, identite et sauvegarde",async()=>{
    await set('[data-choice="kind"]',"pnj","change")
    await set('[data-choice="role"]',"soutien","change")
    await set('[data-text="name"]',"Bibliothécaire de test","input")
    await set('[data-text="profession"]',"Scribe","input")
    const view=await browserFn(()=>{
      const host=document.querySelector("#bestiary-workshop")
      const saved=JSON.parse(localStorage.getItem("archives-alrick-bestiary-v1"))
      const id=host.querySelector("[data-active]").value
      return {title:host.querySelector(".m05-identity h3")?.textContent,
        type:host.querySelector(".m05-eyebrow")?.textContent,
        role:host.querySelector(".m05-quick")?.textContent,
        saved:saved.find(x=>x.id===id)}
    })
    assert.equal(view.title,"Bibliothécaire de test")
    assert.ok(view.type.includes("Personnage non joueur"))
    assert.ok(view.role.includes("soutien"))
    assert.equal(view.saved.kind,"pnj")
    assert.equal(view.saved.role,"soutien")
    assert.equal(view.saved.profession,"Scribe")
    await screenshot("m05-pnj-soutien.png")
  })
  await test("M05 : image locale autorisée, notes MJ cachées et source non canonique",async()=>{
    const before=await browserFn(()=>{
      const host=document.querySelector("#bestiary-workshop")
      const id=host.querySelector("[data-active]").value
      const cards=JSON.parse(localStorage.getItem("archives-alrick-bestiary-v1"))
      const c=cards.find(x=>x.id===id)
      c.artwork={status:"publication_approuvee",rights:"permission",
        url:"/archives-alrick/static/m05-portrait-autorise.png",
        alt:"Portrait fictif d'essai",author:"Auteur fictif de test"}
      c.documentaryLink={id:"DRG-01",type:"individu",
        source:"Code non vérifié en B-001",publish:false,spoilers:true,unlisted:true}
      c.notes="SECRET-MJ-M05-NE-PAS-IMPRIMER"
      localStorage.setItem("archives-alrick-bestiary-v1",JSON.stringify(cards))
      return c.id
    })
    await awaitPageLoad(()=>cdp("Page.reload"),"rechargement de la fiche M05 enrichie")
    await waitFor('document.querySelector("#bestiary-workshop")?.dataset.initialized==="true"',"M05 chargé après relecture")
    const state=await browserFn(()=>{
      const host=document.querySelector("#bestiary-workshop")
      return {current:host.querySelector("[data-active]").value,
        portrait:host.querySelector(".m05-portrait img")?.getAttribute("alt"),
        doc:host.querySelector('[data-m05-panel="sources"]')?.textContent,
        safe:!host.querySelector("[data-m05-content]").textContent.includes("SECRET-MJ-M05-NE-PAS-IMPRIMER"),
        links:host.querySelectorAll("[data-m05-content] a").length}
    })
    assert.equal(state.current,before)
    assert.equal(state.portrait,"Portrait fictif d'essai")
    assert.ok(state.doc.includes("DRG-01"))
    assert.equal(state.safe,true)
    assert.equal(state.links,0)
    // Test de l'affichage conditionnel sur déclaration JSON ; ne prouve PAS la
    // licence de l'illustration ni l'existence matérielle du fichier image.
    await screenshot("m05-metadata-portrait-source.png")
  })
  await test("MAG-003.C : interface de récupération intégrée, double clic et historique",async()=>{
    await navigate(base+"/jouer/atelier-5d6")
    await waitFor('document.querySelector("#atelier-5d6 [data-hub=rites]")!==null',"Panneau des rites")
    const id=await browserFn(()=>{
      const raw=JSON.parse(localStorage.getItem("archives-alrick-atelier-5d6-v2"))
      return raw.sheets.find(s=>s.name==="PJ recette")?.id
    })
    assert.ok(id,"PJ moderne absent")
    await set("#atelier-5d6 [data-active]",id,"change")
    await click('#atelier-5d6 [data-mode="mj"]')
    await set('#atelier-5d6 [data-field="manaMax"]',35,"change")
    await set('#atelier-5d6 [data-field="mana"]',10,"change")
    await click('[data-hub-nav="rites"]')
    await set('[data-rites-day]',"J-C3")
    await set('[data-rites-rest-id]',"camp-C3")
    await browserFn(()=>{
      document.querySelector('[data-rites-safe]').checked=true
      document.querySelector('[data-rites-complete]').checked=true
    })
    await click('[data-rites-action="preview"]')
    const message=await runJS("document.querySelector('[data-rites-preview]')?.textContent")
    assert.ok(message.includes("+7 mana"),"Prévisualisation 20 % absente : "+message)
    const before=dialogs
    await click('[data-rites-action="recover"]')
    await waitFor("JSON.parse(localStorage.getItem('archives-alrick-atelier-5d6-v2')).sheets.find(s=>s.name==='PJ recette')?.mana===17","Crédit 7 mana")
    assert.ok(dialogs>before,"confirmation native absente")
    await click('[data-rites-action="recover"]')
    const saved=await browserFn(()=>{
      const all=JSON.parse(localStorage.getItem("archives-alrick-atelier-5d6-v2"))
      return all.sheets.find(s=>s.name==="PJ recette")
    })
    assert.equal(saved.mana,17,"double crédit du repos")
    assert.equal(saved.ritualWorkshop.recovery.journal.length,1,"deux entrées pour le même repos")
    assert.equal(saved.grimoire.schema,"alrick.grimoire.v1","Grimoire effacé")
    await screenshot("mag003c-recuperation-desktop.png")
    await cdp("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true})
    await sleep(300)
    const mobile=await browserFn(()=>{
      const r=document.querySelector('[data-rites-root]')
      return {width:r.getBoundingClientRect().width,viewport:innerWidth,overflow:r.scrollWidth-r.clientWidth}
    })
    assert.ok(mobile.width<=mobile.viewport+3,"Panneau déborde du téléphone")
    assert.ok(mobile.overflow<=6,"Champs des rites débordent horizontalement")
    await screenshot("mag003c-recuperation-mobile.png")
    await cdp("Emulation.clearDeviceMetricsOverride")
    await awaitPageLoad(()=>cdp("Page.reload"),"rechargement MAG-003.C")
    await waitFor("document.querySelector('[data-rites-mana]')?.textContent?.includes('récupéré 7')","historique de repos restauré")
  })
  await test("MAG-003.C : cérémonie MJ simulée sans effet ni débit collectif",async()=>{
    await click('[data-hub-nav="rites"]')
    await browserFn(()=>{document.querySelector('[data-rites-safe]').checked=true})
    await click('[data-rites-action="prepare"]')
    await click('[data-rites-action="resolve"]')
    const saved=await browserFn(()=>{
      const st=JSON.parse(localStorage.getItem("archives-alrick-atelier-5d6-v2"))
      return st.sheets.find(s=>s.name==="PJ recette")
    })
    assert.equal(saved.ritualWorkshop.rituals.length,1)
    assert.equal(saved.ritualWorkshop.rituals[0].status,"resolu")
    assert.equal(saved.ritualWorkshop.rituals[0].result.energyDebits.length,0)
    assert.equal(saved.mana,17,"cérémonie a modifié le mana")
    await screenshot("mag003c-ceremonie-locale.png")
  })
  await test("MAG-003.D : PJ réalise un rite personnel connu sans jet ni MJ",async()=>{
    await navigate(base+"/jouer/atelier-5d6")
    await waitFor('document.querySelector("#atelier-5d6 [data-hub=rites]")!==null',"Panneau des rites D")
    const id=await browserFn(()=>{
      const state=JSON.parse(localStorage.getItem("archives-alrick-atelier-5d6-v2"))
      return state.sheets.find(s=>s.name==="PJ recette")?.id
    })
    assert.ok(id)
    await set("#atelier-5d6 [data-active]",id,"change")
    await click('#atelier-5d6 [data-mode="mj"]')
    await set('[data-rites-definition]',"demo-recueillement","change")
    await click('[data-rites-action="learn"]')
    await click('#atelier-5d6 [data-mode="pj"]')
    await browserFn(()=>{
      document.querySelector('[data-rites-safe]').checked=true
      document.querySelector('[data-rites-natural]').value="0"
    })
    await click('[data-rites-action="prepare"]')
    const act=await browserFn(()=>{
      const b=document.querySelector('[data-rites-action="resolve"]')
      return {disabled:b.disabled,label:b.textContent}
    })
    assert.equal(act.disabled,false,"PJ connu bloqué")
    assert.ok(act.label.includes("mon rite ordinaire"),act.label)
    const before=dialogs
    await click('[data-rites-action="resolve"]')
    const saved=await browserFn(()=>{
      const data=JSON.parse(localStorage.getItem("archives-alrick-atelier-5d6-v2"))
      return data.sheets.find(s=>s.name==="PJ recette")
    })
    const last=saved.ritualWorkshop.rituals.at(-1)
    assert.equal(last.definition.id,"demo-recueillement")
    assert.equal(last.status,"resolu")
    assert.equal(last.result.automatic,true,"Le rite ordinaire ne lance pas 5d6")
    assert.equal(last.result.energyDebits.length,0,"Aucune dépense collective")
    assert.equal(dialogs,before,"Une approbation MJ locale superflue a été demandée")
    const mana=saved.mana
    await cdp("Page.reload")
    await waitFor("document.querySelector('[data-rites-mana]')!==null","Historique de rite PJ restauré")
    const reloaded=await browserFn(()=>{
      const data=JSON.parse(localStorage.getItem("archives-alrick-atelier-5d6-v2"))
      return data.sheets.find(s=>s.name==="PJ recette")
    })
    assert.equal(reloaded.mana,mana,"Rechargement a changé le mana")
    assert.equal(reloaded.ritualWorkshop.rituals.at(-1).status,"resolu")
    await screenshot("mag003d-rite-pj-ordinaire.png")
  })
  await test("MAG-003.D : PJ ne lance pas une cérémonie incertaine",async()=>{
    await click('[data-hub-nav="rites"]')
    await browserFn(()=>{document.querySelector('[data-rites-safe]').checked=true})
    await set('[data-rites-definition]',"demo-ceremonie","change")
    await click('[data-rites-action="prepare"]')
    const result=await runJS("document.querySelector('[data-rites-status]')?.textContent")
    assert.ok(result.includes("réservée")||result.includes("ordinaire"),"Refus attendu : "+result)
    const old=await browserFn(()=>{
      const st=JSON.parse(localStorage.getItem("archives-alrick-atelier-5d6-v2"))
      return st.sheets.find(s=>s.name==="PJ recette").ritualWorkshop.rituals.at(-1).status
    })
    assert.equal(old,"resolu","Aucun rite dangereux ne doit être préparé par PJ")
  })

  console.log("MAG-003.C : vérifications Chrome de la récupération et de la cérémonie locale.")

  console.log("M04.1 + M05 CHROME : "+checks+" scénarios complets, "+dialogs+" dialogues de confirmation.")
  if(failures.length){console.error("M04.1 : "+failures.length+" scénario(s) non validés :",failures);throw Error("Recette M04.1 incomplète : "+failures.join("; "))}
}finally{
  try{ws?.close()}catch{}
  try{chrome?.kill("SIGKILL")}catch{}
  if(server)await new Promise(resolve=>server.close(resolve))
  await sleep(450)
  try{await rm(tmp,{recursive:true,force:true,maxRetries:5,retryDelay:400})}catch(e){console.warn("Nettoyage du profil Chrome incomplet :",String(e))}
}
