#!/usr/bin/env python3
"""
Turn the trim-size export into a press-ready PDF with bleed.

The design is 210x297mm with full-bleed black pages, so trimming variance
would show white slivers at the edges. This scales each page up to
216x303mm (3mm bleed on every side) and stamps the boxes a printer reads:

    MediaBox / BleedBox  216 x 303 mm   what gets printed
    TrimBox              210 x 297 mm   where it gets cut

Text stays vector — pages are placed, not rasterised.

    python3 add-bleed.py
"""
import os
import sys

import pymupdf as fitz

MM = 72.0 / 25.4
TRIM_W, TRIM_H = 210.0, 297.0
BLEED = 3.0

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "print", "profile-A4-trim.pdf")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "print", "profile-A4-bleed3mm.pdf")


def main():
    if not os.path.exists(SRC):
        sys.exit(f"missing {SRC} — run `node build-print-pdf.js` first")

    src = fitz.open(SRC)
    out = fitz.open()

    media_w = (TRIM_W + 2 * BLEED) * MM
    media_h = (TRIM_H + 2 * BLEED) * MM

    for page in src:
        new = out.new_page(width=media_w, height=media_h)
        # Scale the trim-size artwork to *cover* the bleed sheet, centred.
        # Fitting instead of covering would letterbox and leave the bleed
        # white, which defeats the point; covering keeps the aspect ratio
        # (no distortion) and the overhang is what gets trimmed off.
        sw, sh = page.rect.width, page.rect.height
        scale = max(media_w / sw, media_h / sh)
        pw, ph = sw * scale, sh * scale
        x0, y0 = (media_w - pw) / 2, (media_h - ph) / 2
        new.show_pdf_page(fitz.Rect(x0, y0, x0 + pw, y0 + ph), src, page.number)
        # Tell the printer where to cut. The boxes are written straight into
        # the page dict: PyMuPDF's setters reject a BleedBox that exactly
        # equals the MediaBox, which is precisely what full bleed needs.
        x0, y0 = BLEED * MM, BLEED * MM
        x1, y1 = (BLEED + TRIM_W) * MM, (BLEED + TRIM_H) * MM
        trim = f"[{x0:.4f} {y0:.4f} {x1:.4f} {y1:.4f}]"
        full = f"[0 0 {media_w:.4f} {media_h:.4f}]"
        out.xref_set_key(new.xref, "BleedBox", full)
        out.xref_set_key(new.xref, "TrimBox", trim)
        out.xref_set_key(new.xref, "ArtBox", trim)

    out.set_metadata({
        "title": "Sushanth Paatnaik — Profile",
        "author": "Sushanth Paatnaik",
        "subject": "22-page A4 profile catalogue — press ready, 3mm bleed",
        "creator": "index.html",
    })
    out.save(OUT, garbage=4, deflate=True, clean=True)
    print(f"wrote {os.path.relpath(OUT)}  ({os.path.getsize(OUT)/1e6:.1f} MB, {out.page_count} pages)")

    chk = fitz.open(OUT)
    p = chk[0]
    fmt = lambda r: f"{r.width/MM:.1f} x {r.height/MM:.1f} mm"
    print(f"  MediaBox {fmt(p.mediabox)} | TrimBox {fmt(p.trimbox)} | BleedBox {fmt(p.bleedbox)}")


if __name__ == "__main__":
    main()
