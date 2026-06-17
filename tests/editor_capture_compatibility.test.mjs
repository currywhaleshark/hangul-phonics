import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const editorSource = await readFile(new URL("../worksheets/editor.js", import.meta.url), "utf8");
const captureCssMatch = editorSource.match(/const PNG_CAPTURE_CSS = `([\s\S]*?)`;/);

assert.ok(captureCssMatch, "editor should define capture compatibility CSS");

const captureCss = captureCssMatch[1];
const html2CanvasUnsafeColorProperties = [
  [".character-frame", "box-shadow"],
  [".letter-panel", "box-shadow"],
  [".activity-box", "box-shadow"],
  [".house", "box-shadow"],
  [".house-title", "background"],
  [".drop-zone", "background"],
  [".story-panel", "box-shadow"],
  [".vowel-hero", "box-shadow"],
  [".finger-trace-card", "box-shadow"],
  [".finger-trace-letter", "background"],
  [".finger-trace-letter", "color"],
  [".sound-step", "box-shadow"],
  [".build-piece", "color"],
  [".build-result", "box-shadow"],
];
const ratioPreservingImageProperties = [
  ["width", "auto"],
  ["height", "auto"],
  ["max-width", "100%"],
  ["max-height", "100%"],
  ["object-fit", "contain"],
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findCssBlockForSelector(css, selector) {
  const escapedSelector = escapeRegExp(selector);
  const blockPattern = new RegExp(`(?:^|})\\s*([^{}]*${escapedSelector}[^{}]*)\\{([^{}]*)\\}`, "s");
  return css.match(blockPattern)?.[2] || "";
}

for (const [selector, property] of html2CanvasUnsafeColorProperties) {
  const block = findCssBlockForSelector(captureCss, selector);

  assert.match(
    block,
    new RegExp(`${escapeRegExp(property)}\\s*:`),
    `${selector} should override ${property} before html2canvas parses computed color() values`
  );
}

const imageBlock = findCssBlockForSelector(captureCss, ".capture-preserve-ratio img");

for (const [property, value] of ratioPreservingImageProperties) {
  assert.match(
    imageBlock,
    new RegExp(`${escapeRegExp(property)}\\s*:\\s*${escapeRegExp(value)}\\s*!important`),
    `capture CSS should preserve image ratio with ${property}: ${value}`
  );
}
