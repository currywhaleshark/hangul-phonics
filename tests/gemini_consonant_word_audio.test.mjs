import assert from "node:assert/strict";

import {
  buildPrompt,
  consonantWordLessons,
  fileSafeWord,
  resolveOutputDir,
  resolveTtsModel,
  resolveLessonKeys,
  targetsForLesson,
  targetsForLessons,
} from "../tools/generate_gemini_consonant_word_audio.mjs";

assert.equal(consonantWordLessons.length, 6);
assert.deepEqual(
  consonantWordLessons.map((lesson) => lesson.key),
  [
    "lesson-01-gogo-nana",
    "lesson-02-mimi-bubu",
    "lesson-03-dodo-rara",
    "lesson-04-sasa-haha",
    "lesson-05-jiji-chichi",
    "lesson-06-koko-toto-pupu",
  ],
);

assert.deepEqual(resolveLessonKeys([]), ["lesson-01-gogo-nana"]);
assert.deepEqual(resolveLessonKeys(["1"]), ["lesson-01-gogo-nana"]);
assert.deepEqual(resolveLessonKeys(["6"]), ["lesson-06-koko-toto-pupu"]);
assert.deepEqual(resolveLessonKeys(["1-6"]), consonantWordLessons.map((lesson) => lesson.key));
assert.deepEqual(resolveLessonKeys(["all"]), consonantWordLessons.map((lesson) => lesson.key));
assert.deepEqual(resolveLessonKeys(["lesson-05-jiji-chichi"]), ["lesson-05-jiji-chichi"]);
assert.throws(() => resolveLessonKeys(["7"]), /Unknown consonant word lesson/);

assert.equal(fileSafeWord("강아지"), "강아지");
assert.equal(fileSafeWord("A/B"), "A_B");

assert.equal(resolveTtsModel({}), "gemini-3.1-flash-tts-preview");
assert.equal(resolveTtsModel({ GEMINI_TTS_MODEL: "custom-tts-model" }), "custom-tts-model");
assert.equal(resolveOutputDir("C:/repo", {}), "C:\\repo\\public\\audio-gemini-candidates\\consonant-words".replaceAll("\\", pathSeparator()));
assert.equal(resolveOutputDir("C:/repo", { GEMINI_TTS_OUTPUT_DIR: "public/audio/custom" }), "C:\\repo\\public\\audio\\custom".replaceAll("\\", pathSeparator()));
assert.equal(resolveOutputDir("C:/repo", { GEMINI_TTS_OUTPUT_DIR: "D:/audio" }), "D:\\audio".replaceAll("\\", pathSeparator()));

function pathSeparator() {
  return process.platform === "win32" ? "\\" : "/";
}

assert.deepEqual(
  targetsForLesson("lesson-01-gogo-nana").map((target) => [target.word, target.fileName]),
  [
    ["강아지", "lesson-01-gogo-nana_01_강아지.mp3"],
    ["곰", "lesson-01-gogo-nana_02_곰.mp3"],
    ["고기", "lesson-01-gogo-nana_03_고기.mp3"],
    ["과자", "lesson-01-gogo-nana_04_과자.mp3"],
    ["국수", "lesson-01-gogo-nana_05_국수.mp3"],
    ["노란색", "lesson-01-gogo-nana_06_노란색.mp3"],
    ["너구리", "lesson-01-gogo-nana_07_너구리.mp3"],
    ["나무", "lesson-01-gogo-nana_08_나무.mp3"],
    ["나비", "lesson-01-gogo-nana_09_나비.mp3"],
    ["낮잠", "lesson-01-gogo-nana_10_낮잠.mp3"],
  ],
);

assert.deepEqual(
  targetsForLesson("lesson-06-koko-toto-pupu").map((target) => target.word),
  ["쿠키", "콩", "카드", "크레용", "코끼리", "토마토", "택시", "타조", "튤립", "토끼풀", "포도", "피자", "풀", "풍선", "파도"],
);

const combined = targetsForLessons(["1"]);
assert.equal(combined.length, 10);
assert.equal(combined[0].label, "lesson-01-gogo-nana #1 강아지");

const prompt = buildPrompt(["강아지", "곰", "고기"]);
assert.match(prompt, /밝고 다정한 유아 선생님 목소리/);
assert.match(prompt, /강아지\. \[pause\] 곰\. \[pause\] 고기\./);
assert.doesNotMatch(prompt, /lesson-01/);
