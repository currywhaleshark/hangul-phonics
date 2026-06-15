import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("lessons", "vowels");
const expectedLessons = [
  {
    id: "lesson-01-aa-baby-vowel",
    title: "1레슨 아아 아기와 아/오/우: 모음 도구를 만나요",
    letters: "ㅇ/ㅏ/ㅗ/ㅜ/아/오/우",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "sound-choice"],
    storyImages: ["aa-story-01-silent.png", "aa-story-02-branch.png", "aa-story-03-ah.png"],
    storyCaptions: ["아아 아기는 조용조용.", "어? 나뭇가지다!", "나뭇가지를 들고, 아!"],
    builds: [
      ["ㅇ", "ㅏ", "아"],
      ["ㅇ", "ㅗ", "오"],
      ["ㅇ", "ㅜ", "우"],
    ],
    reviewSounds: ["아", "오", "우"],
  },
  {
    id: "lesson-02-gogo-nana-combination",
    title: "2레슨 고고와 나나: 가/고/나/노를 만들어요",
    letters: "ㄱ/ㄴ/ㅏ/ㅗ/가/고/나/노",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "vowel-activity", "sound-choice"],
    storyImages: [
      "고고 가 막대기 ㄱ폰트 크게 새시안.png",
      "고고 고 상자 ㄱ폰트 크게 새시안.png",
      "나나 나 새시안.png",
      "나나 노 새시안.png",
    ],
    storyCaptions: ["ㄱ이 ㅏ를 만나, 가!", "ㄱ이 ㅗ를 만나, 고!", "ㄴ이 ㅏ를 만나, 나!", "ㄴ이 ㅗ를 만나, 노!"],
    builds: [
      ["ㄱ", "ㅏ", "가"],
      ["ㄱ", "ㅗ", "고"],
      ["ㄴ", "ㅏ", "나"],
      ["ㄴ", "ㅗ", "노"],
    ],
    reviewSounds: ["가", "고", "나", "노"],
  },
  {
    id: "lesson-03-mimi-bubu-combination",
    title: "3레슨 미미와 부부: 마/모/바/보를 만들어요",
    letters: "ㅁ/ㅂ/ㅏ/ㅗ/마/모/바/보",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "vowel-activity", "sound-choice"],
    storyImages: [
      "미미 마 새시안.png",
      "미미 모 새시안.png",
      "부부 바 새시안.png",
      "부부 보 새시안.png",
    ],
    storyCaptions: ["ㅁ이 ㅏ를 만나, 마!", "ㅁ이 ㅗ를 만나, 모!", "ㅂ이 ㅏ를 만나, 바!", "ㅂ이 ㅗ를 만나, 보!"],
    builds: [
      ["ㅁ", "ㅏ", "마"],
      ["ㅁ", "ㅗ", "모"],
      ["ㅂ", "ㅏ", "바"],
      ["ㅂ", "ㅗ", "보"],
    ],
    reviewSounds: ["마", "모", "바", "보"],
  },
];

assert.ok(existsSync(root), "vowel lessons folder should exist");
assert.ok(existsSync(path.join(root, "manifest.json")), "vowel manifest should exist");

const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
assert.deepEqual(
  manifest.lessons.map((lesson) => [lesson.id, lesson.letters]),
  expectedLessons.map((lesson) => [lesson.id, lesson.letters]),
  "vowel manifest should expose three grouped lesson bundles"
);

for (const expected of expectedLessons) {
  const lessonDir = path.join(root, expected.id);
  assert.ok(existsSync(lessonDir), `${expected.id} folder should exist`);

  const worksheet = JSON.parse(await readFile(path.join(lessonDir, "worksheet.json"), "utf8"));
  assert.equal(worksheet.title, expected.title);
  assert.deepEqual(worksheet.pages.map((page) => page.type), expected.pageTypes);

  const storyPage = worksheet.pages[0];
  assert.equal(storyPage.panels.length, expected.storyImages.length, `${expected.id} story page should include every intro cut`);
  if (expected.storyImages) {
    assert.deepEqual(
      storyPage.panels.map((panel) => path.basename(panel.image)),
      expected.storyImages,
      `${expected.id} story page should use the expected intro images`
    );
    assert.deepEqual(
      storyPage.panels.map((panel) => panel.caption),
      expected.storyCaptions,
      `${expected.id} story page should use the expected intro captions`
    );
  }
  for (const panel of storyPage.panels) {
    assert.ok(existsSync(path.resolve(lessonDir, panel.image)), `${expected.id} story image ${panel.image} should exist`);
  }

  const activityPages = worksheet.pages.filter((page) => page.type === "vowel-activity");
  assert.deepEqual(activityPages.map((page) => page.buildPieces), expected.builds);
  for (const page of activityPages) {
    assert.ok(existsSync(path.resolve(lessonDir, page.heroImage)), `${expected.id} hero image ${page.heroImage} should exist`);
    assert.equal(page.soundSteps.length, 3, `${expected.id} ${page.traceLetter} should keep three sound steps`);
    assert.equal(page.soundSteps.at(-1).sound, `${page.traceLetter}!`);
  }

  const reviewPage = worksheet.pages.at(-1);
  assert.equal(reviewPage.type, "sound-choice");
  assert.deepEqual(reviewPage.prompts.map((prompt) => prompt.sound), expected.reviewSounds);
  assert.deepEqual(reviewPage.choices.map((choice) => choice.buildPieces), expected.builds);
  assert.ok(reviewPage.choices.every((choice) => choice.image), `${expected.id} review choices should include picture cues`);
  for (const choice of reviewPage.choices) {
    assert.ok(existsSync(path.resolve(lessonDir, choice.image)), `${expected.id} review choice image ${choice.image} should exist`);
  }

  const html = await readFile(path.join(lessonDir, "worksheet.html"), "utf8");
  assert.match(html, /pilot-a4\.css/);
  assert.match(html, /story-grid/);
  if (expected.storyImages.length === 4) {
    assert.match(html, /story-grid-four/);
  }
  assert.match(html, /vowel-activity-grid/);
  assert.match(html, /sound-choice-grid/);
  assert.match(html, /sound-choice-image/);
}
