import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { SYLLABLE_GROUP_DEFINITIONS, groupAudioFile, groupNarrationLines } from "./syllable-group-projects.mjs";

const model = "gemini-3.1-flash-tts-preview";
const voiceName = "Callirrhoe";
const sampleRate = 24000;
const style = "유아 대상 한국어 교사, 밝고 친절한 말투, 또박또박한 발음";
const trimFilter = [
  "silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB",
  "areverse",
  "silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB",
  "areverse",
].join(",");
const outputDir = path.join("public", "audio-gemini-candidates", "vowel-combination-tts");

export const COMBINATION_CHARACTERS = {
  gogo: { subject: "고고 고양이가", owner: "고고", sound: "그" },
  nana: { subject: "나나 나비가", owner: "나나", sound: "느" },
  mimi: { subject: "미미 문어가", owner: "미미", sound: "므" },
  bubu: { subject: "부부 부엉이가", owner: "부부", sound: "브" },
  dodo: { subject: "도도 도토리가", owner: "도도", sound: "드" },
  rara: { subject: "라라 리본이", owner: "라라", sound: "르" },
  sasa: { subject: "사사 사슴이", owner: "사사", sound: "스" },
  haha: { subject: "하하 하마가", owner: "하하", sound: "흐" },
  jiji: { subject: "지지 지렁이가", owner: "지지", sound: "즈" },
  chichi: { subject: "치치 칙폭이가", owner: "치치", sound: "츠" },
  koko: { subject: "코코 코알라가", owner: "코코", sound: "크" },
  toto: { subject: "토토 토끼가", owner: "토토", sound: "트" },
  pupu: { subject: "푸푸 풍선이", owner: "푸푸", sound: "프" },
};

export const COMBINATION_VOWELS = {
  u: { tool: "우우 발판", sound: "우", action: "우우 발판에 앉았어요" },
  eo: { tool: "어어 풍선", sound: "어", action: "어어 풍선을 잡았어요" },
  eu: { tool: "으으 쿠션", sound: "으", action: "으으 쿠션에 앉았어요" },
  i: { tool: "이이 막대", sound: "이", action: "이이 막대를 잡고 섰어요" },
};

