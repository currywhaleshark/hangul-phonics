"""Merge print PDFs into one interior file and report page sizes.

Usage: python merge_book_pdf.py plan.json output.pdf
plan.json: [{"file": "a.pdf", "page": 0}, {"file": "b.pdf"}]  (no "page" = every page)
Needs pypdf (the Codex runtime Python has it).
"""

from __future__ import annotations

import json
import sys
from collections import Counter

from pypdf import PdfReader, PdfWriter

MM_PER_PT = 25.4 / 72
JPEG_QUALITY = 92


def main() -> None:
    plan_path, output_path = sys.argv[1], sys.argv[2]
    plan = json.loads(open(plan_path, encoding="utf-8").read())
    writer = PdfWriter()
    readers: dict[str, PdfReader] = {}
    for item in plan:
        reader = readers.setdefault(item["file"], PdfReader(item["file"]))
        pages = [reader.pages[item["page"]]] if "page" in item else list(reader.pages)
        for page in pages:
            writer.add_page(page)
    # Chrome stores photos as lossless PNG streams; high-quality JPEG keeps print quality at a fraction of the size.
    seen: dict[int, bool] = {}
    for page in writer.pages:
        for image in page.images:
            ref = image.indirect_reference.idnum if image.indirect_reference else None
            if ref in seen or image.image.mode != "RGB" or len(image.data) < 200_000:
                continue
            seen[ref] = True
            image.replace(image.image, quality=JPEG_QUALITY)
    writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
    with open(output_path, "wb") as handle:
        writer.write(handle)

    sizes = Counter()
    for page in writer.pages:
        box = page.mediabox
        sizes[f"{round(float(box.width) * MM_PER_PT)}x{round(float(box.height) * MM_PER_PT)}mm"] += 1
    print(json.dumps({"pages": len(writer.pages), "sizes": dict(sizes)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
