from __future__ import annotations

import math
import shutil
from collections import deque
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
W, H = 1122, 1402

SOURCE_DIR = (
    Path.home()
    / ".codex"
    / "generated_images"
    / "019ea9a1-2b34-7e53-8885-88da3a9a70c5"
)

FONT_LABEL = Path("C:/Windows/Fonts/malgunbd.ttf")
FONT_FALLBACK = Path("C:/Windows/Fonts/malgun.ttf")


@dataclass(frozen=True)
class CardSpec:
    vowel: str
    label: str
    source_index: int
    crop_norm: tuple[float, float, float, float]
    target_box: tuple[int, int, int, int]
    color_hex: str


CARDS = [
    CardSpec("ㅏ", "아아 나뭇가지", 18, (0.03, 0.20, 0.97, 0.84), (310, 345, 812, 990), "#f6a43b"),
    CardSpec("ㅓ", "어어 풍선", 5, (0.03, 0.24, 0.97, 0.84), (220, 380, 902, 1020), "#6fb6f2"),
    CardSpec("ㅗ", "오오 상자", 7, (0.02, 0.24, 0.98, 0.88), (160, 405, 962, 980), "#7bc87c"),
    CardSpec("ㅜ", "우우 발판", 8, (0.03, 0.22, 0.97, 0.82), (160, 450, 962, 970), "#a47ad6"),
    CardSpec("ㅠ", "유유 의자", 9, (0.02, 0.28, 0.98, 0.86), (155, 405, 967, 1010), "#68b7c7"),
    CardSpec("ㅛ", "요요 그네", 15, (0.10, 0.17, 0.90, 0.82), (200, 360, 922, 1010), "#f58fb1"),
    CardSpec("ㅡ", "으으 쿠션", 16, (0.02, 0.30, 0.98, 0.76), (140, 510, 982, 900), "#f1b542"),
    CardSpec("ㅣ", "이이 막대", 17, (0.22, 0.18, 0.78, 0.82), (360, 350, 762, 1030), "#f27d7d"),
]

OLD_DRAFT_LABELS = [
    "아아 막대",
    "어어 막대",
    "오오 의자",
    "요요 의자",
    "우우 발판",
    "유유 그네",
    "으으 평상",
    "이이 기둥",
]


def font(size: int) -> ImageFont.FreeTypeFont:
    source = FONT_LABEL if FONT_LABEL.exists() else FONT_FALLBACK
    return ImageFont.truetype(str(source), size=size)


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    return tuple(int(value[i : i + 2], 16) for i in (1, 3, 5))


