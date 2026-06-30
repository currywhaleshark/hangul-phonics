import path from "node:path";
import { existsSync } from "node:fs";

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

export function syllableCombineUploadProjects(projects = TIMING_PROJECTS) {
  return projects.filter(isSyllableCombineUploadProject);
}

export function makeUploadEntry(project, options = {}) {
  if (!isSyllableCombineUploadProject(project)) {
    throw new Error(`Not a syllable combine upload project: ${project?.id ?? "unknown"}`);
  }

  const videoDir = options.videoDir ?? DEFAULT_VIDEO_DIR;
  const slug = project.render.outputSlug;
  const title = buildYoutubeTitle(project);
  return {
    projectId: project.id,
    file: path.posix.join(normalizeSlashes(videoDir), `${slug}-timed-lesson.mp4`),
    title,
    description: options.description ?? DEFAULT_DESCRIPTION,
    tags: [...DEFAULT_TAGS, project.targetSyllable],
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
    .filter(isSyllableCombineUploadProject)
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

export function findPlaylistByTitle(playlists, title) {
  const normalizedTitle = normalizeTitle(title);
  return playlists.find((playlist) => normalizeTitle(playlist?.snippet?.title) === normalizedTitle) ?? null;
}

export function buildPlaylistInsertBody(videoId, playlistId) {
  return {
    snippet: {
      playlistId,
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
