// Painel de revisão local. Uso: node painel.mjs <projeto> [--porta 8080]
// Abre http://localhost:8080 : a edição toca ao vivo (sem render), com notas presas ao quadro exato,
// salvas em <projeto>/projeto/revisao/notas.json. Mudou o roteiro, a base, o rosto ou o código: a prévia se atualiza.
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {caminhos, montaEntrada, preparaPublico, vigiados} from './entrada.mjs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const raiz = path.resolve(args[0] ?? '');
const porta = Number(args[args.indexOf('--porta') + 1]) || 8080;
const {notas} = caminhos(raiz);
montaEntrada(raiz); // falha cedo e com mensagem clara se faltar a base ou o roteiro
let pub = preparaPublico(raiz);
let baseMtime = fs.statSync(path.join(raiz, 'projeto', 'base.mp4')).mtimeMs;

// código do painel: compilado em memória e recompilado quando src/ ou painel/ mudam
const saida = path.join(aqui, 'painel', '.build');
let codigo = '0';
const ctx = await esbuild.context({
  entryPoints: [path.join(aqui, 'painel', 'app.tsx')],
  bundle: true, outdir: saida, entryNames: 'app', format: 'iife', jsx: 'automatic', minify: false, sourcemap: false,
  loader: {'.woff2': 'file', '.woff': 'file'}, assetNames: 'fontes/[name]', publicPath: '/',
  define: {'process.env.NODE_ENV': '"development"'}, logLevel: 'warning',
  plugins: [{name: 'versao', setup(b) { b.onEnd((r) => { if (!r.errors.length) codigo = Date.now().toString(36); }); }}],
});
await ctx.watch();

const tipos = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.mp4': 'video/mp4', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp3': 'audio/mpeg', '.wav': 'audio/wav'};

const envia = (res, arquivo, req) => {
  if (!fs.existsSync(arquivo) || !fs.statSync(arquivo).isFile()) { res.writeHead(404); return res.end('não achei'); }
  const tam = fs.statSync(arquivo).size;
  const tipo = tipos[path.extname(arquivo).toLowerCase()] ?? 'application/octet-stream';
  const r = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
  if (r) { // vídeo precisa de Range para avançar e voltar
    const a = r[1] ? Number(r[1]) : 0;
    const b = r[2] ? Number(r[2]) : tam - 1;
    res.writeHead(206, {'Content-Type': tipo, 'Content-Range': `bytes ${a}-${b}/${tam}`, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1});
    return fs.createReadStream(arquivo, {start: a, end: b}).pipe(res);
  }
  res.writeHead(200, {'Content-Type': tipo, 'Content-Length': tam, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store'});
  fs.createReadStream(arquivo).pipe(res);
};

const corpo = (req) => new Promise((ok) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => ok(d)); });
const assinatura = () => vigiados(raiz).map((p) => (fs.existsSync(p) ? fs.statSync(p).mtimeMs : 0)).join(',');

http.createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try {
    if (url === '/') return envia(res, path.join(aqui, 'painel', 'index.html'), req);
    if (url === '/app.js' || url === '/app.css' || url.startsWith('/fontes/')) return envia(res, path.join(saida, url), req);
    if (url === '/versao') {
      res.writeHead(200, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({dados: assinatura(), codigo}));
    }
    if (url === '/entrada.json') {
      const m = fs.statSync(path.join(raiz, 'projeto', 'base.mp4')).mtimeMs;
      if (m !== baseMtime) { pub = preparaPublico(raiz); baseMtime = m; } // base remontada: religa o arquivo novo
      res.writeHead(200, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
      const e = montaEntrada(raiz);
      e.base.arquivo = `v${Math.round(m)}/base.mp4`; // muda o endereço quando a base muda: o navegador não usa a antiga
      return res.end(JSON.stringify(e));
    }
    if (url === '/notas') {
      if (req.method === 'POST') {
        const lista = JSON.parse(await corpo(req));
        fs.mkdirSync(path.dirname(notas), {recursive: true});
        fs.writeFileSync(notas, JSON.stringify(lista, null, 1));
        res.writeHead(200); return res.end('ok');
      }
      res.writeHead(200, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
      return res.end(fs.existsSync(notas) ? fs.readFileSync(notas) : '[]');
    }
    if (url.startsWith('/arquivos/')) return envia(res, path.join(pub, url.slice('/arquivos/'.length).replace(/^v\d+\//, '')), req);
    res.writeHead(404); res.end('não achei');
  } catch (e) {
    res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'}); res.end(String(e.message ?? e));
  }
}).listen(porta, () => console.log(`painel de revisão: http://localhost:${porta}  (projeto ${raiz})  Ctrl+C para fechar`));
