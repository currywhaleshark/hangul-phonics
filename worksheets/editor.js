import html2canvas from "html2canvas";

import {
  clearDraftForLesson,
  loadDraftForSource,
  sourceSignature,
  writeDraftForSource,
} from "./editor-storage.js";
import { renderWorksheetDocument } from "./worksheet-renderer.js";

const STORAGE_PREFIX = "hangul-phonics-worksheet-editor";
const SELECTED_LESSON_KEY = `${STORAGE_PREFIX}:selectedLessonId`;
const MANIFEST_URL = "../lessons/consonants/manifest.json";
const PNG_EXPORT_SCALE = 2;
const PNG_CAPTURE_CSS = `
  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }

  .toolbar {
    display: none !important;
  }

  .sheet {
    margin: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    page-break-after: auto !important;
  }

  .sheet::after {
    inset: 5mm !important;
    opacity: 0.8 !important;
  }

  .character-frame,
  .letter-panel,
  .activity-box,
  .spot-card,
  .house {
    box-shadow: 0 4px 0 rgba(0, 0, 0, 0.08) !important;
  }

  .house-title,
  .drop-zone {
    background: #fff !important;
  }
`;
const FALLBACK_LESSON = {
  id: "pilot-lesson",
  title: "파일럿 시안",
  letters: "ㄱ/ㄴ",
  worksheetPath: "./data/pilot-lesson.json",
};

const pageList = document.querySelector("#page-list");
const pageForm = document.querySelector("#page-form");
const pageEditorTitle = document.querySelector("#page-editor-title");
const pageTypeBadge = document.querySelector("#page-type-badge");
const lessonSelect = document.querySelector("#lesson-select");
const lessonTitle = document.querySelector("#lesson-title");
const previewFrame = document.querySelector("#preview-frame");
const statusText = document.querySelector("#status-text");

const downloadJsonButton = document.querySelector("#download-json");
const downloadHtmlButton = document.querySelector("#download-html");
const downloadPngButton = document.querySelector("#download-png");
const printButton = document.querySelector("#print-preview");
const reloadButton = document.querySelector("#reload-data");

const PAGE_TYPE_LABELS = {
  character: "캐릭터",
  spot: "첫소리",
  sorting: "분류",
};

const PAGE_THEMES = [
  ["gogo", "고고"],
  ["nana", "나나"],
  ["mix", "혼합"],
];

let lesson = null;
let lessonCatalog = [FALLBACK_LESSON];
let selectedLessonId = FALLBACK_LESSON.id;
let activePageIndex = 0;
let previewTimer = null;
let selectedSourceSignature = "";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function setStatus(text) {
  statusText.textContent = text;
}

function storageKeyFor(lessonId) {
  return `${STORAGE_PREFIX}:${lessonId}`;
}

function sourceSignatureKeyFor(lessonId) {
  return `${storageKeyFor(lessonId)}:sourceSignature`;
}

function saveDraft() {
  writeDraftForSource(
    localStorage,
    storageKeyFor(selectedLessonId),
    sourceSignatureKeyFor(selectedLessonId),
    lesson,
    selectedSourceSignature
  );
  localStorage.setItem(SELECTED_LESSON_KEY, selectedLessonId);
}

function schedulePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    previewFrame.srcdoc = renderWorksheetDocument(lesson);
    saveDraft();
    setStatus("변경사항 미리보기 반영됨");
  }, 120);
}

function refreshPreviewNow() {
  clearTimeout(previewTimer);
  const loadPromise = waitForFrameLoad();
  previewFrame.srcdoc = renderWorksheetDocument(lesson);
  saveDraft();
  return loadPromise;
}

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("PNG 데이터를 만들지 못했습니다."));
        }
      }, "image/png");
    } catch (error) {
      reject(new Error("PNG 변환 중 브라우저 보안 제한이 발생했습니다.", { cause: error }));
    }
  });
}

async function downloadCanvasPng(filename, canvas) {
  const blob = await canvasToPngBlob(canvas);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function waitForFrameLoad() {
  return new Promise((resolve) => {
    previewFrame.addEventListener("load", resolve, { once: true });
  });
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
}

async function waitForPreviewAssets(documentRef) {
  if (documentRef.fonts?.ready) await withTimeout(documentRef.fonts.ready, 2500);

  const images = [...documentRef.images].filter((image) => !image.complete);
  await withTimeout(Promise.all(images.map((image) => new Promise((resolve) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  }))), 5000);
}

function preparePngClone(clonedDocument) {
  const style = clonedDocument.createElement("style");
  style.textContent = PNG_CAPTURE_CSS;
  clonedDocument.head.append(style);
}

