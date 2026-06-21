import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const model = "gemini-2.5-flash-preview-tts";
const voiceName = "Kore";
const sampleRate = 24000;
const defaultOutputDir = path.join("public", "audio-gemini-candidates", "grouped");

export const syllableGroups = [
  { key: "ㄱ", syllables: ["가", "고", "구", "거", "교", "규", "그", "기"] },
  { key: "ㄴ", syllables: ["나", "노", "누", "너", "뇨", "뉴", "느", "니"] },
  { key: "ㅁ", syllables: ["마", "모", "무", "머", "묘", "뮤", "므", "미"] },
  { key: "ㅂ", syllables: ["바", "보", "부", "버", "뵤", "뷰", "브", "비"] },
  { key: "ㄷ", syllables: ["다", "도", "두", "더", "됴", "듀", "드", "디"] },
  { key: "ㄹ", syllables: ["라", "로", "루", "러", "료", "류", "르", "리"] },
  { key: "ㅅ", syllables: ["사", "소", "수", "서", "쇼", "슈", "스", "시"] },
  { key: "ㅎ", syllables: ["하", "호", "후", "허", "효", "휴", "흐", "히"] },
  { key: "ㅈ", syllables: ["자", "조", "주", "저", "죠", "쥬", "즈", "지"] },
  { key: "ㅊ", syllables: ["차", "초", "추", "처", "쵸", "츄", "츠", "치"] },
  { key: "ㅋ", syllables: ["카", "코", "쿠", "커", "쿄", "큐", "크", "키"] },
  { key: "ㅌ", syllables: ["타", "토", "투", "터", "툐", "튜", "트", "티"] },
  { key: "ㅍ", syllables: ["파", "포", "푸", "퍼", "표", "퓨", "프", "피"] },
  { key: "모음", syllables: ["아", "어", "오", "우", "요", "유", "으", "이"] },
];

const groupAliases = new Map([
  ["vowel", "모음"],
  ["vowels", "모음"],
]);

const pronunciationGuides = new Map([
  ["므", "므는 미음에 으를 붙인 소리입니다. 무나 미가 아니라 므입니다."],
  ["죠", "죠는 지읒에 요를 붙인 소리입니다. 조나 저가 아니라 죠입니다."],
  ["쥬", "쥬는 지읒에 유를 붙인 소리입니다. 주나 즈가 아니라 쥬입니다."],
  ["즈", "즈는 지읒에 으를 붙인 소리입니다. 지나 주가 아니라 즈입니다."],
  ["츄", "츄는 치읓에 유를 붙인 소리입니다. 추나 치가 아니라 츄입니다."],
  ["툐", "툐는 티읕에 요를 붙인 소리입니다. 토나 튜가 아니라 툐입니다."],
]);

function groupForKey(key) {
  const normalized = groupAliases.get(key) || key;
  const group = syllableGroups.find((candidate) => candidate.key === normalized);
  if (!group) {
    throw new Error(`Unknown syllable group: ${key}`);
  }
  return group;
}

function roundTime(value) {
  return Number(value.toFixed(3));
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

function spawnChecked(command, args, label) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`${label}: ${result.stderr || result.stdout}`);
  }
  return `${result.stdout || ""}\n${result.stderr || ""}`;
}

async function hasUsableFile(filePath) {
  try {
    return (await stat(filePath)).size > 0;
  } catch {
    return false;
  }
}

