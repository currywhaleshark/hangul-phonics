import path from "node:path";
import { existsSync } from "node:fs";

import { UNITS } from "./book_print_core.mjs";
import { SYLLABLE_GROUP_DEFINITIONS } from "./syllable-group-projects.mjs";
import { TIMING_PROJECTS } from "./timing-editor-core.js";

export const DEFAULT_VIDEO_DIR = "public/video-assets/consonant-lesson-samples";
export const DEFAULT_DESCRIPTION = "코덱스 영상제작, 음성은 제미나이 tts";
export const DEFAULT_PLAYLIST_TITLE = "소리나라 한글친구들";
export const DEFAULT_CATEGORY_ID = "27";
export const DEFAULT_PRIVACY_STATUS = "private";
export const DEFAULT_CLIENT_FILE = "secrets/youtube-oauth-client.json";
export const DEFAULT_TOKEN_FILE = "secrets/youtube-oauth-token.json";
export const DEFAULT_STATE_FILE = "secrets/youtube-upload-state.json";
export const DEFAULT_TAGS = ["한글", "한글친구들", "소리나라", "자음", "모음"];
export const DEFAULT_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.force-ssl",
];

export function isSyllableCombineUploadProject(project) {
  return project?.template === "syllable-combine-story"
    && Boolean(project.character?.letter)
    && Boolean(project.vowel?.letter)
    && Boolean(project.targetSyllable)
    && Boolean(project.render?.outputSlug);
}

// 아아 아기 + vowel tool intro videos. 아/오/우 were uploaded by hand before this tool existed.
const MANUALLY_UPLOADED_PROJECT_IDS = new Set(["aa-a", "oo-o", "uu-u"]);
const VOWEL_JAMO = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];

export function isVowelIntroUploadProject(project) {
  return project?.template === "vowel-combine-story"
    && !MANUALLY_UPLOADED_PROJECT_IDS.has(project.id)
    && Boolean(project.character?.letter)
    && Boolean(project.combineCues?.some((cue) => cue.assetKind === "tool"))
    && Boolean(project.render?.outputSlug);
}

export function isSyllableGroupUploadProject(project) {
  return project?.template === "syllable-group-story"
    && Boolean(project.title)
    && Array.isArray(project.syllables)
    && Boolean(project.render?.outputSlug);
}

export function isUploadProject(project) {
  return isSyllableCombineUploadProject(project) || isVowelIntroUploadProject(project) || isSyllableGroupUploadProject(project);
}

// Grouped lesson 15-17 videos only need their id, title and syllables to be uploaded.
const SYLLABLE_GROUP_UPLOAD_PROJECTS = SYLLABLE_GROUP_DEFINITIONS.map((definition) => ({
  id: definition.id,
  template: "syllable-group-story",
  title: definition.title,
  syllables: definition.blocks.map((block) => block.syllable),
  render: { outputSlug: definition.id },
}));

export function syllableCombineUploadProjects(projects = [...TIMING_PROJECTS, ...SYLLABLE_GROUP_UPLOAD_PROJECTS]) {
  return projects.filter(isUploadProject);
}

export function makeUploadEntry(project, options = {}) {
  if (!isUploadProject(project)) {
    throw new Error(`Not an uploadable lesson project: ${project?.id ?? "unknown"}`);
  }

  const videoDir = options.videoDir ?? DEFAULT_VIDEO_DIR;
  const slug = project.render.outputSlug;
  const title = buildYoutubeTitle(project);
  return {
    projectId: project.id,
    file: path.posix.join(normalizeSlashes(videoDir), `${slug}-timed-lesson.mp4`),
    title,
    description: options.description ?? DEFAULT_DESCRIPTION,
    tags: [...DEFAULT_TAGS, ...(project.syllables ?? [project.targetSyllable ?? project.character.letter])],
    categoryId: options.categoryId ?? DEFAULT_CATEGORY_ID,
    privacyStatus: options.privacyStatus ?? DEFAULT_PRIVACY_STATUS,
    selfDeclaredMadeForKids: options.selfDeclaredMadeForKids ?? true,
    containsSyntheticMedia: options.containsSyntheticMedia ?? true,
    playlistTitle: options.playlistTitle ?? DEFAULT_PLAYLIST_TITLE,
  };
}

