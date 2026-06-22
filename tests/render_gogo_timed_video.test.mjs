import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const renderer = readFileSync("tools/render_gogo_timed_lesson_video.py", "utf8");
const timings = JSON.parse(
  readFileSync("lessons/consonants/lesson-01-gogo-nana/gogo-g-card-timings.json", "utf8"),
);

assert.match(renderer, /resolve_audio_path/, "renderer should resolve audio from timing metadata");
assert.match(renderer, /letterCues/, "renderer should read letter popup cues");
assert.match(renderer, /cue\.end/, "renderer should keep popups visible until their end time");
assert.match(renderer, /atrim=start=/, "renderer should trim the supplied intro audio");
assert.match(renderer, /gogo-g-background\.png/, "renderer should reuse the generated lesson background");
assert.match(renderer, /make_letter_popup/, "renderer should draw ㄱ letter popups");

assert.equal(timings.audio.src, "lessons/consonants/lesson-01-gogo-nana/ㄱ, ㄴ 소개.wav");
assert.deepEqual(
  timings.cues.map((cue) => cue.label),
  ["강아지", "곰", "고기", "과자", "국수"],
);
assert.deepEqual(
  timings.letterCues.map((cue) => cue.label),
  ["ㄱ", "ㄱ", "ㄱ", "ㄱ", "ㄱ", "ㄱ", "ㄱ", "ㄱ", "ㄱ"],
);
assert.equal(timings.cues[0].start, 13.915);
assert.equal(timings.cues[0].end, 22.741);
assert.deepEqual(timings.cues[0].position, { left: 23.842, top: 28.222 });
assert.equal(timings.letterCues.length, 9);
assert.equal(timings.letterCues.at(-1).id, "g-repeat-6");
assert.equal(timings.letterCues.at(-1).end, 32.427);

