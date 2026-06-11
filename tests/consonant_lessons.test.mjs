import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("lessons", "consonants");

const expectedLessons = [
  "lesson-01-gogo-nana",
  "lesson-02-dodo-rara",
  "lesson-03-mimi-bubu",
  "lesson-04-sasa-aa",
  "lesson-05-jiji-chichi",
  "lesson-06-koko-toto",
  "lesson-07-pupu-haha",
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

const lesson1AudioFiles = [
  "\u3131 \ucc48\ud2b8.wav",
  "\u3134 \ucc48\ud2b8.wav",
  "\u3131, \u3134 \uc18c\uac1c.wav",
];

for (const fileName of lesson2AssetFiles) {
  assert.ok(existsSync(path.resolve("worksheets", "assets", fileName)), `lesson 2 asset ${fileName} should exist`);
}

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
  assert.equal(worksheet.pages.length, 5, `${lessonName} should keep the 5-page pilot structure`);
  assert.deepEqual(
    worksheet.pages.map((page) => page.type),
    ["character", "spot", "character", "spot", "sorting"],
    `${lessonName} should use character, spot, character, spot, sorting pages`
  );

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

  if (lessonName === "lesson-02-dodo-rara") {
    const imageFiles = worksheet.pages
      .flatMap((page) => [...(page.cards || []), ...(page.tiles || [])])
      .map((card) => card.image ? path.basename(card.image) : "")
      .filter(Boolean);

    for (const fileName of lesson2AssetFiles) {
      assert.ok(imageFiles.includes(fileName), `lesson 2 worksheet should reference ${fileName}`);
    }
    assert.equal(imageFiles.length, 20, "lesson 2 spot cards and sorting tiles should all use image assets");
  }
}
