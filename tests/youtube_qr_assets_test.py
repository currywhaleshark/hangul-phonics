from __future__ import annotations

import re
import sys
from pathlib import Path

from reportlab.graphics.barcode import qrencoder

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import generate_youtube_qr_assets as qr_assets


def reportlab_modules(payload: str) -> list[list[bool]]:
    qr = qrencoder.QRCode(qr_assets.VERSION, qrencoder.QRErrorCorrectLevel.M)
    qr.addData(payload)
    qr.make()
    return [[bool(cell) for cell in row] for row in qr.modules]


def svg_modules(path: Path) -> set[tuple[int, int]]:
    svg = path.read_text(encoding="utf-8")
    return {
        (int(col) - qr_assets.QUIET_ZONE, int(row) - qr_assets.QUIET_ZONE)
        for col, row in re.findall(r'<rect x="(\d+)" y="(\d+)" width="1" height="1"/>', svg)
    }


def dark_modules(modules: list[list[bool]]) -> set[tuple[int, int]]:
    return {(col, row) for row, line in enumerate(modules) for col, value in enumerate(line) if value}


def test_generated_qr_matches_reportlab_encoder() -> None:
    entry = next(video for video in qr_assets.SYLLABLE_VIDEO_ENTRIES if video[0] == "kelf8prIzZs")
    video_id, _title = entry
    url = f"https://www.youtube.com/watch?v={video_id}"
    assert svg_modules(Path(f"public/qr/youtube/{video_id}.svg")) == dark_modules(reportlab_modules(url))


def test_reportlab_qr_uses_expected_version_size() -> None:
    modules = reportlab_modules("https://www.youtube.com/watch?v=kelf8prIzZs")
    assert len(modules) == qr_assets.SIZE
    assert all(len(row) == qr_assets.SIZE for row in modules)


test_generated_qr_matches_reportlab_encoder()
test_reportlab_qr_uses_expected_version_size()
