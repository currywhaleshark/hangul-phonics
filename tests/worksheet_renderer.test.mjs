import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  renderWorksheetBody,
  renderWorksheetDocument,
  renderWorksheetPage,
} from "../worksheets/worksheet-renderer.js";

const lesson = JSON.parse(await readFile(new URL("../worksheets/data/pilot-lesson.json", import.meta.url), "utf8"));

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
  teacherNote: "손가락으로 큰 글자를 따라가고, ㅇ 옆에 ㅏ를 붙여 아를 만든다.",
  footerLeft: "ㅇ + ㅏ = 아",
  footerRight: "아아 아기와 아",
});

assert.match(vowelActivityPage, /class="vowel-activity-grid"/);
assert.match(vowelActivityPage, /class="finger-trace-letter">아<\/div>/);
assert.match(vowelActivityPage, /<div class="build-piece">ㅇ<\/div>/);
assert.match(vowelActivityPage, /<div class="build-result">아<\/div>/);
