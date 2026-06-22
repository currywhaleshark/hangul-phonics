export const TIMING_SCHEMA_VERSION = 1;

export const GOGO_TIMING_STORAGE_KEY = "hangul-phonics:gogo-g-card-timings";

export const DEFAULT_GOGO_TIMING_FILE = "gogo-g-card-timings.json";

export const MIN_CUE_LENGTH = 0.03;

export const DEFAULT_GOGO_TIMING_PROJECT = {
  schemaVersion: TIMING_SCHEMA_VERSION,
  title: "고고 고양이 ㄱ 단어카드",
  audio: {
    src: "lessons/consonants/lesson-01-gogo-nana/ㄱ, ㄴ 소개.wav",
    duration: 83.040272,
  },
  segment: {
    label: "고고 고양이",
    start: 0,
    end: 35.37,
  },
  cues: [
    {
      id: "dog",
      label: "강아지",
      image: "worksheets/assets/dog.png",
      start: 14.2,
      end: 15.45,
      position: { left: 20, top: 39 },
    },
    {
      id: "bear",
      label: "곰",
      image: "worksheets/assets/bear.png",
      start: 15.75,
      end: 16.85,
      position: { left: 78, top: 40 },
    },
    {
      id: "meat",
      label: "고기",
      image: "worksheets/assets/meat.png",
      start: 19.8,
      end: 20.65,
      position: { left: 22, top: 74 },
    },
    {
      id: "snack",
      label: "과자",
      image: "worksheets/assets/snack.png",
      start: 20.6,
      end: 21.45,
      position: { left: 78, top: 73 },
    },
    {
      id: "noodles",
      label: "국수",
      image: "worksheets/assets/noodles.png",
      start: 21.35,
      end: 22.3,
      position: { left: 55, top: 78 },
    },
  ],
  letterCues: [
    {
      id: "g-intro-1",
      label: "ㄱ",
      start: 8.35,
      end: 8.83,
      position: { left: 48, top: 28 },
    },
    {
      id: "g-intro-2",
      label: "ㄱ",
      start: 9.05,
      end: 9.53,
      position: { left: 56, top: 26 },
    },
    {
      id: "g-intro-3",
      label: "ㄱ",
      start: 9.75,
      end: 10.23,
      position: { left: 44, top: 27 },
    },
    {
      id: "g-repeat-1",
      label: "ㄱ",
      start: 28.45,
      end: 28.93,
      position: { left: 48, top: 28 },
    },
    {
      id: "g-repeat-2",
      label: "ㄱ",
      start: 29.15,
      end: 29.63,
      position: { left: 56, top: 26 },
    },
    {
      id: "g-repeat-3",
      label: "ㄱ",
      start: 29.85,
      end: 30.33,
      position: { left: 44, top: 27 },
    },
    {
      id: "g-repeat-4",
      label: "ㄱ",
      start: 30.75,
      end: 31.23,
      position: { left: 48, top: 28 },
    },
    {
      id: "g-repeat-5",
      label: "ㄱ",
      start: 31.45,
      end: 31.93,
      position: { left: 56, top: 26 },
    },
    {
      id: "g-repeat-6",
      label: "ㄱ",
      start: 32.15,
      end: 32.63,
      position: { left: 44, top: 27 },
    },
  ],
};

export function cloneTimingProject(project) {
  return JSON.parse(JSON.stringify(project));
}

export function createDefaultGogoTimingProject() {
  return cloneTimingProject(DEFAULT_GOGO_TIMING_PROJECT);
}

export function mergeTimingProjectDefaults(project) {
  const defaults = createDefaultGogoTimingProject();
  return {
    ...defaults,
    ...cloneTimingProject(project),
    audio: {
      ...defaults.audio,
      ...(project.audio ?? {}),
    },
    segment: {
      ...defaults.segment,
      ...(project.segment ?? {}),
    },
    cues: Array.isArray(project.cues) ? mergeCueDefaults(project.cues, defaults.cues) : defaults.cues,
    letterCues: Array.isArray(project.letterCues) ? mergeCueDefaults(project.letterCues, defaults.letterCues) : defaults.letterCues,
  };
}

