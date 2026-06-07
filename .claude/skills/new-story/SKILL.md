---
name: new-story
description: Create a brand-new story for Lily's Story World. Use when the user wants to start/write a new story, "add a history", make another adventure, or turn an idea into a story on the site. Drafts a dyslexia-friendly, illustrated, read-along story and wires it into the bookshelf.
---

# Create a new story for Lily's Story World

Turn an idea into a finished story page on the site: a Markdown file in
`src/stories/<slug>.md` that automatically appears on the bookshelf, can be read
aloud, and gets illustrations.

## Step 1 — get the idea
Ask the user (only what's missing):
- **Title** and a one-line idea / premise.
- Who stars in it — reuse the family cast where it fits: **Lily** (hero, energy
  power), **Leo** (12, fire), **Mum** (wind), **Dad** (earth), **Pip** the
  hedgehog, **Blaze** the parrot. New characters are welcome too.
- Roughly how many pages (default 6–8).

## Step 2 — scaffold the file
```bash
npm run new-story -- --title "THE TITLE" --emoji "🐉" --accent "#8b5cf6"
```
This creates `src/stories/<slug>.md` with the correct frontmatter. (Don't
overwrite an existing story.)

## Step 3 — write the story (the important part)
Edit the new file and replace the placeholder scenes. Follow the house style of
the existing `the-great-potato-adventure.md`:
- One `## Scene N — Title` per page (6–8 pages).
- Under each, a `> Draw this: ...` hint describing the BIG top picture for that page.
- Then the prose.
- **Inline pictures (as many as needed):** place `![...](...)` lines *between
  paragraphs, right where they explain the words*. They reveal one-by-one as the
  read-along passes them. Three ways:
  - reuse existing art: `![Lily](/art/illustrations/lily.png)`
  - a saved file: `![the cave](my-cave.png)` (in `public/art/scenes/`)
  - auto-generate: `![a tall purple castle at night](auto)` then run
    `npm run illustrate -- --scenes <slug>` (rewrites `(auto)` to the new file).
  Keep words identical if you add images to a story that already has audio — the
  highlighting stays in sync as long as the words don't change.

**Write it dyslexia-friendly and age-9:**
- Short, clear sentences. Simple, warm vocabulary. One idea per sentence.
- Plenty of dialogue with clear attribution (`"...," said Mum`) — this is what
  gives each character their own voice in the narration, so always name the
  speaker.
- A kind heart to the story (teamwork, courage, caring) like the first one.
- Keep it fun and a little silly. Nothing scary or upsetting.

Make sure the frontmatter is right: `title`, `author` (Lily), `emoji`, `cover`
(a character sketch/illustration filename, e.g. `lily-sketch.jpeg`), `tagline`,
`accent` (a hex colour), `order` (next number).

## Step 4 — add narration + art (offer these)
- **Voices:** `npm run voices` (re-generates audio for all stories incl. the new
  one; needs the Azure key in `.env`). See `VOICES-GUIDE.md`.
- **Scene pictures:** for each `> Draw this` hint, Lily can draw it; save as
  `public/art/scenes/<file>.png` and add `![alt](<file>.png)` under the scene
  title. Or use the **/sketch-to-illustration** skill for character art.
- **Preview:** `npm run dev` — the story is now on the bookshelf.

## Step 5 — publish
Remind the user to commit the new files (`src/stories/`, any new `public/audio/`
and `public/art/`) and push — the deploy pipeline publishes it automatically.

## Notes
- The site reads every `.md` in `src/stories/` — adding the file is all it takes
  to appear. Sort order on the shelf is the `order` frontmatter field.
- Keep `slug`/filenames lowercase-with-dashes.
