# YouTube Batch Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a safe YouTube batch uploader for generated 자음+ㅏ/ㅗ lesson videos.

**Architecture:** Keep title generation, manifest creation, API request body generation, argument parsing, and skip filtering in a tested core module. Keep OAuth, resumable upload, playlist lookup, playlist insertion, and local state persistence in a CLI script. Store credentials and state only under ignored `secrets/` paths.

**Tech Stack:** Node ES modules, built-in `fetch`, built-in HTTP loopback OAuth callback, YouTube Data API v3.

---

### Task 1: Metadata And Manifest Core

**Files:**
- Create: `tests/youtube_upload_core.test.mjs`
- Create: `tools/youtube-upload-core.mjs`

- [x] Write failing tests for title generation, upload metadata, playlist body generation, and manifest filtering.
- [x] Run `node tests/youtube_upload_core.test.mjs` and verify failure from the missing module.
- [x] Implement `tools/youtube-upload-core.mjs` with pure helpers.
- [x] Run `node tests/youtube_upload_core.test.mjs` and verify pass.

### Task 2: CLI Safety Helpers

**Files:**
- Modify: `tests/youtube_upload_core.test.mjs`
- Modify: `tools/youtube-upload-core.mjs`

- [x] Add failing tests for `parseUploadArgs` and `filterUploadEntries`.
- [x] Run `node tests/youtube_upload_core.test.mjs` and verify failure from missing exports.
- [x] Implement explicit `--upload`/default dry-run parsing and uploaded-state filtering.
- [x] Run `node tests/youtube_upload_core.test.mjs` and verify pass.

### Task 3: Upload CLI

**Files:**
- Create: `tests/youtube_upload_cli_static.test.mjs`
- Create: `tools/upload-youtube-videos.mjs`

- [x] Add failing static tests for OAuth, token exchange, resumable upload, playlist lookup, playlist insertion, ignored token/state paths, and dry-run/upload flags.
- [x] Run `node tests/youtube_upload_cli_static.test.mjs` and verify failure from the missing CLI file.
- [x] Implement the CLI using OAuth loopback flow, YouTube resumable upload, playlist insertion, and per-video state persistence.
- [x] Run `node tests/youtube_upload_cli_static.test.mjs` and `node tools/upload-youtube-videos.mjs --dry-run --limit 3`.

### Task 4: Verification And Upload

**Files:**
- Modify: `.gitignore`
- Generated local-only: `secrets/youtube-oauth-token.json`, `secrets/youtube-upload-state.json`

- [ ] Run focused tests: `node tests/youtube_upload_core.test.mjs` and `node tests/youtube_upload_cli_static.test.mjs`.
- [ ] Run `node tools/upload-youtube-videos.mjs --dry-run` and inspect all selected titles.
- [ ] Run first real upload with `node tools/upload-youtube-videos.mjs --upload --open-browser --limit 1`.
- [ ] If the first upload succeeds, run `node tools/upload-youtube-videos.mjs --upload --open-browser` to upload remaining videos.
