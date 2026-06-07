/* Server-side helpers (run at build) to find finished illustrations that have
   been dropped into public/art/illustrations/. */
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'public', 'art', 'illustrations');
const EXTS = ['png', 'webp', 'jpg', 'jpeg'];

export function illustrationFile(id: string): string | null {
  for (const ext of EXTS) {
    if (fs.existsSync(path.join(DIR, `${id}.${ext}`))) return `${id}.${ext}`;
  }
  return null;
}

export function illustrationUrl(id: string, base: string): string | null {
  const f = illustrationFile(id);
  if (!f) return null;
  const b = base.endsWith('/') ? base : base + '/';
  return `${b}art/illustrations/${f}`;
}

/** "lily-sketch.jpeg" -> "lily"  (so a cover can auto-upgrade to the illustration) */
export function idFromCover(cover: string | null): string | null {
  if (!cover) return null;
  const file = cover.split('/').pop() || cover;
  const m = file.match(/^([a-z0-9-]+?)(?:-sketch)?\.(png|jpe?g|webp)$/i);
  return m ? m[1].toLowerCase() : null;
}
