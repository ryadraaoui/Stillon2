"""Campaign treatment: high-contrast black-and-white, analog grain, hot pink (#FF006E-family) kept in colour.
Usage: python3 scripts/bw-treatment.py   (reads and writes src/assets)"""
import os
import numpy as np
from PIL import Image, ImageFilter
A = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets')
rng = np.random.default_rng(7)

def treat(src, dst, keep_pink=True, contrast=1.18, grain=9.0, crop=None):
    im = Image.open(os.path.join(A, src)).convert('RGB')
    if crop: im = im.crop(crop)
    a = np.asarray(im).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    lum = np.clip((lum - 128) * contrast + 128 + 4, 0, 255)
    lum = np.clip(lum + rng.normal(0, grain, lum.shape) * (0.55 + 0.45 * (1 - np.abs(lum - 128) / 128)), 0, 255)
    out = np.dstack([lum, lum, lum])
    if keep_pink:
        m = ((r - g) > 95) & ((b - g) > 28) & (r > 150)          # magenta-pink only; skin and lips stay grey
        mask = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
        k = (np.asarray(mask).astype(np.float32) / 255)[..., None]
        shade = np.clip(lum / 150, 0.55, 1.15)[..., None]        # keep the form of the object
        out = out * (1 - k) + np.array([255, 0, 110], np.float32) * shade * k
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(A, dst), quality=86, method=6)
    print(dst, im.size, 'corner', tuple(int(x) for x in out[8, 8]), 'pink px', int(m.sum()) if keep_pink else 0)

treat('campaign-tongue.webp', 'bw-hero.webp')
treat('campaign-cyclist.webp', 'bw-cyclist.webp', keep_pink=False)
treat('gen-boxer.webp', 'bw-boxer.webp')
treat('gen-runner.webp', 'bw-runner.webp')
treat('campaign-wet.webp', 'bw-closing.webp', keep_pink=False)
treat('gen-strip.webp', 'bw-strip-hand.webp')
