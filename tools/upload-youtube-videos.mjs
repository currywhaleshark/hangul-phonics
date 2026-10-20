#!/usr/bin/env node
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  DEFAULT_SCOPES,
  buildBrowserOpenCommand,
  buildPlaylistInsertBody,
  buildIntroUploadEntry,
  buildPublishStatusBody,
  buildUploadManifest,
  buildVideoInsertBody,
  filterUploadEntries,
  findPlaylistByTitle,
  parseUploadArgs,
} from "./youtube-upload-core.mjs";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const VIDEO_UPLOAD_URL = "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable";
const PLAYLISTS_URL = "https://www.googleapis.com/youtube/v3/playlists";
const PLAYLIST_ITEMS_URL = "https://www.googleapis.com/youtube/v3/playlistItems";
const VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";
const THUMBNAILS_URL = "https://www.googleapis.com/upload/youtube/v3/thumbnails/set";
const TOKEN_FILE_HINT = "secrets/youtube-oauth-token.json";
const STATE_FILE_HINT = "secrets/youtube-upload-state.json";

async function main() {
  const args = parseUploadArgs(process.argv.slice(2));
  if (args.publishUnlisted) {
    await publishUnlistedUploads(args);
    return;
  }
  if (args.intro) {
    await uploadIntro(args);
    return;
  }
  const manifest = buildUploadManifest({
    videoDir: args.videoDir,
    playlistTitle: args.playlistTitle,
    privacyStatus: args.privacyStatus,
  });
  const state = await readJsonIfExists(args.stateFile, { uploads: {} });
  const entries = filterUploadEntries(manifest.entries, {
    state,
    force: args.force,
    only: args.only,
    limit: args.limit,
  });

  printManifestSummary(manifest, entries, args);
  if (args.dryRun) {
    return;
  }
  if (entries.length === 0) {
    console.log("No videos to upload.");
    return;
  }

  const oauthClient = await readOAuthClient(args.clientFile);
  const token = await getAccessToken(oauthClient, args);
  const playlists = await listPlaylists(token.access_token);
  const playlist = findPlaylistByTitle(playlists, args.playlistTitle);
  if (!playlist) {
    throw new Error(`Playlist not found: ${args.playlistTitle}`);
  }

  for (const entry of entries) {
    console.log(`Uploading ${entry.projectId}: ${entry.title}`);
    const upload = await uploadVideo(entry, token.access_token);
    if (!upload.id) {
      throw new Error(`Upload response did not include a video id for ${entry.projectId}`);
    }
    console.log(`Uploaded ${entry.projectId}: https://www.youtube.com/watch?v=${upload.id}`);

    const playlistItem = await insertPlaylistItem(upload.id, playlist.id, token.access_token);
    console.log(`Added to playlist ${args.playlistTitle}: ${playlistItem.id ?? upload.id}`);

    state.uploads ??= {};
    state.uploads[entry.projectId] = {
      videoId: upload.id,
      playlistItemId: playlistItem.id ?? null,
      title: entry.title,
      file: entry.file,
      playlistTitle: args.playlistTitle,
      uploadedAt: new Date().toISOString(),
    };
    await writeJson(args.stateFile, state);
  }
}

function printManifestSummary(manifest, entries, args) {
  console.log(`${args.dryRun ? "Dry run" : "Upload"}: ${entries.length}/${manifest.entries.length} videos selected`);
  console.log(`Playlist: ${args.playlistTitle}`);
  console.log(`Privacy: ${args.privacyStatus}`);
  for (const entry of entries) {
    console.log(`- ${entry.projectId}: ${entry.title}`);
    console.log(`  ${entry.file}`);
  }
  if (args.dryRun) {
    console.log(`Run with --dry-run to preview, or --upload --open-browser to authorize and upload. Tokens stay under ${TOKEN_FILE_HINT}; upload state stays under ${STATE_FILE_HINT}.`);
  }
}

async function readOAuthClient(clientFile) {
  const raw = await readFile(resolveWorkspacePath(clientFile), "utf8");
  const parsed = JSON.parse(raw);
  const config = parsed.installed ?? parsed.web;
  if (!config?.client_id || !config?.client_secret) {
    throw new Error(`OAuth client file must contain installed/web client_id and client_secret: ${clientFile}`);
  }
  return {
    clientId: config.client_id,
    clientSecret: config.client_secret,
  };
}

async function getAccessToken(client, args) {
  const saved = args.reauth ? null : await readJsonIfExists(args.tokenFile, null);
  if (args.reauth) {
    console.log("Forcing fresh OAuth authorization so you can choose the correct YouTube channel.");
  }
  if (saved?.access_token && saved.expires_at && saved.expires_at > Date.now() + 60_000) {
    return saved;
  }
  if (saved?.refresh_token) {
    const refreshed = await refreshAccessToken(client, saved.refresh_token);
    const merged = { ...saved, ...refreshed };
    await writeJson(args.tokenFile, merged);
    return merged;
  }

  const fresh = await runInstalledAppOAuth(client, args.openBrowser);
  await writeJson(args.tokenFile, fresh);
  return fresh;
}