function mergeCueDefaults(cues, defaultCues) {
  const mergedCues = cues.map((cue, index) => {
    const defaultCue = defaultCues.find((item) => item.id === cue.id) ?? defaultCues[index] ?? {};
    const merged = {
      ...cloneTimingProject(defaultCue),
      ...cloneTimingProject(cue),
    };

    if (defaultCue.position || cue.position) {
      merged.position = {
        ...(defaultCue.position ?? {}),
        ...(cue.position ?? {}),
      };
    }

    if (!Number.isFinite(cue.end) && Number.isFinite(cue.duration) && Number.isFinite(merged.start)) {
      merged.end = merged.start + cue.duration;
    }

    normalizeCueTiming(merged, defaultCue);
    delete merged.duration;
    return merged;
  });

  const existingIds = new Set(mergedCues.map((cue) => cue.id));
  defaultCues.forEach((defaultCue) => {
    if (!existingIds.has(defaultCue.id)) {
      mergedCues.push(cloneTimingProject(defaultCue));
    }
  });

  return mergedCues;
}

function normalizeCueTiming(cue, defaultCue = {}) {
  if (cue.start === undefined && Number.isFinite(defaultCue.start)) {
    cue.start = defaultCue.start;
  }

  if (cue.end === undefined) {
    if (Number.isFinite(cue.duration) && Number.isFinite(cue.start)) {
      cue.end = cue.start + cue.duration;
    } else if (Number.isFinite(defaultCue.end)) {
      cue.end = defaultCue.end;
    } else if (Number.isFinite(cue.start)) {
      cue.end = cue.start + 1;
    }
  }

  if (Number.isFinite(cue.start)) {
    cue.start = roundTime(cue.start);
  }

  if (Number.isFinite(cue.end) && Number.isFinite(cue.start)) {
    cue.end = roundTime(Math.max(cue.end, cue.start + MIN_CUE_LENGTH));
  }
}

