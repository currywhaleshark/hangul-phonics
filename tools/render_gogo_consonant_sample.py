from __future__ import annotations

import math
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "video-assets" / "consonant-lesson-samples"
FRAME_DIR = OUT_DIR / "gogo-g-frames"

WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION = 12.4
FRAME_COUNT = int(DURATION * FPS)


@dataclass(frozen=True)
class WordCard:
    label: str
    image_path: Path
    audio_path: Path
    start: float
    x: int
    y: int
    accent: tuple[int, int, int]


WORDS = [
    WordCard(
        label="강아지",
        image_path=ROOT / "worksheets" / "assets" / "dog.png",
        audio_path=ROOT
        / "public"
        / "audio-gemini-candidates"
        / "consonant-words"
        / "lesson-01-gogo-nana_01_강아지.mp3",
        start=3.55,
        x=278,
        y=360,
        accent=(255, 132, 112),
    ),
    WordCard(
        label="곰",
        image_path=ROOT / "worksheets" / "assets" / "bear.png",
        audio_path=ROOT
        / "public"
        / "audio-gemini-candidates"
        / "consonant-words"
        / "lesson-01-gogo-nana_02_곰.mp3",
        start=5.05,
        x=1532,
        y=360,
        accent=(255, 196, 80),
    ),
    WordCard(
        label="고기",
        image_path=ROOT / "worksheets" / "assets" / "meat.png",
        audio_path=ROOT
        / "public"
        / "audio-gemini-candidates"
        / "consonant-words"
        / "lesson-01-gogo-nana_03_고기.mp3",
        start=6.55,
        x=292,
        y=735,
        accent=(106, 194, 255),
    ),
    WordCard(
        label="과자",
        image_path=ROOT / "worksheets" / "assets" / "snack.png",
        audio_path=ROOT
        / "public"
        / "audio-gemini-candidates"
        / "consonant-words"
        / "lesson-01-gogo-nana_04_과자.mp3",
        start=8.05,
        x=1530,
        y=735,
        accent=(121, 206, 145),
    ),
    WordCard(
        label="국수",
        image_path=ROOT / "worksheets" / "assets" / "noodles.png",
        audio_path=ROOT
        / "public"
        / "audio-gemini-candidates"
        / "consonant-words"
        / "lesson-01-gogo-nana_05_국수.mp3",
        start=9.55,
        x=1138,
        y=820,
        accent=(178, 145, 255),
    ),
]


def ease_out_back(value: float) -> float:
    value = max(0.0, min(1.0, value))
    c1 = 1.70158
    c3 = c1 + 1
    return 1 + c3 * (value - 1) ** 3 + c1 * (value - 1) ** 2


