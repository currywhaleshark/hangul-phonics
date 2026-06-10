// --- Application State ---
const DEFAULT_CARDS = [
  { id: 'ㄱ', consonant: 'ㄱ', file: '고고 고양이.png', label: '고고 고양이' },
  { id: 'ㄴ', consonant: 'ㄴ', file: '나나 나비.png', label: '나나 나비' },
  { id: 'ㄷ', consonant: 'ㄷ', file: '도도 도토리.png', label: '도도 도토리' },
  { id: 'ㄹ', consonant: 'ㄹ', file: '라라 리본.png', label: '라라 리본' },
  { id: 'ㅁ', consonant: 'ㅁ', file: '미미 문어.png', label: '미미 문어' },
  { id: 'ㅂ', consonant: 'ㅂ', file: '부부 부엉이.png', label: '부부 부엉이' },
  { id: 'ㅅ', consonant: 'ㅅ', file: '사사 사슴.png', label: '사사 사슴' },
  { id: 'ㅇ', consonant: 'ㅇ', file: '아아 아기.png', label: '아아 아기' },
  { id: 'ㅈ', consonant: 'ㅈ', file: '지지 지렁이.png', label: '지지 지렁이' },
  { id: 'ㅊ', consonant: 'ㅊ', file: '치치 칙폭이.png', label: '치치 칙폭이' },
  { id: 'ㅋ', consonant: 'ㅋ', file: '코코 코알라.png', label: '코코 코알라' },
  { id: 'ㅌ', consonant: 'ㅌ', file: '토토 토끼.png', label: '토토 토끼' },
  { id: 'ㅍ', consonant: 'ㅍ', file: '푸푸 풍선.png', label: '푸푸 풍선' },
  { id: 'ㅎ', consonant: 'ㅎ', file: '하하 하마.png', label: '하하 하마' }
];

const VOWEL_CARDS = [
  { id: 'ㅏ', consonant: 'ㅏ', file: '아아 나뭇가지.png', label: '아아 나뭇가지' },
  { id: 'ㅓ', consonant: 'ㅓ', file: '어어 풍선.png', label: '어어 풍선' },
  { id: 'ㅗ', consonant: 'ㅗ', file: '오오 상자.png', label: '오오 상자' },
  { id: 'ㅜ', consonant: 'ㅜ', file: '우우 발판.png', label: '우우 발판' },
  { id: 'ㅠ', consonant: 'ㅠ', file: '유유 의자.png', label: '유유 의자' },
  { id: 'ㅛ', consonant: 'ㅛ', file: '요요 그네.png', label: '요요 그네' },
  { id: 'ㅡ', consonant: 'ㅡ', file: '으으 쿠션.png', label: '으으 쿠션' },
  { id: 'ㅣ', consonant: 'ㅣ', file: '이이 막대.png', label: '이이 막대' }
];

const CARD_SETS = {
  consonants: DEFAULT_CARDS,
  vowels: VOWEL_CARDS,
  all: [...DEFAULT_CARDS, ...VOWEL_CARDS]
};

const CARD_MODE_SUBTITLES = {
  consonants: '자음순 브로마이드',
  vowels: '모음 브로마이드',
  all: '자음·모음 브로마이드'
};

const ALL_CARD_IMAGES = [...new Map(CARD_SETS.all.map(card => [card.file, card])).values()];

function cloneCards(cards) {
  return cards.map(card => ({ ...card }));
}

function cardsForMode(mode) {
  return cloneCards(CARD_SETS[mode] || DEFAULT_CARDS);
}

let currentCards = cardsForMode('consonants');

const THEME_PRESETS = {
  warm: {
    bg: '#FFF5E0',
    border: '#F4AB46',
    title: '#392A22',
    subtitle: '#7C6552',
    badgeBg: '#F4AB46',
    badgeText: '#FFFFFF'
  },
  pastel: {
    bg: '#F0F4F8',
    border: '#87A9C7',
    title: '#2C3E50',
    subtitle: '#576F86',
    badgeBg: '#87A9C7',
    badgeText: '#FFFFFF'
  },
  forest: {
    bg: '#EBF3E8',
    border: '#86A789',
    title: '#3A4D39',
    subtitle: '#5F7161',
    badgeBg: '#86A789',
    badgeText: '#FFFFFF'
  },
  strawberry: {
    bg: '#FFF0F0',
    border: '#FF8E9E',
    title: '#5C3D42',
    subtitle: '#8B5E66',
    badgeBg: '#FF8E9E',
    badgeText: '#FFFFFF'
  },
  dark: {
    bg: '#2D2727',
    border: '#D5B4B4',
    title: '#F3EFEF',
    subtitle: '#D5B4B4',
    badgeBg: '#D5B4B4',
    badgeText: '#2D2727'
  }
};

