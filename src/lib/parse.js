/* -------------------------------------------------------------------------
   parse.js — pure, dependency-free text helpers shared by THREE places:
     1. the site build (stories.ts)            — turn markdown into scenes
     2. the read-along Reader (browser)         — tokenize words for highlight
     3. the voice generator (Node script)       — same tokens + speaker split

   Because all three import the SAME tokenizer, the word indexes line up, so
   pre-generated audio word-timings map exactly onto the words on screen.
   Keep this file free of Node-only and browser-only APIs.
   ------------------------------------------------------------------------- */

/** Remove markdown emphasis etc. so read-aloud text matches the words shown. */
export function cleanProse(raw) {
  return String(raw)
    .replace(/!\[.*?\]\(.*?\)/g, '')      // stray images
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')   // links -> just the text
    .replace(/\*\*(.+?)\*\*/g, '$1')      // **bold**
    .replace(/\*(.+?)\*/g, '$1')          // *italic*
    .replace(/__(.+?)__/g, '$1')          // __bold__
    .replace(/_(.+?)_/g, '$1')            // _italic_
    .replace(/`(.+?)`/g, '$1')            // `code`
    .replace(/^#+\s*/g, '')               // stray heading marks
    .trim();
}

export function stripSceneNumber(t) {
  return String(t).replace(/^\s*(scene|chapter|part)\s*\d+\s*[—–:.\-]\s*/i, '').trim();
}

/** Split a story body (markdown) into scenes, each as an ORDERED list of blocks
 *  (text paragraphs and images, in the order written). Images get a `anchor` =
 *  the number of words before them, so the reader can reveal each picture as the
 *  read-along passes that point. Mirrors the rules in the README. */
export function parseScenes(body) {
  const lines = String(body).replace(/\r\n/g, '\n').split('\n');
  const scenes = [];
  let cur = null;

  const flush = () => {
    if (cur && cur.buf.length) {
      const para = cleanProse(cur.buf.join(' ')).replace(/\s+/g, ' ').trim();
      if (para) cur.blocks.push({ type: 'text', text: para });
      cur.buf = [];
    }
  };

  for (const line of lines) {
    const h = line.match(/^##\s+(.*)$/);
    if (h) {
      flush();
      if (cur) scenes.push(cur);
      cur = { title: h[1].trim(), draw: [], blocks: [], buf: [] };
      continue;
    }
    if (!cur) continue;

    const img = line.match(/^!\[(.*?)\]\((.*?)\)\s*$/);
    if (img) { flush(); cur.blocks.push({ type: 'image', src: img[2].trim(), alt: img[1].trim() }); continue; }

    const bq = line.match(/^>\s?(.*)$/);
    if (bq) { flush(); cur.draw.push(cleanProse(bq[1])); continue; }

    if (line.trim() === '') flush();
    else cur.buf.push(line.trim());
  }
  flush();
  if (cur) scenes.push(cur);

  return scenes.map((s, i) => {
    let words = 0;
    const blocks = s.blocks.map((b) => {
      if (b.type === 'text') {
        const out = { type: 'text', text: b.text };
        words += b.text.trim() ? b.text.trim().split(/\s+/).length : 0;
        return out;
      }
      return { type: 'image', src: b.src, alt: b.alt, anchor: words };
    });
    const text = blocks.filter((b) => b.type === 'text').map((b) => b.text).join('\n\n');
    // a leading image (before any text) is the scene's "establishing" picture
    const lead = blocks[0] && blocks[0].type === 'image' ? blocks[0] : null;
    return {
      n: i + 1,
      title: stripSceneNumber(s.title) || s.title,
      rawTitle: s.title,
      image: lead ? lead.src : null,
      alt: lead ? lead.alt : (stripSceneNumber(s.title) || s.title),
      draw: s.draw.join(' ').trim(),
      text,
      blocks,
    };
  });
}

/** Break text into tokens. Word tokens carry their character start/end so the
 *  browser TTS boundary events can find them; whitespace is preserved too. */
export function tokenize(text) {
  const tokens = [];
  const re = /\S+|\s+/g;
  let m;
  let cursor = 0;
  while ((m = re.exec(String(text))) !== null) {
    const tok = m[0];
    const isWord = /\S/.test(tok);
    tokens.push({ text: tok, isWord, start: cursor, end: cursor + tok.length });
    cursor += tok.length;
  }
  return tokens;
}

/** Just the spoken words, in order (used to align audio timings to word #). */
export function wordList(text) {
  return tokenize(text).filter((t) => t.isWord).map((t) => t.text);
}

export function normWord(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
}

/** Sentence-ish chunks (used by the free browser-voice fallback so long pages
 *  are never cut off). */
export function makeChunks(text) {
  const out = [];
  const re = /[^.!?\n]+[.!?]*[\s\n]*/g;
  let m;
  while ((m = re.exec(String(text))) !== null) {
    if (m[0].trim() === '') continue;
    out.push({ text: m[0], start: m.index });
  }
  if (!out.length) out.push({ text: String(text), start: 0 });
  return out;
}

// Characters the narrator can hand a line to (lowercase keys -> speaker id).
const NAME_TO_SPEAKER = {
  lili: 'lily', lily: 'lily', leo: 'leo', mum: 'mum', mom: 'mum', mummy: 'mum',
  dad: 'dad', daddy: 'dad', pip: 'pip', blaze: 'blaze',
  potato: 'potato',
};

// The name CLOSEST to the quote wins. In the words after a quote
// ("..." Mum called) the attribution is first, so take the earliest name.
// In the words before a quote (Dad came out. "...") take the latest name.
function nameNearest(context, fromEnd) {
  const c = String(context).toLowerCase();
  let best = null;
  let bestIdx = fromEnd ? -1 : Infinity;
  for (const name of Object.keys(NAME_TO_SPEAKER)) {
    const re = new RegExp('\\b' + name + '\\b', 'g');
    let m;
    let idx = -1;
    while ((m = re.exec(c)) !== null) { idx = m.index; if (!fromEnd) break; }
    if (idx < 0) continue;
    if (fromEnd ? idx > bestIdx : idx < bestIdx) { bestIdx = idx; best = NAME_TO_SPEAKER[name]; }
  }
  return best;
}

/** Split a scene into ordered { speaker, text } segments.
 *  Quoted speech is given to the named character nearby; everything else is the
 *  narrator. Consecutive same-speaker bits are merged. */
export function segmentScene(text) {
  const paras = String(text).split(/\n{2,}/);
  const segs = [];

  for (const para of paras) {
    const pieces = [];
    const re = /"([^"]*)"/g;
    let m;
    let last = 0;
    while ((m = re.exec(para)) !== null) {
      const pre = para.slice(last, m.index);
      if (pre.trim()) pieces.push({ type: 'narr', text: pre });
      pieces.push({ type: 'quote', text: m[0] });
      last = re.lastIndex;
    }
    const tail = para.slice(last);
    if (tail.trim()) pieces.push({ type: 'narr', text: tail });

    let lastSpeaker = null;
    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i];
      if (p.type === 'narr') {
        segs.push({ speaker: 'narrator', text: p.text });
      } else {
        const after = pieces[i + 1] && pieces[i + 1].type === 'narr' ? pieces[i + 1].text : '';
        const before = pieces[i - 1] && pieces[i - 1].type === 'narr' ? pieces[i - 1].text : '';
        const sp = nameNearest(after, false) || nameNearest(before, true) || lastSpeaker || 'narrator';
        lastSpeaker = sp;
        segs.push({ speaker: sp, text: p.text });
      }
    }
  }

  const merged = [];
  for (const s of segs) {
    const text = s.text.trim();
    if (!text) continue;
    const prev = merged[merged.length - 1];
    if (prev && prev.speaker === s.speaker) prev.text += ' ' + text;
    else merged.push({ speaker: s.speaker, text });
  }
  return merged;
}
