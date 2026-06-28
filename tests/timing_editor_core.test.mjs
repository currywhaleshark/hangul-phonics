import assert from "node:assert/strict";

import {
  CONSONANT_TIMING_PROJECTS,
  TIMING_PROJECTS,
  clampTime,
  createDefaultGogoTimingProject,
  createDefaultTimingProject,
  formatClockTime,
  getTimingExportFileName,
  getTimingProjectDefinition,
  getTimingStorageKey,
  parseTimingProject,
  removeCue,
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
  assert.ok(CONSONANT_TIMING_PROJECTS.length > 1);
  assert.equal(getTimingProjectDefinition("mimi-m").character.letter, "ㅁ");
  assert.equal(
    getTimingProjectDefinition("mimi-m").audio.src,
    getTimingProjectDefinition("bubu-b").audio.src,
  );

  const mimi = createDefaultTimingProject("mimi-m");
  assert.equal(mimi.id, "mimi-m");
  assert.equal(mimi.character.name, "미미 문어");
  assert.equal(mimi.character.letter, "ㅁ");
  assert.deepEqual(
    mimi.cues.map((cue) => cue.label),
    ["모자", "문", "물", "무지개", "미끄럼틀"],
  );
  assert.equal(getTimingStorageKey("mimi-m"), "hangul-phonics:timing:mimi-m");
  assert.equal(getTimingExportFileName(mimi), "mimi-m-card-timings.json");
  const nana = createDefaultTimingProject("nana-n");
  assert.deepEqual(
    nana.cues.map((cue) => cue.label),
    ["노란색", "너구리", "나무", "낮잠"],
  );
  assert.equal(nana.cues.some((cue) => cue.label === "나비"), false);
  assert.deepEqual(
    nana.cues.map((cue) => cue.id),
    ["nana-word-1", "nana-word-2", "nana-word-3", "nana-word-5"],
  );
  assert.deepEqual(nana.removedCueIds, { cues: ["nana-word-4"] });

  const legacyNana = {
    ...nana,
    removedCueIds: undefined,
    cues: [
      ...nana.cues.slice(0, 3),
      {
        ...nana.cues[3],
        id: "nana-word-4",
        label: "나비",
        image: "worksheets/assets/butterfly.png",
      },
      {
        ...nana.cues[3],
        id: "nana-word-5",
        label: "낮잠",
        image: "worksheets/assets/nap.png",
      },
    ],
  };
  const migratedNana = parseTimingProject(JSON.stringify(legacyNana));
  assert.deepEqual(
    migratedNana.cues.map((cue) => cue.label),
    ["노란색", "너구리", "나무", "낮잠"],
  );
  assert.deepEqual(
    migratedNana.cues.map((cue) => cue.id),
    ["nana-word-1", "nana-word-2", "nana-word-3", "nana-word-5"],
  );
  assert.deepEqual(migratedNana.removedCueIds, { cues: ["nana-word-4"] });
}

