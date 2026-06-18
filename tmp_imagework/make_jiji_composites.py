from pathlib import Path

from collections import deque

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT = ROOT / "tmp_imagework"


def cutout(image: Image.Image, box, white_threshold=246) -> Image.Image:
    crop = image.convert("RGBA").crop(box)
    rgb = np.asarray(crop.convert("RGB"))
    near_white = (
        (rgb[:, :, 0] >= white_threshold)
        & (rgb[:, :, 1] >= white_threshold)
        & (rgb[:, :, 2] >= white_threshold)
    )

    h, w = near_white.shape
    bg = np.zeros((h, w), dtype=bool)
    q = deque()

    for x in range(w):
        if near_white[0, x]:
            bg[0, x] = True
            q.append((0, x))
        if near_white[h - 1, x]:
            bg[h - 1, x] = True
            q.append((h - 1, x))
    for y in range(h):
        if near_white[y, 0]:
            bg[y, 0] = True
            q.append((y, 0))
        if near_white[y, w - 1]:
            bg[y, w - 1] = True
            q.append((y, w - 1))

    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and near_white[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                q.append((ny, nx))

    alpha = np.where(bg, 0, 255).astype(np.uint8)
    mask = Image.fromarray(alpha, mode="L").filter(ImageFilter.GaussianBlur(0.3))
    crop.putalpha(mask)
    return crop


def resize_to_width(image: Image.Image, width: int) -> Image.Image:
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def resize_to_height(image: Image.Image, height: int) -> Image.Image:
    width = round(image.width * height / image.height)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def paste(base: Image.Image, overlay: Image.Image, xy):
    base.alpha_composite(overlay, xy)


base_source = Image.open(PUBLIC / "지지 자 새시안.png").convert("RGBA")
canvas_size = base_source.size

# Keep the existing worm-on-wood ㅈ from "자" as a cutout, excluding the old ㅏ stick.
j_cutout = cutout(base_source, (35, 120, 835, 1095), white_threshold=246)


def new_canvas() -> Image.Image:
    image = Image.new("RGBA", canvas_size, (255, 255, 255, 255))
    paste(image, j_cutout, (35, 120))
    return image

eo = Image.open(PUBLIC / "어어 풍선.png").convert("RGBA")
uu = Image.open(PUBLIC / "우우 발판.png").convert("RGBA")
eu = Image.open(PUBLIC / "으으 쿠션.png").convert("RGBA")
ii = Image.open(PUBLIC / "이이 막대.png").convert("RGBA")

eo_tool = cutout(eo, (310, 365, 835, 1020), white_threshold=246)
uu_tool = cutout(uu, (145, 455, 980, 930), white_threshold=246)
eu_tool = cutout(eu, (120, 565, 1010, 820), white_threshold=246)
ii_tool = cutout(ii, (465, 335, 670, 1040), white_threshold=246)

jobs = []

jeo = new_canvas()
paste(jeo, resize_to_height(eo_tool, 690), (680, 250))
jobs.append(("preview_지지_저_원본합성.png", jeo))

ju = new_canvas()
paste(ju, resize_to_width(uu_tool, 760), (250, 665))
jobs.append(("preview_지지_주_원본합성.png", ju))

zeu = new_canvas()
paste(zeu, resize_to_width(eu_tool, 870), (185, 765))
jobs.append(("preview_지지_즈_원본합성.png", zeu))

ji = new_canvas()
paste(ji, resize_to_height(ii_tool, 830), (910, 190))
jobs.append(("preview_지지_지_원본합성.png", ji))

for filename, image in jobs:
    image.convert("RGB").save(OUT / filename, quality=95)
    print(OUT / filename)
