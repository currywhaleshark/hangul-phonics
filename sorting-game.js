// --- Character Mapping Table ---
const CHARACTER_MAP = {
  'ㄱ': { name: '고고 고양이', file: '/고고 고양이.png', theme: 'gogo' },
  'ㄴ': { name: '나나 나비', file: '/나나 나비.png', theme: 'nana' },
  'ㄷ': { name: '도도 도토리', file: '/도도 도토리.png', theme: 'dodo' },
  'ㄹ': { name: '라라 리본', file: '/라라 리본.png', theme: 'rara' },
  'ㅁ': { name: '미미 문어', file: '/미미 문어.png', theme: 'mimi' },
  'ㅂ': { name: '부부 부엉이', file: '/부부 부엉이.png', theme: 'bubu' },
  'ㅅ': { name: '사사 사슴', file: '/사사 사슴.png', theme: 'sasa' },
  'ㅇ': { name: '아아 아기', file: '/아아 아기.png', theme: 'aa' },
  'ㅈ': { name: '지지 지렁이', file: '/지지 지렁이.png', theme: 'jiji' },
  'ㅊ': { name: '치치 칙폭이', file: '/치치 칙폭이.png', theme: 'chichi' },
  'ㅋ': { name: '코코 코알라', file: '/코코 코알라.png', theme: 'koko' },
  'ㅌ': { name: '토토 토끼', file: '/토토 토끼.png', theme: 'toto' },
  'ㅍ': { name: '푸푸 풍선', file: '/푸푸 풍선.png', theme: 'pupu' },
  'ㅎ': { name: '하하 하마', file: '/하하 하마.png', theme: 'haha' }
};

// --- Application State ---
const state = {
  lessons: [],
  currentLessonIndex: 0,
  currentLessonData: null,
  sortingPageData: null,
  cardsInDeck: [],
  placedCardsCount: 0,
  totalCardsCount: 0,
  audioContext: null,
  audioContextActivated: false,
  currentAudioChant: null,
  currentConsonantPlaying: null
};

// --- Web Audio API Synth Effects ---
function initAudioContext() {
  if (state.audioContextActivated) return;
  state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  state.audioContextActivated = true;
}

function playSuccessSynth() {
  if (!state.audioContext) return;
  
  const ctx = state.audioContext;
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const now = ctx.currentTime;
  
  // 딩동댕 (솔-도 화음 느낌)
  // 1번째 음: G5 (784Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle'; // 부드러운 실로폰 소리
  osc1.frequency.setValueAtTime(783.99, now);
  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  
  // 2번째 음: C6 (1046.5Hz) - 살짝 지연 연주
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(1046.50, now + 0.12);
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.setValueAtTime(0, now + 0.12);
  gain2.gain.linearRampToValueAtTime(0.35, now + 0.17);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
  
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  
  osc1.start(now);
  osc1.stop(now + 0.35);
  osc2.start(now + 0.12);
  osc2.stop(now + 0.6);
}

function playFailSynth() {
  if (!state.audioContext) return;
  
  const ctx = state.audioContext;
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const now = ctx.currentTime;
  
  // 띠용 (주파수 슬라이딩 다운)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  // 260Hz 에서 80Hz로 0.28초 동안 주파수 떨어뜨림
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.28);
  
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(now);
  osc.stop(now + 0.3);
}

// --- Play & Stop Chant Audio ---
function stopCurrentChant() {
  if (state.currentAudioChant) {
    state.currentAudioChant.pause();
    state.currentAudioChant = null;
    state.currentConsonantPlaying = null;
  }
}

function playChant(consonant, lessonId) {
  // If the same consonant is clicked again while playing, stop it (toggle stop)
  if (state.currentAudioChant && state.currentConsonantPlaying === consonant) {
    stopCurrentChant();
    return;
  }

  // Stop currently playing chant
  stopCurrentChant();
  
  // Audio file URL encoding
  const audioPath = `/lessons/consonants/${lessonId}/${consonant} 챈트.wav`;
  const audio = new Audio(encodeURI(audioPath));
  
  audio.play()
    .then(() => {
      state.currentAudioChant = audio;
      state.currentConsonantPlaying = consonant;
    })
    .catch(err => {
      console.warn(`챈트 오디오를 재생할 수 없습니다: ${audioPath}`, err);
    });

  // Audio ended listener to reset state
  audio.addEventListener('ended', () => {
    if (state.currentAudioChant === audio) {
      state.currentAudioChant = null;
      state.currentConsonantPlaying = null;
    }
  });
}

