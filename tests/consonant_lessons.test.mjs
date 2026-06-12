import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("lessons", "consonants");

const expectedLessons = [
  "lesson-01-gogo-nana",
  "lesson-02-mimi-bubu",
  "lesson-03-dodo-rara",
  "lesson-04-sasa-haha",
  "lesson-05-jiji-chichi",
  "lesson-06-koko-toto-pupu",
];

const lesson2AssetFiles = [
  "squirrel.png",
  "moon.png",
  "bridge.png",
  "donut.png",
  "acorn.png",
  "ramen.png",
  "robot.png",
  "ribbon.png",
  "radio.png",
  "lemon.png",
];

const lesson3AssetFiles = [
  "hat.png",
  "door.png",
  "water.png",
  "rainbow.png",
  "slide.png",
  "banana.png",
  "bus.png",
  "star.png",
  "rain.png",
  "basket.png",
];

const lesson4AssetFiles = [
  "apple.png",
  "watermelon.png",
  "mountain.png",
  "hand.png",
  "candy.png",
  "baby.png",
  "sun.png",
  "heart.png",
  "tiger.png",
  "harmonica.png",
  "hamburger.png",
];

const lesson5AssetFiles = [
  "car.png",
  "house.png",
  "juice.png",
  "wallet.png",
  "jelly.png",
  "cheese.png",
  "book.png",
  "chocolate.png",
  "skirt.png",
  "friend.png",
];

const lesson6AssetFiles = [
  "cookie.png",
  "bean.png",
  "card.png",
  "crayon.png",
  "elephant.png",
  "rabbit.png",
  "tomato.png",
  "taxi.png",
  "ostrich.png",
  "tulip.png",
  "clover.png",
  "grapes.png",
  "pizza.png",
  "grass.png",
  "balloon.png",
  "wave.png",
];

const lesson1AudioFiles = [
  "\u3131 \ucc48\ud2b8.wav",
  "\u3134 \ucc48\ud2b8.wav",
  "\u3131, \u3134 \uc18c\uac1c.wav",
];

const expectedManifest = [
  ["lesson-01-gogo-nana", "ㄱ/ㄴ"],
  ["lesson-02-mimi-bubu", "ㅁ/ㅂ"],
  ["lesson-03-dodo-rara", "ㄷ/ㄹ"],
  ["lesson-04-sasa-haha", "ㅅ/ㅎ"],
  ["lesson-05-jiji-chichi", "ㅈ/ㅊ"],
  ["lesson-06-koko-toto-pupu", "ㅋ/ㅌ/ㅍ"],
];

for (const fileName of lesson2AssetFiles) {
  assert.ok(existsSync(path.resolve("worksheets", "assets", fileName)), `lesson 2 asset ${fileName} should exist`);
}

for (const fileName of lesson3AssetFiles) {
  assert.ok(existsSync(path.resolve("worksheets", "assets", fileName)), `lesson 3 asset ${fileName} should exist`);
}

for (const fileName of lesson4AssetFiles) {
  assert.ok(existsSync(path.resolve("worksheets", "assets", fileName)), `lesson 4 asset ${fileName} should exist`);
}

for (const fileName of lesson5AssetFiles) {
  assert.ok(existsSync(path.resolve("worksheets", "assets", fileName)), `lesson 5 asset ${fileName} should exist`);
}

for (const fileName of lesson6AssetFiles) {
  assert.ok(existsSync(path.resolve("worksheets", "assets", fileName)), `lesson 6 asset ${fileName} should exist`);
}

const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
assert.deepEqual(
  manifest.lessons.map((lesson) => [lesson.id, lesson.letters]),
  expectedManifest,
  "manifest should follow the active 6-lesson consonant order and postpone ㅇ"
);
assert.ok(!manifest.lessons.some((lesson) => lesson.letters.includes("ㅇ")), "ㅇ should be postponed from the active consonant manifest");