const A2_PORTRAIT = { w: 4961, h: 7016 };
const A2_LANDSCAPE = { w: 7016, h: 4961 };

const state = {
  layout: 'portrait', // 'portrait' | 'landscape'
  cardMode: 'consonants',
  cols: 4,
  rows: 4,
  title: '한글 파닉스',
  subtitle: '자음순 브로마이드',
  colors: { ...THEME_PRESETS.warm },
  margin: 250,
  gap: 56,
  titleH: 620,
  fontFamily: "'Gowun Dodum'",
  titleAlign: 'left',
  titleFontSize: 210,
  subtitleFontSize: 72,
  titleSubGap: 40,
  badgeFontSize: 84,
  badgeBgSize: 100,
  previewScale: 0.25 // Scale down for canvas preview performance
};

const imageCache = {};
let isLoaded = false;
let renderPending = false;

// --- DOM Elements ---
const canvas = document.getElementById('preview-canvas');
const ctx = canvas.getContext('2d');
const previewStatus = document.getElementById('preview-status');
const spanRes = document.getElementById('span-res');

const inputTitle = document.getElementById('input-title');
const inputSubtitle = document.getElementById('input-subtitle');

const btnDownload = document.getElementById('btn-download');
const btnReset = document.getElementById('btn-reset');
const btnAddBlank = document.getElementById('btn-add-blank');
const btnClearBlanks = document.getElementById('btn-clear-blanks');

const layoutPortraitBtn = document.getElementById('layout-portrait');
const layoutLandscapeBtn = document.getElementById('layout-landscape');

const inputCols = document.getElementById('input-cols');
const inputRows = document.getElementById('input-rows');

const rangeMargin = document.getElementById('range-margin');
const rangeGap = document.getElementById('range-gap');
const rangeTitleH = document.getElementById('range-title-h');

const valMargin = document.getElementById('val-margin');
const valGap = document.getElementById('val-gap');
const valTitleH = document.getElementById('val-title-h');

const colorBg = document.getElementById('color-bg');
const colorBorder = document.getElementById('color-border');
const colorTitle = document.getElementById('color-title');
const colorSubtitle = document.getElementById('color-subtitle');
const colorBadgeBg = document.getElementById('color-badge-bg');
const colorBadgeText = document.getElementById('color-badge-text');
const colorTitleQuick = document.getElementById('color-title-quick');
const colorSubtitleQuick = document.getElementById('color-subtitle-quick');

// Typography Controls
const selectFontFamily = document.getElementById('select-font-family');
const titleAlignControls = document.getElementById('title-align-controls');
const cardModeControls = document.getElementById('card-mode-controls');
const rangeTitleSize = document.getElementById('range-title-size');
const valTitleSize = document.getElementById('val-title-size');
const rangeSubtitleSize = document.getElementById('range-subtitle-size');
const valSubtitleSize = document.getElementById('val-subtitle-size');
const rangeTitleSubGap = document.getElementById('range-title-sub-gap');
const valTitleSubGap = document.getElementById('val-title-sub-gap');
const rangeBadgeSize = document.getElementById('range-badge-size');
const valBadgeSize = document.getElementById('val-badge-size');
const rangeBadgeBgSize = document.getElementById('range-badge-bg-size');
const valBadgeBgSize = document.getElementById('val-badge-bg-size');

const cardSortableList = document.getElementById('card-sortable-list');

