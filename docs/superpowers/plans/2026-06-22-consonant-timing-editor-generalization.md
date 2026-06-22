# Consonant Timing Editor Generalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the timing editor and timed video renderer work for selectable consonant characters instead of only Gogo.

**Architecture:** `tools/timing-editor-core.js` becomes the source of truth for timing project catalog data and JSON normalization. `timing-editor.js` renders the selected project and stores each project under its own localStorage key. The Python renderer reads project metadata from timing JSON instead of using Gogo-only constants.

**Tech Stack:** Vite, browser ES modules, Node `.mjs` assertion tests, Python Pillow/ffmpeg renderer.

---

### Task 1: Timing Project Catalog

**Files:**
- Modify: `tools/timing-editor-core.js`
- Test: `tests/timing_editor_core.test.mjs`

- [ ] **Step 1: Write the failing test**

Add assertions that require a multi-character catalog and shared lesson audio:

```js
import {
  CONSONANT_TIMING_PROJECTS,
  createDefaultTimingProject,
  getTimingProjectDefinition,
  getTimingStorageKey,
  getTimingExportFileName,
} from "../tools/timing-editor-core.js";

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
assert.deepEqual(mimi.cues.map((cue) => cue.label), ["모자", "문", "물", "무지개", "미끄럼틀"]);
assert.equal(getTimingStorageKey("mimi-m"), "hangul-phonics:timing:mimi-m");
assert.equal(getTimingExportFileName(mimi), "mimi-m-card-timings.json");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/timing_editor_core.test.mjs`

Expected: FAIL because the new exports do not exist.

- [ ] **Step 3: Write minimal implementation**

Add a catalog with project ids such as `gogo-g`, `nana-n`, `mimi-m`, `bubu-b`, `dodo-d`, `rara-r`, `sasa-s`, `haha-h`, `jiji-j`, `chichi-ch`, `koko-k`, `toto-t`, `pupu-p`. Keep `createDefaultGogoTimingProject()` as a compatibility wrapper around `createDefaultTimingProject("gogo-g")`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/timing_editor_core.test.mjs`

Expected: PASS.

### Task 2: Editor Project Selector

**Files:**
- Modify: `timing-editor.html`
- Modify: `timing-editor.js`
- Test: `tests/timing_editor_static.test.mjs`

- [ ] **Step 1: Write the failing test**

Add static assertions:

```js
assert.match(html, /id="project-selector"/, "timing editor should expose a character selector");
assert.match(js, /CONSONANT_TIMING_PROJECTS/, "editor should render catalog project options");
assert.match(js, /createDefaultTimingProject/, "editor should create defaults by selected project id");
assert.match(js, /getTimingStorageKey/, "editor should persist each timing project separately");
assert.match(js, /setSegmentBoundary/, "editor should set segment boundaries from current audio time");
assert.match(js, /download = getTimingExportFileName/, "editor should export a project-specific filename");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/timing_editor_static.test.mjs`

Expected: FAIL because selector and generic helpers are absent.

- [ ] **Step 3: Write minimal implementation**

Add `<select id="project-selector">`, dynamic title/eyebrow/letter/mascot/background elements, per-project load/save, selector change handling, and segment boundary setting.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/timing_editor_static.test.mjs`

Expected: PASS.

### Task 3: Renderer Metadata Generalization

**Files:**
- Modify: `tools/render_gogo_timed_lesson_video.py`
- Test: `tests/render_gogo_timed_video.test.mjs`

- [ ] **Step 1: Write the failing test**

Replace Gogo-only checks with metadata-driven checks:

```js
assert.match(renderer, /resolve_audio_path/, "renderer should resolve audio from timing metadata");
assert.match(renderer, /project\.get\("character"\)/, "renderer should read character metadata");
assert.match(renderer, /cue\.label/, "renderer should draw popup labels from cues");
assert.doesNotMatch(renderer, /label="ㄱ"/, "renderer should not force all letter popups to ㄱ");
assert.doesNotMatch(renderer, /find_gogo_cat/, "renderer should not use a Gogo-only character finder");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/render_gogo_timed_video.test.mjs`

Expected: FAIL because the renderer still hardcodes Gogo metadata.

- [ ] **Step 3: Write minimal implementation**

Read `character.image`, `character.letter`, `audio.src`, `render.background`, and cue `image` directly from the timing project. Keep fallback output paths compatible with the current Gogo JSON.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/render_gogo_timed_video.test.mjs`

Expected: PASS.

### Task 4: Verification

**Files:**
- Modify as needed from prior tasks only.

- [ ] **Step 1: Run focused tests**

Run:

```bash
node tests/timing_editor_core.test.mjs
node tests/timing_editor_static.test.mjs
node tests/render_gogo_timed_video.test.mjs
```

Expected: all PASS.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: Vite build succeeds and assets copy without errors.

- [ ] **Step 3: Inspect git diff**

Run: `git diff --stat`

Expected: changes are limited to timing editor, renderer, tests, and plan/spec docs.

