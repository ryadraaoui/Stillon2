"""Cuts the founder's reference pack (extracted PDF images) into site assets.
Usage: python3 scripts/prepare-assets.py <refs_dir>   (refs_dir holds r-000.jpg ... and sheet.webp)
Nothing is generated or redrawn here: crops, colour-keying of the logo, and re-encoding only."""
import sys, os
import numpy as np
from PIL import Image
refs = sys.argv[1]; out = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets')
R = lambda n: Image.open(os.path.join(refs, n)).convert('RGB')

# --- Logo: key the raster onto transparency with exact brand colours (#111111 / #FF006E)
im = np.asarray(R('r-000.jpg')).astype(np.float32)
bg = np.array([247, 243, 238], np.float32)  # warm ivory
r, g, b = im[..., 0], im[..., 1], im[..., 2]
dark = 1 - np.clip(im.max(axis=2) / bg.max(), 0, 1)               # blackness
pinkness = np.clip((r - g) / 150.0, 0, 1)                          # saturation toward pink
is_pink = pinkness > 0.35
alpha_black = np.clip((bg.mean() - im.mean(axis=2)) / (bg.mean() - 17), 0, 1)
alpha_pink = np.clip((bg[1] - g) / (bg[1] - 40), 0, 1)
alpha = np.where(is_pink, alpha_pink, alpha_black)
rgb = np.where(is_pink[..., None], np.array([255, 0, 110]), np.array([17, 17, 17]))
logo = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), 'RGBA')
logo = logo.crop(logo.getbbox())
logo.save(os.path.join(out, 'logo.png'))
print('logo', logo.size)

def save(img, name, q=88):
    img.save(os.path.join(out, name), quality=q, method=6); print(name, img.size)

# --- Campaign photography (REF-08), cropped to remove baked-in type so the site sets live type
save(R('r-009.jpg').crop((0, 440, 1400, 1700)), 'campaign-tongue.webp')        # THE DAY ISN'T DONE
save(R('r-009.jpg'), 'campaign-tongue-poster.webp')
save(R('r-010.jpg').crop((400, 0, 1122, 1402)), 'campaign-shades.webp')        # NOT MADE TO STOP (shades)
save(R('r-010.jpg'), 'campaign-shades-poster.webp')
save(R('r-011.jpg').crop((0, 0, 1122, 1290)), 'campaign-cyclist.webp')         # cyclist, off-brand logo cropped
save(R('r-016.jpg').crop((520, 0, 1122, 1402)), 'campaign-wet.webp')           # wet hair portrait
# --- Film frames (REF-08 video contact sheet, 4 cols x 4 rows)
# --- 3D renders (REF-02/05 sheet)
sh = Image.open(os.path.join(refs, 'sheet.webp')).convert('RGB')
tiles = {'render-front': (0, 0, 551, 602), 'render-open': (568, 0, 1032, 602), 'render-back': (1048, 0, 1462, 292),
         'render-side': (1048, 312, 1462, 624), 'render-box': (0, 662, 552, 1128), 'render-fan': (593, 659, 1021, 1126),
         'render-strip': (1038, 660, 1462, 1000)}
for k, box in tiles.items(): save(sh.crop(box), k + '.webp', 92)
save(R('r-004.jpg'), 'render-box-scale.webp', 92)
save(R('r-001.jpg'), 'render-flat.webp', 92) if False else None
