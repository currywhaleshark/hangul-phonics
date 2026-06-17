import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../worksheets/editor.html", import.meta.url), "utf8");
const js = await readFile(new URL("../worksheets/editor.js", import.meta.url), "utf8");
const manifest = JSON.parse(await readFile(new URL("../lessons/consonants/manifest.json", import.meta.url), "utf8"));
const vowelManifest = JSON.parse(await readFile(new URL("../lessons/vowels/manifest.json", import.meta.url), "utf8"));

assert.match(html, /id="lesson-select"/, "editor should expose a lesson selector");
assert.match(html, /id="pdf-bundle-list"/, "editor should expose a multi-lesson PDF selection list");
assert.match(html, /id="select-bundle-all"/, "editor should expose a select-all button for bundled PDFs");
assert.match(html, /id="select-bundle-consonants"/, "editor should expose a consonant preset for bundled PDFs");
assert.match(html, /id="select-bundle-vowels"/, "editor should expose a vowel preset for bundled PDFs");
assert.match(html, /id="clear-bundle-selection"/, "editor should expose a clear-selection button for bundled PDFs");
assert.match(html, /id="download-bundle-pdf"/, "editor should expose a bundled PDF download button");
assert.match(html, /id="bundle-export-frame"/, "editor should expose a hidden frame for bundled PDF rendering");
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
assert.match(js, /bundleLessonIds/, "editor should track selected lessons for bundled PDFs");
assert.match(js, /renderPdfBundleOptions/, "editor should render bundled PDF lesson checkboxes");
assert.match(js, /setBundleSelection/, "editor should support preset bundled PDF selections");
assert.match(js, /loadLessonForExport/, "editor should load saved drafts when exporting bundled PDFs");
assert.match(js, /renderBundledWorksheetDocument/, "editor should render selected lessons into one export document");
assert.match(js, /exportBundledPdfDocument/, "editor should export selected lessons as one PDF document");
assert.match(js, /html2canvas/, "editor should capture the rendered worksheet DOM for PNG export");
assert.match(js, /story:\s*"그림 이야기"/, "editor should label story pages");
assert.match(js, /"vowel-activity":\s*"모음 활동"/, "editor should label vowel activity pages");
assert.match(js, /"sound-choice":\s*"소리 정리"/, "editor should label sound choice review pages");
assert.match(js, /renderStoryFields/, "editor should expose fields for story pages");
assert.match(js, /renderVowelActivityFields/, "editor should expose fields for vowel activity pages");
assert.match(js, /renderSoundChoiceFields/, "editor should expose fields for sound choice review pages");
assert.match(js, /page\.panels/, "editor should edit story panels");
assert.match(js, /page\.heroImage/, "editor should edit the vowel activity hero image");
assert.match(js, /choice\.image/, "editor should edit sound choice card images");
assert.match(js, /assetBaseHref:\s*meta\.htmlPath/, "editor preview should resolve lesson-local assets from the lesson HTML path");
assert.match(js, /querySelectorAll\("\.sheet"\)/, "editor should export the actual preview sheets");
assert.match(js, /toBlob/, "editor should download PNGs from canvas blobs");
assert.doesNotMatch(js, /renderWorksheetPagePngCanvas/, "PNG export should not use a separate hand-drawn renderer");
assert.doesNotMatch(js, /toDataURL\("image\/png"\)/, "PNG export should avoid tainted toDataURL failures");

assert.equal(manifest.lessons.length, 7, "manifest should list the consonant lessons with 6-A and 6-B split");
assert.deepEqual(
  manifest.lessons.map((lesson) => lesson.id),
  [
    "lesson-01-gogo-nana",
    "lesson-02-mimi-bubu",
    "lesson-03-dodo-rara",
    "lesson-04-sasa-haha",
    "lesson-05-jiji-chichi",
    "lesson-06a-koko-toto-pupu-meet",
    "lesson-06b-koko-toto-pupu-sounds",
  ]
);

for (const lesson of manifest.lessons) {
  assert.match(lesson.title, /레슨/);
  assert.match(lesson.letters, /^[ㄱ-ㅎ](\/[ㄱ-ㅎ])+$/);
  assert.match(lesson.worksheetPath, /^\.\.\/lessons\/consonants\/lesson-/);
}

assert.deepEqual(
  vowelManifest.lessons.map((lesson) => lesson.id),
  [
    "lesson-01-aa-baby-vowel",
    "lesson-02-gogo-nana-combination",
    "lesson-03-mimi-bubu-combination",
    "lesson-04-dodo-rara-combination",
    "lesson-05-sasa-haha-combination",
    "lesson-06-jiji-chichi-combination",
    "lesson-07a-koko-toto-combination",
    "lesson-07b-pupu-combination",
  ],
  "vowel manifest should expose grouped vowel and combination lessons for the editor catalog"
);

for (const lesson of vowelManifest.lessons) {
  assert.match(lesson.title, /레슨/);
  assert.match(lesson.letters, /^[ㄱ-ㅎㅏ-ㅣ가-힣]+(\/[ㄱ-ㅎㅏ-ㅣ가-힣]+)+$/);
  assert.match(lesson.worksheetPath, /^\.\.\/lessons\/vowels\/lesson-/);
}
