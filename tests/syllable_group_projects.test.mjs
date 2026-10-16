import assert from "node:assert/strict";

import {
  SYLLABLE_GROUP_DEFINITIONS,
  buildSyllableGroupProject,
  getSyllableGroupDefinition,
  groupAudioFile,
  groupNarrationLines,
} from "../tools/syllable-group-projects.mjs";
import { buildYoutubeTitle, syllableCombineUploadProjects } from "../tools/youtube-upload-core.mjs";
import { createDefaultTimingProject } from "../tools/timing-editor-core.js";

assert.deepEqual(SYLLABLE_GROUP_DEFINITIONS.map((definition) => definition.id), ["yeo-group", "yo-group", "yu-group", "wa-group"]);

const yeo = getSyllableGroupDefinition("yeo-group");
assert.equal(groupAudioFile(yeo), "group_겨녀벼혀_yeo-group.mp3");
assert.deepEqual(groupNarrationLines(yeo), [
  "여여 두 풍선에 자음 친구들이 놀러 와요.",
  "고고 고양이가 오면, 그, 여, 겨!",
  "나나 나비가 오면, 느, 여, 녀!",
  "부부 부엉이가 오면, 브, 여, 벼!",
  "하하 하마가 오면, 흐, 여, 혀!",
  "겨울, 소녀, 벼, 혀.",
  "겨, 녀, 벼, 혀!",
]);

const wa = getSyllableGroupDefinition("wa-group");
assert.deepEqual(groupNarrationLines(wa).slice(1, 4), ["오, 아, 빨리 붙이면 와!", "아아 아기가 오면, 와!", "고고 고양이가 오면, 그, 와, 과!"]);

// One narration line per scene: the character walks in at the line start and turns into the
// syllable just before its last phrase.
const lines = groupNarrationLines(yeo).map((text, index) => ({ text, start: index * 5, end: index * 5 + 4, lastPhraseStart: index * 5 + 3 }));
const project = buildSyllableGroupProject(yeo, lines, 35);
assert.equal(project.template, "syllable-group-story");
assert.equal(project.segment.end, 35);
const gogo = project.combineCues.filter((cue) => cue.id.startsWith("yeo-group-겨-"));
assert.deepEqual(gogo.map((cue) => [cue.assetKind, cue.start, cue.end]), [
  ["tool", 5, 7.85],
  ["character", 5, 7.85],
  ["combined", 7.85, 10],
]);
assert.deepEqual(project.letterCues.map((cue) => [cue.label, cue.start, cue.end]), [
  ["겨", 7.85, 35], ["녀", 12.85, 35], ["벼", 17.85, 35], ["혀", 22.85, 35],
]);
assert.deepEqual(project.cues.map((cue) => [cue.label, cue.badge]), [["겨울", "겨"], ["소녀", "녀"], ["벼", "벼"], ["혀", "혀"]]);
assert.ok(project.cues.every((cue) => cue.start >= 24.9 && cue.end === 35));
assert.equal(project.combineCues.filter((cue) => cue.assetKind === "combined").at(-1).end, 25);

const waProject = buildSyllableGroupProject(wa, groupNarrationLines(wa).map((text, index) => ({ text, start: index * 5, end: index * 5 + 4, lastPhraseStart: index * 5 + 3 })), 30);
assert.deepEqual(waProject.letterCues[0], { id: "wa-group-merged", label: "ㅘ", start: 7.9, end: 10, position: { left: 80, top: 22 } });

const uploads = syllableCombineUploadProjects();
const yeoUpload = uploads.find((upload) => upload.id === "yeo-group");
assert.equal(buildYoutubeTitle(yeoUpload), "여여 두 풍선과 자음 친구들 | 겨·녀·벼·혀");
assert.equal(buildYoutubeTitle(createDefaultTimingProject("ya-ya")), "아아 아기와 야야 두 나뭇가지 | ㅇ+ㅑ=야");
assert.equal(createDefaultTimingProject("yu-yu").audio.src, "public/audio-gemini-candidates/vowel-combination-tts/vowel_유_yu.mp3");
