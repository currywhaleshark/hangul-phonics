import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("timing-editor.html", "utf8");
const js = readFileSync("timing-editor.js", "utf8");
const css = readFileSync("timing-editor.css", "utf8");

assert.match(html, /id="timing-audio"/, "timing editor should expose an audio element");
assert.match(html, /id="project-selector"/, "timing editor should expose a character selector");
assert.match(html, /id="cue-list"/, "timing editor should expose editable cue rows");
assert.match(html, /id="letter-cue-list"/, "timing editor should expose editable letter popup cue rows");
assert.match(html, /id="export-json"/, "timing editor should export timing JSON");
assert.match(html, /id="import-json"/, "timing editor should import timing JSON");
assert.match(html, /id="render-video"/, "timing editor should expose a render video button");
assert.match(html, /영상 만들기/, "render video button should have a readable Korean label");
assert.match(html, /id="render-output"/, "timing editor should expose render output links");
assert.match(html, /timing-editor\.js/, "timing editor should load its module");

assert.match(js, /CONSONANT_TIMING_PROJECTS/, "editor should render catalog project options");
assert.match(js, /createDefaultTimingProject/, "editor should create defaults by selected project id");
assert.match(js, /getTimingStorageKey/, "editor should persist each timing project separately");
assert.match(js, /FALLBACK_AUDIO_PATH/, "editor should keep a fallback intro audio path");
assert.match(js, /\.wav/, "editor should load WAV audio metadata");
assert.match(js, /setCueStart/, "editor should set cue starts from the current audio time");
assert.match(js, /setCueEnd/, "editor should set cue ends from the current audio time");
assert.match(js, /data-end-input/, "editor should expose editable cue end inputs");
assert.match(js, /data-action="set-end"/, "editor should expose an end-now button per cue");
assert.match(js, /cue\.end/, "editor should render active popups using cue end times");
assert.match(js, /setCuePosition/, "editor should save dragged popup positions");
assert.match(js, /removeCue/, "editor should remove unused word cards");
assert.match(js, /data-action="remove"/, "editor should expose a remove button per word card");
assert.match(js, /pointerdown/, "editor should start dragging from the preview stage");
assert.match(js, /data-stage-cue-id/, "stage popups should expose cue ids for dragging");
assert.match(js, /letterCues/, "editor should edit ??popup timings");
assert.match(js, /letter-popup/, "editor should render ??popup previews");
assert.match(js, /cueMotionClass/, "editor should separate popup entry from hold motion");
assert.match(js, /is-entering/, "editor should use a one-shot popup entry state");
assert.match(js, /is-holding/, "editor should use a held subtle motion state until cue end");
assert.match(js, /0\.03/, "editor should support fine nudge timing");
assert.match(js, /setSegmentBoundary/, "editor should set segment boundaries from current audio time");
assert.match(js, /download = getTimingExportFileName/, "editor should export a project-specific filename");
assert.match(js, /\/api\/timing-render/, "editor should post timing JSON to the local render API");
assert.match(js, /serializeTimingProject\(project\)/, "editor should render the current timing project");
assert.match(js, /renderVideoButton/, "editor should wire the render video button");
assert.match(js, /\/api\/timing-render/, "editor should post timing JSON to the local render API");
assert.match(js, /serializeTimingProject\(project\)/, "editor should render the current timing project");
assert.match(js, /renderVideoButton/, "editor should wire the render video button");

assert.match(css, /\.lesson-stage/, "editor should provide a visual preview stage");
assert.match(css, /\.timeline-marker/, "editor should render cue markers on a timeline");
assert.match(css, /\.letter-popup/, "editor should style ??popup previews");
assert.match(css, /\.letter-popup\.is-entering[\s\S]*letter-pop/, "letter popup entry should use the pop animation");
assert.match(css, /\.letter-popup\.is-holding[\s\S]*letter-hold/, "letter popup hold should use subtle motion");
assert.doesNotMatch(css, /\.letter-popup\.is-live[\s\S]*letter-pop/, "letter popup should not keep replaying pop while live");
assert.match(css, /\.is-draggable/, "editor should show draggable popups affordance");
assert.match(css, /\.letter-popup\.is-draggable[\s\S]*pointer-events:\s*auto/, "letter popup drag targets should receive pointer events");
assert.match(css, /\.time-field/, "editor should style start and end timing fields");
assert.match(css, /touch-action: none/, "drag targets should work on touch screens");








