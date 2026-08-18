# Sushanth Paatnaik — Profile 2026

A print-ready, editable HTML recreation of the black-and-gold profile document — 22 A4 pages
(the original 20, plus a two-page SPI Industries Portable RO Recovery System insert at 14–15).

## Files

| File | What it is |
|---|---|
| `index.html` | **Editable source.** Inline CSS/JS, webfonts embedded as base64, images referenced from `profile-assets/`. Edit this one. |
| `profile-2026-standalone.html` | **Single self-contained file.** Every image inlined as a data URI — no external requests at all. Generated, do not edit by hand. |
| `Sushanth-Paatnaik-Profile-2026.pdf` | Exported A4 PDF (20 pages). Generated. |
| `profile-assets/` | Image assets extracted from the reference PDF. |
| `build-standalone.js` | Regenerates the standalone file from the editable source. |

## Editing

Open `index.html` in a browser. Each PDF page is one `<section class="page">` with an
HTML comment naming its number and title, e.g.:

```html
<!-- ============================================================
     PAGE 7 — JOURNEY (TIMELINE)
     ============================================================ -->
<section class="page" id="page-7">
```

Text is plain HTML — edit it directly. The **Enable editing** button (screen only, never
printed) turns on `contenteditable` for in-browser tweaking; those edits are not persisted,
so make anything permanent in the file itself.

### Design tokens

All colour and type values live in `:root` at the top of the `<style>` block:

```css
--gold:#c99135;  --gold-hi:#e2b05a;  --ivory:#f2eee5;  --grey:#aaa7a0;
--black:#050505;  --serif:'Cormorant Garamond';  --sans:'Montserrat';
```

Utility classes: `.gold-sheen` (metallic gradient text), `.card`, `.rule-fade`,
`.rule-center`, `.tick`, `.qmark`, `.eyebrow`, `.label`, `.body-sm`, `.body-xs`,
`.cutout` (screen-blends photos shot on pure black so their frame edge disappears).

## Exporting a PDF

**From the browser:** open `index.html` → Print → *Save as PDF*, with
Paper **A4**, Margins **None**, **Background graphics ON**, Scale **100%**.
Page size and zero margins are already declared via `@page { size: A4 portrait; margin: 0 }`.

**Headless:**

```bash
npm install
node build-standalone.js   # refresh the standalone file after editing
```

## Regenerating assets

Images were cropped from the reference PDF rendered at 300 dpi. Each page of the reference
is a single flattened raster, so photographic regions were cut out by measured coordinates
and, where the source had layout text baked into a region, that text was excluded from the
crop (or painted out against the black background) so it isn't duplicated by the live HTML.

## Notes

- 20 pages, A4 portrait (210 × 297 mm), `page-break-after: always` on every page.
- `print-color-adjust: exact` is set so the black backgrounds and gold survive printing.
- Fonts (Cormorant Garamond, Montserrat, Great Vibes) are embedded as base64 woff2 —
  the document renders identically offline.
- Layout uses CSS Grid and Flexbox only; no presentation framework.
- Icons, rules, timelines, and decorative patterns are inline SVG or CSS.
