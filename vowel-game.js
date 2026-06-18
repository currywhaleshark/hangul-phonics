// =====================================================================
//  모음 합치기 복습 게임 (Vowel Combination Game)
//  소리를 듣고 → 자음 캐릭터 + 모음 도구를 끌어다 합쳐 음절 완성
//  2단계: 기본 모음(ㅏ·ㅗ) / 확장 모음(ㅓ·ㅜ·ㅡ·ㅣ)
//  음절 문자열만 주면 자모를 분해해 오디오·합쳐진 그림 경로를 자동 생성한다.
// =====================================================================

// --- 자음 캐릭터 매핑 (자음 -> 캐릭터 그림) ---
const CHARACTER_MAP = {
  'ㄱ': { name: '고고 고양이', file: '/고고 고양이.png' },
  'ㄴ': { name: '나나 나비', file: '/나나 나비.png' },
  'ㄷ': { name: '도도 도토리', file: '/도도 도토리.png' },
  'ㄹ': { name: '라라 리본', file: '/라라 리본.png' },
  'ㅁ': { name: '미미 문어', file: '/미미 문어.png' },
  'ㅂ': { name: '부부 부엉이', file: '/부부 부엉이.png' },
  'ㅅ': { name: '사사 사슴', file: '/사사 사슴.png' },
  'ㅇ': { name: '아아 아기', file: '/아아 아기.png' },
  'ㅈ': { name: '지지 지렁이', file: '/지지 지렁이.png' },
  'ㅊ': { name: '치치 칙폭이', file: '/치치 칙폭이.png' },
  'ㅋ': { name: '코코 코알라', file: '/코코 코알라.png' },
  'ㅌ': { name: '토토 토끼', file: '/토토 토끼.png' },
  'ㅍ': { name: '푸푸 풍선', file: '/푸푸 풍선.png' },
  'ㅎ': { name: '하하 하마', file: '/하하 하마.png' }
};

// --- 모음 도구 매핑 (모음 -> 도구 그림) ---
const VOWEL_TOOL_MAP = {
  'ㅏ': { name: '나뭇가지', file: '/아아 나뭇가지.png' },
  'ㅓ': { name: '풍선', file: '/어어 풍선.png' },
  'ㅗ': { name: '상자', file: '/오오 상자.png' },
  'ㅜ': { name: '발판', file: '/우우 발판.png' },
  'ㅡ': { name: '쿠션', file: '/으으 쿠션.png' },
  'ㅣ': { name: '막대', file: '/이이 막대.png' }
};

// =====================================================================
//  음절 데이터 자동 생성 (오디오 + 합쳐진 그림)
// =====================================================================
const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNGSEONG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];

function decompose(syllable) {
  const code = syllable.charCodeAt(0) - 0xAC00;
  return {
    consonant: CHOSEONG[Math.floor(code / 588)],
    vowel: JUNGSEONG[Math.floor((code % 588) / 28)]
  };
}

// 음절 오디오 번호: 자음 블록 시작값 + 모음 오프셋 (파일명은 "NN_음절.mp3")
const AUDIO_BASE = { 'ㄱ': 1, 'ㄴ': 1, 'ㅁ': 9, 'ㅂ': 17, 'ㄷ': 25, 'ㄹ': 33, 'ㅅ': 41, 'ㅎ': 49, 'ㅈ': 57, 'ㅊ': 65, 'ㅋ': 73, 'ㅌ': 81, 'ㅍ': 89 };
const VOWEL_AUDIO_OFFSET = { 'ㅏ': 0, 'ㅗ': 1, 'ㅜ': 2, 'ㅓ': 3, 'ㅛ': 4, 'ㅠ': 5, 'ㅡ': 6, 'ㅣ': 7 };

// ㅇ(아아 아기)의 모음별 합쳐진 그림 (도구를 든 모습)
const IEUNG_IMAGES = {
  '아': '/아아 아기 나뭇가지 시안.png',
  '어': '/어어 풍선 시안.png',
  '오': '/오오 상자 시안.png',
  '우': '/우우 발판 시안.png',
  '으': '/으으 쿠션 시안.png',
  '이': '/이이 막대 시안.png'
};

