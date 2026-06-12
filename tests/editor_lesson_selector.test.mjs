import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../worksheets/editor.html", import.meta.url), "utf8");
const js = await readFile(new URL("../worksheets/editor.js", import.meta.url), "utf8");
const manifest = JSON.parse(await readFile(new URL("../lessons/consonants/manifest.json", import.meta.url), "utf8"));

assert.match(html, /id="lesson-select"/, "editor should expose a lesson selector");
assert.match(html, /id="download-png"/, "editor should expose a PNG download button");
assert.match(html, /id="download-pdf"/, "editor should expose a PDF download button");
assert.match(js, /MANIFEST_URL/, "editor should load a lesson manifest");
assert.match(js, /selectedLessonId/, "editor should remember the selected lesson");
assert.match(js, /downloadPngButton/, "editor should wire the PNG download button");
assert.match(js, /exportPngPages/, "editor should export preview pages as PNG files");
assert.match(js, /downloadPdfButton/, "editor should wire the PDF download button");
assert.match(js, /exportPdfDocument/, "editor should export preview pages as a PDF document");
assert.match(js, /html2canvas/, "editor should capture the rendered worksheet DOM for PNG export");
assert.match(js, /querySelectorAll\("\.sheet"\)/, "editor should export the actual preview sheets");
assert.match(js, /toBlob/, "editor should download PNGs from canvas blobs");
assert.doesNotMatch(js, /renderWorksheetPagePngCanvas/, "PNG export should not use a separate hand-drawn renderer");
assert.doesNotMatch(js, /toDataURL\("image\/png"\)/, "PNG export should avoid tainted toDataURL failures");

assert.equal(manifest.lessons.length, 6, "manifest should list the six consonant lessons");
assert.deepEqual(
  manifest.lessons.map((lesson) => lesson.id),
  [
    "lesson-01-gogo-nana",
    "lesson-02-mimi-bubu",
    "lesson-03-dodo-rara",
    "lesson-04-sasa-haha",
    "lesson-05-jiji-chichi",
    "lesson-06-koko-toto-pupu",
  ]
);

for (const lesson of manifest.lessons) {
  assert.match(lesson.title, /레슨/);
  assert.match(lesson.letters, /^[ㄱ-ㅎ](\/[ㄱ-ㅎ])+$/);
  assert.match(lesson.worksheetPath, /^\.\.\/lessons\/consonants\/lesson-/);
}