function parseTargetFile(fileName) {
  const numbered = fileName.match(/^(\d+)_([가-힣]+)\.mp3$/u);
  if (numbered) return { syllable: numbered[2], fileName };

  const vowel = fileName.match(/^([가-힣])!\.mp3$/u);
  if (vowel) return { syllable: vowel[1], fileName };

  return null;
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

export function resolveGroups(args) {
  const rawGroups = args.length > 0 ? args : ["ㄱ"];
  const requested = rawGroups
    .flatMap((arg) => arg.split(","))
    .map((arg) => arg.trim())
    .filter(Boolean);

  if (requested.some((arg) => arg.toLowerCase() === "all")) {
    return syllableGroups.map((group) => group.key);
  }

  return requested.map((arg) => groupForKey(arg).key);
}

export function repairSyllablesFromArgs(args) {
  const repairIndex = args.findIndex((arg) => arg === "--repair" || arg === "repair");
  if (repairIndex === -1) return null;

  const syllables = args
    .slice(repairIndex + 1)
    .flatMap((arg) => arg.split(","))
    .map((arg) => arg.trim())
    .filter(Boolean);

  if (syllables.length === 0) {
    throw new Error("Repair mode requires at least one syllable");
  }

  return syllables;
}

export function targetsForGroup(groupKey, fileNames) {
  const group = groupForKey(groupKey);
  const bySyllable = new Map();

  for (const fileName of fileNames) {
    const target = parseTargetFile(fileName);
    if (target && !bySyllable.has(target.syllable)) {
      bySyllable.set(target.syllable, target);
    }
  }

  const missing = group.syllables.filter((syllable) => !bySyllable.has(syllable));
  if (missing.length > 0) {
    throw new Error(`Missing source audio filenames for ${group.key}: ${missing.join(", ")}`);
  }

  return group.syllables.map((syllable) => bySyllable.get(syllable));
}

export function targetsForSyllables(syllables, fileNames) {
  const bySyllable = new Map();

  for (const fileName of fileNames) {
    const target = parseTargetFile(fileName);
    if (target && !bySyllable.has(target.syllable)) {
      bySyllable.set(target.syllable, target);
    }
  }

  const missing = syllables.filter((syllable) => !bySyllable.has(syllable));
  if (missing.length > 0) {
    throw new Error(`Missing source audio filenames for selected syllables: ${missing.join(", ")}`);
  }

  return syllables.map((syllable) => bySyllable.get(syllable));
}

export function buildPrompt(syllables) {
  const sequence = syllables.map((syllable) => `${syllable}.`).join(" [pause] ");
  return [
    "밝고 다정한 유아 선생님 목소리로, 아래 한국어 낱소리만 읽어 주세요.",
    "각 낱소리는 아이가 따라 말할 수 있게 또렷하고 짧게 말해 주세요.",
    "너무 노래하듯 하지 말고, 살짝 웃는 교육용 억양으로 통일해 주세요.",
    "각 [pause] 자리에서는 0.8초 정도 조용히 쉬어 주세요.",
    "파일명, 번호, 설명, 괄호 안 지시문은 읽지 마세요.",
    "",
    sequence,
  ].join("\n");
}

export function buildRepairPrompt(syllables) {
  const sequence = syllables.map((syllable) => `${syllable}.`).join(" [pause] ");
  const guides =
    syllables.length > 1
      ? syllables
          .map((syllable) => pronunciationGuides.get(syllable))
          .filter(Boolean)
          .join("\n")
      : "";

  return [
    "밝고 다정한 유아 선생님 목소리로, 한글 낱소리 교정 녹음을 해 주세요.",
    "아래 발음 기준을 참고하되, 실제 음성에는 마지막 읽을 소리 줄의 음절만 순서대로 말해 주세요.",
    "각 낱소리는 아이가 따라 말할 수 있게 또렷하고 짧게 말해 주세요.",
    "너무 노래하듯 하지 말고, 살짝 웃는 교육용 억양으로 통일해 주세요.",
    "각 [pause] 자리에서는 0.8초 정도 조용히 쉬어 주세요.",
    "",
    guides,
    guides ? "" : null,
    "읽을 소리:",
    sequence,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function parseSilenceDetect(output) {
  const silences = [];
  let currentStart = null;

  for (const line of output.split(/\r?\n/u)) {
    const startMatch = line.match(/silence_start:\s*([0-9.]+)/u);
    if (startMatch) {
      currentStart = Number(startMatch[1]);
      continue;
    }

    const endMatch = line.match(/silence_end:\s*([0-9.]+)\s*\|\s*silence_duration:\s*([0-9.]+)/u);
    if (!endMatch) continue;

    const end = Number(endMatch[1]);
    const duration = Number(endMatch[2]);
    const start = currentStart ?? end - duration;
    silences.push({ start: roundTime(start), end: roundTime(end), duration: roundTime(duration) });
    currentStart = null;
  }

  return silences;
}

export function groupedTrimFilter() {
  return [
    "silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB",
    "areverse",
    "silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB",
    "areverse",
  ].join(",");
}

export function assertUsableOutputDuration(target, duration, minDuration = 0.25) {
  if (duration < minDuration) {
    throw new Error(
      `${target.fileName}: output duration ${duration.toFixed(3)}s is shorter than ${minDuration.toFixed(3)}s`,
    );
  }
}

export function planSegments({ silences, duration, expectedCount, minSegmentDuration = 0.25 }) {
  const segments = [];
  let speechStart = 0;

  for (const silence of silences) {
    if (silence.start <= speechStart) {
      speechStart = Math.max(speechStart, silence.end);
      continue;
    }

    if (silence.start - speechStart >= minSegmentDuration) {
      segments.push({ start: roundTime(speechStart), end: roundTime(silence.start) });
    }

    speechStart = Math.max(speechStart, silence.end);
  }

  if (duration - speechStart >= minSegmentDuration) {
    segments.push({ start: roundTime(speechStart), end: roundTime(duration) });
  }

  while (segments.length > expectedCount) {
    let closestGapIndex = -1;
    let closestGap = Infinity;

    for (let index = 0; index < segments.length - 1; index += 1) {
      const gap = segments[index + 1].start - segments[index].end;
      if (gap < closestGap) {
        closestGap = gap;
        closestGapIndex = index;
      }
    }

    if (closestGapIndex === -1 || closestGap > 0.45) break;

    segments.splice(closestGapIndex, 2, {
      start: segments[closestGapIndex].start,
      end: segments[closestGapIndex + 1].end,
    });
  }

  if (segments.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} audio segments, detected ${segments.length}`);
  }

  return segments;
}

async function generateAudio({ endpoint, token, prompt, label }) {
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${label}: HTTP ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const part = data.candidates?.[0]?.content?.parts?.find((candidatePart) => candidatePart.inlineData?.data);
  if (!part) {
    throw new Error(`${label}: no inline audio data in Gemini response`);
  }

  return wavFromPcm(Buffer.from(part.inlineData.data, "base64"));
}

function probeDuration(wavPath) {
  const output = spawnChecked(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      wavPath,
    ],
    `${wavPath}: ffprobe`,
  ).trim();
  const duration = Number(output);
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`${wavPath}: could not read audio duration`);
  }
  return duration;
}

function detectSilences(wavPath) {
  const output = spawnChecked(
    "ffmpeg",
    [
      "-hide_banner",
      "-nostats",
      "-i",
      wavPath,
      "-af",
      "silencedetect=noise=-38dB:d=0.28",
      "-f",
      "null",
      "-",
    ],
    `${wavPath}: ffmpeg silencedetect`,
  );
  return parseSilenceDetect(output);
}

async function splitGroupAudio({ sourceWavPath, outputDir, targets, segments, force }) {
  for (const [index, target] of targets.entries()) {
    const mp3Path = path.join(outputDir, target.fileName);
    if (!force && (await hasUsableFile(mp3Path))) {
      const existingDuration = probeDuration(mp3Path);
      if (existingDuration >= 0.25) {
        console.log(`skip existing ${mp3Path}`);
        continue;
      }
      console.log(`replace too-short ${mp3Path}`);
    }

    const segment = segments[index];
    const segmentDuration = Math.max(0.05, segment.end - segment.start);
    const ffmpeg = spawnSync(
      "ffmpeg",
      [
        "-y",
        "-v",
        "error",
        "-ss",
        segment.start.toFixed(3),
        "-t",
        segmentDuration.toFixed(3),
        "-i",
        sourceWavPath,
        "-af",
        groupedTrimFilter(),
        "-codec:a",
        "libmp3lame",
        "-b:a",
        "128k",
        mp3Path,
      ],
      { encoding: "utf8" },
    );

    if (ffmpeg.error) {
      throw new Error(`${target.fileName}: ffmpeg failed: ${ffmpeg.error.message}`);
    }
    if (ffmpeg.status !== 0) {
      throw new Error(`${target.fileName}: ffmpeg failed\n${ffmpeg.stderr}`);
    }

    console.log(`${target.syllable} -> ${mp3Path}`);
    assertUsableOutputDuration(target, probeDuration(mp3Path));
  }
}

export async function main(argv = process.argv.slice(2)) {
  const root = process.cwd();
  const inputDir = path.join(root, "public", "audio");
  const outputDir = path.join(root, defaultOutputDir);
  const sourceWavDir = path.join(outputDir, "_source_wav");
  const force = process.env.GEMINI_TTS_FORCE === "1";
  const repairSyllables = repairSyllablesFromArgs(argv);
  const groups = repairSyllables ? [] : resolveGroups(argv);

  await mkdir(outputDir, { recursive: true });
  await mkdir(sourceWavDir, { recursive: true });

  const allFiles = await readdir(inputDir);
  const gcloud = process.platform === "win32" ? "gcloud.cmd" : "gcloud";
  const project = run(gcloud, ["config", "get-value", "project"]);
  const token = run(gcloud, ["auth", "print-access-token"]);
  const endpoint = `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/${model}:generateContent`;

  if (repairSyllables) {
    const targets = targetsForSyllables(repairSyllables, allFiles);
    const sourceLabel = `repair-${repairSyllables.join("-")}`;
    const sourceWavPath = path.join(sourceWavDir, `${sourceLabel}.wav`);

    if (force || !(await hasUsableFile(sourceWavPath))) {
      const prompt = buildRepairPrompt(targets.map((target) => target.syllable));
      console.log(`${sourceLabel}: generating repair source WAV`);
      const wav = await generateAudio({ endpoint, token, prompt, label: sourceLabel });
      await writeFile(sourceWavPath, wav);
    } else {
      console.log(`${sourceLabel}: reusing ${sourceWavPath}`);
    }

    const silences = detectSilences(sourceWavPath);
    const duration = probeDuration(sourceWavPath);
    const segments = planSegments({ silences, duration, expectedCount: targets.length });
    await splitGroupAudio({ sourceWavPath, outputDir, targets, segments, force: true });
    console.log(`Repair Gemini TTS candidates written to ${outputDir}`);
    return;
  }

  for (const groupKey of groups) {
    const group = groupForKey(groupKey);
    const targets = targetsForGroup(group.key, allFiles);
    const sourceWavPath = path.join(sourceWavDir, `${group.key}.wav`);

    if (force || !(await hasUsableFile(sourceWavPath))) {
      const prompt = buildPrompt(targets.map((target) => target.syllable));
      console.log(`${group.key}: generating grouped source WAV`);
      const wav = await generateAudio({ endpoint, token, prompt, label: group.key });
      await writeFile(sourceWavPath, wav);
    } else {
      console.log(`${group.key}: reusing ${sourceWavPath}`);
    }

    const silences = detectSilences(sourceWavPath);
    const duration = probeDuration(sourceWavPath);
    const segments = planSegments({ silences, duration, expectedCount: targets.length });
    await splitGroupAudio({ sourceWavPath, outputDir, targets, segments, force });
  }

  console.log(`Grouped Gemini TTS candidates written to ${outputDir}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
