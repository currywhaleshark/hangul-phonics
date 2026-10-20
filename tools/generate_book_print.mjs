#!/usr/bin/env node
// Builds the volume 1 print files for the bindery:
//   book/volume-1/print/cover.pdf     back + spine + front, with bleed
//   book/volume-1/print/dividers.pdf  one A4 divider per unit
//   book/volume-1/print/interior.pdf  dividers + every lesson worksheet in order
//   book/volume-1/print/handouts/     one PDF per unit for home printing (no blank pages)
// Options: --sided double|single  --sheet-thickness 0.11  --spine <mm>  --bleed 3  --skip-interior
import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  DEFAULT_BLEED,
  DEFAULT_SHEET_THICKNESS,
  UNITS,
  buildBlankHtml,
  buildCoverHtml,
  buildDividersHtml,
  interiorSequence,
  spineWidth,
  unitLessons,
} from "./book_print_core.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bookDir = path.join(root, "book", "volume-1");
const printDir = path.join(bookDir, "print");
const lessonPdfDir = path.join(printDir, "_lessons");
const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];
const PYTHON_WITH_PYPDF = "C:/Users/yurib/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";

function parseArgs(argv) {
  const args = { sided: "double", sheetThickness: DEFAULT_SHEET_THICKNESS, spine: null, bleed: DEFAULT_BLEED, skipInterior: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--sided") args.sided = argv[++index];
    else if (arg === "--sheet-thickness") args.sheetThickness = Number(argv[++index]);
    else if (arg === "--spine") args.spine = Number(argv[++index]);
    else if (arg === "--bleed") args.bleed = Number(argv[++index]);
    else if (arg === "--skip-interior") args.skipInterior = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  if (!["double", "single"].includes(args.sided)) throw new Error("--sided must be double or single");
  return args;
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${path.basename(command)} failed (${result.status}): ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

const chrome = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));

function printPdf(htmlPath, pdfPath) {
  run(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=20000",
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ]);
}