export function buildUploadManifest(options = {}) {
  const projects = options.projects ?? syllableCombineUploadProjects();
  const fileExists = options.fileExists ?? existsSync;
  const entries = projects
    .filter(isUploadProject)
    .map((project) => makeUploadEntry(project, options))
    .filter((entry) => fileExists(entry.file));

  return {
    generatedAt: new Date().toISOString(),
    description: options.description ?? DEFAULT_DESCRIPTION,
    playlistTitle: options.playlistTitle ?? DEFAULT_PLAYLIST_TITLE,
    entries,
  };
}

export function buildYoutubeTitle(project) {
  if (isSyllableGroupUploadProject(project)) {
    return project.title;
  }
  if (isVowelIntroUploadProject(project)) {
    const syllable = project.character.letter;
    const vowel = VOWEL_JAMO[Math.floor(((syllable.codePointAt(0) - 0xac00) % 588) / 28)];
    const tool = project.combineCues.find((cue) => cue.assetKind === "tool").label;
    return `아아 아기와 ${tool} | ㅇ+${vowel}=${syllable}`;
  }
  const particle = hasFinalConsonant(project.character.name) ? "과" : "와";
  return `${project.character.name}${particle} ${project.vowel.toolLabel} | ${project.character.letter}+${project.vowel.letter}=${project.targetSyllable}`;
}

export function buildVideoInsertBody(entry) {
  return {
    snippet: {
      title: entry.title,
      description: entry.description,
      tags: entry.tags,
      categoryId: entry.categoryId,
    },
    status: {
      privacyStatus: entry.privacyStatus,
      selfDeclaredMadeForKids: entry.selfDeclaredMadeForKids,
      containsSyntheticMedia: entry.containsSyntheticMedia,
    },
  };
}

// Keeps the writable status fields and flips only the privacy, for videos.update(part=status).
export function buildPublishStatusBody(video, privacyStatus = "public") {
  const status = video.status ?? {};
  const writable = ["embeddable", "license", "publicStatsViewable", "selfDeclaredMadeForKids", "containsSyntheticMedia"];
  return {
    id: video.id,
    status: {
      ...Object.fromEntries(writable.filter((key) => key in status).map((key) => [key, status[key]])),
      privacyStatus,
    },
  };
}

export function findPlaylistByTitle(playlists, title) {
  const normalizedTitle = normalizeTitle(title);
  return playlists.find((playlist) => normalizeTitle(playlist?.snippet?.title) === normalizedTitle) ?? null;
}

export function buildPlaylistInsertBody(videoId, playlistId, position = null) {
  return {
    snippet: {
      playlistId,
      ...(position == null ? {} : { position }),
      resourceId: {
        kind: "youtube#video",
        videoId,
      },
    },
  };
}

