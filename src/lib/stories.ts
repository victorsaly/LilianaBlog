/* -------------------------------------------------------------------------
   stories.ts — reads every Markdown story in src/stories/ and turns it into
   structured scenes the read-along Reader can use.

   A story file looks like this (this is ALL Lili needs to write):

       ---
       title: The Great Potato Adventure
       author: Lili
       emoji: "🥔"
       cover: lily-sketch.jpeg
       tagline: A story about love, teamwork, and mashing some fries.
       accent: "#12b3a6"
       order: 1
       ---

       ## Scene 1 — A Normal Morning
       ![A cosy house](scene-1.png)
       > Draw this: the whole family at home.

       It looked like a totally ordinary morning...

       ## Scene 2 — The Fight at Breakfast
       ...

   Rules:
   • Each "## " heading starts a new scene (one page of the book).
   • An optional ![alt](image) line adds the picture for that scene.
   • An optional "> " line is a friendly "draw this" hint, shown when there
     is no picture yet.
   • Everything else is the story words that get read aloud.
   ------------------------------------------------------------------------- */

import matter from 'gray-matter';
import { parseScenes, type ParsedScene } from './parse.js';

export type Scene = ParsedScene;

export interface Story {
  slug: string;
  title: string;
  author: string;
  emoji: string;
  cover: string | null;
  tagline: string;
  accent: string;
  order: number;
  scenes: Scene[];
  wordCount: number;
}

// Eagerly read every story's raw markdown at build time.
const files = import.meta.glob('../stories/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function buildStory(path: string, raw: string): Story {
  const slug = path.split('/').pop()!.replace(/\.md$/, '');
  const { data, content } = matter(raw);
  const scenes = parseScenes(content);
  const wordCount = scenes.reduce(
    (sum, s) => sum + (s.text.trim() ? s.text.trim().split(/\s+/).length : 0),
    0
  );
  return {
    slug,
    title: String(data.title ?? slug),
    author: String(data.author ?? 'Lili'),
    emoji: String(data.emoji ?? '📖'),
    cover: data.cover ? String(data.cover) : null,
    tagline: String(data.tagline ?? ''),
    accent: String(data.accent ?? '#12b3a6'),
    order: Number(data.order ?? 999),
    scenes,
    wordCount,
  };
}

const ALL: Story[] = Object.entries(files)
  .map(([path, raw]) => buildStory(path, raw))
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

export function getStories(): Story[] {
  return ALL;
}

export function getStory(slug: string): Story | undefined {
  return ALL.find((s) => s.slug === slug);
}

/** Resolve an image name from a story file to a real URL under /public/art.
 *  - full URLs and root paths are used as-is (just prefixed with the site base)
 *  - "scene-1.png"  -> {base}art/scenes/scene-1.png
 *  - a bare cover    -> {base}art/characters/<file>  (handled by caller via `kind`) */
export function artUrl(name: string | null, kind: 'scene' | 'character' | 'illustration', base: string): string | null {
  if (!name) return null;
  if (/^https?:\/\//.test(name)) return name;
  const b = base.endsWith('/') ? base : base + '/';
  if (name.startsWith('/')) return b.replace(/\/$/, '') + name;
  const folder =
    kind === 'scene' ? 'art/scenes/' : kind === 'illustration' ? 'art/illustrations/' : 'art/characters/';
  return b + folder + name;
}
