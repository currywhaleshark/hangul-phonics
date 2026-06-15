// =====================================================================
//  모음 합치기 복습 게임 (Vowel Combination Game)
//  소리를 듣고 → 자음 캐릭터 + 모음 도구를 끌어다 합쳐 → 합쳐진 글자 완성
//  모음 레슨 1~7 복습용 (각 자음 + ㅏ/ㅗ, 아아 아기는 ㅏ/ㅗ/ㅜ)
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
  'ㅗ': { name: '상자', file: '/오오 상자.png' },
  'ㅜ': { name: '발판', file: '/우우 발판.png' }
};

// --- 음절 데이터 (소리 오디오 + 합쳐진 그림) ---
const SYLLABLES = {
  // 1레슨: 아아 아기(ㅇ) + 모음 도구
  '아': { consonant: 'ㅇ', vowel: 'ㅏ', audio: '/audio/아!.mp3', combined: '/아아 아기 나뭇가지 시안.png' },
  '오': { consonant: 'ㅇ', vowel: 'ㅗ', audio: '/audio/오!.mp3', combined: '/오오 상자 시안.png' },
  '우': { consonant: 'ㅇ', vowel: 'ㅜ', audio: '/audio/우!.mp3', combined: '/우우 발판 시안.png' },
  // 2레슨: 고고(ㄱ), 나나(ㄴ)
  '가': { consonant: 'ㄱ', vowel: 'ㅏ', audio: '/audio/01_가.mp3', combined: '/고고 가 막대기 ㄱ폰트 크게 새시안.png' },
  '고': { consonant: 'ㄱ', vowel: 'ㅗ', audio: '/audio/02_고.mp3', combined: '/고고 고 상자 ㄱ폰트 크게 새시안.png' },
  '나': { consonant: 'ㄴ', vowel: 'ㅏ', audio: '/audio/01_나.mp3', combined: '/나나 나 새시안.png' },
  '노': { consonant: 'ㄴ', vowel: 'ㅗ', audio: '/audio/02_노.mp3', combined: '/나나 노 새시안.png' },
  // 3레슨: 미미(ㅁ), 부부(ㅂ)
  '마': { consonant: 'ㅁ', vowel: 'ㅏ', audio: '/audio/09_마.mp3', combined: '/미미 마 새시안.png' },
  '모': { consonant: 'ㅁ', vowel: 'ㅗ', audio: '/audio/10_모.mp3', combined: '/미미 모 새시안.png' },
  '바': { consonant: 'ㅂ', vowel: 'ㅏ', audio: '/audio/17_바.mp3', combined: '/부부 바 새시안.png' },
  '보': { consonant: 'ㅂ', vowel: 'ㅗ', audio: '/audio/18_보.mp3', combined: '/부부 보 새시안.png' },
  // 4레슨: 도도(ㄷ), 라라(ㄹ)
  '다': { consonant: 'ㄷ', vowel: 'ㅏ', audio: '/audio/25_다.mp3', combined: '/도도 다 새시안.png' },
  '도': { consonant: 'ㄷ', vowel: 'ㅗ', audio: '/audio/26_도.mp3', combined: '/도도 도 새시안.png' },
  '라': { consonant: 'ㄹ', vowel: 'ㅏ', audio: '/audio/33_라.mp3', combined: '/라라 라 새시안.png' },
  '로': { consonant: 'ㄹ', vowel: 'ㅗ', audio: '/audio/34_로.mp3', combined: '/라라 로 새시안.png' },
  // 5레슨: 사사(ㅅ), 하하(ㅎ)
  '사': { consonant: 'ㅅ', vowel: 'ㅏ', audio: '/audio/41_사.mp3', combined: '/사사 사 새시안.png' },
  '소': { consonant: 'ㅅ', vowel: 'ㅗ', audio: '/audio/42_소.mp3', combined: '/사사 소 새시안.png' },
  '하': { consonant: 'ㅎ', vowel: 'ㅏ', audio: '/audio/49_하.mp3', combined: '/하하 하 새시안.png' },
  '호': { consonant: 'ㅎ', vowel: 'ㅗ', audio: '/audio/50_호.mp3', combined: '/하하 호 새시안.png' },
  // 6레슨: 지지(ㅈ), 치치(ㅊ)
  '자': { consonant: 'ㅈ', vowel: 'ㅏ', audio: '/audio/57_자.mp3', combined: '/지지 자 새시안.png' },
  '조': { consonant: 'ㅈ', vowel: 'ㅗ', audio: '/audio/58_조.mp3', combined: '/지지 조 새시안.png' },
  '차': { consonant: 'ㅊ', vowel: 'ㅏ', audio: '/audio/65_차.mp3', combined: '/치치 차 새시안.png' },
  '초': { consonant: 'ㅊ', vowel: 'ㅗ', audio: '/audio/66_초.mp3', combined: '/치치 초 새시안.png' },
  // 7-A레슨: 코코(ㅋ), 토토(ㅌ)
  '카': { consonant: 'ㅋ', vowel: 'ㅏ', audio: '/audio/73_카.mp3', combined: '/코코 카 새시안.png' },
  '코': { consonant: 'ㅋ', vowel: 'ㅗ', audio: '/audio/74_코.mp3', combined: '/코코 코 새시안.png' },
  '타': { consonant: 'ㅌ', vowel: 'ㅏ', audio: '/audio/81_타.mp3', combined: '/토토 타 새시안.png' },
  '토': { consonant: 'ㅌ', vowel: 'ㅗ', audio: '/audio/82_토.mp3', combined: '/토토 토 새시안.png' },
  // 7-B레슨: 푸푸(ㅍ)
  '파': { consonant: 'ㅍ', vowel: 'ㅏ', audio: '/audio/89_파.mp3', combined: '/푸푸 파 새시안.png' },
  '포': { consonant: 'ㅍ', vowel: 'ㅗ', audio: '/audio/90_포.mp3', combined: '/푸푸 포 새시안.png' }
};

