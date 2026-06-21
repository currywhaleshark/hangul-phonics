export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(name, value) {
  if (value === undefined || value === null || value === "") return "";
  return ` ${name}="${escapeHtml(value)}"`;
}

const ASSET_PATH_KEYS = new Set(["image", "heroImage"]);

function defaultDocumentHref() {
  if (typeof globalThis.location?.href === "string") return globalThis.location.href;
  return "http://localhost/";
}

function shouldResolveAssetPath(value) {
  return typeof value === "string" && value && !/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(value);
}

function rootRelativeUrl(url) {
  return `${url.pathname}${url.search}${url.hash}`;
}

export function resolveWorksheetAssetPath(assetPath, assetBaseHref, documentHref = defaultDocumentHref()) {
  if (!assetBaseHref || !shouldResolveAssetPath(assetPath)) return assetPath;

  const baseUrl = new URL(assetBaseHref, documentHref);
  return rootRelativeUrl(new URL(assetPath, baseUrl));
}

export function resolveWorksheetAssetPaths(lesson, assetBaseHref, documentHref = defaultDocumentHref()) {
  if (!assetBaseHref) return lesson;

  const resolvedLesson = JSON.parse(JSON.stringify(lesson));

  function walk(value) {
    if (!value || typeof value !== "object") return;

    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      if (ASSET_PATH_KEYS.has(key) && shouldResolveAssetPath(child)) {
        value[key] = resolveWorksheetAssetPath(child, assetBaseHref, documentHref);
      } else {
        walk(child);
      }
    }
  }

  walk(resolvedLesson);
  return resolvedLesson;
}

function pageFooter(page) {
  return `<div class="page-footer"><span>${escapeHtml(page.footerLeft)}</span><span>${escapeHtml(page.footerRight)}</span></div>`;
}

function imageOrFill(item) {
  if (item.image) {
    return `<div class="spot-image"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.label)}"></div>`;
  }

  return `<div class="spot-image"${attr("style", item.fill ? `background:#${String(item.fill).replace(/^#/, "")}` : "")}>${escapeHtml(item.label)}</div>`;
}

function renderCharacterPage(page) {
  const trace = (page.trace || [])
    .map((letter) => `<div class="trace-cell">${escapeHtml(letter)}</div>`)
    .join("");

  return `
    <section class="sheet theme-${escapeHtml(page.theme)}">
      <div class="sheet-inner">
        <div class="page-kicker">${escapeHtml(page.kicker)}</div>
        <h1>${escapeHtml(page.title)}</h1>
        <div class="hero-grid">
          <div class="character-frame">
            <img src="${escapeHtml(page.image)}" alt="${escapeHtml(page.title)}">
          </div>
          <aside class="letter-panel">
            <h2>${escapeHtml(page.panelTitle)}</h2>
            <div class="big-letter">${escapeHtml(page.letter)}</div>
            <div class="sound-pill">${escapeHtml(page.sound)}</div>
          </aside>
        </div>
        <div class="read-box">${escapeHtml(page.read)}</div>
        <div class="activity-box">
          <div class="activity-title">${escapeHtml(page.activityTitle)}</div>
          <div class="trace-row">${trace}</div>
        </div>
        <div class="teacher-note">${escapeHtml(page.teacherNote)}</div>
        ${pageFooter(page)}
      </div>
    </section>`;
}

function renderSpotPage(page) {
  const cards = (page.cards || [])
    .map(
      (card) => `
            <div class="spot-card"${attr("data-asset", card.image || card.fill || card.label)}>
              ${imageOrFill(card)}
              <strong>${escapeHtml(card.label)}</strong>
            </div>`
    )
    .join("");

  return `
    <section class="sheet theme-${escapeHtml(page.theme)}">
      <div class="sheet-inner">
        <div class="page-kicker">${escapeHtml(page.kicker)}</div>
        <h1>${escapeHtml(page.title)}</h1>
        <div class="read-box">${escapeHtml(page.read)}</div>
        <div class="activity-box">
          <div class="activity-title">${escapeHtml(page.activityTitle)}</div>
          <div class="spot-grid">${cards}</div>
        </div>
        <div class="read-box">${escapeHtml(page.soundBox)}</div>
        <div class="teacher-note">${escapeHtml(page.teacherNote)}</div>
        ${pageFooter(page)}
      </div>
    </section>`;
}

