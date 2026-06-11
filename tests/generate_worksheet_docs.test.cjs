const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { generateWorksheetDocx } = require("../tools/generate_worksheet_docs.cjs");

function readStoredZipEntries(zipPath) {
  const data = fs.readFileSync(zipPath);
  const eocdSignature = 0x06054b50;
  let eocdOffset = -1;
  for (let i = data.length - 22; i >= 0; i -= 1) {
    if (data.readUInt32LE(i) === eocdSignature) {
      eocdOffset = i;
      break;
    }
  }
  assert.notStrictEqual(eocdOffset, -1, "DOCX should contain a ZIP end record");

  const entryCount = data.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = data.readUInt32LE(eocdOffset + 16);
  const entries = new Map();
  let offset = centralDirectoryOffset;

  for (let i = 0; i < entryCount; i += 1) {
    assert.strictEqual(data.readUInt32LE(offset), 0x02014b50, "central directory entry expected");
    const compressionMethod = data.readUInt16LE(offset + 10);
    const compressedSize = data.readUInt32LE(offset + 20);
    const fileNameLength = data.readUInt16LE(offset + 28);
    const extraLength = data.readUInt16LE(offset + 30);
    const commentLength = data.readUInt16LE(offset + 32);
    const localHeaderOffset = data.readUInt32LE(offset + 42);
    const name = data.toString("utf8", offset + 46, offset + 46 + fileNameLength);

    assert.strictEqual(compressionMethod, 0, `${name} should be stored without compression`);
    assert.strictEqual(data.readUInt32LE(localHeaderOffset), 0x04034b50, "local file header expected");
    const localNameLength = data.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = data.readUInt16LE(localHeaderOffset + 28);
    const contentOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
    entries.set(name, data.subarray(contentOffset, contentOffset + compressedSize));

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

const repoRoot = path.resolve(__dirname, "..");
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "hangul-docx-test-"));
const docxPath = path.join(outDir, "pilot-lesson.docx");

generateWorksheetDocx({
  inputPath: path.join(repoRoot, "worksheets", "data", "pilot-lesson.json"),
  outputPath: docxPath,
  repoRoot,
});

assert.ok(fs.existsSync(docxPath), "DOCX file should be created");
assert.ok(fs.statSync(docxPath).size > 1000, "DOCX file should not be empty");

const entries = readStoredZipEntries(docxPath);
const documentXml = entries.get("word/document.xml").toString("utf8");
const relsXml = entries.get("word/_rels/document.xml.rels").toString("utf8");

assert.match(documentXml, /고고 고양이야/, "DOCX should contain lesson text");
assert.match(documentXml, /나나 나비야/, "DOCX should contain the second character page");
assert.strictEqual(
  (documentXml.match(/w:type="page"/g) || []).length,
  4,
  "Five worksheet pages should be separated by four page breaks"
);
assert.ok(
  (relsXml.match(/Target="media\//g) || []).length >= 8,
  "DOCX should embed worksheet images"
);

const threeColumnInputPath = path.join(outDir, "three-column-sorting.json");
const threeColumnDocxPath = path.join(outDir, "three-column-sorting.docx");
fs.writeFileSync(
  threeColumnInputPath,
  JSON.stringify({
    title: "three-column sorting",
    pages: [
      {
        type: "sorting",
        theme: "mix",
        kicker: "테스트",
        title: "분류",
        read: "읽기",
        houses: [
          { title: "ㅋ 집", theme: "gogo" },
          { title: "ㅌ 집", theme: "nana" },
          { title: "ㅍ 집", theme: "mix" },
        ],
        activityTitle: "오려 붙이기",
        tileColumns: 3,
        tiles: [
          { label: "코", answer: "ㅋ", fill: "FFE96B" },
          { label: "토", answer: "ㅌ", fill: "E8F5E9" },
          { label: "포", answer: "ㅍ", fill: "E1F5FE" },
          { label: "쿠키", answer: "ㅋ", fill: "FFE96B" },
          { label: "토마토", answer: "ㅌ", fill: "E8F5E9" },
          { label: "포도", answer: "ㅍ", fill: "E1F5FE" },
        ],
        teacherNote: "메모",
        footerLeft: "왼쪽",
        footerRight: "오른쪽",
      },
    ],
  }),
  "utf8"
);

generateWorksheetDocx({
  inputPath: threeColumnInputPath,
  outputPath: threeColumnDocxPath,
  repoRoot,
});

const threeColumnEntries = readStoredZipEntries(threeColumnDocxPath);
const threeColumnXml = threeColumnEntries.get("word/document.xml").toString("utf8");
const threeColumnGrid = '<w:tblGrid><w:gridCol w:w="2966"/><w:gridCol w:w="2966"/><w:gridCol w:w="2966"/></w:tblGrid>';
assert.strictEqual(
  (threeColumnXml.match(new RegExp(threeColumnGrid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length,
  2,
  "DOCX sorting page should render both houses and tiles as three-column grids"
);
