#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import matter from 'gray-matter';
import { parseScenes } from '../src/lib/parse.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STORIES_DIR = path.join(ROOT, 'src', 'stories');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SCENES_DIR = path.join(PUBLIC_DIR, 'art', 'scenes');
const AUDIO_DIR = path.join(PUBLIC_DIR, 'audio');
const CHARACTERS_FILE = path.join(ROOT, 'src', 'data', 'characters.ts');
const IMAGE_EXT_RE = /\.(png|jpe?g|webp|avif)$/i;

const errors = [];

function fail(msg) {
  errors.push(`- ${msg}`);
}

function readStories() {
  return fs.readdirSync(STORIES_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const slug = file.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(STORIES_DIR, file), 'utf8');
      const { content } = matter(raw);
      return { slug, scenes: parseScenes(content) };
    });
}

function resolvePublicPath(storySlug, src) {
  if (!src || /^https?:\/\//i.test(src)) return null;
  if (src.startsWith('/')) return path.join(PUBLIC_DIR, src.replace(/^\/+/, ''));
  return path.join(SCENES_DIR, storySlug, src.replace(/^\.\/+/, ''));
}

function sceneHasGeneratedArt(slug, sceneNumber) {
  const dir = path.join(SCENES_DIR, slug);
  if (!fs.existsSync(dir)) return false;
  const prefix = `scene-${sceneNumber}`;
  return fs.readdirSync(dir).some((file) => {
    if (!IMAGE_EXT_RE.test(file)) return false;
    return file === `${prefix}.png`
      || file === `${prefix}.jpg`
      || file === `${prefix}.jpeg`
      || file === `${prefix}.webp`
      || file === `${prefix}.avif`
      || file.startsWith(`${prefix}-`);
  });
}

function checkStoryArt(story) {
  for (const scene of story.scenes) {
    const explicitImages = scene.blocks.filter((block) => block.type === 'image');
    for (const image of explicitImages) {
      const target = resolvePublicPath(story.slug, image.src);
      if (target && !fs.existsSync(target)) {
        fail(`${story.slug} scene ${scene.n} references missing image ${image.src}`);
      }
    }
    if (!explicitImages.length && !sceneHasGeneratedArt(story.slug, scene.n)) {
      fail(`${story.slug} scene ${scene.n} has no image asset in public/art/scenes/${story.slug}/`);
    }
  }
}

function checkAudioPairs(story) {
  const dir = path.join(AUDIO_DIR, story.slug);
  const sceneCount = story.scenes.length;
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const mp3Scenes = new Set();
  const jsonScenes = new Set();

  for (const file of files) {
    const match = file.match(/^scene-(\d+)\.(mp3|json)$/);
    if (!match) continue;
    const n = Number(match[1]);
    if (match[2] === 'mp3') mp3Scenes.add(n);
    else jsonScenes.add(n);
  }

  for (let n = 1; n <= sceneCount; n++) {
    const hasText = Boolean(story.scenes[n - 1]?.text?.trim());
    const hasMp3 = mp3Scenes.has(n);
    const hasJson = jsonScenes.has(n);
    if (!hasText && !hasMp3 && !hasJson) continue;
    if (!hasMp3 || !hasJson) {
      fail(`${story.slug} scene ${n} is missing ${!hasMp3 ? 'scene-' + n + '.mp3' : 'scene-' + n + '.json'} in public/audio/${story.slug}/`);
    }
  }

  for (const n of mp3Scenes) {
    if (n < 1 || n > sceneCount) fail(`${story.slug} has orphaned narration file scene-${n}.mp3`);
  }
  for (const n of jsonScenes) {
    if (n < 1 || n > sceneCount) fail(`${story.slug} has orphaned timing file scene-${n}.json`);
  }
}

function parseCharacters() {
  const src = fs.readFileSync(CHARACTERS_FILE, 'utf8');
  const entries = [];
  let current = null;

  for (const rawLine of src.split('\n')) {
    const line = rawLine.trim();
    if (line === '{') {
      current = { id: null, sketch: null };
      continue;
    }
    if (!current) continue;

    const idMatch = line.match(/^id:\s*'([^']+)'/);
    if (idMatch) current.id = idMatch[1];

    const sketchMatch = line.match(/^sketch:\s*(null|'([^']+)')/);
    if (sketchMatch) current.sketch = sketchMatch[2] ?? null;

    if (line === '},' || line === '}') {
      if (current.id) entries.push(current);
      current = null;
    }
  }

  return entries;
}

function checkCharacterAssets() {
  for (const character of parseCharacters()) {
    if (character.sketch) {
      const sketchPath = path.join(PUBLIC_DIR, 'art', 'characters', character.sketch);
      if (!fs.existsSync(sketchPath)) {
        fail(`character ${character.id} references missing sketch public/art/characters/${character.sketch}`);
      }
    }
  }
}

for (const story of readStories()) {
  checkStoryArt(story);
  checkAudioPairs(story);
}
checkCharacterAssets();

if (errors.length) {
  console.error('\n❌ Asset validation failed.\n');
  console.error(errors.join('\n'));
  console.error('\nFix the missing files, then re-run `npm run check-assets`.');
  process.exit(1);
}

console.log('✅ Asset validation passed.');
