# Vowel Combine Story Video Template Design

Date: 2026-06-25

## Goal

Add a reusable video timing template for the vowel lessons after the special `아` lesson. The first supported lessons are `오` and `우`, because those audio files already exist. The template should show the learner how `아아 아기` meets a vowel tool, transforms into the combined illustration, then practices the target vowel sound with a letter popup and three word cards.

## Scope

In scope:

- Add `오` and `우` timing projects to the editor.
- Keep the existing `아` story template unchanged.
- Add a new template flow for `오` and `우` that uses alpha assets from `public/video-assets/vowel-alpha`.
- Support JSON timing export and the existing "render video" workflow.
- Render the same visible sequence in the browser editor preview and the Python video renderer.

Out of scope:

- Generate new art.
- Build the remaining vowel lessons beyond `오` and `우`.
- Change the consonant lesson template.
- Rework the timing editor UI outside the controls needed for this template.

## Template Flow

Use a new template named `vowel-combine-story`.

The visual sequence is:

1. `아아 아기` enters from the left and the target vowel tool enters from the right.
2. The two assets meet near the center.
3. The separate assets disappear and the combined illustration appears in the center.
4. The target vowel letter appears as a large popup.
5. Three word cards appear in order.
6. The target vowel letter appears again for the final call.

For `오`, the lesson uses:

- Audio: `lessons/vowels/lesson-01-aa-baby-vowel/오.wav`
- Baby source: `public/video-assets/vowel-alpha/combined/아아 아기 나뭇가지 시안-alpha.png` if a baby-only alpha is unavailable, or the existing baby story image when previewing.
- Tool source: `public/video-assets/vowel-alpha/tools/오오 상자-alpha.png`
- Combined source: `public/video-assets/vowel-alpha/combined/오오 상자 시안-alpha.png`
- Words: `오이`, `오리`, `오랑우탄`
- Letter: `오`

For `우`, the lesson uses:

- Audio: `lessons/vowels/lesson-01-aa-baby-vowel/우.wav`
- Baby source: same fallback strategy as `오`
- Tool source: `public/video-assets/vowel-alpha/tools/우우 발판-alpha.png`
- Combined source: `public/video-assets/vowel-alpha/combined/우우 발판 시안-alpha.png`
- Words: `우산`, `우유`, `우물`
- Letter: `우`

## Data Model

Extend timing projects without disrupting existing cue collections:

- `sceneCues`: optional background or phase cues for the combine story.
- `combineCues`: new collection for the meet-and-transform sequence.
- `cues`: existing word-card cues.
- `letterCues`: existing letter popup cues.

Each `combineCue` should include:

- `id`
- `label`
- `assetKind`: `baby`, `tool`, or `combined`
- `image`
- `start`
- `end`
- `fromPosition`
- `toPosition`
- `scale`

The timing editor should treat `combineCues` as a first-class cue collection for loading, merging defaults, saving JSON, and rendering. Existing timing JSON files that do not include `combineCues` remain valid.

## Editor Preview

The browser preview should render the same sequence as the final video:

- During the meet phase, draw baby and tool assets as transparent sprites rather than word cards.
- Interpolate each sprite from `fromPosition` to `toPosition`.
- During the combined phase, draw the combined image centered with a soft pop-in motion.
- Word cards and letter popups reuse the current overlay behavior.

The editor does not need a complex new panel. It can expose combine cues in the existing cue list style, with labels such as `아기`, `오오 상자`, and `합친 이미지`.

## Renderer

Update `tools/render_gogo_timed_lesson_video.py` so `project.template === "vowel-combine-story"` uses a dedicated frame builder:

- Load alpha sprites from `combineCues`.
- Draw a warm plain background matching the current vowel renderer.
- Animate separate baby/tool sprites into the center.
- Swap to the combined sprite at the combined cue start.
- Reuse existing word card and letter popup rendering.
- Keep output paths compatible with the current timing render API.

The renderer should fail with a clear error if a required image or audio file is missing.

## Timing Defaults

Default timings should be coarse and easy to adjust:

- Meet phase: first narration sentence.
- Combined image: after "올라타고 오!" or the equivalent `우` line.
- First letter popup: "같이 말해요 오/우!".
- Word cards: each target word cue.
- Final letter popup: final `오!` or `우!`.

Exact timings may be adjusted in the editor after audio waveform review.

## Testing

Verification should cover:

- `오` and `우` appear as timing project options.
- Default projects load without console errors.
- JSON export includes `combineCues`.
- The timing render API accepts the new template.
- A preview image or short rendered sample shows the meet phase, combined phase, word cards, and final letter popup.

## Risks

- A baby-only transparent asset may be needed for the cleanest meet animation. If unavailable, use the existing `아아 아기` or combined baby asset as an interim source and keep the data model ready to swap the image later.
- `우` uses `우산`, `우유`, and `우물`; all three word assets should be loaded from the existing worksheet asset set.
