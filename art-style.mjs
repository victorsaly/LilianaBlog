/* -------------------------------------------------------------------------
   art-style.mjs — the ONE source of truth for how Lily's Story World art looks.
   Used by:
     • scripts/illustrate.mjs        (turns sketches into illustrations)
     • the /sketch-to-illustration skill
   Keeping the style here means every illustration "matches the blog".
   ------------------------------------------------------------------------- */

// The house style — paste into every illustration prompt.
export const STYLE = [
  "Bright, bold children's-storybook CARTOON illustration to match a cheerful",
  "kids' website. Thick clean outlines, flat cel-shaded colours, soft simple",
  "shadows, big expressive friendly eyes, rounded shapes, warm and a little",
  'heroic. Full body, centred, on a fully transparent background (PNG).',
  'Use the SAME art style across the whole cast so they look like one team.',
].join(' ');

// Always preserve the child's own drawing.
export const KEEP = [
  'This is based on a real pencil drawing by Lily, age 9.',
  'Keep her pose, her proportions and ALL her special details —',
  'just bring them to life with colour and clean lines.',
  'Do NOT make a generic character; keep it recognisably HER drawing.',
].join(' ');

// Brand colours (for reference / consistency).
export const PALETTE = {
  teal: '#12b3a6', purple: '#8b5cf6', sunny: '#ffb703', coral: '#ff6b6b',
};

// Per-character prompt bodies. `sketch` is the input drawing (null = no sketch
// yet, so it's generated from the description alone).
export const CHARACTERS = {
  lily: {
    sketch: 'lily-sketch.jpeg',
    body: "A brave, cheerful 9-year-old girl hero named Lily. Keep her cat-ear headband, big sparkly happy eyes and open smile, and her dynamic pose with one arm raised holding a glowing silver stylus-sword pointing up. Keep the 'A+' emblem on her top, her checkered/plaid trousers, and the cape flowing behind her. Surround her with swirling golden-white energy: a floating heart, a small flame, spiral wind swirls, and bright energy rays bursting up from beneath her feet (her 'love and caring' power awakening). Glowing silver armour with teal accents. Colours: bright teal + glowing silver + golden energy glow.",
  },
  leo: {
    sketch: 'leo-sketch.jpeg',
    body: 'A goofy, competitive 12-year-old big brother named Leo. Keep his spiky hair, big grin, the zigzag design on his chest and the spark lines around him. Blocky diamond-blue Minecraft-style armour and a flaming pickaxe held over his shoulder. Colours: bright blue + lime-green hoodie + orange flames.',
  },
  mum: {
    sketch: 'mum-sketch.jpeg',
    body: 'A warm, calm mum hero. Keep her long flowing hair, big friendly eyes and her pose with one arm raised high. Swirling pale-blue wind around her, a flowing golden battle-cloak and a shiny frying-pan shield. Colours: warm gold + cherry-red apron + pale-blue wind swirls.',
  },
  dad: {
    sketch: 'dad-sketch.jpeg',
    body: "A friendly, slightly distracted work-from-home dad turned action hero. Keep his curly hair, calm smile and hoodie. His necktie flows out behind him like a cape, chunky cartoon rocks rise around his feet (earth power), and he holds a glowing coffee mug. Colours: navy blue + earthy brown and green rocks.",
  },
  pip: {
    sketch: null,
    body: 'A cosy brown hedgehog with a cream tummy and friendly spikes, curled mid-roll into a fast spiky speed-ball with a little dust trail. Small, brave and cute.',
  },
  blaze: {
    sketch: null,
    body: 'A bold, chatty parrot with fiery red-orange-yellow feathers, big wings spread, leaving a trail of flame-coloured sparkles, lighting up a dark cave.',
  },
  potato: {
    sketch: null,
    body: 'A grumpy lumpy tan potato villain floating in the air, wearing a black ninja mask, spinning a pair of potato nunchucks. Dramatic, fun and a little bit scary.',
  },
  fries: {
    sketch: null,
    body: 'A little army of golden-yellow French-fry soldiers with simple faces and arms, marching in a wobbly row, each holding a small red ketchup-blaster.',
  },
};

/** Build the full prompt for a character (or a custom description). */
export function buildPrompt(body) {
  return `${body}\n\n${STYLE}\n\n${KEEP}`;
}

// Wide scene/background illustrations (these KEEP a full background — not
// transparent — and should match the characters' look).
export const SCENE_STYLE = [
  'Wide landscape children’s-storybook scene illustration, 4:3 composition,',
  'bright bold cartoon colours, thick clean outlines, soft cel shading, a rich',
  'colourful setting that fills the whole frame (a full background, NOT',
  'transparent), no text or words anywhere. Keep the same cheerful cartoon art',
  'style as the attached character reference images so the characters look the',
  'same as the rest of the book.',
].join(' ');

/** Build a scene prompt from a story page's "draw this" hint + title. */
export function buildScenePrompt(title, draw) {
  const hint = String(draw || '').replace(/^draw this:?\s*/i, '').trim();
  return `Illustrate this page of a children's storybook. Scene: "${title}". ${hint}\n\n${SCENE_STYLE}`;
}
