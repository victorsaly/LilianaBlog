# 🔊 Per-character voices (free, with Azure Neural TTS)

Each story page can be read aloud with a **different voice for each character**
— narrator, Lili, Leo, Mum, Dad, even the Great Potato — with the words
lighting up in time with the audio.

How it works: we generate the audio **once on your computer** and save it as
normal files in `public/audio/`. The published website just plays those files,
so the live site needs **no key, costs nothing to run, and works offline**.

> Until you generate any audio, every page automatically uses the **free
> built-in browser voice** — so reading-aloud works right now with zero setup.
> The Azure step below is the upgrade to nicer, per-character voices.

---

## 1. Get a FREE Azure Speech key (one time, ~15 min)

1. Make a free Azure account: <https://azure.microsoft.com/free> (the free
   account is enough; no paid plan needed).
2. In the [Azure Portal](https://portal.azure.com): **Create a resource →
   search "Speech" → Speech → Create**.
3. For **Pricing tier**, choose **Free F0** (500,000 characters/month of neural
   TTS, free). Pick the region closest to you (e.g. *UK South*).
4. Once created, open the resource → **Keys and Endpoint** → copy **KEY 1** and
   the **Location/Region** (e.g. `uksouth`).

> 💡 The whole Great Potato story is ~13,000 characters, so you can regenerate
> it ~38 times a month and still stay inside the free tier.

---

## 2. Give the key to the generator

Easiest: create a file called **`.env`** in the project root (it's git-ignored,
so your key stays private):

```bash
AZURE_SPEECH_KEY=paste-your-key-1-here
AZURE_SPEECH_REGION=uksouth
```

(Or `export AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=...` in your terminal.)

---

## 3. Generate the voices

```bash
npm run voices
```

You'll see each page being made:

```
📖 the-great-potato-adventure — 8 pages
   ✅ page 1: 78 KB · 96/96 words
   ✅ page 2: 120 KB · 150/150 words
   ...
🎉 Done! The audio is in public/audio/.
```

Want to preview *who says what* without using your key first?

```bash
npm run voices:dry
```

This writes `.ssml.xml` and `.segments.json` files into `public/audio/` so you
can check the speaker-splitting. (Delete those preview files before publishing.)

---

## 4. Publish

```bash
npm run build      # the audio is picked up automatically
git add public/audio && git commit -m "Add story voices" && git push
```

The website now plays the studio voices with word-highlighting. Any page that
*doesn't* have audio still falls back to the free browser voice.

---

## 🎚️ Change the voices

Edit **`voices.config.mjs`**. Each character maps to an Azure voice, with
optional `pitch` / `rate` tweaks:

```js
lily: { voice: 'en-US-AnaNeural' },                 // real child voice
leo:  { voice: 'en-US-GuyNeural', pitch: '+18%' },  // boyish
potato: { voice: 'en-US-DavisNeural', pitch: '-22%', rate: '-6%' }, // deep villain
```

Browse all the voices (with audio samples) here:
<https://speech.microsoft.com/portal/voicegallery>

> Some voices also support "styles" (cheerful, sad, etc.). You can add
> `style: 'cheerful'` — but only if that *specific* voice supports it, otherwise
> generation will error. The defaults avoid styles so they always work.

---

## 🗣️ How does it know who's speaking?

The generator reads the story and gives quoted lines to the character named
nearest the quote — `"Stop it!" said Mum` → Mum's voice. Everything else is the
narrator. To nudge a tricky line, just make the attribution clear in the story
(e.g. add `said Lili`). It never affects the on-screen words or the
highlighting — only which voice is used.

---

## 🎙️ Prefer real family voices later?

You can also record real voices instead. Tell me and I'll add a simple
recording workflow (we'd highlight per sentence rather than per word for
recordings). The Azure voices are a great, free starting point in the meantime.
