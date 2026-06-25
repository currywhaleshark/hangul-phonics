# Vowel Combine Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add editable and renderable `오` and `우` vowel-combine story timing projects.

**Architecture:** Keep the existing `아` `vowel-story` path intact and add a new `vowel-combine-story` template. The timing core owns project data and validation, the browser editor previews and edits all cue collections, and the Python renderer draws the final video from the exported JSON.

**Tech Stack:** Vanilla ES modules, Node `assert` tests, Vite timing editor, Python Pillow renderer, ffmpeg.

---

## File Structure

- Modify `tools/timing-editor-core.js`: add `오`/`우` project definitions, `combineCues`, default timings, merge/parse/validation support.
- Modify `tests/timing_editor_core.test.mjs`: prove the new projects load, serialize, parse, and support `combineCues`.
- Modify `timing-editor.html`: add a cue list section for combine story cues.
- Modify `timing-editor.js`: render/edit combine cue rows, draw combine sprites in preview, include combine markers in timeline.
- Modify `timing-editor.css`: style combine cue rows and transparent sprite previews.
- Modify `tests/timing_editor_static.test.mjs`: assert editor markup and JS/CSS hooks exist.
- Modify `tools/render_gogo_timed_lesson_video.py`: add a dedicated `vowel-combine-story` frame builder.
- Modify `tests/render_gogo_timed_video.test.mjs`: assert renderer support for the new template.

---

### Task 1: Timing Core Data And Validation

**Files:**
- Modify: `tests/timing_editor_core.test.mjs`
- Modify: `tools/timing-editor-core.js`

- [ ] **Step 1: Write failing core tests**

Append this block to `tests/timing_editor_core.test.mjs` after the existing `aa-a` vowel-story block:

```js
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
  assert.deepEqual(
    uu.combineCues.map((cue) => cue.image),
    [
      "public/video-assets/vowel-alpha/combined/\uC544\uC544 \uC544\uAE30 \uB098\uBB47\uAC00\uC9C0 \uC2DC\uC548-alpha.png",
      "public/video-assets/vowel-alpha/tools/\uC6B0\uC6B0 \uBC1C\uD310-alpha.png",
      "public/video-assets/vowel-alpha/combined/\uC6B0\uC6B0 \uBC1C\uD310 \uC2DC\uC548-alpha.png",
    ],
  );
  assert.equal(getTimingExportFileName(oo), "oo-o-vowel-timings.json");
  assert.equal(getTimingExportFileName(uu), "uu-u-vowel-timings.json");

  const parsed = parseTimingProject(serializeTimingProject(oo));
  assert.equal(parsed.combineCues.length, 3);
  assert.deepEqual(parsed.combineCues[0].fromPosition, { left: 18, top: 56 });
  assert.deepEqual(parsed.combineCues[0].toPosition, { left: 43, top: 56 });
}

{
  const oo = createDefaultTimingProject("oo-o");
  const moved = setCuePosition(oo, "oo-tool", { left: 61.2345, top: 55.6789 }, "combineCues");
  assert.deepEqual(moved.combineCues.find((cue) => cue.id === "oo-tool").position, { left: 61.235, top: 55.679 });

  const trimmed = removeCue(oo, "oo-tool", "combineCues");
  assert.equal(trimmed.combineCues.some((cue) => cue.id === "oo-tool"), false);
  assert.deepEqual(trimmed.removedCueIds.combineCues, ["oo-tool"]);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node tests/timing_editor_core.test.mjs
```

Expected: FAIL with `Unknown timing project id: oo-o`.

- [ ] **Step 3: Add combine constants and project definitions**

In `tools/timing-editor-core.js`, add these constants after `VOWEL_STORY_LETTER_TIMES`:

