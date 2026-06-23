# Timing Editor Video Render Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "render video" action to the timing editor so the adjusted timing project can produce an MP4 and preview image from the web app.

**Architecture:** Add a small Vite dev-server plugin that accepts the current timing project JSON, writes it to a temporary generated timing file, invokes the existing Python/ffmpeg renderer, and returns output URLs. Add a timing-editor button that posts the current project and shows progress plus generated links.

**Tech Stack:** Vite dev server middleware, Node.js child_process/fs/path APIs, existing `tools/render_gogo_timed_lesson_video.py`, browser fetch from `timing-editor.js`, Node assert-based tests.

---

### Task 1: Server Render Endpoint

**Files:**
- Modify: `vite.editor.config.js`
- Test: `tests/timing_editor_render_endpoint.test.mjs`

- [ ] **Step 1: Write failing static/behavior test**

```js
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const config = readFileSync("vite.editor.config.js", "utf8");

assert.match(config, /\/api\/timing-render/, "editor dev server should expose a timing render API");
assert.match(config, /render_gogo_timed_lesson_video\.py/, "render API should call the existing Python renderer");
assert.match(config, /spawn/, "render API should execute the renderer without shell string composition");
assert.match(config, /public\/video-assets\/consonant-lesson-samples/, "render API should write generated lesson videos to the public samples directory");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/timing_editor_render_endpoint.test.mjs`

Expected: FAIL because `vite.editor.config.js` does not yet define `/api/timing-render`.

- [ ] **Step 3: Implement minimal endpoint**

Add a Vite middleware plugin that:
- handles `POST /api/timing-render`
- reads JSON request body
- validates `id`, `render.outputSlug`, `segment.start`, and `segment.end`
- writes `tmp/timing-render/<slug>-card-timings.json`
- runs `python tools/render_gogo_timed_lesson_video.py --timings <file> --output public/video-assets/consonant-lesson-samples/<slug>-timed-lesson.mp4 --preview public/video-assets/consonant-lesson-samples/<slug>-timed-lesson-preview.jpg`
- returns `{ videoUrl, previewUrl, output, preview }`

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/timing_editor_render_endpoint.test.mjs`

Expected: PASS.

### Task 2: Timing Editor UI

**Files:**
- Modify: `timing-editor.html`
- Modify: `timing-editor.js`
- Modify: `timing-editor.css`
- Test: `tests/timing_editor_static.test.mjs`

- [ ] **Step 1: Write failing UI test**

Add assertions that:
- `timing-editor.html` exposes `id="render-video"`
- `timing-editor.html` exposes `id="render-output"`
- `timing-editor.js` posts to `/api/timing-render`
- `timing-editor.js` uses `serializeTimingProject(project)` in the render request

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/timing_editor_static.test.mjs`

Expected: FAIL because render UI is missing.

- [ ] **Step 3: Implement minimal UI**

Add a "영상 만들기" button beside JSON save. On click, disable the button, show rendering status, POST the serialized project JSON to `/api/timing-render`, then show MP4 and preview links. On error, show a short failure status.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/timing_editor_static.test.mjs`

Expected: PASS.

### Task 3: Verification

**Files:**
- No new code files.

- [ ] **Step 1: Run focused tests**

Run:
```bash
node tests/timing_editor_render_endpoint.test.mjs
node tests/timing_editor_static.test.mjs
node tests/timing_editor_core.test.mjs
```

Expected: all commands exit 0.

- [ ] **Step 2: Inspect git status**

Run: `git status --short`

Expected: only the intended plan, endpoint, UI, test, and generated Bubu files are changed or untracked.