export const COMBINATION_TTS_ITEMS = [
  { index: 27, slug: "gu", label: "구", characterKey: "gogo", vowelKey: "u", words: ["구름", "축구공"] },
  { index: 28, slug: "nu", label: "누", characterKey: "nana", vowelKey: "u", words: ["비누", "누룽지"] },
  { index: 29, slug: "mu", label: "무", characterKey: "mimi", vowelKey: "u", words: ["무지개", "무당벌레"] },
  { index: 30, slug: "bu", label: "부", characterKey: "bubu", vowelKey: "u", words: ["부엉이", "부채"] },
  { index: 31, slug: "du", label: "두", characterKey: "dodo", vowelKey: "u", words: ["두더지", "호두"] },
  { index: 32, slug: "ru", label: "루", characterKey: "rara", vowelKey: "u", words: ["루돌프", "빗자루"] },
  { index: 33, slug: "su", label: "수", characterKey: "sasa", vowelKey: "u", words: ["수박", "수영장"] },
  { index: 34, slug: "hu", label: "후", characterKey: "haha", vowelKey: "u", words: ["후추", "후라이팬"] },
  { index: 35, slug: "ju", label: "주", characterKey: "jiji", vowelKey: "u", words: ["주황색", "주머니"] },
  { index: 36, slug: "chu", label: "추", characterKey: "chichi", vowelKey: "u", words: ["후추", "배추"] },
  { index: 37, slug: "ku", label: "쿠", characterKey: "koko", vowelKey: "u", words: ["쿠키", "쿠션"] },
  { index: 38, slug: "tu", label: "투", characterKey: "toto", vowelKey: "u", words: ["투구게"] },
  { index: 39, slug: "pu", label: "푸", characterKey: "pupu", vowelKey: "u", words: ["푸들", "샴푸"] },
  { index: 40, slug: "geo", label: "거", characterKey: "gogo", vowelKey: "eo", words: ["거북이", "거위"] },
  { index: 41, slug: "neo", label: "너", characterKey: "nana", vowelKey: "eo", words: ["너구리"] },
  { index: 42, slug: "meo", label: "머", characterKey: "mimi", vowelKey: "eo", words: ["머리", "주머니"] },
  { index: 43, slug: "beo", label: "버", characterKey: "bubu", vowelKey: "eo", words: ["버스", "버섯"] },
  { index: 44, slug: "deo", label: "더", characterKey: "dodo", vowelKey: "eo", words: ["더위", "더럽다"] },
  { index: 45, slug: "seo", label: "서", characterKey: "sasa", vowelKey: "eo", words: ["서랍", "도서관"] },
  { index: 46, slug: "heo", label: "허", characterKey: "haha", vowelKey: "eo", words: ["허리", "허수아비"] },
  { index: 47, slug: "jeo", label: "저", characterKey: "jiji", vowelKey: "eo", words: ["저울", "저금통"] },
  { index: 48, slug: "keo", label: "커", characterKey: "koko", vowelKey: "eo", words: ["커피", "커튼"] },
  { index: 49, slug: "teo", label: "터", characterKey: "toto", vowelKey: "eo", words: ["놀이터", "터널"] },
  { index: 50, slug: "peo", label: "퍼", characterKey: "pupu", vowelKey: "eo", words: ["퍼즐", "지퍼"] },
  { index: 51, slug: "geu", label: "그", characterKey: "gogo", vowelKey: "eu", words: ["그림", "그네"] },
  { index: 52, slug: "neu", label: "느", characterKey: "nana", vowelKey: "eu", words: ["지느러미", "느리다"] },
  { index: 53, slug: "beu", label: "브", characterKey: "bubu", vowelKey: "eu", words: ["브로콜리", "브라키오사우루스"] },
  { index: 54, slug: "deu", label: "드", characterKey: "dodo", vowelKey: "eu", words: ["카드", "드레스"] },
  { index: 55, slug: "reu", label: "르", characterKey: "rara", vowelKey: "eu", words: ["요구르트"] },
  { index: 56, slug: "seu", label: "스", characterKey: "sasa", vowelKey: "eu", words: ["주스", "스티커"] },
  { index: 57, slug: "jeu", label: "즈", characterKey: "jiji", vowelKey: "eu", words: ["치즈", "마요네즈"] },
  { index: 58, slug: "keu", label: "크", characterKey: "koko", vowelKey: "eu", words: ["크레파스", "크림"] },
  { index: 59, slug: "teu", label: "트", characterKey: "toto", vowelKey: "eu", words: ["요트", "마트"] },
  { index: 60, slug: "peu", label: "프", characterKey: "pupu", vowelKey: "eu", words: ["프테라노돈", "점프"] },
  { index: 61, slug: "gi", label: "기", characterKey: "gogo", vowelKey: "i", words: ["기린", "기차"] },
  { index: 62, slug: "ni", label: "니", characterKey: "nana", vowelKey: "i", words: ["고니", "할머니"] },
  { index: 63, slug: "mi", label: "미", characterKey: "mimi", vowelKey: "i", words: ["미끄럼틀", "미역"] },
  { index: 64, slug: "bi", label: "비", characterKey: "bubu", vowelKey: "i", words: ["비닐봉지", "비빔밥"] },
  { index: 65, slug: "ri", label: "리", characterKey: "rara", vowelKey: "i", words: ["리본", "병아리"] },
  { index: 66, slug: "si", label: "시", characterKey: "sasa", vowelKey: "i", words: ["시계", "시소"] },
  { index: 67, slug: "ji", label: "지", characterKey: "jiji", vowelKey: "i", words: ["지렁이", "지하철"] },
  { index: 68, slug: "chi", label: "치", characterKey: "chichi", vowelKey: "i", words: ["치즈", "곰치"] },
  { index: 69, slug: "ki", label: "키", characterKey: "koko", vowelKey: "i", words: ["키위", "스키"] },
  { index: 70, slug: "ti", label: "티", characterKey: "toto", vowelKey: "i", words: ["티셔츠", "티라노사우루스"] },
  { index: 71, slug: "pi", label: "피", characterKey: "pupu", vowelKey: "i", words: ["피아노", "피자"] },
];

