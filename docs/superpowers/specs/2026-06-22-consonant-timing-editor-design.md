# Consonant Timing Editor Generalization Design

## Goal

Turn the current Gogo-only timing editor and timed video renderer into a reusable consonant character workflow. The editor should let the user choose a consonant character, adjust that character's segment within the lesson-level intro audio, edit word and letter popup timings, export JSON, and render videos for characters beyond Gogo.

## Scope

- Add a character/project selector to `timing-editor.html` and `timing-editor.js`.
- Replace Gogo-specific defaults in `tools/timing-editor-core.js` with a small catalog of consonant timing projects.
- Build each project from existing lesson metadata where possible: character name, letter, character image, lesson intro WAV, and word cards.
- Keep one audio source per lesson. Characters in the same lesson share the intro WAV and use `segment.start`/`segment.end` to cut their own portion.
- Generalize `tools/render_gogo_timed_lesson_video.py` so it reads character, letter, background, word cue, and audio metadata from exported timing JSON instead of hardcoded Gogo values.

## Data Model

Each timing project will include:

- `id`: stable project id such as `gogo-g` or `mimi-m`.
- `lessonId`: source lesson folder id.
- `character`: `{ key, name, image, letter }`.
- `audio`: `{ src, duration? }`.
- `segment`: `{ label, start, end }`.
- `cues`: word popup cues with label, image, position, start, and end.
- `letterCues`: letter popup cues with label, position, start, and end.
- `render`: optional output hints such as background image and output slug.

## Editor Behavior

The editor starts on Gogo to preserve existing behavior. A selector switches to another project, updates the title, letter badge, mascot image, audio source, cue lists, segment labels, storage key, and export filename. Reset resets only the selected project. Import accepts a timing JSON and switches to its matching project id when present.

Segment start/end buttons should set the selected character's `segment.start` and `segment.end` from the current audio time. Cue start/end editing remains unchanged.

## Renderer Behavior

The renderer keeps the existing visual style but resolves these values from JSON:

- intro audio path from `audio.src`
- segment trim from `segment.start/end`
- character sprite from `character.image`
- letter badge and letter popups from `character.letter` or cue label
- word card labels/images from `cues`
- output slug from `render.outputSlug` or project id

If no custom background is available for a character, the renderer can reuse the existing Gogo sample background for now. This keeps the first generalized version shippable without blocking on background art for every consonant.

## Testing

Add tests before implementation for:

- catalog contains more than Gogo and maps lesson-level intro audio to multiple characters.
- default project creation by id returns the right character letter, image, words, and shared audio.
- parsing imported JSON preserves character metadata and segment values.
- static editor checks verify the selector and dynamic download filename.
- renderer static checks verify it no longer hardcodes Gogo-only letter/image/audio paths for core rendering.

