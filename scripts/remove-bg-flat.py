#!/usr/bin/env python3
"""Cut a flat background off character art -> true transparent PNGs.

  python3 scripts/remove-bg-flat.py                 # every character PNG that still has no alpha
  python3 scripts/remove-bg-flat.py path/to/a.png   # specific files

This is the no-dependency companion to remove-bg.py. That one uses rembg's u2net
model, which is the better tool for photographic or busy backgrounds but needs a
~200MB download. Our illustrations are flat cel-shaded figures on a plain light
ground, which a flood fill handles exactly and instantly.

It fills inward from the border only, so white *inside* the figure is kept — the
palace guards' armour is near-white and survives. Edge pixels are feathered by
alpha so the cut-out doesn't get a hard jaggy outline.

Scenes and covers keep their backgrounds; only run this on character cut-outs.
Needs: pillow (already a dev dependency of the image scripts).
"""
import sys, os, glob
from collections import deque
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, "public", "art", "illustrations")

# Covers and scene art are meant to be opaque — never key them out.
SKIP = {"garden-quest.png"}

# How far a pixel may differ from the sampled background and still be background.
# The figures carry thick black outlines, so there is a wide gap between "ground"
# and "ink" and this can be generous without eating the art.
TOL = 60.0
# Pixels within this much beyond the tolerance fade out rather than cutting hard.
FEATHER = 22.0


def already_transparent(img):
    """True if the image has a real alpha channel that is actually used."""
    if img.mode not in ("RGBA", "LA"):
        return False
    alpha = img.getchannel("A")
    return alpha.getextrema()[0] < 250


def cut(path):
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    px = img.load()

    # Sample the background from the whole border, not just the corners: one odd
    # corner (a stray shadow, a signature) would otherwise shift the reference
    # colour enough that real background lands in the feather band and is left
    # semi-transparent instead of being cut. The median per channel ignores
    # those outliers.
    border = []
    for x in range(w):
        border.append(px[x, 0]); border.append(px[x, h - 1])
    for y in range(h):
        border.append(px[0, y]); border.append(px[w - 1, y])
    bg = tuple(sorted(p[i] for p in border)[len(border) // 2] for i in range(3))

    def dist(p):
        return ((p[0] - bg[0]) ** 2 + (p[1] - bg[1]) ** 2 + (p[2] - bg[2]) ** 2) ** 0.5

    # Flood fill inward from every border pixel. Anything the fill cannot reach
    # is inside the figure and stays fully opaque.
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            q.append((x, y))

    cleared = 0
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        d = dist(px[x, y])
        if d > TOL + FEATHER:
            continue
        r, g, b, _ = px[x, y]
        if d <= TOL:
            px[x, y] = (r, g, b, 0)
        else:
            # In the feather band: fade out proportionally.
            px[x, y] = (r, g, b, int(255 * (d - TOL) / FEATHER))
        cleared += 1
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))

    img.save(path)
    return cleared, w * h


files = sys.argv[1:]
if not files:
    files = [f for f in sorted(glob.glob(os.path.join(ART, "*.png")))
             if os.path.basename(f) not in SKIP]

for f in files:
    name = os.path.relpath(f, ROOT)
    try:
        if already_transparent(Image.open(f)):
            print(f"–  already a cut-out: {name}")
            continue
        cleared, total = cut(f)
        print(f"✅ cut out {cleared * 100 // total}% background: {name}")
    except Exception as e:
        print(f"❌ {name}: {e}")