// --- Korean Choseong (Initial Consonant) Extractor ---
function getChoseong(word) {
  if (!word || typeof word !== 'string' || word.length === 0) return '';
  const charCode = word.charCodeAt(0);
  
  // 한글 음절 범위: 0xAC00 ~ 0xD7A3
  if (charCode >= 0xAC00 && charCode <= 0xD7A3) {
    const choseongIndex = Math.floor(((charCode - 0xAC00) / 28) / 21);
    const choseongs = [
      'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
      'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
    ];
    return choseongs[choseongIndex];
  }
  
  // 한글 자음 자체가 입력된 경우 (예: "ㄱ")
  if (charCode >= 0x3131 && charCode <= 0x314E) {
    const choseongMap = {
      0x3131: 'ㄱ', 0x3132: 'ㄲ', 0x3134: 'ㄴ', 0x3137: 'ㄷ', 0x3138: 'ㄸ', 
      0x3139: 'ㄹ', 0x3141: 'ㅁ', 0x3142: 'ㅂ', 0x3143: 'ㅃ', 0x3145: 'ㅅ', 
      0x3146: 'ㅆ', 0x3147: 'ㅇ', 0x3148: 'ㅈ', 0x3149: 'ㅉ', 0x314A: 'ㅊ', 
      0x314B: 'ㅋ', 0x314C: 'ㅌ', 0x314D: 'ㅍ', 0x314E: 'ㅎ'
    };
    return choseongMap[charCode] || '';
  }
  
  return word[0];
}

// --- Resolve relative paths in JSON to absolute serve paths ---
function resolvePath(basePath, relativePath) {
  if (!relativePath) return '';
  
  const baseParts = basePath.split('/');
  baseParts.pop(); // Remove "worksheet.json" file name
  
  const relParts = relativePath.split('/');
  for (const part of relParts) {
    if (part === '.') {
      continue;
    } else if (part === '..') {
      baseParts.pop();
    } else {
      baseParts.push(part);
    }
  }
  
  let resolved = baseParts.join('/');
  
  // Strip public directory prefix since Vite serves public folder content as root "/"
  if (resolved.startsWith('/public/')) {
    resolved = resolved.replace('/public/', '/');
  } else if (resolved.startsWith('public/')) {
    resolved = resolved.replace('public/', '/');
  }
  
  return resolved;
}

// --- DOM Rendering Logic ---
function renderLessonButtons() {
  const container = document.getElementById('lesson-buttons-container');
  container.innerHTML = '';
  
  state.lessons.forEach((lesson, index) => {
    const btn = document.createElement('button');
    btn.className = `btn-lesson ${index === state.currentLessonIndex ? 'active' : ''}`;
    // "1레슨 고고와 나나: ㄱ ㄴ 첫소리 친구" -> "1레슨" or "ㄱ ㄴ"만 간략하게 표기
    const shortTitle = lesson.title.split(':')[0].trim();
    btn.textContent = shortTitle;
    
    btn.addEventListener('click', () => {
      if (index === state.currentLessonIndex) return;
      state.currentLessonIndex = index;
      loadLessonData();
    });
    
    container.appendChild(btn);
  });
}