// 파일명이 패턴과 다른 예외 (고고 가/고는 막대기/상자 버전을 사용)
const COMBINED_OVERRIDE = {
  '가': '/고고 가 막대기 ㄱ폰트 크게 새시안.png',
  '고': '/고고 고 상자 ㄱ폰트 크게 새시안.png'
};

function audioFor(syllable, consonant, vowel) {
  if (consonant === 'ㅇ') return `/audio/${syllable}!.mp3`;
  const nn = String(AUDIO_BASE[consonant] + VOWEL_AUDIO_OFFSET[vowel]).padStart(2, '0');
  return `/audio/${nn}_${syllable}.mp3`;
}

function combinedFor(syllable, consonant) {
  if (consonant === 'ㅇ') return IEUNG_IMAGES[syllable];
  if (COMBINED_OVERRIDE[syllable]) return COMBINED_OVERRIDE[syllable];
  const prefix = CHARACTER_MAP[consonant].name.split(' ')[0]; // "고고 고양이" -> "고고"
  return `/${prefix} ${syllable} 새시안.png`;
}

const SYLLABLES = {};
function registerSyllable(syllable) {
  if (SYLLABLES[syllable]) return;
  const { consonant, vowel } = decompose(syllable);
  SYLLABLES[syllable] = {
    consonant,
    vowel,
    audio: audioFor(syllable, consonant, vowel),
    combined: combinedFor(syllable, consonant)
  };
}

// =====================================================================
//  단계 & 레슨 구성 (모음 레슨 manifest와 동일한 흐름)
// =====================================================================
const STAGES = [
  {
    id: 'basic',
    label: '기본 모음',
    sub: 'ㅏ · ㅗ',
    lessons: [
      { id: 'lesson-01', short: '1', title: '1과 · 아오우', syllables: ['아', '오', '우'] },
      { id: 'lesson-02', short: '2', title: '2과 · 가고나노', syllables: ['가', '고', '나', '노'] },
      { id: 'lesson-03', short: '3', title: '3과 · 마모바보', syllables: ['마', '모', '바', '보'] },
      { id: 'lesson-04', short: '4', title: '4과 · 다도라로', syllables: ['다', '도', '라', '로'] },
      { id: 'lesson-05', short: '5', title: '5과 · 사소하호', syllables: ['사', '소', '하', '호'] },
      { id: 'lesson-06', short: '6', title: '6과 · 자조차초', syllables: ['자', '조', '차', '초'] },
      { id: 'lesson-07', short: '7', title: '7과 · 카코타토파포', syllables: ['카', '코', '타', '토', '파', '포'] },
      { id: 'lesson-basic-all', short: '★', title: '기본 전체 섞기', mixed: true }
    ]
  },
  {
    id: 'expansion',
    label: '확장 모음',
    sub: 'ㅓ · ㅜ · ㅡ · ㅣ',
    lessons: [
      { id: 'lesson-08', short: '8', title: '8과 · 어우으이', syllables: ['어', '우', '으', '이'] },
      { id: 'lesson-09', short: '9', title: '9과 · 거구그기 / 너누느니', syllables: ['거', '구', '그', '기', '너', '누', '느', '니'] },
      { id: 'lesson-10', short: '10', title: '10과 · 머무므미 / 러루르리', syllables: ['머', '무', '므', '미', '러', '루', '르', '리'] },
      { id: 'lesson-11', short: '11', title: '11과 · 더두드디 / 버부브비', syllables: ['더', '두', '드', '디', '버', '부', '브', '비'] },
      { id: 'lesson-12', short: '12', title: '12과 · 서수스시 / 허후흐히', syllables: ['서', '수', '스', '시', '허', '후', '흐', '히'] },
      { id: 'lesson-13', short: '13', title: '13과 · 저주즈지 / 처추츠치', syllables: ['저', '주', '즈', '지', '처', '추', '츠', '치'] },
      { id: 'lesson-14', short: '14', title: '14과 · 커쿠크키 / 터투트티 / 퍼푸프피', syllables: ['커', '쿠', '크', '키', '터', '투', '트', '티', '퍼', '푸', '프', '피'] },
      { id: 'lesson-expansion-all', short: '★', title: '확장 전체 섞기', mixed: true }
    ]
  }
];

