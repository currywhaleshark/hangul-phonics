import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("lessons", "vowels");
const lessonIds = [
  "lesson-01-aa-baby-vowel",
  "lesson-02-oo-box-vowel",
  "lesson-03-uu-platform-vowel",
];
const expectedManifest = [
  ["lesson-01-aa-baby-vowel", "ㅇ/ㅏ/아"],
  ["lesson-02-oo-box-vowel", "ㅇ/ㅗ/오"],
  ["lesson-03-uu-platform-vowel", "ㅇ/ㅜ/우"],
];

const expectedStoryImages = [
  "aa-story-01-silent.png",
  "aa-story-02-branch.png",
  "aa-story-03-ah.png",
];

const expectedActivities = new Map([
  ["lesson-01-aa-baby-vowel", {
    title: "1레슨 아아 아기와 아: 조용한 아기가 소리를 찾았어",
    heroImage: "../../../public/아아 아기 나뭇가지 시안.png",
    traceLetter: "아",
    buildPieces: ["ㅇ", "ㅏ", "아"],
    footer: "ㅇ + ㅏ = 아",
  }],
  ["lesson-02-oo-box-vowel", {
    title: "2레슨 아아 아기와 오: 상자를 만나 오 소리",
    heroImage: "../../../public/오오 상자 시안.png",
    traceLetter: "오",
    buildPieces: ["ㅇ", "ㅗ", "오"],
    footer: "ㅇ + ㅗ = 오",
  }],
  ["lesson-03-uu-platform-vowel", {
    title: "3레슨 아아 아기와 우: 발판을 만나 우 소리",
    heroImage: "../../../public/우우 발판 시안.png",
    traceLetter: "우",
    buildPieces: ["ㅇ", "ㅜ", "우"],
    footer: "ㅇ + ㅜ = 우",
  }],
]);

assert.ok(existsSync(root), "vowel lessons folder should exist");
assert.ok(existsSync(path.join(root, "manifest.json")), "vowel manifest should exist");

const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
assert.deepEqual(
  manifest.lessons.map((lesson) => [lesson.id, lesson.letters]),
  expectedManifest,
  "vowel manifest should start with the Aa baby ㅏ, ㅗ, ㅜ sequence"
);

for (const lessonId of lessonIds) {
  const lessonDir = path.join(root, lessonId);
  const expected = expectedActivities.get(lessonId);
  assert.ok(existsSync(lessonDir), `${lessonId} folder should exist`);

  const worksheet = JSON.parse(await readFile(path.join(lessonDir, "worksheet.json"), "utf8"));
  assert.equal(worksheet.title, expected.title);
  assert.deepEqual(worksheet.pages.map((page) => page.type), ["story", "vowel-activity"]);

  const storyPage = worksheet.pages[0];
  assert.equal(storyPage.panels.length, 3, `${lessonId} story page should have three picture-book cuts`);
  assert.ok(storyPage.panels.every((panel) => panel.caption), `${lessonId} story panels should have captions`);
  for (const panel of storyPage.panels) {
    assert.ok(existsSync(path.resolve(lessonDir, panel.image)), `${lessonId} story image ${panel.image} should exist`);
  }

  if (lessonId === "lesson-01-aa-baby-vowel") {
    assert.deepEqual(
      storyPage.panels.map((panel) => path.basename(panel.image)),
      expectedStoryImages,
      "Aa story page should reference the generated three-cut images"
    );

    for (const fileName of expectedStoryImages) {
      assert.ok(existsSync(path.join(lessonDir, fileName)), `${fileName} should exist beside the worksheet`);
    }
  }

  const activityPage = worksheet.pages[1];
  assert.equal(activityPage.heroImage, expected.heroImage);
  assert.equal(activityPage.traceLetter, expected.traceLetter);
  assert.deepEqual(activityPage.buildPieces, expected.buildPieces);

  const heroPath = path.resolve(lessonDir, activityPage.heroImage);
  assert.ok(existsSync(heroPath), `${lessonId} hero image should exist`);

  const html = await readFile(path.join(lessonDir, "worksheet.html"), "utf8");
  assert.match(html, /pilot-a4\.css/);
  assert.match(html, /story-grid/);
  assert.match(html, /vowel-activity-grid/);
  assert.match(html, new RegExp(expected.footer.replace(/[+]/g, "\\+")));
}