function screenshot(htmlPath, pngPath, widthPx, heightPx) {
  run(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--window-size=${widthPx},${heightPx}`,
    "--virtual-time-budget=20000",
    `--screenshot=${pngPath}`,
    pathToFileURL(htmlPath).href,
  ]);
}

async function ensurePlaylistQr() {
  const qrPath = path.join(root, "public", "qr", "youtube", "playlist.png");
  if (existsSync(qrPath)) return;
  const script = [
    "import sys; sys.path.insert(0, 'tools')",
    "from pathlib import Path",
    "from generate_youtube_qr_assets import make_qr, write_png, PLAYLIST_ID",
    "modules, _, _ = make_qr(f'https://www.youtube.com/playlist?list={PLAYLIST_ID}')",
    "write_png(Path('public/qr/youtube/playlist.png'), modules)",
  ].join("\n");
  const result = spawnSync(PYTHON_WITH_PYPDF, ["-c", script], { cwd: root, encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
  if (result.status !== 0) throw new Error(`playlist QR failed: ${result.stderr}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!chrome) throw new Error("Chrome or Edge not found");

  const manifests = {};
  for (const group of ["consonants", "vowels"]) {
    manifests[group] = JSON.parse(await readFile(path.join(root, "lessons", group, "manifest.json"), "utf8"));
  }
  const units = UNITS.map((unit) => ({ ...unit, lessonList: unitLessons(unit, manifests) }));
  const covered = new Set(units.flatMap((unit) => unit.lessonList.map((lesson) => lesson.id)));
  for (const group of Object.keys(manifests)) {
    for (const lesson of manifests[group].lessons) {
      if (!covered.has(lesson.id)) throw new Error(`Lesson not in any unit: ${group}/${lesson.id}`);
    }
  }

  const pageCounts = {};
  for (const unit of units) {
    for (const lesson of unit.lessonList) {
      const worksheet = JSON.parse(await readFile(path.join(root, "lessons", lesson.group, lesson.id, "worksheet.json"), "utf8"));
      pageCounts[lesson.id] = worksheet.pages.length;
    }
  }
  for (const unit of units) {
    unit.stats = { lessons: unit.lessonList.length, pages: unit.lessonList.reduce((sum, lesson) => sum + pageCounts[lesson.id], 0) };
  }
  const { sequence, pages } = interiorSequence(units, pageCounts, args.sided);
  const spine = args.spine ?? spineWidth({ pages, sided: args.sided, sheetThickness: args.sheetThickness });

  await mkdir(lessonPdfDir, { recursive: true });
  await ensurePlaylistQr();

  const files = {
    cover: path.join(bookDir, "cover.html"),
    coverGuide: path.join(bookDir, "cover-guide.html"),
    dividers: path.join(bookDir, "dividers.html"),
    blank: path.join(bookDir, "blank.html"),
  };
  await writeFile(files.cover, buildCoverHtml({ units, spine, bleed: args.bleed }));
  await writeFile(files.coverGuide, buildCoverHtml({ units, spine, bleed: args.bleed, guides: true }));
  await writeFile(files.dividers, buildDividersHtml(units));
  await writeFile(files.blank, buildBlankHtml());

  const coverPdf = path.join(printDir, "cover.pdf");
  const dividersPdf = path.join(printDir, "dividers.pdf");
  const blankPdf = path.join(printDir, "_blank.pdf");
  printPdf(files.cover, coverPdf);
  printPdf(files.dividers, dividersPdf);
  printPdf(files.blank, blankPdf);

  const mmToPx = (mm) => Math.round((mm / 25.4) * 96);
  const coverWidth = 420 + spine + args.bleed * 2;
  screenshot(files.coverGuide, path.join(printDir, "cover-preview.png"), mmToPx(coverWidth) + 24, mmToPx(297 + args.bleed * 2) + 24);

  console.log(`interior: ${pages} pages (${args.sided}-sided), spine ${spine}mm, cover ${coverWidth}x${297 + args.bleed * 2}mm`);
  if (args.skipInterior) return;

  // Lesson PDFs are reused while they are newer than their worksheet HTML.
  const lessonPdf = (item) => {
    const htmlPath = path.join(root, "lessons", item.group, item.id, "worksheet.html");
    const pdfPath = path.join(lessonPdfDir, `${item.id}.pdf`);
    if (!existsSync(pdfPath) || statSync(pdfPath).mtimeMs < statSync(htmlPath).mtimeMs) printPdf(htmlPath, pdfPath);
    return pdfPath;
  };
  const merge = async (name, plan, outputPath) => {
    const planPath = path.join(lessonPdfDir, `${name}.json`);
    await writeFile(planPath, JSON.stringify(plan, null, 2));
    return JSON.parse(run(PYTHON_WITH_PYPDF, [path.join(root, "tools", "merge_book_pdf.py"), planPath, outputPath]));
  };

  const plan = sequence.map((item) => {
    if (item.kind === "blank") return { file: blankPdf, page: 0 };
    if (item.kind === "divider") return { file: dividersPdf, page: item.unit - 1 };
    return { file: lessonPdf(item) };
  });
  const report = await merge("plan", plan, path.join(printDir, "interior.pdf"));
  console.log(`interior.pdf: ${report.pages} pages`, report.sizes);
  if (report.pages !== pages) {
    throw new Error(`Printed interior has ${report.pages} pages but worksheets list ${pages}; rerun with --spine after checking.`);
  }

  const handoutDir = path.join(printDir, "handouts");
  await mkdir(handoutDir, { recursive: true });
  for (const unit of units) {
    const unitPlan = [{ file: dividersPdf, page: unit.number - 1 }, ...unit.lessonList.map((lesson) => ({ file: lessonPdf(lesson) }))];
    const handout = await merge(`unit-${unit.number}`, unitPlan, path.join(handoutDir, unit.handoutFile));
    console.log(`handouts/${unit.handoutFile}: ${handout.pages} pages`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
