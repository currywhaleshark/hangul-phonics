import {
  CONSONANT_TIMING_PROJECTS,
  DEFAULT_TIMING_PROJECT_ID,
  MIN_CUE_LENGTH,
  clampTime,
  createDefaultTimingProject,
  formatClockTime,
  getCueAtTime,
  getTimingExportFileName,
  getTimingStorageKey,
  nudgeCueStart,
  parseTimingProject,
  removeCue,
  serializeTimingProject,
  setCueEnd,
  setCuePosition,
  setCueStart,
  sortCues,
} from "./tools/timing-editor-core.js";

const FALLBACK_AUDIO_PATH = "lessons/consonants/lesson-01-gogo-nana/ㄱ, ㄴ 소개.wav";
const SELECTED_PROJECT_STORAGE_KEY = "hangul-phonics:timing:selected-project";
const FINE_NUDGE = 0.03;
const NORMAL_NUDGE = 0.1;
const LARGE_NUDGE = 1;

const CARD_SLOTS = {
  dog: { left: 20, top: 39, accent: "#ff8470" },
  bear: { left: 78, top: 40, accent: "#ffc450" },
  meat: { left: 22, top: 74, accent: "#6ac2ff" },
  snack: { left: 78, top: 73, accent: "#79ce91" },
  noodles: { left: 55, top: 78, accent: "#b291ff" },
};

const LETTER_SLOTS = [
  { left: 48, top: 28 },
  { left: 56, top: 26 },
  { left: 44, top: 27 },
  { left: 48, top: 28 },
  { left: 56, top: 26 },
  { left: 44, top: 27 },
  { left: 48, top: 28 },
  { left: 56, top: 26 },
  { left: 44, top: 27 },
];

const audio = document.querySelector("#timing-audio");
const playToggle = document.querySelector("#play-toggle");
const seekSlider = document.querySelector("#seek-slider");
const currentTimeLabel = document.querySelector("#current-time");
const durationTimeLabel = document.querySelector("#duration-time");
const cueList = document.querySelector("#cue-list");
const letterCueList = document.querySelector("#letter-cue-list");
const stageCards = document.querySelector("#stage-cards");
const stage = document.querySelector(".lesson-stage");
const timeline = document.querySelector("#timeline");
const timelineMarkers = document.querySelector("#timeline-markers");
const segmentBand = document.querySelector("#segment-band");
const playhead = document.querySelector("#playhead");
const selectedCardLabel = document.querySelector("#selected-card");
const statusMessage = document.querySelector("#status-message");
const setSelectedNowButton = document.querySelector("#set-selected-now");
const exportJsonButton = document.querySelector("#export-json");
const renderVideoButton = document.querySelector("#render-video");
const renderOutput = document.querySelector("#render-output");
const importJsonButton = document.querySelector("#import-json");
const importFileInput = document.querySelector("#import-file");
const resetProjectButton = document.querySelector("#reset-project");
const segmentStartButton = document.querySelector("#segment-start");
const segmentEndButton = document.querySelector("#segment-end");
const projectSelector = document.querySelector("#project-selector");
const projectEyebrow = document.querySelector("#project-eyebrow");
const projectTitle = document.querySelector("#project-title");
const stageBackground = document.querySelector("#stage-background");
const mascotImage = document.querySelector("#mascot-image");
const letterBadge = document.querySelector("#letter-badge");
const letterSection = document.querySelector("#letter-section");
const letterSectionEyebrow = document.querySelector("#letter-section-eyebrow");

populateProjectSelector();
let project = loadStoredProject(projectSelector.value);
let selectedCueKind = "word";
let selectedCueId = project.cues[0]?.id ?? project.letterCues[0]?.id ?? null;
let lastLiveCueKey = null;
let dragState = null;

applyAudioSource();
renderAll();

