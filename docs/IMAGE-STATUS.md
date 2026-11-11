# Image status

Nothing below is an approved final asset until the founder signs it off.

| Asset | Used in | Source | Status |
| --- | --- | --- | --- |
| Logo | everywhere | REF-01 raster, colour-keyed to #111111 / #FF006E | Temporary. Replace `src/assets/logo.png` with the vector |
| Box N°01 | reveal, conversion, product page | Live rebuild from the REF-05 V2 spec | Temporary. Verify against the print file; back panel not built |
| Sachet front and back | hero, reveal, conversion, product page | Live rebuild from REF-02/03/04 | Temporary. Verify against the print file |
| Strip | reveal | Drawn white film at reference-pack proportions | Temporary. Dimensions unconfirmed; replace with a real macro photo |
| Hero portrait | home hero | REF-08 "The day isn't done.", black-and-white treatment, pink nail kept | Founder's image, re-graded. 1400 px wide: re-export larger |
| Cyclist | campaign, story | REF-08 cyclist, black-and-white treatment | Founder's image, re-graded |
| Boxer, runner | campaign | Generated in Figma, black-and-white treatment, pink kept | Temporary, awaiting approval. 1024 × 1280 |
| Closing portrait | closing | REF-08 wet-hair portrait, black-and-white treatment | Founder's image, re-graded. 602 px wide: re-export larger |
| Strip in hand | product page | Generated in Figma, black-and-white treatment, pink nail kept | Temporary, awaiting approval |
| Product renders | product page gallery, cart | REF-02/05 render sheet | Temporary. ~450–550 px wide: re-export at 2000 px |
| Social share image | — | Not created | Missing. Add `src/app/opengraph-image.png` (1200 × 630) |

The black-and-white grade is produced by `scripts/bw-treatment.py` from the colour originals kept in `src/assets` (`campaign-*`, `gen-*`), so a replacement photo can be re-graded identically.

Kept off the homepage for later use: tennis image (`gen-tennis.webp`), shades portrait and posters (`campaign-shades*`, `campaign-tongue-poster`). The eight-frame film storyboard was removed from the site; the frames are in the reference pack.
