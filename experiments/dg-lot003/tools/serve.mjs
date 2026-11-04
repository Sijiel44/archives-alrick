import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=resolve(dirname(fileURLToPath(import.meta.url)),'..','dist');
await stat(resolve(dir,'index.html'));
const styleHash=JSON.parse(await readFile(resolve(dir,'style-csp.json'),'utf8')).hash;
if(styleHash!==null&&!/^sha256-[A-Za-z0-9+/=]+$/.test(styleHash))throw Error('CSP hash invalid');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
function serve(port,onlyPlayer){
 return new Promise((done,reject)=>{
 const server=createServer(async(req,res)=>{
   try{
     const url=new URL(req.url,'http://127.0.0.1:'+port);
     let pathname=decodeURIComponent(url.pathname);
     if(pathname==='/' )pathname=onlyPlayer?'/player.html':'/index.html';
     if(onlyPlayer && !['/player.html','/assets/player.js','/assets/app.css'].includes(pathname)) {res.writeHead(404);res.end('Not found');return;}
     if(!onlyPlayer && pathname==='/player.html'){res.writeHead(404);res.end('Not found');return;}
     const file=resolve(dir,'.'+pathname);
     if(!file.startsWith(dir+sep)){res.writeHead(403);res.end();return;}
     const data=await readFile(file);
     res.writeHead(200,{'content-type':types[extname(file)]??'application/octet-stream','cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; script-src 'self'; style-src 'self' ${styleHash ? "'"+styleHash+"'" : ""}; connect-src 'none'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",'referrer-policy':'no-referrer'});
     res.end(data);
   }catch{res.writeHead(404);res.end('Not found');}
 });
 server.on('error',reject);server.listen(port,'127.0.0.1',()=>done(server));
 });
}
const servers=await Promise.all([serve(4173,false),serve(4174,true)]);
console.log('MJ http://127.0.0.1:4173/');console.log('Joueur http://127.0.0.1:4174/');
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{for(const s of servers)s.close();process.exit(0)});
