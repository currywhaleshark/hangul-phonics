import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../public/qr/youtube/manifest.json", import.meta.url), "utf8"));
const entriesById = new Map(manifest.entries.map((entry) => [entry.videoId, entry]));

for (const entry of manifest.entries) {
  assert.ok(existsSync(entry.qrPng), `QR PNG should exist for ${entry.videoId}`);
  assert.ok(existsSync(entry.qrSvg), `QR SVG should exist for ${entry.videoId}`);
}

const label = "\uC601\uC0C1 \uBCF4\uAE30";
const expectedConsonantVideos = new Map([
  ["\u3131", "N7r2qrSWOQk"],
  ["\u3134", "04iCkuQBEE0"],
  ["\u3141", "uc8sECik0gQ"],
  ["\u3142", "I7aMk9JULsA"],
  ["\u3137", "EGbu60mGhWM"],
  ["\u3139", "9ab6BAY9c_w"],
  ["\u3145", "fGREJFb7V50"],
  ["\u314E", "upWvAbNaMU8"],
  ["\u3148", "4Ra9valn7Bo"],
  ["\u314A", "Z-kxqwLAlqI"],
  ["\u314B", "WT2v898ZpOs"],
  ["\u314C", "QgrjnfacHV0"],
  ["\u314D", "WSbmbqNcWn8"],
]);
const consonantLessonIds = [
  "lesson-01-gogo-nana",
  "lesson-02-mimi-bubu",
  "lesson-03-dodo-rara",
  "lesson-04-sasa-haha",
  "lesson-05-jiji-chichi",
  "lesson-06a-koko-toto-pupu-meet",
];
let consonantMatches = 0;

for (const lessonId of consonantLessonIds) {
  const worksheet = JSON.parse(await readFile(new URL(`../lessons/consonants/${lessonId}/worksheet.json`, import.meta.url), "utf8"));
  for (const page of worksheet.pages.filter((item) => item.type === "character")) {
    const videoId = expectedConsonantVideos.get(page.letter);
    if (!videoId) continue;
    const entry = entriesById.get(videoId);
    assert.ok(entry, `manifest should include video ${videoId}`);
    assert.deepEqual(page.videoQr, {
      label,
      url: entry.url,
      image: `../../../public/qr/youtube/${videoId}.png`,
    });
    consonantMatches += 1;
  }
}

assert.equal(consonantMatches, expectedConsonantVideos.size, "all available consonant videos should be attached to character pages");

const expectedVowelVideos = new Map([
  ["\uC544", "jiq5R5GOnSY"],
  ["\uC624", "SM-5rr_zXMg"],
  ["\uC6B0", "veGNGGLLHog"],
]);
const vowelWorksheet = JSON.parse(await readFile(new URL("../lessons/vowels/lesson-01-aa-baby-vowel/worksheet.json", import.meta.url), "utf8"));
let vowelMatches = 0;
for (const page of vowelWorksheet.pages.filter((item) => item.type === "vowel-activity")) {
  const videoId = expectedVowelVideos.get(page.traceLetter);
  if (!videoId) continue;
  const entry = entriesById.get(videoId);
  assert.deepEqual(page.videoQr, {
    label,
    url: entry.url,
    image: `../../../public/qr/youtube/${videoId}.png`,
  });
  vowelMatches += 1;
}

assert.equal(vowelMatches, expectedVowelVideos.size, "all available vowel videos should be attached to activity pages");