function installPngCompatibilityStyle(documentRef) {
  const style = documentRef.createElement("style");
  style.textContent = PNG_CAPTURE_CSS;
  documentRef.head.append(style);
  return style;
}

async function captureSheetCanvas(sheet) {
  return html2canvas(sheet, {
    allowTaint: false,
    backgroundColor: "#fffdf7",
    foreignObjectRendering: false,
    logging: false,
    scale: PNG_EXPORT_SCALE,
    useCORS: true,
    windowHeight: sheet.ownerDocument.documentElement.scrollHeight,
    windowWidth: sheet.ownerDocument.documentElement.scrollWidth,
    onclone: preparePngClone,
  });
}

async function exportPngPages() {
  await refreshPreviewNow();

  const previewDocument = previewFrame.contentDocument;
  await waitForPreviewAssets(previewDocument);

  const sheets = [...previewDocument.querySelectorAll(".sheet")];
  if (!sheets.length) throw new Error("PNG로 저장할 학습지 페이지가 없습니다.");

  const compatibilityStyle = installPngCompatibilityStyle(previewDocument);

  try {
    for (const [index, sheet] of sheets.entries()) {
      const canvas = await captureSheetCanvas(sheet);
      const pageNumber = String(index + 1).padStart(2, "0");
      await downloadCanvasPng(`${selectedLessonId}-page-${pageNumber}.png`, canvas);
    }
  } finally {
    compatibilityStyle.remove();
  }

  setStatus(`PNG ${sheets.length}개 저장 요청 완료`);
}

function field(label, input) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";
  const span = document.createElement("span");
  span.textContent = label;
  wrapper.append(span, input);
  return wrapper;
}

function textInput(value, onInput, placeholder = "") {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value || "";
  input.placeholder = placeholder;
  input.addEventListener("input", () => onInput(input.value));
  return input;
}

function textareaInput(value, onInput, placeholder = "") {
  const input = document.createElement("textarea");
  input.value = value || "";
  input.placeholder = placeholder;
  input.addEventListener("input", () => onInput(input.value));
  return input;
}

function selectInput(value, options, onChange) {
  const select = document.createElement("select");
  for (const [optionValue, label] of options) {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = label;
    option.selected = optionValue === value;
    select.append(option);
  }
  select.addEventListener("change", () => onChange(select.value));
  return select;
}

function row(...children) {
  const wrapper = document.createElement("div");
  wrapper.className = "field-row";
  wrapper.append(...children);
  return wrapper;
}

function updatePageField(page, key, value) {
  page[key] = value;
  renderPageList();
  schedulePreview();
}

function addCommonFields(fragment, page) {
  fragment.append(
    row(
      field("테마", selectInput(page.theme, PAGE_THEMES, (value) => updatePageField(page, "theme", value))),
      field("상단 라벨", textInput(page.kicker, (value) => updatePageField(page, "kicker", value)))
    ),
    field("제목", textInput(page.title, (value) => updatePageField(page, "title", value))),
    field("읽기 문장", textareaInput(page.read, (value) => updatePageField(page, "read", value))),
    field("활동 제목", textInput(page.activityTitle, (value) => updatePageField(page, "activityTitle", value))),
    field("교사용 메모", textareaInput(page.teacherNote, (value) => updatePageField(page, "teacherNote", value))),
    row(
      field("푸터 왼쪽", textInput(page.footerLeft, (value) => updatePageField(page, "footerLeft", value))),
      field("푸터 오른쪽", textInput(page.footerRight, (value) => updatePageField(page, "footerRight", value)))
    )
  );
}

function renderCharacterFields(page) {
  const fragment = document.createDocumentFragment();
  addCommonFields(fragment, page);

  fragment.append(
    field("캐릭터 이미지 경로", textInput(page.image, (value) => updatePageField(page, "image", value))),
    row(
      field("패널 제목", textInput(page.panelTitle, (value) => updatePageField(page, "panelTitle", value))),
      field("글자", textInput(page.letter, (value) => updatePageField(page, "letter", value)))
    ),
    field("소리", textInput(page.sound, (value) => updatePageField(page, "sound", value))),
    field("따라쓰기 글자", textInput((page.trace || []).join(", "), (value) => {
      page.trace = value.split(",").map((item) => item.trim()).filter(Boolean);
      schedulePreview();
    }))
  );

  return fragment;
}

