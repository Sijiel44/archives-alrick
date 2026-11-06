/** Single-purpose, local-only static server; no network API and no Pages. */
import {createServer} from 'node:http';import {readFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';import {dirname,resolve,extname,sep} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),port=4181;
const accept=new Set(['/','/index.html','/src/styles.css','/src/app.mjs','/src/contracts.mjs','/src/fixture.mjs','/src/idb-store.mjs','/src/private-archive.mjs']);
const server=createServer(async(req,res)=>{
 try{if(req.method!=='GET'||req.headers.host!=='127.0.0.1:'+port){res.writeHead(403);res.end();return;}
  const pathname=new URL(req.url,'http://127.0.0.1:'+port).pathname;if(!accept.has(pathname)){res.writeHead(404);res.end();return;}
  const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(file);const type={'.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8'}[extname(file)]||'application/octet-stream';
  res.writeHead(200,{'content-type':type,'cache-control':'no-store','content-security-policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",'x-content-type-options':'nosniff','referrer-policy':'no-referrer'});res.end(data);
 }catch(e){res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log('P1A_HTTP_READY http://127.0.0.1:'+port+'/'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
