import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("lessons", "vowels");
const lessonId = "lesson-17-wa-vowel";

const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
const lessonMeta = manifest.lessons.find((lesson) => lesson.id === lessonId);

assert.ok(lessonMeta, "lesson 17 should introduce the combined vowel ㅘ");
assert.equal(lessonMeta.letters, "ㅗ/ㅏ/ㅘ/와/과");
assert.ok(!manifest.lessons.some((lesson) => /wa/.test(lesson.id) && lesson.id !== lessonId));

const lessonDir = path.join(root, lessonId);
const worksheet = JSON.parse(await readFile(path.join(lessonDir, "worksheet.json"), "utf8"));

assert.deepEqual(
  worksheet.pages.map((page) => page.type),
  ["story", "vowel-activity", "vowel-activity", "word-card", "sound-choice", "first-letter-festival"]
);

const story = worksheet.pages[0];
assert.deepEqual(
  story.panels.map((panel) => path.basename(panel.image)),
  ["오오 상자 시안.png", "아아 아기 나뭇가지 시안.png", "아아 아기 와 오오상자 나뭇가지.png"]
);
assert.deepEqual(
  story.panels.map((panel) => panel.caption),
  ["오오 상자가 아래에 있어요.", "아아 아기가 나뭇가지를 들어요.", "오와 아가 만나, 와!"]
);

const activities = worksheet.pages.filter((page) => page.type === "vowel-activity");
assert.deepEqual(activities.map((page) => page.traceLetter), ["와", "과"]);
assert.deepEqual(activities.map((page) => page.buildPieces), [["ㅇ", "ㅘ", "와"], ["ㄱ", "ㅘ", "과"]]);
assert.deepEqual(
  activities.map((page) => path.basename(page.heroImage)),
  ["아아 아기 와 오오상자 나뭇가지.png", "고고 과 오오상자 나뭇가지.png"]
);
assert.deepEqual(
  activities[0].soundSteps.map((step) => step.sound),
  ["오!", "아!", "와!"]
);
assert.deepEqual(
  activities[1].soundSteps.map((step) => step.sound),
  ["그!", "와!", "과!"]
);

const reviewSounds = worksheet.pages
  .filter((page) => page.type === "sound-choice")
  .flatMap((page) => page.prompts.map((prompt) => prompt.sound));
assert.deepEqual(reviewSounds, ["와", "과"]);

const festival = worksheet.pages.find((page) => page.type === "first-letter-festival");
assert.equal(festival.title, "소리나라 첫 글자 축제 준비");
assert.equal(festival.bookTitle, "나만의 첫 글자 책");
assert.deepEqual(festival.letterSlots, ["가", "나", "마", "사", "아", "와"]);
assert.deepEqual(festival.wordSlots, ["그림 낱말", "첫 글자", "내 목소리", "가족 칭찬"]);
assert.deepEqual(
  festival.bookPages.map((page) => page.title),
  ["표지", "내가 고른 첫 글자", "그림 낱말", "축제 스티커"]
);

const wordCards = worksheet.pages.find((page) => page.type === "word-card").cards;
assert.deepEqual(
  wordCards.map((card) => card.word),
  ["와플", "치와와", "과자", "사과"]
);
assert.deepEqual(
  wordCards.map((card) => path.basename(card.image)),
  ["word-wa-waffle.png", "word-wa-chihuahua.png", "word-gwa-snack.png", "word-gwa-apple.png"]
);

for (const imagePath of [
  path.resolve("public", "아아 아기 와 오오상자 나뭇가지.png"),
  path.resolve("public", "고고 과 오오상자 나뭇가지.png"),
  path.resolve("worksheets", "assets", "word-wa-waffle.png"),
  path.resolve("worksheets", "assets", "word-wa-chihuahua.png"),
  path.resolve("worksheets", "assets", "word-gwa-snack.png"),
  path.resolve("worksheets", "assets", "word-gwa-apple.png"),
]) {
  assert.ok(existsSync(imagePath), `${imagePath} should exist`);
}