export function parseUploadArgs(argv) {
  const args = {
    upload: false,
    publishUnlisted: false,
    dryRun: true,
    openBrowser: false,
    force: false,
    reauth: false,
    only: [],
    limit: null,
    privacyStatus: DEFAULT_PRIVACY_STATUS,
    playlistTitle: DEFAULT_PLAYLIST_TITLE,
    clientFile: DEFAULT_CLIENT_FILE,
    tokenFile: DEFAULT_TOKEN_FILE,
    stateFile: DEFAULT_STATE_FILE,
    videoDir: DEFAULT_VIDEO_DIR,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--upload") {
      args.upload = true;
      args.dryRun = false;
    } else if (arg === "--dry-run") {
      args.upload = false;
      args.dryRun = true;
    } else if (arg === "--open-browser") {
      args.openBrowser = true;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "--reauth") {
      args.reauth = true;
    } else if (arg === "--limit") {
      args.limit = parsePositiveInteger(readArgValue(argv, index, arg), arg);
      index += 1;
    } else if (arg === "--only") {
      args.only = readArgValue(argv, index, arg).split(",").map((item) => item.trim()).filter(Boolean);
      index += 1;
    } else if (arg === "--intro") {
      args.intro = true;
    } else if (arg === "--publish-unlisted") {
      args.publishUnlisted = true;
    } else if (arg === "--privacy") {
      args.privacyStatus = readArgValue(argv, index, arg);
      index += 1;
    } else if (arg === "--playlist-title") {
      args.playlistTitle = readArgValue(argv, index, arg);
      index += 1;
    } else if (arg === "--client") {
      args.clientFile = readArgValue(argv, index, arg);
      index += 1;
    } else if (arg === "--token") {
      args.tokenFile = readArgValue(argv, index, arg);
      index += 1;
    } else if (arg === "--state") {
      args.stateFile = readArgValue(argv, index, arg);
      index += 1;
    } else if (arg === "--video-dir") {
      args.videoDir = readArgValue(argv, index, arg);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

export function filterUploadEntries(entries, options = {}) {
  const uploaded = options.state?.uploads ?? {};
  const only = new Set(options.only ?? []);
  let filtered = entries.filter((entry) => {
    if (only.size > 0 && !only.has(entry.projectId)) {
      return false;
    }
    return options.force || !uploaded[entry.projectId]?.videoId;
  });

  if (options.limit !== null && options.limit !== undefined) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

export function buildBrowserOpenCommand(url, platform = process.platform) {
  if (platform === "win32") {
    return { file: "rundll32.exe", args: ["url.dll,FileProtocolHandler", url] };
  }
  if (platform === "darwin") {
    return { file: "open", args: [url] };
  }
  return { file: "xdg-open", args: [url] };
}
function readArgValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function parsePositiveInteger(value, flag) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${flag} requires a positive integer`);
  }
  return parsed;
}

function normalizeSlashes(value) {
  return String(value).replace(/\\/g, "/").replace(/\/+$/, "");
}

function normalizeTitle(value) {
  return String(value ?? "").trim();
}

function hasFinalConsonant(value) {
  const chars = Array.from(String(value));
  for (let index = chars.length - 1; index >= 0; index -= 1) {
    const code = chars[index].codePointAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      return ((code - 0xac00) % 28) !== 0;
    }
  }
  return false;
}

export const WORKSHEET_RELEASE_URL = "https://github.com/currywhaleshark/hangul-phonics/releases/download/worksheets-vol1";
export const PLAYLIST_URL = "https://www.youtube.com/playlist?list=PL0u1NTgEz-xFjU8_KXoKUDf1AwcnOBfC0";

// Parent-facing intro: not made for kids so the worksheet links stay usable; goes first in the playlist.
export function buildIntroUploadEntry({ privacyStatus = "public" } = {}) {
  const links = UNITS.map((unit) => `${unit.number}단원 ${unit.title}: ${WORKSHEET_RELEASE_URL}/${unit.handoutFile}`);
  return {
    projectId: "intro",
    file: "public/video-assets/intro/sorinara-intro.mp4",
    thumbnail: "public/video-assets/intro/sorinara-intro-thumbnail.png",
    title: "아이 한글 가르치려고 만든 학습지, 무료로 나눠요 | 소리나라 한글친구들",
    description: [
      "아이에게 한글 소리를 알려 주려고 자음마다 친구를 만들고, 영상과 학습지를 조금씩 만들어 왔어요. 비슷한 또래 아이를 키우는 분들께 도움이 될까 해서 나눠요.",
      "",
      "학습지 무료로 받기 (A4 PDF)",
      ...links,
      "",
      "학습지의 QR을 휴대폰으로 찍으면 그 글자 영상이 나와요.",
      `전체 영상: ${PLAYLIST_URL}`,
      "",
      "개인이 만든 자료라 부족한 점이 있을 수 있어요. 편하게 써 주세요.",
    ].join("\n"),
    tags: [...DEFAULT_TAGS, "한글 학습지", "무료 학습지", "유아 한글", "한글 파닉스"],
    categoryId: DEFAULT_CATEGORY_ID,
    privacyStatus,
    selfDeclaredMadeForKids: false,
    containsSyntheticMedia: true,
    playlistPosition: 0,
  };
}
