/* The cast of Lili's stories, grouped by the book they belong to.
   Characters with one of Lili's real sketches show it; the rest show a friendly
   "draw me!" card until she draws them. Drop a file named <id>.png into
   public/art/illustrations/ and the colour version appears automatically. */

export interface Character {
  id: string;
  name: string;
  emoji: string;
  power: string;        // shown as a coloured badge
  powerClass: string;   // css class: pow-energy | pow-fire | pow-wind | pow-earth | pow-none
  color: string;        // main colour swatch
  sketch: string | null;// file under /public/art/characters
  desc: string;         // short, kid-friendly
  story: string;        // which book they belong to
}

const POTATO = 'The Great Potato Adventure';
const LUNA = 'Luna Across the Galaxy';

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
    story: POTATO,
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
    story: POTATO,
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
    story: POTATO,
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
    story: POTATO,
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
    story: POTATO,
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
    story: POTATO,
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
    story: POTATO,
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
    story: POTATO,
  },

  // ---- Luna Across the Galaxy ----
  {
    id: 'luna',
    name: 'Luna',
    emoji: '🌙',
    power: 'Starlight (cannot be stolen!)',
    powerClass: 'pow-energy',
    color: '#8b5cf6',
    sketch: 'luna-sketch.jpeg',
    desc: 'The hero, 15. Happiest in her hoodie and jeans — never a dress. A brilliant hacker who can open any locked door, and can even turn into a tiger. Her real power is simply being herself.',
    story: LUNA,
  },
  {
    id: 'cheeto',
    name: 'Cheeto',
    emoji: '🐰',
    power: 'Buzzy ear-zap',
    powerClass: 'pow-fire',
    color: '#ff8fb1',
    sketch: 'cheeto-sketch.jpeg',
    desc: "Luna's best friend since she was three. A little bunny with pink-tipped ears, a star on his head and a camera collar. Wiggles his ears for a buzzy zap — and knows karate!",
    story: LUNA,
  },
  {
    id: 'luna-mum',
    name: 'Mum, the Queen',
    emoji: '🦁',
    power: 'Turns into a lion',
    powerClass: 'pow-wind',
    color: '#e0a83a',
    sketch: 'luna-mum-sketch.jpeg',
    desc: 'The kind Queen of Zootellia. Lets Luna wear whatever she likes and be exactly who she is. When she needs to be brave, she turns into a great golden lion.',
    story: LUNA,
  },
  {
    id: 'luna-dad',
    name: 'Dad, the King',
    emoji: '👑',
    power: 'Rules the whole galaxy',
    powerClass: 'pow-none',
    color: '#5b6472',
    sketch: 'luna-dad-sketch.jpeg',
    desc: 'The strict King who rules the galaxy with his sparkling space-diamond sceptre. Wants Luna in pretty dresses at fancy balls — which is the very last thing Luna wants.',
    story: LUNA,
  },
  {
    id: 'guards',
    name: 'The Palace Guards',
    emoji: '🛡️',
    power: 'Big, blocky and stompy',
    powerClass: 'pow-none',
    color: '#6b7b8c',
    sketch: 'guards-sketch.jpeg',
    desc: "The King's two enormous guards. They stomp about with pointy spears and look very scary — until one buzzy zap from Cheeto sends them snoring.",
    story: LUNA,
  },
];
