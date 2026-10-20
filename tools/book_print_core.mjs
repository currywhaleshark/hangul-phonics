// Volume 1 print book: wraparound cover (back + spine + front) and unit divider pages.
// HTML only; tools/generate_book_print.mjs turns it into PDFs for the bindery.

export const BOOK = {
  title: "소리나라 한글친구들",
  volume: "1권",
  kicker: "만 3세 한글 파닉스",
  tagline: "자음 친구부터 ㅘ까지, 노래 영상과 함께 배우는 소리 놀이 학습지",
  playlistUrl: "https://www.youtube.com/playlist?list=PL0u1NTgEz-xFjU8_KXoKUDf1AwcnOBfC0",
};

export const TRIM = { width: 210, height: 297 };
export const DEFAULT_BLEED = 3;
// 100g 모조지 is about 0.11mm per sheet; ask the bindery for the exact spine width.
export const DEFAULT_SHEET_THICKNESS = 0.11;

const PUBLIC = "../../public";
const consonant = (file) => `${PUBLIC}/video-assets/characters/consonants/${file}`;
const tool = (name) => `${PUBLIC}/video-assets/vowel-alpha/tools/${name}-alpha.png`;
const combined = (name) => `${PUBLIC}/video-assets/vowel-alpha/combined/${name}-alpha.png`;

export const CONSONANT_CHARACTERS = [
  ["ㄱ", "고고 고양이", "ㄱ-gogo-cat.png"],
  ["ㄴ", "나나 나비", "ㄴ-nana-butterfly.png"],
  ["ㅁ", "미미 문어", "ㅁ-mimi-octopus.png"],
  ["ㅂ", "부부 부엉이", "ㅂ-bubu-owl.png"],
  ["ㄷ", "도도 도토리", "ㄷ-dodo-acorn.png"],
  ["ㄹ", "라라 리본", "ㄹ-rara-ribbon.png"],
  ["ㅅ", "사사 사슴", "ㅅ-sasa-deer.png"],
  ["ㅎ", "하하 하마", "ㅎ-haha-hippo.png"],
  ["ㅈ", "지지 지렁이", "ㅈ-jiji-worm.png"],
  ["ㅊ", "치치 칙폭이", "ㅊ-chichi-train.png"],
  ["ㅋ", "코코 코알라", "ㅋ-koko-koala.png"],
  ["ㅌ", "토토 토끼", "ㅌ-toto-rabbit.png"],
  ["ㅍ", "푸푸 풍선", "ㅍ-pupu-balloon.png"],
].map(([letter, name, file]) => ({ letter, name, image: consonant(file) }));

export const BABY = { letter: "ㅇ", name: "아아 아기", image: consonant("ㅇ-aa-baby.png") };

export const VOWEL_TOOLS = [
  ["ㅏ", "아아 나뭇가지"],
  ["ㅗ", "오오 상자"],
  ["ㅜ", "우우 발판"],
  ["ㅓ", "어어 풍선"],
  ["ㅣ", "이이 막대"],
  ["ㅡ", "으으 쿠션"],
  ["ㅑ", "야야 두 나뭇가지"],
  ["ㅕ", "여여 두 풍선"],
  ["ㅛ", "요요 그네"],
  ["ㅠ", "유유 의자"],
].map(([letter, name]) => ({ letter, name, image: tool(name) }));

