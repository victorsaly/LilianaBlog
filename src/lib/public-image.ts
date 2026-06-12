import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const metaCache = new Map<string, Promise<{ width?: number; height?: number }>>();

function cleanUrl(src: string): string {
  return String(src).split('#')[0].split('?')[0];
}

function basePrefix(base: string): string {
  return base.endsWith('/') ? base : `${base}/`;
}

function relativePublicPath(src: string, base: string): string | null {
  const clean = cleanUrl(src);
  if (/^(https?:)?\/\//i.test(clean) || clean.startsWith('data:')) return null;
  const prefix = basePrefix(base);
  if (clean.startsWith(prefix)) return clean.slice(prefix.length);
  if (clean.startsWith('/')) return clean.replace(/^\/+/, '');
  return clean;
}

function publicFile(src: string, base: string): string | null {
  const rel = relativePublicPath(src, base);
  if (!rel) return null;
  return path.join(PUBLIC_DIR, rel);
}

function publicUrl(rel: string, base: string): string {
  return `${basePrefix(base)}${rel.replace(/^\/+/, '')}`;
}

async function metadataFor(file: string) {
  if (!metaCache.has(file)) {
    metaCache.set(file, sharp(file).metadata().then((meta) => ({ width: meta.width, height: meta.height })));
  }
  return metaCache.get(file)!;
}

export async function getPublicImage(src: string, base: string) {
  const file = publicFile(src, base);
  if (!file || !fs.existsSync(file)) {
    return { src, webpSrc: null, width: undefined, height: undefined };
  }

  const rel = relativePublicPath(src, base)!;
  const ext = path.extname(file);
  const webpFile = ext.toLowerCase() === '.webp' ? null : file.replace(/\.[^.]+$/, '.webp');
  const webpRel = ext.toLowerCase() === '.webp' ? null : rel.replace(/\.[^.]+$/, '.webp');
  const meta = await metadataFor(file);

  return {
    src,
    webpSrc: webpFile && webpRel && fs.existsSync(webpFile) ? publicUrl(webpRel, base) : null,
    width: meta.width,
    height: meta.height,
  };
}
