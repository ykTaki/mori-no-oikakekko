const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const allowed=new Set(['index.html','style.css','engine.js','game.js']);
http.createServer((req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!allowed.has(file)){res.writeHead(404);res.end('Not found');return;}
  const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
  res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store'});fs.createReadStream(path.join(root,file)).pipe(res);
}).listen(4173,'127.0.0.1',()=>console.log('Game: http://127.0.0.1:4173'));
