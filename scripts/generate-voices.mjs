#!/usr/bin/env node
/* -------------------------------------------------------------------------
   generate-voices.mjs — turn each story page into a multi-voice audio file
   plus a word-timing file, using Azure Neural TTS.

   Run it locally (the audio is then committed and served as static files, so
   the live website needs NO key and costs nothing to run):

     # one-time: get a FREE Azure Speech key (see VOICES-GUIDE.md), then:
     export AZURE_SPEECH_KEY=xxxxxxxx
     export AZURE_SPEECH_REGION=uksouth
     npm run voices

   Or preview the speaker-splitting + SSML without a key:
     npm run voices:dry

   Output (per story):
     public/audio/<slug>/scene-1.mp3      the audio (many voices in one file)
     public/audio/<slug>/scene-1.json     { starts: [...] } word start times (ms)
   ------------------------------------------------------------------------- */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import matter from 'gray-matter';
import { parseScenes, segmentScene, wordList, normWord } from '../src/lib/parse.js';
import { VOICES, OUTPUT_FORMAT, GLOBAL_RATE } from '../voices.config.mjs';

const DRY = process.argv.includes('--dry');
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STORIES_DIR = path.join(ROOT, 'src', 'stories');
const OUT_ROOT = path.join(ROOT, 'public', 'audio');

// --- tiny .env loader (so AZURE_SPEECH_KEY in a local .env file just works) ---
function loadEnv() {
  const f = path.join(ROOT, '.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const KEY = process.env.AZURE_SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION;

// ---------------------------------------------------------------- SSML build
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
function voiceFor(speaker) {
  return VOICES[speaker] || VOICES.unknown || VOICES.narrator;
}
function segmentSsml(seg) {
  const v = voiceFor(seg.speaker);
  const pitch = v.pitch || '0%';
  const rate = v.rate || GLOBAL_RATE || '0%';
  let inner = `<prosody pitch="${pitch}" rate="${rate}">${esc(seg.text)}</prosody>`;
  if (v.style) inner = `<mstts:express-as style="${v.style}">${inner}</mstts:express-as>`;
  return `  <voice name="${v.voice}">${inner}</voice>`;
}
function buildSsml(segments) {
  return [
    '<speak version="1.0"',
    '  xmlns="http://www.w3.org/2001/10/synthesis"',
    '  xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">',
    segments.map(segmentSsml).join('\n'),
    '</speak>',
  ].join('\n');
}

// ----------------------------------------------- align Azure words -> on-screen
function alignTimings(sceneText, boundaries) {
  const words = wordList(sceneText);
  const starts = new Array(words.length).fill(null);
  const az = boundaries.filter((b) => normWord(b.text));
  let j = 0;
  let mismatches = 0;
  for (let i = 0; i < words.length; i++) {
    if (!normWord(words[i])) continue; // punctuation-only token gets no timing
    if (j >= az.length) break;
    if (normWord(words[i]) !== normWord(az[j].text)) mismatches++;
    starts[i] = az[j].ms;
    j++;
  }
  return { starts, words: words.length, spoken: az.length, mismatches };
}

// -------------------------------------------------------------- Azure synth
async function makeSynth() {
  const sdk = await import('microsoft-cognitiveservices-speech-sdk');
  if (!KEY || !REGION) {
    throw new Error('Missing AZURE_SPEECH_KEY / AZURE_SPEECH_REGION (see VOICES-GUIDE.md). Or run with --dry.');
  }
  return { sdk };
}
function synthesize(sdk, ssml, mp3Path) {
  return new Promise((resolve, reject) => {
    const cfg = sdk.SpeechConfig.fromSubscription(KEY, REGION);
    const fmt = sdk.SpeechSynthesisOutputFormat[OUTPUT_FORMAT];
    if (fmt !== undefined) cfg.speechSynthesisOutputFormat = fmt;
    const synth = new sdk.SpeechSynthesizer(cfg, null); // null => collect to audioData, no speaker
    const boundaries = [];
    synth.wordBoundary = (_s, e) => {
      const isWord = e.boundaryType === undefined || e.boundaryType === sdk.SpeechSynthesisBoundaryType.Word;
      if (isWord && e.text) boundaries.push({ text: e.text, ms: Math.round(e.audioOffset / 10000) });
    };
    synth.speakSsmlAsync(
      ssml,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          fs.writeFileSync(mp3Path, Buffer.from(result.audioData));
          synth.close();
          resolve(boundaries);
        } else {
          const msg = result.errorDetails || `reason ${result.reason}`;
          synth.close();
          reject(new Error(msg));
        }
      },
      (err) => { synth.close(); reject(err); }
    );
  });
}

// ------------------------------------------------------------------- main
async function main() {
  if (!fs.existsSync(STORIES_DIR)) { console.error('No src/stories/ folder.'); process.exit(1); }
  const storyFiles = fs.readdirSync(STORIES_DIR).filter((f) => f.endsWith('.md'));
  if (!storyFiles.length) { console.log('No stories found.'); return; }

  let sdkBundle = null;
  if (!DRY) sdkBundle = await makeSynth();

  console.log(DRY ? '🟡 DRY RUN — writing SSML + segments only (no Azure calls)\n' : '🔊 Generating voices with Azure Neural TTS\n');

  for (const file of storyFiles) {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(STORIES_DIR, file), 'utf8');
    const { content } = matter(raw);
    const scenes = parseScenes(content);
    const outDir = path.join(OUT_ROOT, slug);
    fs.mkdirSync(outDir, { recursive: true });

    console.log(`📖 ${slug} — ${scenes.length} pages`);
    for (const scene of scenes) {
      if (!scene.text.trim()) continue;
      const segments = segmentScene(scene.text);
      const ssml = buildSsml(segments);

      if (DRY) {
        fs.writeFileSync(path.join(outDir, `scene-${scene.n}.ssml.xml`), ssml);
        fs.writeFileSync(
          path.join(outDir, `scene-${scene.n}.segments.json`),
          JSON.stringify(segments, null, 2)
        );
        const who = [...new Set(segments.map((s) => s.speaker))].join(', ');
        console.log(`   • page ${scene.n}: ${segments.length} segments  [${who}]`);
        continue;
      }

      try {
        const mp3Path = path.join(outDir, `scene-${scene.n}.mp3`);
        const boundaries = await synthesize(sdkBundle.sdk, ssml, mp3Path);
        const { starts, words, spoken, mismatches } = alignTimings(scene.text, boundaries);
        fs.writeFileSync(
          path.join(outDir, `scene-${scene.n}.json`),
          JSON.stringify({ v: 1, starts })
        );
        const warn = mismatches ? `  ⚠️ ${mismatches} word(s) mis-aligned` : '';
        console.log(`   ✅ page ${scene.n}: ${(fs.statSync(mp3Path).size / 1024).toFixed(0)} KB · ${spoken}/${words} words${warn}`);
      } catch (err) {
        console.error(`   ❌ page ${scene.n}: ${err.message}`);
      }
    }
    console.log('');
  }

  console.log(DRY
    ? '👉 Open the .ssml.xml / .segments.json files in public/audio/ to check the voices, then run `npm run voices` for real.'
    : '🎉 Done! The audio is in public/audio/. Commit it and the site will play it.');
}

main().catch((e) => { console.error(e); process.exit(1); });