// 모든 레슨의 음절을 SYLLABLES에 등록
STAGES.forEach(stage => stage.lessons.forEach(lesson => {
  (lesson.syllables || []).forEach(registerSyllable);
}));

// 전체 섞기 모드에서 한 번에 푸는 문제 수
const MIXED_ROUND_COUNT = 10;

// 단계별 음절/자음/모음 풀
function stageSyllables(stage) {
  return uniqueValues(stage.lessons.filter(l => !l.mixed).flatMap(l => l.syllables));
}
function stageConsonants(stage) {
  return uniqueValues(stageSyllables(stage).map(s => SYLLABLES[s].consonant));
}
function stageVowels(stage) {
  return uniqueValues(stageSyllables(stage).map(s => SYLLABLES[s].vowel));
}

// --- 게임 상태 ---
const state = {
  stageIndex: 0,
  lessonIndex: 0,
  currentStage: null,
  currentLesson: null,
  roundQueue: [],
  roundIndex: 0,
  target: null,
  placed: { consonant: null, vowel: null },
  solvedCount: 0,
  locked: false,
  audioContext: null,
  audioContextActivated: false,
  currentPromptAudio: null
};

// =====================================================================
//  Web Audio 효과음
// =====================================================================
function initAudioContext() {
  if (state.audioContextActivated) return;
  state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  state.audioContextActivated = true;
}

function resumeAudioContext() {
  if (state.audioContext && state.audioContext.state === 'suspended') {
    state.audioContext.resume();
  }
}

function playSuccessSynth() {
  if (!state.audioContext) return;
  resumeAudioContext();
  const ctx = state.audioContext;
  const now = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(783.99, now);
  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);

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
  resumeAudioContext();
  const ctx = state.audioContext;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.28);
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

// =====================================================================
//  음절 소리 재생
// =====================================================================
function stopPromptAudio() {
  if (state.currentPromptAudio) {
    state.currentPromptAudio.pause();
    state.currentPromptAudio = null;
  }
}

function playPrompt() {
  if (!state.target) return;
  const data = SYLLABLES[state.target];
  if (!data || !data.audio) return;

  stopPromptAudio();
  const audio = new Audio(encodeURI(data.audio));
  audio.play()
    .then(() => { state.currentPromptAudio = audio; })
    .catch(err => console.warn(`소리 재생 실패: ${data.audio}`, err));

  const btn = document.getElementById('btn-replay-sound');
  if (btn) {
    btn.classList.remove('pinging');
    void btn.offsetWidth;
    btn.classList.add('pinging');
  }
}

// =====================================================================
//  단계 탭 & 레슨 버튼
// =====================================================================
function renderStageTabs() {
  const container = document.getElementById('stage-tabs');
  container.innerHTML = '';
  STAGES.forEach((stage, index) => {
    const btn = document.createElement('button');
    btn.className = `stage-tab ${index === state.stageIndex ? 'active' : ''}`;
    btn.innerHTML = `<span class="stage-name">${stage.label}</span><span class="stage-sub">${stage.sub}</span>`;
    btn.addEventListener('click', () => {
      if (index === state.stageIndex) return;
      state.stageIndex = index;
      state.lessonIndex = 0;
      renderStageTabs();
      renderLessonButtons();
      loadLesson();
    });
    container.appendChild(btn);
  });
}

