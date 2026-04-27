#!/usr/bin/env node
// Tiny zero-dependency static server. Used for `npm run serve`.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8080);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);

    // Pretty URLs (mirror _redirects)
    if (pathname === '/privacy') pathname = '/privacy.html';
    if (pathname === '/terms') pathname = '/terms.html';
    if (pathname.endsWith('/')) pathname += 'index.html';

    const filePath = path.normalize(path.join(ROOT, pathname));
    if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }

    let body;
    try {
      body = await fs.readFile(filePath);
    } catch {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      try { body = await fs.readFile(path.join(ROOT, '404.html')); } catch { body = '404'; }
      res.end(body);
      return;
    }
    const type = TYPES[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
    res.end(body);
  } catch (e) {
    res.writeHead(500); res.end(String(e));
  }
}).listen(PORT, () => {
  console.log(`SPITE serving at http://localhost:${PORT}`);
});
