#!/usr/bin/env node
/* -------------------------------------------------------------------------
   optimize-images.mjs — shrink the art so the site is fast to load and share.

   Raw illustrations from the image model are big (1–3 MB PNGs). For the web we:
     • Scenes  (full backgrounds, no transparency): PNG → JPG, max 1200px, q82.
       The PNG is removed and any `/art/scenes/.../x.png` link in the matching
       story markdown is rewritten to `.jpg`.
     • Character cut-outs (need transparency): downscale the PNG in place to
       max 768px, keeping the same filename so nothing else has to change.

   Run it after `npm run illustrate` (and before committing):
     npm run optimize

   Needs macOS `sips` (built in). Re-running is safe — already-small images and
   already-converted scenes are skipped.
   ------------------------------------------------------------------------- */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCENES = path.join(ROOT, 'public', 'art', 'scenes');
const ILLOS = path.join(ROOT, 'public', 'art', 'illustrations');
const STORIES = path.join(ROOT, 'src', 'stories');

const SCENE_MAXDIM = 1200, SCENE_Q = 82, ILLO_MAXDIM = 768;

function sips(args) { execFileSync('sips', args, { stdio: 'ignore' }); }
function maxDimOf(p) {
  try {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', p], { encoding: 'utf8' });
    const w = parseInt((out.match(/pixelWidth:\s*(\d+)/) || [])[1] || '0', 10);
    const h = parseInt((out.match(/pixelHeight:\s*(\d+)/) || [])[1] || '0', 10);
    return Math.max(w, h);
  } catch { return 0; }
}
const kb = (p) => (fs.statSync(p).size / 1024).toFixed(0);
let saved = 0;

// 1) Scenes: PNG -> JPG (resized), then delete the PNG.
const changedSlugs = new Set();
if (fs.existsSync(SCENES)) {
  for (const slug of fs.readdirSync(SCENES)) {
    const dir = path.join(SCENES, slug);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.toLowerCase().endsWith('.png')) continue;
      const png = path.join(dir, f);
      const jpg = png.replace(/\.png$/i, '.jpg');
      const before = fs.statSync(png).size;
      sips(['-Z', String(SCENE_MAXDIM), '-s', 'format', 'jpeg', '-s', 'formatOptions', String(SCENE_Q), png, '--out', jpg]);
      fs.unlinkSync(png);
      saved += before - fs.statSync(jpg).size;
      changedSlugs.add(slug);
      console.log(`  🎬 ${slug}/${f}: ${(before / 1024 / 1024).toFixed(1)}MB → ${kb(jpg)}KB`);
    }
  }
}

// 2) Rewrite the matching story markdown so `/art/scenes/.../x.png` -> `.jpg`.
for (const slug of changedSlugs) {
  const md = path.join(STORIES, `${slug}.md`);
  if (!fs.existsSync(md)) continue;
  const s = fs.readFileSync(md, 'utf8');
  const next = s.replace(/(\/art\/scenes\/[^)\s]+)\.png/gi, '$1.jpg');
  if (next !== s) { fs.writeFileSync(md, next); console.log(`  ✏️  rewrote scene links in src/stories/${slug}.md`); }
}

// 3) Character cut-outs: downscale PNGs in place (keep transparency + filename).
if (fs.existsSync(ILLOS)) {
  for (const f of fs.readdirSync(ILLOS)) {
    if (!f.toLowerCase().endsWith('.png')) continue;
    const p = path.join(ILLOS, f);
    if (maxDimOf(p) <= ILLO_MAXDIM) continue;
    const before = fs.statSync(p).size;
    sips(['-Z', String(ILLO_MAXDIM), p]);
    saved += before - fs.statSync(p).size;
    console.log(`  🎨 ${f}: ${(before / 1024).toFixed(0)}KB → ${kb(p)}KB`);
  }
}

console.log(saved > 0 ? `\n✅ Optimised — saved ~${(saved / 1024 / 1024).toFixed(1)} MB.` : '\n✅ Nothing to do — images already optimised.');
