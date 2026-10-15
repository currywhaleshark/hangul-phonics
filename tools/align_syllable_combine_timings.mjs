import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { SYLLABLE_COMBINE_TIMING_PROJECTS, createDefaultTimingProject, roundTime } from "./timing-editor-core.js";

const TIMING_WORK_DIR = path.join("tmp", "timing-render");
const SAMPLE_DIR = path.join("public", "video-assets", "consonant-lesson-samples");
const RENDER_SCRIPT = path.join("tools", "render_gogo_timed_lesson_video.py");
const TAIL_PARAMS = [-40, -45, -35].flatMap((noise) => [0.25, 0.2, 0.3, 0.35].map((duration) => ({ noise, duration })));
const FRONT_PARAMS = [-40, -45, -50, -35].flatMap((noise) => [0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6].map((duration) => ({ noise, duration })));
// After "X의 소리, X!" and "Y의 소리," the narration is all short phrases: vowel sound,
// initial again, vowel again, "둘이 합치면", target syllable, words, final syllable.
const TAIL_PHRASES_BEFORE_WORDS = 5;
const FRONT_PHRASE_COUNT = 3;

export function detectSpeechSegments(audioPath, { noise, duration }) {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-i", audioPath, "-af", `silencedetect=noise=${noise}dB:d=${duration}`, "-f", "null", "-"], {
    encoding: "utf8",
  });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  const total = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audioPath], { encoding: "utf8" }));
  const segments = [];
  let speechStart = 0;

  for (const line of output.split(/\r?\n/u)) {
    const start = line.match(/silence_start:\s*([0-9.]+)/u);
    if (start) {
      const silenceStart = Number(start[1]);
      if (silenceStart > speechStart) segments.push({ start: speechStart, end: silenceStart });
      continue;
    }
    const end = line.match(/silence_end:\s*([0-9.]+)/u);
    if (end) speechStart = Number(end[1]);
  }
  if (total > speechStart) segments.push({ start: speechStart, end: total });

  return { segments: segments.filter((segment) => segment.end - segment.start >= 0.15), total };
}

const length = (segment) => segment.end - segment.start;

export function mapTailPhrases(segments, wordCount) {
  const tailCount = TAIL_PHRASES_BEFORE_WORDS + wordCount + 1;
  if (segments.length < tailCount + FRONT_PHRASE_COUNT + 1) {
    return null;
  }

  const tail = segments.slice(segments.length - tailCount);
  const [vowelSound, , , blend, target] = tail;
  const final = tail.at(-1);
  const shortSounds = [vowelSound, tail[1], tail[2], target, final];
  if (!shortSounds.every((segment) => length(segment) < 0.8) || length(blend) < 0.5) {
    return null;
  }

  return { vowelSound, blend, target, words: tail.slice(TAIL_PHRASES_BEFORE_WORDS, TAIL_PHRASES_BEFORE_WORDS + wordCount), final };
}

export function mapFrontPhrases(segments, vowelSoundStart) {
  const front = segments.filter((segment) => segment.end <= vowelSoundStart - 0.05);
  if (front.length < FRONT_PHRASE_COUNT + 1) {
    return null;
  }

  const [owner, initialSound, vowelOwner] = front.slice(-FRONT_PHRASE_COUNT);
  const opening = { start: front[0].start, end: front.at(-FRONT_PHRASE_COUNT - 1).end };
  const plausible =
    length(opening) > 1.5 &&
    length(owner) > 0.75 &&
    length(owner) < 1.8 &&
    length(initialSound) < 0.6 &&
    length(vowelOwner) > 0.8;
  return plausible ? { opening, owner, initialSound, vowelOwner } : null;
}

export function applyNarrationTimings(project, phrases, total) {
  const timed = structuredClone(project);
  const end = roundTime(total);
  const combineSwitch = roundTime((phrases.opening.end + phrases.owner.start) / 2);
  const combinedLetterStart = roundTime(phrases.blend.end + 0.15);
  const wordsEnd = roundTime(phrases.final.start - 0.35);

  timed.audio.duration = end;
  timed.segment.end = end;

  for (const cue of timed.combineCues) {
    if (cue.assetKind === "combined") {
      cue.start = combineSwitch;
      cue.end = end;
    } else {
      cue.end = combineSwitch;
    }
  }

  timed.cues.forEach((cue, index) => {
    cue.start = roundTime(phrases.words[index].start - 0.15);
    cue.end = wordsEnd;
  });

  const letterStarts = {
    initial: roundTime(phrases.owner.end + 0.1),
    vowel: roundTime(phrases.vowelOwner.end + 0.1),
    combined: combinedLetterStart,
    final: roundTime(phrases.final.start - 0.1),
  };
  for (const cue of timed.letterCues) {
    const kind = cue.id.slice(timed.id.length + 1);
    cue.start = letterStarts[kind] ?? cue.start;
    if (kind === "initial" || kind === "vowel") cue.end = combinedLetterStart;
    if (kind === "combined") cue.end = roundTime(Math.min(combinedLetterStart + 1.55, phrases.words[0].start - 0.2));
    if (kind === "final") cue.end = end;
  }

  return timed;
}

