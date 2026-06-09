from __future__ import annotations

import math
import random
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
W, H = 1122, 1402

FONT_LABEL = Path("C:/Windows/Fonts/malgunbd.ttf")
FONT_VOWEL = Path("C:/Windows/Fonts/malgunbd.ttf")
FONT_FALLBACK = Path("C:/Windows/Fonts/malgunbd.ttf")


VOWELS = [
    ("ㅏ", "아아 막대", "rod_a", "#f6a43b"),
    ("ㅓ", "어어 막대", "rod_eo", "#6fb6f2"),
    ("ㅗ", "오오 의자", "chair_o", "#7bc87c"),
    ("ㅜ", "우우 발판", "footrest_u", "#a47ad6"),
    ("ㅡ", "으으 평상", "platform_eu", "#d9a65f"),
    ("ㅣ", "이이 기둥", "pillar_i", "#f27d7d"),
    ("ㅠ", "유유 그네", "swing_yu", "#68b7c7"),
    ("ㅛ", "요요 의자", "chair_yo", "#f58fb1"),
]


def font(size: int, *, vowel: bool = False) -> ImageFont.FreeTypeFont:
    preferred = FONT_VOWEL if vowel else FONT_LABEL
    source = preferred if preferred.exists() else FONT_FALLBACK
    return ImageFont.truetype(str(source), size=size)


