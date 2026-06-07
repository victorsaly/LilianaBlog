---
name: sketch-to-illustration
description: Turn one of Lily's pencil sketches into a finished cartoon illustration that matches the Lily's Story World blog. Use when the user wants to colour/illustrate a character sketch, "bring a drawing to life", add art for a new character, or generate the cast illustrations. Works for known characters (lily, leo, mum, dad, pip, blaze, potato, fries) and brand-new drawings.
---

# Sketch → Illustration (matches the blog style)

Convert a child's pencil sketch into a finished illustration that matches the
look of the **Lily's Story World** website. The house style lives in
`art-style.mjs` (STYLE + KEEP + per-character bodies) — always use it so every
result is consistent. The generator is `scripts/illustrate.mjs`
(`npm run illustrate`). Finished art goes in `public/art/illustrations/<id>.png`
and the site shows it automatically (with a ✏️Sketch / 🎨Colour toggle).

## Step 0 — figure out what's being asked
- A **known character**? id is one of: `lily, leo, mum, dad, pip, blaze, potato, fries`.
- A **brand-new drawing**? You'll be given (or can find) an image file. Pick a
  short lowercase `id` (e.g. `dragon`).
- "All of them"? Use `all`.

## Step 1 — is there a Gemini API key?
Check for `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) in the environment or in a
`.env` file at the project root:

```bash
test -f .env && grep -q 'GEMINI_API_KEY\|GOOGLE_API_KEY' .env && echo HAVE_KEY || echo NO_KEY
```

## Step 2A — WITH a key: generate automatically
For known characters:
```bash
npm run illustrate -- <id>            # e.g. lily   (or: all)
```
For a brand-new drawing, FIRST open the sketch with the Read tool and look at
it, then write a faithful one-paragraph description (pose, clothes, props,
expression, colours) and pass it in:
```bash
npm run illustrate -- --id <id> --sketch "<path-to-drawing>" --desc "<your faithful description>"
```
Then confirm the file exists:
```bash
ls -la public/art/illustrations/<id>.png
```
If generation fails with a model error, the model name may have changed — set
`GEMINI_IMAGE_MODEL` in `.env` to the current image model and retry.

## Step 2B — WITHOUT a key: produce the exact prompt to paste
Read the sketch with the Read tool (so your description is faithful to HER
drawing), then print the ready-to-paste prompt:
```bash
npm run illustrate -- --prompt-only <id>
# brand-new drawing:
npm run illustrate -- --prompt-only --id <id> --desc "<your faithful description>"
```
Give the user the prompt and tell them: paste it into **Google Gemini
("Nano Banana")**, attach the sketch shown, and **save the result as
`public/art/illustrations/<id>.png`**. (Free key: https://aistudio.google.com/apikey)

## Step 3 — make it faithful + on-brand (important)
- The whole point is it stays **Lily's drawing, levelled up** — keep her pose
  and the quirky details (cat ears, zigzag shirts, energy swirls, etc.). When
  writing a description for a new sketch, describe what SHE drew, don't invent.
- Ask for a **transparent background PNG** (the STYLE already does) so it drops
  cleanly onto character cards and into scenes.
- For a consistent cast, do **lily first**, then for the others mention
  "match the style of the other characters" — the shared STYLE block handles most
  of this automatically.

## Step 4 — show it on the site
The Characters page and the home "sketchbook" showcase pick up
`public/art/illustrations/<id>.png` automatically, and the story cover upgrades
to Lily's illustration once it exists. Offer to run:
```bash
npm run dev      # preview
```
and remind the user to commit `public/art/illustrations/` before deploying.

## Notes
- Don't overwrite an existing illustration without checking with the user first.
- Keep filenames lowercase and matching the character `id`.
- Never commit the API key; it stays in `.env` (already git-ignored).
