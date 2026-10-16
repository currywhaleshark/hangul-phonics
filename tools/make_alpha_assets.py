"""Cut white-background drawings into transparent PNGs for the lesson videos.

Background = near-white pixels connected to the image edge, plus large enclosed near-white
holes (e.g. the inside of 하하's ㅇ). Small white details such as eyes and bibs stay opaque.
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[1]
ALPHA_ROOT = ROOT / "public" / "video-assets" / "vowel-alpha"
WHITE_THRESHOLD = 236
HOLE_AREA_RATIO = 0.025
MIN_COMPONENT_AREA = 400

# (source, output, crop box (left, top, right, bottom) or None[, enclosed-hole area ratio])
JOBS = [
    ("야야 두 나뭇가지.png", "tools/야야 두 나뭇가지-alpha.png", (326, 320, 817, 1115)),
    ("여여 두 풍선.png", "tools/여여 두 풍선-alpha.png", (303, 334, 797, 1173)),
    ("public/아아 아기 야 나뭇가지 노드방출 생성.png", "combined/아아 아기 야 나뭇가지-alpha.png", None),
    ("public/아아 아기 여 풍선 노드방출 생성.png", "combined/아아 아기 여 풍선-alpha.png", None),
    ("public/고고 겨 풍선.png", "combined/고고 겨 풍선-alpha.png", None),
    ("public/나나 녀 풍선.png", "combined/나나 녀 풍선-alpha.png", None),
    ("public/부부 벼 풍선.png", "combined/부부 벼 풍선-alpha.png", None),
    ("public/하하 혀 풍선.png", "combined/하하 혀 풍선-alpha.png", None),
    ("public/하하 휴 의자.png", "combined/하하 휴 의자-alpha.png", None),
    # The gap between the character and the branch should show the background too.
    ("public/아아 아기 와 오오상자 나뭇가지.png", "combined/아아 아기 와 오오상자 나뭇가지-alpha.png", None, 0.004),
    ("public/고고 과 오오상자 나뭇가지.png", "combined/고고 과 오오상자 나뭇가지-alpha.png", None, 0.004),
]


def label_regions(mask: np.ndarray) -> tuple[np.ndarray, list[int]]:
    """4-connected labelling of True pixels; returns labels and region sizes (index = label - 1)."""
    labels = np.zeros(mask.shape, dtype=np.int32)
    sizes: list[int] = []
    height, width = mask.shape
    for y, x in zip(*np.nonzero(mask)):
        if labels[y, x]:
            continue
        label = len(sizes) + 1
        labels[y, x] = label
        queue = deque([(y, x)])
        size = 0
        while queue:
            cy, cx = queue.popleft()
            size += 1
            for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                if 0 <= ny < height and 0 <= nx < width and mask[ny, nx] and not labels[ny, nx]:
                    labels[ny, nx] = label
                    queue.append((ny, nx))
        sizes.append(size)
    return labels, sizes


def cut_alpha(image: Image.Image, hole_area_ratio: float = HOLE_AREA_RATIO) -> Image.Image:
    rgb = np.asarray(image.convert("RGB"))
    white = rgb.min(axis=2) >= WHITE_THRESHOLD
    labels, sizes = label_regions(white)
    edge_labels = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    hole_min = hole_area_ratio * white.size
    background_labels = [label for label in range(1, len(sizes) + 1) if label in edge_labels or sizes[label - 1] >= hole_min]
    background = np.isin(labels, background_labels)

    foreground = ~background
    fg_labels, fg_sizes = label_regions(foreground)
    small = [label for label in range(1, len(fg_sizes) + 1) if fg_sizes[label - 1] < MIN_COMPONENT_AREA]
    foreground &= ~np.isin(fg_labels, small)

    # Choke one pixel and soften so the white fringe does not show on the coloured background.
    alpha = Image.fromarray((foreground * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = image.convert("RGBA")
    out.putalpha(alpha)
    box = alpha.getbbox()
    if box:
        pad = 24
        box = (max(0, box[0] - pad), max(0, box[1] - pad), min(out.width, box[2] + pad), min(out.height, box[3] + pad))
        out = out.crop(box)
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("only", nargs="*", help="Output names to (re)build; default all")
    args = parser.parse_args()

    manifest_path = ALPHA_ROOT / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    for source, output, crop, *options in JOBS:
        if args.only and not any(name in output for name in args.only):
            continue
        image = Image.open(ROOT / source)
        if crop:
            image = image.crop(crop)
        result = cut_alpha(image, *options)
        target = ALPHA_ROOT / output
        target.parent.mkdir(parents=True, exist_ok=True)
        result.save(target)
        section = "tools" if output.startswith("tools/") else "combined"
        entry = {
            "source": source if source.startswith("public/") else source,
            "alpha": target.relative_to(ROOT).as_posix(),
            "width": result.width,
            "height": result.height,
            "cropBox": list(crop) if crop else None,
            "tool": "tools/make_alpha_assets.py",
        }
        manifest[section] = [item for item in manifest.get(section, []) if item.get("alpha") != entry["alpha"]] + [entry]
        print(f"{output}: {result.width}x{result.height}")
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
