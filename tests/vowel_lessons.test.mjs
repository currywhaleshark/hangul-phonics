import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("lessons", "vowels");
const lessonId = "lesson-01-aa-baby-vowel";
const lessonDir = path.join(root, lessonId);

const expectedStoryImages = [
  "aa-story-01-silent.png",
  "aa-story-02-branch.png",
  "aa-story-03-ah.png",
];

assert.ok(existsSync(root), "vowel lessons folder should exist");
assert.ok(existsSync(path.join(root, "manifest.json")), "vowel manifest should exist");
assert.ok(existsSync(lessonDir), "first vowel lesson folder should exist");

const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
assert.deepEqual(
  manifest.lessons.map((lesson) => [lesson.id, lesson.letters]),
  [[lessonId, "ㅇ/ㅏ/아"]],
  "vowel manifest should start with the Aa baby transition lesson"
);

const worksheet = JSON.parse(await readFile(path.join(lessonDir, "worksheet.json"), "utf8"));
assert.equal(worksheet.title, "1레슨 아아 아기와 아: 조용한 아기가 소리를 찾았어");
assert.deepEqual(worksheet.pages.map((page) => page.type), ["story", "vowel-activity"]);

const storyPage = worksheet.pages[0];
assert.equal(storyPage.panels.length, 3, "story page should have three picture-book cuts");
assert.deepEqual(
  storyPage.panels.map((panel) => path.basename(panel.image)),
  expectedStoryImages,
  "story page should reference the generated three-cut images"
);

for (const fileName of expectedStoryImages) {
  assert.ok(existsSync(path.join(lessonDir, fileName)), `${fileName} should exist beside the worksheet`);
}

const activityPage = worksheet.pages[1];
assert.equal(activityPage.heroImage, "../../../public/아아 아기 나뭇가지 시안.png");
assert.equal(activityPage.traceLetter, "아");
assert.deepEqual(activityPage.buildPieces, ["ㅇ", "ㅏ", "아"]);

const html = await readFile(path.join(lessonDir, "worksheet.html"), "utf8");
assert.match(html, /pilot-a4\.css/);
assert.match(html, /story-grid/);
assert.match(html, /vowel-activity-grid/);
assert.match(html, /ㅇ \+ ㅏ = 아/);
