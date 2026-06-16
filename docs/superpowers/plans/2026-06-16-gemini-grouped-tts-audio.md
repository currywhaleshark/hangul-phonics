# Gemini Grouped TTS Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Gemini TTS generator that speaks Hangul syllables in small consonant groups and splits the result into existing per-syllable MP3 filenames.

**Architecture:** A single Node ESM tool exports pure helpers for group selection, prompt construction, silence parsing, and segment planning, then runs the Gemini/ffmpeg workflow only when executed directly. Output goes to `public/audio-gemini-candidates/grouped`, while grouped source WAV files are retained for listening and recutting.

**Tech Stack:** Node.js ESM, built-in `node:test`/`node:assert`, Google Vertex Gemini TTS via `gcloud.cmd`, `ffmpeg`, `ffprobe`.

---

### Task 1: Pure Grouping And Segmentation Helpers

**Files:**
- Create: `tests/gemini_grouped_audio.test.mjs`
- Create: `tools/generate_gemini_grouped_audio.mjs`

- [ ] **Step 1: Write the failing test**

```js
import assert from "node:assert/strict";
import {
  buildPrompt,
  parseSilenceDetect,
  planSegments,
  resolveGroups,
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

const prompt = buildPrompt(["가", "고", "구"]);
assert.match(prompt, /밝고 다정한 유아 선생님/);
assert.match(prompt, /가\. \[pause\] 고\. \[pause\] 구\./);

const silences = parseSilenceDetect(`
[silencedetect @ 000] silence_start: 0
[silencedetect @ 000] silence_end: 0.42 | silence_duration: 0.42
[silencedetect @ 000] silence_start: 0.91
[silencedetect @ 000] silence_end: 1.73 | silence_duration: 0.82
[silencedetect @ 000] silence_start: 2.22
[silencedetect @ 000] silence_end: 3.03 | silence_duration: 0.81
`);
assert.deepEqual(
  planSegments({ silences, duration: 3.6, expectedCount: 3 }),
  [
    { start: 0.42, end: 0.91 },
    { start: 1.73, end: 2.22 },
    { start: 3.03, end: 3.6 },
  ]
);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests\gemini_grouped_audio.test.mjs`
Expected: FAIL because `tools/generate_gemini_grouped_audio.mjs` does not exist.

- [ ] **Step 3: Implement pure helpers and CLI shell**

Create `tools/generate_gemini_grouped_audio.mjs` with exported helpers and a direct-run `main()` guard. Do not call Gemini during import.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests\gemini_grouped_audio.test.mjs`
Expected: PASS.

### Task 2: Gemini And ffmpeg Workflow

**Files:**
- Modify: `tools/generate_gemini_grouped_audio.mjs`

- [ ] **Step 1: Complete direct-run workflow**

The tool must read `public/audio`, resolve requested groups, call Gemini once per group, write source WAV files under `public/audio-gemini-candidates/grouped/_source_wav`, run `ffprobe`/`ffmpeg silencedetect`, split each segment to MP3, and keep existing MP3 candidates unless `GEMINI_TTS_FORCE=1`.

- [ ] **Step 2: Run local tests**

Run: `node tests\gemini_grouped_audio.test.mjs`
Expected: PASS.

- [ ] **Step 3: Run full repository tests**

Run: `node --test tests\*.test.mjs`
Expected: PASS.

- [ ] **Step 4: Optional live smoke test**

Run: `node tools\generate_gemini_grouped_audio.mjs ㄱ`
Expected: Creates or skips `public/audio-gemini-candidates/grouped/01_가.mp3` through `08_기.mp3`. This requires network, `gcloud.cmd`, Gemini TTS access, `ffmpeg`, and `ffprobe`.

### Self-Review

- Spec coverage: The plan covers grouped Gemini generation, source retention, existing filename preservation, and first `ㄱ` group testing.
- Placeholder scan: No placeholder steps remain.
- Type consistency: Helper names in tests match the intended exports.
