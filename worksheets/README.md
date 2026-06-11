# 한글 파닉스 A4 파일럿 학습지

## 현재 시안

- `pilot-a4.html`: 인쇄용 A4 5장 HTML 시안
- `pilot-a4.css`: A4 화면/인쇄 스타일
- `image-asset-plan.md`: 신규 단어 카드 이미지 목록과 생성 프롬프트 계획

## 첫 파일럿 구성

1. 고고 고양이: 캐릭터, ㄱ 길, 손가락 따라가기
2. 고고의 친구와 좋아하는 것: ㄱ 첫소리 단어 카드
3. 나나 나비: 캐릭터, ㄴ 길이 있는 나무, 손가락 따라가기
4. 나나의 친구와 좋아하는 것: ㄴ 첫소리 단어 카드
5. 누구의 집일까?: ㄱ/ㄴ 분류 활동

## Docs 제작 경로

지금은 빠른 수정이 쉬운 HTML 시안으로 레이아웃과 흐름을 먼저 고정한다. 그림팩이 들어가고 문구가 확정되면 같은 구조를 DOCX로 재작성한 뒤 Google Docs로 가져가서 수정 가능한 최종본으로 만든다.

## JSON 기반 DOCX 생성

- `data/pilot-lesson.json`: 현재 5장 파일럿 학습지의 원본 데이터
- `../tools/generate_worksheet_docs.cjs`: JSON을 A4 DOCX로 변환하는 생성기
- `../outputs/pilot-lesson.docx`: 생성된 Google Docs import 후보 파일

생성 명령:

```bash
node tools/generate_worksheet_docs.cjs --input worksheets/data/pilot-lesson.json --output outputs/pilot-lesson.docx
```

검증 명령:

```bash
node tests/generate_worksheet_docs.test.cjs
```

## HTML 학습지 편집기

- `editor.html`: 브라우저에서 쓰는 로컬 편집기
- `worksheet-renderer.js`: JSON을 인쇄용 HTML로 바꾸는 공통 렌더러
- 편집기는 `../lessons/consonants/manifest.json`의 레슨 목록을 불러오고, 선택한 레슨의 `worksheet.json`을 편집한다.
- 레슨별 임시 편집본은 브라우저 임시 저장소에 따로 자동 저장한다.
- 상단의 `JSON`, `HTML`, `PNG`, `인쇄` 버튼으로 수정본을 내려받거나 페이지별 PNG를 저장하거나 바로 인쇄한다.

실행:

```bash
npm run dev
```

브라우저에서 열기:

```text
http://localhost:3000/worksheets/editor.html
```

## 자음 레슨 폴더

자음 친구들은 두 명씩 묶어 `../lessons/consonants/lesson-*` 폴더로 관리한다. 각 폴더에는 다음 파일이 들어간다.

- `../lessons/consonants/manifest.json`: 편집기에서 쓰는 레슨 선택 목록
- `worksheet.json`: 편집기/렌더러에서 쓰는 학습지 원본 데이터
- `worksheet.html`: 바로 열어 인쇄할 수 있는 A4 HTML 학습지
- `character-intro-tts.md`: 캐릭터 자기소개 TTS 대본
- `chant-script.md`: 수업용 챈트 대본
- `song.md`: Suno 스타일 지시문과 노래 가사

재생성 명령:

```bash
node tools/generate_consonant_lessons.mjs
```

검증 명령:

```bash
node tests/consonant_lessons.test.mjs
```