def rounded_rectangle(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_dashed_round_rect(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    radius: int,
    color: tuple[int, int, int],
    width: int = 7,
    dash: int = 26,
    gap: int = 16,
) -> None:
    x1, y1, x2, y2 = box
    r = radius
    points: list[tuple[float, float]] = []
    steps = 18

    points.extend([(x1 + r + i * ((x2 - x1 - 2 * r) / 44), y1) for i in range(45)])
    points.extend(
        [
            (x2 - r + r * math.sin(i / steps * math.pi / 2), y1 + r - r * math.cos(i / steps * math.pi / 2))
            for i in range(1, steps + 1)
        ]
    )
    points.extend([(x2, y1 + r + i * ((y2 - y1 - 2 * r) / 44)) for i in range(1, 45)])
    points.extend(
        [
            (x2 - r + r * math.cos(i / steps * math.pi / 2), y2 - r + r * math.sin(i / steps * math.pi / 2))
            for i in range(1, steps + 1)
        ]
    )
    points.extend([(x2 - r - i * ((x2 - x1 - 2 * r) / 44), y2) for i in range(1, 45)])
    points.extend(
        [
            (x1 + r - r * math.sin(i / steps * math.pi / 2), y2 - r + r * math.cos(i / steps * math.pi / 2))
            for i in range(1, steps + 1)
        ]
    )
    points.extend([(x1, y2 - r - i * ((y2 - y1 - 2 * r) / 44)) for i in range(1, 45)])
    points.extend(
        [
            (x1 + r - r * math.cos(i / steps * math.pi / 2), y1 + r - r * math.sin(i / steps * math.pi / 2))
            for i in range(1, steps + 1)
        ]
    )

    draw_on = True
    carry = 0.0
    for p0, p1 in zip(points, points[1:] + [points[0]]):
        x0, y0 = p0
        xa, ya = p1
        dist = math.hypot(xa - x0, ya - y0)
        pos = 0.0
        while pos < dist:
            length = (dash if draw_on else gap) - carry
            take = min(length, dist - pos)
            if draw_on:
                sx = x0 + (xa - x0) * (pos / dist)
                sy = y0 + (ya - y0) * (pos / dist)
                ex = x0 + (xa - x0) * ((pos + take) / dist)
                ey = y0 + (ya - y0) * ((pos + take) / dist)
                draw.line((sx, sy, ex, ey), fill=color, width=width)
            pos += take
            carry += take
            if (draw_on and carry >= dash) or ((not draw_on) and carry >= gap):
                carry = 0.0
                draw_on = not draw_on


def draw_top_vowel(draw: ImageDraw.ImageDraw, vowel: str, color: tuple[int, int, int]) -> None:
    stroke = 34
    cap = 18
    cx = W // 2
    y = 92
    shadow = (120, 70, 20, 82)

    def bar(box: tuple[int, int, int, int]) -> None:
        x1, y1, x2, y2 = box
        rounded_rectangle(draw, (x1 + 7, y1 + 8, x2 + 7, y2 + 8), cap, shadow)
        rounded_rectangle(draw, box, cap, color + (255,), (255, 255, 255), 5)

    def vline(x: int, y1: int, y2: int) -> None:
        bar((x - stroke // 2, y1, x + stroke // 2, y2))

    def hline(x1: int, x2: int, yy: int) -> None:
        bar((x1, yy - stroke // 2, x2, yy + stroke // 2))

    if vowel == "ㅏ":
        vline(cx - 35, y, y + 185)
        hline(cx - 35, cx + 115, y + 93)
    elif vowel == "ㅓ":
        vline(cx + 35, y, y + 185)
        hline(cx - 115, cx + 35, y + 93)
    elif vowel == "ㅗ":
        hline(cx - 115, cx + 115, y + 125)
        vline(cx, y + 45, y + 125)
    elif vowel == "ㅜ":
        hline(cx - 115, cx + 115, y + 45)
        vline(cx, y + 45, y + 125)
    elif vowel == "ㅡ":
        hline(cx - 135, cx + 135, y + 92)
    elif vowel == "ㅣ":
        vline(cx, y, y + 185)
    elif vowel == "ㅠ":
        hline(cx - 130, cx + 130, y + 45)
        vline(cx - 45, y + 45, y + 140)
        vline(cx + 45, y + 45, y + 140)
    elif vowel == "ㅛ":
        hline(cx - 130, cx + 130, y + 125)
        vline(cx - 45, y + 30, y + 125)
        vline(cx + 45, y + 30, y + 125)


def remove_white_background(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    px = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, _ = px[x, y]
            whiteness = min(r, g, b)
            saturation = max(r, g, b) - min(r, g, b)
            if whiteness > 180 and saturation <= 22:
                px[x, y] = (r, g, b, 0)
            elif whiteness > 246 and saturation < 18:
                px[x, y] = (r, g, b, 0)
            elif whiteness > 232 and saturation < 22:
                alpha = int((246 - whiteness) / 14 * 190)
                px[x, y] = (r, g, b, max(0, min(190, alpha)))
    return image


def crop_to_largest_component(image: Image.Image, threshold: int = 42, padding: int = 8) -> Image.Image:
    width, height = image.size
    alpha = image.getchannel("A")
    seen = bytearray(width * height)
    best_bounds: tuple[int, int, int, int] | None = None
    best_area = 0

    for y in range(height):
        for x in range(width):
            start = y * width + x
            if seen[start] or alpha.getpixel((x, y)) <= threshold:
                continue

            queue: deque[tuple[int, int]] = deque([(x, y)])
            seen[start] = 1
            area = 0
            min_x = max_x = x
            min_y = max_y = y

            while queue:
                cx, cy = queue.popleft()
                area += 1
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)

                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        pos = ny * width + nx
                        if not seen[pos] and alpha.getpixel((nx, ny)) > threshold:
                            seen[pos] = 1
                            queue.append((nx, ny))

            if area > best_area:
                best_area = area
                best_bounds = (min_x, min_y, max_x + 1, max_y + 1)

    if best_bounds is None:
        bbox = image.getbbox()
        return image.crop(bbox) if bbox else image

    left, top, right, bottom = best_bounds
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(width, right + padding)
    bottom = min(height, bottom + padding)
    return image.crop((left, top, right, bottom))


def extract_art(source_path: Path, spec: CardSpec) -> Image.Image:
    source = Image.open(source_path)
    source_w, source_h = source.size
    left, top, right, bottom = spec.crop_norm
    crop_box = (
        int(source_w * left),
        int(source_h * top),
        int(source_w * right),
        int(source_h * bottom),
    )
    art = source.crop(crop_box)
    art = remove_white_background(art)
    art = crop_to_largest_component(art)
    if spec.label == "어어 풍선":
        art = trim_above_blue_subject(art)
    return art


def trim_above_blue_subject(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    px = image.load()
    for y in range(image.height):
        blue_pixels = 0
        for x in range(image.width):
            r, g, b, _ = px[x, y]
            if alpha.getpixel((x, y)) > 20 and b > r + 25 and b > g + 8:
                blue_pixels += 1
        if blue_pixels > 12:
            return image.crop((0, max(0, y - 8), image.width, image.height))
    return image


def paste_art(canvas: Image.Image, art: Image.Image, target_box: tuple[int, int, int, int]) -> None:
    x1, y1, x2, y2 = target_box
    max_w = x2 - x1
    max_h = y2 - y1
    art = art.copy()
    art.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)

    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_w = max(180, int(art.width * 0.78))
    shadow_h = max(30, int(art.height * 0.12))
    shadow_cx = x1 + max_w // 2
    shadow_y = y1 + max_h - int(shadow_h * 0.75)
    shadow_draw.ellipse(
        (
            shadow_cx - shadow_w // 2,
            shadow_y - shadow_h // 2,
            shadow_cx + shadow_w // 2,
            shadow_y + shadow_h // 2,
        ),
        fill=(104, 79, 60, 25),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    canvas.alpha_composite(shadow)

    paste_x = x1 + (max_w - art.width) // 2
    paste_y = y1 + (max_h - art.height) // 2
    canvas.alpha_composite(art, (paste_x, paste_y))


def draw_label(draw: ImageDraw.ImageDraw, text: str, border_color: tuple[int, int, int]) -> None:
    box = (210, 1216, 912, 1340)
    rounded_rectangle(draw, box, 56, (255, 255, 255, 238), None, 0)
    draw_dashed_round_rect(draw, box, 56, border_color, width=5, dash=22, gap=13)

    label_font = font(72)
    while draw.textbbox((0, 0), text, font=label_font)[2] > 610:
        label_font = font(label_font.size - 2)

    bbox = draw.textbbox((0, 0), text, font=label_font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (W - text_w) // 2
    y = box[1] + (box[3] - box[1] - text_h) // 2 - 6
    draw.text((x, y), text, font=label_font, fill=(50, 25, 13))


def make_card(spec: CardSpec, source_path: Path) -> Image.Image:
    image = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    draw = ImageDraw.Draw(image)
    color = hex_to_rgb(spec.color_hex)
    top_color = tuple(min(255, c + 18) for c in color)

    draw_dashed_round_rect(draw, (30, 35, W - 30, H - 35), 80, color, width=7, dash=26, gap=16)
    draw_top_vowel(draw, spec.vowel, top_color)
    paste_art(image, extract_art(source_path, spec), spec.target_box)
    if spec.label == "어어 풍선":
        draw.rectangle((480, 300, 670, 392), fill=(255, 255, 255, 255))
    draw_label(draw, spec.label, color)
    return image.convert("RGB")


def generated_sources() -> list[Path]:
    if not SOURCE_DIR.exists():
        raise FileNotFoundError(f"Missing generated image source directory: {SOURCE_DIR}")
    files = sorted(SOURCE_DIR.glob("*.png"), key=lambda path: path.stat().st_mtime)
    if len(files) < max(card.source_index for card in CARDS):
        raise RuntimeError(f"Expected at least {max(card.source_index for card in CARDS)} source images, found {len(files)}")
    return files


def remove_old_drafts() -> None:
    for label in OLD_DRAFT_LABELS:
        for folder in (ROOT, PUBLIC):
            path = folder / f"{label}.png"
            if path.exists():
                path.unlink()


def main() -> None:
    PUBLIC.mkdir(exist_ok=True)
    sources = generated_sources()
    remove_old_drafts()

    for spec in CARDS:
        source_path = sources[spec.source_index - 1]
        image = make_card(spec, source_path)
        filename = f"{spec.label}.png"
        public_path = PUBLIC / filename
        root_path = ROOT / filename
        image.save(public_path, quality=95)
        shutil.copyfile(public_path, root_path)
        print(public_path)


if __name__ == "__main__":
    main()