// Vowel intro narration: "아아 아기가 / X를 만나 / V! 입을 … 말해요. / V! / words. / V!"
export function mapVowelIntroPhrases(segments, wordCount) {
  if (segments.length < wordCount + 4) {
    return null;
  }

  const final = segments.at(-1);
  const words = segments.slice(-1 - wordCount, -1);
  const say = segments.at(-2 - wordCount);
  const before = segments.slice(0, -2 - wordCount);
  // "V! 입을 … 같이 말해요" is the longest phrase; the first V! is either merged into it or the short
  // phrase right before it. The tool turns into the combined image just before that first V!.
  const mouthIndex = before.reduce((best, segment, index) => (length(segment) > length(before[best]) ? index : best), 0);
  const firstSoundIndex = mouthIndex > 0 && length(before[mouthIndex - 1]) < 0.8 ? mouthIndex - 1 : mouthIndex;
  const meeting = before[firstSoundIndex - 1];
  const plausible = [final, say].every((segment) => length(segment) < 0.8) && Boolean(meeting);
  if (!plausible) {
    return null;
  }

  return {
    combineSwitch: (meeting.end + before[firstSoundIndex].start) / 2,
    say,
    words,
    final,
  };
}

export function applyVowelIntroTimings(project, phrases, total) {
  const timed = structuredClone(project);
  const end = roundTime(total);
  const combineSwitch = roundTime(phrases.combineSwitch);

  timed.audio.duration = end;
  timed.segment.end = end;
  for (const cue of timed.combineCues) {
    if (cue.assetKind === "combined") {
      cue.start = combineSwitch;
      cue.end = end;
    } else {
      cue.end = combineSwitch;
    }
  }

  const wordsEnd = roundTime(phrases.final.start - 0.4);
  timed.cues.forEach((cue, index) => {
    cue.start = roundTime(phrases.words[index].start - 0.15);
    cue.end = wordsEnd;
  });

  for (const cue of timed.letterCues) {
    if (cue.id.endsWith("-say")) {
      cue.start = roundTime(phrases.say.start - 0.1);
      cue.end = roundTime(Math.min(phrases.say.end + 0.3, phrases.words[0].start - 0.2));
    }
    if (cue.id.endsWith("-final")) {
      cue.start = roundTime(phrases.final.start - 0.15);
      cue.end = end;
    }
  }

  return timed;
}

function alignVowelIntroProject(project) {
  for (const params of TAIL_PARAMS) {
    const { segments, total } = detectSpeechSegments(project.audio.src, params);
    const phrases = mapVowelIntroPhrases(segments, project.cues.length);
    if (phrases) {
      return { project: applyVowelIntroTimings(project, phrases, total), params };
    }
  }
  throw new Error(`${project.id}: could not match the vowel intro narration to pauses`);
}

export function alignProject(projectId) {
  const project = createDefaultTimingProject(projectId);
  if (project.template === "vowel-combine-story") {
    return alignVowelIntroProject(project);
  }
  let tail = null;
  let total = 0;
  for (const params of TAIL_PARAMS) {
    const detected = detectSpeechSegments(project.audio.src, params);
    tail = mapTailPhrases(detected.segments, project.cues.length);
    total = detected.total;
    if (tail) break;
  }
  if (!tail) {
    throw new Error(`${projectId}: could not match the short phrases at the end of the narration`);
  }

  for (const params of FRONT_PARAMS) {
    const front = mapFrontPhrases(detectSpeechSegments(project.audio.src, params).segments, tail.vowelSound.start);
    if (front) {
      return { project: applyNarrationTimings(project, { ...front, ...tail }, total), params };
    }
  }
  throw new Error(`${projectId}: could not match the opening phrases of the narration`);
}

function renderProject(timingPath, project) {
  const slug = project.render.outputSlug;
  const previewTime = String(Math.min(20.8, Math.max(0, project.segment.end - 0.1)));
  const result = spawnSync(
    process.env.PYTHON || "python",
    [
      RENDER_SCRIPT,
      "--timings",
      timingPath,
      "--output",
      path.join(SAMPLE_DIR, `${slug}-timed-lesson.mp4`),
      "--preview",
      path.join(SAMPLE_DIR, `${slug}-timed-lesson-preview.jpg`),
      "--preview-time",
      previewTime,
    ],
    { encoding: "utf8", stdio: ["ignore", "inherit", "inherit"] },
  );
  if (result.status !== 0) {
    throw new Error(`${slug}: render failed`);
  }
}

export async function main(argv = process.argv.slice(2)) {
  const render = argv.includes("--render");
  const ids = argv.filter((arg) => !arg.startsWith("--"));
  if (ids.length === 0) {
    throw new Error(`Pass project ids, e.g. gu-u. Known: ${SYLLABLE_COMBINE_TIMING_PROJECTS.map((project) => project.id).join(", ")}`);
  }

  await mkdir(TIMING_WORK_DIR, { recursive: true });
  for (const id of ids) {
    const { project, params } = alignProject(id);
    project.render = { ...project.render, timingFile: `${id}-card-timings.json` };
    const timingPath = path.join(TIMING_WORK_DIR, `${id}-card-timings.json`);
    await writeFile(timingPath, `${JSON.stringify(project, null, 2)}\n`, "utf8");
    console.log(`${id}: aligned (pauses ${params.noise}dB/${params.duration}s) -> ${timingPath}`);
    if (render) renderProject(timingPath, project);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
