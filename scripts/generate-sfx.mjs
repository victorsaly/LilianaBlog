#!/usr/bin/env node
/* -------------------------------------------------------------------------
   generate-sfx.mjs — make the story's sound effects + ambience with the
   ElevenLabs text-to-sound-effects API. Generated once, saved as static files
   (the live site just plays them — no key needed at runtime, no cost to run).

   Get a FREE key at https://elevenlabs.io (Profile → API key), then:
     echo "ELEVENLABS_API_KEY=sk_xxx" >> .env
     npm run sfx              # generate any missing sounds
     npm run sfx -- --force   # regenerate everything
     npm run sfx -- --dry     # just print the prompts (no key)

   Output: public/audio/sfx/<name>.mp3
   ------------------------------------------------------------------------- */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'audio', 'sfx');

(function loadEnv() {
  const f = path.join(ROOT, '.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
})();
const KEY = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY;

// short one-shot cues (names match cueForText() in the Reader)
const CUES = {
  sparkle: { text: 'a soft magical sparkle shimmer, gentle twinkling chimes, short and bright, child-friendly', duration: 1.6 },
  whoosh:  { text: 'a gentle magical portal whoosh, soft swoosh of air and shimmer, short, not harsh', duration: 1.2 },
  zzzt:    { text: 'a small playful electric zap blip, a tiny zzzt signal, short and soft, cartoon', duration: 0.9 },
  chime:   { text: 'a happy bright success chime, cheerful ascending bells, short, magical', duration: 1.6 },
  thud:    { text: 'a soft cartoon stomp, a gentle rumbly thud, short, not scary', duration: 1.0 },
  villain: { text: 'a short comedic villain sting, low playful dramatic brass, cartoonish, not frightening', duration: 1.4 },
  // Laughs — one general one plus a distinct laugh per character. The reader
  // picks `laugh-<who>` when it can tell who is laughing (falling back to
  // `laugh`), and plays each at its own volume (see CUE_VOL in the Reader).
  laugh:          { text: 'a playful mischievous cartoon laugh, a clear lively ha-ha-ha-ha, silly and bright, child-friendly, not scary', duration: 2.6 },
  'laugh-luna':   { text: 'a bright cheerful teenage girl laughing happily out loud, a genuine warm ha-ha-ha, joyful and clear, child-friendly', duration: 2.6 },
  'laugh-mum':    { text: 'a warm gentle motherly laugh, a soft kind loving chuckle, ha-ha-ha, tender and happy, child-friendly', duration: 2.4 },
  'laugh-cheeto': { text: 'a tiny cute squeaky little bunny giggling, high-pitched playful hee-hee-hee, adorable and short, cartoon', duration: 2.2 },
  'laugh-king':   { text: 'a big deep booming theatrical villain king laugh, a grand dramatic mwa-ha-ha-ha-ha, loud and silly, cartoonish, not frightening for children', duration: 3.6 },
  'laugh-potato': { text: 'a goofy comedic cartoon villain laugh, a bouncy mischievous heh-heh-ha-ha-ha, silly and playful, child-friendly, not scary', duration: 2.9 },
  'laugh-lily':   { text: "a happy little girl giggling brightly, a joyful sweet hee-hee-hee laugh, child-friendly", duration: 2.5 },
  'laugh-leo':    { text: 'a goofy excited young boy laughing, a playful bright cartoon ha-ha-ha, fun and silly', duration: 2.5 },
  cheer:   { text: "a short happy little children's cheer, a warm yay, bright and joyful", duration: 1.4 },
  sizzle:  { text: 'a gentle cooking sizzle, breakfast frying softly in a pan, short, cosy', duration: 1.2 },
  squawk:  { text: 'a friendly cartoon parrot squawk, short, playful and bright', duration: 1.0 },
  splat:   { text: 'a soft comedic splat, light squishy cartoon splat, short', duration: 0.8 },
  clang:   { text: 'a light magical sword shing and soft clang, bright and short, heroic', duration: 0.9 },
  croak:   { text: 'a funny cartoon frog croak, a deep silly ribbit, short and playful, child-friendly, not scary', duration: 1.1 },
  pop:     { text: 'a cheerful magical pop, a bright bubbly cartoon pop with a tiny sparkle, short and happy', duration: 0.8 },
  sneeze:  { text: 'a cute little cartoon sneeze, a soft funny achoo, short and gentle, child-friendly', duration: 1.0 },
  slime:   { text: 'a gentle squishy slimy slide, a soft squelchy snail-shell glide, light and silly, short, not gross', duration: 1.2 },
};
// gentle looping ambience per scene mood (names match the reader's moodName())
const AMBI = {
  'amb-warm':   { text: 'cosy warm family morning room tone, very soft and calm, gentle, loopable background ambience', duration: 12, loop: true },
  'amb-ocean':  { text: 'deep calm underwater ocean cave ambience, soft watery drones, gentle, loopable background', duration: 12, loop: true },
  'amb-magic':  { text: 'dreamy gentle magical sparkly ambience, soft shimmering pad, calm, loopable background', duration: 12, loop: true },
  'amb-battle': { text: 'light adventurous gentle ambience with a soft sense of excitement, calm, loopable, not scary', duration: 12, loop: true },
};
// gentle BACKGROUND MUSIC per scene mood (used as the bed when present)
const MUSIC = {
  'music-warm':   { text: "gentle warm children's storybook background music, soft piano and light strings, cosy and calm, loopable", duration: 22, loop: true },
  'music-ocean':  { text: 'soft mysterious dreamy underwater background music, gentle and calm, loopable, not scary', duration: 22, loop: true },
  'music-magic':  { text: "playful magical children's adventure background music, light and sparkly, gentle, loopable", duration: 22, loop: true },
  'music-battle': { text: "light heroic children's adventure background music, a gentle sense of excitement, loopable, not scary", duration: 22, loop: true },
};

async function gen(name, spec) {
  const out = path.join(OUT, `${name}.mp3`);
  if (!FORCE && fs.existsSync(out)) { console.log(`· ${name} (exists, skip)`); return; }
  if (DRY || !KEY) { console.log(`\n=== ${name} ===\n${spec.text}\n-> public/audio/sfx/${name}.mp3`); return; }
  process.stdout.write(`🔊 ${name} … `);
  const body = { text: spec.text, prompt_influence: 0.4 };
  if (spec.duration) body.duration_seconds = spec.duration;
  if (spec.loop) body.loop = true;
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify(body),
  });
  if (!res.ok) { console.log(`❌ ${res.status}: ${(await res.text()).slice(0, 200)}`); return; }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(out, buf);
  console.log(`✅ ${(buf.length / 1024).toFixed(0)} KB`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  if (!KEY && !DRY) console.log('No ELEVENLABS_API_KEY — printing prompts (add the key, then `npm run sfx`).');
  console.log('🎚️  Sound effects + ambience\n');
  for (const [n, s] of Object.entries(CUES)) await gen(n, s);
  for (const [n, s] of Object.entries(AMBI)) await gen(n, s);
  for (const [n, s] of Object.entries(MUSIC)) await gen(n, s);
  console.log(DRY ? '\n👉 add ELEVENLABS_API_KEY and run `npm run sfx`' : '\n🎉 Done. Commit public/audio/sfx/ and the site will use them.');
}
main().catch((e) => { console.error(e); process.exit(1); });
