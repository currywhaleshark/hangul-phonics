# YouTube Batch Upload Design

## Goal

Batch upload the generated Hangul syllable-combine lesson videos to YouTube with consistent metadata while keeping credentials and upload state out of git.

## Scope

The uploader targets `syllable-combine-story` timing projects only: the 자음+ㅏ and 자음+ㅗ videos rendered as `public/video-assets/consonant-lesson-samples/<slug>-timed-lesson.mp4`.

## Metadata

Each upload is private. Titles follow `<캐릭터><와/과> <모음도구> | <자음>+<모음>=<음절>`, for example `고고 고양이와 아아 나뭇가지 | ㄱ+ㅏ=가`. Every video uses the description `코덱스 영상제작, 음성은 제미나이 tts`, category `27` education, tags for Hangul plus the target syllable, `selfDeclaredMadeForKids: true`, and `containsSyntheticMedia: true`.

## Workflow

The CLI first builds a dry-run manifest from local project definitions and existing video files. Actual upload requires `--upload`, uses the OAuth desktop client in `secrets/youtube-oauth-client.json`, stores the refresh token in `secrets/youtube-oauth-token.json`, finds the exact playlist `소리나라 한글친구들`, uploads videos through YouTube resumable upload, adds each uploaded video to the playlist, and records completed uploads in `secrets/youtube-upload-state.json` so reruns skip finished items.

## Safety

Secrets, client JSON files, OAuth tokens, and upload state are ignored by git. The uploader does not create playlists automatically. If the playlist is missing, it stops before uploading. Dry-run is the default mode.
