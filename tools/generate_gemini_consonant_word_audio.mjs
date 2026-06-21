import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  assertUsableOutputDuration,
  groupedTrimFilter,
  parseSilenceDetect,
  planSegments,
} from "./generate_gemini_grouped_audio.mjs";

const sampleRate = 24000;
const voiceName = process.env.GEMINI_TTS_VOICE || "Kore";
const defaultOutputDir = path.join("public", "audio-gemini-candidates", "consonant-words");
const defaultTtsModel = "gemini-3.1-flash-tts-preview";

export const consonantWordLessons = [
  {
    key: "lesson-01-gogo-nana",
    number: 1,
    title: "1레슨 고고와 나나 낱말",
    words: ["강아지", "곰", "고기", "과자", "국수", "노란색", "너구리", "나무", "나비", "낮잠"],
  },
  {
    key: "lesson-02-mimi-bubu",
    number: 2,
    title: "2레슨 미미와 부부 낱말",
    words: ["모자", "문", "물", "무지개", "미끄럼틀", "바나나", "버스", "별", "비", "바구니"],
  },
  {
    key: "lesson-03-dodo-rara",
    number: 3,
    title: "3레슨 도도와 라라 낱말",
    words: ["다람쥐", "달", "다리", "도넛", "도토리", "라면", "로봇", "리본", "라디오", "레몬"],
  },
  {
    key: "lesson-04-sasa-haha",
    number: 4,
    title: "4레슨 사사와 하하 낱말",
    words: ["사과", "수박", "산", "손", "사탕", "해", "하트", "호랑이", "하모니카", "햄버거"],
  },
  {
    key: "lesson-05-jiji-chichi",
    number: 5,
    title: "5레슨 지지와 치치 낱말",
    words: ["자동차", "집", "주스", "지갑", "젤리", "치즈", "책", "초콜릿", "치마", "친구"],
  },
  {
    key: "lesson-06-koko-toto-pupu",
    number: 6,
    title: "6레슨 코코와 토토와 푸푸 낱말",
    words: ["쿠키", "콩", "카드", "크레용", "코끼리", "토마토", "택시", "타조", "튤립", "토끼풀", "포도", "피자", "풀", "풍선", "파도"],
  },
];

const lessonByKey = new Map(consonantWordLessons.map((lesson) => [lesson.key, lesson]));
const lessonByNumber = new Map(consonantWordLessons.map((lesson) => [String(lesson.number), lesson]));

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
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${label}: ${result.stderr || result.stdout}`);
  return `${result.stdout || ""}\n${result.stderr || ""}`;
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

export function fileSafeWord(word) {
  return word.normalize("NFC").replace(/[<>:"/\\|?*\u0000-\u001f]/gu, "_");
}

function normalizeLessonToken(token) {
  const trimmed = token.trim();
  const number = trimmed.match(/^0?([1-6])$/u);
  if (number) return number[1];
  return trimmed;
}

export function resolveLessonKeys(args) {
  const rawArgs = args.length > 0 ? args : ["1"];
  const requested = rawArgs
    .flatMap((arg) => arg.split(","))
    .map((arg) => arg.trim())
    .filter(Boolean);

  if (requested.some((arg) => arg.toLowerCase() === "all" || arg === "1-6")) {
    return consonantWordLessons.map((lesson) => lesson.key);
  }

  const keys = [];
  for (const token of requested) {
    const normalized = normalizeLessonToken(token);
    const lesson = lessonByNumber.get(normalized) || lessonByKey.get(normalized);
    if (!lesson) throw new Error(`Unknown consonant word lesson: ${token}`);
    if (!keys.includes(lesson.key)) keys.push(lesson.key);
  }
  return keys;
}

export function targetsForLesson(lessonKey) {
  const lesson = lessonByKey.get(lessonKey) || lessonByNumber.get(normalizeLessonToken(lessonKey));
  if (!lesson) throw new Error(`Unknown consonant word lesson: ${lessonKey}`);

  return lesson.words.map((word, index) => ({
    lessonKey: lesson.key,
    lessonTitle: lesson.title,
    word,
    index: index + 1,
    label: `${lesson.key} #${index + 1} ${word}`,
    fileName: `${lesson.key}_${String(index + 1).padStart(2, "0")}_${fileSafeWord(word)}.mp3`,
  }));
}

export function targetsForLessons(args) {
  return resolveLessonKeys(args).flatMap((key) => targetsForLesson(key));
}