function populateProjectSelector() {
  const storedProjectId = window.localStorage.getItem(SELECTED_PROJECT_STORAGE_KEY) || DEFAULT_TIMING_PROJECT_ID;
  projectSelector.innerHTML = "";

  CONSONANT_TIMING_PROJECTS.forEach((definition) => {
    const option = document.createElement("option");
    option.value = definition.id;
    option.textContent = `${definition.character.letter} ${definition.character.name}`;
    projectSelector.append(option);
  });

  const hasStoredProject = CONSONANT_TIMING_PROJECTS.some((definition) => definition.id === storedProjectId);
  projectSelector.value = hasStoredProject ? storedProjectId : DEFAULT_TIMING_PROJECT_ID;
}

function loadStoredProject(projectId) {
  const stored = window.localStorage.getItem(getTimingStorageKey(projectId));
  if (!stored) {
    return createDefaultTimingProject(projectId);
  }

  try {
    const parsed = parseTimingProject(stored);
    window.localStorage.setItem(getTimingStorageKey(parsed), serializeTimingProject(parsed));
    return parsed;
  } catch (error) {
    console.warn(error);
    return createDefaultTimingProject(projectId);
  }
}

function resetSelectedCue() {
  selectedCueKind = "word";
  selectedCueId = project.cues[0]?.id ?? project.letterCues[0]?.id ?? null;
  lastLiveCueKey = null;
}

function switchProject(projectId) {
  if (project?.id === projectId) {
    return;
  }

  audio.pause();
  project = loadStoredProject(projectId);
  resetSelectedCue();
  applyAudioSource();
  renderAll();
  setStatus(`${project.character.name} 불러옴`);
}

function applyAudioSource() {
  if (!project.audio?.src) {
    project.audio = { ...project.audio, src: FALLBACK_AUDIO_PATH };
  }

  audio.src = new URL(project.audio.src, window.location.href).href;
  seekSlider.max = String(project.audio.duration ?? project.segment.end);
  durationTimeLabel.textContent = formatClockTime(project.audio.duration ?? project.segment.end);
}

function saveProject() {
  window.localStorage.setItem(getTimingStorageKey(project), serializeTimingProject(project));
  window.localStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, project.id ?? DEFAULT_TIMING_PROJECT_ID);
}

function renderAll() {
  renderProjectChrome();
  renderCueList();
  renderTimeline();
  updatePlaybackVisuals();
}

function renderProjectChrome() {
  const character = project.character ?? {};
  const letter = character.letter ?? "";
  projectSelector.value = project.id ?? DEFAULT_TIMING_PROJECT_ID;
  projectEyebrow.textContent = `${project.lessonId ?? "레슨"} · ${letter}`;
  projectTitle.textContent = `${character.name ?? project.title} 카드 타이밍`;
  document.title = `${character.name ?? "자음"} ${letter} 카드 타이밍 편집기`;
  segmentStartButton.textContent = `${character.name ?? "구간"} 시작 찍기`;
  segmentEndButton.textContent = `${character.name ?? "구간"} 끝 찍기`;
  stageBackground.src = resolveAssetPath(project.render?.background ?? "public/video-assets/consonant-lesson-samples/gogo-g-background.png");
  mascotImage.src = resolveAssetPath(character.image ?? "public/video-assets/characters/consonants/ㄱ-gogo-cat.png");
  mascotImage.alt = character.name ?? "자음 캐릭터";
  letterBadge.textContent = letter;
  letterSection.setAttribute("aria-label", `${letter} 소리 팝업 타이밍`);
  letterSectionEyebrow.textContent = `${letter} 소리`;
}

function renderCueList() {
  cueList.innerHTML = "";
  project.cues.forEach((cue, index) => {
    cueList.append(renderCueRow(cue, index, "word"));
  });

  letterCueList.innerHTML = "";
  project.letterCues.forEach((cue, index) => {
    letterCueList.append(renderCueRow(cue, index, "letter"));
  });

  updateSelectedLabels();
}

