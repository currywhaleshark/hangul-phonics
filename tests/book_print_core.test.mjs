import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { UNITS, buildCoverHtml, buildDividersHtml, interiorSequence, spineWidth, unitLessons } from "../tools/book_print_core.mjs";

const manifests = {
  consonants: JSON.parse(readFileSync("lessons/consonants/manifest.json", "utf8")),
  vowels: JSON.parse(readFileSync("lessons/vowels/manifest.json", "utf8")),
};
const units = UNITS.map((unit) => ({ ...unit, lessonList: unitLessons(unit, manifests) }));

// Every lesson in both manifests belongs to exactly one unit, in manifest order.
assert.deepEqual(units.map((unit) => unit.lessonList.length), [7, 8, 14, 3]);
assert.equal(units.flatMap((unit) => unit.lessonList).length, manifests.consonants.lessons.length + manifests.vowels.lessons.length);

assert.equal(spineWidth({ pages: 220, sided: "double", sheetThickness: 0.11 }), 12);
assert.equal(spineWidth({ pages: 220, sided: "single", sheetThickness: 0.11 }), 24);

// Double-sided: dividers land on odd pages and keep a blank back.
const small = [
  { number: 1, lessonList: [{ id: "a", group: "g" }] },
  { number: 2, lessonList: [{ id: "b", group: "g" }] },
];
const double = interiorSequence(small, { a: 3, b: 2 }, "double");
assert.deepEqual(double.sequence.map((item) => item.kind), ["divider", "blank", "lesson", "blank", "divider", "blank", "lesson"]);
assert.equal(double.pages, 10);
assert.deepEqual(interiorSequence(small, { a: 3, b: 2 }, "single").sequence.map((item) => item.kind), ["divider", "lesson", "divider", "lesson"]);

const cover = buildCoverHtml({ units, spine: 12, bleed: 3 });
assert.match(cover, /@page \{ size: 438mm 303mm; margin: 0; \}/);
assert.match(cover, /소리나라 한글친구들/);
const dividers = buildDividersHtml(units);
assert.equal(dividers.match(/<section class="divider"/g).length, 4);
assert.match(dividers, /17레슨<\/b>오오 상자와 아아 나뭇가지: 와\/과를 만들어요/);