async function runInstalledAppOAuth(client, openBrowser) {
  const { redirectUri, codePromise } = await startOAuthCodeServer();
  const authUrl = buildAuthUrl(client, redirectUri);
  console.log("Open this URL to authorize YouTube upload access:");
  console.log(authUrl);
  if (openBrowser) {
    openUrl(authUrl);
  }
  const code = await codePromise;
  return exchangeAuthCode(client, code, redirectUri);
}

function buildAuthUrl(client, redirectUri) {
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", client.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", DEFAULT_SCOPES.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  return url.toString();
}

async function startOAuthCodeServer(callbackPath = "/oauth2callback") {
  let resolveCode;
  let rejectCode;
  const codePromise = new Promise((resolve, reject) => {
    resolveCode = resolve;
    rejectCode = reject;
  });

  const server = createServer((request, response) => {
    try {
      const requestUrl = new URL(request.url, `http://${request.headers.host}`);
      if (requestUrl.pathname !== callbackPath) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }
      const error = requestUrl.searchParams.get("error");
      if (error) {
        response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Authorization failed. You can close this tab.");
        rejectCode(new Error(`OAuth failed: ${error}`));
        server.close();
        return;
      }
      const code = requestUrl.searchParams.get("code");
      if (!code) {
        response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Authorization code missing. You can close this tab.");
        rejectCode(new Error("OAuth authorization code missing"));
        server.close();
        return;
      }
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end("<p>인증 완료. 이 탭을 닫고 Codex로 돌아가세요.</p>");
      resolveCode(code);
      server.close();
    } catch (error) {
      rejectCode(error);
      server.close();
    }
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("OAuth callback server did not expose a TCP port"));
        return;
      }
      resolve({
        redirectUri: `http://127.0.0.1:${address.port}${callbackPath}`,
        codePromise,
      });
    });
  });
}

async function exchangeAuthCode(client, code, redirectUri) {
  const token = await postToken(new URLSearchParams({
    client_id: client.clientId,
    client_secret: client.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  }));
  return normalizeToken(token);
}

async function refreshAccessToken(client, refreshToken) {
  const token = await postToken(new URLSearchParams({
    client_id: client.clientId,
    client_secret: client.clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  }));
  return normalizeToken({ ...token, refresh_token: refreshToken });
}