function renderCueRow(cue, index, kind) {
  const isLetter = kind === "letter";
  const slot = isLetter ? { accent: "#ffd166" } : getCueSlot(cue);
  const row = document.createElement("article");
  row.className = `cue-row${isSelectedCue(kind, cue.id) ? " is-selected" : ""}${isLetter ? " cue-row-letter" : ""}`;
  row.dataset.cueId = cue.id;
  row.dataset.kind = kind;
  row.style.setProperty("--accent", slot.accent);
  const label = isLetter ? `${index + 1}. ${cue.label} 소리` : `${index + 1}. ${cue.label}`;
  const visual = isLetter
    ? `<span class="letter-thumb" aria-hidden="true">${escapeHtml(cue.label)}</span>`
    : `<img src="${escapeHtml(resolveAssetPath(cue.image))}" alt="">`;
  const removeButton = isLetter
    ? ""
    : `<button class="mini-button remove-card" type="button" data-action="remove" title="사용하지 않는 카드 빼기">빼기</button>`;

  row.innerHTML = `
    <button class="cue-select${isLetter ? " letter-select" : ""}" type="button" data-action="select">
      ${visual}
      <span class="cue-label">${escapeHtml(label)}</span>
      <span class="cue-time">${formatClockTime(cue.start)} - ${formatClockTime(cue.end)}</span>
    </button>
    <div class="cue-controls">
      <button class="mini-button" type="button" data-action="jump" title="이 큐 시작으로 이동">▶</button>
      ${removeButton}
      <button class="mini-button" type="button" data-nudge="-${LARGE_NUDGE}" title="시작 -1초">-1</button>
      <button class="mini-button" type="button" data-nudge="-${NORMAL_NUDGE}" title="시작 -0.1초">-0.1</button>
      <button class="mini-button" type="button" data-nudge="-${FINE_NUDGE}" title="시작 -0.03초">-0.03</button>
      <button class="mini-button set-now" type="button" data-action="set-start">시작</button>
      <button class="mini-button set-end" type="button" data-action="set-end">끝</button>
      <button class="mini-button" type="button" data-nudge="${FINE_NUDGE}" title="시작 +0.03초">+0.03</button>
      <button class="mini-button" type="button" data-nudge="${NORMAL_NUDGE}" title="시작 +0.1초">+0.1</button>
      <label class="time-field"><span>시작</span><input class="time-input" type="number" min="${project.segment.start}" max="${project.segment.end}" step="0.001" value="${cue.start.toFixed(3)}" data-start-input aria-label="${escapeHtml(label)} 시작 시간"></label>
      <label class="time-field"><span>끝</span><input class="time-input" type="number" min="${project.segment.start}" max="${project.segment.end}" step="0.001" value="${cue.end.toFixed(3)}" data-end-input aria-label="${escapeHtml(label)} 끝 시간"></label>
    </div>
  `;
  return row;
}

function renderTimeline() {
  const duration = getAudioDuration();
  const segmentStart = timeToPercent(project.segment.start, duration);
  const segmentEnd = timeToPercent(project.segment.end, duration);
  segmentBand.style.left = `${segmentStart}%`;
  segmentBand.style.width = `${Math.max(0.5, segmentEnd - segmentStart)}%`;
  timelineMarkers.innerHTML = "";

  project.cues.forEach((cue) => renderTimelineMarker(cue, "word", duration));
  project.letterCues.forEach((cue) => renderTimelineMarker(cue, "letter", duration));

  renderPlayhead();
}

function renderTimelineMarker(cue, kind, duration) {
  const marker = document.createElement("button");
  marker.type = "button";
  marker.className = `timeline-marker${isSelectedCue(kind, cue.id) ? " is-selected" : ""}${kind === "letter" ? " is-letter" : ""}`;
  marker.dataset.cueId = cue.id;
  marker.dataset.kind = kind;
  marker.title = `${cueDisplayName(kind, cue)} ${formatClockTime(cue.start)} - ${formatClockTime(cue.end)}`;
  marker.style.left = `${timeToPercent(cue.start, duration)}%`;
  marker.style.setProperty("--accent", kind === "letter" ? "#ffd166" : getCueSlot(cue).accent);
  timelineMarkers.append(marker);
}

