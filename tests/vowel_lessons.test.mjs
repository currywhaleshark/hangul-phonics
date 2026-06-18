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

const expansionVowels = ["ㅓ", "ㅜ", "ㅡ", "ㅣ"];

function expansionPageTypes(buildCount) {
  return [
    "story",
    ...Array.from({ length: buildCount }, () => "vowel-activity"),
    ...Array.from({ length: Math.ceil(buildCount / 4) }, () => "sound-choice"),
  ];
}

function expansionBuilds(characters) {
  return characters.flatMap((character) =>
    character.results.map((result, index) => [character.consonant, expansionVowels[index], result])
  );
}

function expansionImages(characters) {
  return characters.map((character) => `${character.name} ${character.results[0]} 새시안.png`);
}

function expansionCaptions(characters) {
  return characters.map((character) => `${character.consonant}이 새 모음을 만나, ${character.results[0]}부터 시작!`);
}

expectedLessons.push(
  {
    id: "lesson-08-ieung-vowel-expansion",
    title: "8레슨 ㅇ과 새 모음: 어/우/으/이를 만들어요",
    letters: "ㅇ/ㅓ/ㅜ/ㅡ/ㅣ/어/우/으/이",
    pageTypes: expansionPageTypes(4),
    storyImages: ["어어 풍선 시안2.png", "우우 발판 시안.png", "으으 쿠션 시안.png", "이이 막대 시안.png"],
    storyCaptions: ["ㅇ이 ㅓ를 만나, 어!", "ㅇ이 ㅜ를 만나, 우!", "ㅇ이 ㅡ를 만나, 으!", "ㅇ이 ㅣ를 만나, 이!"],
    builds: [["ㅇ", "ㅓ", "어"], ["ㅇ", "ㅜ", "우"], ["ㅇ", "ㅡ", "으"], ["ㅇ", "ㅣ", "이"]],
    reviewSounds: ["어", "우", "으", "이"],
  },
  {
    id: "lesson-09-gogo-nana-vowel-expansion",
    title: "9레슨 고고와 나나: 거/구/그/기/너/누/느/니를 만들어요",
    letters: "ㄱ/ㄴ/ㅓ/ㅜ/ㅡ/ㅣ/거/구/그/기/너/누/느/니",
    pageTypes: expansionPageTypes(8),
    storyImages: expansionImages([
      { name: "고고", results: ["거", "구", "그", "기"] },
      { name: "나나", results: ["너", "누", "느", "니"] },
    ]),
    storyCaptions: expansionCaptions([
      { consonant: "ㄱ", results: ["거", "구", "그", "기"] },
      { consonant: "ㄴ", results: ["너", "누", "느", "니"] },
    ]),
    builds: expansionBuilds([
      { consonant: "ㄱ", results: ["거", "구", "그", "기"] },
      { consonant: "ㄴ", results: ["너", "누", "느", "니"] },
    ]),
    reviewSounds: ["거", "구", "그", "기", "너", "누", "느", "니"],
  },
  {
    id: "lesson-10-mimi-rara-vowel-expansion",
    title: "10레슨 미미와 라라: 머/무/므/미/러/루/르/리를 만들어요",
    letters: "ㅁ/ㄹ/ㅓ/ㅜ/ㅡ/ㅣ/머/무/므/미/러/루/르/리",
    pageTypes: expansionPageTypes(8),
    storyImages: expansionImages([
      { name: "미미", results: ["머", "무", "므", "미"] },
      { name: "라라", results: ["러", "루", "르", "리"] },
    ]),
    storyCaptions: expansionCaptions([
      { consonant: "ㅁ", results: ["머", "무", "므", "미"] },
      { consonant: "ㄹ", results: ["러", "루", "르", "리"] },
    ]),
    builds: expansionBuilds([
      { consonant: "ㅁ", results: ["머", "무", "므", "미"] },
      { consonant: "ㄹ", results: ["러", "루", "르", "리"] },
    ]),
    reviewSounds: ["머", "무", "므", "미", "러", "루", "르", "리"],
  },
  {
    id: "lesson-11-dodo-bubu-vowel-expansion",
    title: "11레슨 도도와 부부: 더/두/드/디/버/부/브/비를 만들어요",
    letters: "ㄷ/ㅂ/ㅓ/ㅜ/ㅡ/ㅣ/더/두/드/디/버/부/브/비",
    pageTypes: expansionPageTypes(8),
    storyImages: expansionImages([
      { name: "도도", results: ["더", "두", "드", "디"] },
      { name: "부부", results: ["버", "부", "브", "비"] },
    ]),
    storyCaptions: expansionCaptions([
      { consonant: "ㄷ", results: ["더", "두", "드", "디"] },
      { consonant: "ㅂ", results: ["버", "부", "브", "비"] },
    ]),
    builds: expansionBuilds([
      { consonant: "ㄷ", results: ["더", "두", "드", "디"] },
      { consonant: "ㅂ", results: ["버", "부", "브", "비"] },
    ]),
    reviewSounds: ["더", "두", "드", "디", "버", "부", "브", "비"],
  },
  {
    id: "lesson-12-sasa-haha-vowel-expansion",
    title: "12레슨 사사와 하하: 서/수/스/시/허/후/흐/히를 만들어요",
    letters: "ㅅ/ㅎ/ㅓ/ㅜ/ㅡ/ㅣ/서/수/스/시/허/후/흐/히",
    pageTypes: expansionPageTypes(8),
    storyImages: expansionImages([
      { name: "사사", results: ["서", "수", "스", "시"] },
      { name: "하하", results: ["허", "후", "흐", "히"] },
    ]),
    storyCaptions: expansionCaptions([
      { consonant: "ㅅ", results: ["서", "수", "스", "시"] },
      { consonant: "ㅎ", results: ["허", "후", "흐", "히"] },
    ]),
    builds: expansionBuilds([
      { consonant: "ㅅ", results: ["서", "수", "스", "시"] },
      { consonant: "ㅎ", results: ["허", "후", "흐", "히"] },
    ]),
    reviewSounds: ["서", "수", "스", "시", "허", "후", "흐", "히"],
  },
  {
    id: "lesson-13-jiji-chichi-vowel-expansion",
    title: "13레슨 지지와 치치: 저/주/즈/지/처/추/츠/치를 만들어요",
    letters: "ㅈ/ㅊ/ㅓ/ㅜ/ㅡ/ㅣ/저/주/즈/지/처/추/츠/치",
    pageTypes: expansionPageTypes(8),
    storyImages: expansionImages([
      { name: "지지", results: ["저", "주", "즈", "지"] },
      { name: "치치", results: ["처", "추", "츠", "치"] },
    ]),
    storyCaptions: expansionCaptions([
      { consonant: "ㅈ", results: ["저", "주", "즈", "지"] },
      { consonant: "ㅊ", results: ["처", "추", "츠", "치"] },
    ]),
    builds: expansionBuilds([
      { consonant: "ㅈ", results: ["저", "주", "즈", "지"] },
      { consonant: "ㅊ", results: ["처", "추", "츠", "치"] },
    ]),
    reviewSounds: ["저", "주", "즈", "지", "처", "추", "츠", "치"],
  },
  {
    id: "lesson-14-koko-toto-pupu-vowel-expansion",
    title: "14레슨 코코와 토토와 푸푸: 커/쿠/크/키/터/투/트/티/퍼/푸/프/피를 만들어요",
    letters: "ㅋ/ㅌ/ㅍ/ㅓ/ㅜ/ㅡ/ㅣ/커/쿠/크/키/터/투/트/티/퍼/푸/프/피",
    pageTypes: expansionPageTypes(12),
    storyImages: expansionImages([
      { name: "코코", results: ["커", "쿠", "크", "키"] },
      { name: "토토", results: ["터", "투", "트", "티"] },
      { name: "푸푸", results: ["퍼", "푸", "프", "피"] },
    ]),
    storyCaptions: expansionCaptions([
      { consonant: "ㅋ", results: ["커", "쿠", "크", "키"] },
      { consonant: "ㅌ", results: ["터", "투", "트", "티"] },
      { consonant: "ㅍ", results: ["퍼", "푸", "프", "피"] },
    ]),
    builds: expansionBuilds([
      { consonant: "ㅋ", results: ["커", "쿠", "크", "키"] },
      { consonant: "ㅌ", results: ["터", "투", "트", "티"] },
      { consonant: "ㅍ", results: ["퍼", "푸", "프", "피"] },
    ]),
    reviewSounds: ["커", "쿠", "크", "키", "터", "투", "트", "티", "퍼", "푸", "프", "피"],
  },
);

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

  const reviewPages = worksheet.pages.filter((page) => page.type === "sound-choice");
  assert.deepEqual(
    reviewPages.flatMap((page) => page.prompts.map((prompt) => prompt.sound)),
    expected.reviewSounds
  );
  assert.deepEqual(
    reviewPages.flatMap((page) => page.choices.map((choice) => choice.buildPieces)),
    expected.builds
  );
  assert.ok(
    reviewPages.every((page) => page.choices.every((choice) => choice.image)),
    `${expected.id} review choices should include picture cues`
  );
  for (const choice of reviewPages.flatMap((page) => page.choices)) {
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
