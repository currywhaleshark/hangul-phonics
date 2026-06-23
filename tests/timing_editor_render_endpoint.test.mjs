import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const editorConfig = readFileSync("vite.editor.config.js", "utf8");
const mainConfig = readFileSync("vite.config.js", "utf8");
const plugin = readFileSync("tools/timing-render-plugin.js", "utf8");

assert.match(plugin, /\/api\/timing-render/, "editor dev server should expose a timing render API");
assert.match(plugin, /render_gogo_timed_lesson_video\.py/, "render API should call the existing Python renderer");
assert.match(plugin, /spawn/, "render API should execute the renderer without shell string composition");
assert.match(
  plugin,
  /public\/video-assets\/consonant-lesson-samples/,
  "render API should write generated lesson videos to the public samples directory",
);

assert.match(editorConfig, /timingRenderPlugin/, "editor config should install the timing render plugin");
assert.match(mainConfig, /timingRenderPlugin/, "main dev server should install the timing render plugin");



assert.match(plugin, /codex-primary-runtime/, "render API should auto-detect the bundled Codex Python runtime when available");
assert.match(plugin, /PATH/, "render API should add bundled ffmpeg binaries to the renderer PATH when available");

