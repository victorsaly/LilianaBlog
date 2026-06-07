# 🎨 Turning Lili's Sketches into Illustrations

A step-by-step plan + ready-to-paste prompts to turn Lili's pencil drawings into
bright cartoon illustrations — while keeping them **recognisably HER drawings**.

> The golden rule: we are *bringing her drawings to life*, not replacing them.
> Every prompt below tells the AI to keep her pose, proportions and special
> details. The magic is that Lili sees her own ideas leveled-up.

---

## ⚡ The one-command way (automated)

There's a built-in tool that does all of this for you, using the blog's style
automatically (defined once in `art-style.mjs`):

```bash
# 1) free Gemini key from https://aistudio.google.com/apikey  ->  put in .env:
#    GEMINI_API_KEY=...
npm run illustrate -- lily            # colour one character
npm run illustrate -- all             # the whole cast
npm run illustrate -- --prompt-only lily   # just print the prompt (no key needed)
```

Finished art lands in `public/art/illustrations/<id>.png` and the site shows it
automatically (covers upgrade, Characters page gets a ✏️Sketch/🎨Colour toggle,
and the home "sketchbook" shows the before/after).

In Claude Code you can also just say **“/sketch-to-illustration lily”** (or drop
in a brand-new drawing and ask to illustrate it) — the skill reads the sketch,
writes a faithful on-brand prompt, and generates or hands you the prompt.

The rest of this guide is the manual version + the exact wording, if you'd
rather paste prompts into Gemini yourself.

---

## ⭐ The fastest path (recommended)

> ✅ **Chosen tool: Google Gemini ("Nano Banana" image).** It's the best at
> keeping the *same* character looking consistent across many pictures — which
> matters for an 8-scene story. The prompts below work in any tool, so you can
> switch anytime.

1. **Pick a tool** (any one of these does sketch → illustration well):
   - **ChatGPT** (GPT-4o / "create image") — upload the sketch, paste the prompt. Easiest, great at following details.
   - **Google Gemini ("Nano Banana" image)** — *best for keeping the SAME character across many pictures*, which matters a lot for an 8-scene story. Upload sketch, paste prompt.
   - **Midjourney** — most beautiful, a bit more fiddly. Use the `--cref` (character reference) trick for consistency.
   - **Adobe Firefly** — commercially "safe" licensing, integrates with Photoshop.
2. **Use the full-size originals as input** — they're in `_originals/` (sharper than the web copies).
3. **Do Lili first.** Her finished picture becomes the *style anchor* for everyone else.
4. For each next character, **also attach Lili's finished image** and add:
   *"Match this exact art style, colours and line thickness."* → this keeps the whole family looking like one team.
5. Save the finished pictures as PNGs (see naming at the bottom) and tell me —
   I'll wire them straight into the website. The site is already set up to show
   each illustration *with a "see Lili's original sketch" toggle*. 💛

---

## 🧩 The two blocks every prompt reuses

**STYLE (paste into every prompt):**
> Bright, bold children's-book CARTOON illustration. Thick clean outlines, flat
> cel-shaded colours, soft simple shadows, big expressive eyes, friendly rounded
> shapes, cheerful and a little heroic. Plain soft-coloured background (or a
> transparent background if the tool allows). Use the SAME art style for every
> character so they look like one team.

**KEEP (paste into every prompt):**
> Important: this is based on a real pencil drawing by Lili, age 9. Keep her
> pose, her proportions and ALL her special details — just bring them to life
> with colour and clean lines. Do not make a generic character; keep it
> recognisably HER drawing.

---

## 👧 LILY — the hero  ·  Power: Energy (Earth+Wind+Fire combined)
*Input: `_originals/lily-sketch.original.jpeg`*

> Turn this pencil sketch into a finished character illustration. A brave,
> cheerful 9-year-old girl hero named Lili. Keep her cat-ear headband, her big
> sparkly happy eyes, and her dynamic pose with one arm raised holding a glowing
> silver STYLUS-SWORD. Surround her with swirling golden-white ENERGY light, a
> small floating heart, and bright sparks at her feet — this is her "love and
> caring" power waking up. Outfit: glowing silver armour with teal accents over
> her top, and checkered/plaid leggings. Colours: bright teal + glowing silver +
> golden energy glow.
>
> [STYLE] [KEEP]