function renderStage() {
  const now = getCurrentTime();
  const visibleWords = activeCues(project.cues, now);
  const selectedEntry = getSelectedCueEntry();
  const fallbackWord = selectedEntry?.kind === "word" ? selectedEntry.cue : null;
  const words = visibleWords.length > 0 ? visibleWords : fallbackWord ? [fallbackWord] : [];
  const visibleLetters = activeCues(project.letterCues, now);
  const fallbackLetter = selectedEntry?.kind === "letter" ? selectedEntry.cue : null;
  const letters = visibleLetters.length > 0 ? visibleLetters : fallbackLetter ? [fallbackLetter] : [];

  stageCards.innerHTML = "";
  words.forEach((cue) => {
    const slot = getCueSlot(cue);
    const card = document.createElement("div");
    card.className = `stage-card is-draggable${cueMotionClass(cue, visibleWords, now)}`;
    card.style.left = `${slot.left}%`;
    card.style.top = `${slot.top}%`;
    card.style.setProperty("--accent", slot.accent);
    card.dataset.stageCueId = cue.id;
    card.dataset.dragKind = "word";
    card.title = "드래그해서 위치 조절";
    card.innerHTML = `
      <img src="${escapeHtml(resolveAssetPath(cue.image))}" alt="">
      <span>${escapeHtml(cue.label)}</span>
    `;
    stageCards.append(card);
  });

  letters.forEach((cue) => {
    const slot = getLetterSlot(cue);
    const popup = document.createElement("div");
    popup.className = `letter-popup is-draggable${cueMotionClass(cue, visibleLetters, now)}`;
    popup.style.setProperty("--letter-left", `${slot.left}%`);
    popup.style.setProperty("--letter-top", `${slot.top}%`);
    popup.dataset.stageCueId = cue.id;
    popup.dataset.dragKind = "letter";
    popup.title = "드래그해서 위치 조절";
    popup.textContent = cue.label;
    stageCards.append(popup);
  });
}

function renderPlayhead() {
  playhead.style.left = `${timeToPercent(getCurrentTime(), getAudioDuration())}%`;
}

function updatePlaybackVisuals() {
  const now = getCurrentTime();
  currentTimeLabel.textContent = formatClockTime(now);
  seekSlider.value = String(now);
  playToggle.textContent = audio.paused ? "▶" : "⏸";
  renderPlayhead();
  renderStage();

  const liveEntry = activeCueEntryAtTime(now);
  const liveKey = liveEntry ? cueKey(liveEntry.kind, liveEntry.cue.id) : null;
  if (!audio.paused && liveEntry && liveKey !== lastLiveCueKey) {
    lastLiveCueKey = liveKey;
    selectedCueKind = liveEntry.kind;
    selectedCueId = liveEntry.cue.id;
    renderCueList();
    renderTimeline();
  }
}

function updateSelectedLabels() {
  const entry = getSelectedCueEntry();
  selectedCardLabel.textContent = entry
    ? `${cueDisplayName(entry.kind, entry.cue)} · ${formatClockTime(entry.cue.start)} - ${formatClockTime(entry.cue.end)}`
    : "선택 없음";
}

function getAudioDuration() {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    return audio.duration;
  }

  return project.audio.duration ?? project.segment.end;
}

function getCurrentTime() {
  return clampTime(audio.currentTime || 0, 0, getAudioDuration());
}