function renderSortingPage(page) {
  const housesCount = (page.houses || []).length || 2;
  const compactClass = housesCount > 2 ? " sorting-compact" : "";
  const houses = (page.houses || [])
    .map(
      (house) => `
          <div class="house" style="--house-color: var(--${escapeHtml(house.theme)})">
            <div class="house-title">${escapeHtml(house.title)}</div>
            <div class="drop-zone"></div>
          </div>`
    )
    .join("");

  const tiles = (page.tiles || [])
    .map(
      (tile) => `
            <div class="cut-tile"${attr("data-answer", tile.answer)}${attr("data-asset", tile.image || tile.fill || tile.label)}>
              ${imageOrFill(tile)}
              <strong>${escapeHtml(tile.label)}</strong>
            </div>`
    )
    .join("");

  return `
    <section class="sheet theme-${escapeHtml(page.theme)}">
      <div class="sheet-inner${compactClass}">
        <div class="page-kicker">${escapeHtml(page.kicker)}</div>
        <h1>${escapeHtml(page.title)}</h1>
        <div class="read-box">${escapeHtml(page.read)}</div>
        <div class="sorting-board" style="--house-count:${housesCount}">${houses}</div>
        <div class="activity-box">
          <div class="activity-title">${escapeHtml(page.activityTitle)}</div>
          <div class="tile-bank" style="--tile-columns:${page.tileColumns || 4}">${tiles}</div>
        </div>
        <div class="teacher-note">${escapeHtml(page.teacherNote)}</div>
        ${pageFooter(page)}
      </div>
    </section>`;
}

function renderStoryPage(page) {
  const gridClass = (page.panels || []).length > 3 ? "story-grid story-grid-four" : "story-grid";
  const panels = (page.panels || [])
    .map(
      (panel, index) => `
          <figure class="story-panel"${attr("data-asset", panel.image || panel.caption)}>
            <div class="story-image"><img src="${escapeHtml(panel.image)}" alt="${escapeHtml(panel.caption)}"></div>
            <figcaption><span>${index + 1}</span>${escapeHtml(panel.caption)}</figcaption>
          </figure>`
    )
    .join("");

  return `
    <section class="sheet theme-${escapeHtml(page.theme)}">
      <div class="sheet-inner">
        <div class="page-kicker">${escapeHtml(page.kicker)}</div>
        <h1>${escapeHtml(page.title)}</h1>
        <div class="read-box">${escapeHtml(page.read)}</div>
        <div class="${gridClass}">${panels}</div>
        <div class="teacher-note">${escapeHtml(page.teacherNote)}</div>
        ${pageFooter(page)}
      </div>
    </section>`;
}

function renderSoundSteps(page) {
  const soundSteps = page.soundSteps || [];
  if (!soundSteps.length) return "";

  return `
          <div class="sound-step-list" aria-label="소리 합치기">
            ${soundSteps
              .map(
                (step) => `<div class="sound-step">
              <div class="sound-step-label">${escapeHtml(step.label)}</div>
              <div class="sound-step-sound">${escapeHtml(step.sound)}</div>
            </div>`
              )
              .join("")}
          </div>`;
}

function buildFormula(buildPieces = []) {
  const [lead = "", vowel = "", result = ""] = buildPieces;
  return { lead, vowel, result, expression: `${lead} + ${vowel}`.trim() };
}

function renderVowelActivityPage(page) {
  const { lead, vowel, result } = buildFormula(page.buildPieces || ["ㅇ", "ㅏ", "아"]);
  const hasSoundSteps = (page.soundSteps || []).length > 0;
  const soundStepBlock = renderSoundSteps(page);

  return `
    <section class="sheet theme-${escapeHtml(page.theme)}${hasSoundSteps ? " has-sound-steps" : ""}">
      <div class="sheet-inner">
        <div class="page-kicker">${escapeHtml(page.kicker)}</div>
        <h1>${escapeHtml(page.title)}</h1>
        <div class="read-box">${escapeHtml(page.read)}</div>
        <div class="activity-box">
          <div class="activity-title">${escapeHtml(page.activityTitle)}</div>
          <div class="vowel-activity-grid">
            <div class="vowel-hero">
              <img src="${escapeHtml(page.heroImage)}" alt="${escapeHtml(page.title)}">
            </div>
            <div class="finger-trace-card">
              <div class="finger-trace-label">손가락으로 따라가요</div>
              <div class="finger-trace-letter">${escapeHtml(page.traceLetter)}</div>
            </div>
          </div>${soundStepBlock}
          <div class="vowel-build-row" aria-label="${escapeHtml(`${lead} + ${vowel} = ${result}`)}">
            <div class="build-piece">${escapeHtml(lead)}</div>
            <div class="build-operator">+</div>
            <div class="build-piece">${escapeHtml(vowel)}</div>
            <div class="build-operator">=</div>
            <div class="build-result">${escapeHtml(result)}</div>
          </div>
        </div>
        <div class="teacher-note">${escapeHtml(page.teacherNote)}</div>
        ${pageFooter(page)}
      </div>
    </section>`;
}

function renderWordCardText(card, page) {
  if (Array.isArray(card.parts) && card.parts.length > 0) {
    return card.parts
      .map((part) => {
        const className = part.focus ? "word-card-focus" : "word-card-rest";
        return `<span class="${className}">${escapeHtml(part.text || "")}</span>`;
      })
      .join("");
  }

  return `<span class="word-card-focus">${escapeHtml(card.focus || page.focus || "")}</span><span class="word-card-rest">${escapeHtml(card.rest || "")}</span>`;
}

