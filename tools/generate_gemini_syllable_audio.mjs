import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const inputDir = path.join(root, "public", "audio");
const outputDir = path.join(root, "public", "audio-gemini-candidates");
const wavDir = path.join(outputDir, "_wav");
const model = "gemini-2.5-flash-preview-tts";
const voiceName = "Kore";
const sampleRate = 24000;
const delayMs = Number(process.env.GEMINI_TTS_DELAY_MS ?? 5000);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function hasUsableFile(filePath) {
  try {
    return (await stat(filePath)).size > 0;
  } catch {
    return false;
  }
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

function parseTarget(fileName) {
  const numbered = fileName.match(/^(\d+)_([가-힣]+)\.mp3$/u);
  if (numbered) return { fileName, syllable: numbered[2] };

  const vowel = fileName.match(/^([가-힣])!\.mp3$/u);
  if (vowel) return { fileName, syllable: vowel[1] };

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

async function generateAudio({ endpoint, token, target }) {
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: target.syllable }],
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

  let response;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      if (attempt === 5) throw error;
      const waitMs = 15000;
      console.log(`${target.fileName}: network error, retrying in ${Math.round(waitMs / 1000)}s`);
      await sleep(waitMs);
      continue;
    }

    if (response.ok) break;

    const errorText = await response.text();
    if (response.status !== 429 || attempt === 5) {
      throw new Error(`${target.fileName}: HTTP ${response.status} ${errorText}`);
    }

    const waitMs = 65000;
    console.log(`${target.fileName}: quota hit, retrying in ${Math.round(waitMs / 1000)}s`);
    await sleep(waitMs);
  }

  const data = await response.json();
  const part = data.candidates?.[0]?.content?.parts?.find((candidatePart) => candidatePart.inlineData?.data);
  if (!part) {
    throw new Error(`${target.fileName}: no inline audio data in Gemini response`);
  }

  return wavFromPcm(Buffer.from(part.inlineData.data, "base64"));
}

async function main() {
  const allFiles = await readdir(inputDir);
  const targets = allFiles
    .map(parseTarget)
    .filter(Boolean)
    .sort((a, b) => a.fileName.localeCompare(b.fileName, "ko"));

  await mkdir(outputDir, { recursive: true });
  await mkdir(wavDir, { recursive: true });

  const project = run("gcloud.cmd", ["config", "get-value", "project"]);
  const token = run("gcloud.cmd", ["auth", "print-access-token"]);
  const endpoint = `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/${model}:generateContent`;

  let completed = 0;
  for (const target of targets) {
    const wavPath = path.join(wavDir, target.fileName.replace(/\.mp3$/u, ".wav"));
    const mp3Path = path.join(outputDir, target.fileName);

    if (await hasUsableFile(mp3Path)) {
      console.log(`[${completed + 1}/${targets.length}] skip existing ${path.relative(root, mp3Path)}`);
      completed += 1;
      continue;
    }

    console.log(`[${completed + 1}/${targets.length}] ${target.syllable} -> ${path.relative(root, mp3Path)}`);
    if (completed > 0 && delayMs > 0) await sleep(delayMs);

    const wav = await generateAudio({ endpoint, token, target });
    await writeFile(wavPath, wav);

    const ffmpeg = spawnSync(
      "ffmpeg",
      [
        "-y",
        "-v",
        "error",
        "-i",
        wavPath,
        "-af",
        "silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:stop_periods=1:stop_duration=0.08:stop_threshold=-45dB",
        "-codec:a",
        "libmp3lame",
        "-b:a",
        "128k",
        mp3Path,
      ],
      { encoding: "utf8" },
    );

    if (ffmpeg.status !== 0) {
      throw new Error(`${target.fileName}: ffmpeg failed\n${ffmpeg.stderr}`);
    }

    completed += 1;
  }

  await rm(wavDir, { recursive: true, force: true });
  console.log(`Generated ${completed} Gemini TTS candidate files in ${path.relative(root, outputDir)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
