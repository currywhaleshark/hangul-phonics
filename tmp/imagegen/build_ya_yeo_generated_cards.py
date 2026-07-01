# -*- coding: utf-8 -*-
from pathlib import Path
from math import cos, sin, pi

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
FONT_BOLD = Path("C:/Windows/Fonts/malgunbd.ttf")

CARD_SIZE = (1122, 1402)
HERO_SIZE = (1254, 1254)
PAPER = (255, 254, 250)
DARK = (55, 26, 10, 255)


def load_font(size):
    return ImageFont.truetype(str(FONT_BOLD), size)


def blend_circle(draw, center, radius, fill):
    x, y = center
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=fill)


def draw_dashed_line(draw, start, end, fill, width=7, dash=30, gap=18):
    x1, y1 = start
    x2, y2 = end
    dx = x2 - x1
    dy = y2 - y1
    length = (dx * dx + dy * dy) ** 0.5
    if not length:
        return
    ux = dx / length
    uy = dy / length
    pos = 0
    while pos < length:
        stop = min(length, pos + dash)
        sx, sy = x1 + ux * pos, y1 + uy * pos
        ex, ey = x1 + ux * stop, y1 + uy * stop
        draw.line((sx, sy, ex, ey), fill=fill, width=width)
        blend_circle(draw, (sx, sy), width / 2, fill)
        blend_circle(draw, (ex, ey), width / 2, fill)
        pos += dash + gap


def draw_dashed_arc(draw, box, start_deg, end_deg, fill, width=7, dash=30, gap=18):
    left, top, right, bottom = box
    rx = (right - left) / 2
    ry = (bottom - top) / 2
    cx = left + rx
    cy = top + ry
    radius = (rx + ry) / 2
    start = start_deg * pi / 180
    end = end_deg * pi / 180
    arc_length = abs(end - start) * radius
    pos = 0
    last = None
    while pos < arc_length:
        stop = min(arc_length, pos + dash)
        points = []
        steps = max(4, int((stop - pos) / 3))
        for step in range(steps + 1):
            t = pos + (stop - pos) * step / steps
            angle = start + (end - start) * (t / arc_length if arc_length else 0)
            points.append((cx + cos(angle) * rx, cy + sin(angle) * ry))
        if len(points) > 1:
            draw.line(points, fill=fill, width=width)
            if last is None:
                blend_circle(draw, points[0], width / 2, fill)
            blend_circle(draw, points[-1], width / 2, fill)
        last = points[-1] if points else last
        pos += dash + gap


def draw_dashed_round_rect(draw, xy, radius, fill, width=7):
    x1, y1, x2, y2 = xy
    draw_dashed_line(draw, (x1 + radius, y1), (x2 - radius, y1), fill, width)
    draw_dashed_line(draw, (x2, y1 + radius), (x2, y2 - radius), fill, width)
    draw_dashed_line(draw, (x2 - radius, y2), (x1 + radius, y2), fill, width)
    draw_dashed_line(draw, (x1, y2 - radius), (x1, y1 + radius), fill, width)
    draw_dashed_arc(draw, (x1, y1, x1 + radius * 2, y1 + radius * 2), 180, 270, fill, width)
    draw_dashed_arc(draw, (x2 - radius * 2, y1, x2, y1 + radius * 2), 270, 360, fill, width)
    draw_dashed_arc(draw, (x2 - radius * 2, y2 - radius * 2, x2, y2), 0, 90, fill, width)
    draw_dashed_arc(draw, (x1, y2 - radius * 2, x1 + radius * 2, y2), 90, 180, fill, width)


def draw_outer_border(image, accent):
    draw = ImageDraw.Draw(image, "RGBA")
    margin = 30
    radius = 66
    draw_dashed_round_rect(
        draw,
        (margin, margin, image.width - margin, image.height - margin),
        radius,
        accent,
        width=7,
    )


def distance_from_white(pixel):
    r, g, b = pixel[:3]
    return ((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2) ** 0.5


def cutout_from_white(image_path, padding=16, threshold=18):
    src = Image.open(image_path).convert("RGBA")
    pixels = src.load()
    alpha = Image.new("L", src.size, 0)
    alpha_pixels = alpha.load()
    min_x, min_y = src.width, src.height
    max_x, max_y = -1, -1

    for y in range(src.height):
        for x in range(src.width):
            d = distance_from_white(pixels[x, y])
            if d <= threshold:
                a = 0
            elif d >= 80:
                a = 255
            else:
                a = int((d - threshold) / (80 - threshold) * 255)
            alpha_pixels[x, y] = a
            if a > 8:
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)

    src.putalpha(alpha)
    if max_x < min_x:
        return src

    box = (
        max(0, min_x - padding),
        max(0, min_y - padding),
        min(src.width, max_x + padding),
        min(src.height, max_y + padding),
    )
    return src.crop(box)


def fit(image, max_size):
    max_w, max_h = max_size
    scale = min(max_w / image.width, max_h / image.height)
    size = (round(image.width * scale), round(image.height * scale))
    return image.resize(size, Image.Resampling.LANCZOS)


def paste_center(base, overlay, center_x, top_y):
    x = round(center_x - overlay.width / 2)
    base.alpha_composite(overlay, (x, round(top_y)))