```js
const VOWEL_COMBINE_TIMES = [
  {
    id: "baby",
    label: "\uC544\uC544 \uC544\uAE30",
    assetKind: "baby",
    start: 0.2,
    end: 5.8,
    fromPosition: { left: 18, top: 56 },
    toPosition: { left: 43, top: 56 },
    position: { left: 43, top: 56 },
    scale: 0.54,
  },
  {
    id: "tool",
    label: "\uBAA8\uC74C\uB3C4\uAD6C",
    assetKind: "tool",
    start: 0.2,
    end: 5.8,
    fromPosition: { left: 82, top: 57 },
    toPosition: { left: 58, top: 57 },
    position: { left: 58, top: 57 },
    scale: 0.74,
  },
  {
    id: "combined",
    label: "\uD569\uCE5C \uC774\uBBF8\uC9C0",
    assetKind: "combined",
    start: 5.55,
    end: 11.6,
    fromPosition: { left: 50, top: 55 },
    toPosition: { left: 50, top: 55 },
    position: { left: 50, top: 55 },
    scale: 0.62,
  },
];

const VOWEL_COMBINE_WORD_TIMES = [
  { start: 12.0, end: 13.25, position: { left: 24, top: 72 }, accent: "#ffb703" },
  { start: 13.15, end: 14.4, position: { left: 50, top: 72 }, accent: "#8ecae6" },
  { start: 14.3, end: 15.65, position: { left: 76, top: 72 }, accent: "#ff8fab" },
];

const VOWEL_COMBINE_LETTER_TIMES = [
  { id: "say", start: 8.3, end: 10.0, position: { left: 50, top: 22 } },
  { id: "final", start: 15.75, end: 18.8, position: { left: 50, top: 22 } },
];

const vowelAlphaToolAsset = (file) => `public/video-assets/vowel-alpha/tools/${file}`;
const vowelAlphaCombinedAsset = (file) => `public/video-assets/vowel-alpha/combined/${file}`;
```

Extend `LESSON_AUDIO` with the two timing-only audio ids:

```js
  "lesson-01-aa-baby-vowel-o": {
    src: "lessons/vowels/lesson-01-aa-baby-vowel/\uC624.wav",
    duration: 19.400272,
  },
  "lesson-01-aa-baby-vowel-u": {
    src: "lessons/vowels/lesson-01-aa-baby-vowel/\uC6B0.wav",
    duration: 16.280272,
  },
```

Add a `VOWEL_COMBINE_TIMING_PROJECTS` export before `TIMING_PROJECTS`:

```js
export const VOWEL_COMBINE_TIMING_PROJECTS = [
  defineVowelCombineProject({
    id: "oo-o",
    lessonId: "lesson-01-aa-baby-vowel-o",
    segment: { start: 0, end: 19.4 },
    character: {
      key: "oo",
      name: "\uC624\uC624 \uC0C1\uC790",
      letter: "\uC624",
      image: vowelAlphaCombinedAsset("\uC624\uC624 \uC0C1\uC790 \uC2DC\uC548-alpha.png"),
    },
    toolLabel: "\uC624\uC624 \uC0C1\uC790",
    toolImage: vowelAlphaToolAsset("\uC624\uC624 \uC0C1\uC790-alpha.png"),
    combinedImage: vowelAlphaCombinedAsset("\uC624\uC624 \uC0C1\uC790 \uC2DC\uC548-alpha.png"),
    words: [
      { id: "oo-cucumber", label: "\uC624\uC774", image: asset("cucumber.png") },
      { id: "oo-duck", label: "\uC624\uB9AC", image: asset("duck.png") },
      { id: "oo-orangutan", label: "\uC624\uB791\uC6B0\uD0C4", image: asset("orangutan.png") },
    ],
  }),
  defineVowelCombineProject({
    id: "uu-u",
    lessonId: "lesson-01-aa-baby-vowel-u",
    segment: { start: 0, end: 16.28 },
    character: {
      key: "uu",
      name: "\uC6B0\uC6B0 \uBC1C\uD310",
      letter: "\uC6B0",
      image: vowelAlphaCombinedAsset("\uC6B0\uC6B0 \uBC1C\uD310 \uC2DC\uC548-alpha.png"),
    },
    toolLabel: "\uC6B0\uC6B0 \uBC1C\uD310",
    toolImage: vowelAlphaToolAsset("\uC6B0\uC6B0 \uBC1C\uD310-alpha.png"),
    combinedImage: vowelAlphaCombinedAsset("\uC6B0\uC6B0 \uBC1C\uD310 \uC2DC\uC548-alpha.png"),
    words: [
      { id: "uu-umbrella", label: "\uC6B0\uC0B0", image: asset("umbrella.png") },
      { id: "uu-milk", label: "\uC6B0\uC720", image: asset("milk.png") },
      { id: "uu-well", label: "\uC6B0\uBB3C", image: asset("well.png") },
    ],
  }),
];

export const TIMING_PROJECTS = [...CONSONANT_TIMING_PROJECTS, ...VOWEL_TIMING_PROJECTS, ...VOWEL_COMBINE_TIMING_PROJECTS];
```