function timeToPercent(time, duration) {
  if (!Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  return clampTime((time / duration) * 100, 0, 100);
}

function getCueCollectionName(kind) {
  return kind === "letter" ? "letterCues" : "cues";
}

function getCueCollection(kind) {
  return project[getCueCollectionName(kind)] ?? [];
}

function getSelectedCueEntry() {
  const cue = getCueCollection(selectedCueKind).find((item) => item.id === selectedCueId);
  if (cue) {
    return { kind: selectedCueKind, cue };
  }

  if (project.cues[0]) {
    selectedCueKind = "word";
    selectedCueId = project.cues[0].id;
    return { kind: "word", cue: project.cues[0] };
  }

  if (project.letterCues[0]) {
    selectedCueKind = "letter";
    selectedCueId = project.letterCues[0].id;
    return { kind: "letter", cue: project.letterCues[0] };
  }

  return null;
}

function activeCueEntryAtTime(time) {
  const letterCue = activeCues(project.letterCues, time)[0];
  if (letterCue) {
    return { kind: "letter", cue: letterCue };
  }

  const wordCue = getCueAtTime(project, time);
  return wordCue ? { kind: "word", cue: wordCue } : null;
}

function activeCues(cues, time) {
  return sortCues(cues).filter((cue) => time >= cue.start && time <= cue.end);
}
function cueMotionClass(cue, visibleCues, time) {
  if (!containsCue(visibleCues, cue)) {
    return " is-ghost";
  }

  const cueLength = Math.max(0, cue.end - cue.start);
  const entryLength = Math.min(0.35, Math.max(0.16, cueLength * 0.45));
  return time - cue.start <= entryLength ? " is-entering" : " is-holding";
}

function containsCue(cues, cue) {
  return cues.some((item) => item.id === cue.id);
}

function cueDisplayName(kind, cue) {
  return kind === "letter" ? `${cue.label} 소리` : cue.label;
}

function cueKey(kind, cueId) {
  return `${kind}:${cueId}`;
}

function isSelectedCue(kind, cueId) {
  return selectedCueKind === kind && selectedCueId === cueId;
}

function getCueSlot(cue) {
  const fallback = CARD_SLOTS[cue.id] ?? { left: 50, top: 50, accent: cue.accent ?? "#087f8c" };
  const position = cue.position ?? fallback;
  return { ...fallback, left: position.left, top: position.top, accent: cue.accent ?? fallback.accent };
}

function getLetterSlot(cue) {
  const index = Math.max(0, project.letterCues.findIndex((item) => item.id === cue.id));
  return cue.position ?? LETTER_SLOTS[index % LETTER_SLOTS.length];
}

function resolveAssetPath(path) {
  return new URL(path, window.location.href).href;
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function selectCue(cueId, kind = "word") {
  selectedCueKind = kind;
  selectedCueId = cueId;
  lastLiveCueKey = null;
  renderAll();
}

function setAudioTime(time) {
  audio.currentTime = clampTime(time, 0, getAudioDuration());
  updatePlaybackVisuals();
}

function setSegmentBoundary(boundary) {
  const duration = getAudioDuration();
  const currentSegment = project.segment ?? { label: project.character?.name ?? "구간", start: 0, end: duration };
  let nextStart = Number.isFinite(currentSegment.start) ? currentSegment.start : 0;
  let nextEnd = Number.isFinite(currentSegment.end) ? currentSegment.end : duration;

  if (boundary === "start") {
    nextStart = clampTime(getCurrentTime(), 0, Math.max(0, nextEnd - MIN_CUE_LENGTH));
  } else {
    nextEnd = clampTime(getCurrentTime(), nextStart + MIN_CUE_LENGTH, duration);
  }

  project = {
    ...project,
    segment: {
      ...currentSegment,
      start: nextStart,
      end: nextEnd,
    },
  };
  saveProject();
  renderAll();
  const label = boundary === "start" ? "시작" : "끝";
  const value = boundary === "start" ? nextStart : nextEnd;
  setStatus(`${currentSegment.label} 구간 ${label} ${formatClockTime(value)}`);
}

function setCueStartNow(cueId = selectedCueId, kind = selectedCueKind) {
  const cue = getCueCollection(kind).find((item) => item.id === cueId);
  if (!cue) {
    return;
  }

  selectedCueKind = kind;
  selectedCueId = cue.id;
  project = setCueStart(project, cue.id, getCurrentTime(), getCueCollectionName(kind));
  saveProject();
  renderAll();
  const updatedCue = getCueCollection(kind).find((item) => item.id === cue.id);
  setStatus(`${cueDisplayName(kind, updatedCue)} 시작 ${formatClockTime(updatedCue.start)}`);
}

function setCueEndNow(cueId = selectedCueId, kind = selectedCueKind) {
  const cue = getCueCollection(kind).find((item) => item.id === cueId);
  if (!cue) {
    return;
  }

  selectedCueKind = kind;
  selectedCueId = cue.id;
  project = setCueEnd(project, cue.id, getCurrentTime(), getCueCollectionName(kind));
  saveProject();
  renderAll();
  const updatedCue = getCueCollection(kind).find((item) => item.id === cue.id);
  setStatus(`${cueDisplayName(kind, updatedCue)} 끝 ${formatClockTime(updatedCue.end)}`);
}

function nudgeCue(cueId, kind, delta) {
  const cue = getCueCollection(kind).find((item) => item.id === cueId);
  if (!cue) {
    return;
  }

  selectedCueKind = kind;
  selectedCueId = cue.id;
  project = nudgeCueStart(project, cue.id, delta, getCueCollectionName(kind));
  saveProject();
  renderAll();
  const updatedCue = getCueCollection(kind).find((item) => item.id === cue.id);
  setStatus(`${cueDisplayName(kind, updatedCue)} 시작 ${delta > 0 ? "+" : ""}${delta.toFixed(2)}초`);
}

function updateCueFromInput(cueId, kind, field, value) {
  const cue = getCueCollection(kind).find((item) => item.id === cueId);
  const time = Number.parseFloat(value);
  if (!cue || !Number.isFinite(time)) {
    setStatus("시간 값을 확인");
    renderCueList();
    return;
  }

  selectedCueKind = kind;
  selectedCueId = cue.id;
  project = field === "end"
    ? setCueEnd(project, cue.id, time, getCueCollectionName(kind))
    : setCueStart(project, cue.id, time, getCueCollectionName(kind));
  saveProject();
  renderAll();
  const updatedCue = getCueCollection(kind).find((item) => item.id === cue.id);
  const label = field === "end" ? "끝" : "시작";
  const displayTime = field === "end" ? updatedCue.end : updatedCue.start;
  setStatus(`${cueDisplayName(kind, updatedCue)} ${label} ${formatClockTime(displayTime)}`);
}

function exportProject() {
  const blob = new Blob([serializeTimingProject(project)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getTimingExportFileName(project);
  link.click();
  URL.revokeObjectURL(url);
  setStatus("JSON 저장됨");
}

async function renderVideo() {
  if (!renderVideoButton || !renderOutput) {
    return;
  }

  saveProject();
  renderVideoButton.disabled = true;
  renderOutput.replaceChildren();
  renderOutput.textContent = "영상 만드는 중...";
  setStatus("영상 만드는 중...");

  try {
    const response = await fetch("/api/timing-render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: serializeTimingProject(project),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "영상 만들기 실패");
    }

    renderOutput.replaceChildren(
      makeRenderLink(result.videoUrl, "MP4 열기"),
      makeRenderLink(result.previewUrl, "미리보기 열기"),
    );
    setStatus("영상 생성 완료");
  } catch (error) {
    console.error(error);
    renderOutput.textContent = error instanceof Error ? error.message : "영상 만들기 실패";
    setStatus("영상 만들기 실패");
  } finally {
    renderVideoButton.disabled = false;
  }
}

function makeRenderLink(href, label) {
  const link = document.createElement("a");
  link.href = href;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = label;
  return link;
}

async function importProject(file) {
  if (!file) {
    return;
  }

  try {
    project = parseTimingProject(await file.text());
    resetSelectedCue();
    saveProject();
    applyAudioSource();
    renderAll();
    setStatus("JSON 가져옴");
  } catch (error) {
    console.error(error);
    setStatus("JSON 확인 필요");
  } finally {
    importFileInput.value = "";
  }
}

function removeWordCue(cueId) {
  const cue = project.cues.find((item) => item.id === cueId);
  if (!cue) {
    return;
  }

  if (project.cues.length <= 1) {
    setStatus("단어카드는 하나 이상 필요");
    return;
  }

  project = removeCue(project, cue.id);
  resetSelectedCue();
  saveProject();
  renderAll();
  setStatus(`${cue.label} 카드 뺌`);
}
function resetProject() {
  project = createDefaultTimingProject(project.id ?? projectSelector.value);
  resetSelectedCue();
  saveProject();
  applyAudioSource();
  renderAll();
  setStatus("초기값 복원");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

function selectCueWithoutStageRender(cueId, kind) {
  selectedCueKind = kind;
  selectedCueId = cueId;
  lastLiveCueKey = null;
  renderCueList();
  renderTimeline();
  updateSelectedLabels();
}

function stagePositionFromPointer(event) {
  const rect = stage.getBoundingClientRect();
  return {
    left: ((event.clientX - rect.left) / rect.width) * 100,
    top: ((event.clientY - rect.top) / rect.height) * 100,
  };
}

function moveStageElement(element, kind, position) {
  if (kind === "letter") {
    element.style.setProperty("--letter-left", `${position.left}%`);
    element.style.setProperty("--letter-top", `${position.top}%`);
    return;
  }

  element.style.left = `${position.left}%`;
  element.style.top = `${position.top}%`;
}

function setDraggedCuePosition(event) {
  if (!dragState) {
    return;
  }

  const collectionName = getCueCollectionName(dragState.kind);
  project = setCuePosition(project, dragState.cueId, stagePositionFromPointer(event), collectionName);
  const cue = getCueCollection(dragState.kind).find((item) => item.id === dragState.cueId);
  if (!cue) {
    return;
  }

  moveStageElement(dragState.element, dragState.kind, cue.position);
  setStatus(`${cueDisplayName(dragState.kind, cue)} 위치 ${cue.position.left.toFixed(1)}, ${cue.position.top.toFixed(1)}`);
}

function startStageDrag(event) {
  if (event.button !== 0) {
    return;
  }

  const target = event.target.closest("[data-drag-kind][data-stage-cue-id]");
  if (!target || !stage.contains(target)) {
    return;
  }

  event.preventDefault();
  dragState = {
    cueId: target.dataset.stageCueId,
    element: target,
    kind: target.dataset.dragKind,
    pointerId: event.pointerId,
  };
  target.classList.add("is-dragging");
  target.setPointerCapture?.(event.pointerId);
  selectCueWithoutStageRender(dragState.cueId, dragState.kind);
  setDraggedCuePosition(event);
}

function moveStageDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) {
    return;
  }

  event.preventDefault();
  setDraggedCuePosition(event);
}

function finishStageDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) {
    return;
  }

  event.preventDefault();
  setDraggedCuePosition(event);
  dragState.element.classList.remove("is-dragging");
  dragState.element.releasePointerCapture?.(event.pointerId);
  saveProject();
  dragState = null;
  renderAll();
}

function cancelStageDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) {
    return;
  }

  dragState.element.classList.remove("is-dragging");
  dragState = null;
  renderAll();
}