def draw_centered_text(draw, text, font, box, fill):
    left, top, right, bottom = box
    text_box = draw.textbbox((0, 0), text, font=font)
    tw = text_box[2] - text_box[0]
    th = text_box[3] - text_box[1]
    x = left + (right - left - tw) / 2 - text_box[0]
    y = top + (bottom - top - th) / 2 - text_box[1] - 4
    draw.text((x, y), text, font=font, fill=fill)


def label_box_for_text(draw, text, font):
    text_box = draw.textbbox((0, 0), text, font=font)
    text_w = text_box[2] - text_box[0]
    width = max(680, min(860, text_w + 150))
    height = 126
    x1 = (CARD_SIZE[0] - width) / 2
    y1 = 1210
    return (x1, y1, x1 + width, y1 + height)


def make_card(source_path, output_path, glyph, label, accent, object_max):
    card = Image.new("RGBA", CARD_SIZE, PAPER + (255,))
    draw_outer_border(card, accent)
    draw = ImageDraw.Draw(card, "RGBA")

    glyph_font = load_font(164)
    glyph_box = draw.textbbox((0, 0), glyph, font=glyph_font)
    glyph_x = (CARD_SIZE[0] - (glyph_box[2] - glyph_box[0])) / 2 - glyph_box[0]
    glyph_y = 82 - glyph_box[1]
    shadow = (74, 39, 11, 180) if accent[0] > accent[2] else (63, 42, 19, 160)
    draw.text((glyph_x + 9, glyph_y + 9), glyph, font=glyph_font, fill=shadow)
    draw.text((glyph_x, glyph_y), glyph, font=glyph_font, fill=accent)

    cutout = cutout_from_white(source_path)
    object_image = fit(cutout, object_max)
    paste_center(card, object_image, CARD_SIZE[0] / 2, 332)

    label_font = load_font(74)
    label_box = label_box_for_text(draw, label, label_font)
    draw_dashed_round_rect(draw, label_box, 46, accent, width=6)
    draw_centered_text(draw, label, label_font, label_box, DARK)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    card.convert("RGB").save(output_path)
    return card


def draw_soft_shadow(base, center, radius, fill):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    cx, cy = center
    rx, ry = radius
    for i in range(18, 0, -1):
        alpha = int(fill[3] * (i / 18) ** 2)
        draw.ellipse((cx - rx * i / 18, cy - ry * i / 18, cx + rx * i / 18, cy + ry * i / 18), fill=fill[:3] + (alpha,))
    base.alpha_composite(layer)


def make_hero(source_path, output_path, accent, object_max, object_center_x, object_top_y):
    hero = Image.new("RGBA", HERO_SIZE, PAPER + (255,))
    draw_outer_border(hero, accent)
    draw_soft_shadow(hero, (402, 1118), (300, 34), (206, 157, 104, 35))
    draw_soft_shadow(hero, (905, 1040), (170, 28), (206, 157, 104, 35))

    baby = cutout_from_white(ROOT / "public" / "아아 아기.png", padding=4, threshold=16)
    baby = baby.crop((220, 65, min(baby.width, 900), min(baby.height, 1135)))
    baby = fit(baby, (620, 910))
    hero.alpha_composite(baby, (78, 238))

    tool = fit(cutout_from_white(source_path), object_max)
    paste_center(hero, tool, object_center_x, object_top_y)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    hero.convert("RGB").save(output_path)
    return hero


def make_preview(images):
    width = 940
    height = 470
    preview = Image.new("RGB", (width, height), (255, 255, 255))
    x = 18
    for image in images:
        thumb = image.convert("RGB").resize((440, 440), Image.Resampling.LANCZOS)
        preview.paste(thumb, (x, 15))
        x += 455
    preview.save(ROOT / "tmp" / "imagegen" / "ya-yeo-generated-preview.png")


def main():
    ya_source = ROOT / "tmp" / "imagegen" / "generated-ya-branch-source.png"
    yeo_source = ROOT / "tmp" / "imagegen" / "generated-yeo-balloon-source.png"

    ya_accent = (248, 151, 31, 255)
    yeo_accent = (88, 163, 241, 255)

    ya_card = make_card(
        ya_source,
        ROOT / "야야 두 나뭇가지 새생성.png",
        "ㅑ",
        "야야 두 나뭇가지",
        ya_accent,
        (610, 770),
    )
    yeo_card = make_card(
        yeo_source,
        ROOT / "여여 두 풍선 새생성.png",
        "ㅕ",
        "여여 두 풍선",
        yeo_accent,
        (640, 790),
    )

    make_hero(
        ya_source,
        ROOT / "tmp" / "imagegen" / "아아 아기 야 새생성.png",
        ya_accent,
        (470, 815),
        915,
        220,
    )
    make_hero(
        yeo_source,
        ROOT / "tmp" / "imagegen" / "아아 아기 여 새생성.png",
        yeo_accent,
        (500, 815),
        900,
        210,
    )
    make_preview([ya_card, yeo_card])

    print("wrote 야야 두 나뭇가지 새생성.png")
    print("wrote 여여 두 풍선 새생성.png")
    print("wrote tmp/imagegen/아아 아기 야 새생성.png")
    print("wrote tmp/imagegen/아아 아기 여 새생성.png")
    print("wrote tmp/imagegen/ya-yeo-generated-preview.png")


if __name__ == "__main__":
    main()