## 🧱🔥 LEO — big brother (12)  ·  Power: Fire
*Input: `_originals/leo-sketch.original.jpeg`*

> Turn this pencil sketch into a finished character illustration. A goofy,
> competitive 12-year-old big brother named Leo. Keep his spiky hair, his big
> grin, the zigzag design on his chest, and the energetic spark lines around
> him. Give him blocky diamond-blue Minecraft-style armour and a flaming pickaxe
> held over his shoulder with bright orange FIRE. Colours: bright blue +
> lime-green hoodie + orange flames.
>
> [STYLE] [KEEP]

## 🍳🌬️ MUM — the Breakfast Champion  ·  Power: Wind
*Input: `_originals/mum-sketch.original.jpeg`*

> Turn this pencil sketch into a finished character illustration. A warm, calm
> mum hero. Keep her long flowing hair, her big friendly eyes, and her pose with
> one arm raised high. Add swirling pale-blue WIND around her, a flowing golden
> battle-cloak, and a shiny frying-pan shield in one hand. Colours: warm gold +
> cherry-red apron + pale-blue wind swirls.
>
> [STYLE] [KEEP]

## 💼🪨 DAD — the Work-From-Home Hero  ·  Power: Earth
*Input: `_originals/dad-sketch.original.jpeg`*

> Turn this pencil sketch into a finished character illustration. A friendly,
> slightly distracted work-from-home dad who turns into an action hero. Keep his
> curly hair, his calm smile and his hoodie. His necktie flows out behind him
> like a CAPE, chunky cartoon ROCKS rise up around his feet (earth power), and he
> holds a glowing coffee mug. Colours: navy blue + earthy brown and green rocks.
>
> [STYLE] [KEEP]

---

## 🐾 The characters Lili hasn't drawn yet
*(No sketch input — generate from the description. Still attach Lili's finished
image and say "match this art style".)*

**🦔 PIP — the hedgehog:** A cosy brown hedgehog with a cream tummy and friendly
spikes, curled mid-roll into a fast spiky speed-ball with a little dust trail.
[STYLE]

**🦜 BLAZE — the parrot:** A bold, chatty parrot with fiery red-orange-yellow
feathers, big wings spread, leaving a trail of flame-coloured sparkles, lighting
up a dark cave. [STYLE]

**🥔 THE GREAT POTATO — the villain:** A grumpy lumpy tan potato floating in the
air, wearing a black ninja mask, spinning a pair of "potato nunchucks". Fun and
a little bit scary, dramatic pose. [STYLE]

**🍟 FRENCH FRY GUARDS — the minions:** A little army of golden-yellow French-fry
soldiers with simple faces and arms, marching in a wobbly row, each holding a red
ketchup-blaster. [STYLE]

---

## 🎬 Later: scene pictures (one per page)
Each page of the story has a "Draw this:" hint in
`src/stories/the-great-potato-adventure.md`. To illustrate a scene, attach the
relevant finished characters as references and use the hint as the prompt, e.g.:

> A wide storybook scene: a huge swirling portal bursting open in a cosy
> kitchen, the room twisting into a magical video-game world, the family being
> pulled in. [STYLE] — match the look of the attached characters.

---

## 🧼 Make a clean cut-out (optional but nice)
For character cards and for dropping characters into scenes, a transparent
background looks best:
- In ChatGPT/Gemini: add *"on a transparent background, full body, centered"*.
- Or remove the background afterwards at <https://remove.bg> or in Photoshop /
  Pixelmator / Preview.
- Save as **PNG** to keep transparency.

---

## 📥 Handing the finished art back to me

Save the finished illustrations here and tell me when they're in:

```
public/art/illustrations/
  lily.png
  leo.png
  mum.png
  dad.png
  pip.png        (when ready)
  blaze.png
  potato.png
  fries.png
```

Use lowercase names exactly like above. I'll then:
- show each illustration on the **Characters** page,
- add a **"✏️ see Lili's original sketch"** toggle on each card,
- use them as **story covers** and later in the **scene pictures**.

> Tip: keep a copy of every AI prompt that worked well — re-using the same
> wording keeps future pictures consistent.