stage.addEventListener("pointerdown", startStageDrag);
stage.addEventListener("pointermove", moveStageDrag);
stage.addEventListener("pointerup", finishStageDrag);
stage.addEventListener("pointercancel", cancelStageDrag);

playToggle.addEventListener("click", async () => {
  if (audio.paused) {
    await audio.play();
  } else {
    audio.pause();
  }
  updatePlaybackVisuals();
});

audio.addEventListener("loadedmetadata", () => {
  project = {
    ...project,
    audio: {
      ...project.audio,
      duration: clampTime(audio.duration, 0, Number.POSITIVE_INFINITY),
    },
  };
  seekSlider.max = String(project.audio.duration);
  durationTimeLabel.textContent = formatClockTime(project.audio.duration);
  saveProject();
  renderTimeline();
  updatePlaybackVisuals();
});

audio.addEventListener("timeupdate", updatePlaybackVisuals);
audio.addEventListener("play", updatePlaybackVisuals);
audio.addEventListener("pause", updatePlaybackVisuals);

seekSlider.addEventListener("input", () => {
  setAudioTime(Number.parseFloat(seekSlider.value));
});

segmentStartButton.addEventListener("click", () => {
  setSegmentBoundary("start");
});

segmentEndButton.addEventListener("click", () => {
  setSegmentBoundary("end");
});