function renderLessonButtons() {
  const container = document.getElementById('lesson-buttons-container');
  container.innerHTML = '';
  STAGES[state.stageIndex].lessons.forEach((lesson, index) => {
    const btn = document.createElement('button');
    btn.className = `btn-lesson ${index === state.lessonIndex ? 'active' : ''}`;
    btn.textContent = lesson.short;
    btn.title = lesson.title;
    btn.addEventListener('click', () => {
      if (index === state.lessonIndex) return;
      state.lessonIndex = index;
      syncLessonButtons();
      loadLesson();
    });
    container.appendChild(btn);
  });
}

function syncLessonButtons() {
  document.querySelectorAll('.btn-lesson').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === state.lessonIndex);
  });
}

// =====================================================================
//  레슨 로딩 & 라운드 큐 구성
// =====================================================================
async function loadLesson() {
  stopPromptAudio();
  showLoadingScreen();

  state.currentStage = STAGES[state.stageIndex];
  state.currentLesson = state.currentStage.lessons[state.lessonIndex];
  state.solvedCount = 0;
  state.roundIndex = 0;

  let pool;
  if (state.currentLesson.mixed) {
    pool = stageSyllables(state.currentStage).slice();
    shuffleArray(pool);
    state.roundQueue = pool.slice(0, Math.min(MIXED_ROUND_COUNT, pool.length));
  } else {
    pool = state.currentLesson.syllables.slice();
    shuffleArray(pool);
    state.roundQueue = pool;
  }

  // 이번 레슨에서 쓸 합쳐진 그림 프리로드
  const combinedUrls = state.roundQueue.map(s => SYLLABLES[s].combined);
  await preloadImages(combinedUrls, updateLoadingProgress);

  hideLoadingScreen();
  startRound();
}

// =====================================================================
//  라운드 시작
// =====================================================================
function startRound() {
  state.locked = false;
  state.placed = { consonant: null, vowel: null };
  state.target = state.roundQueue[state.roundIndex];

  document.getElementById('prompt-title').textContent = '소리를 잘 듣고 합쳐요!';

  renderStage();
  renderTrays();
  renderProgress(false);

  if (state.audioContextActivated) {
    setTimeout(playPrompt, 400);
  }
}

// 현재 라운드에 보여줄 자음/모음 선택지 계산
function buildChoices() {
  const target = SYLLABLES[state.target];
  const lesson = state.currentLesson;
  const stage = state.currentStage;
  let consonants, vowels;

  if (lesson.mixed) {
    // 정답 + 같은 단계의 무작위 자음 보기 (총 4개)
    const pool = stageConsonants(stage).filter(c => c !== target.consonant);
    shuffleArray(pool);
    consonants = [target.consonant, ...pool.slice(0, 3)];
    vowels = stageVowels(stage).slice();
    if (!vowels.includes(target.vowel)) vowels.push(target.vowel);
  } else {
    consonants = uniqueValues(lesson.syllables.map(s => SYLLABLES[s].consonant));
    if (!consonants.includes(target.consonant)) consonants.push(target.consonant);
    vowels = uniqueValues(lesson.syllables.map(s => SYLLABLES[s].vowel));
    if (!vowels.includes(target.vowel)) vowels.push(target.vowel);
  }

  shuffleArray(consonants);
  shuffleArray(vowels);
  return { consonants, vowels };
}

// =====================================================================
//  스테이지(합치기 판) 렌더링
// =====================================================================
function renderStage() {
  const slotC = document.getElementById('slot-consonant');
  const slotV = document.getElementById('slot-vowel');
  const result = document.getElementById('result-box');

  slotC.innerHTML = slotHintHTML('consonant');
  slotC.classList.remove('filled');
  slotV.innerHTML = slotHintHTML('vowel');
  slotV.classList.remove('filled');

  result.innerHTML = '<span class="result-q">?</span>';
  result.classList.remove('revealed');

  document.getElementById('combine-stage').classList.remove('shake');
}

