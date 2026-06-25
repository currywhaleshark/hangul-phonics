import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const renderer = readFileSync("tools/render_gogo_timed_lesson_video.py", "utf8");
const timings = JSON.parse(
  readFileSync("lessons/consonants/lesson-01-gogo-nana/gogo-g-card-timings.json", "utf8"),
);

assert.match(renderer, /resolve_audio_path/, "renderer should resolve audio from timing metadata");
assert.match(renderer, /resolve_ffmpeg_binary/, "renderer should resolve the ffmpeg executable before spawning it");
assert.match(renderer, /FFMPEG_BINARY/, "renderer should accept an explicit ffmpeg binary path from the environment");
assert.match(renderer, /shutil\.which\("ffmpeg"\)/, "renderer should fall back to ffmpeg on PATH");
assert.match(renderer, /LOCALAPPDATA/, "renderer should search Winget package installs when PATH lacks ffmpeg");
assert.match(renderer, /WinGet/, "renderer should know the Winget package directory name");
assert.match(renderer, /letterCues/, "renderer should read letter popup cues");
assert.match(renderer, /cue\.end/, "renderer should keep popups visible until their end time");
assert.match(renderer, /atrim=start=/, "renderer should trim the supplied intro audio");
assert.match(renderer, /gogo-g-background\.png/, "renderer should reuse the generated lesson background");
assert.match(renderer, /make_letter_popup/, "renderer should draw ㄱ letter popups");
assert.match(renderer, /vowel-story/, "renderer should branch for vowel story timing projects");
assert.match(renderer, /sceneCues/, "renderer should read vowel story scene cues");
assert.match(renderer, /build_vowel_story_frames/, "renderer should render vowel story scenes separately from consonant cards");
assert.match(renderer, /vowel-combine-story/, "renderer should branch for vowel combine story timing projects");
assert.match(renderer, /combineCues/, "renderer should read vowel combine cue sprites");
assert.match(renderer, /normalize_combine_cues/, "renderer should normalize combine cue metadata");
assert.match(renderer, /build_vowel_combine_story_frames/, "renderer should render vowel combine story frames");
assert.match(renderer, /combine_sprite_motion/, "renderer should animate baby and tool sprites toward the center");

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