export const UNITS = [
  {
    number: 1,
    handoutFile: "sorinara-hangul-vol1-unit1-consonant-friends.pdf",
    title: "자음 친구 만나기",
    letters: ["ㄱ", "ㄴ", "ㅁ", "ㅂ", "ㄷ", "ㄹ", "ㅅ", "ㅎ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ"],
    lead: "몸속에 자음을 품은 친구들을 만나요. 그림을 보고 이름을 부르고, 친구마다 가진 짧은 첫소리를 들어요.",
    color: "#f08a00",
    soft: "#fff1dc",
    lessons: { group: "consonants", from: "lesson-01-gogo-nana", to: "lesson-06b-koko-toto-pupu-sounds" },
    art: CONSONANT_CHARACTERS.map((character) => character.image),
  },
  {
    number: 2,
    handoutFile: "sorinara-hangul-vol1-unit2-first-syllables.pdf",
    title: "모음 도구와 첫 글자",
    letters: ["ㅏ", "ㅗ", "ㅜ", "가", "고", "나", "노", "…", "파", "포"],
    lead: "아아 아기가 나뭇가지, 상자, 발판을 만나요. 자음 친구가 나뭇가지를 들고 상자에 올라타면 첫 글자가 돼요.",
    color: "#5fa52f",
    soft: "#eef7e3",
    lessons: { group: "vowels", from: "lesson-01-aa-baby-vowel", to: "lesson-07b-pupu-combination" },
    art: [
      combined("아아 아기 나뭇가지 시안"),
      combined("오오 상자 시안"),
      combined("우우 발판 시안"),
      combined("고고 가 막대기 새시안"),
      combined("나나 노 새시안"),
      combined("미미 마 새시안"),
    ],
  },
  {
    number: 3,
    handoutFile: "sorinara-hangul-vol1-unit3-vowel-expansion.pdf",
    title: "모음 넓히기",
    letters: ["ㅓ", "ㅜ", "ㅣ", "ㅡ", "거", "구", "기", "그", "…"],
    lead: "어어 풍선, 이이 막대, 으으 쿠션이 새로 와요. 자음 친구 하나씩 거·구·기·그처럼 소리를 넓혀 가요.",
    color: "#1b8fd6",
    soft: "#e3f2fc",
    lessons: { group: "vowels", from: "lesson-08-ieung-vowel-expansion", to: "lesson-14c-pupu-vowel-expansion" },
    art: [
      combined("어어 풍선 시안2"),
      combined("이이 막대 시안"),
      combined("으으 쿠션 시안"),
      combined("고고 거 새시안"),
      combined("부부 부 새시안"),
      combined("하하 흐 새시안"),
    ],
  },
  {
    number: 4,
    handoutFile: "sorinara-hangul-vol1-unit4-double-vowels-wa.pdf",
    title: "두 줄 모음과 ㅘ",
    letters: ["ㅑ", "ㅕ", "ㅛ", "ㅠ", "ㅘ", "야", "여", "요", "유", "와"],
    lead: "두 줄 나뭇가지, 두 풍선, 그네, 의자를 만나요. 오오 상자 위에 나뭇가지가 서면 와가 돼요.",
    color: "#a24bc0",
    soft: "#f4e8f8",
    lessons: { group: "vowels", from: "lesson-15-ya-yeo-vowel", to: "lesson-17-wa-vowel" },
    art: [
      combined("아아 아기 야 나뭇가지"),
      combined("아아 아기 여 풍선"),
      combined("요요 그네 시안"),
      combined("유유 의자 시안"),
      combined("하하 휴 의자"),
      combined("고고 과 오오상자 나뭇가지"),
    ],
  },
];

export function unitLessons(unit, manifests) {
  const lessons = manifests[unit.lessons.group].lessons;
  const from = lessons.findIndex((lesson) => lesson.id === unit.lessons.from);
  const to = lessons.findIndex((lesson) => lesson.id === unit.lessons.to);
  if (from < 0 || to < from) {
    throw new Error(`Unit ${unit.number} lesson range not found in ${unit.lessons.group} manifest`);
  }
  return lessons.slice(from, to + 1).map((lesson) => ({ ...lesson, group: unit.lessons.group }));
}

// Spine width from the interior: double-sided printing puts two pages on each sheet.
export function spineWidth({ pages, sided = "double", sheetThickness = DEFAULT_SHEET_THICKNESS }) {
  const sheets = sided === "double" ? Math.ceil(pages / 2) : pages;
  return Math.round(sheets * sheetThickness * 2) / 2;
}

// Interior page order. Double-sided: each divider starts on a right-hand (odd) page and keeps a blank back.
export function interiorSequence(units, pageCounts, sided = "double") {
  const sequence = [];
  let page = 0;
  const push = (item, count) => {
    sequence.push(item);
    page += count;
  };
  for (const unit of units) {
    if (sided === "double" && page % 2 === 1) push({ kind: "blank" }, 1);
    push({ kind: "divider", unit: unit.number }, 1);
    if (sided === "double") push({ kind: "blank" }, 1);
    for (const lesson of unit.lessonList) {
      push({ kind: "lesson", id: lesson.id, group: lesson.group }, pageCounts[lesson.id]);
    }
  }
  return { sequence, pages: page };
}

const escapeHtml = (text) => String(text).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
const src = (path) => encodeURI(path);

function documentShell({ title, pageSize, body }) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jua&display=swap" rel="stylesheet">
<link rel="stylesheet" href="book.css">
<style>@page { size: ${pageSize}; margin: 0; }</style>
</head>
<body>
${body}
</body>
</html>
`;
}

function titleLetters(text) {
  return [...text].map((ch, index) => `<span class="t${index % 4}">${escapeHtml(ch)}</span>`).join("");
}

export function buildCoverHtml({ units = UNITS, spine, bleed = DEFAULT_BLEED, guides = false }) {
  const width = TRIM.width * 2 + spine + bleed * 2;
  const height = TRIM.height + bleed * 2;
  const [firstWord, secondWord] = BOOK.title.split(" ");
  // A crowd on the hill: small back rows, the baby in the middle of the big front row.
  const rows = [
    CONSONANT_CHARACTERS.slice(0, 3),
    CONSONANT_CHARACTERS.slice(3, 7),
    CONSONANT_CHARACTERS.slice(7, 11),
    [CONSONANT_CHARACTERS[11], BABY, CONSONANT_CHARACTERS[12]],
  ];
  const characterRows = rows
    .map((row, index) => `<div class="cast-row row${index}">${row.map((character) => `<img src="${src(character.image)}" alt="${escapeHtml(character.name)}">`).join("")}</div>`)
    .join("\n");
  const unitCards = units.map(
    (unit) => `<div class="unit-card" style="--unit:${unit.color};--unit-soft:${unit.soft}">
  <span class="unit-no">${unit.number}</span>
  <div><strong>${escapeHtml(unit.title)}</strong><em>${unit.letters.map(escapeHtml).join(" ")}</em>${unit.stats ? `<small>${unit.stats.lessons}레슨 · ${unit.stats.pages}쪽</small>` : ""}</div>
