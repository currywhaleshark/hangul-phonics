import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  renderWorksheetBody,
  renderWorksheetDocument,
  renderWorksheetPage,
} from "../worksheets/worksheet-renderer.js";

const lesson = JSON.parse(await readFile(new URL("../worksheets/data/pilot-lesson.json", import.meta.url), "utf8"));
const worksheetCss = await readFile(new URL("../worksheets/pilot-a4.css", import.meta.url), "utf8");

const body = renderWorksheetBody(lesson);
assert.equal((body.match(/<section class="sheet/g) || []).length, 5);
assert.match(body, /고고 고양이야/);
assert.match(body, /나나 나비야/);
assert.match(body, /<div class="spot-card" data-asset="\.\/assets\/dog\.png">/);
assert.match(body, /<div class="cut-tile" data-answer="ㄱ" data-asset="\.\/assets\/dog\.png">/);

const characterPage = renderWorksheetPage(lesson.pages[0]);
assert.match(characterPage, /<div class="big-letter">ㄱ<\/div>/);
assert.match(characterPage, /<img src="\.\.\/public\/고고 고양이\.png" alt="고고 고양이야">/);

const documentHtml = renderWorksheetDocument(lesson);
assert.match(documentHtml, /<!doctype html>/);
assert.match(documentHtml, /<link rel="stylesheet" href="\.\/pilot-a4\.css">/);
assert.match(documentHtml, /한글 파닉스 A4 파일럿 학습지/);

const vowelLesson = JSON.parse(await readFile(new URL("../lessons/vowels/lesson-01-aa-baby-vowel/worksheet.json", import.meta.url), "utf8"));
const vowelPreviewHtml = renderWorksheetDocument(vowelLesson, {
  assetBaseHref: "../lessons/vowels/lesson-01-aa-baby-vowel/worksheet.html",
  documentHref: "http://127.0.0.1:3000/worksheets/editor.html",
});
assert.match(
  vowelPreviewHtml,
  /src="\/lessons\/vowels\/lesson-01-aa-baby-vowel\/aa-story-01-silent\.png"/,
  "editor preview HTML should resolve story images beside the vowel lesson HTML"
);
assert.doesNotMatch(
  vowelPreviewHtml,
  /src="\.\/aa-story-01-silent\.png"/,
  "editor preview HTML should not leave lesson-local images relative to worksheets/editor.html"
);
assert.equal(
  vowelLesson.pages[0].panels[0].image,
  "./aa-story-01-silent.png",
  "preview asset resolution should not mutate the editable worksheet data"
);

const qrPreviewHtml = renderWorksheetDocument(
  {
    title: "QR lesson",
    pages: [
      {
        type: "character",
        theme: "gogo",
        kicker: "1",
        title: "QR page",
        image: "../../../public/sample-character.png",
        panelTitle: "Letter",
        letter: "\u3131",
        sound: "\uADF8",
        read: "read",
        activityTitle: "trace",
        trace: ["\u3131"],
        teacherNote: "note",
        footerLeft: "left",
        footerRight: "right",
        videoQr: {
          label: "\uC601\uC0C1 \uBCF4\uAE30",
          url: "https://www.youtube.com/watch?v=sample123",
          image: "../../../public/qr/youtube/sample123.png",
        },
      },
    ],
  },
  {
    assetBaseHref: "../lessons/consonants/lesson-01-gogo-nana/worksheet.html",
    documentHref: "http://127.0.0.1:3000/worksheets/editor.html",
  }
);

assert.match(qrPreviewHtml, /class="title-row"/, "worksheet pages with video QR should use a title row");
assert.match(qrPreviewHtml, /class="video-qr"/, "worksheet pages with video QR should render a QR block");
assert.match(qrPreviewHtml, /href="https:\/\/www\.youtube\.com\/watch\?v=sample123"/, "QR block should link to the video");
assert.match(
  qrPreviewHtml,
  /src="\/public\/qr\/youtube\/sample123\.png"/,
  "editor preview HTML should resolve QR images from the lesson HTML path"
);
assert.match(worksheetCss, /\.title-row\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/s);
assert.match(worksheetCss, /\.video-qr\s*{[^}]*width:\s*28mm/s);
assert.match(
  worksheetCss,
  /\.finger-trace-letter\s*{[^}]*font-size:\s*220px/s,
  "vowel finger-trace letters should nearly fill the trace box"
);

const noQrPageHtml = renderWorksheetPage({
  type: "character",
  theme: "gogo",
  kicker: "1",
  title: "No QR page",
  image: "../../../public/sample-character.png",
  panelTitle: "Letter",
  letter: "A",
  sound: "a",
  read: "read",
  activityTitle: "trace",
  trace: ["A"],
  teacherNote: "note",
  footerLeft: "left",
  footerRight: "right",
});
assert.doesNotMatch(noQrPageHtml, /[ \t]+$/m, "worksheet pages without QR should not render whitespace-only title row lines");

const escaped = renderWorksheetPage({
  type: "spot",
  theme: "gogo",
  kicker: "테스트",
  title: "<제목>",
  read: "A & B",
  activityTitle: "찾기",
  cards: [{ label: "<강아지>", image: "./assets/dog.png" }],
  soundBox: "소리",
  teacherNote: "메모",
  footerLeft: "왼쪽",
  footerRight: "오른쪽",
});

assert.match(escaped, /&lt;제목&gt;/);
assert.match(escaped, /A &amp; B/);
assert.match(escaped, /&lt;강아지&gt;/);

const threeColumnSorting = renderWorksheetPage({
  type: "sorting",
  theme: "mix",
  kicker: "테스트",
  title: "분류",
  read: "읽기",
  houses: [
    { title: "ㅋ 집", theme: "gogo" },
    { title: "ㅌ 집", theme: "nana" },
    { title: "ㅍ 집", theme: "mix" },
  ],
  activityTitle: "오려 붙이기",
  tileColumns: 3,
  tiles: [
    { label: "코", answer: "ㅋ", fill: "FFE96B" },
    { label: "토", answer: "ㅌ", fill: "E8F5E9" },
    { label: "포", answer: "ㅍ", fill: "E1F5FE" },
  ],
  teacherNote: "메모",
  footerLeft: "왼쪽",
  footerRight: "오른쪽",
});

assert.match(threeColumnSorting, /class="tile-bank" style="--tile-columns:3"/);

const storyPage = renderWorksheetPage({
  type: "story",
  theme: "gogo",
  kicker: "1장 / 그림 이야기",
  title: "아아 아기가 소리를 찾았어",
  read: "아아 아기는 조용하다가 나뭇가지를 만나 아 소리를 냅니다.",
  panels: [
    { image: "./assets/aa-story-01-silent.png", caption: "아아 아기는 조용조용." },
    { image: "./assets/aa-story-02-branch.png", caption: "어? 나뭇가지다!" },
    { image: "./assets/aa-story-03-ah.png", caption: "나뭇가지를 들고, 아!" },
  ],
  teacherNote: "그림을 순서대로 보며 아 소리를 기다리게 한다.",
  footerLeft: "이야기",
  footerRight: "아아 아기와 아",
});

assert.match(storyPage, /class="story-grid"/);
assert.match(storyPage, /class="story-panel"/);
assert.match(storyPage, /아아 아기는 조용조용/);

const fourPanelStoryPage = renderWorksheetPage({
  type: "story",
  theme: "gogo",
  kicker: "1장 / 그림 이야기",
  title: "고고와 나나가 새 글자를 만들어요",
  read: "네 가지 조합을 모두 봐요.",
  panels: [
    { image: "../../../public/고고 가 막대기 ㄱ폰트 크게 새시안.png", caption: "ㄱ이 ㅏ를 만나, 가!" },
    { image: "../../../public/고고 고 상자 ㄱ폰트 크게 새시안.png", caption: "ㄱ이 ㅗ를 만나, 고!" },
    { image: "../../../public/나나 나 새시안.png", caption: "ㄴ이 ㅏ를 만나, 나!" },
    { image: "../../../public/나나 노 새시안.png", caption: "ㄴ이 ㅗ를 만나, 노!" },
  ],
  teacherNote: "네 가지 조합을 한 장에서 훑는다.",
  footerLeft: "그림 이야기",
  footerRight: "고고와 나나",
});

assert.match(fourPanelStoryPage, /class="story-grid story-grid-four"/);
assert.match(fourPanelStoryPage, /ㄴ이 ㅗ를 만나, 노!/);
assert.match(
  worksheetCss,
  /\.story-grid-four\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
  "four-panel story summaries should use a 2-column grid"
);
assert.match(
  worksheetCss,
  /\.story-grid-four\s*{[^}]*grid-template-rows:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
  "four-panel story summaries should use a 2-row grid"
);

const vowelActivityPage = renderWorksheetPage({
  type: "vowel-activity",
  theme: "gogo",
  kicker: "2장 / 소리 활동",
  title: "입 크게 아",
  read: "아아 아기가 나뭇가지를 들고 아!",
  heroImage: "../../../public/아아 아기 나뭇가지 시안.png",
  traceLetter: "아",
  activityTitle: "보고 따라 그리고 붙여서 만들어요",
  buildPieces: ["ㅇ", "ㅏ", "아"],
  soundSteps: [
    { label: "ㅇ 소리", sound: "으!" },
    { label: "ㅏ 소리", sound: "아!" },
    { label: "합치면", sound: "아!" },
  ],
  teacherNote: "손가락으로 큰 글자를 따라가고, ㅇ 옆에 ㅏ를 붙여 아를 만든다.",
  footerLeft: "ㅇ + ㅏ = 아",
  footerRight: "아아 아기와 아",
});

assert.match(vowelActivityPage, /class="vowel-activity-grid"/);
assert.match(vowelActivityPage, /class="finger-trace-letter">아<\/div>/);
assert.match(vowelActivityPage, /class="sound-step-list"/);
assert.match(vowelActivityPage, /으!/);
assert.match(vowelActivityPage, /합치면/);
assert.match(vowelActivityPage, /<div class="build-piece">ㅇ<\/div>/);
assert.match(vowelActivityPage, /<div class="build-result">아<\/div>/);

const soundChoicePage = renderWorksheetPage({
  type: "sound-choice",
  theme: "mix",
  kicker: "마지막 / 소리 정리",
  title: "소리를 듣고 맞는 조합을 찾아요",
  read: "선생님이 말하는 소리를 듣고 알맞은 조합 카드를 찾아요.",
  activityTitle: "맞는 글자에 동그라미",
  prompts: [
    { label: "1번", sound: "아", answer: "아" },
    { label: "2번", sound: "오", answer: "오" },
  ],
  choices: [
    { label: "아", image: "../../../public/아아 아기 나뭇가지 시안.png", buildPieces: ["ㅇ", "ㅏ", "아"] },
    { label: "오", image: "../../../public/오오 상자 시안.png", buildPieces: ["ㅇ", "ㅗ", "오"] },
  ],
  teacherNote: "교사용 소리 순서: 1번 아, 2번 오.",
  footerLeft: "소리 정리",
  footerRight: "아/오",
});

assert.match(soundChoicePage, /class="sound-choice-grid"/);
assert.match(soundChoicePage, /class="sound-choice-image"/);
assert.match(soundChoicePage, /src="..\/..\/..\/public\/아아 아기 나뭇가지 시안.png"/);
assert.match(soundChoicePage, /data-answer="아"/);
assert.match(soundChoicePage, /class="sound-choice-card"/);
assert.match(soundChoicePage, /ㅇ \+ ㅏ/);
assert.doesNotMatch(soundChoicePage, /<strong>아<\/strong>[\s\S]*<div class="sound-choice-prompt-label">1번 소리/);
const wordCardPage = renderWorksheetPage({
  type: "word-card",
  theme: "gogo",
  kicker: "5장 / 글자 낱말",
  title: "아/오/우가 들어가는 낱말",
  read: "아, 오, 우가 들어 있는 생활 낱말을 그림으로 만나요.",
  activityTitle: "배운 글자가 들어간 곳을 진하게 봐요",
  focus: "아",
  cards: [
    { word: "아기", focus: "아", rest: "기", image: "../../../worksheets/assets/baby.png" },
    { word: "아침", focus: "아", rest: "침", image: "../../../worksheets/assets/morning.png" },
    { word: "아이스크림", focus: "아", rest: "이스크림", image: "../../../worksheets/assets/ice-cream.png" },
    { word: "오이", focus: "오", rest: "이", image: "../../../worksheets/assets/cucumber.png" },
    { word: "오리", focus: "오", rest: "리", image: "../../../worksheets/assets/duck.png" },
    { word: "오랑우탄", focus: "오", rest: "랑우탄", image: "../../../worksheets/assets/orangutan.png" },
    { word: "우산", focus: "우", rest: "산", image: "../../../worksheets/assets/umbrella.png" },
    { word: "우유", focus: "우", rest: "유", image: "../../../worksheets/assets/milk.png" },
    { word: "우물", focus: "우", rest: "물", image: "../../../worksheets/assets/well.png" },
  ],
  teacherNote: "낱말 전체 읽기를 요구하지 않고 오늘 배운 글자만 찾아본다.",
  footerLeft: "배운 글자 아/오/우",
  footerRight: "아/오/우 낱말카드",
});

assert.match(wordCardPage, /class="word-card-grid word-card-grid-compact"/);
assert.match(wordCardPage, /<span class="word-card-focus">아<\/span><span class="word-card-rest">기<\/span>/);
assert.match(wordCardPage, /<span class="word-card-focus">아<\/span><span class="word-card-rest">침<\/span>/);
assert.match(wordCardPage, /<span class="word-card-focus">아<\/span><span class="word-card-rest">이스크림<\/span>/);
assert.match(wordCardPage, /<span class="word-card-focus">오<\/span><span class="word-card-rest">랑우탄<\/span>/);
assert.match(wordCardPage, /<span class="word-card-focus">우<\/span><span class="word-card-rest">물<\/span>/);
assert.match(wordCardPage, /src="..\/..\/..\/worksheets\/assets\/ice-cream\.png"/);
assert.match(wordCardPage, /src="..\/..\/..\/worksheets\/assets\/well\.png"/);
const repeatedFocusWordCardPage = renderWorksheetPage({
  type: "word-card",
  theme: "gogo",
  kicker: "6장 / 글자 낱말",
  title: "토로 시작하고 끝나는 낱말",
  read: "토가 앞과 뒤에 있는 낱말을 그림으로 만나요.",
  activityTitle: "토가 보이는 곳을 진하게 봐요",
  cards: [
    {
      word: "토마토",
      image: "../../../worksheets/assets/word-to-tomato.png",
      parts: [
        { text: "토", focus: true },
        { text: "마" },
        { text: "토", focus: true },
      ],
    },
  ],
  teacherNote: "처음과 끝의 토를 함께 찾아본다.",
  footerLeft: "토마토",
  footerRight: "토 낱말카드",
});

assert.match(repeatedFocusWordCardPage, /<span class="word-card-focus">토<\/span><span class="word-card-rest">마<\/span><span class="word-card-focus">토<\/span>/);
const denseWordCardPage = renderWorksheetPage({
  type: "word-card",
  theme: "gogo",
  kicker: "6장 / 글자 낱말",
  title: "가/고/나/노가 들어가는 낱말",
  read: "가, 고, 나, 노가 들어 있는 낱말을 그림으로 만나요.",
  activityTitle: "배운 글자가 들어간 곳을 진하게 봐요",
  cards: [
    { word: "가방", focus: "가", rest: "방", image: "../../../worksheets/assets/word-ga-bag.png" },
    { word: "가지", focus: "가", rest: "지", image: "../../../worksheets/assets/word-ga-eggplant.png" },
    { word: "가위", focus: "가", rest: "위", image: "../../../worksheets/assets/word-ga-scissors.png" },
    { word: "고양이", focus: "고", rest: "양이", image: "../../../worksheets/assets/word-go-cat.png" },
    { word: "고구마", focus: "고", rest: "구마", image: "../../../worksheets/assets/word-go-sweet-potato.png" },
    { word: "고래", focus: "고", rest: "래", image: "../../../worksheets/assets/word-go-whale.png" },
    { word: "나비", focus: "나", rest: "비", image: "../../../worksheets/assets/word-na-butterfly.png" },
    { word: "나무", focus: "나", rest: "무", image: "../../../worksheets/assets/word-na-tree.png" },
    { word: "나사", focus: "나", rest: "사", image: "../../../worksheets/assets/word-na-screw.png" },
    { word: "노란색", focus: "노", rest: "란색", image: "../../../worksheets/assets/word-no-yellow.png" },
    { word: "노래", focus: "노", rest: "래", image: "../../../worksheets/assets/word-no-song.png" },
    { word: "노트", focus: "노", rest: "트", image: "../../../worksheets/assets/word-no-note.png" },
  ],
  teacherNote: "낱말 전체 읽기를 요구하지 않고 오늘 배운 글자만 찾아본다.",
  footerLeft: "배운 글자 가/고/나/노",
  footerRight: "가/고/나/노 낱말카드",
});

assert.match(denseWordCardPage, /class="word-card-grid word-card-grid-compact word-card-grid-dense"/);
assert.match(denseWordCardPage, /<span class="word-card-focus">노<\/span><span class="word-card-rest">란색<\/span>/);

const firstLetterFestivalPage = renderWorksheetPage({
  type: "first-letter-festival",
  theme: "gogo",
  kicker: "마무리 / 1권 복습",
  title: "소리나라 첫 글자 축제 준비",
  read: "좋아하는 첫 글자와 그림 낱말을 골라 나만의 첫 글자 책을 만들어요.",
  activityTitle: "내가 만든 첫 글자 책 준비물",
  letterSlots: ["가", "나", "마", "사", "아", "와"],
  wordSlots: ["그림 낱말", "첫 글자", "내 목소리", "가족 칭찬"],
  bookTitle: "나만의 첫 글자 책",
  bookPages: [
    { title: "표지", prompt: "내 이름을 써요" },
    { title: "내가 고른 첫 글자", prompt: "좋아하는 글자를 붙여요" },
    { title: "그림 낱말", prompt: "그림 한 장을 붙여요" },
    { title: "축제 스티커", prompt: "칭찬 스티커를 붙여요" },
  ],
  teacherNote: "새 글자 진도가 아니라 1권에서 만난 첫 글자와 그림 낱말을 고르는 복습 활동이다.",
  footerLeft: "1권 마무리",
  footerRight: "소리나라 첫 글자 축제",
});

assert.match(firstLetterFestivalPage, /class="sheet theme-gogo first-letter-festival-sheet"/);
assert.match(firstLetterFestivalPage, /소리나라 첫 글자 축제 준비/);
assert.match(firstLetterFestivalPage, /나만의 첫 글자 책/);
assert.match(firstLetterFestivalPage, /class="festival-letter-slot"/);
assert.match(firstLetterFestivalPage, /<strong>와<\/strong>/);
assert.match(firstLetterFestivalPage, /그림 낱말/);
assert.match(firstLetterFestivalPage, /축제 스티커/);
