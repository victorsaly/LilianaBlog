# 🎨 Lily's Story World — Design System

> This doubles as our living style guide **and** the design system to import into
> TypeUI. In TypeUI: *Create a design system → Upload markdown → paste/zip this
> file → Review → Publish for MCP*. Then I can build UI that matches the blog.

## 0. The non-negotiables (accessibility first)

This is a reading site for a **9-year-old who is dyslexic**. Every design choice
must keep these. Treat them as hard rules that override any style suggestion:

- **Fonts:** offer OpenDyslexic, Lexend (default), Andika, and a plain sans. Body
  text uses the reader's chosen font.
- **No harsh white** behind reading text — warm off-white / cream by default;
  also offer cream, soft-blue, peach, mint and night reading themes.
- **Generous spacing:** line-height ≥ 1.8 for reading text, extra word-spacing.
- **Short lines:** reading column ≈ 38 characters max.
- **Left-aligned** body text (never justified).
- **Strong read-along highlight:** current word highlighted (yellow), already-read
  words in a calm colour.
- **Big tap targets:** min 44–48px; large, obvious buttons.
- **Contrast:** AA or better for text.
- **Motion:** gentle only, and fully disabled under `prefers-reduced-motion`.
- **Keyboard + focus:** always-visible focus ring; arrows flip pages, space plays.

## 1. Brand & aesthetic

Magical, warm, hand-crafted children's **storybook**. Bright and bold cartoon
energy, rounded and friendly, a little sparkly — never corporate/SaaS, never
flat-grey. Playful but calm enough to read in. Tone of copy: warm, encouraging,
simple, a touch of fun (emoji welcome).

## 2. Colour

Ramps (see `src/styles/tokens.css`):

| Role | Token | Hex |
|---|---|---|
| Primary | `--teal-500` / `-700` | `#12b3a6` / `#0c8378` |
| Secondary | `--purple-500` / `-700` | `#8b5cf6` / `#6d3bdc` |
| Accent (sun) | `--sun-500` | `#ffb703` |
| Accent (coral) | `--coral-500` | `#ff6b6b` |
| Ink (text) | `--ink` / `--ink-soft` | `#2b2533` / `#6a6478` |
| Page background | `--page-bg` | warm cream `#fff7e9` |
| Card | `--card-bg` | `#ffffff` |

Page background = warm cream with soft multi-radial gradient washes (peach, pink,
mint). Power colours for characters: energy = teal→purple, fire = orange, wind =
blue, earth = brown/green.

## 3. Typography

- **Display / headings:** "Baloo 2" (rounded, friendly), weights 700–800.
- **Body / UI:** "Lexend" (reading-optimised).
- **Reading fonts (user-switchable):** OpenDyslexic, Lexend, Andika, system.
- **Type scale (fluid):** `--text-xs … --text-3xl` (see tokens). Headings use
  `--text-xl`/`--text-2xl`/`--text-3xl`; body `--text-base`/`--text-md`.

## 4. Spacing, radius, shadow

- **Spacing scale:** `--space-1 … --space-8` (0.25rem base). Use for all gaps and
  section rhythm; sections separated by `--space-7`.
- **Radius:** `--r-sm 12px`, `--r 18px`, `--r-lg 26px`, `--r-pill 999px`. Lean
  generously rounded.
- **Shadow:** `--shadow-sm / --shadow / --shadow-lg` — soft, warm, never harsh.

## 5. Components

- **Button** (`.btn`): pill, Baloo 2 bold, ≥48px tall, soft shadow, lift on
  hover, press-scale on active. Variants: `teal`, `purple`, `sunny`, `coral`
  (gradient fills), `ghost` (translucent white), `icon` (round), `big`.
- **Header** (`.site-header`): sticky, translucent, blurred, pill-shaped; brand
  with emoji logo; nav pills; current page highlighted in teal.
- **Book card** (`.book`): rounded-lg, accent top-bar, cover image, title +
  author + meta, "▶ Read along" pill; hover lift + slight rotate.
- **Character card** (`.char`): framed art (slight rotation, like taped paper),
  power badge (gradient by element), colour swatch + short description; supports a
  **✏️Sketch / 🎨Colour flip** between the original sketch and the illustration.
- **Cast strip** (`.cast-strip`): row of transparent character cut-outs that
  bounce on hover.
- **Reader page** (`.page` / `.page-text`): a "book page" with soft inner shadow;
  scene picture on top, then the read-along text; each word is a tappable span;
  current word highlighted, read words tinted; calm-focus mode dims the rest.
- **Scene progress** (`.scene-progress`): slim gradient bar (sun→teal).
- **Reader controls:** big round play/pause (teal→coral when playing), restart,
  speed slider (🐢→🐇), back/next, "keep reading" toggle, floating pill bar.
- **Reading-settings dialog** (`.settings`): font chips, page-colour swatches,
  size/line/word sliders, calm-focus toggle, narrator voice, speed.

## 6. Layout patterns

- **Home:** two-column hero (copy + a floating transparent hero character with a
  soft blob + sparkles) → "Pick a story" shelf grid → "From Lily's sketchbook"
  before/after → "Meet the cast" strip.
- **Reader:** centered narrow column (`--w-reader`), one scene per page, prev/next.
- **Characters:** responsive card grid.
- Content widths: page `--w-page`, reader `--w-reader`, prose `--w-prose` (38ch).

## 7. Motion

Gentle float/twinkle on decorative elements; hover lifts; smooth scene-progress.
All animation off under `prefers-reduced-motion`.

## 8. Imagery

- **Characters:** transparent PNG cut-outs (`public/art/illustrations/<id>.png`).
- **Scenes:** full-background JPEG (`public/art/scenes/<slug>/scene-<n>.jpg`).
- Style: bright bold cartoon, thick clean outlines, flat cel shading, big
  expressive eyes — consistent across the whole cast (see `art-style.mjs`).
