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