export function buildPrompt(words) {
  const sequence = words.map((word) => `${word}.`).join(" [pause] ");
  return [
    "밝고 다정한 유아 선생님 목소리로, 아래 한국어 낱말만 읽어 주세요.",
    "각 낱말은 아이가 따라 말할 수 있게 또렷하고 짧게 한 번만 말해 주세요.",
    "너무 노래하듯 하지 말고, 살짝 웃는 교육용 억양으로 통일해 주세요.",
    "각 [pause] 자리에서는 0.8초 정도 조용히 쉬어 주세요.",
    "파일명, 번호, 설명, 괄호 안 지시문은 읽지 마세요.",
    "",
    sequence,
  ].join("\n");
}
export function resolveTtsModel(env = process.env) {
  return env.GEMINI_TTS_MODEL || defaultTtsModel;
}

export function resolveOutputDir(root, env = process.env) {
  const configured = env.GEMINI_TTS_OUTPUT_DIR || defaultOutputDir;
  return path.isAbsolute(configured) ? path.normalize(configured) : path.join(root, configured);
}

function authConfig() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  const model = resolveTtsModel(process.env);

  if (apiKey) {
    return {
      model,
      endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
    };
  }

  const gcloud = process.platform === "win32" ? "gcloud.cmd" : "gcloud";
  const project = run(gcloud, ["config", "get-value", "project"]);
  const token = run(gcloud, ["auth", "print-access-token"]);
  return {
    model,
    endpoint: `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/${model}:generateContent`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
}

async function generateAudio({ prompt, label }) {
  const { endpoint, headers, model } = authConfig();
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
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`${label}: ${model} HTTP ${response.status} ${await response.text()}`);

  const data = await response.json();
  const part = data.candidates?.[0]?.content?.parts?.find((candidatePart) => candidatePart.inlineData?.data);
  if (!part) throw new Error(`${label}: no inline audio data in Gemini response`);

  return wavFromPcm(Buffer.from(part.inlineData.data, "base64"));
}

function probeDuration(audioPath) {
  const output = spawnChecked(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      audioPath,
    ],
    `${audioPath}: ffprobe`,
  ).trim();
  const duration = Number(output);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error(`${audioPath}: could not read audio duration`);
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

async function splitLessonAudio({ sourceWavPath, outputDir, targets, segments, force }) {
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

    if (ffmpeg.error) throw new Error(`${target.fileName}: ffmpeg failed: ${ffmpeg.error.message}`);
    if (ffmpeg.status !== 0) throw new Error(`${target.fileName}: ffmpeg failed\n${ffmpeg.stderr}`);

    console.log(`${target.word} -> ${mp3Path}`);
    assertUsableOutputDuration(target, probeDuration(mp3Path), 0.18);
  }
}

export async function main(argv = process.argv.slice(2)) {
  const root = process.cwd();
  const outputDir = resolveOutputDir(root);
  const sourceWavDir = path.join(outputDir, "_source_wav");
  const forceSource = process.env.GEMINI_TTS_FORCE === "1";
  const forceSplit = forceSource || process.env.GEMINI_TTS_FORCE_SPLIT === "1";
  const lessonKeys = resolveLessonKeys(argv);

  await mkdir(outputDir, { recursive: true });
  await mkdir(sourceWavDir, { recursive: true });

  for (const lessonKey of lessonKeys) {
    const targets = targetsForLesson(lessonKey);
    const sourceWavPath = path.join(sourceWavDir, `${lessonKey}.wav`);

    if (forceSource || !(await hasUsableFile(sourceWavPath))) {
      console.log(`${lessonKey}: generating grouped word source WAV`);
      const wav = await generateAudio({
        prompt: buildPrompt(targets.map((target) => target.word)),
        label: lessonKey,
      });
      await writeFile(sourceWavPath, wav);
    } else {
      console.log(`${lessonKey}: reusing ${sourceWavPath}`);
    }

    const silences = detectSilences(sourceWavPath);
    const duration = probeDuration(sourceWavPath);
    const segments = planSegments({
      silences,
      duration,
      expectedCount: targets.length,
      minSegmentDuration: 0.18,
    });
    await splitLessonAudio({ sourceWavPath, outputDir, targets, segments, force: forceSplit });
  }

  console.log(`Consonant word Gemini TTS candidates written to ${outputDir}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
