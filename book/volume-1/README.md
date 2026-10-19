# 소리나라 한글친구들 1권 인쇄 파일

`node tools/generate_book_print.mjs` 로 `print/` 폴더에 업체용 PDF를 만든다.

| 파일 | 내용 |
| --- | --- |
| `print/cover.pdf` | 뒤표지 + 책등 + 앞표지 한 장. 재단 여백 3mm 포함 |
| `print/interior.pdf` | 단원 간지 + 모든 레슨 학습지 (A4) |
| `print/dividers.pdf` | 간지 4장만 따로 |
| `print/cover-preview.png` | 재단선(빨간 점선)과 책등을 표시한 확인용 그림. 인쇄용 아님 |

- 기본값은 양면 인쇄, 100g 모조지(장당 0.11mm)로 책등 두께를 계산한다. 간지는 오른쪽 면에서 시작하고 뒷면은 비운다.
- 업체가 책등 두께를 알려 주면 `--spine 13` 처럼 넣어 표지만 다시 만든다(`--skip-interior`).
- 단면 인쇄면 `--sided single`, 종이가 다르면 `--sheet-thickness 0.13`.
- 단원 구성과 문구는 `tools/book_print_core.mjs`, 디자인은 `book.css`.