// --- Image Preloading ---
async function preloadImages() {
  showStatus('이미지 로딩 중...');
  const promises = ALL_CARD_IMAGES.map(card => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = encodeURI(card.file);
      img.onload = () => {
        imageCache[card.file] = img;
        resolve();
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${card.file}`);
        resolve(); // Resolve anyway to not block app
      };
    });
  });

  await Promise.all(promises);
  isLoaded = true;
  hideStatus();
}

// --- Status Info ---
function showStatus(text) {
  previewStatus.innerHTML = `<span class="spinner"></span> ${text}`;
  previewStatus.classList.add('visible');
}

function hideStatus() {
  previewStatus.classList.remove('visible');
}

// --- Drag and Drop Sorting ---
function initDragAndDrop() {
  cardSortableList.addEventListener('dragover', e => {
    e.preventDefault();
    const draggingItem = cardSortableList.querySelector('.dragging');
    if (!draggingItem) return;

    const siblings = [...cardSortableList.querySelectorAll('li:not(.dragging)')];
    const nextSibling = siblings.find(sibling => {
      return e.clientY <= sibling.getBoundingClientRect().top + sibling.getBoundingClientRect().height / 2;
    });

    cardSortableList.insertBefore(draggingItem, nextSibling);
  });

  cardSortableList.addEventListener('dragend', () => {
    // Sync array state with DOM order
    const domItems = [...cardSortableList.querySelectorAll('li')];
    const newCards = domItems.map(item => {
      const index = parseInt(item.dataset.index);
      return currentCards[index];
    });

    currentCards = newCards;
    renderCardList();
    scheduleRender();
  });
}

// --- Render Card List in Sidebar ---
function renderCardList() {
  cardSortableList.innerHTML = '';
  
  currentCards.forEach((card, index) => {
    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.index = index;
    
    if (card.consonant === null) {
      li.className = 'blank-item';
      li.innerHTML = `
        <span class="drag-handle">☰</span>
        <div class="card-thumb"></div>
        <div class="card-info">
          <span class="card-title">빈 칸 (여백)</span>
          <span class="card-meta">레이아웃 조절용 공백</span>
        </div>
        <button class="btn-remove-card" data-index="${index}" title="삭제">✕</button>
      `;
    } else {
      li.innerHTML = `
        <span class="drag-handle">☰</span>
        <div class="card-thumb" style="background-image: url('${encodeURI(card.file)}')"></div>
        <div class="card-info">
          <span class="card-title">
            <span class="card-char-badge" style="background-color: ${state.colors.badgeBg}; color: ${state.colors.badgeText}">${card.consonant}</span>
            ${card.label}
          </span>
          <span class="card-meta">${card.file}</span>
        </div>
        <button class="btn-remove-card" data-index="${index}" title="삭제">✕</button>
      `;
    }

    // Drag start listener
    li.addEventListener('dragstart', () => {
      li.classList.add('dragging');
    });

    // Delete handler
    li.querySelector('.btn-remove-card').addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(e.target.dataset.index);
      currentCards.splice(idx, 1);
      renderCardList();
      scheduleRender();
    });

    cardSortableList.appendChild(li);
  });
}

// --- Canvas Drawing Logic ---
function drawDashedRoundRect(ctx, x, y, w, h, radius, dash, gap, outline, width) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  
  if (outline && width > 0) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = width;
    ctx.setLineDash([dash, gap]);
    ctx.stroke();
    ctx.setLineDash([]); // Reset
  }
}

function drawPoster(targetCanvas, scale) {
  const isPortrait = state.layout === 'portrait';
  const size = isPortrait ? A2_PORTRAIT : A2_LANDSCAPE;
  
  const W = size.w * scale;
  const H = size.h * scale;
  
  targetCanvas.width = W;
  targetCanvas.height = H;
  
  const targetCtx = targetCanvas.getContext('2d');
  
  // Fill background
  targetCtx.fillStyle = state.colors.bg;
  targetCtx.fillRect(0, 0, W, H);
  
  // Outer Border
  const borderMargin = (state.margin / 2) * scale;
  const borderWidth = 18 * scale;
  const borderDash = 78 * scale;
  const borderGap = 44 * scale;
  const borderRadius = 90 * scale;
  
  drawDashedRoundRect(
    targetCtx, 
    borderMargin, 
    borderMargin, 
    W - borderMargin * 2, 
    H - borderMargin * 2, 
    borderRadius,
    borderDash,
    borderGap,
    state.colors.border,
    borderWidth
  );
  
  // Title text
  targetCtx.textAlign = state.titleAlign;
  targetCtx.textBaseline = 'top';
  const titleXByAlign = {
    left: state.margin * scale,
    center: W / 2,
    right: W - state.margin * scale
  };
  const titleX = titleXByAlign[state.titleAlign] ?? titleXByAlign.left;
  
  // Draw Main Title
  targetCtx.font = `bold ${state.titleFontSize * scale}px ${state.fontFamily}, 'Malgun Gothic', sans-serif`;
  targetCtx.fillStyle = state.colors.title;
  targetCtx.fillText(state.title, titleX, state.margin * scale);
  
  // Draw Subtitle
  targetCtx.font = `${state.subtitleFontSize * scale}px ${state.fontFamily}, 'Malgun Gothic', sans-serif`;
  targetCtx.fillStyle = state.colors.subtitle;
  const subtitleY = (state.margin + state.titleFontSize + state.titleSubGap) * scale;
  const subtitleOffset = state.titleAlign === 'left' ? 8 * scale : state.titleAlign === 'right' ? -8 * scale : 0;
  targetCtx.fillText(state.subtitle, titleX + subtitleOffset, subtitleY);
  
  // Grid layout parameters
  const rows = parseInt(state.rows);
  const cols = parseInt(state.cols);
  const marginPx = state.margin * scale;
  const titleHPx = state.titleH * scale;
  const gapPx = state.gap * scale;
  
  const gridX = marginPx;
  const gridY = marginPx + titleHPx;
  const gridW = W - marginPx * 2;
  const gridH = H - gridY - marginPx;
  
  const cellW = (gridW - gapPx * (cols - 1)) / cols;
  const cellH = (gridH - gapPx * (rows - 1)) / rows;
  
  // Draw grid cards
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const x = gridX + c * (cellW + gapPx);
      const y = gridY + r * (cellH + gapPx);
      
      if (index >= currentCards.length) {
        // Draw empty box for overflow slots
        drawEmptyCell(targetCtx, x, y, cellW, cellH, scale);
        continue;
      }
      
      const card = currentCards[index];
      if (card.consonant === null) {
        // Draw empty box
        drawEmptyCell(targetCtx, x, y, cellW, cellH, scale);
      } else {
        // Draw character card
        drawCardCell(targetCtx, card, x, y, cellW, cellH, scale);
      }
    }
  }
}

function drawEmptyCell(ctx, x, y, w, h, scale) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 32 * scale);
  
  // Pastel yellow/orange empty container matching python script (255, 245, 224)
  ctx.fillStyle = 'rgba(255, 245, 224, 0.6)';
  ctx.fill();
  
  // Outline (238, 204, 148)
  ctx.strokeStyle = '#EECC94';
  ctx.lineWidth = 8 * scale;
  ctx.setLineDash([16 * scale, 10 * scale]);
  ctx.stroke();
  ctx.setLineDash([]); // Reset
}

function drawCardCell(ctx, card, x, y, w, h, scale) {
  // First, draw cell background (White)
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16 * scale);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  
  // Card Shadow (Subtle)
  ctx.shadowColor = 'rgba(60, 51, 46, 0.08)';
  ctx.shadowBlur = 12 * scale;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4 * scale;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16 * scale);
  ctx.stroke; // dummy call
  ctx.shadowColor = 'transparent'; // Reset shadow
  
  // Draw card image centered (contain)
  const img = imageCache[card.file];
  if (img) {
    const fitScale = Math.min(w / img.width, h / img.height);
    const imgW = img.width * fitScale;
    const imgH = img.height * fitScale;
    const imgX = x + (w - imgW) / 2;
    const imgY = y + (h - imgH) / 2;
    
    // Draw the image
    ctx.drawImage(img, imgX, imgY, imgW, imgH);
  }
  
  // Draw Consonant Badge (Circle) at top left
  const badgeSize = state.badgeBgSize * scale;
  const badgeX = x + 26 * scale;
  const badgeY = y + 26 * scale;
  const badgeRadius = (state.badgeBgSize / 2) * scale;
  
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, badgeRadius);
  ctx.fillStyle = state.colors.badgeBg;
  ctx.fill();
  
  // Draw Consonant Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${state.badgeFontSize * scale}px ${state.fontFamily}, 'Malgun Gothic', sans-serif`;
  ctx.fillStyle = state.colors.badgeText;
  ctx.fillText(card.consonant, badgeX + badgeSize / 2, badgeY + badgeSize / 2 - 4 * scale);
}

// --- Schedule Render (Debounce for smooth preview) ---
function scheduleRender() {
  if (renderPending) return;
  renderPending = true;
  requestAnimationFrame(() => {
    if (isLoaded) {
      drawPoster(canvas, state.previewScale);
    }
    renderPending = false;
  });
}

// --- Update UI with Current Colors ---
function updateColorInputs() {
  colorBg.value = state.colors.bg;
  colorBorder.value = state.colors.border;
  colorTitle.value = state.colors.title;
  colorSubtitle.value = state.colors.subtitle;
  colorBadgeBg.value = state.colors.badgeBg;
  colorBadgeText.value = state.colors.badgeText;
  colorTitleQuick.value = state.colors.title;
  colorSubtitleQuick.value = state.colors.subtitle;

  // Text representation update
  document.querySelectorAll('.color-picker-item').forEach(item => {
    const input = item.querySelector('input');
    const textSpan = item.querySelector('.color-value');
    if (input && textSpan) {
      textSpan.textContent = input.value.toUpperCase();
    }
  });
}

function updateTitleAlignControls() {
  titleAlignControls.querySelectorAll('.segment-btn').forEach(button => {
    button.classList.toggle('active', button.dataset.align === state.titleAlign);
  });
}

function updateCardModeControls() {
  cardModeControls.querySelectorAll('.segment-btn').forEach(button => {
    button.classList.toggle('active', button.dataset.cardMode === state.cardMode);
  });
}

function fitRowsToCurrentCards() {
  const cols = Math.max(1, parseInt(state.cols) || 1);
  const neededRows = Math.max(1, Math.ceil(currentCards.length / cols));
  state.rows = Math.min(10, neededRows);
  inputRows.value = state.rows;
}

function updateSubtitleForMode(previousMode) {
  const previousDefault = CARD_MODE_SUBTITLES[previousMode];
  if (!state.subtitle || state.subtitle === previousDefault) {
    state.subtitle = CARD_MODE_SUBTITLES[state.cardMode];
    inputSubtitle.value = state.subtitle;
  }
}

// --- Apply Selected Theme Preset ---
function applyTheme(themeName) {
  const preset = THEME_PRESETS[themeName];
  if (preset) {
    state.colors = { ...preset };
    updateColorInputs();
    
    // Update active state in UI
    document.querySelectorAll('.theme-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.theme === themeName);
    });
    
    scheduleRender();
    renderCardList(); // To update badge colors in the sidebar
  }
}

// --- Event Handlers ---
function initEvents() {
  // Title Inputs
  inputTitle.addEventListener('input', e => {
    state.title = e.target.value;
    scheduleRender();
  });
  
  inputSubtitle.addEventListener('input', e => {
    state.subtitle = e.target.value;
    scheduleRender();
  });
  
  // Font Controls
  selectFontFamily.addEventListener('change', e => {
    state.fontFamily = e.target.value;
    scheduleRender();
  });

  titleAlignControls.addEventListener('click', e => {
    const button = e.target.closest('.segment-btn');
    if (!button) return;

    state.titleAlign = button.dataset.align;
    updateTitleAlignControls();
    scheduleRender();
  });

  cardModeControls.addEventListener('click', e => {
    const button = e.target.closest('.segment-btn');
    if (!button) return;

    const previousMode = state.cardMode;
    state.cardMode = button.dataset.cardMode;
    currentCards = cardsForMode(state.cardMode);
    updateSubtitleForMode(previousMode);
    fitRowsToCurrentCards();
    updateCardModeControls();
    renderCardList();
    scheduleRender();
  });
  
  rangeTitleSize.addEventListener('input', e => {
    state.titleFontSize = parseInt(e.target.value);
    valTitleSize.textContent = `${state.titleFontSize}px`;
    scheduleRender();
  });

  rangeSubtitleSize.addEventListener('input', e => {
    state.subtitleFontSize = parseInt(e.target.value);
    valSubtitleSize.textContent = `${state.subtitleFontSize}px`;
    scheduleRender();
  });

  rangeBadgeSize.addEventListener('input', e => {
    state.badgeFontSize = parseInt(e.target.value);
    valBadgeSize.textContent = `${state.badgeFontSize}px`;
    scheduleRender();
  });

  rangeTitleSubGap.addEventListener('input', e => {
    state.titleSubGap = parseInt(e.target.value);
    valTitleSubGap.textContent = `${state.titleSubGap}px`;
    scheduleRender();
  });

  rangeBadgeBgSize.addEventListener('input', e => {
    state.badgeBgSize = parseInt(e.target.value);
    valBadgeBgSize.textContent = `${state.badgeBgSize}px`;
    scheduleRender();
  });

  // Layout Selectors
  layoutPortraitBtn.addEventListener('click', () => {
    state.layout = 'portrait';
    layoutPortraitBtn.classList.add('active');
    layoutLandscapeBtn.classList.remove('active');
    
    // Update grid defaults
    state.cols = 4;
    inputCols.value = 4;
    fitRowsToCurrentCards();
    
    // Sliders
    state.titleH = 620;
    state.gap = 56;
    rangeTitleH.value = 620;
    rangeGap.value = 56;
    valTitleH.textContent = '620px';
    valGap.textContent = '56px';
    
    spanRes.textContent = `${A2_PORTRAIT.w} x ${A2_PORTRAIT.h} (A2 300 DPI)`;
    
    scheduleRender();
  });
  
  layoutLandscapeBtn.addEventListener('click', () => {
    state.layout = 'landscape';
    layoutLandscapeBtn.classList.add('active');
    layoutPortraitBtn.classList.remove('active');
    
    // Update grid defaults
    state.cols = 7;
    inputCols.value = 7;
    fitRowsToCurrentCards();
    
    // Sliders
    state.titleH = 560;
    state.gap = 46;
    rangeTitleH.value = 560;
    rangeGap.value = 46;
    valTitleH.textContent = '560px';
    valGap.textContent = '46px';
    
    spanRes.textContent = `${A2_LANDSCAPE.w} x ${A2_LANDSCAPE.h} (A2 300 DPI)`;
    
    scheduleRender();
  });
  
  // Grid Inputs
  inputCols.addEventListener('change', e => {
    state.cols = Math.max(1, parseInt(e.target.value) || 1);
    e.target.value = state.cols;
    fitRowsToCurrentCards();
    scheduleRender();
  });
  
  inputRows.addEventListener('change', e => {
    state.rows = Math.max(1, parseInt(e.target.value) || 1);
    e.target.value = state.rows;
    scheduleRender();
  });
  
  // Sliders
  rangeMargin.addEventListener('input', e => {
    state.margin = parseInt(e.target.value);
    valMargin.textContent = `${state.margin}px`;
    scheduleRender();
  });
  
  rangeGap.addEventListener('input', e => {
    state.gap = parseInt(e.target.value);
    valGap.textContent = `${state.gap}px`;
    scheduleRender();
  });
  
  rangeTitleH.addEventListener('input', e => {
    state.titleH = parseInt(e.target.value);
    valTitleH.textContent = `${state.titleH}px`;
    scheduleRender();
  });
  
  // Color Pickers
  const handleColorChange = (key, val) => {
    state.colors[key] = val;
    // Remove active theme chips since it's customized now
    document.querySelectorAll('.theme-chip').forEach(chip => chip.classList.remove('active'));
    updateColorInputs();
    scheduleRender();
    if (key === 'badgeBg' || key === 'badgeText') {
      renderCardList(); // To update badge styles in list
    }
  };
  
  colorBg.addEventListener('input', e => handleColorChange('bg', e.target.value));
  colorBorder.addEventListener('input', e => handleColorChange('border', e.target.value));
  colorTitle.addEventListener('input', e => handleColorChange('title', e.target.value));
  colorSubtitle.addEventListener('input', e => handleColorChange('subtitle', e.target.value));
  colorTitleQuick.addEventListener('input', e => handleColorChange('title', e.target.value));
  colorSubtitleQuick.addEventListener('input', e => handleColorChange('subtitle', e.target.value));
  colorBadgeBg.addEventListener('input', e => handleColorChange('badgeBg', e.target.value));
  colorBadgeText.addEventListener('input', e => handleColorChange('badgeText', e.target.value));
  
  // Theme Presets
  document.querySelectorAll('.theme-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      applyTheme(chip.dataset.theme);
    });
  });
  
  // Blank Cell Management
  btnAddBlank.addEventListener('click', () => {
    currentCards.push({
      id: 'blank-' + Date.now() + Math.random(),
      consonant: null,
      file: null,
      label: '빈 칸'
    });
    renderCardList();
    scheduleRender();
  });
  
  btnClearBlanks.addEventListener('click', () => {
    currentCards = currentCards.filter(card => card.consonant !== null);
    renderCardList();
    scheduleRender();
  });
  
  // Reset Action
  btnReset.addEventListener('click', () => {
    if (confirm('모든 설정을 초기값으로 되돌리시겠습니까?')) {
      state.cardMode = 'consonants';
      currentCards = cardsForMode(state.cardMode);
      state.layout = 'portrait';
      state.cols = 4;
      state.rows = 4;
      state.title = '한글 파닉스';
      state.subtitle = '자음순 브로마이드';
      state.margin = 250;
      state.gap = 56;
      state.titleH = 620;
      state.fontFamily = "'Gowun Dodum'";
      state.titleAlign = 'left';
      state.titleFontSize = 210;
      state.subtitleFontSize = 72;
      state.titleSubGap = 40;
      state.badgeFontSize = 84;
      state.badgeBgSize = 100;
      state.colors = { ...THEME_PRESETS.warm };
      
      // Update DOM
      inputTitle.value = state.title;
      inputSubtitle.value = state.subtitle;
      inputCols.value = state.cols;
      inputRows.value = state.rows;
      rangeMargin.value = state.margin;
      rangeGap.value = state.gap;
      rangeTitleH.value = state.titleH;
      valMargin.textContent = `${state.margin}px`;
      valGap.textContent = `${state.gap}px`;
      valTitleH.textContent = `${state.titleH}px`;
      
      selectFontFamily.value = state.fontFamily;
      updateTitleAlignControls();
      updateCardModeControls();
      rangeTitleSize.value = state.titleFontSize;
      valTitleSize.textContent = `${state.titleFontSize}px`;
      rangeSubtitleSize.value = state.subtitleFontSize;
      valSubtitleSize.textContent = `${state.subtitleFontSize}px`;
      rangeTitleSubGap.value = state.titleSubGap;
      valTitleSubGap.textContent = `${state.titleSubGap}px`;
      rangeBadgeSize.value = state.badgeFontSize;
      valBadgeSize.textContent = `${state.badgeFontSize}px`;
      rangeBadgeBgSize.value = state.badgeBgSize;
      valBadgeBgSize.textContent = `${state.badgeBgSize}px`;

      layoutPortraitBtn.classList.add('active');
      layoutLandscapeBtn.classList.remove('active');
      spanRes.textContent = `${A2_PORTRAIT.w} x ${A2_PORTRAIT.h} (A2 300 DPI)`;
      
      applyTheme('warm');
    }
  });
  
  // High-Res Export Download
  btnDownload.addEventListener('click', () => {
    showStatus('고해상도 이미지 인쇄 파일 생성 중... (잠시만 기다려주세요)');
    btnDownload.disabled = true;
    
    // Use setTimeout to allow the browser to paint the status overlay
    setTimeout(() => {
      try {
        const offscreenCanvas = document.createElement('canvas');
        // Render at full A2 size scale (1.0)
        drawPoster(offscreenCanvas, 1.0);
        
        // Trigger download
        const dataURL = offscreenCanvas.toDataURL('image/png', 0.95);
        const a = document.createElement('a');
        a.href = dataURL;
        
        // Generate filename based on title
        const filename = `${state.title.replace(/\s+/g, '_')}_브로마이드_${state.layout}.png`;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
      } catch (err) {
        console.error('Export failed:', err);
        alert('고해상도 이미지 저장 중 오류가 발생했습니다: ' + err.message);
      } finally {
        hideStatus();
        btnDownload.disabled = false;
      }
    }, 100);
  });
}

// --- App Initialization ---
async function init() {
  initDragAndDrop();
  initEvents();
  
  // Initial UI updates
  updateColorInputs();
  updateTitleAlignControls();
  updateCardModeControls();
  renderCardList();
  
  // Load images and render
  await preloadImages();
  scheduleRender();
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', () => {
  // Fallback if DOMContentLoaded already fired
  if (!isLoaded && Object.keys(imageCache).length === 0) {
    init();
  }
});
