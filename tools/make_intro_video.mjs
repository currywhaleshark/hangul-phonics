#!/usr/bin/env node
// Channel intro video for parents: narration (Gemini TTS) over clips from the lesson videos and a few
// slides, with burned-in captions. Output: public/video-assets/intro/sorinara-intro.mp4
//   node tools/make_intro_video.mjs            (reuses recorded lines; GEMINI_TTS_FORCE=1 re-records)
//   node tools/make_intro_video.mjs --redo 03-play   (re-records one line)
import { existsSync } from "node:fs";
import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { generateAudio, model, run, trimFilter } from "./generate_gemini_combination_tts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const audioDir = path.join(root, "public", "audio-gemini-candidates", "intro-video");
const workDir = path.join(root, "tmp", "intro-video");
const outputPath = path.join(root, "public", "video-assets", "intro", "sorinara-intro.mp4");
const SAMPLES = path.join(root, "public", "video-assets", "consonant-lesson-samples");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const FPS = 30;
const LEAD = 0.35;
const TAIL = 0.6;
const LAST_TAIL = 2.2;

// Keeps pauses inside a line at about 0.5s.
const PAUSE_CAP = "silenceremove=stop_periods=-1:stop_duration=0.25:stop_threshold=-40dB:stop_silence=0.25";
const PARENT_STYLE = "아이를 키우는 부모가 다른 부모에게 이야기하듯 차분하고 따뜻한 말투, 들뜨지 않고 자연스러운 속도";

export const INTRO_LINES = [
  {
    id: "01-hook",
    // "아아 나뭇가지" comes out as "아 나뭇가지" or "아아. 나뭇가지" with this voice, so the hook skips the name.
    text: "고고 고양이가 나뭇가지를 들면, 가!",
    style: "어린아이에게 들려주듯 밝고 다정한 말투",
    scene: { kind: "clip", file: "ga-a-timed-lesson.mp4", syncAt: 3.95, syncFromLineEnd: 0.45 },
  },
  {
    id: "02-friends",
    text: "우리 아이에게 한글 소리를 알려 주고 싶어서, 자음마다 친구를 하나씩 만들어 봤어요. 고고 고양이, 나나 나비, 아아 아기 같은 친구들이에요.",
    scene: { kind: "slide", slide: "friends" },
  },
  {
    id: "02b-tools",
    text: "모음은 나뭇가지, 상자, 발판, 풍선, 그네 같은 놀이 도구로 만들었어요.",
    scene: { kind: "slide", slide: "tools" },
  },
  {
    id: "03-play",
    text: "친구가 나뭇가지를 들거나 상자에 올라타면 글자가 돼요. 아이가 이 놀이를 좋아해서 영상과 학습지도 조금씩 늘려 왔어요.",
    scene: { kind: "clip", file: "wa-group-timed-lesson.mp4", syncAt: 16.08, syncFromLineStart: 3.0 },
  },
  {
    id: "04-qr",
    text: "학습지의 QR을 찍으면 그 글자 영상이 나와요. 아이랑 같이 보고 따라 말하며 써 보세요.",
    speech: "학습지의 큐알을 찍으면 그 글자 영상이 나와요. 아이랑 같이 보고 따라 말하며 써 보세요.",
    scene: { kind: "slide", slide: "qr" },
  },
  {
    id: "05-share",
    text: "비슷한 또래 아이를 키우는 분들께 도움이 될까 해서 나눠요. 학습지는 설명란에서 무료로 받을 수 있어요.",
    scene: { kind: "slide", slide: "share" },
  },
];

function buildPrompt(line) {
  return [
    `${line.style ?? PARENT_STYLE}로 아래 문장만 그대로 읽어 주세요.`,
    "쉼표 뒤에서는 아주 짧게 쉬어 주세요. 문장 밖의 말은 하지 마세요.",
    "",
    line.speech ?? line.text,
  ].join("\n");
}

const duration = (file) => Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]));
const ffmpeg = (args) => run("ffmpeg", ["-y", "-v", "error", ...args]);