{
  const project = createDefaultGogoTimingProject();
  const updated = removeCue(project, "bear");
  const parsed = parseTimingProject(serializeTimingProject(updated));

  assert.deepEqual(
    updated.cues.map((cue) => cue.id),
    ["dog", "meat", "snack", "noodles"],
  );
  assert.deepEqual(updated.removedCueIds, { cues: ["bear"] });
  assert.deepEqual(
    parsed.cues.map((cue) => cue.id),
    ["dog", "meat", "snack", "noodles"],
  );
  assert.deepEqual(parsed.removedCueIds, { cues: ["bear"] });
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

{
  const aa = createDefaultTimingProject("aa-a");

  assert.equal(TIMING_PROJECTS.some((project) => project.id === "aa-a"), true);
  assert.equal(aa.template, "vowel-story", "aa-a should use the vowel story template");
  assert.equal(aa.audio.src, "lessons/vowels/lesson-01-aa-baby-vowel/\uC544.wav");
  assert.equal(aa.segment.end, 21.12);
  assert.deepEqual(
    aa.sceneCues.map((cue) => cue.image),
    [
      "lessons/vowels/lesson-01-aa-baby-vowel/aa-story-01-silent.png",
      "lessons/vowels/lesson-01-aa-baby-vowel/aa-story-02-branch.png",
      "lessons/vowels/lesson-01-aa-baby-vowel/aa-story-03-ah.png",
      "\uC544\uC544 \uC544\uAE30 \uB098\uBB47\uAC00\uC9C0 \uC2DC\uC548.png",
    ],
  );
  assert.deepEqual(aa.cues.map((cue) => cue.label), ["\uC544\uAE30", "\uC544\uCE68", "\uC544\uC774\uC2A4\uD06C\uB9BC"]);
  assert.deepEqual(aa.letterCues.map((cue) => cue.label), ["\uC544", "\uC544", "\uC544"]);
  assert.equal(getTimingExportFileName(aa), "aa-a-vowel-timings.json");
  assert.equal(parseTimingProject(serializeTimingProject(aa)).sceneCues.length, 4);
}

{
  const oo = createDefaultTimingProject("oo-o");
  const uu = createDefaultTimingProject("uu-u");

  assert.equal(TIMING_PROJECTS.some((project) => project.id === "oo-o"), true);
  assert.equal(TIMING_PROJECTS.some((project) => project.id === "uu-u"), true);
  assert.equal(oo.template, "vowel-combine-story");
  assert.equal(uu.template, "vowel-combine-story");
  assert.equal(oo.audio.src, "lessons/vowels/lesson-01-aa-baby-vowel/\uC624.wav");
  assert.equal(uu.audio.src, "lessons/vowels/lesson-01-aa-baby-vowel/\uC6B0.wav");
  assert.equal(oo.segment.end, 19.4);
  assert.equal(uu.segment.end, 16.28);
  assert.deepEqual(oo.cues.map((cue) => cue.label), ["\uC624\uC774", "\uC624\uB9AC", "\uC624\uB791\uC6B0\uD0C4"]);
  assert.deepEqual(uu.cues.map((cue) => cue.label), ["\uC6B0\uC0B0", "\uC6B0\uC720", "\uC6B0\uBB3C"]);
  assert.deepEqual(oo.letterCues.map((cue) => cue.label), ["\uC624", "\uC624"]);
  assert.deepEqual(uu.letterCues.map((cue) => cue.label), ["\uC6B0", "\uC6B0"]);
  assert.deepEqual(
    oo.combineCues.map((cue) => cue.assetKind),
    ["baby", "tool", "combined"],
  );
  const combineScales = Object.fromEntries(oo.combineCues.map((cue) => [cue.assetKind, cue.scale]));
  assert.ok(combineScales.combined >= 1.05, "combined vowel story sprite should use a larger hero scale");
  assert.ok(
    combineScales.combined > combineScales.tool,
    "combined vowel story sprite should be larger than the standalone vowel tool",
  );
  assert.deepEqual(
    uu.combineCues.map((cue) => cue.image),
    [
      "public/video-assets/characters/consonants/\u3147-aa-baby.png",
      "public/video-assets/vowel-alpha/tools/\uC6B0\uC6B0 \uBC1C\uD310-alpha.png",
      "public/video-assets/vowel-alpha/combined-hero/\uC6B0\uC6B0 \uBC1C\uD310 \uC2DC\uC548-hero.png",
    ],
  );
  assert.doesNotMatch(
    oo.combineCues.find((cue) => cue.assetKind === "baby").image,
    /\uB098\uBB47\uAC00\uC9C0/,
    "vowel combine baby cue should use the empty-handed baby artwork, not the branch image",
  );
  assert.equal(getTimingExportFileName(oo), "oo-o-vowel-timings.json");
  assert.equal(getTimingExportFileName(uu), "uu-u-vowel-timings.json");
  assert.equal(oo.render.background, "public/video-assets/vowel-backgrounds/vowel-combine-playroom.png");
  assert.equal(uu.render.background, "public/video-assets/vowel-backgrounds/vowel-combine-playroom.png");
  assert.match(oo.combineCues.find((cue) => cue.assetKind === "combined").image, /combined-hero/);
  assert.match(uu.combineCues.find((cue) => cue.assetKind === "combined").image, /combined-hero/);

  const parsed = parseTimingProject(serializeTimingProject(oo));
  assert.equal(parsed.combineCues.length, 3);
  assert.deepEqual(parsed.combineCues[0].fromPosition, { left: 18, top: 56 });
  assert.deepEqual(parsed.combineCues[0].toPosition, { left: 43, top: 56 });
  const legacySavedOo = createDefaultTimingProject("oo-o");
  legacySavedOo.combineCues[0].image = "public/video-assets/vowel-alpha/combined/\uC544\uC544 \uC544\uAE30 \uB098\uBB47\uAC00\uC9C0 \uC2DC\uC548-alpha.png";
  legacySavedOo.combineCues[0].position.left = 41;
  legacySavedOo.combineCues[2].image = "public/video-assets/vowel-alpha/combined/\uC624\uC624 \uC0C1\uC790 \uC2DC\uC548-alpha.png";
  legacySavedOo.combineCues[2].scale = 0.9;

  const migratedSavedOo = parseTimingProject(JSON.stringify(legacySavedOo));
  assert.equal(
    migratedSavedOo.combineCues.find((cue) => cue.assetKind === "baby").image,
    "public/video-assets/characters/consonants/\u3147-aa-baby.png",
  );
  assert.equal(
    migratedSavedOo.combineCues.find((cue) => cue.assetKind === "baby").position.left,
    41,
    "asset migration should keep hand-adjusted cue positions",
  );
  assert.equal(
    migratedSavedOo.combineCues.find((cue) => cue.assetKind === "combined").image,
    "public/video-assets/vowel-alpha/combined-hero/\uC624\uC624 \uC0C1\uC790 \uC2DC\uC548-hero.png",
  );
  assert.equal(migratedSavedOo.combineCues.find((cue) => cue.assetKind === "combined").scale, 1.05);

}

{
  const expectedIds = [
    "ga-a",
    "go-o",
    "na-a",
    "no-o",
    "ma-a",
    "mo-o",
    "ba-a",
    "bo-o",
    "da-a",
    "do-o",
    "ra-a",
    "ro-o",
    "sa-a",
    "so-o",
    "ha-a",
    "ho-o",
    "ja-a",
    "jo-o",
    "cha-a",
    "cho-o",
    "ka-a",
    "ko-o",
    "ta-a",
    "to-o",
    "pa-a",
    "po-o",
  ];

  expectedIds.forEach((projectId) => {
    assert.equal(TIMING_PROJECTS.some((project) => project.id === projectId), true, `${projectId} should exist`);
  });

  const ga = createDefaultTimingProject("ga-a");
  assert.equal(ga.template, "syllable-combine-story");
  assert.equal(ga.audio.src, "public/audio-gemini-candidates/vowel-combination-tts/01_가_ga.mp3");
  assert.equal(ga.character.name, "고고 고양이");
  assert.equal(ga.character.letter, "ㄱ");
  assert.equal(ga.targetSyllable, "가");
  assert.equal(ga.vowel.letter, "ㅏ");
  assert.equal(ga.vowel.sound, "아");
  assert.equal(ga.render.timingFile, "ga-a-syllable-timings.json");
  assert.deepEqual(
    ga.combineCues.map((cue) => [cue.assetKind, cue.label]),
    [
      ["character", "고고 고양이"],
      ["tool", "아아 나뭇가지"],
      ["combined", "가"],
    ],
  );
  assert.deepEqual(
    ga.letterCues.map((cue) => cue.label),
    ["ㄱ", "ㅏ", "가", "가"],
  );
  assert.deepEqual(ga.cues.map((cue) => cue.label), ["가방", "가지", "가위"]);
  assert.equal(ga.combineCues.find((cue) => cue.assetKind === "tool").image, "public/video-assets/vowel-alpha/tools/아아 나뭇가지-alpha.png");
  assert.match(ga.combineCues.find((cue) => cue.assetKind === "combined").image, /고고 가/);
  assert.deepEqual(
    ga.combineCues.map((cue) => [cue.assetKind, cue.position, cue.toPosition]),
    [
      ["character", { left: 43, top: 56 }, { left: 43, top: 56 }],
      ["tool", { left: 58, top: 57 }, { left: 58, top: 57 }],
      ["combined", { left: 52.895, top: 63.591 }, { left: 52.895, top: 63.591 }],
    ],
  );
  assert.deepEqual(
    ga.cues.map((cue) => cue.position),
    [
      { left: 16.579, top: 53.86 },
      { left: 88.263, top: 31.965 },
      { left: 88.263, top: 79.123 },
    ],
  );
  assert.deepEqual(
    ga.letterCues.map((cue) => cue.position),
    [
      { left: 26.789, top: 23.544 },
      { left: 77.947, top: 25.789 },
      { left: 52.263, top: 17.743 },
      { left: 53.526, top: 18.491 },
    ],
  );

  const go = createDefaultTimingProject("go-o");
  assert.equal(go.audio.src, "public/audio-gemini-candidates/vowel-combination-tts/02_고_go.mp3");
  assert.equal(go.vowel.letter, "ㅗ");
  assert.deepEqual(go.letterCues.map((cue) => cue.label), ["ㄱ", "ㅗ", "고", "고"]);
  assert.deepEqual(go.cues.map((cue) => cue.label), ["고양이", "고구마", "고래"]);
  assert.deepEqual(go.cues.map((cue) => cue.position), ga.cues.map((cue) => cue.position));
  assert.deepEqual(go.letterCues.map((cue) => cue.position), ga.letterCues.map((cue) => cue.position));

  const ta = createDefaultTimingProject("ta-a");
  assert.deepEqual(ta.cues.map((cue) => cue.label), ["타조", "치타", "낙타"]);
  const to = createDefaultTimingProject("to-o");
  assert.deepEqual(to.cues.map((cue) => cue.label), ["토끼", "토마토", "토끼풀"]);
  const po = createDefaultTimingProject("po-o");
  assert.deepEqual(po.cues.map((cue) => cue.label), ["포도", "포크", "폭포"]);

  const parsed = parseTimingProject(serializeTimingProject(ga));
  assert.equal(parsed.combineCues.length, 3);
  assert.equal(parsed.letterCues.length, 4);
  assert.equal(parsed.combineCues.find((cue) => cue.assetKind === "character").image, ga.character.image);
}
{
  const oo = createDefaultTimingProject("oo-o");
  const moved = setCuePosition(oo, "oo-tool", { left: 61.2345, top: 55.6789 }, "combineCues");
  assert.deepEqual(moved.combineCues.find((cue) => cue.id === "oo-tool").position, { left: 61.235, top: 55.679 });

  const trimmed = removeCue(oo, "oo-tool", "combineCues");
  assert.equal(trimmed.combineCues.some((cue) => cue.id === "oo-tool"), false);
  assert.deepEqual(trimmed.removedCueIds.combineCues, ["oo-tool"]);
}

{
  for (const projectId of ["oo-o", "uu-u"]) {
    const project = createDefaultTimingProject(projectId);
    for (const collectionName of ["cues", "letterCues", "sceneCues", "combineCues"]) {
      for (const cue of project[collectionName]) {
        assert.ok(
          cue.start >= project.segment.start,
          `${projectId} ${collectionName} ${cue.id} starts before segment`,
        );
        assert.ok(
          cue.end <= project.segment.end,
          `${projectId} ${collectionName} ${cue.id} ends after segment`,
        );
      }
    }
  }
}

assert.throws(
  () => {
    const project = createDefaultTimingProject("oo-o");
    project.combineCues[0].fromPosition.left = "near";
    parseTimingProject(JSON.stringify(project));
  },
  /combine cue fromPosition/,
);

assert.throws(
  () => {
    const project = createDefaultTimingProject("oo-o");
    project.combineCues[0].assetKind = "other";
    parseTimingProject(JSON.stringify(project));
  },
  /combine cue assetKind/,
);
