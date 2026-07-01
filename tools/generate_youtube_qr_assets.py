from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw
from reportlab.graphics.barcode import qrencoder

sys.dont_write_bytecode = True

VERSION = 6
SIZE = 21 + 4 * (VERSION - 1)
QUIET_ZONE = 4
SCALE = 24
PLAYLIST_ID = "PL0u1NTgEz-xFjU8_KXoKUDf1AwcnOBfC0"
FEED_URL = f"https://www.youtube.com/feeds/videos.xml?playlist_id={PLAYLIST_ID}&max-results=50"
QR_DIR = Path("public/qr/youtube")
MANIFEST_PATH = QR_DIR / "manifest.json"

SYLLABLE_VIDEO_ENTRIES = [
    ("kelf8prIzZs", "고고 고양이와 아아 나뭇가지 | ㄱ+ㅏ=가"),
    ("sE3Jg8d3sVY", "고고 고양이와 오오 상자 | ㄱ+ㅗ=고"),
    ("pyCIALZkmWE", "나나 나비와 아아 나뭇가지 | ㄴ+ㅏ=나"),
    ("KCIuIU02VY0", "나나 나비와 오오 상자 | ㄴ+ㅗ=노"),
    ("Hn75Y3buYKM", "미미 문어와 아아 나뭇가지 | ㅁ+ㅏ=마"),
    ("MvawirDWxi0", "미미 문어와 오오 상자 | ㅁ+ㅗ=모"),
    ("_gwoud3LLY0", "부부 부엉이와 아아 나뭇가지 | ㅂ+ㅏ=바"),
    ("Mrc6LVK_cCo", "부부 부엉이와 오오 상자 | ㅂ+ㅗ=보"),
    ("HbqQr3GkrM4", "도도 도토리와 아아 나뭇가지 | ㄷ+ㅏ=다"),
    ("u9MoqgDZVrM", "도도 도토리와 오오 상자 | ㄷ+ㅗ=도"),
    ("BorMu32CkVg", "라라 리본과 아아 나뭇가지 | ㄹ+ㅏ=라"),
    ("u87LLzQ1LD4", "라라 리본과 오오 상자 | ㄹ+ㅗ=로"),
    ("pw8Y4tBPc8g", "사사 사슴과 아아 나뭇가지 | ㅅ+ㅏ=사"),
    ("uH7yFiacwhI", "사사 사슴과 오오 상자 | ㅅ+ㅗ=소"),
    ("E-A_L0fKROs", "하하 하마와 아아 나뭇가지 | ㅎ+ㅏ=하"),
    ("90LTsoehtEE", "하하 하마와 오오 상자 | ㅎ+ㅗ=호"),
    ("uEHrSncgf4c", "지지 지렁이와 아아 나뭇가지 | ㅈ+ㅏ=자"),
    ("K5d67yqyz38", "지지 지렁이와 오오 상자 | ㅈ+ㅗ=조"),
    ("wz-3bVHwoK0", "치치 칙폭이와 아아 나뭇가지 | ㅊ+ㅏ=차"),
    ("0R79bKEtWyY", "치치 칙폭이와 오오 상자 | ㅊ+ㅗ=초"),
    ("RfswEZUIwD8", "코코 코알라와 아아 나뭇가지 | ㅋ+ㅏ=카"),
    ("s3-kXgPOD5w", "코코 코알라와 오오 상자 | ㅋ+ㅗ=코"),
    ("A0xCq0A_p7Q", "토토 토끼와 아아 나뭇가지 | ㅌ+ㅏ=타"),
    ("XJ6BeuG5usk", "토토 토끼와 오오 상자 | ㅌ+ㅗ=토"),
    ("EfK79cZhmh4", "푸푸 풍선과 아아 나뭇가지 | ㅍ+ㅏ=파"),
    ("f0DpJkwnBiM", "푸푸 풍선과 오오 상자 | ㅍ+ㅗ=포"),
]


def make_qr(payload: str) -> tuple[list[list[bool]], int, int]:
    qr = qrencoder.QRCode(VERSION, qrencoder.QRErrorCorrectLevel.M)
    qr.addData(payload)
    mask = qr.getBestMaskPattern()
    qr.makeImpl(False, mask)
    modules = [[bool(cell) for cell in row] for row in qr.modules]
    if qr.getModuleCount() != SIZE:
        raise RuntimeError(f"unexpected QR size {qr.getModuleCount()}, expected {SIZE}")
    return modules, mask, int(qrencoder.QRUtil.getLostPoint(qr))


def write_svg(path: Path, modules: list[list[bool]]) -> None:
    output_size = SIZE + QUIET_ZONE * 2
    lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {output_size} {output_size}" shape-rendering="crispEdges">',
        '<rect width="100%" height="100%" fill="#fff"/>',
        '<g fill="#000">',
    ]
    for row in range(SIZE):
        for col in range(SIZE):
            if modules[row][col]:
                lines.append(f'<rect x="{col + QUIET_ZONE}" y="{row + QUIET_ZONE}" width="1" height="1"/>')
    lines.extend(["</g>", "</svg>"])
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_png(path: Path, modules: list[list[bool]]) -> None:
    output_size = (SIZE + QUIET_ZONE * 2) * SCALE
    image = Image.new("RGB", (output_size, output_size), "white")
    draw = ImageDraw.Draw(image)
    for row in range(SIZE):
        for col in range(SIZE):
            if modules[row][col]:
                x0 = (col + QUIET_ZONE) * SCALE
                y0 = (row + QUIET_ZONE) * SCALE
                draw.rectangle((x0, y0, x0 + SCALE - 1, y0 + SCALE - 1), fill="black")
    image.save(path)


def relative(path: Path) -> str:
    return path.as_posix()


def build_entry(video_id: str, title: str) -> dict[str, object]:
    url = f"https://www.youtube.com/watch?v={video_id}"
    modules, mask, penalty = make_qr(url)
    png_path = QR_DIR / f"{video_id}.png"
    svg_path = QR_DIR / f"{video_id}.svg"
    write_png(png_path, modules)
    write_svg(svg_path, modules)
    return {
        "videoId": video_id,
        "title": title,
        "url": url,
        "qrPng": relative(png_path),
        "qrSvg": relative(svg_path),
        "qrVersion": VERSION,
        "errorCorrection": "M",
        "mask": mask,
        "penalty": penalty,
        "source": "syllable-playlist",
    }


def load_manifest() -> dict[str, object]:
    if MANIFEST_PATH.exists():
        return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    return {"playlistId": PLAYLIST_ID, "feedUrl": FEED_URL, "entries": []}


def main() -> None:
    QR_DIR.mkdir(parents=True, exist_ok=True)
    manifest = load_manifest()
    manifest["playlistId"] = PLAYLIST_ID
    manifest["feedUrl"] = FEED_URL

    existing_entries = manifest.get("entries", [])
    entries_by_id = {entry["videoId"]: entry for entry in existing_entries}
    ordered_ids = [entry["videoId"] for entry in existing_entries]

    for video_id, title in SYLLABLE_VIDEO_ENTRIES:
        generated = build_entry(video_id, title)
        if video_id not in entries_by_id:
            ordered_ids.append(video_id)
        entries_by_id[video_id] = {**entries_by_id.get(video_id, {}), **generated}

    manifest["entries"] = [entries_by_id[video_id] for video_id in ordered_ids]
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(SYLLABLE_VIDEO_ENTRIES)} syllable QR entries to {MANIFEST_PATH}")


if __name__ == "__main__":
    main()