function chrome(args) {
  return run(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=20000", ...args]);
}

function screenshot(htmlPath, pngPath, width, height, transparent = false) {
  chrome([
    `--window-size=${width},${height}`,
    ...(transparent ? ["--default-background-color=00000000"] : []),
    `--screenshot=${pngPath}`,
    pathToFileURL(htmlPath).href,
  ]);
}

async function recordLines(redo) {
  await mkdir(audioDir, { recursive: true });
  const gcloud = process.platform === "win32" ? "gcloud.cmd" : "gcloud";
  let endpoint = null;
  let token = null;
  for (const line of INTRO_LINES) {
    const rawPath = path.join(audioDir, `${line.id}.wav`);
    line.audio = path.join(audioDir, `${line.id}-trimmed.wav`);
    if (process.env.GEMINI_TTS_FORCE === "1" || redo.includes(line.id) || !existsSync(rawPath)) {
      if (!endpoint) {
        const project = run(gcloud, ["config", "get-value", "project"]);
        token = run(gcloud, ["auth", "print-access-token"]);
        endpoint = `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/${model}:generateContent`;
      }
      console.log(`recording ${line.id}`);
      await writeFile(rawPath, await generateAudio({ endpoint, token, prompt: buildPrompt(line), label: line.id }));
    }
    ffmpeg(["-i", rawPath, "-af", `${trimFilter},${PAUSE_CAP}`, "-ac", "1", "-ar", "24000", line.audio]);
    line.duration = duration(line.audio);
  }
}

// ---------- slides ----------

const asset = (relative) => pathToFileURL(path.join(root, relative)).href;
const CHARACTERS = [
  "ㄱ-gogo-cat", "ㄴ-nana-butterfly", "ㅁ-mimi-octopus", "ㅂ-bubu-owl", "ㄷ-dodo-acorn", "ㄹ-rara-ribbon", "ㅅ-sasa-deer",
  "ㅎ-haha-hippo", "ㅈ-jiji-worm", "ㅊ-chichi-train", "ㅋ-koko-koala", "ㅇ-aa-baby", "ㅌ-toto-rabbit", "ㅍ-pupu-balloon",
].map((name) => asset(`public/video-assets/characters/consonants/${name}.png`));

const VOWEL_TOOLS = [
  ["ㅏ", "아아 나뭇가지"], ["ㅗ", "오오 상자"], ["ㅜ", "우우 발판"], ["ㅓ", "어어 풍선"], ["ㅣ", "이이 막대"],
  ["ㅡ", "으으 쿠션"], ["ㅑ", "야야 두 나뭇가지"], ["ㅕ", "여여 두 풍선"], ["ㅛ", "요요 그네"], ["ㅠ", "유유 의자"],
].map(([letter, name]) => ({ letter, image: asset(`public/video-assets/vowel-alpha/tools/${name}-alpha.png`) }));

const BASE_CSS = `
* { box-sizing: border-box; }
html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; font-family: 'Jua', sans-serif; color: #3a2a20; }
.stage { position: relative; width: 1920px; height: 1080px; overflow: hidden;
  background: radial-gradient(circle, rgba(255,255,255,.75) 7px, transparent 8px) 0 0 / 64px 64px, #fff4cf; }
.hill { position: absolute; left: -200px; right: -200px; bottom: -420px; height: 760px; border-radius: 50%; background: linear-gradient(#9ccc65, #7cb342); }
img { display: block; }
`;

const CAPTION_CSS = `
.caption { position: absolute; left: 50%; bottom: 44px; transform: translateX(-50%); width: 1640px;
  padding: 22px 48px; border-radius: 44px; background: rgba(255,255,255,.94); box-shadow: 0 6px 0 rgba(58,42,32,.14);
  text-align: center; font-size: 46px; line-height: 1.32; color: #3a2a20; }
`;

function page(body, { transparent = false } = {}) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Jua&display=swap" rel="stylesheet">
<style>${BASE_CSS}${CAPTION_CSS}${transparent ? "html,body{background:transparent}" : ""}
.friends { position: absolute; left: 0; right: 0; top: 96px; display: flex; flex-direction: column; align-items: center; }
.friends .row { display: flex; align-items: flex-end; }
.friends .row img { width: 262px; height: 262px; object-fit: contain; margin: 0 4px; filter: drop-shadow(0 6px 4px rgba(58,42,32,.22)); }
.friends .row + .row { margin-top: -40px; }
.tools { position: absolute; left: 0; right: 0; top: 70px; display: grid; grid-template-columns: repeat(5, 300px); justify-content: center; gap: 18px 40px; }
.tools figure { margin: 0; display: flex; flex-direction: column; align-items: center; }
.tools img { width: 280px; height: 290px; object-fit: contain; object-position: bottom; filter: drop-shadow(0 6px 4px rgba(58,42,32,.22)); }
.tools figcaption { margin-top: 8px; min-width: 76px; padding: 2px 16px; border-radius: 18px; background: #fff; text-align: center; font-size: 46px; color: #1b8fd6; box-shadow: 0 4px 0 rgba(58,42,32,.12); }
.sheet { position: absolute; left: 150px; top: 46px; height: 790px; transform: rotate(-3deg); border-radius: 18px; box-shadow: 0 18px 40px rgba(58,42,32,.25); }
.zoom { position: absolute; left: 520px; top: 70px; width: 300px; height: 300px; border-radius: 50%; border: 10px solid #1b8fd6; background: #fff center / 260px no-repeat; box-shadow: 0 10px 24px rgba(58,42,32,.25); }
.arrow { position: absolute; left: 850px; top: 300px; font-size: 150px; color: #1b8fd6; }
.phone { position: absolute; left: 1060px; top: 60px; width: 720px; padding: 26px; border-radius: 48px; background: #2e2a28; box-shadow: 0 18px 40px rgba(58,42,32,.3); }
.phone img { width: 100%; border-radius: 22px; }
.phone-label { margin-top: 18px; text-align: center; color: #fff; font-size: 40px; }
.cover { position: absolute; left: 140px; top: 60px; height: 820px; border-radius: 16px; box-shadow: 0 18px 40px rgba(58,42,32,.28); transform: rotate(-2deg); }
.share { position: absolute; left: 860px; top: 90px; width: 940px; }
.share h1 { margin: 0 0 26px; font-weight: normal; font-size: 92px; line-height: 1.15; color: #f08a00; -webkit-text-stroke: 14px #fff; paint-order: stroke fill; }
.share .badge { display: inline-block; margin-bottom: 30px; padding: 12px 34px; border-radius: 99px; background: #e8578f; color: #fff; font-size: 48px; }
.share ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 14px; }
.share li { padding: 14px 26px; border-radius: 24px; background: #fff; font-size: 40px; border: 5px solid var(--c); }
.share li b { color: var(--c); font-weight: normal; margin-right: 14px; }
</style></head><body>${body}</body></html>`;
}

const caption = (text) => `<div class="caption">${text}</div>`;

function slideHtml(slide, line, extras) {
  if (slide === "friends") {
    const rows = [CHARACTERS.slice(0, 5), CHARACTERS.slice(5, 10), CHARACTERS.slice(10)];
    return page(`<div class="stage"><div class="hill"></div><div class="friends">${rows
      .map((row) => `<div class="row">${row.map((src) => `<img src="${src}">`).join("")}</div>`)
      .join("")}</div>${caption(line.text)}</div>`);
  }
  if (slide === "tools") {
    return page(`<div class="stage"><div class="hill"></div><div class="tools">${VOWEL_TOOLS.map(
      (tool) => `<figure><img src="${tool.image}"><figcaption>${tool.letter}</figcaption></figure>`,
    ).join("")}</div>${caption(line.text)}</div>`);
  }
  if (slide === "qr") {
    return page(`<div class="stage"><div class="hill"></div>
<img class="sheet" src="${pathToFileURL(extras.worksheetPng).href}">
<div class="zoom" style="background-image:url('${asset(extras.qrImage)}')"></div>
<div class="arrow">➜</div>
<div class="phone"><img src="${asset("public/video-assets/consonant-lesson-samples/ga-a-timed-lesson-preview.jpg")}"><div class="phone-label">▶ ㄱ + ㅏ = 가</div></div>
${caption(line.text)}</div>`);
  }
  if (slide === "share") {
    const units = [
      ["1단원", "자음 친구 만나기", "#f08a00"],
      ["2단원", "모음 도구와 첫 글자", "#5fa52f"],
      ["3단원", "모음 넓히기", "#1b8fd6"],
      ["4단원", "두 줄 모음과 ㅘ", "#a24bc0"],
    ];
    return page(`<div class="stage"><div class="hill"></div>
<img class="cover" src="${pathToFileURL(extras.coverPng).href}">
<div class="share"><h1>소리나라<br>한글친구들 학습지</h1><div class="badge">무료 · 설명란 링크에서 받기</div>
<ul>${units.map(([no, title, color]) => `<li style="--c:${color}"><b>${no}</b>${title}</li>`).join("")}</ul></div>
${caption(line.text)}</div>`);
  }
  throw new Error(`Unknown slide ${slide}`);
}

async function renderWorksheetPage() {
  // One worksheet page (2장, 가 with its QR) cut out by hiding the other sheets.
  const lessonDir = path.join(root, "lessons", "vowels", "lesson-02-gogo-nana-combination");
  const source = await (await import("node:fs/promises")).readFile(path.join(lessonDir, "worksheet.html"), "utf8");
  const cropPath = path.join(lessonDir, "_intro-crop.html");
  const css = "<style>.toolbar{display:none}body{padding:0!important;background:#fffdf7!important}.sheet{display:none!important;margin:0!important;box-shadow:none!important;border-radius:0!important}.sheet:nth-of-type(2){display:block!important}</style></head>";
  await writeFile(cropPath, source.replace("</head>", css));
  const pngPath = path.join(workDir, "worksheet-page.png");
  try {
    screenshot(cropPath, pngPath, 794, 1123);
  } finally {
    await rm(cropPath, { force: true });
  }
  const qr = source.match(/class="video-qr"[^>]*>\s*<img src="\.\.\/\.\.\/\.\.\/([^"]+)"/);
  return { worksheetPng: pngPath, qrImage: qr[1] };
}

async function renderCoverFront() {
  const coverHtml = path.join(root, "book", "volume-1", "cover.html");
  const full = path.join(workDir, "cover-full.png");
  screenshot(coverHtml, full, 1680, 1180);
  const front = path.join(workDir, "cover-front.png");
  // cover.html is 438mm wide at 96dpi with 3mm bleed; the front panel starts at 225mm, after the
  // 12px body padding of the screen stylesheet.
  const mm = (value) => Math.round((value / 25.4) * 96);
  ffmpeg(["-i", full, "-vf", `crop=${mm(210) - 2}:${mm(297)}:${12 + mm(225) + 1}:${12 + mm(3)}`, front]);
  return front;
}

// ---------- assembly ----------

async function buildScenes() {
  const extras = { ...(await renderWorksheetPage()), coverPng: await renderCoverFront() };
  const segments = [];
  for (const [index, line] of INTRO_LINES.entries()) {
    const isLast = index === INTRO_LINES.length - 1;
    const sceneDuration = LEAD + line.duration + (isLast ? LAST_TAIL : TAIL);
    const segment = path.join(workDir, `scene-${line.id}.mp4`);
    if (line.scene.kind === "slide") {
      const html = path.join(workDir, `slide-${line.id}.html`);
      const png = path.join(workDir, `slide-${line.id}.png`);
      await writeFile(html, slideHtml(line.scene.slide, line, extras));
      screenshot(html, png, 1920, 1080);
      const frames = Math.round(sceneDuration * FPS);
      ffmpeg([
        "-loop", "1", "-framerate", String(FPS), "-t", sceneDuration.toFixed(3), "-i", png,
        "-vf", `scale=3840:2160,zoompan=z='1+0.035*on/${frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=${FPS},format=yuv420p`,
        "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-an", segment,
      ]);
    } else {
      const html = path.join(workDir, `caption-${line.id}.html`);
      const png = path.join(workDir, `caption-${line.id}.png`);
      await writeFile(html, page(caption(line.text), { transparent: true }));
      screenshot(html, png, 1920, 1080, true);
      const { syncAt, syncFromLineEnd, syncFromLineStart } = line.scene;
      const sceneTime = syncFromLineEnd != null ? LEAD + line.duration - syncFromLineEnd : LEAD + syncFromLineStart;
      const clipStart = Math.max(0, syncAt - sceneTime);
      ffmpeg([
        "-ss", clipStart.toFixed(3), "-t", sceneDuration.toFixed(3), "-i", path.join(SAMPLES, line.scene.file), "-i", png,
        "-filter_complex", `[0:v]fps=${FPS},scale=1920:1080[v];[v][1:v]overlay=0:0,format=yuv420p`,
        "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-an", segment,
      ]);
    }
    const audio = path.join(workDir, `scene-${line.id}.wav`);
    const lead = Math.round(LEAD * 1000);
    ffmpeg(["-i", line.audio, "-af", `adelay=${lead},apad=whole_dur=${sceneDuration.toFixed(3)}`, "-ar", "48000", "-ac", "2", audio]);
    segments.push({ video: segment, audio, duration: sceneDuration });
  }
  return segments;
}

async function main() {
  const redoIndex = process.argv.indexOf("--redo");
  const redo = redoIndex >= 0 ? process.argv[redoIndex + 1].split(",") : [];
  await mkdir(workDir, { recursive: true });
  await mkdir(path.dirname(outputPath), { recursive: true });
  await recordLines(redo);
  for (const line of INTRO_LINES) console.log(`${line.id}: ${line.duration.toFixed(2)}s`);

  const segments = await buildScenes();
  const videoList = path.join(workDir, "video.txt");
  const audioList = path.join(workDir, "audio.txt");
  await writeFile(videoList, segments.map((segment) => `file '${segment.video.replaceAll("\\", "/")}'`).join("\n"));
  await writeFile(audioList, segments.map((segment) => `file '${segment.audio.replaceAll("\\", "/")}'`).join("\n"));
  const audioPath = path.join(workDir, "narration.wav");
  ffmpeg(["-f", "concat", "-safe", "0", "-i", audioList, "-c", "copy", audioPath]);
  ffmpeg([
    "-f", "concat", "-safe", "0", "-i", videoList, "-i", audioPath,
    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", outputPath,
  ]);
  await copyFile(path.join(workDir, "slide-05-share.png"), path.join(path.dirname(outputPath), "sorinara-intro-thumbnail.png"));
  console.log(`video=${path.relative(root, outputPath)} ${duration(outputPath).toFixed(1)}s`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