setSelectedNowButton.addEventListener("click", () => {
  setCueStartNow();
});

exportJsonButton.addEventListener("click", exportProject);
renderVideoButton?.addEventListener("click", renderVideo);

importJsonButton.addEventListener("click", () => {
  importFileInput.click();
});

importFileInput.addEventListener("change", () => {
  importProject(importFileInput.files?.[0]);
});

resetProjectButton.addEventListener("click", resetProject);

projectSelector.addEventListener("change", () => {
  switchProject(projectSelector.value);
});

function handleCueListClick(event) {
  const button = event.target.closest("button");
  const row = event.target.closest("[data-cue-id]");
  if (!button || !row) {
    return;
  }

  const cueId = row.dataset.cueId;
  const kind = row.dataset.kind ?? "word";
  const cue = getCueCollection(kind).find((item) => item.id === cueId);
  if (!cue) {
    return;
  }

  if (button.dataset.nudge) {
    nudgeCue(cueId, kind, Number.parseFloat(button.dataset.nudge));
    return;
  }

  switch (button.dataset.action) {
    case "select":
      selectCue(cueId, kind);
      break;
    case "jump":
      selectCue(cueId, kind);
      setAudioTime(cue.start);
      break;
    case "remove":
      if (kind === "word") {
        removeWordCue(cueId);
      }
      break;
    case "set-start":
      setCueStartNow(cueId, kind);
      break;
    case "set-end":
      setCueEndNow(cueId, kind);
      break;
    default:
      break;
  }
}