async function postToken(params) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!response.ok) {
    throw new Error(`OAuth token request failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

function normalizeToken(token) {
  const expiresIn = Number(token.expires_in ?? 3600);
  return {
    ...token,
    expires_at: Date.now() + expiresIn * 1000,
  };
}

async function listPlaylists(accessToken) {
  const playlists = [];
  let pageToken = null;
  do {
    const url = new URL(PLAYLISTS_URL);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("mine", "true");
    url.searchParams.set("maxResults", "50");
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }
    const page = await fetchJson(url, { accessToken });
    playlists.push(...(page.items ?? []));
    pageToken = page.nextPageToken ?? null;
  } while (pageToken);
  return playlists;
}

async function uploadVideo(entry, accessToken) {
  const absoluteFile = resolveWorkspacePath(entry.file);
  const fileStat = await stat(absoluteFile);
  const start = await fetch(VIDEO_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": "video/mp4",
      "X-Upload-Content-Length": String(fileStat.size),
    },
    body: JSON.stringify(buildVideoInsertBody(entry)),
  });
  if (!start.ok) {
    throw new Error(`Failed to start upload for ${entry.projectId}: ${start.status} ${await start.text()}`);
  }

  const uploadUrl = start.headers.get("location");
  if (!uploadUrl) {
    throw new Error(`YouTube did not return a resumable upload URL for ${entry.projectId}`);
  }

  const video = await readFile(absoluteFile);
  const uploaded = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(video.byteLength),
    },
    body: video,
  });
  if (!uploaded.ok) {
    throw new Error(`Failed to upload ${entry.projectId}: ${uploaded.status} ${await uploaded.text()}`);
  }
  return uploaded.json();
}

async function insertPlaylistItem(videoId, playlistId, accessToken, position = null) {
  const url = new URL(PLAYLIST_ITEMS_URL);
  url.searchParams.set("part", "snippet");
  return fetchJson(url, {
    accessToken,
    method: "POST",
    body: buildPlaylistInsertBody(videoId, playlistId, position),
  });
}

async function uploadIntro(args) {
  const entry = buildIntroUploadEntry({ privacyStatus: args.privacyStatus === "private" ? "public" : args.privacyStatus });
  console.log(`${args.dryRun ? "Dry run" : "Upload"}: ${entry.title} (${entry.privacyStatus}, made for kids: ${entry.selfDeclaredMadeForKids})`);
  console.log(entry.description);
  if (args.dryRun) return;
  const state = await readJsonIfExists(args.stateFile, { uploads: {} });
  state.uploads ??= {};
  const oauthClient = await readOAuthClient(args.clientFile);
  const token = await getAccessToken(oauthClient, args);

  // Resumes after a partial run: the video upload, playlist item and thumbnail are separate steps.
  let intro = args.force ? null : state.uploads.intro;
  if (!intro?.videoId) {
    const upload = await uploadVideo(entry, token.access_token);
    intro = { videoId: upload.id, playlistItemId: null, title: entry.title, file: entry.file, playlistTitle: args.playlistTitle, uploadedAt: new Date().toISOString() };
    state.uploads.intro = intro;
    await writeJson(args.stateFile, state);
  }
  console.log(`Intro video: https://www.youtube.com/watch?v=${intro.videoId}`);

  if (!intro.playlistItemId) {
    const playlist = findPlaylistByTitle(await listPlaylists(token.access_token), args.playlistTitle);
    if (!playlist) throw new Error(`Playlist not found: ${args.playlistTitle}`);
    let playlistItem;
    try {
      playlistItem = await insertPlaylistItem(intro.videoId, playlist.id, token.access_token, entry.playlistPosition);
      console.log(`Added to playlist ${args.playlistTitle} at position ${entry.playlistPosition}`);
    } catch (error) {
      if (!String(error.message).includes("manualSortRequired")) throw error;
      playlistItem = await insertPlaylistItem(intro.videoId, playlist.id, token.access_token);
      console.log(`Added to the end of ${args.playlistTitle}: the playlist is not manually sorted, so it cannot go first.`);
    }
    intro.playlistItemId = playlistItem.id ?? null;
    await writeJson(args.stateFile, state);
  }

  if (!intro.thumbnailSet) {
    // Custom thumbnails need a verified channel; the video keeps YouTube's frame when this fails.
    const thumbnail = await readFile(resolveWorkspacePath(entry.thumbnail));
    const response = await fetch(`${THUMBNAILS_URL}?videoId=${intro.videoId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "image/png" },
      body: thumbnail,
    });
    console.log(response.ok ? "Thumbnail set." : `Thumbnail not set: ${response.status} ${await response.text()}`);
    intro.thumbnailSet = response.ok;
    await writeJson(args.stateFile, state);
  }
}

// Switches videos recorded in the upload state from unlisted to public; private ones are left alone.
async function publishUnlistedUploads(args) {
  const state = await readJsonIfExists(args.stateFile, { uploads: {} });
  const uploads = Object.entries(state.uploads ?? {}).filter(([projectId, upload]) =>
    upload.videoId && (args.only.length === 0 || args.only.includes(projectId)));
  const oauthClient = await readOAuthClient(args.clientFile);
  const token = await getAccessToken(oauthClient, args);

  const videos = [];
  for (let index = 0; index < uploads.length; index += 50) {
    const ids = uploads.slice(index, index + 50).map(([, upload]) => upload.videoId).join(",");
    const listed = await fetchJson(`${VIDEOS_URL}?part=status&id=${ids}`, { accessToken: token.access_token });
    videos.push(...(listed.items ?? []));
  }

  const unlisted = videos.filter((video) => video.status?.privacyStatus === "unlisted");
  console.log(`${unlisted.length}/${uploads.length} uploaded videos are unlisted${args.dryRun ? " (dry run)" : ""}`);
  for (const video of unlisted) {
    const title = uploads.find(([, upload]) => upload.videoId === video.id)?.[1].title ?? video.id;
    if (args.dryRun) {
      console.log(`- would publish ${title}`);
      continue;
    }
    await fetchJson(`${VIDEOS_URL}?part=status`, {
      method: "PUT",
      accessToken: token.access_token,
      body: buildPublishStatusBody(video),
    });
    console.log(`Published ${title}: https://www.youtube.com/watch?v=${video.id}`);
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json; charset=UTF-8" } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`YouTube API request failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

function openUrl(url) {
  const command = buildBrowserOpenCommand(url);
  const child = spawn(command.file, command.args, { detached: true, stdio: "ignore" });
  child.unref();
}

async function readJsonIfExists(file, fallback) {
  const absoluteFile = resolveWorkspacePath(file);
  if (!existsSync(absoluteFile)) {
    return fallback;
  }
  return JSON.parse(await readFile(absoluteFile, "utf8"));
}

async function writeJson(file, value) {
  const absoluteFile = resolveWorkspacePath(file);
  await mkdir(path.dirname(absoluteFile), { recursive: true });
  await writeFile(absoluteFile, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function resolveWorkspacePath(file) {
  return path.resolve(process.cwd(), file);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
