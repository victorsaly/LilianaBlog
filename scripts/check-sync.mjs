#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import matter from 'gray-matter';
import { parseScenes, wordList, normWord } from '../src/lib/parse.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STORIES_DIR = path.join(ROOT, 'src', 'stories');
const AUDIO_DIR = path.join(ROOT, 'public', 'audio');

const errors = [];

function fail(msg) {
  errors.push(`- ${msg}`);
}

function normalizedWords(text) {
  return wordList(text).map(normWord).filter(Boolean);
}

function compareWordSequence(expected, actual) {
  if (expected.length !== actual.length) {
    return `expected ${expected.length} words but found ${actual.length}`;
  }
  for (let i = 0; i < expected.length; i++) {
    if (expected[i] !== actual[i]) {
      return `word ${i + 1} differs (${JSON.stringify(expected[i])} !== ${JSON.stringify(actual[i])})`;
    }
  }
  return null;
}

for (const file of fs.readdirSync(STORIES_DIR).filter((name) => name.endsWith('.md'))) {
  const slug = file.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(STORIES_DIR, file), 'utf8');
  const { content } = matter(raw);
  const scenes = parseScenes(content);
  const audioDir = path.join(AUDIO_DIR, slug);

  for (const scene of scenes) {
    if (!scene.text.trim()) continue;

    const timingPath = path.join(audioDir, `scene-${scene.n}.json`);
    const segmentsPath = path.join(audioDir, `scene-${scene.n}.segments.json`);
    if (!fs.existsSync(timingPath)) {
      fail(`${slug} scene ${scene.n} is missing scene-${scene.n}.json — run \`npm run voices -- ${slug}\``);
      continue;
    }
    if (!fs.existsSync(segmentsPath)) {
      fail(`${slug} scene ${scene.n} is missing scene-${scene.n}.segments.json — run \`npm run voices:dry -- ${slug}\` or regenerate voices`);
      continue;
    }

    const expected = normalizedWords(scene.text);
    const timing = JSON.parse(fs.readFileSync(timingPath, 'utf8'));
    const starts = Array.isArray(timing?.starts) ? timing.starts : null;
    if (!starts) {
      fail(`${slug} scene ${scene.n} timing file does not contain a starts array`);
      continue;
    }
    if (starts.length !== expected.length) {
      fail(`${slug} scene ${scene.n} timing count mismatch (${starts.length} timings for ${expected.length} words) — run \`npm run voices -- ${slug}\``);
    }
    if (starts.some((value) => value == null)) {
      fail(`${slug} scene ${scene.n} has null word timings — run \`npm run voices -- ${slug}\``);
    }
    for (let i = 1; i < starts.length; i++) {
      if (typeof starts[i - 1] === 'number' && typeof starts[i] === 'number' && starts[i] < starts[i - 1]) {
        fail(`${slug} scene ${scene.n} timing order goes backwards at word ${i + 1}`);
        break;
      }
    }

    const segments = JSON.parse(fs.readFileSync(segmentsPath, 'utf8'));
    if (!Array.isArray(segments)) {
      fail(`${slug} scene ${scene.n} segments file is not an array`);
      continue;
    }
    const actual = normalizedWords(segments.map((segment) => segment?.text || '').join(' '));
    const mismatch = compareWordSequence(expected, actual);
    if (mismatch) {
      fail(`${slug} scene ${scene.n} narration text drifted from the story (${mismatch}) — run \`npm run voices -- ${slug}\``);
    }
  }
}

if (errors.length) {
  console.error('\n❌ Narration sync validation failed.\n');
  console.error(errors.join('\n'));
  console.error('\nThe story text and committed narration files are out of sync. Run `npm run voices` and commit the updated audio/timing files.');
  process.exit(1);
}

console.log('✅ Narration sync validation passed.');
