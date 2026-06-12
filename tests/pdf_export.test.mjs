import assert from "node:assert/strict";

import { buildImagePdfBytes } from "../worksheets/pdf-export.js";

const firstJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
const secondJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);

const pdfBytes = buildImagePdfBytes([
  { width: 1600, height: 2263, data: firstJpeg },
  { width: 1600, height: 2263, data: secondJpeg },
]);
const pdfText = new TextDecoder("latin1").decode(pdfBytes);

assert.match(pdfText, /^%PDF-1\.4/, "PDF export should create a PDF document");
assert.match(pdfText, /\/Type \/Catalog/, "PDF export should include a catalog");
assert.match(pdfText, /\/Type \/Pages/, "PDF export should include a pages tree");
assert.match(pdfText, /\/Count 2/, "PDF export should include each worksheet page");
assert.match(pdfText, /\/MediaBox \[0 0 595\.28 841\.89\]/, "PDF export should use A4 portrait pages");
assert.match(pdfText, /\/Filter \/DCTDecode/, "PDF export should embed JPEG page images");
assert.match(pdfText, /xref/, "PDF export should include an xref table");
assert.match(pdfText, /%%EOF\s*$/, "PDF export should terminate the PDF file");

assert.throws(
  () => buildImagePdfBytes([]),
  /PDF로 저장할 페이지가 없습니다/,
  "PDF export should reject an empty page list"
);