def ease_out_cubic(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return 1 - (1 - value) ** 3


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/malgunbd.ttf") if bold else Path("C:/Windows/Fonts/malgun.ttf"),
        Path("C:/Windows/Fonts/NanumGothic.ttf"),
        Path("C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


TITLE_FONT = load_font(68, bold=True)
LETTER_FONT = load_font(190, bold=True)
CARD_FONT = load_font(46, bold=True)
SMALL_FONT = load_font(42, bold=True)


def fit_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(image.convert("RGB"), size, method=Image.Resampling.LANCZOS)


def contain_rgba(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    image = image.convert("RGBA")
    image.thumbnail(size, Image.Resampling.LANCZOS)
    return image


def paste_center(
    canvas: Image.Image,
    image: Image.Image,
    center: tuple[float, float],
    scale: float = 1.0,
    opacity: float = 1.0,
) -> None:
    image = image.convert("RGBA")
    if scale != 1.0:
        new_size = (
            max(1, round(image.width * scale)),
            max(1, round(image.height * scale)),
        )
        image = image.resize(new_size, Image.Resampling.LANCZOS)
    if opacity < 1.0:
        alpha = image.getchannel("A").point(lambda p: int(p * opacity))
        image.putalpha(alpha)
    x = round(center[0] - image.width / 2)
    y = round(center[1] - image.height / 2)
    canvas.alpha_composite(image, (x, y))


def rounded_panel(size: tuple[int, int], radius: int, fill: tuple[int, int, int, int]) -> Image.Image:
    panel = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(panel)
    draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=fill)
    return panel


def make_card(card: WordCard, word_image: Image.Image) -> Image.Image:
    card_w, card_h = 300, 330
    shadow = rounded_panel((card_w, card_h), 36, (54, 57, 71, 115)).filter(
        ImageFilter.GaussianBlur(16)
    )
    out = Image.new("RGBA", (card_w + 42, card_h + 52), (0, 0, 0, 0))
    out.alpha_composite(shadow, (22, 26))

    panel = rounded_panel((card_w, card_h), 36, (255, 255, 250, 244))
    panel_draw = ImageDraw.Draw(panel)
    panel_draw.rounded_rectangle(
        (10, 10, card_w - 11, card_h - 11),
        radius=30,
        outline=card.accent + (255,),
        width=8,
    )
    panel_draw.ellipse((22, 20, 88, 86), fill=card.accent + (255,))
    panel_draw.text((55, 51), "ㄱ", font=SMALL_FONT, fill=(255, 255, 255), anchor="mm")

    image_box = Image.new("RGBA", (230, 180), (0, 0, 0, 0))
    fitted = contain_rgba(word_image, (218, 165))
    image_box.alpha_composite(fitted, ((image_box.width - fitted.width) // 2, 8))
    panel.alpha_composite(image_box, ((card_w - image_box.width) // 2, 74))

    text_draw = ImageDraw.Draw(panel)
    bbox = text_draw.textbbox((0, 0), card.label, font=CARD_FONT)
    text_x = (card_w - (bbox[2] - bbox[0])) // 2
    text_y = 250
    text_draw.text((text_x + 3, text_y + 3), card.label, font=CARD_FONT, fill=(0, 0, 0, 55))
    text_draw.text((text_x, text_y), card.label, font=CARD_FONT, fill=(55, 64, 76))

    out.alpha_composite(panel, (14, 8))
    return out


def draw_top_title(canvas: Image.Image, t: float) -> None:
    intro_alpha = ease_out_cubic(t / 0.7)
    panel_w, panel_h = 780, 116
    panel = rounded_panel((panel_w, panel_h), 50, (255, 255, 255, round(224 * intro_alpha)))
    draw = ImageDraw.Draw(panel)
    draw.rounded_rectangle(
        (8, 8, panel_w - 9, panel_h - 9),
        radius=44,
        outline=(255, 169, 91, round(255 * intro_alpha)),
        width=6,
    )
    draw.text(
        (panel_w // 2 + 3, panel_h // 2 + 3),
        "고고 고양이  ㄱ",
        font=TITLE_FONT,
        fill=(0, 0, 0, round(45 * intro_alpha)),
        anchor="mm",
    )
    draw.text(
        (panel_w // 2, panel_h // 2),
        "고고 고양이  ㄱ",
        font=TITLE_FONT,
        fill=(68, 73, 88, round(255 * intro_alpha)),
        anchor="mm",
    )
    canvas.alpha_composite(panel, ((WIDTH - panel_w) // 2, 28))


def draw_letter_bubble(canvas: Image.Image, t: float) -> None:
    pulse = 1 + 0.04 * math.sin(t * math.tau * 1.25)
    size = round(178 * pulse)
    bubble = Image.new("RGBA", (size + 38, size + 38), (0, 0, 0, 0))
    draw = ImageDraw.Draw(bubble)
    draw.ellipse((20, 24, size + 20, size + 24), fill=(49, 55, 70, 58))
    draw.ellipse((10, 8, size + 10, size + 8), fill=(255, 238, 127, 244))
    draw.ellipse((22, 20, size - 2, size), outline=(255, 159, 70, 255), width=8)
    draw.text(
        ((size + 20) / 2, (size + 18) / 2),
        "ㄱ",
        font=LETTER_FONT,
        fill=(58, 67, 84),
        anchor="mm",
    )
    paste_center(canvas, bubble, (1500, 168 + 7 * math.sin(t * math.tau * 0.8)))


def render_frames() -> None:
    if FRAME_DIR.exists():
        shutil.rmtree(FRAME_DIR)
    FRAME_DIR.mkdir(parents=True, exist_ok=True)

    background = fit_cover(OUT_DIR / "gogo-g-background.png", (WIDTH, HEIGHT)) if False else None


def build_frames() -> None:
    if FRAME_DIR.exists():
        shutil.rmtree(FRAME_DIR)
    FRAME_DIR.mkdir(parents=True, exist_ok=True)

    bg = fit_cover(Image.open(OUT_DIR / "gogo-g-background.png"), (WIDTH, HEIGHT))
    cat = contain_rgba(
        Image.open(ROOT / "public" / "video-assets" / "characters" / "consonants" / "ㄱ-gogo-cat.png"),
        (600, 660),
    )
    cards = [(word, make_card(word, Image.open(word.image_path))) for word in WORDS]

    for index in range(FRAME_COUNT):
        t = index / FPS
        canvas = bg.copy().convert("RGBA")

        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (255, 248, 231, 44))
        canvas.alpha_composite(overlay)

        draw_top_title(canvas, t)
        # Title and Gogo already carry the ㄱ shape; keep the scene uncluttered.

        cat_intro = ease_out_back(t / 0.82)
        cat_scale = (0.72 + 0.28 * cat_intro) * (1 + 0.018 * math.sin(t * math.tau * 1.35))
        cat_x = WIDTH / 2 + 12 * math.sin(t * math.tau * 0.55)
        cat_y = 575 + 11 * math.sin(t * math.tau * 0.72)
        paste_center(canvas, cat, (cat_x, cat_y), cat_scale, opacity=ease_out_cubic(t / 0.45))

        for word, card_image in cards:
            local = t - word.start
            if local < -0.03:
                continue
            pop = ease_out_back(local / 0.38)
            hold_bob = 1 + 0.018 * math.sin((t - word.start) * math.tau * 1.1)
            scale = max(0.02, pop) * hold_bob
            opacity = ease_out_cubic(local / 0.25)
            y = word.y - 32 * (1 - ease_out_cubic(local / 0.45)) + 6 * math.sin(t * math.tau * 0.74 + word.x)
            x = word.x + 5 * math.sin(t * math.tau * 0.52 + word.y)
            paste_center(canvas, card_image, (x, y), scale, opacity)

        frame_path = FRAME_DIR / f"frame_{index + 1:04d}.jpg"
        canvas.convert("RGB").save(frame_path, quality=91, optimize=True)


def run_ffmpeg(command: list[str]) -> None:
    subprocess.run(command, cwd=ROOT, check=True)


def build_audio() -> Path:
    audio_out = OUT_DIR / "gogo-g-audio.m4a"
    intro_video = ROOT / "public" / "video-assets" / "consonant-simple-video" / "g-sound-popup-sample" / "g-popup-sample.mp4"
    command = ["ffmpeg", "-y", "-i", str(intro_video)]
    for word in WORDS:
        command += ["-i", str(word.audio_path)]

    filters = ["[0:a]atrim=0:3.22898,asetpts=PTS-STARTPTS[a0]"]
    labels = ["[a0]"]
    for index, word in enumerate(WORDS, start=1):
        delay_ms = round(word.start * 1000)
        filters.append(f"[{index}:a]adelay={delay_ms}:all=1[a{index}]")
        labels.append(f"[a{index}]")
    filters.append(
        "".join(labels)
        + f"amix=inputs={len(labels)}:duration=longest:normalize=0,apad=pad_dur=4,atrim=0:{DURATION}[aout]"
    )

    command += [
        "-filter_complex",
        ";".join(filters),
        "-map",
        "[aout]",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        str(audio_out),
    ]
    run_ffmpeg(command)
    return audio_out


def build_video(audio_path: Path) -> Path:
    video_out = OUT_DIR / "gogo-g-sample.mp4"
    command = [
        "ffmpeg",
        "-y",
        "-framerate",
        str(FPS),
        "-i",
        str(FRAME_DIR / "frame_%04d.jpg"),
        "-i",
        str(audio_path),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-r",
        str(FPS),
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        str(video_out),
    ]
    run_ffmpeg(command)
    return video_out


def build_preview(video_path: Path) -> Path:
    preview = OUT_DIR / "gogo-g-sample-preview.jpg"
    command = [
        "ffmpeg",
        "-y",
        "-ss",
        "6.8",
        "-i",
        str(video_path),
        "-frames:v",
        "1",
        "-q:v",
        "2",
        "-update",
        "1",
        str(preview),
    ]
    run_ffmpeg(command)
    return preview


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    build_frames()
    audio_path = build_audio()
    video_path = build_video(audio_path)
    preview_path = build_preview(video_path)
    if FRAME_DIR.exists():
        shutil.rmtree(FRAME_DIR)
    audio_path.unlink(missing_ok=True)
    print(f"video={video_path}")
    print(f"preview={preview_path}")


if __name__ == "__main__":
    main()