def rounded_rectangle(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_dashed_round_rect(draw, box, radius, color, width=7, dash=26, gap=16):
    x1, y1, x2, y2 = box
    r = radius

    def line_segments(points):
        carry = 0
        draw_on = True
        for p0, p1 in zip(points, points[1:]):
            x0, y0 = p0
            xa, ya = p1
            dist = math.hypot(xa - x0, ya - y0)
            if dist == 0:
                continue
            pos = 0
            while pos < dist:
                length = dash - carry if draw_on else gap - carry
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
                    carry = 0
                    draw_on = not draw_on

    points = []
    steps = 16
    points.extend([(x1 + r + i * ((x2 - x1 - 2 * r) / 40), y1) for i in range(41)])
    points.extend([(x2 - r + r * math.sin(i / steps * math.pi / 2), y1 + r - r * math.cos(i / steps * math.pi / 2)) for i in range(1, steps + 1)])
    points.extend([(x2, y1 + r + i * ((y2 - y1 - 2 * r) / 40)) for i in range(1, 41)])
    points.extend([(x2 - r + r * math.cos(i / steps * math.pi / 2), y2 - r + r * math.sin(i / steps * math.pi / 2)) for i in range(1, steps + 1)])
    points.extend([(x2 - r - i * ((x2 - x1 - 2 * r) / 40), y2) for i in range(1, 41)])
    points.extend([(x1 + r - r * math.sin(i / steps * math.pi / 2), y2 - r + r * math.cos(i / steps * math.pi / 2)) for i in range(1, steps + 1)])
    points.extend([(x1, y2 - r - i * ((y2 - y1 - 2 * r) / 40)) for i in range(1, 41)])
    points.extend([(x1 + r - r * math.cos(i / steps * math.pi / 2), y1 + r - r * math.sin(i / steps * math.pi / 2)) for i in range(1, steps + 1)])
    line_segments(points + [points[0]])


def draw_tool(canvas, kind, color_hex, seed):
    base = tuple(int(color_hex[i:i + 2], 16) for i in (1, 3, 5))
    dark = tuple(max(0, c - 75) for c in base)
    outline = tuple(max(0, c - 105) for c in base)
    hi = tuple(min(255, c + 58) for c in base)

    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    def part(box, radius, fill=base, width=8):
        shadow = tuple(dark) + (42,)
        sx1, sy1, sx2, sy2 = box
        rounded_rectangle(d, (sx1 + 9, sy1 + 11, sx2 + 9, sy2 + 11), radius, shadow)
        rounded_rectangle(d, box, radius, tuple(fill) + (255,), tuple(outline) + (255,), width)
        rounded_rectangle(d, (sx1 + 15, sy1 + 14, sx2 - 18, sy1 + 42), max(12, radius // 2), tuple(hi) + (155,))

    if kind == "rod_a":
        part((415, 405, 515, 945), 42)
        part((430, 515, 735, 615), 42)
    elif kind == "rod_eo":
        part((600, 405, 700, 945), 42)
        part((365, 515, 685, 615), 42)
    elif kind == "chair_o":
        part((330, 590, 790, 705), 44)
        part((630, 400, 775, 685), 48)
        part((375, 700, 490, 925), 38, tuple(max(0, c - 18) for c in base))
        part((650, 700, 765, 925), 38, tuple(max(0, c - 18) for c in base))
    elif kind == "chair_yo":
        part((315, 610, 805, 725), 44)
        part((370, 405, 500, 640), 44)
        part((620, 405, 750, 640), 44)
        part((380, 720, 500, 930), 38, tuple(max(0, c - 18) for c in base))
        part((620, 720, 740, 930), 38, tuple(max(0, c - 18) for c in base))
    elif kind == "footrest_u":
        part((315, 690, 805, 805), 44)
        part((385, 460, 505, 690), 40)
        part((615, 460, 735, 690), 40)
    elif kind == "platform_eu":
        part((230, 595, 895, 760), 62)
        part((285, 760, 395, 935), 38, tuple(max(0, c - 22) for c in base))
        part((725, 760, 835, 935), 38, tuple(max(0, c - 22) for c in base))
    elif kind == "pillar_i":
        part((485, 380, 640, 960), 56)
        part((410, 340, 715, 455), 50, tuple(min(255, c + 16) for c in base))
        part((385, 905, 740, 1015), 52, tuple(min(255, c + 16) for c in base))
    elif kind == "swing_yu":
        d.line((390, 360, 495, 765), fill=tuple(outline) + (255,), width=10)
        d.line((730, 360, 625, 765), fill=tuple(outline) + (255,), width=10)
        part((330, 765, 790, 890), 46)
        part((315, 325, 805, 420), 42, tuple(min(255, c + 10) for c in base))
        part((445, 565, 555, 765), 38)
        part((565, 565, 675, 765), 38)

    canvas.alpha_composite(layer)


def draw_label(draw, text, border_color):
    box = (238, 1222, 884, 1335)
    rounded_rectangle(draw, box, 54, (255, 255, 255, 235), None, 0)
    draw_dashed_round_rect(draw, box, 54, border_color, width=5, dash=22, gap=13)
    f = font(70)
    bbox = draw.textbbox((0, 0), text, font=f)
    x = (W - (bbox[2] - bbox[0])) / 2
    y = 1240
    draw.text((x, y), text, font=f, fill=(50, 25, 13))


def draw_top_vowel(draw, vowel, color):
    stroke = 34
    cap = 18
    cx = W // 2
    y = 95
    dark = (120, 70, 20)

    def bar(box, fill, shadow=False):
        x1, y1, x2, y2 = box
        if shadow:
            rounded_rectangle(draw, (x1 + 7, y1 + 8, x2 + 7, y2 + 8), cap, dark + (85,))
        rounded_rectangle(draw, box, cap, fill + (255,), (255, 255, 255), 5)

    def vline(x, y1, y2):
        bar((x - stroke // 2, y1, x + stroke // 2, y2), color, True)

    def hline(x1, x2, yy):
        bar((x1, yy - stroke // 2, x2, yy + stroke // 2), color, True)

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


def make_card(vowel, label, kind, color_hex, index):
    random.seed(1000 + index)
    img = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    d = ImageDraw.Draw(img)
    border_color = tuple(int(color_hex[i:i + 2], 16) for i in (1, 3, 5))
    draw_dashed_round_rect(d, (30, 35, W - 30, H - 35), 80, border_color, width=7, dash=26, gap=16)
    draw_top_vowel(d, vowel, tuple(min(255, c + 20) for c in border_color))
    draw_tool(img, kind, color_hex, 300 + index)
    draw_label(d, label, border_color)
    return img.convert("RGB")


def main():
    PUBLIC.mkdir(exist_ok=True)
    for i, item in enumerate(VOWELS):
        vowel, label, kind, color = item
        filename = f"{label}.png"
        image = make_card(vowel, label, kind, color, i)
        public_path = PUBLIC / filename
        root_path = ROOT / filename
        image.save(public_path, quality=95)
        shutil.copyfile(public_path, root_path)
        print(public_path)


if __name__ == "__main__":
    main()