// =====================================================================
//  카드 트레이 렌더링
// =====================================================================
function renderTrays() {
  const { consonants, vowels } = buildChoices();

  const consonantBank = document.getElementById('consonant-bank');
  const vowelBank = document.getElementById('vowel-bank');
  consonantBank.innerHTML = '';
  vowelBank.innerHTML = '';

  consonants.forEach((c, i) => {
    const info = CHARACTER_MAP[c];
    if (!info) return;
    consonantBank.appendChild(makeCard({ type: 'consonant', value: c, name: info.name, image: info.file, id: `c-${i}` }));
  });

  vowels.forEach((v, i) => {
    const info = VOWEL_TOOL_MAP[v];
    if (!info) return;
    vowelBank.appendChild(makeCard({ type: 'vowel', value: v, name: info.name, image: info.file, id: `v-${i}` }));
  });
}

function makeCard(cardData) {
  const el = document.createElement('div');
  el.className = 'game-card';
  el.dataset.type = cardData.type;
  el.dataset.value = cardData.value;
  el.dataset.id = cardData.id;
  el.innerHTML = `
    <div class="card-img-wrapper">
      <img src="${cardData.image}" alt="${cardData.name}" draggable="false" onerror="this.style.display='none'">
    </div>
    <strong>${cardData.name}</strong>
  `;
  initCardDragging(el, cardData);
  return el;
}

// =====================================================================
//  포인터 드래그 & 드롭
// =====================================================================
let activeDrag = null;

function initCardDragging(cardEl, cardData) {
  cardEl.addEventListener('pointerdown', onPointerDown);

  function onPointerDown(e) {
    e.preventDefault();
    if (activeDrag) return;
    if (state.locked) return;

    initAudioContext();
    resumeAudioContext();

    cardEl.releasePointerCapture?.(e.pointerId);

    const rect = cardEl.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const dragEl = document.createElement('div');
    dragEl.className = 'game-card dragging-card';
    dragEl.style.position = 'fixed';
    dragEl.style.left = `${rect.left}px`;
    dragEl.style.top = `${rect.top}px`;
    dragEl.style.width = `${rect.width}px`;
    dragEl.style.height = `${rect.height}px`;
    dragEl.style.zIndex = '1000';
    dragEl.style.pointerEvents = 'none';
    dragEl.innerHTML = cardEl.innerHTML;
    document.body.appendChild(dragEl);

    cardEl.style.opacity = '0.35';

    activeDrag = { cardEl, dragEl, offsetX, offsetY, cardData };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e) {
    if (!activeDrag) return;
    const { dragEl, offsetX, offsetY } = activeDrag;
    dragEl.style.left = `${e.clientX - offsetX}px`;
    dragEl.style.top = `${e.clientY - offsetY}px`;
    highlightSlots(e.clientX, e.clientY, activeDrag.cardData.type);
  }

  function onPointerUp(e) {
    if (!activeDrag) return;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

    const { cardEl, dragEl, cardData } = activeDrag;
    const slotEl = findSlotUnder(e.clientX, e.clientY);

    let placed = false;
    if (slotEl && slotEl.dataset.accept === cardData.type) {
      placeInSlot(cardData);
      placed = true;
    }

    clearSlotHighlights();
    cardEl.style.opacity = '1';

    if (placed) {
      dragEl.remove();
    } else {
      const destRect = cardEl.getBoundingClientRect();
      dragEl.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
      dragEl.style.left = `${destRect.left}px`;
      dragEl.style.top = `${destRect.top}px`;
      dragEl.style.transform = 'scale(1) rotate(0deg)';
      setTimeout(() => dragEl.remove(), 300);
    }

    activeDrag = null;

    if (placed) tryEvaluate();
  }
}

function highlightSlots(x, y, type) {
  document.querySelectorAll('.slot').forEach(slot => {
    const rect = slot.getBoundingClientRect();
    const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    slot.classList.toggle('drag-hover', inside && slot.dataset.accept === type);
  });
}

function clearSlotHighlights() {
  document.querySelectorAll('.slot').forEach(slot => slot.classList.remove('drag-hover'));
}

