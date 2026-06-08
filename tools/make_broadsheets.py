from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "outputs"
OUT_DIR.mkdir(exist_ok=True)

DPI = 300
A2_PORTRAIT = (4961, 7016)
A2_LANDSCAPE = (7016, 4961)

CARDS = {
    "ㄱ": "고고 고양이.png",
    "ㄴ": "나나 나비.png",
    "ㄷ": "도도 도토리.png",
    "ㄹ": "라라 리본.png",
    "ㅁ": "미미 문어.png",
    "ㅂ": "부부 부엉이.png",
    "ㅅ": "사사 사슴.png",
    "ㅇ": "아아 아기.png",
    "ㅈ": "지지 지렁이.png",
    "ㅊ": "치치 칙폭이.png",
    "ㅋ": "코코 코알라.png",
    "ㅌ": "토토 토끼.png",
    "ㅍ": "푸푸 풍선.png",
    "ㅎ": "하하 하마.png",
}

PORTRAIT_ORDER = [
    ["ㄱ", "ㄴ", "ㄷ", "ㄹ"],
    ["ㅁ", "ㅂ", "ㅅ", "ㅇ"],
    ["ㅈ", "ㅊ", "ㅋ", "ㅌ"],
    ["ㅍ", None, None, "ㅎ"],
]

LANDSCAPE_ORDER = [
    ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ"],
    ["ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"],
]

INK = (57, 42, 34)
MUTED = (124, 101, 82)
PAPER = (255, 250, 241)
LINE = (244, 171, 70)
WHITE = (255, 255, 255)


def font(size, bold=False):
    names = [
        "malgunbd.ttf" if bold else "malgun.ttf",
        "NanumGothicBold.ttf" if bold else "NanumGothic.ttf",
        "arialbd.ttf" if bold else "arial.ttf",
    ]
    for name in names:
        path = Path("C:/Windows/Fonts") / name
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


TITLE_FONT = font(210, True)
SUBTITLE_FONT = font(72)
BADGE_FONT = font(84, True)


def dashed_round_rect(draw, xy, radius, dash, gap, fill, outline, width):
    draw.rounded_rectangle(xy, radius=radius, fill=fill)
    x1, y1, x2, y2 = xy
    x = x1 + radius
    while x < x2 - radius:
        draw.line((x, y1, min(x + dash, x2 - radius), y1), fill=outline, width=width)
        draw.line((x, y2, min(x + dash, x2 - radius), y2), fill=outline, width=width)
        x += dash + gap
    y = y1 + radius
    while y < y2 - radius:
        draw.line((x1, y, x1, min(y + dash, y2 - radius)), fill=outline, width=width)
        draw.line((x2, y, x2, min(y + dash, y2 - radius)), fill=outline, width=width)
        y += dash + gap


def fit_card(card_path, box_size):
    card = Image.open(card_path).convert("RGB")
    card.thumbnail(box_size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", box_size, WHITE)
    x = (box_size[0] - card.width) // 2
    y = (box_size[1] - card.height) // 2
    canvas.paste(card, (x, y))
    return canvas


def draw_card(draw, base, consonant, x, y, w, h):
    card = fit_card(ROOT / CARDS[consonant], (w, h))
    base.paste(card, (x, y))
    draw.rounded_rectangle((x + 26, y + 26, x + 126, y + 126), radius=50, fill=LINE)
    bbox = draw.textbbox((0, 0), consonant, font=BADGE_FONT)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((x + 76 - tw / 2, y + 74 - th / 2 - 8), consonant, fill=WHITE, font=BADGE_FONT)


def draw_empty(draw, x, y, w, h):
    draw.rounded_rectangle(
        (x, y, x + w, y + h),
        radius=32,
        fill=(255, 245, 224),
        outline=(238, 204, 148),
        width=8,
    )


def render(filename, size, order, title, subtitle, margin, title_h, gap):
    img = Image.new("RGB", size, PAPER)
    draw = ImageDraw.Draw(img)
    W, H = size

    dashed_round_rect(
        draw,
        (margin // 2, margin // 2, W - margin // 2, H - margin // 2),
        radius=90,
        dash=78,
        gap=44,
        fill=PAPER,
        outline=LINE,
        width=18,
    )

    draw.text((margin, margin), title, fill=INK, font=TITLE_FONT)
    draw.text((margin + 8, margin + 250), subtitle, fill=MUTED, font=SUBTITLE_FONT)

    rows = len(order)
    cols = len(order[0])
    grid_x = margin
    grid_y = margin + title_h
    grid_w = W - margin * 2
    grid_h = H - grid_y - margin
    cell_w = (grid_w - gap * (cols - 1)) // cols
    cell_h = (grid_h - gap * (rows - 1)) // rows

    for r, row in enumerate(order):
        for c, consonant in enumerate(row):
            x = grid_x + c * (cell_w + gap)
            y = grid_y + r * (cell_h + gap)
            if consonant is None:
                draw_empty(draw, x, y, cell_w, cell_h)
            else:
                draw_card(draw, img, consonant, x, y, cell_w, cell_h)

    path = OUT_DIR / filename
    img.save(path, dpi=(DPI, DPI), quality=95)
    return path


def main():
    portrait = render(
        "hangul-phonics-broadsheet-A-4x4.png",
        A2_PORTRAIT,
        PORTRAIT_ORDER,
        "한글 파닉스",
        "자음순 브로마이드",
        margin=250,
        title_h=620,
        gap=56,
    )
    landscape = render(
        "hangul-phonics-broadsheet-B-7x2.png",
        A2_LANDSCAPE,
        LANDSCAPE_ORDER,
        "한글 파닉스",
        "ㄱ부터 ㅎ까지 자음순",
        margin=250,
        title_h=560,
        gap=46,
    )
    print(portrait)
    print(landscape)


if __name__ == "__main__":
    main()