// "아아 아기" meets a vowel tool, like the earlier 오/우 intro narration.
export const VOWEL_INTRO_TTS_ITEMS = [
  { index: 101, slug: "eo", label: "어", intro: true, toolObject: "어어 풍선을", mouth: "입을 크게 벌리고", words: ["어항", "상어"] },
  { index: 102, slug: "eu", label: "으", intro: true, toolObject: "으으 쿠션을", mouth: "입을 옆으로 쭉 당기고", words: ["으르렁", "으쓱"] },
  { index: 103, slug: "i", label: "이", intro: true, toolObject: "이이 막대를", mouth: "입을 옆으로 활짝 벌리고", words: ["이불", "이빨"] },
  { index: 104, slug: "ya", label: "야", intro: true, toolObject: "야야 두 나뭇가지를", mouth: "입을 크게 열고", words: ["야구공", "야채"] },
  { index: 105, slug: "yeo", label: "여", intro: true, toolObject: "여여 두 풍선을", mouth: "입을 부드럽게 열고", words: ["여우", "여름"] },
  { index: 106, slug: "yo", label: "요", intro: true, toolObject: "요요 그네를", mouth: "입을 동그랗게 하고", words: ["요리", "요정"] },
  { index: 107, slug: "yu", label: "유", intro: true, toolObject: "유유 의자를", mouth: "입을 앞으로 모으고", words: ["유리", "유치원"] },
];

export function buildVowelIntroText(item) {
  return [
    "아아 아기가",
    `${item.toolObject} 만나`,
    `${item.label}! ${item.mouth} 같이 말해요.`,
    `${item.label}!`,
    `${item.words.join(", ")}.`,
    `${item.label}!`,
  ].join("\n");
}

export function buildCombinationText(item) {
  if (item.intro) {
    return buildVowelIntroText(item);
  }

  const character = COMBINATION_CHARACTERS[item.characterKey];
  const vowel = COMBINATION_VOWELS[item.vowelKey];
  if (!character || !vowel) {
    throw new Error(`Unknown combination setup: ${item.slug}`);
  }

  return [
    `${character.subject} ${vowel.action}.`,
    `${character.owner}의 소리, ${character.sound}! ${vowel.tool}의 소리, ${vowel.sound}!`,
    `${character.sound},${vowel.sound}!`,
    `둘이 합치면, ${item.label}!`,
    `${item.words.join(", ")}.`,
    `${item.label}!`,
  ].join("\n");
}

export function buildCombinationPrompt(text) {
  return [
    `${style}로 아래 대본만 그대로 읽어 주세요.`,
    "줄이 바뀌는 곳과 쉼표 뒤에서는 아이가 따라 말할 수 있게 잠깐 쉬어 주세요.",
    "대본 밖의 말은 하지 마세요.",
    "",
    text,
  ].join("\n");
}

export function combinationFileName(item) {
  if (item.intro) {
    return `vowel_${item.label}_${item.slug}`;
  }
  return `${String(item.index).padStart(2, "0")}_${item.label}_${item.slug}`;
}

export function selectItems(args) {
  const requested = args.flatMap((arg) => arg.split(",")).map((arg) => arg.trim()).filter(Boolean);
  if (requested.length === 0) {
    throw new Error("Pass slugs (e.g. gu nu), syllables (e.g. 구), a vowel key (e.g. u), intro, intro-<slug> (e.g. intro-eu), groups, group-<id> (e.g. group-yeo-group), or all");
  }
  return requested.flatMap((key) => {
    if (key === "all") {
      return COMBINATION_TTS_ITEMS;
    }
    if (key === "intro") {
      return VOWEL_INTRO_TTS_ITEMS;
    }
    if (key === "groups") {
      return SYLLABLE_GROUP_DEFINITIONS.map((definition) => ({ group: definition }));
    }
    if (key.startsWith("group-")) {
      const definition = SYLLABLE_GROUP_DEFINITIONS.find((candidate) => candidate.id === key.slice("group-".length));
      if (!definition) {
        throw new Error(`Unknown group item: ${key}`);
      }
      return [{ group: definition }];
    }
    if (key.startsWith("intro-")) {
      const intro = VOWEL_INTRO_TTS_ITEMS.find((candidate) => `intro-${candidate.slug}` === key);
      if (!intro) {
        throw new Error(`Unknown vowel intro item: ${key}`);
      }
      return [intro];
    }
    if (COMBINATION_VOWELS[key]) {
      return COMBINATION_TTS_ITEMS.filter((item) => item.vowelKey === key);
    }
    const item = COMBINATION_TTS_ITEMS.find((candidate) => candidate.slug === key || candidate.label === key);
    if (!item) {
      throw new Error(`Unknown combination item: ${key}`);
    }
    return [item];
  });
}