async function loadLessonData() {
  stopCurrentChant(); // Stop playing chant on lesson change
  const currentLesson = state.lessons[state.currentLessonIndex];
  
  // Load buttons active state
  document.querySelectorAll('.btn-lesson').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === state.currentLessonIndex);
  });
  
  try {
    // Worksheet data fetch
    const worksheetUrl = `/lessons/consonants/${currentLesson.id}/worksheet.json`;
    const response = await fetch(worksheetUrl);
    const data = await response.json();
    
    state.currentLessonData = data;
    
    // Find the last page which is "sorting" page
    const sortingPage = data.pages.find(p => p.type === 'sorting');
    if (!sortingPage) {
      console.error('분류 활동(sorting) 페이지를 찾을 수 없습니다.');
      alert('이 레슨에는 분류 활동이 없습니다.');
      return;
    }
    
    state.sortingPageData = sortingPage;
    state.placedCardsCount = 0;
    
    // Setup titles
    document.getElementById('game-title').textContent = sortingPage.title || '친구를 집에 보내줄까요?';
    document.getElementById('game-instruction').textContent = sortingPage.read || '카드를 끌어서 알맞은 첫소리 집에 넣어보세요!';
    
    // Resolve asset paths for tiles and filter duplicates by label
    const seenLabels = new Set();
    const uniqueTiles = [];
    
    sortingPage.tiles.forEach(tile => {
      if (!seenLabels.has(tile.label)) {
        seenLabels.add(tile.label);
        uniqueTiles.push(tile);
      }
    });

    state.cardsInDeck = uniqueTiles.map((tile, id) => {
      const imgPath = tile.image ? resolvePath(worksheetUrl, tile.image) : '';
      return {
        id: `tile-${id}`,
        label: tile.label,
        image: imgPath,
        fill: tile.fill,
        answerChoseong: getChoseong(tile.label) // Calculate dynamic choseong as correct answer!
      };
    });
    
    state.totalCardsCount = state.cardsInDeck.length;
    
    // Shuffle deck cards
    shuffleArray(state.cardsInDeck);
    
    // Render
    renderGameField(worksheetUrl);
    
  } catch (err) {
    console.error('레슨 정보를 로드하는 데 실패했습니다:', err);
    alert('레슨 로딩 실패: ' + err.message);
  }
}

function renderGameField(worksheetUrl) {
  const housesWrapper = document.getElementById('houses-wrapper');
  housesWrapper.innerHTML = '';
  
  const sortingPage = state.sortingPageData;
  const currentLesson = state.lessons[state.currentLessonIndex];
  
  // Render Houses
  sortingPage.houses.forEach(house => {
    // "ㄱ 집" -> "ㄱ"
    const consonant = house.title.replace(' 집', '').trim();
    const charInfo = CHARACTER_MAP[consonant] || { name: '캐릭터', file: '', theme: 'mix' };
    
    const houseEl = document.createElement('div');
    houseEl.className = 'house';
    houseEl.dataset.consonant = consonant;
    houseEl.style.setProperty('--house-color', `var(--color-${charInfo.theme || 'mix'})`);
    
    houseEl.innerHTML = `
      <div class="house-header" title="누르면 챈트가 나와요!">
        <img src="${charInfo.file}" class="house-character-img" alt="${charInfo.name}" onerror="this.style.display='none'">
        <div class="audio-badge">🎵</div>
        <div class="house-title">
          <span>${consonant}</span> 집
        </div>
      </div>
      <div class="house-slots">
        <!-- Placed cards will land here -->
      </div>
    `;
    
    // House header click -> play chant wav
    houseEl.querySelector('.house-header').addEventListener('click', () => {
      playChant(consonant, currentLesson.id);
    });
    
    housesWrapper.appendChild(houseEl);
  });
  
  // Render Deck Cards
  renderDeck();
}

function renderDeck() {
  const deckBank = document.getElementById('deck-bank');
  deckBank.innerHTML = '';
  
  state.cardsInDeck.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = 'game-card';
    cardEl.dataset.id = card.id;
    
    if (card.image) {
      cardEl.innerHTML = `
        <div class="card-img-wrapper">
          <img src="${card.image}" alt="${card.label}" draggable="false">
        </div>
        <strong>${card.label}</strong>
      `;
    } else {
      cardEl.innerHTML = `
        <div class="card-img-wrapper">
          <div class="card-fill-bg" style="background: #${card.fill}"></div>
        </div>
        <strong>${card.label}</strong>
      `;
    }
    
    // Setup Pointer Drag & Drop event
    initCardDragging(cardEl, card);
    
    deckBank.appendChild(cardEl);
  });
  
  if (state.cardsInDeck.length === 0 && state.placedCardsCount > 0) {
    // Trigger game success
    setTimeout(showCelebration, 600);
  }
}