function findSlotUnder(x, y) {
  const slots = document.querySelectorAll('.slot');
  for (const slot of slots) {
    const rect = slot.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return slot;
  }
  return null;
}

function placeInSlot(cardData) {
  const { type, value } = cardData;
  state.placed[type] = value;

  const slotEl = document.getElementById(type === 'consonant' ? 'slot-consonant' : 'slot-vowel');
  const info = type === 'consonant' ? CHARACTER_MAP[value] : VOWEL_TOOL_MAP[value];
  slotEl.classList.add('filled');
  slotEl.innerHTML = `
    <div class="slot-content">
      <img src="${info.file}" alt="${info.name}" draggable="false" onerror="this.style.display='none'">
    </div>
  `;
}

function clearSlot(type) {
  state.placed[type] = null;
  const slotEl = document.getElementById(type === 'consonant' ? 'slot-consonant' : 'slot-vowel');
  slotEl.classList.remove('filled');
  slotEl.innerHTML = slotHintHTML(type);
}

function slotHintHTML(type) {
  const emoji = type === 'consonant' ? '🐱' : '🧰';
  const label = type === 'consonant' ? '자음 친구' : '모음 도구';
  return `<span class="slot-hint"><span class="hint-emoji">${emoji}</span>${label}</span>`;
}

// =====================================================================
//  정답 판정
// =====================================================================
function tryEvaluate() {
  if (state.placed.consonant === null || state.placed.vowel === null) return;

  const target = SYLLABLES[state.target];
  const consonantOk = state.placed.consonant === target.consonant;
  const vowelOk = state.placed.vowel === target.vowel;

  if (consonantOk && vowelOk) {
    handleCorrect();
  } else {
    handleWrong(consonantOk, vowelOk);
  }
}

function handleCorrect() {
  state.locked = true;
  playSuccessSynth();

  const result = document.getElementById('result-box');
  const combined = SYLLABLES[state.target].combined;
  result.innerHTML = `<img src="${combined}" alt="${state.target}" draggable="false">`;
  result.classList.add('revealed');
  starBurst();

  renderProgress(true);

  document.getElementById('prompt-title').textContent = `${state.target}! 정답이에요 🎉`;

  setTimeout(playPrompt, 450);

  state.solvedCount++;

  setTimeout(() => {
    if (state.roundIndex < state.roundQueue.length - 1) {
      state.roundIndex++;
      startRound();
    } else {
      showCelebration();
    }
  }, 1900);
}

function handleWrong(consonantOk, vowelOk) {
  playFailSynth();

  const stage = document.getElementById('combine-stage');
  stage.classList.remove('shake');
  void stage.offsetWidth;
  stage.classList.add('shake');

  // 틀린 조각만 트레이로 되돌리기 (맞은 조각은 유지)
  if (!consonantOk) clearSlot('consonant');
  if (!vowelOk) clearSlot('vowel');
}

// =====================================================================
//  완료 축하
// =====================================================================
function showCelebration() {
  stopPromptAudio();
  document.getElementById('celebration-overlay').classList.add('show');
  startConfetti();
}

function hideCelebration() {
  document.getElementById('celebration-overlay').classList.remove('show');
  stopConfetti();
}

// =====================================================================
//  진행 점 & 정답 별 효과
// =====================================================================
function renderProgress(markCurrentDone) {
  const el = document.getElementById('prompt-progress');
  if (!el) return;
  el.innerHTML = '';
  const total = state.roundQueue.length;
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('span');
    let cls = 'pdot';
    if (i < state.roundIndex) cls += ' done';
    else if (i === state.roundIndex) cls += markCurrentDone ? ' done' : ' current';
    dot.className = cls;
    el.appendChild(dot);
  }
}

function starBurst() {
  const box = document.getElementById('result-box');
  if (!box) return;
  const rect = box.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const emojis = ['⭐', '✨', '🌟', '💫'];
  const count = 7;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star-pop';
    star.textContent = emojis[i % emojis.length];
    star.style.left = `${cx}px`;
    star.style.top = `${cy}px`;
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    const dist = 80 + Math.random() * 45;
    star.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    star.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 950);
  }
}

