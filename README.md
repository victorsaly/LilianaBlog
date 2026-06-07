# 📖✨ Lili's Story World

An illustrated, **read-along storybook website** for a young author who is
dyslexic. Every page reads itself aloud while the words light up one by one, with
a picture for every paragraph, gentle background music, and sound effects — so
following along is easy and fun.

Built with [Astro](https://astro.build) so each story is just a **plain Markdown
file Lili can write and edit herself**.

## 🌍 Read it here → **https://victorsaly.github.io/LilianaBlog/**

First story: 🥔 **The Great Potato Adventure** — by Lili.

> 💛 **Hi Lili!** This is your website. Tap a story, press **▶ Read to me**, and
> follow the glowing words. You can write more stories any time — just ask Dad,
> or see *"Add a new story"* below.

---

## ✨ What it does

- **🔊 Reads aloud + word highlighting** — the word being spoken lights up
  (karaoke-style); words already read stay in a calm colour.
- **👆 Tap any word** to hear just that word (great for tricky ones).
- **🖼️ A picture for every paragraph** — the illustration changes to match what's
  being read, like a moving picture book.
- **🗣️ Speaker portraits** — when a character talks, their little face appears
  next to the line, so it's clear who's speaking.
- **🎵 Music + sound effects** — gentle background music per scene and small
  sound cues at the exciting moments (a *whoosh*, a sparkle, the villain's
  laugh). A **🔊 button** turns sound on/off; it always stays quiet under the
  narrator.
- **🎙️ Real character voices** — each character has their own UK voice
  (narrator, Lili, Leo, Mum, Dad, and the Potato), pre-recorded so the live site
  is fast and free.
- **📱 Phone-friendly reader** — on a phone the picture fills the screen as a
  background and the words scroll up over it; controls tuck away while reading.
- **💜 Made for dyslexia** — warm off-white pages (no harsh white), a clear
  reading font, generous letter/word/line spacing, short left-aligned lines, and
  big friendly buttons. It auto-plays to the next page and works on phones,
  tablets and computers. If a browser has no voice, the full story still shows.

---

## 🚀 Run it on your computer

```bash
npm install
npm run dev          # open the link it prints (usually http://localhost:4321)

npm run build        # build the publish-ready site into dist/
npm run preview      # preview the built site
```

---

## 🧰 Commands

| Command | What it does |
|---|---|
| `npm run dev` | Run the site locally |
| `npm run build` | Build to `dist/` |
| `npm run new-story -- --title "..." --emoji "🐉"` | Scaffold a new story file |
| `npm run illustrate -- --scenes <slug> --per-paragraph` | Make one illustration per paragraph (Gemini) |
| `npm run illustrate -- <id>` | Make/append a single character illustration (Gemini) |
| `npm run voices` | Generate the per-character narration + word-timings (Azure) |
| `npm run sfx` | Generate the sound effects + background music (ElevenLabs) |
| `npm run remove-bg` | Cut out an image background → transparent PNG (rembg) |

**Claude Code skills** (type the slash command):
- **/new-story** — draft a whole dyslexia-friendly story from an idea
- **/sketch-to-illustration** — turn one of Lili's sketches into blog-matching art

Secrets live in `.env` (git-ignored), only needed when *generating* assets — the
live site needs none:
`GEMINI_API_KEY`, `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `ELEVENLABS_API_KEY`.

---

## ✍️ Add a new story

**Quickest:** `npm run new-story -- --title "My Dragon Tale" --emoji "🐉"`
(or use the **/new-story** skill in Claude Code). Then write the pages in
`src/stories/<your-story>.md`:

```markdown
---
title: My Dragon Tale
author: Lili
emoji: "🐉"
tagline: A brave girl and a shy dragon.
accent: "#8b5cf6"     # the story's colour
order: 2              # where it sits on the shelf
---

## Scene 1 — The Cave
> Draw this: a glowing cave with two eyes inside.

Once upon a time, in a cave at the top of a hill...

## Scene 2 — The Dragon
Out of the dark came a great big...
```

**The rules are simple:**
- Each `## Scene` heading = one page of the book.
- A `> Draw this: ...` line is a note about the picture to draw.
- Everything else is the words that get read out loud.
- Save the file — the story appears on the bookshelf automatically. 🎉

Then add the extras (all optional, all keep the words in perfect sync):

1. **Pictures per paragraph** — `npm run illustrate -- --scenes <slug> --per-paragraph`
   draws one illustration per paragraph (in the blog's style) into
   `public/art/scenes/<slug>/`. The reader shows each one as that paragraph is read.
2. **Voices** — `npm run voices` records each character's line in their own UK
   voice. See **`VOICES-GUIDE.md`**.
3. **Sound** — `npm run sfx` makes the music + effects (see below).

> Adding pictures, voices or sounds never changes the words, so the narration
> stays perfectly in sync.

---

## 🎙️ Voices

Two ways to read aloud; the site picks the best available per page:

1. **Browser voice** — works instantly, no setup, $0; powers the highlighting.
2. **Per-character studio voices (Azure free tier)** — `npm run voices`
   pre-records narrator, Lili, Leo, Mum, Dad and the Potato in distinct UK
   voices, then commits them as static files. See **`VOICES-GUIDE.md`**.

---

## 🔊 Sound effects + music

Each scene has a gentle **background music** bed, and each paragraph can trigger
a small **sound cue** (whoosh, sparkle, zzzt, chime, the villain's laugh…),
always kept quiet under the narrator, with a **🔊 on/off** button.

Generated once with **ElevenLabs** (free tier) and served as static files:

```bash
echo "ELEVENLABS_API_KEY=sk_xxx" >> .env   # free key from elevenlabs.io
npm run sfx                                # -> public/audio/sfx/*.mp3
```

If they aren't generated yet, the reader falls back to gentle in-browser
synthesized sounds (no files, no key). Levels are set with the Web Audio API so
they're correct on iPhone too (iOS ignores plain audio volume).

---

## 🎨 Pictures

- **Per-paragraph scene art:** generated into `public/art/scenes/<slug>/` (JPEG).
- **Character art:** transparent PNGs in `public/art/illustrations/<id>.png` —
  used on the Characters page and as the little speaker portraits.
- Lili's original sketches live in `public/art/characters/` (untouched copies in
  `_originals/`). See **`ILLUSTRATION-GUIDE.md`** to turn a sketch into art.

---

## 🌍 Publishing (GitHub Pages)

Already deployed to **GitHub Pages** via `.github/workflows/deploy.yml`. To
publish any change (new story, art, voices, sounds):

```bash
git add -A && git commit -m "what changed" && git push
```

The pipeline rebuilds and republishes automatically (it sets the `/LilianaBlog/`
base path). The site is live at
**https://victorsaly.github.io/LilianaBlog/**.

> Publishing at the root (e.g. a `USERNAME.github.io` repo or a custom domain)?
> Delete the `BASE_PATH` `env:` block in `.github/workflows/deploy.yml`.

---

## 🗂️ Project map

```
src/
  stories/            ← Lili's stories (Markdown). Add new ones here.
  components/Reader.astro ← the read-along engine (highlight, stage, sound)
  data/characters.ts  ← the cast for the Characters page
  layouts/Base.astro  ← shared page shell, fonts, nav
  lib/                ← Markdown → pages/scenes + shared tokenizer (keeps words
                        and audio timings aligned)
  pages/              ← Home, Characters, and the story reader route
  styles/             ← design tokens + all the styling (dyslexia reading rules)
public/
  art/illustrations/  ← character art (transparent) + speaker portraits
  art/scenes/<slug>/  ← per-paragraph scene pictures
  audio/<slug>/       ← narration mp3 + word-timing json (npm run voices)
  audio/sfx/          ← music + sound effects (npm run sfx)
  fonts/              ← reading fonts (bundled, work offline)
scripts/              ← new-story, illustrate, voices, sfx, remove-bg
VOICES-GUIDE.md · ILLUSTRATION-GUIDE.md · DESIGN-SYSTEM.md · character-bible.md
```

---

Made with 💛 for Lili (Liliana) and her family.
