#!/usr/bin/env node
/* -------------------------------------------------------------------------
   illustrate.mjs — turn Lily's sketches into finished illustrations that match
   the blog, using Google's Gemini image model ("Nano Banana").

   Get a FREE key at https://aistudio.google.com/apikey, then put it in .env:
     GEMINI_API_KEY=...

   Usage:
     npm run illustrate -- lily              # one character
     npm run illustrate -- lily leo mum dad  # several
     npm run illustrate -- all               # every known character
     npm run illustrate -- --prompt-only lily        # just print the prompt (no key needed)
     npm run illustrate -- --id dragon --sketch path/to/drawing.jpg --desc "a friendly green dragon"

   Output: public/art/illustrations/<id>.png  (the website shows it automatically)
   ------------------------------------------------------------------------- */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { CHARACTERS, buildPrompt } from '../art-style.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'art', 'illustrations');
const CHAR_DIR = path.join(ROOT, 'public', 'art', 'characters');
const ORIG_DIR = path.join(ROOT, '_originals');

// ---- tiny .env loader ----
(function loadEnv() {
  const f = path.join(ROOT, '.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
})();

const KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

// ---- parse args ----
const argv = process.argv.slice(2);
const flags = {};
const ids = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--prompt-only') flags.promptOnly = true;
  else if (a === '--id') flags.id = argv[++i];
  else if (a === '--sketch') flags.sketch = argv[++i];
  else if (a === '--desc') flags.desc = argv[++i];
  else ids.push(a);
}

function mimeFor(p) {
  const e = p.toLowerCase();
  if (e.endsWith('.png')) return 'image/png';
  if (e.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}
function findSketch(id, fallbackName) {
  // prefer the full-res original, then the web copy
  const tries = [
    path.join(ORIG_DIR, `${id}-sketch.original.jpeg`),
    fallbackName && path.join(CHAR_DIR, fallbackName),
  ].filter(Boolean);
  return tries.find((p) => fs.existsSync(p)) || null;
}

async function callGemini(prompt, sketchPath) {
  const parts = [{ text: prompt }];
  if (sketchPath) {
    const data = fs.readFileSync(sketchPath).toString('base64');
    parts.push({ inline_data: { mime_type: mimeFor(sketchPath), data } });
  }
  const body = {
    contents: [{ parts }],
    generationConfig: { responseModalities: ['IMAGE'] },
  };
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${json?.error?.message || JSON.stringify(json).slice(0, 300)}`);
  }
  const cand = json?.candidates?.[0];
  const out = cand?.content?.parts || [];
  const imgPart = out.find((p) => p.inlineData?.data || p.inline_data?.data);
  if (!imgPart) {
    const text = out.map((p) => p.text).filter(Boolean).join(' ').slice(0, 300);
    throw new Error(`No image returned. Model said: ${text || '(nothing)'} — try a different GEMINI_IMAGE_MODEL.`);
  }
  return Buffer.from(imgPart.inlineData?.data || imgPart.inline_data.data, 'base64');
}

async function makeOne(id, body, sketchName) {
  const prompt = buildPrompt(body);
  const customSketch = flags.sketch && fs.existsSync(flags.sketch) ? flags.sketch : null;
  if (flags.promptOnly || !KEY) {
    if (!KEY && !flags.promptOnly) console.log(`\n(no GEMINI_API_KEY found — printing the prompt instead)`);
    const sketch = findSketch(id, sketchName) || customSketch;
    console.log(`\n=== ${id} ===`);
    if (sketch) console.log(`Attach this sketch: ${path.relative(ROOT, sketch)}`);
    console.log(prompt);
    console.log(`Save the result as: public/art/illustrations/${id}.png`);
    return;
  }
  const sketch = findSketch(id, sketchName) || customSketch;
  process.stdout.write(`🎨 ${id} … `);
  try {
    const png = await callGemini(prompt, sketch);
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const outPath = path.join(OUT_DIR, `${id}.png`);
    fs.writeFileSync(outPath, png);
    console.log(`✅ ${(png.length / 1024).toFixed(0)} KB → public/art/illustrations/${id}.png`);
  } catch (err) {
    console.log(`❌ ${err.message}`);
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // custom one-off sketch (used by the skill for brand-new characters)
  if (flags.id) {
    const body = flags.desc || `A character drawn by Lily.`;
    await makeOne(flags.id, body, null);
    return;
  }

  let targets = ids;
  if (targets.includes('all') || targets.length === 0) targets = Object.keys(CHARACTERS);

  if (!KEY && !flags.promptOnly) {
    console.log('No GEMINI_API_KEY set — showing the prompts so you can paste them into Gemini.');
    console.log('(Add a free key from https://aistudio.google.com/apikey to generate automatically.)');
  }

  for (const id of targets) {
    const c = CHARACTERS[id];
    if (!c) { console.log(`⚠️  unknown character "${id}" (known: ${Object.keys(CHARACTERS).join(', ')})`); continue; }
    await makeOne(id, c.body, c.sketch);
  }

  if (KEY && !flags.promptOnly) console.log('\n🎉 Done. Run `npm run dev` to see them on the Characters page.');
}

main().catch((e) => { console.error(e); process.exit(1); });