// =====================================================================
//  컨페티 효과
// =====================================================================
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
  for (let i = 0; i < 120; i++) particles.push(createParticle());
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
    confettiCtx.beginPath();
    confettiCtx.lineWidth = p.r;
    confettiCtx.strokeStyle = p.color;
    confettiCtx.moveTo(p.x + p.tilt + p.r / 2, p.y);
    confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
    confettiCtx.stroke();
    if (p.y > confettiCanvas.height) {
      particles[idx] = createParticle();
      particles[idx].y = -20;
    }
  });
  confettiInterval = requestAnimationFrame(updateConfetti);
}

// =====================================================================
//  로딩 화면 & 이미지 프리로더
// =====================================================================
function showLoadingScreen() {
  const loader = document.getElementById('loading-screen');
  const bar = document.getElementById('progress-bar');
  const status = document.getElementById('loading-status');
  if (loader) {
    loader.classList.remove('hide');
    if (bar) bar.style.width = '0%';
    if (status) status.textContent = '0% 완료';
  }
}

function updateLoadingProgress(percent) {
  const bar = document.getElementById('progress-bar');
  const status = document.getElementById('loading-status');
  if (bar) bar.style.width = `${percent}%`;
  if (status) status.textContent = `${percent}% 완료`;
}

function hideLoadingScreen() {
  const loader = document.getElementById('loading-screen');
  if (loader) loader.classList.add('hide');
}

function preloadImages(urls, onProgress) {
  return new Promise((resolve) => {
    const list = (urls || []).filter(Boolean);
    if (list.length === 0) { resolve(); return; }
    let loaded = 0;
    const total = list.length;
    list.forEach(url => {
      const img = new Image();
      img.src = encodeURI(url);
      const done = () => {
        loaded++;
        if (onProgress) onProgress(Math.floor((loaded / total) * 100));
        if (loaded === total) resolve();
      };
      img.onload = done;
      img.onerror = () => { console.warn(`이미지 프리로드 실패: ${url}`); done(); };
    });
  });
}

// =====================================================================
//  유틸
// =====================================================================
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function uniqueValues(arr) {
  return [...new Set(arr)];
}

// =====================================================================
//  초기화
// =====================================================================
async function init() {
  showLoadingScreen();
  renderStageTabs();
  renderLessonButtons();

  // 공통 이미지(자음 캐릭터 + 모음 도구) 프리로드
  const commonUrls = [
    ...Object.values(CHARACTER_MAP).map(c => c.file),
    ...Object.values(VOWEL_TOOL_MAP).map(v => v.file)
  ];
  await preloadImages(commonUrls, updateLoadingProgress);

  await loadLesson();

  document.getElementById('btn-replay-sound').addEventListener('click', () => {
    initAudioContext();
    resumeAudioContext();
    playPrompt();
  });

  const startGame = () => {
    initAudioContext();
    resumeAudioContext();
    document.getElementById('audio-init-overlay').classList.add('hide');
    setTimeout(playPrompt, 300);
  };
  document.getElementById('btn-start-game').addEventListener('click', startGame);
  document.getElementById('audio-init-overlay').addEventListener('pointerdown', startGame);

  document.getElementById('btn-replay').addEventListener('click', () => {
    hideCelebration();
    loadLesson();
  });

  // 다음 레슨: 현재 단계 안에서 진행, 단계 끝나면 다음 단계로
  document.getElementById('btn-next-lesson').addEventListener('click', () => {
    hideCelebration();
    let s = state.stageIndex;
    let l = state.lessonIndex + 1;
    if (l >= STAGES[s].lessons.length) {
      s = (s + 1) % STAGES.length;
      l = 0;
    }
    state.stageIndex = s;
    state.lessonIndex = l;
    renderStageTabs();
    renderLessonButtons();
    loadLesson();
  });
}

document.addEventListener('DOMContentLoaded', init);
