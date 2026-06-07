/* -------------------------------------------------------------------------
   Which Azure Neural voice each character speaks in.
   Edit freely! Browse the full voice list here:
   https://learn.microsoft.com/azure/ai-services/speech-service/language-support?tabs=tts

   pitch / rate are optional tweaks (e.g. "+12%", "-8%") to give two characters
   sharing a base voice their own colour. style is an optional Azure speaking
   style (only some voices support styles — e.g. cheerful, angry, sad).
   ------------------------------------------------------------------------- */

export const VOICES = {
  // the storyteller for everything that isn't dialogue
  narrator: { voice: 'en-GB-SoniaNeural' },

  // the family
  lily: { voice: 'en-US-AnaNeural' },                          // a real child voice — perfect for 9-yo Lily
  leo:  { voice: 'en-US-GuyNeural', pitch: '+18%', rate: '+4%' }, // boyish, excitable big brother (12)
  mum:  { voice: 'en-US-JennyNeural' },                        // warm, calm
  dad:  { voice: 'en-US-DavisNeural', rate: '-2%' },           // steady, a bit funny

  // pets
  pip:   { voice: 'en-US-AnaNeural', pitch: '+30%', rate: '+6%' }, // tiny squeaks
  blaze: { voice: 'en-US-AnaNeural', pitch: '+22%', rate: '+12%' }, // squawky, chatty parrot

  // baddies
  potato: { voice: 'en-US-DavisNeural', pitch: '-22%', rate: '-6%' }, // deep, dramatic villain
  fries:  { voice: 'en-US-TonyNeural', pitch: '+6%' },               // the marching minions

  // safety net if a speaker can't be worked out
  unknown: { voice: 'en-GB-SoniaNeural' },
};

// Audio file format + sample settings. MP3 keeps files small for the web.
export const OUTPUT_FORMAT = 'Audio24Khz48KBitRateMonoMp3';

// A gentle overall reading pace baked into the audio (the website's speed
// slider still works on top of this at play time). "0%" = the voice's normal.
export const GLOBAL_RATE = '-4%';