// --- Pointer Events Drag & Drop ---
let activeDrag = null;

function initCardDragging(cardEl, cardData) {
  cardEl.addEventListener('pointerdown', onPointerDown);

  function onPointerDown(e) {
    e.preventDefault();
    initAudioContext(); // Activate audio context on user interaction
    
    // Prevent dragging already placed card
    if (cardEl.classList.contains('placed')) return;
    
    cardEl.releasePointerCapture(e.pointerId);
    
    const rect = cardEl.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // Create floating element
    const dragEl = document.createElement('div');
    dragEl.className = 'game-card dragging-card';
    dragEl.style.position = 'fixed';
    dragEl.style.left = `${rect.left}px`;
    dragEl.style.top = `${rect.top}px`;
    dragEl.style.width = `${rect.width}px`;
    dragEl.style.height = `${rect.height}px`;
    dragEl.style.zIndex = '1000';
    dragEl.style.pointerEvents = 'none'; // Essential for finding hover houses under pointer
    dragEl.innerHTML = cardEl.innerHTML;
    document.body.appendChild(dragEl);
    
    cardEl.style.opacity = '0.35';
    
    activeDrag = {
      cardEl,
      dragEl,
      offsetX,
      offsetY,
      cardData,
      rect
    };
    
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }
  
  function onPointerMove(e) {
    if (!activeDrag) return;
    const { dragEl, offsetX, offsetY } = activeDrag;
    dragEl.style.left = `${e.clientX - offsetX}px`;
    dragEl.style.top = `${e.clientY - offsetY}px`;
    
    // Check houses overlap for hover effect
    checkHousesHighlight(e.clientX, e.clientY);
  }
  
  function onPointerUp(e) {
    if (!activeDrag) return;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    
    const { cardEl, dragEl, cardData } = activeDrag;
    const houseEl = findOverlapHouse(e.clientX, e.clientY);
    
    if (houseEl) {
      const houseConsonant = houseEl.dataset.consonant;
      
      // Match check: card.answerChoseong vs house.consonant
      if (cardData.answerChoseong === houseConsonant) {
        // Correct Match!
        playSuccessSynth();
        
        // Add card to house slots
        const slots = houseEl.querySelector('.house-slots');
        const placedCardEl = cardEl.cloneNode(true);
        placedCardEl.className = 'game-card placed';
        placedCardEl.removeAttribute('style');
        slots.appendChild(placedCardEl);
        
        // Remove from deck state
        state.cardsInDeck = state.cardsInDeck.filter(c => c.id !== cardData.id);
        state.placedCardsCount++;
        
        cardEl.remove();
        dragEl.remove();
        
        // Re-render deck to handle completion
        renderDeck();
        
      } else {
        // Incorrect Match!
        playFailSynth();
        returnToDeck();
      }
    } else {
      // Dropped in empty area
      returnToDeck();
    }
    
    clearHouseHighlights();
    activeDrag = null;
    
    function returnToDeck() {
      // Smooth return transition
      const destRect = cardEl.getBoundingClientRect();
      dragEl.style.transition = 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)';
      dragEl.style.left = `${destRect.left}px`;
      dragEl.style.top = `${destRect.top}px`;
      dragEl.style.transform = 'scale(1) rotate(0deg)';
      
      setTimeout(() => {
        cardEl.style.opacity = '1';
        dragEl.remove();
      }, 350);
    }
  }
}

function checkHousesHighlight(x, y) {
  const houses = document.querySelectorAll('.house');
  houses.forEach(house => {
    const rect = house.getBoundingClientRect();
    const isInside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    house.classList.toggle('drag-hover', isInside);
  });
}

function clearHouseHighlights() {
  document.querySelectorAll('.house').forEach(house => {
    house.classList.remove('drag-hover');
  });
}

