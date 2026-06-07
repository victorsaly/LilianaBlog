# 📖✨ Lili's Story World

An illustrated, **read-along** storybook website for a young author who is
dyslexic. Every page reads itself out loud while the words light up one by one,
so reading along is easy and fun. Built with [Astro](https://astro.build) so each
story is just a **plain Markdown file Lili can write and edit herself**.

First story: 🥔 **The Great Potato Adventure**.

🌍 **Live:** <https://victorsaly.github.io/LilianaBlog/>

---

## ✨ What it does

- **Reads aloud + word highlighting** — the word being spoken lights up
  (karaoke-style), with words already read shown in a calm colour.
- **Tap any word** to hear just that word (great for tricky words).
- **Reading comfort panel** (⚙️ button) tuned for dyslexia:
  - Letter style: **Lexend**, **OpenDyslexic**, **Andika**, or Plain
  - Page colour: cream, white, soft blue, peach, mint, or night
  - Text size, line spacing, and space-between-words sliders
  - **Calm focus** mode (dims everything except the current word)
  - Narrator voice + reading speed 🐢→🐇
  - Choices are remembered on the device.
- **Big buttons, keyboard arrows**, auto-play to the next page, works on
  phones and tablets, and still shows the full story if a browser has no voice.
- Dyslexia-friendly defaults throughout: warm off-white pages (no harsh white),
  short lines, generous spacing, left-aligned text, large clear type.

---

## 🚀 Run it on your computer

```bash
npm install
npm run dev
```

Then open the link it prints (usually <http://localhost:4321>).

To make the final files for publishing:

```bash
npm run build      # output goes to dist/
npm run preview    # preview the built site
```

---

## 🧰 Commands & skills

| Command | What it does |
|---|---|
| `npm run dev` | Run the site locally |
| `npm run build` | Build to `dist/` |
| `npm run new-story -- --title "..."` | Scaffold a new story file |
| `npm run voices` | Generate per-character narration (needs Azure key in `.env`) |
| `npm run voices:dry` | Preview the speaker-splitting without a key |
| `npm run illustrate -- <id>` | Make a character illustration (needs Gemini key) |
| `npm run illustrate -- --scenes <story-slug>` | Make scene illustrations for a story |

**Claude Code skills** (type the slash command):
- **/new-story** — draft a whole dyslexia-friendly story from an idea
- **/sketch-to-illustration** — turn a sketch into blog-matching art

Secrets live in `.env` (git-ignored): `GEMINI_API_KEY`, `AZURE_SPEECH_KEY`,
`AZURE_SPEECH_REGION`.

---

## 🚀 Publish updates

The site is already deployed to **GitHub Pages** at
<https://victorsaly.github.io/LilianaBlog/> via `.github/workflows/deploy.yml`.
To publish any change (new story, new art, new voices):

```bash
git add -A && git commit -m "what changed" && git push
```

The pipeline rebuilds and republishes automatically (it sets the `/LilianaBlog/`
base path for you).

---

## ✍️ How Lili adds a NEW story

**Quickest:** run `npm run new-story -- --title "My Dragon Tale" --emoji "🐉"`
(or, in Claude Code, use the **/new-story** skill to draft a whole story from an
idea). Then fill in the scenes. Manual steps:

1. Make a new file in **`src/stories/`**, e.g. `my-dragon-tale.md`.
2. Start it with this little header, then write the pages:

   ```markdown
   ---
   title: My Dragon Tale
   author: Lili
   emoji: "🐉"
   cover: lily-sketch.jpeg          # a picture for the bookshelf (in art/characters or art/covers)
   tagline: A brave girl and a shy dragon.
   accent: "#8b5cf6"                # the story's colour
   order: 2                         # where it sits on the shelf
   ---

   ## Scene 1 — The Cave
   ![A dark cave](cave.png)          # optional picture (save it in public/art/scenes/)
   > Draw this: a glowing cave with two eyes inside.

   Once upon a time, in a cave at the top of a hill...

   ## Scene 2 — The Dragon
   Out of the dark came a great big...
   ```

   **The rules are simple:**
   - Each `## Scene` heading = one page of the book.
   - An optional `> Draw this: ...` line is the BIG picture at the top of the page
     (and a reminder of what to draw until the real one is added).
   - Everything else is the story words that get read out loud.

   **Inline pictures (as many as you like):** put `![...](...)` lines *between
   paragraphs, right where they explain the words*. Each one **reveals as the
   read-along reaches it** — so pictures pop in as the story is read. Three ways:
   - reuse art we already have: `![Lili](/art/illustrations/lily.png)`
   - a file you saved in `public/art/scenes/`: `![the cave](cave.png)`
   - **auto-generate it:** `![a tall purple castle at night](auto)` then run
     `npm run illustrate -- --scenes <story-slug>` — it draws each `(auto)`
     picture (in the blog's style), saves it, and updates the story file.

   > Adding pictures never changes the words, so a story's narration stays in
   > perfect sync even after you add lots of illustrations.

3. Save — the story appears on the bookshelf automatically. 🎉

### 🎨 Adding pictures

- **Scene pictures:** save them in `public/art/scenes/` and use the file name
  in the `![ ](name.png)` line. (A photo of a paper drawing is totally fine.)
- **Story cover:** put the image in `public/art/characters/` (or make a
  `public/art/covers/` folder and write `cover: /art/covers/name.png`).
- Lili's character sketches live in `public/art/characters/`. The untouched
  original photos are backed up in `_originals/`.

---

## 🌍 Publish it on GitHub Pages

1. Create a GitHub repo and push this project to the **`main`** branch.
2. On GitHub: **Settings → Pages → Build and deployment → Source = GitHub
   Actions**.
3. Every push to `main` builds and publishes automatically
   (see `.github/workflows/deploy.yml`). Your site will be at
   `https://USERNAME.github.io/REPO/`.

> **Publishing at the root instead?** If your repo is named
> `USERNAME.github.io`, or you use a custom domain, open
> `.github/workflows/deploy.yml` and delete the `BASE_PATH` `env:` block so the
> base stays `/`.

---

## 🗂️ Project map

```
src/
  stories/           ← Lili's stories (Markdown). Add new ones here.
  data/characters.ts ← the cast for the Characters page
  components/         ← Reader (read-along engine) + Reading-settings panel
  layouts/Base.astro ← shared page shell, fonts, nav
  lib/stories.ts     ← turns the Markdown into pages/scenes
  pages/             ← Home, Characters, and the story reader route
  styles/global.css  ← all the styling + dyslexia reading variables
public/
  art/characters/    ← Lili's character drawings
  art/scenes/        ← scene pictures (add yours here)
  fonts/             ← OpenDyslexic (bundled, works offline)
character-bible.md   ← the master story + character design notes
_originals/          ← untouched original photos of the sketches (backup)
```

---

## 🔊 Voices

Two ways to read aloud, and the site picks the best one available per page:

1. **Browser voice (default, $0, zero setup)** — works immediately, and powers
   the word-highlighting out of the box.
2. **Per-character studio voices (free Azure tier)** — pre-generate audio with
   `npm run voices` so narrator, Lili, Leo, Mum, Dad and the Potato each get
   their own voice, still perfectly highlighted. See **`VOICES-GUIDE.md`**.

## 🔊 Sound effects + ambience

Each scene has gentle background ambience and each paragraph can trigger a small
sound cue (zzzt, whoosh, sparkle, chime…), kept quiet under the narrator with a
**🔊 toggle**. Generate real effects with **ElevenLabs** (free tier):

```bash
echo "ELEVENLABS_API_KEY=sk_xxx" >> .env   # free key from elevenlabs.io
npm run sfx                                # -> public/audio/sfx/*.mp3
```

Until generated, the reader uses gentle in-browser synthesized sounds as a
fallback (no files, no key).

## 🎨 Turning sketches into illustrations

See **`ILLUSTRATION-GUIDE.md`** for a ready-to-paste prompt pack (built from
Lili's actual sketches) and the workflow. Drop finished art into
`public/art/illustrations/` and the Characters page shows it automatically, with
a **✏️ Sketch / 🎨 Colour** toggle back to her original drawing.

Made with 💛 for Lili.