- [ ] **Step 4: Add core builders and collection support**

In `tools/timing-editor-core.js`, add this builder after `defineVowelStoryProject`:

```js
function defineVowelCombineProject({ id, lessonId, segment, character, toolLabel, toolImage, combinedImage, words }) {
  const audio = LESSON_AUDIO[lessonId];
  return buildDefaultTimingProject({
    id,
    lessonId,
    template: "vowel-combine-story",
    title: `${character.name} ${character.letter} \uBAA8\uC74C \uB9CC\uB0A8`,
    character,
    audio,
    segment: { label: character.name, ...segment },
    words,
    combine: {
      babyImage: vowelAlphaCombinedAsset("\uC544\uC544 \uC544\uAE30 \uB098\uBB47\uAC00\uC9C0 \uC2DC\uC548-alpha.png"),
      toolLabel,
      toolImage,
      combinedImage,
    },
    render: {
      outputSlug: id,
      timingFile: `${id}-vowel-timings.json`,
    },
  });
}
```

Update `buildDefaultTimingProject` so it includes:

```js
    combineCues: makeCombineCues(definition.combine, definition.character.key, definition.segment.start, definition.template),
```

Add this function after `makeSceneCues`:

```js
function makeCombineCues(combine, characterKey, segmentStart, template = "consonant-card") {
  if (template !== "vowel-combine-story" || !combine) {
    return [];
  }

  const images = {
    baby: combine.babyImage,
    tool: combine.toolImage,
    combined: combine.combinedImage,
  };
  const labels = {
    baby: "\uC544\uAE30",
    tool: combine.toolLabel,
    combined: "\uD569\uCE5C \uC774\uBBF8\uC9C0",
  };

  return VOWEL_COMBINE_TIMES.map((timing) => ({
    id: `${characterKey}-${timing.id}`,
    label: labels[timing.assetKind],
    assetKind: timing.assetKind,
    image: images[timing.assetKind],
    start: catalogTime(segmentStart + timing.start),
    end: catalogTime(segmentStart + timing.end),
    fromPosition: clonePlainObject(timing.fromPosition),
    toPosition: clonePlainObject(timing.toPosition),
    position: clonePlainObject(timing.position),
    scale: timing.scale,
  }));
}
```

Change `makeWordCues` and `makeLetterCues` timing selection:

```js
    const vowelTiming = template === "vowel-story"
      ? VOWEL_STORY_WORD_TIMES[index]
      : template === "vowel-combine-story"
        ? VOWEL_COMBINE_WORD_TIMES[index]
        : null;
```

```js
  const timings = template === "vowel-story"
    ? VOWEL_STORY_LETTER_TIMES
    : template === "vowel-combine-story"
      ? VOWEL_COMBINE_LETTER_TIMES
      : LETTER_TIMES;
```

Update cue collection support:

```js
export const TIMING_CUE_COLLECTIONS = ["cues", "letterCues", "sceneCues", "combineCues"];
```

Add `combineCues` to `mergeTimingProjectDefaults`:

```js
    combineCues: Array.isArray(project.combineCues) ? mergeCueDefaults(project.combineCues, defaults.combineCues, removedCueIds.combineCues) : defaults.combineCues,
```

Add combine validation inside `parseTimingProject`:

```js
  validateCues(project.sceneCues);
  validateCues(project.combineCues);
```

- [ ] **Step 5: Run core tests**

Run:

```bash
node tests/timing_editor_core.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit core work**

Run:

```bash
git add tools/timing-editor-core.js tests/timing_editor_core.test.mjs
git commit -m "Add vowel combine timing projects"
```

---

### Task 2: Browser Editor Preview And Controls

**Files:**
- Modify: `tests/timing_editor_static.test.mjs`
- Modify: `timing-editor.html`
- Modify: `timing-editor.js`
- Modify: `timing-editor.css`

- [ ] **Step 1: Write failing editor static tests**

Add these assertions to `tests/timing_editor_static.test.mjs` near the existing scene cue assertions:

```js
assert.match(html, /id="combine-section"/, "timing editor should expose combine story timing rows");
assert.match(html, /id="combine-cue-list"/, "timing editor should expose combine cue rows");
assert.match(js, /isVowelCombineProject/, "editor should branch preview behavior for vowel combine stories");
assert.match(js, /combineCues/, "editor should edit vowel combine story cues");
assert.match(js, /renderVowelCombineStage/, "editor should render vowel combine story previews");
assert.match(js, /combine-sprite/, "editor should render transparent combine sprites");
assert.match(css, /\.combine-cue-list/, "editor should style combine timing rows");
assert.match(css, /\.combine-sprite/, "editor should style combine sprites");
```

- [ ] **Step 2: Run static test to verify it fails**

Run:

```bash
node tests/timing_editor_static.test.mjs
```

Expected: FAIL with `combine-section`.

- [ ] **Step 3: Add combine cue section markup**

In `timing-editor.html`, insert this section after `scene-section` and before `<div id="cue-list"`:

```html
          <section id="combine-section" class="letter-section combine-section" aria-label="모음 만남 타이밍" hidden>
            <div class="panel-heading subheading">
              <div>
                <p class="eyebrow">모음 만남</p>
                <h2>아기와 도구</h2>
              </div>
            </div>
            <div id="combine-cue-list" class="cue-list combine-cue-list"></div>
          </section>
```

- [ ] **Step 4: Wire combine cue list in JavaScript**

In `timing-editor.js`, add this selector near `sceneCueList`:

```js
const combineSection = document.querySelector("#combine-section");
const combineCueList = document.querySelector("#combine-cue-list");
```

Replace `isVowelStoryProject` with:

```js
function isVowelStoryProject() {
  return sourceProject?.template === "vowel-story";
}

function isVowelCombineProject() {
  return sourceProject?.template === "vowel-combine-story";
}

function isVowelVisualProject() {
  return isVowelStoryProject() || isVowelCombineProject();
}
```

Update `setDefaultSelection` so combine projects select the first combine cue:

```js
function setDefaultSelection(sourceProject) {
  if (sourceProject?.template === "vowel-story") {
    selectedCueKind = "scene";
    selectedCueId = sourceProject.sceneCues?.[0]?.id ?? sourceProject.cues?.[0]?.id ?? sourceProject.letterCues?.[0]?.id ?? null;
    return;
  }
  if (sourceProject?.template === "vowel-combine-story") {
    selectedCueKind = "combine";
    selectedCueId = sourceProject.combineCues?.[0]?.id ?? sourceProject.cues?.[0]?.id ?? sourceProject.letterCues?.[0]?.id ?? null;
    return;
  }
  selectedCueKind = "word";
  selectedCueId = sourceProject.cues?.[0]?.id ?? sourceProject.letterCues?.[0]?.id ?? null;
}
```

Update `getCueCollectionName`:

```js
function getCueCollectionName(kind) {
  return kind === "scene" ? "sceneCues" : kind === "letter" ? "letterCues" : kind === "combine" ? "combineCues" : "cues";
}
```

Update `renderProjectChrome`:

```js
  const isVowelStory = isVowelStoryProject();
  const isVowelCombine = isVowelCombineProject();
  stage.classList.toggle("is-vowel-story", isVowelStory);
  stage.classList.toggle("is-vowel-combine-story", isVowelCombine);
  sceneSection.hidden = !isVowelStory;
  combineSection.hidden = !isVowelCombine;
```

Update `renderCueList`:

```js
  combineCueList.innerHTML = "";
  if (isVowelCombineProject()) {
    (project.combineCues ?? []).forEach((cue, index) => {
      combineCueList.append(renderCueRow(cue, index, "combine"));
    });
  }
```

Update `renderCueRow` class and button behavior:

```js
  const isCombine = kind === "combine";
  row.className = `cue-row${isSelectedCue(kind, cue.id) ? " is-selected" : ""}${isLetter ? " cue-row-letter" : ""}${isScene ? " cue-row-scene" : ""}${isCombine ? " cue-row-combine" : ""}`;