export function roundTime(value) {
  if (!Number.isFinite(value)) {
    throw new TypeError("time must be a finite number");
  }

  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

export function clampTime(value, min = 0, max = Number.POSITIVE_INFINITY) {
  if (!Number.isFinite(value)) {
    throw new TypeError("time must be a finite number");
  }

  const bounded = Math.min(Math.max(value, min), max);
  return roundTime(bounded);
}

export function clampPositionPercent(value) {
  return clampTime(value, 5, 95);
}

export function formatClockTime(value) {
  const totalMilliseconds = Math.max(0, Math.round(value * 1000));
  const minutes = Math.floor(totalMilliseconds / 60000);
  const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
  const milliseconds = totalMilliseconds % 1000;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

export function sortCues(cues) {
  return cues
    .map((cue, index) => ({ cue, index }))
    .sort((left, right) => {
      if (left.cue.start !== right.cue.start) {
        return left.cue.start - right.cue.start;
      }

      return left.index - right.index;
    })
    .map(({ cue }) => ({ ...cue }));
}

export function setCueStart(project, cueId, start, collectionName = "cues") {
  const min = Number.isFinite(project.segment?.start) ? project.segment.start : 0;
  const max = Number.isFinite(project.segment?.end) ? project.segment.end : Number.POSITIVE_INFINITY;
  const sourceCues = project[collectionName];
  if (!Array.isArray(sourceCues)) {
    throw new Error(`Unknown cue collection: ${collectionName}`);
  }

  let found = false;
  const cues = sourceCues.map((cue) => {
    if (cue.id !== cueId) {
      return { ...cue };
    }

    found = true;
    const span = Math.max((cue.end ?? cue.start + MIN_CUE_LENGTH) - cue.start, MIN_CUE_LENGTH);
    const startMax = Number.isFinite(max) ? max - MIN_CUE_LENGTH : max;
    const nextStart = clampTime(start, min, startMax);
    const nextEnd = cue.end > nextStart ? cue.end : nextStart + span;
    return { ...cue, start: nextStart, end: clampTime(nextEnd, nextStart + MIN_CUE_LENGTH, max) };
  });

  if (!found) {
    throw new Error(`Unknown cue id: ${cueId}`);
  }

  return { ...project, [collectionName]: cues };
}

export function setCueEnd(project, cueId, end, collectionName = "cues") {
  const max = Number.isFinite(project.segment?.end) ? project.segment.end : Number.POSITIVE_INFINITY;
  const sourceCues = project[collectionName];
  if (!Array.isArray(sourceCues)) {
    throw new Error(`Unknown cue collection: ${collectionName}`);
  }

  let found = false;
  const cues = sourceCues.map((cue) => {
    if (cue.id !== cueId) {
      return { ...cue };
    }

    found = true;
    const minEnd = cue.start + MIN_CUE_LENGTH;
    return { ...cue, end: clampTime(end, minEnd, max) };
  });

  if (!found) {
    throw new Error(`Unknown cue id: ${cueId}`);
  }

  return { ...project, [collectionName]: cues };
}

export function setCuePosition(project, cueId, position, collectionName = "cues") {
  const sourceCues = project[collectionName];
  if (!Array.isArray(sourceCues)) {
    throw new Error(`Unknown cue collection: ${collectionName}`);
  }

  let found = false;
  const cues = sourceCues.map((cue) => {
    if (cue.id !== cueId) {
      return { ...cue };
    }

    found = true;
    return {
      ...cue,
      position: {
        left: clampPositionPercent(position.left),
        top: clampPositionPercent(position.top),
      },
    };
  });

  if (!found) {
    throw new Error(`Unknown cue id: ${cueId}`);
  }

  return { ...project, [collectionName]: cues };
}

export function nudgeCueStart(project, cueId, delta, collectionName = "cues") {
  const sourceCues = project[collectionName];
  if (!Array.isArray(sourceCues)) {
    throw new Error(`Unknown cue collection: ${collectionName}`);
  }

  const cue = sourceCues.find((item) => item.id === cueId);
  if (!cue) {
    throw new Error(`Unknown cue id: ${cueId}`);
  }

  return setCueStart(project, cueId, cue.start + delta, collectionName);
}

export function getCueAtTime(project, time) {
  return sortCues(project.cues).find((cue) => isCueActiveAtTime(cue, time));
}

export function isCueActiveAtTime(cue, time) {
  return time >= cue.start && time <= cue.end;
}

export function serializeTimingProject(project) {
  return `${JSON.stringify(project, null, 2)}\n`;
}

export function parseTimingProject(input) {
  const parsed = typeof input === "string" ? JSON.parse(input) : input;

  if (!parsed || typeof parsed !== "object") {
    throw new Error("timing project must be an object");
  }

  const project = mergeTimingProjectDefaults(parsed);

  if (project.schemaVersion !== TIMING_SCHEMA_VERSION) {
    throw new Error(`Unsupported timing schema version: ${project.schemaVersion}`);
  }

  if (!project.audio || typeof project.audio.src !== "string") {
    throw new Error("timing project audio src is required");
  }

  if (!project.segment || !Number.isFinite(project.segment.start) || !Number.isFinite(project.segment.end)) {
    throw new Error("timing project segment start and end are required");
  }

  if (!Array.isArray(project.cues) || project.cues.length === 0) {
    throw new Error("timing project cues are required");
  }

  validateCues(project.cues);
  validateCues(project.letterCues);

  return cloneTimingProject(project);
}

function validateCues(cues) {
  cues.forEach((cue) => {
    if (!cue || typeof cue.id !== "string") {
      throw new Error("cue id is required");
    }

    if (typeof cue.label !== "string") {
      throw new Error("cue label is required");
    }

    if (!Number.isFinite(cue.start)) {
      throw new Error("cue start must be a finite number");
    }

    if (!Number.isFinite(cue.end)) {
      throw new Error("cue end must be a finite number");
    }

    if (cue.end < cue.start + MIN_CUE_LENGTH) {
      throw new Error("cue end must be after cue start");
    }

    if (cue.position !== undefined) {
      if (!Number.isFinite(cue.position.left) || !Number.isFinite(cue.position.top)) {
        throw new Error("cue position must include finite left and top values");
      }
    }
  });
}