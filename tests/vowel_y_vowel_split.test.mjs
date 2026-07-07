import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("lessons", "vowels");

async function readWorksheet(lessonId) {
  return JSON.parse(await readFile(path.join(root, lessonId, "worksheet.json"), "utf8"));
}

function activityLetters(worksheet) {
  return worksheet.pages
    .filter((page) => page.type === "vowel-activity")
    .map((page) => page.traceLetter);
}

function reviewLetters(worksheet) {
  return worksheet.pages
    .filter((page) => page.type === "sound-choice")
    .flatMap((page) => page.prompts.map((prompt) => prompt.sound));
}

function wordCardWords(worksheet) {
  return worksheet.pages
    .filter((page) => page.type === "word-card")
    .flatMap((page) => page.cards.map((card) => card.word));
}

function wordCardImages(worksheet) {
  return worksheet.pages
    .filter((page) => page.type === "word-card")
    .flatMap((page) => page.cards.map((card) => path.basename(card.image)));
}

const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
const lessonIds = manifest.lessons.map((lesson) => lesson.id);

assert.ok(
  lessonIds.includes("lesson-15-ya-yeo-vowel"),
  "lesson 15 should be split into a ya/yeo-only lesson"
);
assert.ok(
  lessonIds.includes("lesson-16-yo-yu-vowel"),
  "lesson 16 should introduce yo/yu separately"
);
assert.ok(
  !lessonIds.includes("lesson-15-ya-yeo-yo-yu-vowel"),
  "the old combined ya/yeo/yo/yu lesson should be removed from the manifest"
);

const lesson15 = await readWorksheet("lesson-15-ya-yeo-vowel");
const lesson16 = await readWorksheet("lesson-16-yo-yu-vowel");

assert.equal(
  manifest.lessons.find((lesson) => lesson.id === "lesson-15-ya-yeo-vowel").letters,
  "\u3147/\u3151/\u3155/\uc57c/\uc5ec/\uaca8/\ub140/\ubcbc/\ud600"
);
assert.equal(
  manifest.lessons.find((lesson) => lesson.id === "lesson-16-yo-yu-vowel").letters,
  "\u3147/\u315b/\u3160/\uc694/\uc720/\uad50/\uaddc/\ud45c/\ud4e8/\ud734"
);

assert.deepEqual(
  activityLetters(lesson15),
  ["\uc57c", "\uc5ec", "\uaca8", "\ub140", "\ubcbc", "\ud600"],
  "lesson 15 should cover only ya/yeo-family syllables"
);
assert.deepEqual(reviewLetters(lesson15), activityLetters(lesson15));
assert.ok(!activityLetters(lesson15).includes("\uc694"));
assert.ok(!activityLetters(lesson15).includes("\uc720"));

assert.deepEqual(
  activityLetters(lesson16),
  ["\uc694", "\uc720", "\uad50", "\uaddc", "\ud45c", "\ud4e8", "\ud734"],
  "lesson 16 should cover only yo/yu-family syllables"
);
assert.deepEqual(reviewLetters(lesson16), activityLetters(lesson16));

assert.deepEqual(
  wordCardWords(lesson15),
  ["\uc57c\uad6c\uacf5", "\uc5ec\uc6b0", "\uaca8\uc6b8", "\uc18c\ub140", "\ubcbc", "\ud600"],
  "lesson 15 word cards should stay in the ya/yeo family"
);
assert.deepEqual(
  wordCardWords(lesson16),
  ["\uc694\ub9ac", "\uc720\ub9ac", "\uad50\uc2e4", "\uaddc\uce59", "\ud45c\ubc94", "\ud4e8\ub9c8", "\ud734\uc9c0"],
  "lesson 16 word cards should stay in the yo/yu family"
);
assert.ok(wordCardImages(lesson16).includes("word-pyo-leopard.png"));
assert.ok(wordCardImages(lesson16).includes("word-gyu-rule.png"));
assert.ok(existsSync(path.resolve("worksheets", "assets", "word-pyo-leopard.png")));
assert.ok(existsSync(path.resolve("worksheets", "assets", "word-gyu-rule.png")));
