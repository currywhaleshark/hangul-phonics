from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "video-assets" / "consonant-lesson-samples"
FRAME_DIR = OUT_DIR / "gogo-g-timed-frames"
DEFAULT_TIMINGS = Path.home() / "Downloads" / "gogo-g-card-timings (4).json"
DEFAULT_OUTPUT = OUT_DIR / "gogo-g-timed-lesson.mp4"
DEFAULT_PREVIEW = OUT_DIR / "gogo-g-timed-lesson-preview.jpg"

WIDTH = 1920
HEIGHT = 1080
FPS = 30

WORD_META = {
    "dog": {
        "label": "강아지",
        "image": "worksheets/assets/dog.png",
        "accent": (255, 132, 112),
        "position": {"left": 20, "top": 39},
    },
    "bear": {
        "label": "곰",
        "image": "worksheets/assets/bear.png",
        "accent": (255, 196, 80),
        "position": {"left": 78, "top": 40},
    },
    "meat": {
        "label": "고기",
        "image": "worksheets/assets/meat.png",
        "accent": (106, 194, 255),
        "position": {"left": 22, "top": 74},
    },
    "snack": {
        "label": "과자",
        "image": "worksheets/assets/snack.png",
        "accent": (121, 206, 145),
        "position": {"left": 78, "top": 73},
    },
    "noodles": {
        "label": "국수",
        "image": "worksheets/assets/noodles.png",
        "accent": (178, 145, 255),
        "position": {"left": 55, "top": 78},
    },
}

LETTER_FALLBACKS = [
    {"left": 48, "top": 28},
    {"left": 56, "top": 26},
    {"left": 44, "top": 27},
]


@dataclass(frozen=True)
class Cue:
    id: str
    label: str
    start: float
    end: float
    left: float
    top: float
    accent: tuple[int, int, int] = (255, 209, 102)
    image_path: Path | None = None


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


CARD_FONT = load_font(48, bold=True)
SMALL_FONT = load_font(42, bold=True)
LETTER_FONT = load_font(152, bold=True)


def ease_out_back(value: float) -> float:
    value = max(0.0, min(1.0, value))
    c1 = 1.70158
    c3 = c1 + 1
    return 1 + c3 * (value - 1) ** 3 + c1 * (value - 1) ** 2