function itemList(label, items, renderItem, createItem) {
  const wrapper = document.createElement("div");
  wrapper.className = "field";
  const title = document.createElement("span");
  title.className = "group-label";
  title.textContent = label;

  const list = document.createElement("div");
  list.className = "item-list";
  items.forEach((item, index) => list.append(renderItem(item, index)));

  const add = document.createElement("button");
  add.type = "button";
  add.className = "add-item";
  add.textContent = "항목 추가";
  add.addEventListener("click", () => {
    items.push(createItem());
    renderActivePageForm();
    schedulePreview();
  });

  wrapper.append(title, list, add);
  return wrapper;
}

function itemCard(title, item, fields, onRemove) {
  const card = document.createElement("div");
  card.className = "item-card";

  const header = document.createElement("div");
  header.className = "item-title";
  const name = document.createElement("span");
  name.textContent = title;
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-item";
  remove.textContent = "삭제";
  remove.addEventListener("click", onRemove);
  header.append(name, remove);

  card.append(header, ...fields);
  return card;
}

function renderCardEditor(card, index, cards) {
  return itemCard(
    `카드 ${index + 1}`,
    card,
    [
      field("라벨", textInput(card.label, (value) => {
        card.label = value;
        schedulePreview();
      })),
      row(
        field("이미지 경로", textInput(card.image || "", (value) => {
          card.image = value;
          if (value) delete card.fill;
          schedulePreview();
        })),
        field("색상 카드", textInput(card.fill || "", (value) => {
          card.fill = value.replace(/^#/, "");
          if (value) delete card.image;
          schedulePreview();
        }, "FFE96B"))
      ),
    ],
    () => {
      cards.splice(index, 1);
      renderActivePageForm();
      schedulePreview();
    }
  );
}

function renderTileEditor(tile, index, tiles) {
  return itemCard(
    `조각 ${index + 1}`,
    tile,
    [
      row(
        field("라벨", textInput(tile.label, (value) => {
          tile.label = value;
          schedulePreview();
        })),
        field("정답", textInput(tile.answer, (value) => {
          tile.answer = value;
          schedulePreview();
        }))
      ),
      row(
        field("이미지 경로", textInput(tile.image || "", (value) => {
          tile.image = value;
          if (value) delete tile.fill;
          schedulePreview();
        })),
        field("색상 카드", textInput(tile.fill || "", (value) => {
          tile.fill = value.replace(/^#/, "");
          if (value) delete tile.image;
          schedulePreview();
        }, "FFE96B"))
      ),
    ],
    () => {
      tiles.splice(index, 1);
      renderActivePageForm();
      schedulePreview();
    }
  );
}

function renderHouseEditor(house, index, houses) {
  return itemCard(
    `집 ${index + 1}`,
    house,
    [
      row(
        field("제목", textInput(house.title, (value) => {
          house.title = value;
          schedulePreview();
        })),
        field("테마", selectInput(house.theme, PAGE_THEMES, (value) => {
          house.theme = value;
          schedulePreview();
        }))
      ),
    ],
    () => {
      houses.splice(index, 1);
      renderActivePageForm();
      schedulePreview();
    }
  );
}

function renderSpotFields(page) {
  const fragment = document.createDocumentFragment();
  addCommonFields(fragment, page);
  fragment.append(
    field("소리 박스", textInput(page.soundBox, (value) => updatePageField(page, "soundBox", value))),
    itemList("단어 카드", page.cards, renderCardEditor, () => ({ label: "새 카드", image: "./assets/dog.png" }))
  );
  return fragment;
}

function renderSortingFields(page) {
  const fragment = document.createDocumentFragment();
  addCommonFields(fragment, page);
  fragment.append(
    itemList("분류 집", page.houses, renderHouseEditor, () => ({ title: "새 집", theme: "gogo" })),
    itemList("오려 붙이는 조각", page.tiles, renderTileEditor, () => ({ label: "새 조각", answer: "ㄱ", image: "./assets/dog.png" }))
  );
  return fragment;
}

function renderActivePageForm() {
  const page = lesson.pages[activePageIndex];
  pageEditorTitle.textContent = `${activePageIndex + 1}장 편집`;
  pageTypeBadge.textContent = PAGE_TYPE_LABELS[page.type] || page.type;
  pageForm.replaceChildren();

  if (page.type === "character") pageForm.append(renderCharacterFields(page));
  if (page.type === "spot") pageForm.append(renderSpotFields(page));
  if (page.type === "sorting") pageForm.append(renderSortingFields(page));
}

function renderPageList() {
  pageList.replaceChildren();
  lesson.pages.forEach((page, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `page-button${index === activePageIndex ? " active" : ""}`;

    const pageNumber = document.createElement("span");
    pageNumber.className = "page-number";
    pageNumber.textContent = String(index + 1);

    const pageName = document.createElement("span");
    pageName.className = "page-name";
    pageName.textContent = page.title || "제목 없음";

    const pageType = document.createElement("span");
    pageType.className = "page-type";
    pageType.textContent = PAGE_TYPE_LABELS[page.type] || page.type;

    button.append(pageNumber, pageName, pageType);
    button.addEventListener("click", () => {
      activePageIndex = index;
      renderPageList();
      renderActivePageForm();
    });
    pageList.append(button);
  });
}

function renderAll() {
  lessonSelect.value = selectedLessonId;
  lessonTitle.value = lesson.title || "";
  renderPageList();
  renderActivePageForm();
  schedulePreview();
}

function renderLessonOptions() {
  lessonSelect.replaceChildren();
  for (const item of lessonCatalog) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.letters ? `${item.title} (${item.letters})` : item.title;
    lessonSelect.append(option);
  }
}

async function loadLessonCatalog() {
  try {
    const response = await fetch(MANIFEST_URL);
    if (!response.ok) throw new Error(`Manifest response ${response.status}`);
    const manifest = await response.json();
    lessonCatalog = manifest.lessons?.length ? manifest.lessons : [FALLBACK_LESSON];
  } catch (error) {
    console.warn("Lesson manifest could not be loaded; using fallback lesson.", error);
    lessonCatalog = [FALLBACK_LESSON];
  }

  selectedLessonId = localStorage.getItem(SELECTED_LESSON_KEY) || lessonCatalog[0].id;
  if (!lessonCatalog.some((item) => item.id === selectedLessonId)) {
    selectedLessonId = lessonCatalog[0].id;
  }
  renderLessonOptions();
}

function selectedLessonMeta() {
  return lessonCatalog.find((item) => item.id === selectedLessonId) || lessonCatalog[0];
}

async function loadLesson({ forceOriginal = false } = {}) {
  const meta = selectedLessonMeta();
  const response = await fetch(meta.worksheetPath);
  if (!response.ok) throw new Error(`Could not load ${meta.worksheetPath}`);
  const sourceLesson = clone(await response.json());
  selectedSourceSignature = sourceSignature(sourceLesson);

  if (!forceOriginal) {
    const savedDraft = loadDraftForSource(
      localStorage,
      storageKeyFor(selectedLessonId),
      sourceSignatureKeyFor(selectedLessonId),
      sourceLesson
    );
    if (savedDraft.status === "hit") {
      lesson = savedDraft.lesson;
      activePageIndex = 0;
      renderAll();
      setStatus("저장된 임시 편집본 불러옴");
      return;
    }
    if (savedDraft.status === "stale") {
      setStatus("원본 JSON이 바뀌어 새 원본을 불러옴");
    }
  }

  lesson = sourceLesson;
  activePageIndex = 0;
  renderAll();
  if (forceOriginal) {
    setStatus("원본 JSON 불러옴");
  }
}

lessonTitle.addEventListener("input", () => {
  lesson.title = lessonTitle.value;
  schedulePreview();
});

lessonSelect.addEventListener("change", async () => {
  selectedLessonId = lessonSelect.value;
  localStorage.setItem(SELECTED_LESSON_KEY, selectedLessonId);
  await loadLesson();
});

downloadJsonButton.addEventListener("click", () => {
  downloadText(`${selectedLessonId}-edited.json`, `${JSON.stringify(lesson, null, 2)}\n`, "application/json;charset=utf-8");
});

downloadHtmlButton.addEventListener("click", () => {
  downloadText(`${selectedLessonId}-edited.html`, renderWorksheetDocument(lesson), "text/html;charset=utf-8");
});

downloadPngButton.addEventListener("click", async () => {
  downloadPngButton.disabled = true;
  setStatus("PNG 생성 중...");

  try {
    await exportPngPages();
  } catch (error) {
    console.error(error);
    setStatus(`PNG 저장 실패: ${error.message}`);
  } finally {
    downloadPngButton.disabled = false;
  }
});

printButton.addEventListener("click", () => {
  previewFrame.contentWindow.focus();
  previewFrame.contentWindow.print();
});

reloadButton.addEventListener("click", async () => {
  if (!confirm("현재 임시 편집본을 버리고 원본 JSON을 다시 불러올까요?")) return;
  clearDraftForLesson(localStorage, storageKeyFor(selectedLessonId), sourceSignatureKeyFor(selectedLessonId));
  await loadLesson({ forceOriginal: true });
});

loadLessonCatalog().then(() => loadLesson()).catch((error) => {
  console.error(error);
  setStatus("학습지 데이터를 불러오지 못했습니다.");
});
