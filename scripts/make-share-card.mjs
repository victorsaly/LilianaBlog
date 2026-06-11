#!/usr/bin/env node
/* -------------------------------------------------------------------------
   make-share-card.mjs — render the 1200×630 social-share card used in link
   previews (og:image / twitter:image) → public/share-card.png.

   It lays out the brand title + a few character cut-outs in HTML and screenshots
   it with headless Chrome (so the text stays crisp and the art is reused).

     npm run share-card

   Chrome is found at the usual macOS path, or set CHROME=/path/to/chrome.
   Re-run after changing the title or the featured characters below.
   ------------------------------------------------------------------------- */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import url from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ILLO = path.join(ROOT, 'public', 'art', 'illustrations');
const OUT = path.join(ROOT, 'public', 'share-card.png');

// characters featured on the card (file:// so Chrome can load them locally)
const img = (id) => `file://${path.join(ILLO, id + '.png')}`;

const HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #2b2533; position: relative;
    background:
      radial-gradient(1100px 620px at 14% -12%, #fff7e6 0%, rgba(255,247,230,0) 60%),
      radial-gradient(900px 760px at 116% 128%, #ffe6bd 0%, rgba(255,230,189,0) 55%), #f6efe2; }
  .wrap { display: flex; height: 100%; align-items: center; }
  .left { width: 60%; padding: 0 24px 30px 78px; }
  .badge { font-family: 'Trebuchet MS','Segoe UI',sans-serif; font-weight: 800; letter-spacing: .6px;
    display: inline-block; background: #12b3a6; color: #fff; font-size: 21px; padding: 9px 20px;
    border-radius: 999px; margin-bottom: 28px; box-shadow: 0 8px 18px rgba(18,179,166,.35); }
  h1 { font-size: 88px; line-height: 1; letter-spacing: -1.8px; margin-bottom: 24px; }
  .tag { font-family: 'Trebuchet MS','Segoe UI',sans-serif; font-size: 29px; line-height: 1.36;
    color: #574f60; max-width: 540px; }
  .tag b { color: #6d3bdc; }
  .right { width: 40%; position: relative; height: 100%; }
  .right img { position: absolute; bottom: 0; filter: drop-shadow(0 18px 26px rgba(43,37,51,.28)); }
  .c-luna { height: 505px; right: 22px; bottom: -18px; z-index: 1; }
  .c-lily { height: 432px; right: 214px; bottom: -10px; z-index: 2; }
  .c-cheeto { height: 188px; right: 348px; bottom: 22px; z-index: 3; }
  .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 14px;
    background: linear-gradient(90deg, #12b3a6, #8b5cf6, #ffb703, #ff6b6b); }
</style></head><body>
  <div class="wrap">
    <div class="left">
      <span class="badge">📖 READ-ALONG STORYBOOKS</span>
      <h1>Lili&rsquo;s<br/>Story World</h1>
      <p class="tag">Illustrated adventures that <b>read themselves aloud</b> — every word lights up as it&rsquo;s spoken.</p>
    </div>
    <div class="right">
      <img class="c-luna" src="${img('luna')}"/>
      <img class="c-lily" src="${img('lily')}"/>
      <img class="c-cheeto" src="${img('cheeto')}"/>
    </div>
  </div>
  <div class="bar"></div>
</body></html>`;

const htmlPath = path.join(os.tmpdir(), 'lili-share-card.html');
fs.writeFileSync(htmlPath, HTML);

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!fs.existsSync(CHROME)) {
  console.error(`Chrome not found at "${CHROME}". Set CHROME=/path/to/chrome and re-run.`);
  process.exit(1);
}

execFileSync(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  '--window-size=1200,630', `--screenshot=${OUT}`, `file://${htmlPath}`,
], { stdio: 'ignore' });

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`✅ Wrote public/share-card.png (1200×630, ${kb} KB)`);