```

```js
  ${!isLetter && !isScene && !isCombine ? `<button class="icon-button danger" type="button" data-action="remove" aria-label="${escapeHtml(label)} 제거">×</button>` : ""}
```

- [ ] **Step 5: Render combine sprites in preview**

In `renderStage`, branch before `renderVowelStoryStage`:

```js
  if (isVowelCombineProject()) {
    renderVowelCombineStage(now);
    return;
  }
```

Add these functions near `renderVowelStoryStage`:

```js
function renderVowelCombineStage(now) {
  stageBackground.removeAttribute("src");
  stageBackground.alt = "";
  stageCards.innerHTML = "";

  const visibleCombineCues = activeCues(project.combineCues ?? [], now);
  const selectedEntry = getSelectedCueEntry();
  const fallbackCombine = selectedEntry?.kind === "combine" ? selectedEntry.cue : null;
  const combineCues = visibleCombineCues.length > 0 ? visibleCombineCues : fallbackCombine ? [fallbackCombine] : [];

  combineCues.forEach((cue) => {
    const sprite = document.createElement("img");
    sprite.className = `combine-sprite is-draggable${cueMotionClass(cue, visibleCombineCues, now)}`;
    const slot = combineSpriteSlot(cue, now);
    sprite.src = resolveAssetPath(cue.image);
    sprite.alt = "";
    sprite.style.left = `${slot.left}%`;
    sprite.style.top = `${slot.top}%`;
    sprite.style.setProperty("--sprite-scale", String(cue.scale ?? 0.7));
    sprite.dataset.stageCueId = cue.id;
    sprite.dataset.dragKind = "combine";
    sprite.title = "모음 만남 위치 조정";
    stageCards.append(sprite);
  });

  renderStageOverlays(now, { append: true });
}

