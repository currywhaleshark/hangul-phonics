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
  {
    id: "lesson-04-dodo-rara-combination",
    title: "4레슨 도도와 라라: 다/도/라/로를 만들어요",
    letters: "ㄷ/ㄹ/ㅏ/ㅗ/다/도/라/로",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "vowel-activity", "sound-choice"],
    storyImages: [
      "도도 다 새시안.png",
      "도도 도 새시안.png",
      "라라 라 새시안.png",
      "라라 로 새시안.png",
    ],
    storyCaptions: ["ㄷ이 ㅏ를 만나, 다!", "ㄷ이 ㅗ를 만나, 도!", "ㄹ이 ㅏ를 만나, 라!", "ㄹ이 ㅗ를 만나, 로!"],
    builds: [
      ["ㄷ", "ㅏ", "다"],
      ["ㄷ", "ㅗ", "도"],
      ["ㄹ", "ㅏ", "라"],
      ["ㄹ", "ㅗ", "로"],
    ],
    reviewSounds: ["다", "도", "라", "로"],
  },
  {
    id: "lesson-05-sasa-haha-combination",
    title: "5레슨 사사와 하하: 사/소/하/호를 만들어요",
    letters: "ㅅ/ㅎ/ㅏ/ㅗ/사/소/하/호",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "vowel-activity", "sound-choice"],
    storyImages: [
      "사사 사 새시안.png",
      "사사 소 새시안.png",
      "하하 하 새시안.png",
      "하하 호 새시안.png",
    ],
    storyCaptions: ["ㅅ이 ㅏ를 만나, 사!", "ㅅ이 ㅗ를 만나, 소!", "ㅎ이 ㅏ를 만나, 하!", "ㅎ이 ㅗ를 만나, 호!"],
    builds: [
      ["ㅅ", "ㅏ", "사"],
      ["ㅅ", "ㅗ", "소"],
      ["ㅎ", "ㅏ", "하"],
      ["ㅎ", "ㅗ", "호"],
    ],
    reviewSounds: ["사", "소", "하", "호"],
  },
  {
    id: "lesson-06-jiji-chichi-combination",
    title: "6레슨 지지와 치치: 자/조/차/초를 만들어요",
    letters: "ㅈ/ㅊ/ㅏ/ㅗ/자/조/차/초",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "vowel-activity", "sound-choice"],
    storyImages: [
      "지지 자 새시안.png",
      "지지 조 새시안.png",
      "치치 차 새시안.png",
      "치치 초 새시안.png",
    ],
    storyCaptions: ["ㅈ이 ㅏ를 만나, 자!", "ㅈ이 ㅗ를 만나, 조!", "ㅊ이 ㅏ를 만나, 차!", "ㅊ이 ㅗ를 만나, 초!"],
    builds: [
      ["ㅈ", "ㅏ", "자"],
      ["ㅈ", "ㅗ", "조"],
      ["ㅊ", "ㅏ", "차"],
      ["ㅊ", "ㅗ", "초"],
    ],
    reviewSounds: ["자", "조", "차", "초"],
  },
  {
    id: "lesson-07a-koko-toto-combination",
    title: "7-A레슨 코코와 토토: 카/코/타/토를 만들어요",
    letters: "ㅋ/ㅌ/ㅏ/ㅗ/카/코/타/토",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "vowel-activity", "sound-choice"],
    storyImages: [
      "코코 카 새시안.png",
      "코코 코 새시안.png",
      "토토 타 새시안.png",
      "토토 토 새시안.png",
    ],
    storyCaptions: ["ㅋ이 ㅏ를 만나, 카!", "ㅋ이 ㅗ를 만나, 코!", "ㅌ이 ㅏ를 만나, 타!", "ㅌ이 ㅗ를 만나, 토!"],
    builds: [
      ["ㅋ", "ㅏ", "카"],
      ["ㅋ", "ㅗ", "코"],
      ["ㅌ", "ㅏ", "타"],
      ["ㅌ", "ㅗ", "토"],
    ],
    reviewSounds: ["카", "코", "타", "토"],
  },
  {
    id: "lesson-07b-pupu-combination",
    title: "7-B레슨 푸푸: 파/포를 만들어요",
    letters: "ㅍ/ㅏ/ㅗ/파/포",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "sound-choice"],
    storyImages: [
      "푸푸 파 새시안.png",
      "푸푸 포 새시안.png",
    ],
    storyCaptions: ["ㅍ이 ㅏ를 만나, 파!", "ㅍ이 ㅗ를 만나, 포!"],
    builds: [
      ["ㅍ", "ㅏ", "파"],
      ["ㅍ", "ㅗ", "포"],
    ],
    reviewSounds: ["파", "포"],
  },
];

assert.ok(existsSync(root), "vowel lessons folder should exist");
assert.ok(existsSync(path.join(root, "manifest.json")), "vowel manifest should exist");

const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
assert.deepEqual(
  manifest.lessons.map((lesson) => [lesson.id, lesson.letters]),
  expectedLessons.map((lesson) => [lesson.id, lesson.letters]),
  "vowel manifest should expose the grouped lesson bundles"
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
