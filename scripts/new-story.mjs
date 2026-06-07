#!/usr/bin/env node
/* -------------------------------------------------------------------------
   new-story.mjs — scaffold a new story so it appears on the bookshelf.

     npm run new-story -- --title "My Dragon Tale"
     npm run new-story -- --title "Space Picnic" --emoji "🚀" --accent "#8b5cf6"

   Creates src/stories/<slug>.md with the right frontmatter + a starter
   scene template. Fill in the scenes, then:
     npm run dev                      # preview
     npm run voices                   # add per-character narration
     npm run illustrate -- <id>       # add illustrations
   ------------------------------------------------------------------------- */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STORIES_DIR = path.join(ROOT, 'src', 'stories');

// ---- args ----
const argv = process.argv.slice(2);
const opt = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) opt[a.slice(2)] = argv[++i];
}
if (!opt.title) {
  console.error('Please give a title:  npm run new-story -- --title "My Story"');
  process.exit(1);
}

const slug = opt.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const file = path.join(STORIES_DIR, `${slug}.md`);
if (fs.existsSync(file)) {
  console.error(`A story already exists at src/stories/${slug}.md — choose a different title.`);
  process.exit(1);
}

// next order = (number of existing stories) + 1
fs.mkdirSync(STORIES_DIR, { recursive: true });
const existing = fs.readdirSync(STORIES_DIR).filter((f) => f.endsWith('.md')).length;
const order = opt.order || existing + 1;
const emoji = opt.emoji || '📖';
const author = opt.author || 'Lily';
const tagline = opt.tagline || 'A brand-new adventure.';
const accent = opt.accent || '#12b3a6';
const cover = opt.cover || 'lily-sketch.jpeg';

const body = `---
title: ${opt.title}
author: ${author}
emoji: "${emoji}"
cover: ${cover}
tagline: ${tagline}
accent: "${accent}"
order: ${order}
---

<!--
  Hi Lily! 💛  This is a brand-new story.
  • Each "## Scene" is one page of the book.
  • Add a picture:   ![what it shows](my-picture.png)   (save it in public/art/scenes/)
  • The "> Draw this" line reminds you what to draw.
  • Everything else is the words that get read out loud.
  When you're done: run  npm run voices  for narration.
-->

## Scene 1 — The Beginning
> Draw this: where the story starts.

Write the first page of your story here. Keep the sentences nice and short and clear.

## Scene 2 — Something Happens
> Draw this: the exciting bit!

Write the next page here...

## Scene 3 — The Happy Ending
> Draw this: how it all ends.

And write how the story finishes here. THE END.
`;

fs.writeFileSync(file, body);
console.log(`✅ Created src/stories/${slug}.md`);
console.log(`   Next: write the scenes, then  npm run dev  to see it on the bookshelf.`);
console.log(`   Add voices:  npm run voices`);