// --- 레슨 구성 (모음 레슨 manifest와 동일한 흐름) ---
const LESSONS = [
  { id: 'lesson-01', short: '1', title: '1레슨 · 아오우', syllables: ['아', '오', '우'] },
  { id: 'lesson-02', short: '2', title: '2레슨 · 가고나노', syllables: ['가', '고', '나', '노'] },
  { id: 'lesson-03', short: '3', title: '3레슨 · 마모바보', syllables: ['마', '모', '바', '보'] },
  { id: 'lesson-04', short: '4', title: '4레슨 · 다도라로', syllables: ['다', '도', '라', '로'] },
  { id: 'lesson-05', short: '5', title: '5레슨 · 사소하호', syllables: ['사', '소', '하', '호'] },
  { id: 'lesson-06', short: '6', title: '6레슨 · 자조차초', syllables: ['자', '조', '차', '초'] },
  { id: 'lesson-07a', short: '7-A', title: '7-A레슨 · 카코타토', syllables: ['카', '코', '타', '토'] },
  { id: 'lesson-07b', short: '7-B', title: '7-B레슨 · 파포', syllables: ['파', '포'] },
  { id: 'all', short: '전체', title: '전체 섞기 복습', syllables: Object.keys(SYLLABLES), isMixed: true }
];

// 전체 섞기 모드에서 한 번에 푸는 문제 수
const MIXED_ROUND_COUNT = 10;

// --- 게임 상태 ---
const state = {
  currentLessonIndex: 0,
  currentLesson: null,
  roundQueue: [],
  roundIndex: 0,
  target: null,          // 현재 정답 음절 (문자열)
  placed: { consonant: null, vowel: null }, // 슬롯에 놓인 값
  solvedCount: 0,
  locked: false,         // 정답 처리/전환 중 드래그 잠금
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

  // 딩-동 (G5 -> C6)
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

  // 띠용 (주파수 하강)
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

  // 스피커 버튼 살짝 튕기는 효과
  const btn = document.getElementById('btn-replay-sound');
  if (btn) {
    btn.classList.remove('pinging');
    void btn.offsetWidth; // reflow로 애니메이션 재시작
    btn.classList.add('pinging');
  }
}

// =====================================================================
//  레슨 선택 버튼 렌더링
// =====================================================================
function renderLessonButtons() {
  const container = document.getElementById('lesson-buttons-container');
  container.innerHTML = '';

  LESSONS.forEach((lesson, index) => {
    const btn = document.createElement('button');
    btn.className = `btn-lesson ${index === state.currentLessonIndex ? 'active' : ''}`;
    btn.textContent = lesson.short;
    btn.addEventListener('click', () => {
      if (index === state.currentLessonIndex) return;
      state.currentLessonIndex = index;
      loadLesson();
    });
    container.appendChild(btn);
  });
}

function syncLessonButtons() {
  document.querySelectorAll('.btn-lesson').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === state.currentLessonIndex);
  });
}