function renderWordCardPage(page) {
  const cardItems = page.cards || [];
  const gridClasses = ["word-card-grid"];
  if (cardItems.length >= 7) gridClasses.push("word-card-grid-compact");
  if (cardItems.length >= 10) gridClasses.push("word-card-grid-dense");
  const gridClass = gridClasses.join(" ");
  const cards = cardItems
    .map((card) => {
      const word = card.word || (Array.isArray(card.parts) ? card.parts.map((part) => part.text || "").join("") : `${card.focus || page.focus || ""}${card.rest || ""}`);
      return `
            <div class="word-card-tile"${attr("data-asset", card.image || word)}>
              <div class="word-card-picture"><img src="${escapeHtml(card.image)}" alt="${escapeHtml(word)} 그림"></div>
              <div class="word-card-word">${renderWordCardText(card, page)}</div>
            </div>`;
    })
    .join("");

  return `
    <section class="sheet theme-${escapeHtml(page.theme)} word-card-sheet">
      <div class="sheet-inner">
        <div class="page-kicker">${escapeHtml(page.kicker)}</div>
        <h1>${escapeHtml(page.title)}</h1>
        <div class="read-box">${escapeHtml(page.read)}</div>
        <div class="activity-box word-card-activity">
          <div class="activity-title">${escapeHtml(page.activityTitle)}</div>
          <div class="${gridClass}">${cards}</div>
        </div>
        <div class="teacher-note">${escapeHtml(page.teacherNote)}</div>
        ${pageFooter(page)}
      </div>
    </section>`;
}
function renderSoundChoicePage(page) {
  const choices = page.choices || [];
  const prompts = page.prompts || [];
  const choiceCards = choices
    .map((choice) => {
      const { result, expression } = buildFormula(choice.buildPieces || []);
      const image = choice.image
        ? `<div class="sound-choice-image"><img src="${escapeHtml(choice.image)}" alt="${escapeHtml(choice.label || result)} 그림"></div>`
        : "";
      return `
              <div class="sound-choice-card">
                ${image}
                <div class="sound-choice-formula">${escapeHtml(expression)}</div>
                <strong>${escapeHtml(choice.label || result)}</strong>
              </div>`;
    })
    .join("");
  const promptRows = prompts
    .map(
      (prompt) => `
            <div class="sound-choice-prompt"${attr("data-answer", prompt.answer)}>
              <div class="sound-choice-prompt-label">${escapeHtml(prompt.label)} 소리</div>
              <div class="sound-choice-options">${choiceCards}</div>
            </div>`
    )
    .join("");

  return `
    <section class="sheet theme-${escapeHtml(page.theme)} sound-choice-sheet">
      <div class="sheet-inner">
        <div class="page-kicker">${escapeHtml(page.kicker)}</div>
        <h1>${escapeHtml(page.title)}</h1>
        <div class="read-box">${escapeHtml(page.read)}</div>
        <div class="activity-box">
          <div class="activity-title">${escapeHtml(page.activityTitle)}</div>
          <div class="sound-choice-grid">${promptRows}</div>
        </div>
        <div class="teacher-note">${escapeHtml(page.teacherNote)}</div>
        ${pageFooter(page)}
      </div>
    </section>`;
}

export function renderWorksheetPage(page) {
  if (page.type === "character") return renderCharacterPage(page);
  if (page.type === "spot") return renderSpotPage(page);
  if (page.type === "sorting") return renderSortingPage(page);
  if (page.type === "story") return renderStoryPage(page);
  if (page.type === "vowel-activity") return renderVowelActivityPage(page);
  if (page.type === "word-card") return renderWordCardPage(page);
  if (page.type === "sound-choice") return renderSoundChoicePage(page);
  throw new Error(`Unsupported worksheet page type: ${page.type}`);
}

export function renderWorksheetBody(lesson) {
  return (lesson.pages || []).map((page) => renderWorksheetPage(page)).join("\n");
}

export function renderWorksheetDocument(lesson, options = {}) {
  const cssHref = options.cssHref || "./pilot-a4.css";
  const renderedLesson = resolveWorksheetAssetPaths(lesson, options.assetBaseHref, options.documentHref);

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(renderedLesson.title || "A4 worksheet")}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Jua&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${escapeHtml(cssHref)}">
  </head>
  <body>
    <div class="toolbar">
      <strong>${escapeHtml(renderedLesson.title || "A4 worksheet")}</strong>
      JSON 데이터로 생성한 인쇄용 A4 학습지입니다.
    </div>
${renderWorksheetBody(renderedLesson)}
  </body>
</html>
`;
}