function findOverlapHouse(x, y) {
  const houses = document.querySelectorAll('.house');
  for (const house of houses) {
    const rect = house.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return house;
    }
  }
  return null;
}

// --- Game Success & Celebration ---
function showCelebration() {
  stopCurrentChant(); // Stop playing chant on clear
  document.getElementById('celebration-overlay').classList.add('show');
  startConfetti();
}

function hideCelebration() {
  document.getElementById('celebration-overlay').classList.remove('show');
  stopConfetti();
}

// --- Confetti Canvas Effect ---
let confettiActive = false;
let confettiInterval = null;
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');
const particles = [];
const particleColors = ['#ff8e9e', '#87a9c7', '#86a789', '#f4ab46', '#ffd166', '#06d6a0', '#118ab2'];

function startConfetti() {
  confettiActive = true;
  resizeConfettiCanvas();
  window.addEventListener('resize', resizeConfettiCanvas);
  
  particles.length = 0;
  for (let i = 0; i < 120; i++) {
    particles.push(createParticle());
  }
  
  confettiInterval = requestAnimationFrame(updateConfetti);
}

function stopConfetti() {
  confettiActive = false;
  cancelAnimationFrame(confettiInterval);
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  window.removeEventListener('resize', resizeConfettiCanvas);
}

function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

function createParticle() {
  return {
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * -confettiCanvas.height - 20,
    r: Math.random() * 6 + 4,
    d: Math.random() * confettiCanvas.height,
    color: particleColors[Math.floor(Math.random() * particleColors.length)],
    tilt: Math.random() * 10 - 5,
    tiltAngleIncremental: Math.random() * 0.07 + 0.02,
    tiltAngle: 0,
    speedY: Math.random() * 3 + 2,
    speedX: Math.random() * 2 - 1
  };
}

function updateConfetti() {
  if (!confettiActive) return;
  
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  
  particles.forEach((p, idx) => {
    p.tiltAngle += p.tiltAngleIncremental;
    p.y += p.speedY;
    p.x += p.speedX;
    p.tilt = Math.sin(p.tiltAngle) * 12;
    
    // Draw particle
    confettiCtx.beginPath();
    confettiCtx.lineWidth = p.r;
    confettiCtx.strokeStyle = p.color;
    confettiCtx.moveTo(p.x + p.tilt + p.r / 2, p.y);
    confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
    confettiCtx.stroke();
    
    // Boundary check
    if (p.y > confettiCanvas.height) {
      particles[idx] = createParticle();
      particles[idx].y = -20;
    }
  });
  
  confettiInterval = requestAnimationFrame(updateConfetti);
}

// --- General Utility Helpers ---
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// --- App Initialization ---
async function init() {
  // Load manifest.json
  try {
    const response = await fetch('/lessons/consonants/manifest.json');
    const data = await response.json();
    state.lessons = data.lessons;
    
    renderLessonButtons();
    loadLessonData();
    
  } catch (err) {
    console.error('manifest.json 로드 실패:', err);
    alert('레슨 리스트 로드 중 오류가 발생했습니다.');
  }
  
  // Setup overlay button actions
  document.getElementById('btn-start-game').addEventListener('click', () => {
    initAudioContext();
    document.getElementById('audio-init-overlay').classList.add('hide');
  });
  
  // Safari / iOS touch start fallback for audio context activation
  document.getElementById('audio-init-overlay').addEventListener('pointerdown', () => {
    initAudioContext();
    document.getElementById('audio-init-overlay').classList.add('hide');
  });

  // Replay Game
  document.getElementById('btn-replay').addEventListener('click', () => {
    hideCelebration();
    loadLessonData();
  });
  
  // Next Lesson
  document.getElementById('btn-next-lesson').addEventListener('click', () => {
    hideCelebration();
    if (state.currentLessonIndex < state.lessons.length - 1) {
      state.currentLessonIndex++;
      loadLessonData();
      renderLessonButtons();
    } else {
      // Loop back to lesson 1
      state.currentLessonIndex = 0;
      loadLessonData();
      renderLessonButtons();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