def ease_out_cubic(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return 1 - (1 - value) ** 3


def clamp_percent(value: object, fallback: float) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        number = fallback
    return max(5.0, min(95.0, number))


def fit_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(image.convert("RGB"), size, method=Image.Resampling.LANCZOS)


def contain_rgba(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    fitted = image.convert("RGBA")
    fitted.thumbnail(size, Image.Resampling.LANCZOS)
    return fitted


def rounded_panel(size: tuple[int, int], radius: int, fill: tuple[int, int, int, int]) -> Image.Image:
    panel = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(panel)
    draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=fill)
    return panel


def paste_center(
    canvas: Image.Image,
    image: Image.Image,
    center: tuple[float, float],
    scale: float = 1.0,
    opacity: float = 1.0,
    rotation: float = 0.0,
) -> None:
    sprite = image.convert("RGBA")
    if abs(scale - 1.0) > 0.001:
        sprite = sprite.resize(
            (
                max(1, round(sprite.width * scale)),
                max(1, round(sprite.height * scale)),
            ),
            Image.Resampling.LANCZOS,
        )
    if abs(rotation) > 0.01:
        sprite = sprite.rotate(rotation, expand=True, resample=Image.Resampling.BICUBIC)
    if opacity < 0.999:
        alpha = sprite.getchannel("A").point(lambda p: int(p * opacity))
        sprite.putalpha(alpha)
    x = round(center[0] - sprite.width / 2)
    y = round(center[1] - sprite.height / 2)
    canvas.alpha_composite(sprite, (x, y))


def text_center(draw: ImageDraw.ImageDraw, xy: tuple[float, float], text: str, font: ImageFont.ImageFont, fill) -> None:
    draw.text(xy, text, font=font, fill=fill, anchor="mm")


def read_timing_project(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except UnicodeDecodeError:
        return json.loads(path.read_text(encoding="utf-8"))


def cue_time(cue: dict, key: str, fallback: float) -> float:
    try:
        return float(cue.get(key, fallback))
    except (TypeError, ValueError):
        return fallback


def normalize_word_cues(project: dict) -> list[Cue]:
    raw_cues = project.get("cues") or project.get("wordCues") or []
    normalized: list[Cue] = []
    for raw in raw_cues:
        cue_id = str(raw.get("id", ""))
        meta = WORD_META.get(cue_id)
        if not meta:
            continue
        start = cue_time(raw, "start", 0)
        end = cue_time(raw, "end", cue_time(raw, "duration", 1.2) + start)
        if end <= start:
            end = start + 1.2
        default_position = meta["position"]
        position = raw.get("position") or default_position
        normalized.append(
            Cue(
                id=cue_id,
                label=meta["label"],
                start=start,
                end=end,
                left=clamp_percent(position.get("left"), default_position["left"]),
                top=clamp_percent(position.get("top"), default_position["top"]),
                accent=meta["accent"],
                image_path=ROOT / meta["image"],
            )
        )
    return sorted(normalized, key=lambda cue: cue.start)


def normalize_letter_cues(project: dict) -> list[Cue]:
    raw_cues = project.get("letterCues") or []
    normalized: list[Cue] = []
    for index, raw in enumerate(raw_cues):
        fallback = LETTER_FALLBACKS[index % len(LETTER_FALLBACKS)]
        start = cue_time(raw, "start", 0)
        end = cue_time(raw, "end", cue_time(raw, "duration", 1.0) + start)
        if end <= start:
            end = start + 1.0
        position = raw.get("position") or fallback
        normalized.append(
            Cue(
                id=str(raw.get("id", f"letter-{index + 1}")),
                label="ㄱ",
                start=start,
                end=end,
                left=clamp_percent(position.get("left"), fallback["left"]),
                top=clamp_percent(position.get("top"), fallback["top"]),
            )
        )
    return sorted(normalized, key=lambda cue: cue.start)


def find_gogo_cat() -> Path:
    candidates = sorted((ROOT / "public" / "video-assets" / "characters" / "consonants").glob("*gogo-cat.png"))
    if candidates:
        return candidates[0]
    return ROOT / "고고 고양이.png"


def find_intro_audio() -> Path:
    audio_dir = ROOT / "lessons" / "consonants" / "lesson-01-gogo-nana"
    candidates = [path for path in audio_dir.glob("*.wav") if "," in path.name]
    if candidates:
        return candidates[0]
    raise FileNotFoundError(f"Could not find the intro WAV in {audio_dir}")


def make_word_card(cue: Cue, word_image: Image.Image) -> Image.Image:
    card_w, card_h = 310, 330
    out = Image.new("RGBA", (card_w + 44, card_h + 54), (0, 0, 0, 0))

    shadow = rounded_panel((card_w, card_h), 10, (25, 31, 43, 100)).filter(ImageFilter.GaussianBlur(14))
    out.alpha_composite(shadow, (24, 28))

    panel = rounded_panel((card_w, card_h), 8, (255, 255, 252, 248))
    draw = ImageDraw.Draw(panel)
    draw.rounded_rectangle(
        (9, 9, card_w - 10, card_h - 10),
        radius=8,
        outline=cue.accent + (255,),
        width=8,
    )
    draw.rounded_rectangle((21, 20, 82, 81), radius=8, fill=(255, 209, 102, 255), outline=(23, 34, 43, 255), width=4)
    text_center(draw, (52, 51), "ㄱ", SMALL_FONT, (23, 34, 43, 255))

    image_box = Image.new("RGBA", (236, 176), (0, 0, 0, 0))
    fitted = contain_rgba(word_image, (224, 160))
    image_box.alpha_composite(fitted, ((image_box.width - fitted.width) // 2, 8))
    panel.alpha_composite(image_box, ((card_w - image_box.width) // 2, 82))

    bbox = draw.textbbox((0, 0), cue.label, font=CARD_FONT)
    text_x = card_w / 2
    text_y = 276
    text_center(draw, (text_x + 3, text_y + 3), cue.label, CARD_FONT, (0, 0, 0, 48))
    text_center(draw, (text_x, text_y), cue.label, CARD_FONT, (45, 54, 65, 255))
    if bbox[2] - bbox[0] > card_w - 56:
        draw.line((36, 306, card_w - 36, 306), fill=cue.accent + (230,), width=7)

    out.alpha_composite(panel, (14, 8))
    return out


def make_letter_popup() -> Image.Image:
    size = 204
    out = Image.new("RGBA", (size + 48, size + 56), (0, 0, 0, 0))
    shadow = rounded_panel((size, size), 8, (25, 31, 43, 98)).filter(ImageFilter.GaussianBlur(15))
    out.alpha_composite(shadow, (26, 31))

    panel = rounded_panel((size, size), 8, (255, 209, 102, 255))
    draw = ImageDraw.Draw(panel)
    draw.rounded_rectangle((5, 5, size - 6, size - 6), radius=8, outline=(23, 34, 43, 255), width=9)
    text_center(draw, (size / 2 + 2, size / 2 + 1), "ㄱ", LETTER_FONT, (23, 34, 43, 255))
    out.alpha_composite(panel, (16, 8))
    return out


def cue_motion(cue: Cue, t: float, index: int) -> tuple[float, float, float, float, float] | None:
    if t < cue.start or t > cue.end:
        return None
    local = t - cue.start
    entry_duration = min(0.52, max(0.24, (cue.end - cue.start) * 0.32))
    if local <= entry_duration:
        progress = local / entry_duration
        scale = max(0.05, ease_out_back(progress))
        opacity = ease_out_cubic(progress / 0.62)
        y_offset = -26 * (1 - ease_out_cubic(progress))
        rotation = -5.5 * (1 - progress) + 2.0 * math.sin(progress * math.pi)
        return scale, opacity, 0.0, y_offset, rotation

    hold = local - entry_duration
    phase = index * 0.74
    scale = 1 + 0.012 * math.sin(hold * math.tau * 1.15 + phase)
    opacity = 1.0
    x_offset = 4.0 * math.sin(hold * math.tau * 0.82 + phase)
    y_offset = 5.0 * math.sin(hold * math.tau * 1.05 + phase * 0.7)
    rotation = 0.9 * math.sin(hold * math.tau * 0.88 + phase)
    return scale, opacity, x_offset, y_offset, rotation


def draw_letter_badge(canvas: Image.Image) -> None:
    badge = Image.new("RGBA", (116, 116), (0, 0, 0, 0))
    shadow = rounded_panel((96, 96), 8, (25, 31, 43, 64)).filter(ImageFilter.GaussianBlur(8))
    badge.alpha_composite(shadow, (14, 16))
    panel = rounded_panel((96, 96), 8, (255, 209, 102, 255))
    draw = ImageDraw.Draw(panel)
    draw.rounded_rectangle((4, 4, 91, 91), radius=8, outline=(23, 34, 43, 255), width=5)
    text_center(draw, (48, 48), "ㄱ", load_font(66, bold=True), (23, 34, 43, 255))
    badge.alpha_composite(panel, (6, 3))
    canvas.alpha_composite(badge, (62, 58))


def build_frames(
    project: dict,
    output: Path,
    keep_frames: bool = False,
) -> tuple[Path, float, float]:
    if FRAME_DIR.exists():
        shutil.rmtree(FRAME_DIR)
    FRAME_DIR.mkdir(parents=True, exist_ok=True)

    segment = project.get("segment") or {}
    segment_start = float(segment.get("start", 0))
    segment_end = float(segment.get("end", 35.37))
    duration = max(0.1, segment_end - segment_start)
    frame_count = math.ceil(duration * FPS)

    bg = fit_cover(Image.open(OUT_DIR / "gogo-g-background.png"), (WIDTH, HEIGHT)).convert("RGBA")
    cat = contain_rgba(Image.open(find_gogo_cat()), (560, 620))
    word_cues = normalize_word_cues(project)
    letter_cues = normalize_letter_cues(project)
    card_images = {cue.id: make_word_card(cue, Image.open(cue.image_path)) for cue in word_cues if cue.image_path}
    letter_image = make_letter_popup()

    for index in range(frame_count):
        elapsed = index / FPS
        t = segment_start + elapsed
        canvas = bg.copy()
        canvas.alpha_composite(Image.new("RGBA", (WIDTH, HEIGHT), (255, 250, 235, 42)))
        draw_letter_badge(canvas)

        cat_scale = (0.9 + 0.1 * ease_out_back(elapsed / 0.85)) * (1 + 0.012 * math.sin(elapsed * math.tau * 1.1))
        cat_x = WIDTH * 0.49 + 8 * math.sin(elapsed * math.tau * 0.56)
        cat_y = HEIGHT * 0.63 + 10 * math.sin(elapsed * math.tau * 0.72)
        paste_center(canvas, cat, (cat_x, cat_y), cat_scale, opacity=ease_out_cubic(elapsed / 0.5))

        for cue_index, cue in enumerate(word_cues):
            motion = cue_motion(cue, t, cue_index)
            if not motion:
                continue
            scale, opacity, x_offset, y_offset, rotation = motion
            x = WIDTH * cue.left / 100 + x_offset
            y = HEIGHT * cue.top / 100 + y_offset
            paste_center(canvas, card_images[cue.id], (x, y), scale, opacity, rotation)

        for cue_index, cue in enumerate(letter_cues):
            motion = cue_motion(cue, t, cue_index + 10)
            if not motion:
                continue
            scale, opacity, x_offset, y_offset, rotation = motion
            x = WIDTH * cue.left / 100 + x_offset
            y = HEIGHT * cue.top / 100 + y_offset
            paste_center(canvas, letter_image, (x, y), scale, opacity, rotation)

        frame_path = FRAME_DIR / f"frame_{index + 1:04d}.jpg"
        canvas.convert("RGB").save(frame_path, quality=91, optimize=True)

    return FRAME_DIR, segment_start, duration


def run_ffmpeg(command: list[str]) -> None:
    subprocess.run(command, cwd=ROOT, check=True)


def build_video(frames_dir: Path, audio_path: Path, output: Path, segment_start: float, duration: float) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    audio_filter = f"atrim=start={segment_start}:end={segment_start + duration},asetpts=PTS-STARTPTS"
    command = [
        "ffmpeg",
        "-y",
        "-framerate",
        str(FPS),
        "-i",
        str(frames_dir / "frame_%04d.jpg"),
        "-i",
        str(audio_path),
        "-filter:a",
        audio_filter,
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
        str(output),
    ]
    run_ffmpeg(command)


def build_preview(video_path: Path, preview_path: Path, seek_time: float = 20.8) -> None:
    command = [
        "ffmpeg",
        "-y",
        "-ss",
        f"{seek_time:.3f}",
        "-i",
        str(video_path),
        "-frames:v",
        "1",
        "-q:v",
        "2",
        "-update",
        "1",
        str(preview_path),
    ]
    run_ffmpeg(command)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Render the timed Gogo ㄱ lesson video.")
    parser.add_argument("--timings", type=Path, default=DEFAULT_TIMINGS, help="Timing JSON exported from timing-editor.html")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Output MP4 path")
    parser.add_argument("--preview", type=Path, default=DEFAULT_PREVIEW, help="Preview JPEG path")
    parser.add_argument("--preview-time", type=float, default=20.8, help="Timestamp to capture for the preview image")
    parser.add_argument("--keep-frames", action="store_true", help="Keep generated JPEG frames")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    project = read_timing_project(args.timings)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    frames_dir, segment_start, duration = build_frames(project, args.output, keep_frames=args.keep_frames)
    audio_path = find_intro_audio()
    build_video(frames_dir, audio_path, args.output, segment_start, duration)
    build_preview(args.output, args.preview, args.preview_time)
    if not args.keep_frames and frames_dir.exists():
        shutil.rmtree(frames_dir)
    print(f"video={args.output}")
    print(f"preview={args.preview}")
    print(f"duration={duration:.3f}")


if __name__ == "__main__":
    main()
