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
