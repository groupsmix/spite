#!/usr/bin/env node
// Verify that every relative href / src in our HTML resolves to a real file.
// Catches broken references (typos, deleted files) without needing a real
// link-checker dep.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const HTML = ['index.html', 'privacy.html', 'terms.html', '404.html'];
const ATTR_RE = /\s(?:href|src)\s*=\s*"([^"#?]+)(?:[#?][^"]*)?"/gi;

let broken = 0;

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

for (const file of HTML) {
  const html = await fs.readFile(path.join(ROOT, file), 'utf8');
  let m;
  while ((m = ATTR_RE.exec(html))) {
    const href = m[1];
    if (!href) continue;
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(href)) continue;

    let target;
    if (href.startsWith('/')) target = path.join(ROOT, href);
    else target = path.resolve(path.dirname(path.join(ROOT, file)), href);

    // dir → index.html
    try {
      const stat = await fs.stat(target);
      if (stat.isDirectory()) target = path.join(target, 'index.html');
    } catch { /* file doesn't exist yet, fall through */ }

    if (!(await exists(target))) {
      console.error(`  [broken] ${file} → "${href}"`);
      broken++;
    }
  }
}

if (broken > 0) {
  console.error(`\n${broken} broken link(s).`);
  process.exit(1);
}
console.log('all relative links resolve.');