// =====================================================================
//  레슨 로딩 & 라운드 큐 구성
// =====================================================================
async function loadLesson() {
  stopPromptAudio();
  showLoadingScreen();
  syncLessonButtons();

  state.currentLesson = LESSONS[state.currentLessonIndex];
  state.solvedCount = 0;
  state.roundIndex = 0;

  // 라운드 큐 만들기
  const all = state.currentLesson.syllables.slice();
  shuffleArray(all);
  if (state.currentLesson.isMixed) {
    state.roundQueue = all.slice(0, Math.min(MIXED_ROUND_COUNT, all.length));
  } else {
    state.roundQueue = all;
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

  renderStage();
  renderTrays();

  // 진행 상황 표시 (동그라미 점)
  renderProgress(false);

  // 소리 자동 재생 (오디오 컨텍스트가 활성화된 경우)
  if (state.audioContextActivated) {
    setTimeout(playPrompt, 400);
  }
}

// 현재 라운드에 보여줄 자음/모음 선택지 계산
function buildChoices() {
  const target = SYLLABLES[state.target];

  // --- 자음 선택지 ---
  let consonants;
  if (state.currentLesson.isMixed) {
    // 정답 + 무작위 보기 (총 4개)
    const pool = Object.keys(CHARACTER_MAP).filter(c => c !== target.consonant);
    shuffleArray(pool);
    consonants = [target.consonant, ...pool.slice(0, 3)];
  } else {
    // 이 레슨에 등장하는 자음들
    consonants = uniqueValues(state.currentLesson.syllables.map(s => SYLLABLES[s].consonant));
    if (!consonants.includes(target.consonant)) consonants.push(target.consonant);
  }
  shuffleArray(consonants);

  // --- 모음 선택지 ---
  let vowels;
  if (state.currentLesson.isMixed) {
    vowels = Object.keys(VOWEL_TOOL_MAP); // ㅏ/ㅗ/ㅜ 전부
  } else {
    vowels = uniqueValues(state.currentLesson.syllables.map(s => SYLLABLES[s].vowel));
    if (!vowels.includes(target.vowel)) vowels.push(target.vowel);
  }
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
    const card = makeCard({ type: 'consonant', value: c, name: info.name, image: info.file, id: `c-${i}` });
    consonantBank.appendChild(card);
  });

  vowels.forEach((v, i) => {
    const info = VOWEL_TOOL_MAP[v];
    if (!info) return;
    const card = makeCard({ type: 'vowel', value: v, name: info.name, image: info.file, id: `v-${i}` });
    vowelBank.appendChild(card);
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
    if (activeDrag) return;          // 멀티터치 방지
    if (state.locked) return;        // 전환 중에는 드래그 금지

    // iOS/사파리 오디오 컨텍스트 보장
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
      // 트레이로 부드럽게 복귀
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

// 슬롯에 카드 놓기 (자음/모음)
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

  // 결과 칸에 합쳐진 그림 공개
  const result = document.getElementById('result-box');
  const combined = SYLLABLES[state.target].combined;
  result.innerHTML = `<img src="${combined}" alt="${state.target}" draggable="false">`;
  result.classList.add('revealed');
  starBurst();

  // 진행 점에서 현재 문제를 바로 완료 표시
  renderProgress(true);

  document.getElementById('prompt-title').textContent = `${state.target}! 정답이에요 🎉`;

  // 소리 한 번 더 들려주기
  setTimeout(playPrompt, 450);

  state.solvedCount++;

  // 다음 라운드 또는 완료
  setTimeout(() => {
    if (state.roundIndex < state.roundQueue.length - 1) {
      state.roundIndex++;
      document.getElementById('prompt-title').textContent = '소리를 잘 듣고 합쳐요!';
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
  renderLessonButtons();

  // 공통 이미지(자음 캐릭터 + 모음 도구) 프리로드
  const commonUrls = [
    ...Object.values(CHARACTER_MAP).map(c => c.file),
    ...Object.values(VOWEL_TOOL_MAP).map(v => v.file)
  ];
  await preloadImages(commonUrls, updateLoadingProgress);

  await loadLesson();

  // 소리 다시 듣기 버튼
  document.getElementById('btn-replay-sound').addEventListener('click', () => {
    initAudioContext();
    resumeAudioContext();
    playPrompt();
  });

  // 오디오 활성화 오버레이 (Safari/iOS 자동재생 정책 우회)
  const startGame = () => {
    initAudioContext();
    resumeAudioContext();
    document.getElementById('audio-init-overlay').classList.add('hide');
    setTimeout(playPrompt, 300);
  };
  document.getElementById('btn-start-game').addEventListener('click', startGame);
  document.getElementById('audio-init-overlay').addEventListener('pointerdown', startGame);

  // 다시 하기
  document.getElementById('btn-replay').addEventListener('click', () => {
    hideCelebration();
    loadLesson();
  });

  // 다음 레슨
  document.getElementById('btn-next-lesson').addEventListener('click', () => {
    hideCelebration();
    state.currentLessonIndex = (state.currentLessonIndex + 1) % LESSONS.length;
    renderLessonButtons();
    loadLesson();
  });
}

document.addEventListener('DOMContentLoaded', init);