function combineSpriteSlot(cue, now) {
  if (cue.assetKind === "combined") {
    return cue.position ?? cue.toPosition ?? { left: 50, top: 55 };
  }
  const start = cue.fromPosition ?? cue.position ?? { left: 50, top: 55 };
  const end = cue.toPosition ?? cue.position ?? start;
  const duration = Math.max(0.001, cue.end - cue.start);
  const progress = Math.max(0, Math.min(1, (now - cue.start) / duration));
  const eased = 1 - (1 - progress) ** 3;
  return {
    left: start.left + (end.left - start.left) * eased,
    top: start.top + (end.top - start.top) * eased,
  };
}
```

Update `renderStageOverlays` signature so combine stage can append:

```js
function renderStageOverlays(now, options = {}) {
  if (!options.append) {
    stageCards.innerHTML = "";
  }
```

- [ ] **Step 6: Add timeline and selection support**

Update `renderTimeline`:

```js
  project.combineCues?.forEach((cue) => renderTimelineMarker(cue, "combine", duration));
```

Update marker accent:

```js
  marker.style.setProperty("--accent", kind === "letter" ? "#ffd166" : kind === "scene" ? "#7c3aed" : kind === "combine" ? "#14b8a6" : getCueSlot(cue).accent);
```

Update `getSelectedCueEntry` and live selection logic anywhere it checks only `scene`, `word`, or `letter` so `"combine"` is accepted through `getCueCollectionName(kind)`.

Use this active cue order in `getLiveCueEntry`:

```js
  const wordCue = getCueAtTime(project, time);
  if (wordCue) {
    return { kind: "word", cue: wordCue };
  }
  const combineCue = isVowelCombineProject() ? activeCues(project.combineCues ?? [], time).at(-1) : null;
  if (combineCue) {
    return { kind: "combine", cue: combineCue };
  }
  const sceneCue = isVowelStoryProject() ? activeSceneAtTime(time) : null;
  return sceneCue ? { kind: "scene", cue: sceneCue } : null;
```

- [ ] **Step 7: Style combine preview**

Add to `timing-editor.css` near the vowel story styles:

```css
.lesson-stage.is-vowel-combine-story {
  background:
    radial-gradient(circle at 50% 45%, rgba(255, 245, 210, 0.92), rgba(255, 253, 248, 0.94) 58%, #fffdf8 100%),
    linear-gradient(180deg, #fffaf0, #f7fbff);
}

.lesson-stage.is-vowel-combine-story .stage-bg,
.lesson-stage.is-vowel-combine-story .mascot,
.lesson-stage.is-vowel-combine-story .letter-badge {
  display: none;
}

.combine-sprite {
  position: absolute;
  width: min(32vw, 360px);
  max-height: 64%;
  object-fit: contain;
  transform: translate(-50%, -50%) scale(var(--sprite-scale, 0.7));
  transform-origin: center;
  filter: drop-shadow(0 18px 24px rgba(36, 28, 14, 0.14));
  pointer-events: none;
  user-select: none;
  z-index: 3;
}

.combine-sprite.is-entering {
  animation: card-pop 0.52s cubic-bezier(.2, .8, .2, 1.15);
}

.combine-sprite.is-holding {
  animation: card-float 1.8s ease-in-out infinite alternate;
}

.combine-sprite.is-draggable {
  cursor: grab;
  pointer-events: auto;
}

.cue-row-combine .cue-select,
.combine-cue-list .cue-select {
  border-color: #14b8a6;
}
```

- [ ] **Step 8: Run editor static tests**

Run:

```bash
node tests/timing_editor_static.test.mjs
```

Expected: PASS.

- [ ] **Step 9: Run core tests again**

Run:

```bash
node tests/timing_editor_core.test.mjs
```

Expected: PASS.

- [ ] **Step 10: Commit editor work**

Run:

```bash
git add timing-editor.html timing-editor.js timing-editor.css tests/timing_editor_static.test.mjs
git commit -m "Preview vowel combine timing cues"
```

---

### Task 3: Python Renderer Support

**Files:**
- Modify: `tests/render_gogo_timed_video.test.mjs`
- Modify: `tools/render_gogo_timed_lesson_video.py`

- [ ] **Step 1: Write failing renderer static tests**

Append these assertions to `tests/render_gogo_timed_video.test.mjs` after the existing vowel-story assertions:

```js
assert.match(renderer, /vowel-combine-story/, "renderer should branch for vowel combine story timing projects");
assert.match(renderer, /combineCues/, "renderer should read vowel combine cue sprites");
assert.match(renderer, /normalize_combine_cues/, "renderer should normalize combine cue metadata");
assert.match(renderer, /build_vowel_combine_story_frames/, "renderer should render vowel combine story frames");
assert.match(renderer, /combine_sprite_motion/, "renderer should animate baby and tool sprites toward the center");
```

- [ ] **Step 2: Run renderer test to verify it fails**

Run:

```bash
node tests/render_gogo_timed_video.test.mjs
```

Expected: FAIL with `vowel-combine-story`.

- [ ] **Step 3: Add combine cue normalization**

In `tools/render_gogo_timed_lesson_video.py`, add this dataclass after `Cue`:

```python
@dataclass(frozen=True)
class CombineCue(Cue):
    asset_kind: str = "combined"
    from_left: float = 50
    from_top: float = 50
    to_left: float = 50
    to_top: float = 50
    scale: float = 0.7
```

Add these helpers after `normalize_scene_cues`:

```python
def cue_position(raw: dict, key: str, fallback: dict[str, float]) -> dict[str, float]:
    value = raw.get(key)
    if not isinstance(value, dict):
        value = fallback
    return {
        "left": clamp_percent(value.get("left"), fallback["left"]),
        "top": clamp_percent(value.get("top"), fallback["top"]),
    }


def normalize_combine_cues(project: dict) -> list[CombineCue]:
    raw_cues = project.get("combineCues") or []
    segment = project.get("segment") or {}
    segment_start = float(segment.get("start", 0))
    segment_end = float(segment.get("end", segment_start + 10))
    normalized: list[CombineCue] = []
    for index, raw in enumerate(raw_cues):
        start = cue_time(raw, "start", segment_start)
        end = cue_time(raw, "end", segment_end)
        if end <= start:
            end = start + 1.0
        position = cue_position(raw, "position", {"left": 50, "top": 55})
        from_position = cue_position(raw, "fromPosition", position)
        to_position = cue_position(raw, "toPosition", position)
        try:
            scale = float(raw.get("scale", 0.7))
        except (TypeError, ValueError):
            scale = 0.7
        normalized.append(
            CombineCue(
                id=str(raw.get("id", f"combine-{index + 1}")),
                label=str(raw.get("label") or f"Combine {index + 1}"),
                start=start,
                end=end,
                left=position["left"],
                top=position["top"],
                accent=(20, 184, 166),
                image_path=resolve_repo_path(raw.get("image")),
                asset_kind=str(raw.get("assetKind") or "combined"),
                from_left=from_position["left"],
                from_top=from_position["top"],
                to_left=to_position["left"],
                to_top=to_position["top"],
                scale=max(0.1, min(1.4, scale)),
            )
        )
    return sorted(normalized, key=lambda cue: cue.start)
```

- [ ] **Step 4: Add combine frame rendering**

Add these functions before `build_vowel_story_frames`:

```python
def make_vowel_combine_background() -> Image.Image:
    canvas = Image.new("RGBA", (WIDTH, HEIGHT), (255, 253, 248, 255))
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    draw.ellipse((WIDTH * 0.16, -HEIGHT * 0.18, WIDTH * 0.84, HEIGHT * 0.78), fill=(255, 244, 197, 118))
    draw.ellipse((WIDTH * 0.3, HEIGHT * 0.52, WIDTH * 0.72, HEIGHT * 1.04), fill=(217, 240, 255, 72))
    canvas.alpha_composite(glow.filter(ImageFilter.GaussianBlur(70)))
    return canvas


def combine_sprite_motion(cue: CombineCue, t: float) -> tuple[float, float, float, float] | None:
    if t < cue.start or t > cue.end:
        return None
    duration = max(0.001, cue.end - cue.start)
    progress = max(0.0, min(1.0, (t - cue.start) / duration))
    if cue.asset_kind == "combined":
        entry = min(0.5, duration * 0.28)
        entry_progress = max(0.0, min(1.0, (t - cue.start) / max(0.001, entry)))
        scale = cue.scale * (0.72 + 0.28 * ease_out_back(entry_progress))
        opacity = ease_out_cubic(entry_progress)
        return cue.left, cue.top, scale, opacity

    eased = ease_out_cubic(progress)
    left = cue.from_left + (cue.to_left - cue.from_left) * eased
    top = cue.from_top + (cue.to_top - cue.from_top) * eased
    return left, top, cue.scale, 1.0


def build_vowel_combine_story_frames(
    project: dict,
    output: Path,
    keep_frames: bool = False,
) -> tuple[Path, float, float]:
    if FRAME_DIR.exists():
        shutil.rmtree(FRAME_DIR)
    FRAME_DIR.mkdir(parents=True, exist_ok=True)

    segment = project.get("segment") or {}
    segment_start = float(segment.get("start", 0))
    segment_end = float(segment.get("end", 19.4))
    duration = max(0.1, segment_end - segment_start)
    frame_count = math.ceil(duration * FPS)

    combine_cues = normalize_combine_cues(project)
    if not combine_cues:
        raise ValueError("vowel-combine-story projects require combineCues")

    word_cues = normalize_word_cues(project)
    letter_cues = normalize_letter_cues(project)
    lesson_letter = project_letter(project, letter_cues)
    background = make_vowel_combine_background()
    sprite_images = {
        cue.id: contain_rgba(Image.open(cue.image_path), (900, 820))
        for cue in combine_cues
        if cue.image_path
    }
    card_images = {cue.id: make_word_card(cue, Image.open(cue.image_path), lesson_letter) for cue in word_cues if cue.image_path}
    letter_images = {cue.id: make_letter_popup(cue.label) for cue in letter_cues}

    for index in range(frame_count):
        elapsed = index / FPS
        t = segment_start + elapsed
        canvas = background.copy()

        for cue in combine_cues:
            motion = combine_sprite_motion(cue, t)
            if not motion:
                continue
            left, top, scale, opacity = motion
            x = WIDTH * left / 100
            y = HEIGHT * top / 100
            paste_center(canvas, sprite_images[cue.id], (x, y), scale, opacity)

        for cue_index, cue in enumerate(word_cues):
            motion = cue_motion(cue, t, cue_index)
            if not motion:
                continue
            scale, opacity, x_offset, y_offset, rotation = motion
            x = WIDTH * cue.left / 100 + x_offset
            y = HEIGHT * cue.top / 100 + y_offset
            paste_center(canvas, card_images[cue.id], (x, y), scale, opacity, rotation)

        for cue_index, cue in enumerate(letter_cues):
            motion = cue_motion(cue, t, cue_index + 10)
            if not motion:
                continue
            scale, opacity, x_offset, y_offset, rotation = motion
            x = WIDTH * cue.left / 100 + x_offset
            y = HEIGHT * cue.top / 100 + y_offset
            paste_center(canvas, letter_images[cue.id], (x, y), scale, opacity, rotation)

        frame_path = FRAME_DIR / f"frame_{index + 1:04d}.jpg"
        canvas.convert("RGB").save(frame_path, quality=91, optimize=True)

    return FRAME_DIR, segment_start, duration
```

Update `build_frames`:

```python
    if project.get("template") == "vowel-combine-story":
        return build_vowel_combine_story_frames(project, output, keep_frames)
```

- [ ] **Step 5: Run renderer static test**

Run:

```bash
node tests/render_gogo_timed_video.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit renderer work**

Run:

```bash
git add tools/render_gogo_timed_lesson_video.py tests/render_gogo_timed_video.test.mjs
git commit -m "Render vowel combine story videos"
```

---

### Task 4: End-To-End Verification

**Files:**
- No planned source edits.
- Generated verification outputs may be written under `tmp/` or `public/video-assets/consonant-lesson-samples/`.

- [ ] **Step 1: Run focused Node tests**

Run:

```bash
node tests/timing_editor_core.test.mjs
node tests/timing_editor_static.test.mjs
node tests/render_gogo_timed_video.test.mjs
```

Expected: all commands exit 0.

- [ ] **Step 2: Build the Vite app**

Run:

```bash
npm run build
```

Expected: `vite build` completes and `tools/copy-assets.mjs` runs without errors.

- [ ] **Step 3: Export a default `오` timing JSON for renderer smoke test**

Run:

```bash
node --input-type=module -e "import { createDefaultTimingProject, serializeTimingProject } from './tools/timing-editor-core.js'; await import('node:fs/promises').then(fs => fs.writeFile('tmp/oo-o-vowel-timings.json', serializeTimingProject(createDefaultTimingProject('oo-o')), 'utf8'));"
```

Expected: `tmp/oo-o-vowel-timings.json` exists and contains `"template": "vowel-combine-story"`.

- [ ] **Step 4: Render a short `오` preview video**

Run:

```bash
python tools/render_gogo_timed_lesson_video.py --timings tmp/oo-o-vowel-timings.json --output public/video-assets/consonant-lesson-samples/oo-o-timed-lesson.mp4 --preview public/video-assets/consonant-lesson-samples/oo-o-timed-lesson-preview.jpg --preview-time 6.0
```

If `python` resolves to the Windows Store alias, run the same command with:

```bash
C:\Users\USER\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe tools/render_gogo_timed_lesson_video.py --timings tmp/oo-o-vowel-timings.json --output public/video-assets/consonant-lesson-samples/oo-o-timed-lesson.mp4 --preview public/video-assets/consonant-lesson-samples/oo-o-timed-lesson-preview.jpg --preview-time 6.0
```

Expected: the command prints `video=...`, `preview=...`, and `duration=19.400`.

- [ ] **Step 5: Commit verification-safe source state**

If any source fixes were required during verification, commit them with:

```bash
git add tools/timing-editor-core.js timing-editor.html timing-editor.js timing-editor.css tools/render_gogo_timed_lesson_video.py tests/timing_editor_core.test.mjs tests/timing_editor_static.test.mjs tests/render_gogo_timed_video.test.mjs
git commit -m "Stabilize vowel combine story template"
```

If no source fixes were required, do not create an empty commit.

---

## Self-Review

- Spec coverage: `오` and `우` project data are in Task 1; editor preview and controls are in Task 2; renderer support is in Task 3; JSON/render workflow verification is in Task 4.
- Completion scan: every task has concrete files, code snippets, commands, and expected outcomes.
- Type consistency: the plan uses `combineCues`, `assetKind`, `fromPosition`, `toPosition`, `position`, and `scale` consistently across JS tests, JS implementation, and Python renderer normalization.
