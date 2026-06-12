#!/usr/bin/env node
/* -------------------------------------------------------------------------
   optimize-images.mjs — shrink the art so the site is fast to load and share.

   Raw illustrations are often huge. For the web we:
     • Scenes: convert PNG scenes to JPG, resize to max 1200px, and emit WebP.
     • Illustrations: resize to max 768px in-place and emit WebP siblings.

   Run it after `npm run illustrate` (and before committing):
     npm run optimize
   ------------------------------------------------------------------------- */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCENES = path.join(ROOT, 'public', 'art', 'scenes');
const ILLOS = path.join(ROOT, 'public', 'art', 'illustrations');
const STORIES = path.join(ROOT, 'src', 'stories');

const SCENE_MAXDIM = 1200;
const SCENE_JPEG_Q = 82;
const SCENE_WEBP_Q = 78;
const ILLO_MAXDIM = 768;
const ILLO_WEBP_Q = 82;
const IMAGE_RE = /\.(png|jpe?g|webp)$/i;

const kb = (p) => (fs.statSync(p).size / 1024).toFixed(0);
let saved = 0;

async function metadata(file) {
  try { return await sharp(file).metadata(); } catch { return null; }
}

async function resizeInside(image, maxDim) {
  const meta = await image.metadata();
  const width = meta.width || maxDim;
  const height = meta.height || maxDim;
  if (Math.max(width, height) <= maxDim) return image;
  return image.resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true });
}

async function writeSceneJpeg(inputFile, outputFile) {
  const before = fs.statSync(inputFile).size;
  const resized = await resizeInside(sharp(inputFile), SCENE_MAXDIM);
  await resized.jpeg({ quality: SCENE_JPEG_Q, mozjpeg: true }).toFile(outputFile);
  return before;
}

async function writeSceneWebp(inputFile, outputFile) {
  const resized = await resizeInside(sharp(inputFile), SCENE_MAXDIM);
  await resized.webp({ quality: SCENE_WEBP_Q }).toFile(outputFile);
}

async function optimiseIllustration(file) {
  const before = fs.statSync(file).size;
  const ext = path.extname(file).toLowerCase();
  const resized = await resizeInside(sharp(file), ILLO_MAXDIM);
  if (ext === '.png') await resized.png({ compressionLevel: 9 }).toFile(file);
  else if (ext === '.jpg' || ext === '.jpeg') await resized.jpeg({ quality: SCENE_JPEG_Q, mozjpeg: true }).toFile(file);
  const after = fs.statSync(file).size;
  saved += before - after;

  const webp = file.replace(/\.[^.]+$/, '.webp');
  await resized.webp({ quality: ILLO_WEBP_Q }).toFile(webp);
  console.log(`  🎨 ${path.basename(file)}: ${(before / 1024).toFixed(0)}KB → ${kb(file)}KB (+ ${path.basename(webp)})`);
}

const changedSlugs = new Set();
if (fs.existsSync(SCENES)) {
  for (const slug of fs.readdirSync(SCENES)) {
    const dir = path.join(SCENES, slug);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!IMAGE_RE.test(f)) continue;
      const input = path.join(dir, f);
      const ext = path.extname(f).toLowerCase();
      const stem = input.replace(/\.[^.]+$/, '');

      if (ext === '.png') {
        const jpg = `${stem}.jpg`;
        const before = await writeSceneJpeg(input, jpg);
        await writeSceneWebp(jpg, `${stem}.webp`);
        fs.unlinkSync(input);
        saved += before - fs.statSync(jpg).size;
        changedSlugs.add(slug);
        console.log(`  🎬 ${slug}/${f}: ${(before / 1024 / 1024).toFixed(1)}MB → ${kb(jpg)}KB (+ ${path.basename(stem)}.webp)`);
      } else if (ext === '.jpg' || ext === '.jpeg') {
        const before = fs.statSync(input).size;
        await writeSceneJpeg(input, input);
        await writeSceneWebp(input, `${stem}.webp`);
        saved += before - fs.statSync(input).size;
        console.log(`  🎬 ${slug}/${f}: ${(before / 1024).toFixed(0)}KB → ${kb(input)}KB (+ ${path.basename(stem)}.webp)`);
      }
    }
  }
}

for (const slug of changedSlugs) {
  const md = path.join(STORIES, `${slug}.md`);
  if (!fs.existsSync(md)) continue;
  const s = fs.readFileSync(md, 'utf8');
  const next = s.replace(/(\/art\/scenes\/[^)\s]+)\.png/gi, '$1.jpg');
  if (next !== s) {
    fs.writeFileSync(md, next);
    console.log(`  ✏️  rewrote scene links in src/stories/${slug}.md`);
  }
}

if (fs.existsSync(ILLOS)) {
  for (const f of fs.readdirSync(ILLOS)) {
    if (!IMAGE_RE.test(f) || f.toLowerCase().endsWith('.webp')) continue;
    await optimiseIllustration(path.join(ILLOS, f));
  }
}

console.log(saved > 0 ? `\n✅ Optimised — saved ~${(saved / 1024 / 1024).toFixed(1)} MB.` : '\n✅ Nothing to do — images already optimised.');
