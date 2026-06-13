#!/usr/bin/env node
/* -------------------------------------------------------------------------
   gen-asset.mjs — generate a single on-brand asset with Gemini.

     node scripts/gen-asset.mjs --out lili-hero --ref lily.png \
        --prompt "a cheerful girl welcoming you into a story"

   Options:
     --out <name>     output file name (no extension)         [required]
     --prompt "<...>" the description                          [required]
     --ref <file>     a reference image in public/art/illustrations [optional]
     --dir <folder>   subfolder of public/art (default: illustrations)
     --style          append the shared SCENE_STYLE (on by default; --no-style off)
   Then (for transparent cut-outs):
     npm run remove-bg public/art/illustrations/<name>.png
   ------------------------------------------------------------------------- */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { SCENE_STYLE } from '../art-style.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

(function loadEnv() {
  const f = path.join(ROOT, '.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
})();
const KEY = process.env.GEMINI_API_KEY;

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const out = flag('--out');
let prompt = flag('--prompt');
const ref = flag('--ref');
const dir = flag('--dir') || 'illustrations';
const useStyle = !args.includes('--no-style');
if (!out || !prompt) { console.error('need --out and --prompt'); process.exit(1); }
if (useStyle) prompt += '\n\n' + SCENE_STYLE;

async function callGemini(p, imagePaths = []) {
  const parts = [{ text: p }];
  for (const ip of imagePaths.filter(Boolean)) parts.push({ inline_data: { mime_type: 'image/png', data: fs.readFileSync(ip).toString('base64') } });
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ['IMAGE'] } }) });
  const json = await res.json();
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${json?.error?.message || JSON.stringify(json).slice(0, 200)}`);
  const img = (json?.candidates?.[0]?.content?.parts || []).find((q) => q.inlineData?.data || q.inline_data?.data);
  if (!img) throw new Error('No image returned');
  return Buffer.from(img.inlineData?.data || img.inline_data.data, 'base64');
}

const outDir = path.join(ROOT, 'public', 'art', dir);
fs.mkdirSync(outDir, { recursive: true });
const refPath = ref ? path.join(ROOT, 'public', 'art', 'illustrations', ref) : null;
process.stdout.write(`🎨 ${dir}/${out} … `);
const png = await callGemini(prompt, refPath ? [refPath] : []);
fs.writeFileSync(path.join(outDir, `${out}.png`), png);
console.log(`✅ ${(png.length / 1024).toFixed(0)} KB → public/art/${dir}/${out}.png`);
