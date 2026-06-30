import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const cli = await readFile(new URL("../tools/upload-youtube-videos.mjs", import.meta.url), "utf8");

assert.match(cli, /accounts\.google\.com\/o\/oauth2\/v2\/auth/, "CLI should start installed-app OAuth");
assert.match(cli, /oauth2\.googleapis\.com\/token/, "CLI should exchange and refresh OAuth tokens");
assert.match(cli, /upload\/youtube\/v3\/videos/, "CLI should use YouTube resumable uploads");
assert.match(cli, /uploadType=resumable/, "CLI should request a resumable upload session");
assert.match(cli, /youtube\/v3\/playlists/, "CLI should list playlists");
assert.match(cli, /youtube\/v3\/playlistItems/, "CLI should add uploaded videos to the playlist");
assert.match(cli, /youtube-oauth-token\.json/, "CLI should keep OAuth tokens in ignored secrets storage");
assert.match(cli, /youtube-upload-state\.json/, "CLI should keep uploaded video state in ignored secrets storage");
assert.match(cli, /--upload/, "CLI should require an explicit upload flag before network upload");
assert.match(cli, /--dry-run/, "CLI should support dry runs");

assert.doesNotMatch(cli, /53682/, "CLI should not hard-code a callback port");
assert.match(cli, /server\.listen\(0, "127\.0\.0\.1"/, "CLI should let the OS choose a free OAuth callback port");
assert.match(cli, /server\.address\(\)/, "CLI should build the redirect URI from the chosen callback port");
