import assert from "node:assert/strict";

import { buildCombinationText, combinationFileName, selectItems } from "../tools/generate_gemini_combination_tts.mjs";
import { mapFrontPhrases, mapTailPhrases } from "../tools/align_syllable_combine_timings.mjs";

const gu = selectItems(["gu"])[0];
assert.equal(combinationFileName(gu), "27_구_gu");
assert.equal(
  buildCombinationText(gu),
  [
    "고고 고양이가 우우 발판에 앉았어요.",
    "고고의 소리, 그! 우우 발판의 소리, 우!",
    "그,우!",
    "둘이 합치면, 구!",
    "구름, 축구공.",
    "구!",
  ].join("\n"),
);
assert.equal(selectItems(["u"]).length, 13);
assert.deepEqual(selectItems(["구", "nu"]).map((item) => item.slug), ["gu", "nu"]);
assert.throws(() => selectItems(["xx"]), /Unknown combination item/);

// Pauses detected in 27_구_gu.mp3.
const segments = [
  [0, 1.39], [2.18, 4.45], [5.48, 6.42], [6.94, 7.16], [8.35, 9.87], [10.51, 10.74], [12.01, 12.39],
  [12.97, 13.32], [13.99, 15.17], [15.92, 16.18], [17.3, 17.77], [18.68, 19.29], [20.16, 20.41],
].map(([start, end]) => ({ start, end }));

const tail = mapTailPhrases(segments, 2);
assert.equal(tail.vowelSound.start, 10.51);
assert.equal(tail.target.start, 15.92);
assert.deepEqual(tail.words.map((word) => word.start), [17.3, 18.68]);
assert.equal(tail.final.start, 20.16);
assert.equal(mapTailPhrases(segments, 4), null);

const front = mapFrontPhrases(segments, tail.vowelSound.start);
assert.deepEqual(front.opening, { start: 0, end: 4.45 });
assert.equal(front.owner.start, 5.48);
assert.equal(front.initialSound.start, 6.94);
assert.equal(front.vowelOwner.start, 8.35);

// A long phrase split into small pieces must not be mistaken for the owner/initial sound.
const split = [...segments.slice(0, 4), { start: 8.35, end: 8.7 }, { start: 9.0, end: 9.3 }, { start: 9.6, end: 9.87 }];
assert.equal(mapFrontPhrases(split, 10.51), null);

import { buildVowelIntroText } from "../tools/generate_gemini_combination_tts.mjs";
import { mapVowelIntroPhrases } from "../tools/align_syllable_combine_timings.mjs";

const [eoIntro] = selectItems(["intro"]);
assert.equal(combinationFileName(eoIntro), "vowel_어_eo");
assert.equal(
  buildVowelIntroText(eoIntro),
  ["아아 아기가", "어어 풍선을 만나", "어! 입을 크게 벌리고 같이 말해요.", "어!", "어항, 상어.", "어!"].join("\n"),
);
assert.equal(selectItems(["eo"]).length, 11);
assert.equal(selectItems(["eu"]).length, 10);
assert.equal(selectItems(["i"]).length, 11);
assert.equal(buildCombinationText(selectItems(["기"])[0]).split("\n")[0], "고고 고양이가 이이 막대를 잡고 섰어요.");

// Pauses detected in vowel_이_i.mp3: the first "이!" is the short phrase before the long mouth sentence.
const introSegments = [
  [0, 1.89], [3.41, 3.74], [4.0, 5.76], [7.26, 7.94], [9.49, 11.66], [11.97, 12.94],
  [14.24, 14.92], [16.42, 17.02], [18.12, 18.7], [20.01, 20.71],
].map(([start, end]) => ({ start, end }));
const intro = mapVowelIntroPhrases(introSegments, 2);
assert.equal(intro.say.start, 14.24);
assert.deepEqual(intro.words.map((word) => word.start), [16.42, 18.12]);
assert.equal(intro.combineSwitch, (5.76 + 7.26) / 2);
