# 📖✨ Lily's Story World

An illustrated, **read-along** storybook website for a young author who is
dyslexic. Every page reads itself out loud while the words light up one by one,
so reading along is easy and fun. Built with [Astro](https://astro.build) so each
story is just a **plain Markdown file Lily can write and edit herself**.

First story: 🥔 **The Great Potato Adventure**.

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

## ✍️ How Lily adds a NEW story

**Quickest:** run `npm run new-story -- --title "My Dragon Tale" --emoji "🐉"`
(or, in Claude Code, use the **/new-story** skill to draft a whole story from an
idea). Then fill in the scenes. Manual steps:

1. Make a new file in **`src/stories/`**, e.g. `my-dragon-tale.md`.
2. Start it with this little header, then write the pages:

   ```markdown
   ---
   title: My Dragon Tale
   author: Lily
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
   - An optional `![what it shows](picture.png)` line adds the picture.
   - An optional `> Draw this: ...` line is just a reminder of what to draw
     (shown on the page until the real picture is added).
   - Everything else is the story words that get read out loud.

3. Save — the story appears on the bookshelf automatically. 🎉

### 🎨 Adding pictures

- **Scene pictures:** save them in `public/art/scenes/` and use the file name
  in the `![ ](name.png)` line. (A photo of a paper drawing is totally fine.)
- **Story cover:** put the image in `public/art/characters/` (or make a
  `public/art/covers/` folder and write `cover: /art/covers/name.png`).
- Lily's character sketches live in `public/art/characters/`. The untouched
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
  stories/           ← Lily's stories (Markdown). Add new ones here.
  data/characters.ts ← the cast for the Characters page
  components/         ← Reader (read-along engine) + Reading-settings panel
  layouts/Base.astro ← shared page shell, fonts, nav
  lib/stories.ts     ← turns the Markdown into pages/scenes
  pages/             ← Home, Characters, and the story reader route
  styles/global.css  ← all the styling + dyslexia reading variables
public/
  art/characters/    ← Lily's character drawings
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
   `npm run voices` so narrator, Lily, Leo, Mum, Dad and the Potato each get
   their own voice, still perfectly highlighted. See **`VOICES-GUIDE.md`**.

## 🎨 Turning sketches into illustrations

See **`ILLUSTRATION-GUIDE.md`** for a ready-to-paste prompt pack (built from
Lily's actual sketches) and the workflow. Drop finished art into
`public/art/illustrations/` and the Characters page shows it automatically, with
a **✏️ Sketch / 🎨 Colour** toggle back to her original drawing.

Made with 💛 for Lily.
