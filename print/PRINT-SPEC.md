# Print specification — Sushanth Paatnaik Profile

22-page A4 portrait catalogue. Hand `profile-A4-bleed3mm.pdf` to the printer.

> **Binding note:** the page count is now **22**, which is *not* a multiple of 4.
> Saddle-stitch needs a multiple of 4, so either **perfect-bind** as-is, or add two
> pages (a blank leaf or an endpaper) to reach **24** before imposing.

## Files

| File | Use |
|---|---|
| `profile-A4-bleed3mm.pdf` | **Send this to the printer.** 216 × 303 mm with 3 mm bleed, TrimBox stamped at 210 × 297 mm. |
| `profile-A4-trim.pdf` | Trim-size proof (210 × 297 mm, no bleed). For on-screen review only. |

Regenerate both with:

```bash
node build-print-pdf.js   # renders index.html at trim size
python3 add-bleed.py      # scales to cover 3mm bleed and stamps the boxes
```

## Specification

| | |
|---|---|
| Trim size | 210 × 297 mm (A4 portrait) |
| Bleed | 3 mm all four edges (MediaBox 216 × 303 mm) |
| Boxes | TrimBox/ArtBox 210 × 297 centred; BleedBox = MediaBox |
| Pages | 22 — **not** divisible by 4; perfect-bind as-is, or pad to 24 for saddle-stitch |
| Fonts | Embedded, subset (Cormorant Garamond, Montserrat, Great Vibes) |
| Text | Live vector — not outlined, not rasterised |
| Colour | **DeviceRGB — see below** |
| Crop marks | None. TrimBox is set; impose and add marks at your end. |

## Two things to confirm with the printer

### 1. Black is RGB and needs a rich-black build

The file is DeviceRGB (an HTML/Chromium export cannot emit CMYK). The page
background is `#050505`, and **80–97% of most pages is solid black**, so this
matters more than usual.

A naive RGB→CMYK conversion turns that into roughly K95 with almost no CMY,
which prints as a thin, washed-out grey-black over large areas and shows
every roller mark.

**Ask the printer to convert to CMYK with a rich-black build** for the
background — typically around **C60 M50 Y40 K100** (or their house rich black),
kept under the total ink limit for the stock (usually 300%). Small text must
stay **K-only** so it doesn't misregister.

If they want it press-ready in CMYK before it reaches them, send the RGB file
and ask them to do the conversion with their own ICC profile — that will beat
any conversion done blind at this end.

### 2. Some images are below 300 dpi, and that ceiling is inherent

The reference PDF this was built from is a **flattened 300 dpi raster** —
each page is a single 2480 × 3508 image. So any region cropped from it and
placed larger than 1:1 cannot reach 300 dpi, no matter how it is re-exported.

| Page | Worst placement | Verdict |
|---|---|---|
| 2 — Manifesto (Earth) | 111 dpi | visibly soft |
| 9 — Hall of Fame (tiles) | 151 dpi | visibly soft |
| 18 — News & Media (thumbnails) | 181 dpi | visibly soft |
| 8 — Honors | 205 dpi | acceptable at reading distance |
| 5 — Philosophy | 230 dpi | acceptable |
| 1 — Cover portrait | 243 dpi | acceptable |
| 17 — Ventures | 247 dpi | acceptable |
| 11, 13, 19, 22 | 285–300 dpi | fine |
| **14, 15 — Portable RO** | **vector** | **no raster; prints at device resolution** |

**To fix the top three, the original high-resolution source images are needed**
— the actual portrait files, Earth render, award photographs and press
thumbnails used to build the reference. Drop them in and re-export and those
pages reach 300 dpi. Without them, page 2 in particular will look soft in
print at A4.

Everything else — layout, type, rules, icons and diagrams — is vector and
prints at full device resolution regardless.

## Pre-flight checklist

- [x] 22 pages, all 216 × 303 mm media / 210 × 297 mm trim
- [ ] Page count padded to 24 **if saddle-stitching** — **printer to confirm binding**
- [x] 3 mm bleed inked on all four edges of every page (no white slivers)
- [x] TrimBox, ArtBox and BleedBox stamped
- [x] Fonts embedded and subset
- [x] Text is live vector, selectable
- [x] Backgrounds and gold preserved (print-color-adjust: exact)
- [ ] CMYK conversion with rich black — **printer to action**
- [ ] High-resolution replacements for pages 2, 9, 18 — **assets needed**
