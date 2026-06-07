#!/usr/bin/env python3
"""Remove backgrounds from character illustrations -> true transparent PNGs.

  python3 scripts/remove-bg.py                 # all of public/art/illustrations/*.png
  python3 scripts/remove-bg.py path/to/a.png   # specific files

Scenes keep their backgrounds, so only run this on character art.
Needs: pip install rembg onnxruntime pillow
"""
import sys, os, glob
from rembg import remove, new_session
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
files = sys.argv[1:] or sorted(glob.glob(os.path.join(ROOT, "public/art/illustrations/*.png")))

session = new_session()  # u2net (good general cut-outs)
for f in files:
    try:
        img = Image.open(f).convert("RGBA")
        out = remove(img, session=session)
        out.save(f)
        print(f"✅ transparent: {os.path.relpath(f, ROOT)}")
    except Exception as e:
        print(f"❌ {f}: {e}")