const lessonDirectories = (await readdir(root, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && entry.name.startsWith("lesson-"))
  .map((entry) => entry.name)
  .sort();
assert.deepEqual(lessonDirectories, expectedLessons, "lesson folders should match the active consonant sequence");

for (const lessonName of expectedLessons) {
  const lessonDir = path.join(root, lessonName);
  assert.ok(existsSync(lessonDir), `${lessonName} folder should exist`);

  for (const fileName of [
    "worksheet.json",
    "worksheet.html",
    "character-intro-tts.md",
    "chant-script.md",
    "song.md",
  ]) {
    assert.ok(existsSync(path.join(lessonDir, fileName)), `${lessonName}/${fileName} should exist`);
  }

  const worksheet = JSON.parse(await readFile(path.join(lessonDir, "worksheet.json"), "utf8"));
  const expectedPageTypes =
    lessonName === "lesson-06-koko-toto-pupu"
      ? ["character", "spot", "character", "spot", "character", "spot", "sorting"]
      : ["character", "spot", "character", "spot", "sorting"];
  assert.deepEqual(worksheet.pages.map((page) => page.type), expectedPageTypes, `${lessonName} should use the expected worksheet pages`);

  const intro = await readFile(path.join(lessonDir, "character-intro-tts.md"), "utf8");
  const chant = await readFile(path.join(lessonDir, "chant-script.md"), "utf8");
  const song = await readFile(path.join(lessonDir, "song.md"), "utf8");
  const html = await readFile(path.join(lessonDir, "worksheet.html"), "utf8");

  assert.match(intro, /TTS/);
  assert.match(chant, /챈트/);
  assert.match(song, /Suno 스타일 지시문/);
  assert.match(song, /가사/);
  assert.match(html, /pilot-a4\.css/);

  assert.doesNotMatch(intro, /[ㄱ-ㅎ]/, `${lessonName} intro TTS should spell consonants by name`);
  assert.doesNotMatch(chant, /[ㄱ-ㅎ]/, `${lessonName} chant should spell consonants by name`);
  assert.doesNotMatch(song, /[ㄱ-ㅎ]/, `${lessonName} song should spell consonants by name`);

  if (lessonName === "lesson-01-gogo-nana") {
    for (const fileName of lesson1AudioFiles) {
      assert.ok(existsSync(path.join(lessonDir, fileName)), `lesson 1 audio ${fileName} should exist`);
    }

    assert.match(intro, /기역 길/);
    assert.match(intro, /니은 길/);
    assert.match(intro, /\[g\] \[g\] \[g\]/);
    assert.match(intro, /\[n\] \[n\] \[n\]/);
    assert.doesNotMatch(intro, /그 그 그|느 느 느/);

    assert.match(chant, /기역 길/);
    assert.match(chant, /니은 길/);
    assert.match(chant, /\[g\] \[g\] \[g\]/);
    assert.match(chant, /\[n\] \[n\] \[n\]/);
    assert.doesNotMatch(chant, /그 그 그|느 느 느/);

    assert.match(song, /기역 길/);
    assert.match(song, /니은 길/);
    assert.match(song, /그 그 그/);
    assert.match(song, /느 느 느/);
    assert.doesNotMatch(song, /\[g\]|\[n\]/);
  }

  if (lessonName === "lesson-03-dodo-rara") {
    const imageFiles = worksheet.pages
      .flatMap((page) => [...(page.cards || []), ...(page.tiles || [])])
      .map((card) => card.image ? path.basename(card.image) : "")
      .filter(Boolean);

    for (const fileName of lesson2AssetFiles) {
      assert.ok(imageFiles.includes(fileName), `lesson 3 worksheet should reference ${fileName}`);
    }
    assert.equal(imageFiles.length, 20, "lesson 3 spot cards and sorting tiles should all use image assets");
  }

  if (lessonName === "lesson-02-mimi-bubu") {
    const imageFiles = worksheet.pages
      .flatMap((page) => [...(page.cards || []), ...(page.tiles || [])])
      .map((card) => card.image ? path.basename(card.image) : "")
      .filter(Boolean);

    assert.equal(
      worksheet.pages[0].read,
      "나는 미미 문어야. ㅁ 네모 길이 있는 어항에 살고 있어.",
      "mimi worksheet intro should place the ㅁ path on the fishbowl"
    );
    assert.match(intro, /미음 네모 길이 있는 어항에 살고 있어/);
    assert.doesNotMatch(intro, /내 몸에는 미음 길이 있어/);

    for (const fileName of lesson3AssetFiles) {
      assert.ok(imageFiles.includes(fileName), `lesson 3 worksheet should reference ${fileName}`);
    }
    assert.equal(imageFiles.length, 20, "lesson 3 spot cards and sorting tiles should all use image assets");
  }

  if (lessonName === "lesson-04-sasa-haha") {
    const imageFiles = worksheet.pages
      .flatMap((page) => [...(page.cards || []), ...(page.tiles || [])])
      .map((card) => card.image ? path.basename(card.image) : "")
      .filter(Boolean);

    assert.equal(
      worksheet.pages[0].read,
      "나는 사사 사슴이야. 내 뿔에는 ㅅ 산 길이 있어.",
      "sasa worksheet intro should place the ㅅ path on the antlers"
    );
    assert.equal(worksheet.pages[2].letter, "ㅎ", "lesson 4 should pair ㅅ with ㅎ while ㅇ is postponed");
    assert.match(worksheet.pages[2].read, /하하 하마/);
    assert.match(intro, /내 뿔에는 시옷 산 길이 있어/);
    assert.doesNotMatch(intro, /내 몸에는 시옷 길이 있어/);
    assert.match(intro, /하하 하마/);
    assert.doesNotMatch(intro, /아아 아기/);

    for (const fileName of lesson4AssetFiles) {
      assert.ok(imageFiles.includes(fileName), `lesson 4 worksheet should reference ${fileName}`);
    }
    assert.equal(imageFiles.length, 20, "lesson 4 spot cards and sorting tiles should all use image assets");
  }

  if (lessonName === "lesson-05-jiji-chichi") {
    const imageFiles = worksheet.pages
      .flatMap((page) => [...(page.cards || []), ...(page.tiles || [])])
      .map((card) => card.image ? path.basename(card.image) : "")
      .filter(Boolean);

    assert.equal(
      worksheet.pages[0].read,
      "나는 지지 지렁이야. ㅈ 길이 있는 나무를 좋아해.",
      "jiji worksheet intro should place the ㅈ path on a tree"
    );
    assert.match(intro, /지읒 길이 있는 나무를 좋아해/);
    assert.doesNotMatch(intro, /내 몸에는 지읒 길이 있어/);

    for (const fileName of lesson5AssetFiles) {
      assert.ok(imageFiles.includes(fileName), `lesson 5 worksheet should reference ${fileName}`);
    }
    assert.equal(imageFiles.length, 20, "lesson 5 spot cards and sorting tiles should all use image assets");
  }

  if (lessonName === "lesson-06-koko-toto-pupu") {
    const imageFiles = worksheet.pages
      .flatMap((page) => [...(page.cards || []), ...(page.tiles || [])])
      .map((card) => card.image ? path.basename(card.image) : "")
      .filter(Boolean);

    assert.equal(worksheet.pages.length, 7, "lesson 6 should include three character/spot pairs plus sorting");
    assert.deepEqual(
      worksheet.pages.filter((page) => page.type === "character").map((page) => page.letter),
      ["ㅋ", "ㅌ", "ㅍ"],
      "lesson 6 should cover ㅋ, ㅌ, ㅍ"
    );
    const sorting = worksheet.pages.at(-1);
    assert.deepEqual(
      sorting.houses.map((house) => house.title),
      ["ㅋ 집", "ㅌ 집", "ㅍ 집"],
      "lesson 6 sorting should have three houses"
    );
    assert.equal(sorting.tileColumns, 3, "lesson 6 sorting tiles should use a balanced 3-column layout");
    assert.equal(sorting.tiles.length, 9, "lesson 6 sorting should keep three tiles per consonant");
    assert.match(intro, /코코 코알라/);
    assert.match(intro, /토토 토끼/);
    assert.match(intro, /푸푸 풍선/);
    assert.match(song, /푸푸 프 프 프/);

    for (const fileName of lesson6AssetFiles) {
      assert.ok(imageFiles.includes(fileName), `lesson 6 worksheet should reference ${fileName}`);
    }
    assert.equal(imageFiles.length, 27, "lesson 6 spot cards and sorting tiles should all use image assets");
  }
}
