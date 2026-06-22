import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const viteConfig = await readFile(new URL("../vite.config.js", import.meta.url), "utf8");
const bromideEditorPath = new URL("../bromide-editor.html", import.meta.url);

assert.match(index, /한글 파닉스 제작 도구/, "landing page should identify the tool hub");
assert.match(index, /href="\.\/bromide-editor\.html"/, "landing should link to the bromide editor");
assert.match(index, /href="\.\/worksheets\/editor\.html"/, "landing should link to the worksheet editor");
assert.match(index, /href="\.\/timing-editor\.html"/, "landing should link to the timing editor");
assert.match(index, /href="\.\/sorting-game\.html"/, "landing should link to the consonant game");
assert.match(index, /href="\.\/vowel-game\.html"/, "landing should link to the combining game");
assert.doesNotMatch(index, /id="preview-canvas"/, "landing should not be the bromide editor itself");

assert.ok(existsSync(bromideEditorPath), "bromide editor should move to its own HTML file");
const bromideEditor = await readFile(bromideEditorPath, "utf8");
assert.match(bromideEditor, /id="preview-canvas"/, "bromide editor file should preserve the canvas editor");
assert.match(bromideEditor, /src="app\.js"/, "bromide editor should keep loading the bromide app module");
assert.match(viteConfig, /bromideEditor:\s*'bromide-editor\.html'/, "Vite build should include the bromide editor entry");
