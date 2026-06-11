const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const THEMES = {
  gogo: { accent: "FF9800", soft: "FFF3E0" },
  nana: { accent: "8BC34A", soft: "F1F8E9" },
  mix: { accent: "03A9F4", soft: "E1F5FE" },
};

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeColor(value, fallback = "FFFFFF") {
  return String(value || fallback).replace(/^#/, "").toUpperCase();
}

function resolveAsset(repoRoot, inputPath, assetPath) {
  if (!assetPath) return null;
  const dataDir = path.dirname(inputPath);
  const candidates = [
    path.resolve(dataDir, assetPath),
    path.resolve(repoRoot, "worksheets", assetPath),
    path.resolve(repoRoot, assetPath),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function textRun(text, options = {}) {
  const size = options.size || 24;
  const color = options.color || "3A2A20";
  const bold = options.bold ? "<w:b/>" : "";
  const font = options.font || "Malgun Gothic";
  return `<w:r><w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:eastAsia="${font}"/><w:sz w:val="${size}"/><w:color w:val="${color}"/>${bold}</w:rPr><w:t>${escapeXml(text)}</w:t></w:r>`;
}

function paragraph(text, options = {}) {
  const align = options.align ? `<w:jc w:val="${options.align}"/>` : "";
  const before = options.before ?? 0;
  const after = options.after ?? 120;
  const shading = options.fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${normalizeColor(options.fill)}"/>` : "";
  const border = options.border
    ? `<w:pBdr><w:top w:val="single" w:sz="12" w:space="1" w:color="${normalizeColor(options.border)}"/><w:left w:val="single" w:sz="12" w:space="1" w:color="${normalizeColor(options.border)}"/><w:bottom w:val="single" w:sz="12" w:space="1" w:color="${normalizeColor(options.border)}"/><w:right w:val="single" w:sz="12" w:space="1" w:color="${normalizeColor(options.border)}"/></w:pBdr>`
    : "";
  return `<w:p><w:pPr><w:spacing w:before="${before}" w:after="${after}"/>${align}${shading}${border}</w:pPr>${textRun(text, options)}</w:p>`;
}

function pageBreak() {
  return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
}

function imageDrawing(relId, name, widthEmu, heightEmu) {
  const safeName = escapeXml(name);
  return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${widthEmu}" cy="${heightEmu}"/><wp:docPr id="${relId.replace(/\D/g, "") || 1}" name="${safeName}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="${safeName}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${widthEmu}" cy="${heightEmu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

function tableCell(content, options = {}) {
  const fill = options.fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${normalizeColor(options.fill)}"/>` : "";
  const width = options.width ? `<w:tcW w:w="${options.width}" w:type="dxa"/>` : "";
  const valign = `<w:vAlign w:val="${options.valign || "center"}"/>`;
  const borders = `<w:tcBorders><w:top w:val="single" w:sz="10" w:color="${normalizeColor(options.border || "E0D0BB")}"/><w:left w:val="single" w:sz="10" w:color="${normalizeColor(options.border || "E0D0BB")}"/><w:bottom w:val="single" w:sz="10" w:color="${normalizeColor(options.border || "E0D0BB")}"/><w:right w:val="single" w:sz="10" w:color="${normalizeColor(options.border || "E0D0BB")}"/></w:tcBorders>`;
  return `<w:tc><w:tcPr>${width}${valign}${fill}${borders}<w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr>${content}</w:tc>`;
}

function table(rows, widths = []) {
  const grid = widths.map((width) => `<w:gridCol w:w="${width}"/>`).join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="90" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${rows.map((row) => `<w:tr>${row}</w:tr>`).join("")}</w:tbl>`;
}

function textBlock(lines, options = {}) {
  return lines.map((line) => paragraph(line, options)).join("");
}

function cardBlock(card, media, options = {}) {
  const theme = options.theme || THEMES.gogo;
  const image = card.image ? media.add(card.image, options.inputPath, 1180000, 1180000) : null;
  const imageContent = image
    ? imageDrawing(image.relId, card.label, image.width, image.height)
    : paragraph(card.label, { align: "center", fill: card.fill || theme.soft, border: theme.accent, size: 28, bold: true, color: theme.accent });
  return `${imageContent}${paragraph(card.label, { align: "center", size: options.small ? 20 : 26, bold: true })}`;
}

function renderHeader(page, theme) {
  return [
    paragraph(page.kicker, { align: "center", fill: theme.accent, color: "FFFFFF", size: 24, bold: true }),
    paragraph(page.title, { align: "center", size: 42, color: theme.accent, bold: true }),
  ].join("");
}

function renderCharacterPage(page, media, inputPath) {
  const theme = THEMES[page.theme] || THEMES.gogo;
  const hero = media.add(page.image, inputPath, 3300000, 3300000);
  const left = imageDrawing(hero.relId, page.title, hero.width, hero.height);
  const right = [
    paragraph(page.panelTitle, { align: "center", size: 28, bold: true }),
    paragraph(page.letter, { align: "center", size: 120, bold: true, color: theme.accent }),
    paragraph(page.sound, { align: "center", size: 30, bold: true, color: theme.accent, fill: "FFFFFF", border: theme.accent }),
  ].join("");

  return [
    renderHeader(page, theme),
    table(
      [
        tableCell(left, { width: 5900, border: theme.accent }) +
          tableCell(right, { width: 3000, fill: theme.soft, border: theme.accent }),
      ],
      [5900, 3000]
    ),
    paragraph(page.read, { align: "center", size: 28, fill: "FFFFFF", border: "E0D0BB" }),
    paragraph(page.activityTitle, { align: "center", size: 26, fill: theme.soft, border: theme.accent, bold: true, color: theme.accent }),
    table(
      [
        page.trace
          .map((letter) => tableCell(paragraph(letter, { align: "center", size: 64, bold: true, color: "E0D0BB" }), { width: 2966, border: theme.accent }))
          .join(""),
      ],
      [2966, 2966, 2966]
    ),
    paragraph(page.teacherNote, { size: 18, color: "8C7662", fill: "FFFFFF", border: "8C7662" }),
    paragraph(`${page.footerLeft}    ${page.footerRight}`, { align: "center", size: 18, color: "8C7662" }),
  ].join("");
}

function renderSpotPage(page, media, inputPath) {
  const theme = THEMES[page.theme] || THEMES.gogo;
  const rows = [];
  for (let i = 0; i < page.cards.length; i += 3) {
    const cards = page.cards.slice(i, i + 3);
    rows.push(
      cards
        .map((card) => tableCell(cardBlock(card, media, { theme, inputPath }), { width: 2966, border: "E0D0BB" }))
        .join("")
    );
  }
  return [
    renderHeader(page, theme),
    paragraph(page.read, { align: "center", size: 27, fill: "FFFFFF", border: "E0D0BB" }),
    paragraph(page.activityTitle, { align: "center", size: 24, fill: theme.soft, border: theme.accent, bold: true, color: theme.accent }),
    table(rows, [2966, 2966, 2966]),
    paragraph(page.soundBox, { align: "center", size: 28, fill: "FFFFFF", border: "E0D0BB", bold: true }),
    paragraph(page.teacherNote, { size: 18, color: "8C7662", fill: "FFFFFF", border: "8C7662" }),
    paragraph(`${page.footerLeft}    ${page.footerRight}`, { align: "center", size: 18, color: "8C7662" }),
  ].join("");
}

function renderSortingPage(page, media, inputPath) {
  const theme = THEMES[page.theme] || THEMES.mix;
  const houseWidth = Math.floor(8900 / Math.max(page.houses.length, 1));
  const houseCells = page.houses
    .map((house) => {
      const houseTheme = THEMES[house.theme] || theme;
      return tableCell(
        paragraph(house.title, { align: "center", size: 42, bold: true, color: houseTheme.accent, fill: houseTheme.soft, border: houseTheme.accent }) +
          paragraph(" ", { before: 1600, after: 1600, fill: houseTheme.soft, border: houseTheme.accent }),
        { width: houseWidth, border: houseTheme.accent }
      );
    })
    .join("");
  const tileColumns = page.tileColumns || 4;
  const tileWidth = Math.floor(8900 / Math.max(tileColumns, 1));
  const tileRows = [];
  for (let i = 0; i < page.tiles.length; i += tileColumns) {
    tileRows.push(
      page.tiles
        .slice(i, i + tileColumns)
        .map((tile) => tableCell(cardBlock(tile, media, { theme, inputPath, small: true }), { width: tileWidth, border: "E0D0BB" }))
        .join("")
    );
  }
  return [
    renderHeader(page, theme),
    paragraph(page.read, { align: "center", size: 28, fill: "FFFFFF", border: "E0D0BB" }),
    table([houseCells], page.houses.map(() => houseWidth)),
    paragraph(page.activityTitle, { align: "center", size: 24, fill: theme.soft, border: theme.accent, bold: true, color: theme.accent }),
    table(tileRows, Array.from({ length: tileColumns }, () => tileWidth)),
    paragraph(page.teacherNote, { size: 18, color: "8C7662", fill: "FFFFFF", border: "8C7662" }),
    paragraph(`${page.footerLeft}    ${page.footerRight}`, { align: "center", size: 18, color: "8C7662" }),
  ].join("");
}

function createMediaCollector(repoRoot) {
  const relationships = [];
  const entries = [];
  return {
    add(assetPath, inputPath, width, height) {
      const filePath = resolveAsset(repoRoot, inputPath, assetPath);
      if (!filePath) {
        throw new Error(`Missing asset: ${assetPath}`);
      }
      const relId = `rId${relationships.length + 1}`;
      const ext = path.extname(filePath).toLowerCase() || ".png";
      const mediaName = `image${relationships.length + 1}${ext}`;
      relationships.push({ relId, mediaName });
      entries.push({ name: `word/media/${mediaName}`, data: fs.readFileSync(filePath) });
      return { relId, width, height };
    },
    relationships,
    entries,
  };
}

function renderDocumentXml(lesson, media, inputPath) {
  const pages = lesson.pages.map((page) => {
    if (page.type === "character") return renderCharacterPage(page, media, inputPath);
    if (page.type === "spot") return renderSpotPage(page, media, inputPath);
    if (page.type === "sorting") return renderSortingPage(page, media, inputPath);
    throw new Error(`Unsupported page type: ${page.type}`);
  });
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${pages.join(pageBreak())}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/></w:sectPr></w:body></w:document>`;
}

function contentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;
}

function rootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
}

function documentRelsXml(relationships) {
  const imageRels = relationships
    .map(({ relId, mediaName }) => `<Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${mediaName}"/>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${imageRels}</Relationships>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:rPr><w:rFonts w:ascii="Malgun Gothic" w:hAnsi="Malgun Gothic" w:eastAsia="Malgun Gothic"/><w:sz w:val="22"/></w:rPr></w:style></w:styles>`;
}

function coreXml(title) {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${escapeXml(title)}</dc:title><dc:creator>Codex</dc:creator><cp:lastModifiedBy>Codex</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
}

function appXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Codex</Application></Properties>`;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function uint16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function createStoredZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, "utf8");
    const crc = crc32(data);
    const localHeader = Buffer.concat([
      uint32(0x04034b50),
      uint16(20),
      uint16(0x0800),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(crc),
      uint32(data.length),
      uint32(data.length),
      uint16(name.length),
      uint16(0),
      name,
    ]);
    localParts.push(localHeader, data);
    centralParts.push(
      Buffer.concat([
        uint32(0x02014b50),
        uint16(20),
        uint16(20),
        uint16(0x0800),
        uint16(0),
        uint16(0),
        uint16(0),
        uint32(crc),
        uint32(data.length),
        uint32(data.length),
        uint16(name.length),
        uint16(0),
        uint16(0),
        uint16(0),
        uint16(0),
        uint32(0),
        uint32(offset),
        name,
      ])
    );
    offset += localHeader.length + data.length;
  }
  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(entries.length),
    uint16(entries.length),
    uint32(centralDirectory.length),
    uint32(offset),
    uint16(0),
  ]);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function generateWorksheetDocx({ inputPath, outputPath, repoRoot = path.resolve(__dirname, "..") }) {
  const absoluteInput = path.resolve(inputPath);
  const lesson = JSON.parse(fs.readFileSync(absoluteInput, "utf8"));
  const media = createMediaCollector(repoRoot);
  const documentXml = renderDocumentXml(lesson, media, absoluteInput);
  const entries = [
    { name: "[Content_Types].xml", data: contentTypesXml() },
    { name: "_rels/.rels", data: rootRelsXml() },
    { name: "docProps/core.xml", data: coreXml(lesson.title || "한글 파닉스 학습지") },
    { name: "docProps/app.xml", data: appXml() },
    { name: "word/document.xml", data: documentXml },
    { name: "word/styles.xml", data: stylesXml() },
    { name: "word/_rels/document.xml.rels", data: documentRelsXml(media.relationships) },
    ...media.entries,
  ];
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, createStoredZip(entries));
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    args[argv[i].replace(/^--/, "")] = argv[i + 1];
  }
  return args;
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.output) {
    console.error("Usage: node tools/generate_worksheet_docs.cjs --input worksheets/data/pilot-lesson.json --output outputs/pilot-lesson.docx");
    process.exit(1);
  }
  generateWorksheetDocx({
    inputPath: args.input,
    outputPath: args.output,
    repoRoot: path.resolve(__dirname, ".."),
  });
  console.log(`Wrote ${args.output}`);
}

module.exports = {
  generateWorksheetDocx,
};
