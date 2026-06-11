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
      <div class="sheet-inner">
        <div class="page-kicker">${escapeHtml(page.kicker)}</div>
        <h1>${escapeHtml(page.title)}</h1>
        <div class="read-box">${escapeHtml(page.read)}</div>
        <div class="sorting-board">${houses}</div>
        <div class="activity-box">
          <div class="activity-title">${escapeHtml(page.activityTitle)}</div>
          <div class="tile-bank">${tiles}</div>
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
  throw new Error(`Unsupported worksheet page type: ${page.type}`);
}

export function renderWorksheetBody(lesson) {
  return (lesson.pages || []).map((page) => renderWorksheetPage(page)).join("\n");
}

export function renderWorksheetDocument(lesson, options = {}) {
  const cssHref = options.cssHref || "./pilot-a4.css";

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(lesson.title || "A4 worksheet")}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Jua&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${escapeHtml(cssHref)}">
  </head>
  <body>
    <div class="toolbar">
      <strong>${escapeHtml(lesson.title || "A4 worksheet")}</strong>
      JSON 데이터로 생성한 인쇄용 A4 학습지입니다.
    </div>
${renderWorksheetBody(lesson)}
  </body>
</html>
`;
}