cueList.addEventListener("click", handleCueListClick);
letterCueList.addEventListener("click", handleCueListClick);

function handleCueListChange(event) {
  const input = event.target.closest("[data-start-input], [data-end-input]");
  const row = event.target.closest("[data-cue-id]");
  if (!input || !row) {
    return;
  }

  updateCueFromInput(row.dataset.cueId, row.dataset.kind ?? "word", input.hasAttribute("data-end-input") ? "end" : "start", input.value);
}
function handleCueListInput(event) {
  const input = event.target.closest("[data-start-input], [data-end-input]");
  const row = event.target.closest("[data-cue-id]");
  if (!input || !row || input.value === "") {
    return;
  }

  const kind = row.dataset.kind ?? "word";
  const field = input.hasAttribute("data-end-input") ? "end" : "start";
  const time = Number.parseFloat(input.value);
  if (!Number.isFinite(time)) {
    return;
  }

  const cue = getCueCollection(kind).find((item) => item.id === row.dataset.cueId);
  if (!cue) {
    return;
  }

  selectedCueKind = kind;
  selectedCueId = cue.id;
  project = field === "end"
    ? setCueEnd(project, cue.id, time, getCueCollectionName(kind))
    : setCueStart(project, cue.id, time, getCueCollectionName(kind));
  saveProject();

  const updatedCue = getCueCollection(kind).find((item) => item.id === cue.id);
  row.querySelector(".cue-time").textContent = `${formatClockTime(updatedCue.start)} - ${formatClockTime(updatedCue.end)}`;
  renderTimeline();
  updatePlaybackVisuals();
}

cueList.addEventListener("input", handleCueListInput);
letterCueList.addEventListener("input", handleCueListInput);
cueList.addEventListener("change", handleCueListChange);
letterCueList.addEventListener("change", handleCueListChange);

timeline.addEventListener("click", (event) => {
  const marker = event.target.closest(".timeline-marker");
  if (marker) {
    const kind = marker.dataset.kind ?? "word";
    const cue = getCueCollection(kind).find((item) => item.id === marker.dataset.cueId);
    if (cue) {
      selectCue(cue.id, kind);
      setAudioTime(cue.start);
    }
    return;
  }

  const rect = timeline.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  setAudioTime(getAudioDuration() * ratio);
});

window.addEventListener("keydown", (event) => {
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    playToggle.click();
    return;
  }

  if (event.code === "Enter") {
    event.preventDefault();
    setCueStartNow();
    return;
  }

  if (event.code === "KeyE") {
    event.preventDefault();
    setCueEndNow();
    return;
  }

  if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
    event.preventDefault();
    const direction = event.code === "ArrowLeft" ? -1 : 1;
    nudgeCue(selectedCueId, selectedCueKind, direction * (event.shiftKey ? FINE_NUDGE : NORMAL_NUDGE));
    return;
  }

  const number = Number.parseInt(event.key, 10);
  if (Number.isInteger(number) && number >= 1 && number <= project.cues.length) {
    selectCue(project.cues[number - 1].id, "word");
  }
});


