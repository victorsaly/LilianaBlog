#!/usr/bin/env node
/* -------------------------------------------------------------------------
   generate-storyteller.mjs — a CLEAN single figure of Lili to be the reader's
   storyteller (she animates with a gentle talk-bob while reading). Uses the
   existing character art as a likeness reference, but with no background and no
   power effects, so it sits nicely in the corner.

     npm run storyteller        # needs GEMINI_API_KEY in .env
   Then cut out the background:
     npm run remove-bg public/art/illustrations/lili-storyteller.png
   ------------------------------------------------------------------------- */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { SCENE_STYLE } from '../art-style.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'art', 'illustrations');
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

async function callGemini(prompt, imagePaths = []) {
  const parts = [{ text: prompt }];
  for (const p of imagePaths.filter(Boolean)) {
    parts.push({ inline_data: { mime_type: 'image/png', data: fs.readFileSync(p).toString('base64') } });
  }
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  const res = await fetch(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ['IMAGE'] } }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${json?.error?.message || JSON.stringify(json).slice(0, 200)}`);
  const out = json?.candidates?.[0]?.content?.parts || [];
  const img = out.find((p) => p.inlineData?.data || p.inline_data?.data);
  if (!img) throw new Error(`No image. Model said: ${out.map((p) => p.text).filter(Boolean).join(' ').slice(0, 200)}`);
  return Buffer.from(img.inlineData?.data || img.inline_data.data, 'base64');
}

async function main() {
  if (!KEY) { console.error('Missing GEMINI_API_KEY in .env'); process.exit(1); }
  const ref = path.join(OUT, 'lily.png');
  const outPath = path.join(OUT, 'lili-face.png');
  const prompt =
    `Use the attached reference for the character "Lili" — a cheerful 9-year-old girl with long blonde hair `
    + `and big friendly eyes. Draw a CLEAN close-up portrait of JUST Lili's head and shoulders, facing the viewer, `
    + `warm gentle smile with her LIPS SOFTLY TOGETHER (mouth closed, neutral), looking straight ahead. `
    + `Her face centred with a little margin all around. `
    + `IMPORTANT: no background scene, NO magical effects, no icons — just Lili's head and shoulders on a plain `
    + `flat off-white background (easy to cut out). `
    + SCENE_STYLE;
  process.stdout.write('🧒 Lili face close-up … ');
  const png = await callGemini(prompt, [ref]);
  fs.writeFileSync(outPath, png);
  console.log(`✅ ${(png.length / 1024).toFixed(0)} KB → public/art/illustrations/lili-face.png`);
  console.log('Now: npm run remove-bg public/art/illustrations/lili-face.png');
}
main().catch((e) => { console.error(e); process.exit(1); });
