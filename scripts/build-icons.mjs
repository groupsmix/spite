#!/usr/bin/env node
// Generate the PWA icons + OG image without any image-library deps.
// Writes minimal hand-crafted PNGs (a flat black square with a red bar
// glyph) to disk. Run once; commit the output. Re-run only if you want
// to refresh the brand artwork.
//
// Output:
//   icons/icon-192.png
//   icons/icon-512.png
//   icons/icon-maskable-512.png
//   og.png  (1200×630 social card)
//
// The PNG encoder here is intentionally minimal — it writes uncompressed
// IDAT data wrapped in zlib's stored ("type 0") blocks, which every PNG
// decoder handles. No native deps; runs on any Node 18+.

import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Brand palette (matches styles.css)
const BG = [10, 10, 10, 255];
const FG = [244, 241, 234, 255];
const ACCENT = [255, 59, 59, 255];

function makeIcon(size, { maskable = false } = {}) {
  // RGBA buffer
  const buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      buf[i] = BG[0]; buf[i+1] = BG[1]; buf[i+2] = BG[2]; buf[i+3] = BG[3];
    }
  }

  // Inner safe area (maskable icons crop ~10% off each side)
  const pad = maskable ? Math.round(size * 0.18) : Math.round(size * 0.12);
  const inner = size - pad * 2;

  // Big red bar glyph (▮) — vertical rectangle, slightly off-center
  const barW = Math.round(inner * 0.18);
  const barH = Math.round(inner * 0.78);
  const barX = pad + Math.round(inner * 0.12);
  const barY = pad + Math.round((inner - barH) / 2);
  fillRect(buf, size, barX, barY, barW, barH, ACCENT);

  // "S" mark to the right (a stylised stack of 3 horizontal bars)
  const sX = pad + Math.round(inner * 0.42);
  const sW = Math.round(inner * 0.46);
  const sH = Math.round(inner * 0.10);
  const sGap = Math.round(inner * 0.10);
  const sTop = pad + Math.round((inner - (sH * 3 + sGap * 2)) / 2);
  fillRect(buf, size, sX, sTop, sW, sH, FG);
  fillRect(buf, size, sX, sTop + sH + sGap, sW - Math.round(sW * 0.18), sH, FG);
  fillRect(buf, size, sX + Math.round(sW * 0.18), sTop + (sH + sGap) * 2, sW - Math.round(sW * 0.18), sH, FG);

  return encodePng(buf, size, size);
}

function makeOg(w = 1200, h = 630) {
  const buf = Buffer.alloc(w * h * 4);
  // gradient-ish bg: simple two-tone vertical
  for (let y = 0; y < h; y++) {
    const t = y / h;
    const r = Math.round(10 + (22 - 10) * t);
    const g = Math.round(10 + (22 - 10) * t);
    const b = Math.round(10 + (22 - 10) * t);
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      buf[i] = r; buf[i+1] = g; buf[i+2] = b; buf[i+3] = 255;
    }
  }
  // top accent bar
  fillRect(buf, w, 0, 0, w, 14, ACCENT);
  // brand bar
  fillRect(buf, w, 80, 80, 18, 70, ACCENT);
  // S stack to the right of the bar
  fillRect(buf, w, 116, 80, 220, 14, FG);
  fillRect(buf, w, 116, 108, 180, 14, FG);
  fillRect(buf, w, 152, 136, 180, 14, FG);

  // big "DAYS SINCE THEY WRONGED YOU." block — render as filled rectangles that
  // look typographic without needing a font: three stacked rows, accent + ink.
  const lineY = 250;
  fillRect(buf, w, 80, lineY,        980, 90, FG);          // "DAYS SINCE"
  fillRect(buf, w, 80, lineY + 110,  720, 90, FG);          // "THEY WRONGED"
  fillRect(buf, w, 80, lineY + 220, 1020, 90, ACCENT);      // "YOU."

  // bottom strip
  fillRect(buf, w, 80, h - 80, 1040, 4, [44, 44, 44, 255]);
  // "$9 ONCE · NO SUBSCRIPTION" pill
  fillRect(buf, w, 80, h - 60, 360, 36, [22, 22, 22, 255]);

  return encodePng(buf, w, h);
}

function fillRect(buf, stride, x, y, w, h, [r, g, b, a]) {
  const W = stride;
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      const i = (yy * W + xx) * 4;
      buf[i] = r; buf[i+1] = g; buf[i+2] = b; buf[i+3] = a;
    }
  }
}

// PNG encoder (color type 6 = RGBA, 8-bit)
function encodePng(rgba, width, height) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;       // bit depth
  ihdr[9] = 6;       // color type RGBA
  ihdr[10] = 0;      // compression
  ihdr[11] = 0;      // filter
  ihdr[12] = 0;      // interlace

  // Filter byte 0 per scanline + RGBA data
  const rowLen = width * 4 + 1;
  const filtered = Buffer.alloc(rowLen * height);
  for (let y = 0; y < height; y++) {
    filtered[y * rowLen] = 0;
    rgba.copy(filtered, y * rowLen + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idatData = zlib.deflateSync(filtered, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

await fs.mkdir(path.join(ROOT, 'icons'), { recursive: true });
await fs.writeFile(path.join(ROOT, 'icons/icon-192.png'), makeIcon(192));
await fs.writeFile(path.join(ROOT, 'icons/icon-512.png'), makeIcon(512));
await fs.writeFile(path.join(ROOT, 'icons/icon-maskable-512.png'), makeIcon(512, { maskable: true }));
await fs.writeFile(path.join(ROOT, 'og.png'), makeOg());

console.log('wrote icons/icon-192.png, icons/icon-512.png, icons/icon-maskable-512.png, og.png');
