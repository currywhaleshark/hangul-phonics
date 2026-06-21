import assert from "node:assert/strict";

import {
  assertUsableOutputDuration,
  buildPrompt,
  buildRepairPrompt,
  groupedTrimFilter,
  parseSilenceDetect,
  planSegments,
  repairSyllablesFromArgs,
  resolveGroups,
  targetsForSyllables,
  targetsForGroup,
} from "../tools/generate_gemini_grouped_audio.mjs";

const sampleFiles = [
  "01_가.mp3",
  "02_고.mp3",
  "03_구.mp3",
  "04_거.mp3",
  "05_교.mp3",
  "06_규.mp3",
  "07_그.mp3",
  "08_기.mp3",
];

assert.deepEqual(resolveGroups([]), ["ㄱ"]);
assert.deepEqual(resolveGroups(["all"]).slice(0, 2), ["ㄱ", "ㄴ"]);
assert.deepEqual(
  targetsForGroup("ㄱ", sampleFiles),
  sampleFiles.map((fileName) => ({ syllable: fileName.match(/_(.+)\.mp3$/u)[1], fileName }))
);
assert.throws(
  () => targetsForGroup("ㄱ", sampleFiles.slice(0, -1)),
  /Missing source audio filenames for ㄱ: 기/
);

const repairFiles = ["15_므.mp3", "61_죠.mp3", "62_쥬.mp3", "63_즈.mp3", "70_츄.mp3", "85_툐.mp3"];
const repairSyllables = ["므", "죠", "쥬", "즈", "츄", "툐"];
assert.deepEqual(repairSyllablesFromArgs(["--repair", "므,죠", "쥬", "즈,츄,툐"]), repairSyllables);
assert.equal(repairSyllablesFromArgs(["ㄱ"]), null);
assert.deepEqual(
  targetsForSyllables(repairSyllables, repairFiles),
  repairFiles.map((fileName) => ({ syllable: fileName.match(/_(.+)\.mp3$/u)[1], fileName }))
);
assert.throws(
  () => targetsForSyllables(repairSyllables, repairFiles.slice(0, -1)),
  /Missing source audio filenames for selected syllables: 툐/
);

const prompt = buildPrompt(["가", "고", "구"]);
assert.match(prompt, /밝고 다정한 유아 선생님/);
assert.match(prompt, /가\. \[pause\] 고\. \[pause\] 구\./);
assert.doesNotMatch(prompt, /01_가/);

const repairPrompt = buildRepairPrompt(repairSyllables);
assert.match(repairPrompt, /교정 녹음/);
assert.match(repairPrompt, /므는 미음에 으/);
assert.match(repairPrompt, /툐는 티읕에 요/);
assert.match(repairPrompt, /므\. \[pause\] 죠\. \[pause\] 쥬\. \[pause\] 즈\. \[pause\] 츄\. \[pause\] 툐\./);
assert.doesNotMatch(repairPrompt, /15_므/);

const singleRepairPrompt = buildRepairPrompt(["즈"]);
assert.match(singleRepairPrompt, /즈\./);
assert.doesNotMatch(singleRepairPrompt, /즈는 지읒에 으/);
assert.doesNotMatch(singleRepairPrompt, /지나 주가 아니라/);

const silences = parseSilenceDetect(`
[silencedetect @ 000] silence_start: 0
[silencedetect @ 000] silence_end: 0.42 | silence_duration: 0.42
[silencedetect @ 000] silence_start: 0.91
[silencedetect @ 000] silence_end: 1.73 | silence_duration: 0.82
[silencedetect @ 000] silence_start: 2.22
[silencedetect @ 000] silence_end: 3.03 | silence_duration: 0.81
`);

assert.deepEqual(silences, [
  { start: 0, end: 0.42, duration: 0.42 },
  { start: 0.91, end: 1.73, duration: 0.82 },
  { start: 2.22, end: 3.03, duration: 0.81 },
]);
assert.deepEqual(
  planSegments({ silences, duration: 3.6, expectedCount: 3 }),
  [
    { start: 0.42, end: 0.91 },
    { start: 1.73, end: 2.22 },
    { start: 3.03, end: 3.6 },
  ]
);
assert.throws(
  () => planSegments({ silences, duration: 3.6, expectedCount: 4 }),
  /Expected 4 audio segments, detected 3/
);

assert.match(groupedTrimFilter(), /areverse/);
assert.doesNotMatch(groupedTrimFilter(), /stop_periods/);
assert.doesNotThrow(() => assertUsableOutputDuration({ fileName: "29_됴.mp3" }, 0.52));
assert.throws(
  () => assertUsableOutputDuration({ fileName: "29_됴.mp3" }, 0.08),
  /29_됴\.mp3: output duration 0\.080s is shorter than 0\.250s/
);

const plosiveSilences = [
  { start: 0, end: 0.292, duration: 0.292 },
  { start: 0.802, end: 1.867, duration: 1.065 },
  { start: 2.502, end: 3.411, duration: 0.909 },
  { start: 4.001, end: 4.281, duration: 0.28 },
  { start: 4.477, end: 4.914, duration: 0.437 },
  { start: 5.434, end: 6.144, duration: 0.71 },
  { start: 6.896, end: 7.215, duration: 0.319 },
  { start: 7.314, end: 7.65, duration: 0.336 },
  { start: 8.254, end: 8.575, duration: 0.321 },
  { start: 8.666, end: 9.055, duration: 0.389 },
  { start: 9.604, end: 9.918, duration: 0.314 },
  { start: 9.996, end: 10.383, duration: 0.387 },
];

assert.deepEqual(
  planSegments({ silences: plosiveSilences, duration: 10.971, expectedCount: 8 }),
  [
    { start: 0.292, end: 0.802 },
    { start: 1.867, end: 2.502 },
    { start: 3.411, end: 4.001 },
    { start: 4.914, end: 5.434 },
    { start: 6.144, end: 6.896 },
    { start: 7.65, end: 8.254 },
    { start: 9.055, end: 9.604 },
    { start: 10.383, end: 10.971 },
  ]
);

const splitWordSilences = [
  { start: 0, end: 0.282, duration: 0.282 },
  { start: 1.206, end: 2.844, duration: 1.638 },
  { start: 3.269, end: 5.429, duration: 2.16 },
  { start: 6.13, end: 8.263, duration: 2.133 },
  { start: 9.017, end: 11.137, duration: 2.12 },
  { start: 11.826, end: 13.889, duration: 2.063 },
  { start: 14.636, end: 16.285, duration: 1.649 },
  { start: 17.107, end: 19.03, duration: 1.924 },
  { start: 19.503, end: 21.631, duration: 2.128 },
  { start: 22.313, end: 24.253, duration: 1.94 },
  { start: 24.45, end: 24.748, duration: 0.298 },
  { start: 25.018, end: 25.52, duration: 0.502 },
];

assert.deepEqual(
  planSegments({ silences: splitWordSilences, duration: 25.52, expectedCount: 10, minSegmentDuration: 0.18 }),
  [
    { start: 0.282, end: 1.206 },
    { start: 2.844, end: 3.269 },
    { start: 5.429, end: 6.13 },
    { start: 8.263, end: 9.017 },
    { start: 11.137, end: 11.826 },
    { start: 13.889, end: 14.636 },
    { start: 16.285, end: 17.107 },
    { start: 19.03, end: 19.503 },
    { start: 21.631, end: 22.313 },
    { start: 24.253, end: 25.018 },
  ]
);
