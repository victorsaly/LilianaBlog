/* The cast of The Great Potato Adventure.
   The first four have Lili's real sketches; the rest are waiting for her
   to draw them (they show a friendly "draw me!" card until then). */

export interface Character {
  id: string;
  name: string;
  emoji: string;
  power: string;        // shown as a coloured badge
  powerClass: string;   // css class: pow-energy | pow-fire | pow-wind | pow-earth | pow-none
  color: string;        // main colour swatch
  sketch: string | null;// file under /public/art/characters
  desc: string;         // short, kid-friendly
}

export const characters: Character[] = [
  {
    id: 'lily',
    name: 'Lili',
    emoji: '⭐',
    power: 'Energy — the Ultimate Power',
    powerClass: 'pow-energy',
    color: '#12b3a6',
    sketch: 'lily-sketch.jpeg',
    desc: 'The hero — Lili (Liliana). Clever, brave, and a little stubborn. Her greatest power grows from her love and caring — and only wakes up when her family stands with her.',
  },
  {
    id: 'leo',
    name: 'Leo',
    emoji: '🔥',
    power: 'Fire',
    powerClass: 'pow-fire',
    color: '#ff6b3d',
    sketch: 'leo-sketch.jpeg',
    desc: 'The big brother, 12. Competitive and goofy. Wears diamond-blue Minecraft armour and swings a flaming pickaxe that breaks anything.',
  },
  {
    id: 'mum',
    name: 'Mum',
    emoji: '🌬️',
    power: 'Wind',
    powerClass: 'pow-wind',
    color: '#4aa3df',
    sketch: 'mum-sketch.jpeg',
    desc: 'The Breakfast Champion. Calm and warm — the peacemaker who keeps everyone together. Fights with a golden battle-cloak and a frying-pan shield.',
  },
  {
    id: 'dad',
    name: 'Dad',
    emoji: '🪨',
    power: 'Earth',
    powerClass: 'pow-earth',
    color: '#7a5a3a',
    sketch: 'dad-sketch.jpeg',
    desc: 'The Work-From-Home Hero. A bit distracted, but a total action hero when needed. Stamps his foot and raises great stone walls.',
  },
  {
    id: 'pip',
    name: 'Pip',
    emoji: '🦔',
    power: 'Speedy spike-ball',
    powerClass: 'pow-none',
    color: '#a67c52',
    sketch: null,
    desc: 'The hedgehog. Tiny, fast, and braver than anyone expects. Curls into a spiky speed-ball and rolls right through the bad guys.',
  },
  {
    id: 'blaze',
    name: 'Blaze',
    emoji: '🦜',
    power: 'Flame feathers',
    powerClass: 'pow-fire',
    color: '#ff8c1a',
    sketch: null,
    desc: 'The parrot. Bold, chatty, and loyal — and he repeats the last word everyone says! His fiery feathers light up dark caves.',
  },
  {
    id: 'potato',
    name: 'The Great Potato',
    emoji: '🥔',
    power: 'Potato nunchucks (Villain!)',
    powerClass: 'pow-none',
    color: '#c8a24a',
    sketch: null,
    desc: 'The villain. A flying ninja potato with a sneaky, dramatic, slightly ridiculous plan: trap everyone in video games forever.',
  },
  {
    id: 'fries',
    name: 'French Fry Guards',
    emoji: '🍟',
    power: 'Ketchup-blasters',
    powerClass: 'pow-none',
    color: '#f1c40f',
    sketch: null,
    desc: 'The minions. Golden fry soldiers who march in a wobbly line and shout the same thing all at once. Not very smart!',
  },
];