function run(command, args) {
  if (process.platform === "win32" && command.endsWith(".cmd")) {
    return execFileSync("cmd.exe", ["/d", "/s", "/c", command, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  }

  return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

async function hasUsableFile(filePath) {
  try {
    return (await stat(filePath)).size > 0;
  } catch {
    return false;
  }
}

function wavFromPcm(pcm) {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * 2;

  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

async function generateAudio({ endpoint, token, prompt, label }) {
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${label}: Gemini TTS failed ${response.status} ${await response.text()}`);
  }

  const json = await response.json();
  const data = json.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)?.inlineData?.data;
  if (!data) {
    throw new Error(`${label}: Gemini TTS returned no audio`);
  }
  return wavFromPcm(Buffer.from(data, "base64"));
}

function probeDuration(filePath) {
  return Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", filePath]));
}

async function readManifest(manifestPath) {
  try {
    return JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    return { model, voiceName, style, trimFilter, items: [] };
  }
}

const GROUP_LINE_GAP = 0.6;
// Gemini pauses 2-3s at each comma in short lines; keep pauses at about 0.7s so blocks stay snappy.
const GROUP_PAUSE_CAP = "silenceremove=stop_periods=-1:stop_duration=0.35:stop_threshold=-40dB:stop_silence=0.35";

function speechSegments(audioPath) {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-i", audioPath, "-af", "silencedetect=noise=-40dB:d=0.2", "-f", "null", "-"], { encoding: "utf8" });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  const total = probeDuration(audioPath);
  const segments = [];
  let speechStart = 0;
  for (const line of output.split(/\r?\n/u)) {
    const start = line.match(/silence_start:\s*([0-9.]+)/u);
    if (start && Number(start[1]) > speechStart) segments.push({ start: speechStart, end: Number(start[1]) });
    const end = line.match(/silence_end:\s*([0-9.]+)/u);
    if (end) speechStart = Number(end[1]);
  }
  if (total > speechStart) segments.push({ start: speechStart, end: total });
  return segments.filter((segment) => segment.end - segment.start >= 0.12);
}

// Each narration line is generated on its own and joined with a fixed pause, so every scene
// change in the grouped video lands on a known time instead of a guessed pause.
async function generateGroup({ definition, endpoint, token, force, root, targetDir, wavDir }) {
  const lineDir = path.join(wavDir, "group", definition.id);
  await mkdir(lineDir, { recursive: true });
  const texts = groupNarrationLines(definition);
  const trimmedPaths = [];
  for (const [index, text] of texts.entries()) {
    const rawPath = path.join(lineDir, `${String(index + 1).padStart(2, "0")}.wav`);
    if (force || !(await hasUsableFile(rawPath))) {
      console.log(`${definition.id} line ${index + 1}: generating`);
      await writeFile(rawPath, await generateAudio({ endpoint, token, prompt: buildCombinationPrompt(text), label: `${definition.id}-${index + 1}` }));
    }
    const trimmedPath = path.join(lineDir, `${String(index + 1).padStart(2, "0")}-trimmed.wav`);
    run("ffmpeg", ["-y", "-v", "error", "-i", rawPath, "-af", `${trimFilter},${GROUP_PAUSE_CAP}`, "-ac", "1", "-ar", String(sampleRate), trimmedPath]);
    trimmedPaths.push(trimmedPath);
  }

  const lines = [];
  let cursor = 0;
  for (const [index, trimmedPath] of trimmedPaths.entries()) {
    const duration = probeDuration(trimmedPath);
    const segments = speechSegments(trimmedPath);
    lines.push({
      text: texts[index],
      start: Number(cursor.toFixed(3)),
      end: Number((cursor + duration).toFixed(3)),
      lastPhraseStart: Number((cursor + (segments.at(-1)?.start ?? 0)).toFixed(3)),
    });
    cursor += duration + GROUP_LINE_GAP;
  }

  const gapPath = path.join(lineDir, "gap.wav");
  run("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", `anullsrc=r=${sampleRate}:cl=mono`, "-t", String(GROUP_LINE_GAP), gapPath]);
  const listPath = path.join(lineDir, "concat.txt");
  const listLines = trimmedPaths.flatMap((file, index) => [`file '${file.replaceAll("\\", "/")}'`, ...(index < trimmedPaths.length - 1 ? [`file '${gapPath.replaceAll("\\", "/")}'`] : [])]);
  await writeFile(listPath, `${listLines.join("\n")}\n`, "utf8");
  const mp3Path = path.join(targetDir, groupAudioFile(definition));
  run("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", listPath, "-ac", "1", "-ar", String(sampleRate), "-b:a", "160k", mp3Path]);
  const duration = Number(probeDuration(mp3Path).toFixed(3));
  console.log(`${path.basename(mp3Path)}: ${duration}s`);

  return {
    index: definition.index,
    slug: definition.id,
    label: definition.blocks.map((block) => block.syllable).join(""),
    text: texts.join("\n"),
    mp3: path.relative(root, mp3Path).replaceAll(path.sep, "/"),
    wav: path.relative(root, lineDir).replaceAll(path.sep, "/"),
    duration,
    lines,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const root = process.cwd();
  const targetDir = path.join(root, outputDir);
  const wavDir = path.join(targetDir, "_wav");
  const manifestPath = path.join(targetDir, "manifest.json");
  const force = process.env.GEMINI_TTS_FORCE === "1";
  const items = selectItems(argv);

  await mkdir(wavDir, { recursive: true });

  const gcloud = process.platform === "win32" ? "gcloud.cmd" : "gcloud";
  const project = run(gcloud, ["config", "get-value", "project"]);
  const token = run(gcloud, ["auth", "print-access-token"]);
  const endpoint = `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/${model}:generateContent`;
  const manifest = await readManifest(manifestPath);

  for (const item of items) {
    if (item.group) {
      const entry = await generateGroup({ definition: item.group, endpoint, token, force, root, targetDir, wavDir });
      manifest.items = [...manifest.items.filter((existing) => existing.index !== entry.index), entry].sort((a, b) => a.index - b.index);
      continue;
    }
    const baseName = combinationFileName(item);
    const wavPath = path.join(wavDir, `${baseName}.wav`);
    const mp3Path = path.join(targetDir, `${baseName}.mp3`);
    const text = buildCombinationText(item);

    if (force || !(await hasUsableFile(wavPath))) {
      console.log(`${baseName}: generating`);
      await writeFile(wavPath, await generateAudio({ endpoint, token, prompt: buildCombinationPrompt(text), label: baseName }));
    } else {
      console.log(`${baseName}: reusing ${path.relative(root, wavPath)}`);
    }

    run("ffmpeg", ["-y", "-v", "error", "-i", wavPath, "-af", trimFilter, "-ac", "1", "-ar", String(sampleRate), "-b:a", "160k", mp3Path]);
    const duration = Number(probeDuration(mp3Path).toFixed(3));
    console.log(`${baseName}: ${duration}s`);

    const entry = {
      index: item.index,
      slug: item.slug,
      label: item.label,
      text,
      mp3: path.relative(root, mp3Path).replaceAll(path.sep, "/"),
      wav: path.relative(root, wavPath).replaceAll(path.sep, "/"),
      duration,
    };
    manifest.items = [...manifest.items.filter((existing) => existing.index !== item.index), entry].sort((a, b) => a.index - b.index);
  }

  manifest.count = manifest.items.length;
  manifest.generatedAt = new Date().toISOString();
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
