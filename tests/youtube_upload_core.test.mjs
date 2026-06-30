import assert from "node:assert/strict";

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_PLAYLIST_TITLE,
  buildPlaylistInsertBody,
  buildUploadManifest,
  buildVideoInsertBody,
  findPlaylistByTitle,
  makeUploadEntry,
} from "../tools/youtube-upload-core.mjs";
import { createDefaultTimingProject } from "../tools/timing-editor-core.js";

const ga = createDefaultTimingProject("ga-a");
const go = createDefaultTimingProject("go-o");
const rara = createDefaultTimingProject("ra-a");

{
  const entry = makeUploadEntry(ga, { videoDir: "public/video-assets/consonant-lesson-samples" });
  assert.equal(entry.projectId, "ga-a");
  assert.equal(entry.file, "public/video-assets/consonant-lesson-samples/ga-a-timed-lesson.mp4");
  assert.equal(entry.title, "고고 고양이와 아아 나뭇가지 | ㄱ+ㅏ=가");
  assert.equal(entry.description, DEFAULT_DESCRIPTION);
  assert.equal(entry.playlistTitle, DEFAULT_PLAYLIST_TITLE);
  assert.equal(entry.privacyStatus, "private");
  assert.equal(entry.selfDeclaredMadeForKids, true);
  assert.equal(entry.containsSyntheticMedia, true);
}

{
  const entry = makeUploadEntry(go, { videoDir: "public/video-assets/consonant-lesson-samples" });
  assert.equal(entry.title, "고고 고양이와 오오 상자 | ㄱ+ㅗ=고");
}

{
  const entry = makeUploadEntry(rara, { videoDir: "public/video-assets/consonant-lesson-samples" });
  assert.equal(entry.title, "라라 리본과 아아 나뭇가지 | ㄹ+ㅏ=라");
}

{
  const manifest = buildUploadManifest({
    projects: [ga, go, createDefaultTimingProject("gogo-g")],
    videoDir: "public/video-assets/consonant-lesson-samples",
    fileExists: (file) => file.includes("ga-a") || file.includes("go-o"),
  });
  assert.deepEqual(manifest.entries.map((entry) => entry.projectId), ["ga-a", "go-o"]);
}

{
  const body = buildVideoInsertBody(makeUploadEntry(ga));
  assert.deepEqual(body, {
    snippet: {
      title: "고고 고양이와 아아 나뭇가지 | ㄱ+ㅏ=가",
      description: DEFAULT_DESCRIPTION,
      tags: ["한글", "한글친구들", "소리나라", "자음", "모음", "가"],
      categoryId: "27",
    },
    status: {
      privacyStatus: "private",
      selfDeclaredMadeForKids: true,
      containsSyntheticMedia: true,
    },
  });
}

{
  const playlist = findPlaylistByTitle([
    { id: "other", snippet: { title: "다른 목록" } },
    { id: "playlist-1", snippet: { title: "소리나라 한글친구들" } },
  ], "소리나라 한글친구들");
  assert.equal(playlist.id, "playlist-1");
  assert.deepEqual(buildPlaylistInsertBody("video-1", playlist.id), {
    snippet: {
      playlistId: "playlist-1",
      resourceId: {
        kind: "youtube#video",
        videoId: "video-1",
      },
    },
  });
}

assert.equal(findPlaylistByTitle([], "소리나라 한글친구들"), null);

import {
  filterUploadEntries,
  parseUploadArgs,
} from "../tools/youtube-upload-core.mjs";

{
  const args = parseUploadArgs([
    "--upload",
    "--open-browser",
    "--limit", "3",
    "--only", "ga-a,go-o",
    "--privacy", "private",
  ]);
  assert.equal(args.upload, true);
  assert.equal(args.openBrowser, true);
  assert.equal(args.dryRun, false);
  assert.equal(args.limit, 3);
  assert.deepEqual(args.only, ["ga-a", "go-o"]);
  assert.equal(args.privacyStatus, "private");
}

{
  const args = parseUploadArgs([]);
  assert.equal(args.upload, false);
  assert.equal(args.dryRun, true);
  assert.equal(args.clientFile, "secrets/youtube-oauth-client.json");
  assert.equal(args.tokenFile, "secrets/youtube-oauth-token.json");
  assert.equal(args.stateFile, "secrets/youtube-upload-state.json");
}

{
  const entries = [
    { projectId: "ga-a" },
    { projectId: "go-o" },
    { projectId: "na-a" },
  ];
  const state = { uploads: { "ga-a": { videoId: "already" } } };
  assert.deepEqual(
    filterUploadEntries(entries, { state }).map((entry) => entry.projectId),
    ["go-o", "na-a"],
  );
  assert.deepEqual(
    filterUploadEntries(entries, { state, force: true, only: ["ga-a", "na-a"], limit: 1 }).map((entry) => entry.projectId),
    ["ga-a"],
  );
}

import {
  buildBrowserOpenCommand,
} from "../tools/youtube-upload-core.mjs";

{
  const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?client_id=x&redirect_uri=http%3A%2F%2F127.0.0.1%3A53682%2Foauth2callback&response_type=code&scope=youtube.upload";
  const command = buildBrowserOpenCommand(authUrl, "win32");
  assert.notEqual(command.file, "cmd", "Windows OAuth URL opening must not go through cmd start because & splits query parameters");
  assert.deepEqual(command.args, ["url.dll,FileProtocolHandler", authUrl]);
}

{
  const args = parseUploadArgs(["--reauth"]);
  assert.equal(args.reauth, true);
  assert.equal(args.dryRun, true);
}
