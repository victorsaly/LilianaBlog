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
import matter from 'gray-matter';
import { CHARACTERS, buildPrompt, buildScenePrompt, SCENE_STYLE } from '../art-style.mjs';
import { parseScenes } from '../src/lib/parse.js';

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
  else if (a === '--scenes') flags.scenes = argv[++i];
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

async function callGemini(prompt, imagePaths = []) {
  const parts = [{ text: prompt }];
  for (const p of imagePaths.filter(Boolean)) {
    const data = fs.readFileSync(p).toString('base64');
    parts.push({ inline_data: { mime_type: mimeFor(p), data } });
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
    const png = await callGemini(prompt, [sketch]);
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const outPath = path.join(OUT_DIR, `${id}.png`);
    fs.writeFileSync(outPath, png);
    console.log(`✅ ${(png.length / 1024).toFixed(0)} KB → public/art/illustrations/${id}.png`);
  } catch (err) {
    console.log(`❌ ${err.message}`);
  }
}

// Which characters appear in a scene's text (so we can attach their art as refs).
const NAME_RX = {
  lily: /\blil[iy]\b/i, leo: /\bleo\b/i, mum: /\bmum\b/i, dad: /\bdad\b/i,
  pip: /\bpip\b/i, blaze: /\bblaze\b/i, potato: /\bpotato\b/i, fries: /\b(fries|fry)\b/i,
};
function refsForScene(text) {
  const refs = [];
  for (const id of Object.keys(CHARACTERS)) {
    if (NAME_RX[id]?.test(text)) {
      const p = path.join(OUT_DIR, `${id}.png`);
      if (fs.existsSync(p)) refs.push(p);
    }
  }
  return refs.slice(0, 4); // keep the reference set focused
}

function sceneExists(outDir, n) {
  return ['png', 'webp', 'jpg', 'jpeg'].some((e) => fs.existsSync(path.join(outDir, `scene-${n}.${e}`)));
}

async function generateScenes(slug) {
  const file = path.join(ROOT, 'src', 'stories', `${slug}.md`);
  if (!fs.existsSync(file)) { console.log(`⚠️  no story at src/stories/${slug}.md`); return; }
  let md = fs.readFileSync(file, 'utf8');
  const { content } = matter(md);
  const scenes = parseScenes(content);
  const outDir = path.join(ROOT, 'public', 'art', 'scenes', slug);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`🎬 ${slug} — ${scenes.length} pages`);
  for (const scene of scenes) {
    const refs = refsForScene(scene.text);

    // 1) establishing scene picture (skip if one already exists)
    if (!sceneExists(outDir, scene.n)) {
      const prompt = buildScenePrompt(scene.title, scene.draw);
      if (flags.promptOnly || !KEY) {
        console.log(`\n=== scene ${scene.n} (top): ${scene.title} ===\n${prompt}\nSave as: public/art/scenes/${slug}/scene-${scene.n}.png`);
      } else {
        process.stdout.write(`🎬 scene ${scene.n} top … `);
        try {
          const png = await callGemini(prompt, refs);
          fs.writeFileSync(path.join(outDir, `scene-${scene.n}.png`), png);
          console.log(`✅ ${(png.length / 1024).toFixed(0)} KB`);
        } catch (err) { console.log(`❌ ${err.message}`); }
      }
    }

    // 2) inline images written as ![description](auto) — generate from the
    //    description, save, and rewrite the markdown to point at the new file.
    const autos = scene.blocks.filter((b) => b.type === 'image' && b.src === 'auto');
    let k = 0;
    for (const b of autos) {
      k++;
      const prompt = `${b.alt}\n\n${SCENE_STYLE}`;
      const rel = `/art/scenes/${slug}/scene-${scene.n}-illo-${k}.png`;
      if (flags.promptOnly || !KEY) {
        console.log(`\n=== scene ${scene.n} inline ${k} ===\n${prompt}\nSave as: public${rel}`);
        continue;
      }
      process.stdout.write(`   🖼️  scene ${scene.n} inline ${k} … `);
      try {
        const png = await callGemini(prompt, refs);
        fs.writeFileSync(path.join(ROOT, 'public', rel), png);
        md = md.replace('](auto)', `](${rel})`); // first remaining auto = this one (document order)
        console.log(`✅ ${(png.length / 1024).toFixed(0)} KB → ${rel}`);
      } catch (err) { console.log(`❌ ${err.message}`); }
    }
  }

  if (!flags.promptOnly && KEY) {
    fs.writeFileSync(file, md); // persist the (auto) -> real-path rewrites
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // scene illustrations for a story
  if (flags.scenes) { await generateScenes(flags.scenes); return; }

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