</div>`,
  ).join("\n");
  const tools = VOWEL_TOOLS.map((item) => `<img src="${src(item.image)}" alt="${escapeHtml(item.name)}">`).join("");

  const body = `<div class="cover${guides ? " with-guides" : ""}" style="--bleed:${bleed}mm;--spine:${spine}mm;width:${width}mm;height:${height}mm">
  <section class="panel back">
    <h2>소리나라 친구들과<br>한글 소리를 만나요</h2>
    <p class="back-lead">고고 고양이, 나나 나비, 아아 아기와 모음 도구 친구들이 함께 놀며 글자 소리를 들려줘요. 그림을 보고, 손가락으로 따라가고, 노래 영상으로 다시 만나요.</p>
    <div class="unit-cards">
${unitCards}
    </div>
    <div class="qr-box">
      <img src="${src(`${PUBLIC}/qr/youtube/playlist.png`)}" alt="영상 모음 QR">
      <p><strong>QR을 찍으면 노래 영상이 나와요</strong>학습지 곳곳의 QR로 그 글자의 영상을 보고, 이 QR로 전체 영상 모음을 볼 수 있어요.</p>
    </div>
    <div class="hill"></div>
    <div class="tools-row">${tools}</div>
  </section>
  <section class="panel spine">
    <img class="spine-face" src="${src(BABY.image)}" alt="">
    <div class="spine-title">${escapeHtml(BOOK.title)}</div>
    <div class="spine-volume">${escapeHtml(BOOK.volume)}</div>
  </section>
  <section class="panel front">
    <div class="kicker">${escapeHtml(BOOK.kicker)}</div>
    <h1><span class="line">${titleLetters(firstWord)}</span><span class="line">${titleLetters(secondWord)}</span></h1>
    <div class="volume-badge">${escapeHtml(BOOK.volume)}</div>
    <div class="hill"></div>
    <div class="cast">
${characterRows}
    </div>
    <p class="tagline">${escapeHtml(BOOK.tagline)}</p>
  </section>
</div>`;

  return documentShell({ title: `${BOOK.title} ${BOOK.volume} 표지`, pageSize: `${width}mm ${height}mm`, body });
}

export function buildDividersHtml(units) {
  const pages = units
    .map((unit) => {
      const lessons = unit.lessonList;
      const twoColumns = lessons.length > 8;
      const lessonItems = lessons
        .map((lesson) => {
          const [label, ...rest] = lesson.title.split(" ");
          return `<li><b>${escapeHtml(label)}</b>${escapeHtml(rest.join(" "))}</li>`;
        })
        .join("");
      const art = unit.art.map((image) => `<img src="${src(image)}" alt="">`).join("");
      return `<section class="divider" style="--unit:${unit.color};--unit-soft:${unit.soft}">
  <div class="divider-banner">
    <div class="divider-no">${unit.number}단원</div>
    <h1>${escapeHtml(unit.title)}</h1>
    <div class="divider-letters">${unit.letters.map((letter) => `<span>${escapeHtml(letter)}</span>`).join("")}</div>
  </div>
  <div class="divider-art art-${unit.art.length > 8 ? "many" : "few"}">${art}</div>
  <p class="divider-lead">${escapeHtml(unit.lead)}</p>
  <div class="divider-lessons">
    <h2>이 단원에서 만나요</h2>
    <ol class="${twoColumns ? "two-columns" : ""}">${lessonItems}</ol>
  </div>
  <div class="divider-footer"><span>${escapeHtml(BOOK.title)} ${escapeHtml(BOOK.volume)}</span><span>${unit.number}단원 · ${escapeHtml(unit.title)}</span></div>
</section>`;
    })
    .join("\n");
  return documentShell({ title: `${BOOK.title} ${BOOK.volume} 간지`, pageSize: "A4", body: pages });
}

export function buildBlankHtml() {
  return documentShell({ title: "빈 면", pageSize: "A4", body: '<section class="blank-page"></section>' });
}
