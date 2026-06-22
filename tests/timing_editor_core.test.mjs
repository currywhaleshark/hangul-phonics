import assert from "node:assert/strict";

import {
  clampTime,
  createDefaultGogoTimingProject,
  formatClockTime,
  parseTimingProject,
  serializeTimingProject,
  setCueEnd,
  setCuePosition,
  setCueStart,
  sortCues,
} from "../tools/timing-editor-core.js";

assert.equal(clampTime(-1, 0, 10), 0);
assert.equal(clampTime(12.3456, 0, 20), 12.346);
assert.equal(clampTime(99, 0, 35.37), 35.37);

assert.equal(formatClockTime(0), "00:00.000");
assert.equal(formatClockTime(83.040272), "01:23.040");
assert.equal(formatClockTime(14.2), "00:14.200");

{
  const project = createDefaultGogoTimingProject();

  assert.equal(project.audio.src, "lessons/consonants/lesson-01-gogo-nana/ㄱ, ㄴ 소개.wav");
  assert.equal(project.segment.start, 0);
  assert.equal(project.segment.end, 35.37);
  assert.deepEqual(
    project.cues.map((cue) => cue.label),
    ["강아지", "곰", "고기", "과자", "국수"],
  );
  assert.deepEqual(project.cues[0].position, { left: 20, top: 39 });
  assert.equal(project.cues[0].start, 14.2);
  assert.equal(project.cues[0].end, 15.45);
  assert.deepEqual(
    project.letterCues.map((cue) => cue.label),
    ["ㄱ", "ㄱ", "ㄱ", "ㄱ", "ㄱ", "ㄱ", "ㄱ", "ㄱ", "ㄱ"],
  );
  assert.equal(project.letterCues.length, 9);
  assert.deepEqual(project.letterCues[1].position, { left: 56, top: 26 });
  assert.equal(project.letterCues.at(-1).id, "g-repeat-6");
}

{
  const project = createDefaultGogoTimingProject();
  const updated = setCueStart(project, "bear", 16.23456);

  assert.equal(project.cues.find((cue) => cue.id === "bear").start, 15.75);
  assert.equal(updated.cues.find((cue) => cue.id === "bear").start, 16.235);
  assert.equal(updated.cues.find((cue) => cue.id === "bear").end, 16.85);
}

{
  const project = createDefaultGogoTimingProject();
  const updated = setCueEnd(project, "bear", 17.45678);

  assert.equal(project.cues.find((cue) => cue.id === "bear").end, 16.85);
  assert.equal(updated.cues.find((cue) => cue.id === "bear").end, 17.457);
}

{
  const project = createDefaultGogoTimingProject();
  const updated = setCueEnd(project, "g-repeat-2", 29.87654, "letterCues");

  assert.equal(project.letterCues.find((cue) => cue.id === "g-repeat-2").end, 29.63);
  assert.equal(updated.letterCues.find((cue) => cue.id === "g-repeat-2").end, 29.877);
}

{
  const project = createDefaultGogoTimingProject();
  const updated = setCueEnd(project, "dog", 1);

  assert.equal(updated.cues.find((cue) => cue.id === "dog").end, 14.23);
}

{
  const project = createDefaultGogoTimingProject();
  const updated = setCuePosition(project, "dog", { left: 24.5678, top: 44.1234 });

  assert.deepEqual(project.cues.find((cue) => cue.id === "dog").position, { left: 20, top: 39 });
  assert.deepEqual(updated.cues.find((cue) => cue.id === "dog").position, { left: 24.568, top: 44.123 });
}

{
  const project = createDefaultGogoTimingProject();
  const updated = setCuePosition(project, "g-intro-1", { left: -10, top: 120 }, "letterCues");

  assert.deepEqual(updated.letterCues.find((cue) => cue.id === "g-intro-1").position, { left: 5, top: 95 });
}

{
  const unordered = [
    { id: "third", start: 3 },
    { id: "first", start: 1 },
    { id: "second", start: 1 },
  ];

  assert.deepEqual(
    sortCues(unordered).map((cue) => cue.id),
    ["first", "second", "third"],
  );
}

{
  const project = createDefaultGogoTimingProject();
  const json = serializeTimingProject(project);
  const parsed = parseTimingProject(json);

  assert.deepEqual(parsed, project);
  assert.match(json, /"schemaVersion": 1/);
  assert.match(json, /"label": "강아지"/);
  assert.match(json, /"letterCues"/);
  assert.match(json, /"position"/);
  assert.match(json, /"end"/);
  assert.equal(parsed.cues.some((cue) => "duration" in cue), false);
  assert.equal(parsed.letterCues.some((cue) => "duration" in cue), false);
}

{
  const project = createDefaultGogoTimingProject();
  delete project.letterCues;
  delete project.cues[0].position;
  const parsed = parseTimingProject(JSON.stringify(project));

  assert.equal(parsed.letterCues.length, 9);
  assert.deepEqual(parsed.cues[0].position, { left: 20, top: 39 });
}

{
  const project = createDefaultGogoTimingProject();
  delete project.cues[0].end;
  project.cues[0].duration = 1.75;
  const parsed = parseTimingProject(JSON.stringify(project));

  assert.equal(parsed.cues[0].end, 15.95);
  assert.equal(parsed.cues[0].duration, undefined);
}

{
  const project = createDefaultGogoTimingProject();
  project.cues[0].position = { left: 33, top: 55 };
  const parsed = parseTimingProject(JSON.stringify(project));

  assert.deepEqual(parsed.cues[0].position, { left: 33, top: 55 });
}

assert.throws(
  () => {
    const project = createDefaultGogoTimingProject();
    project.cues[0].start = "soon";
    parseTimingProject(JSON.stringify(project));
  },
  /cue start/,
);

assert.throws(
  () => {
    const project = createDefaultGogoTimingProject();
    project.cues[0].end = "later";
    parseTimingProject(JSON.stringify(project));
  },
  /cue end/,
);