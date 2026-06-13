import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../worksheets/editor.html", import.meta.url), "utf8");
const js = await readFile(new URL("../worksheets/editor.js", import.meta.url), "utf8");
const manifest = JSON.parse(await readFile(new URL("../lessons/consonants/manifest.json", import.meta.url), "utf8"));
const vowelManifest = JSON.parse(await readFile(new URL("../lessons/vowels/manifest.json", import.meta.url), "utf8"));

assert.match(html, /id="lesson-select"/, "editor should expose a lesson selector");
assert.match(html, /id="download-png"/, "editor should expose a PNG download button");
assert.match(html, /id="download-pdf"/, "editor should expose a PDF download button");
assert.match(js, /MANIFEST_URLS/, "editor should load lesson manifests");
assert.match(js, /\.\.\/lessons\/consonants\/manifest\.json/, "editor should load the consonant lesson manifest");
assert.match(js, /\.\.\/lessons\/vowels\/manifest\.json/, "editor should load the vowel lesson manifest");
assert.match(js, /selectedLessonId/, "editor should remember the selected lesson");
assert.match(js, /downloadPngButton/, "editor should wire the PNG download button");
assert.match(js, /exportPngPages/, "editor should export preview pages as PNG files");
assert.match(js, /downloadPdfButton/, "editor should wire the PDF download button");
assert.match(js, /exportPdfDocument/, "editor should export preview pages as a PDF document");
assert.match(js, /html2canvas/, "editor should capture the rendered worksheet DOM for PNG export");
assert.match(js, /story:\s*"그림 이야기"/, "editor should label story pages");
assert.match(js, /"vowel-activity":\s*"모음 활동"/, "editor should label vowel activity pages");
assert.match(js, /renderStoryFields/, "editor should expose fields for story pages");
assert.match(js, /renderVowelActivityFields/, "editor should expose fields for vowel activity pages");
assert.match(js, /page\.panels/, "editor should edit story panels");
assert.match(js, /page\.heroImage/, "editor should edit the vowel activity hero image");
assert.match(js, /assetBaseHref:\s*meta\.htmlPath/, "editor preview should resolve lesson-local assets from the lesson HTML path");
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

assert.deepEqual(
  vowelManifest.lessons.map((lesson) => lesson.id),
  ["lesson-01-aa-baby-vowel", "lesson-02-oo-box-vowel", "lesson-03-uu-platform-vowel"],
  "vowel manifest should expose the first Aa baby ㅏ, ㅗ, ㅜ sequence for the editor catalog"
);

for (const lesson of vowelManifest.lessons) {
  assert.match(lesson.title, /레슨/);
  assert.match(lesson.letters, /[아오우]/);
  assert.match(lesson.worksheetPath, /^\.\.\/lessons\/vowels\/lesson-/);
}
