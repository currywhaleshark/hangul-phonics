export const TIMING_SCHEMA_VERSION = 1;

export const MIN_CUE_LENGTH = 0.03;

export const DEFAULT_TIMING_PROJECT_ID = "gogo-g";

export const GOGO_TIMING_STORAGE_KEY = "hangul-phonics:gogo-g-card-timings";

export const DEFAULT_GOGO_TIMING_FILE = "gogo-g-card-timings.json";

const DEFAULT_BACKGROUND = "public/video-assets/consonant-lesson-samples/gogo-g-background.png";

const CARD_POSITIONS = [
  { left: 20, top: 39, accent: "#ff8470" },
  { left: 78, top: 40, accent: "#ffc450" },
  { left: 22, top: 74, accent: "#6ac2ff" },
  { left: 78, top: 73, accent: "#79ce91" },
  { left: 55, top: 78, accent: "#b291ff" },
];

const WORD_TIMES = [
  { start: 14.2, end: 15.45 },
  { start: 15.75, end: 16.85 },
  { start: 19.8, end: 20.65 },
  { start: 20.6, end: 21.45 },
  { start: 21.35, end: 22.3 },
];

const LETTER_TIMES = [
  { id: "intro-1", start: 8.35, end: 8.83, position: { left: 48, top: 28 } },
  { id: "intro-2", start: 9.05, end: 9.53, position: { left: 56, top: 26 } },
  { id: "intro-3", start: 9.75, end: 10.23, position: { left: 44, top: 27 } },
  { id: "repeat-1", start: 28.45, end: 28.93, position: { left: 48, top: 28 } },
  { id: "repeat-2", start: 29.15, end: 29.63, position: { left: 56, top: 26 } },
  { id: "repeat-3", start: 29.85, end: 30.33, position: { left: 44, top: 27 } },
  { id: "repeat-4", start: 30.75, end: 31.23, position: { left: 48, top: 28 } },
  { id: "repeat-5", start: 31.45, end: 31.93, position: { left: 56, top: 26 } },
  { id: "repeat-6", start: 32.15, end: 32.63, position: { left: 44, top: 27 } },
];

const VOWEL_STORY_SCENE_TIMES = [
  { start: 0, end: 5.2 },
  { start: 5.2, end: 8.65 },
  { start: 8.65, end: 12.95 },
  { start: 12.95, end: 21.12 },
];

const VOWEL_STORY_WORD_TIMES = [
  { start: 13.15, end: 15.35, position: { left: 20, top: 63 }, accent: "#ffb703" },
  { start: 15.25, end: 17.35, position: { left: 50, top: 63 }, accent: "#8ecae6" },
  { start: 17.25, end: 19.8, position: { left: 80, top: 63 }, accent: "#ff8fab" },
];

const VOWEL_STORY_LETTER_TIMES = [
  { id: "intro-aa", start: 0.15, end: 1.25, position: { left: 18, top: 24 } },
  { id: "branch-aa", start: 8.85, end: 10.05, position: { left: 18, top: 24 } },
  { id: "final-a", start: 19.85, end: 21.05, position: { left: 50, top: 24 } },
];

const VOWEL_COMBINE_TIMES = [
  {
    id: "baby",
    label: "\uC544\uC544 \uC544\uAE30",
    assetKind: "baby",
    start: 0.2,
    end: 5.8,
    fromPosition: { left: 18, top: 56 },
    toPosition: { left: 43, top: 56 },
    position: { left: 43, top: 56 },
    scale: 0.54,
  },
  {
    id: "tool",
    label: "\uBAA8\uC74C\uB3C4\uAD6C",
    assetKind: "tool",
    start: 0.2,
    end: 5.8,
    fromPosition: { left: 82, top: 57 },
    toPosition: { left: 58, top: 57 },
    position: { left: 58, top: 57 },
    scale: 0.74,
  },
  {
    id: "combined",
    label: "\uD569\uCE5C \uC774\uBBF8\uC9C0",
    assetKind: "combined",
    start: 5.55,
    end: 11.6,
    fromPosition: { left: 50, top: 55 },
    toPosition: { left: 50, top: 55 },
    position: { left: 50, top: 55 },
    scale: 0.62,
  },
];

const VOWEL_COMBINE_WORD_TIMES = [
  { start: 12.0, end: 13.25, position: { left: 24, top: 72 }, accent: "#ffb703" },
  { start: 13.15, end: 14.4, position: { left: 50, top: 72 }, accent: "#8ecae6" },
  { start: 14.3, end: 15.65, position: { left: 76, top: 72 }, accent: "#ff8fab" },
];

const VOWEL_COMBINE_LETTER_TIMES = [
  { id: "say", start: 8.3, end: 10.0, position: { left: 50, top: 22 } },
  { id: "final", start: 15.75, end: 18.8, position: { left: 50, top: 22 } },
];

const vowelAlphaToolAsset = (file) => `public/video-assets/vowel-alpha/tools/${file}`;
const vowelAlphaCombinedAsset = (file) => `public/video-assets/vowel-alpha/combined/${file}`;

const LESSON_AUDIO = {
  "lesson-01-aa-baby-vowel": {
    src: "lessons/vowels/lesson-01-aa-baby-vowel/\uC544.wav",
    duration: 21.12,
  },
  "lesson-01-aa-baby-vowel-o": {
    src: "lessons/vowels/lesson-01-aa-baby-vowel/\uC624.wav",
    duration: 19.400272,
  },
  "lesson-01-aa-baby-vowel-u": {
    src: "lessons/vowels/lesson-01-aa-baby-vowel/\uC6B0.wav",
    duration: 16.280272,
  },
  "lesson-01-gogo-nana": {
    src: "lessons/consonants/lesson-01-gogo-nana/ㄱ, ㄴ 소개.wav",
    duration: 83.040272,
  },
  "lesson-02-mimi-bubu": {
    src: "lessons/consonants/lesson-02-mimi-bubu/ㅁ,ㅂ 소개.wav",
  },
  "lesson-03-dodo-rara": {
    src: "lessons/consonants/lesson-03-dodo-rara/ㄷ,ㄹ 소개(2).wav",
  },
  "lesson-04-sasa-haha": {
    src: "lessons/consonants/lesson-04-sasa-haha/ㅅ, ㅎ 소개.wav",
  },
  "lesson-05-jiji-chichi": {
    src: "lessons/consonants/lesson-05-jiji-chichi/ㅈ,ㅊ 소개.wav",
  },
  "lesson-06a-koko-toto-pupu-meet": {
    src: "lessons/consonants/lesson-06a-koko-toto-pupu-meet/ㅋ,ㅌ,ㅍ 소개.wav",
  },
};

const asset = (file) => `worksheets/assets/${file}`;
const characterAsset = (file) => `public/video-assets/characters/consonants/${file}`;
const vowelStoryAsset = (file) => `lessons/vowels/lesson-01-aa-baby-vowel/${file}`;

export const CONSONANT_TIMING_PROJECTS = [
  defineProject({
    id: "gogo-g",
    lessonId: "lesson-01-gogo-nana",
    segment: { start: 0, end: 35.37 },
    character: { key: "gogo", name: "고고 고양이", letter: "ㄱ", image: characterAsset("ㄱ-gogo-cat.png") },
    words: [
      { id: "dog", label: "강아지", image: asset("dog.png") },
      { id: "bear", label: "곰", image: asset("bear.png") },
      { id: "meat", label: "고기", image: asset("meat.png") },
      { id: "snack", label: "과자", image: asset("snack.png") },
      { id: "noodles", label: "국수", image: asset("noodles.png") },
    ],
  }),
  defineProject({
    id: "nana-n",
    lessonId: "lesson-01-gogo-nana",
    segment: { start: 35.37, end: 83.04 },
    character: { key: "nana", name: "나나 나비", letter: "ㄴ", image: characterAsset("ㄴ-nana-butterfly.png") },
    words: [
      { id: "nana-word-1", label: "노란색", image: asset("word-no-yellow.png") },
      { id: "nana-word-2", label: "너구리", image: asset("raccoon-dog.png") },
      { id: "nana-word-3", label: "나무", image: asset("nieun-tree.png") },
      { id: "nana-word-5", label: "낮잠", image: asset("nap.png") },
    ],
    removedCueIds: { cues: ["nana-word-4"] },
  }),
  defineProject({
    id: "mimi-m",
    lessonId: "lesson-02-mimi-bubu",
    segment: { start: 0, end: 35 },
    character: { key: "mimi", name: "미미 문어", letter: "ㅁ", image: characterAsset("ㅁ-mimi-octopus.png") },
    words: [
      { label: "모자", image: asset("hat.png") },
      { label: "문", image: asset("door.png") },
      { label: "물", image: asset("water.png") },
      { label: "무지개", image: asset("rainbow.png") },
      { label: "미끄럼틀", image: asset("slide.png") },
    ],
  }),
  defineProject({
    id: "bubu-b",
    lessonId: "lesson-02-mimi-bubu",
    segment: { start: 35, end: 70 },
    character: { key: "bubu", name: "부부 부엉이", letter: "ㅂ", image: characterAsset("ㅂ-bubu-owl.png") },
    words: [
      { label: "바나나", image: asset("banana.png") },
      { label: "버스", image: asset("bus.png") },
      { label: "별", image: asset("star.png") },
      { label: "비", image: asset("rain.png") },
      { label: "바구니", image: asset("basket.png") },
    ],
  }),
  defineProject({
    id: "dodo-d",
    lessonId: "lesson-03-dodo-rara",
    segment: { start: 0, end: 35 },
    character: { key: "dodo", name: "도도 도토리", letter: "ㄷ", image: characterAsset("ㄷ-dodo-acorn.png") },
    words: [
      { label: "다람쥐", image: asset("squirrel.png") },
      { label: "달", image: asset("moon.png") },
      { label: "다리", image: asset("bridge.png") },
      { label: "도넛", image: asset("donut.png") },
      { label: "도토리", image: asset("acorn.png") },
    ],
  }),
  defineProject({
    id: "rara-r",
    lessonId: "lesson-03-dodo-rara",
    segment: { start: 35, end: 70 },
    character: { key: "rara", name: "라라 리본", letter: "ㄹ", image: characterAsset("ㄹ-rara-ribbon.png") },
    words: [
      { label: "라면", image: asset("ramen.png") },
      { label: "로봇", image: asset("robot.png") },
      { label: "리본", image: asset("ribbon.png") },
      { label: "라디오", image: asset("radio.png") },
      { label: "레몬", image: asset("lemon.png") },
    ],
  }),
  defineProject({
    id: "sasa-s",
    lessonId: "lesson-04-sasa-haha",
    segment: { start: 0, end: 35 },
    character: { key: "sasa", name: "사사 사슴", letter: "ㅅ", image: characterAsset("ㅅ-sasa-deer.png") },
    words: [
      { label: "사과", image: asset("apple.png") },
      { label: "수박", image: asset("watermelon.png") },
      { label: "산", image: asset("mountain.png") },
      { label: "손", image: asset("hand.png") },
      { label: "사탕", image: asset("candy.png") },
    ],
  }),
  defineProject({
    id: "haha-h",
    lessonId: "lesson-04-sasa-haha",
    segment: { start: 35, end: 70 },
    character: { key: "haha", name: "하하 하마", letter: "ㅎ", image: characterAsset("ㅎ-haha-hippo.png") },
    words: [
      { label: "해", image: asset("sun.png") },
      { label: "하트", image: asset("heart.png") },
      { label: "호랑이", image: asset("tiger.png") },
      { label: "하모니카", image: asset("harmonica.png") },
      { label: "햄버거", image: asset("hamburger.png") },
    ],
  }),
  defineProject({
    id: "jiji-j",
    lessonId: "lesson-05-jiji-chichi",
    segment: { start: 0, end: 35 },
    character: { key: "jiji", name: "지지 지렁이", letter: "ㅈ", image: characterAsset("ㅈ-jiji-worm.png") },
    words: [
      { label: "자동차", image: asset("car.png") },
      { label: "집", image: asset("house.png") },
      { label: "주스", image: asset("juice.png") },
      { label: "지갑", image: asset("wallet.png") },
      { label: "젤리", image: asset("jelly.png") },
    ],
  }),
  defineProject({
    id: "chichi-ch",
    lessonId: "lesson-05-jiji-chichi",
    segment: { start: 35, end: 70 },
    character: { key: "chichi", name: "치치 칙폭이", letter: "ㅊ", image: characterAsset("ㅊ-chichi-train.png") },
    words: [
      { label: "치즈", image: asset("cheese.png") },
      { label: "책", image: asset("book.png") },
      { label: "초콜릿", image: asset("chocolate.png") },
      { label: "치마", image: asset("skirt.png") },
      { label: "친구", image: asset("friend.png") },
    ],
  }),
  defineProject({
    id: "koko-k",
    lessonId: "lesson-06a-koko-toto-pupu-meet",
    segment: { start: 0, end: 35 },
    character: { key: "koko", name: "코코 코알라", letter: "ㅋ", image: characterAsset("ㅋ-koko-koala.png") },
    words: [
      { label: "쿠키", image: asset("cookie.png") },
      { label: "콩", image: asset("bean.png") },
      { label: "카드", image: asset("card.png") },
      { label: "크레용", image: asset("crayon.png") },
      { label: "코끼리", image: asset("elephant.png") },
    ],
  }),
  defineProject({
    id: "toto-t",
    lessonId: "lesson-06a-koko-toto-pupu-meet",
    segment: { start: 35, end: 70 },
    character: { key: "toto", name: "토토 토끼", letter: "ㅌ", image: characterAsset("ㅌ-toto-rabbit.png") },
    words: [
      { label: "토마토", image: asset("tomato.png") },
      { label: "택시", image: asset("taxi.png") },
      { label: "타조", image: asset("ostrich.png") },
      { label: "튤립", image: asset("tulip.png") },
      { label: "토끼풀", image: asset("clover.png") },
    ],
  }),
  defineProject({
    id: "pupu-p",
    lessonId: "lesson-06a-koko-toto-pupu-meet",
    segment: { start: 70, end: 105 },
    character: { key: "pupu", name: "푸푸 풍선", letter: "ㅍ", image: characterAsset("ㅍ-pupu-balloon.png") },
    words: [
      { label: "포도", image: asset("grapes.png") },
      { label: "피자", image: asset("pizza.png") },
      { label: "풀", image: asset("grass.png") },
      { label: "풍선", image: asset("balloon.png") },
      { label: "파도", image: asset("wave.png") },
    ],
  }),
];

export const VOWEL_TIMING_PROJECTS = [
  defineVowelStoryProject({
    id: "aa-a",
    lessonId: "lesson-01-aa-baby-vowel",
    segment: { start: 0, end: 21.12 },
    character: {
      key: "aa",
      name: "\uC544\uC544 \uC544\uAE30",
      letter: "\uC544",
      image: vowelStoryAsset("aa-story-01-silent.png"),
    },
    scenes: [
      { id: "aa-silent", label: "\uC870\uC6A9\uC870\uC6A9", image: vowelStoryAsset("aa-story-01-silent.png") },
      { id: "aa-branch", label: "\uB098\uBB47\uAC00\uC9C0", image: vowelStoryAsset("aa-story-02-branch.png") },
      { id: "aa-ah", label: "\uC544!", image: vowelStoryAsset("aa-story-03-ah.png") },
      { id: "aa-combined", label: "\uC544\uC544 \uC544\uAE30 \uB098\uBB47\uAC00\uC9C0", image: "\uC544\uC544 \uC544\uAE30 \uB098\uBB47\uAC00\uC9C0 \uC2DC\uC548.png" },
    ],
    words: [
      { id: "aa-baby", label: "\uC544\uAE30", image: asset("baby.png") },
      { id: "aa-morning", label: "\uC544\uCE68", image: asset("morning.png") },
      { id: "aa-ice-cream", label: "\uC544\uC774\uC2A4\uD06C\uB9BC", image: asset("ice-cream.png") },
    ],
  }),
];

export const VOWEL_COMBINE_TIMING_PROJECTS = [
  defineVowelCombineProject({
    id: "oo-o",
    lessonId: "lesson-01-aa-baby-vowel-o",
    segment: { start: 0, end: 19.4 },
    character: {
      key: "oo",
      name: "\uC624\uC624 \uC0C1\uC790",
      letter: "\uC624",
      image: vowelAlphaCombinedAsset("\uC624\uC624 \uC0C1\uC790 \uC2DC\uC548-alpha.png"),
    },
    toolLabel: "\uC624\uC624 \uC0C1\uC790",
    toolImage: vowelAlphaToolAsset("\uC624\uC624 \uC0C1\uC790-alpha.png"),
    combinedImage: vowelAlphaCombinedAsset("\uC624\uC624 \uC0C1\uC790 \uC2DC\uC548-alpha.png"),
    words: [
      { id: "oo-cucumber", label: "\uC624\uC774", image: asset("cucumber.png") },
      { id: "oo-duck", label: "\uC624\uB9AC", image: asset("duck.png") },
      { id: "oo-orangutan", label: "\uC624\uB791\uC6B0\uD0C4", image: asset("orangutan.png") },
    ],
  }),
  defineVowelCombineProject({
    id: "uu-u",
    lessonId: "lesson-01-aa-baby-vowel-u",
    segment: { start: 0, end: 16.28 },
    character: {
      key: "uu",
      name: "\uC6B0\uC6B0 \uBC1C\uD310",
      letter: "\uC6B0",
      image: vowelAlphaCombinedAsset("\uC6B0\uC6B0 \uBC1C\uD310 \uC2DC\uC548-alpha.png"),
    },
    toolLabel: "\uC6B0\uC6B0 \uBC1C\uD310",
    toolImage: vowelAlphaToolAsset("\uC6B0\uC6B0 \uBC1C\uD310-alpha.png"),
    combinedImage: vowelAlphaCombinedAsset("\uC6B0\uC6B0 \uBC1C\uD310 \uC2DC\uC548-alpha.png"),
    words: [
      { id: "uu-umbrella", label: "\uC6B0\uC0B0", image: asset("umbrella.png") },
      { id: "uu-milk", label: "\uC6B0\uC720", image: asset("milk.png") },
      { id: "uu-well", label: "\uC6B0\uBB3C", image: asset("well.png") },
    ],
  }),
];

export const TIMING_PROJECTS = [...CONSONANT_TIMING_PROJECTS, ...VOWEL_TIMING_PROJECTS, ...VOWEL_COMBINE_TIMING_PROJECTS];

export const DEFAULT_GOGO_TIMING_PROJECT = buildDefaultTimingProject(CONSONANT_TIMING_PROJECTS[0]);

function defineProject({ id, lessonId, segment, character, words, removedCueIds }) {
  const audio = LESSON_AUDIO[lessonId];
  return buildDefaultTimingProject({
    id,
    lessonId,
    title: `${character.name} ${character.letter} 단어카드`,
    character,
    audio,
    segment: { label: character.name, ...segment },
    words,
    removedCueIds,
    render: {
      background: DEFAULT_BACKGROUND,
      outputSlug: id,
      timingFile: `${id}-card-timings.json`,
    },
  });
}

function defineVowelStoryProject({ id, lessonId, segment, character, scenes, words }) {
  const audio = LESSON_AUDIO[lessonId];
  return buildDefaultTimingProject({
    id,
    lessonId,
    template: "vowel-story",
    title: `${character.name} ${character.letter} \uBAA8\uC74C \uC774\uC57C\uAE30`,
    character,
    audio,
    segment: { label: character.name, ...segment },
    words,
    scenes,
    render: {
      outputSlug: id,
      timingFile: `${id}-vowel-timings.json`,
    },
  });
}

function defineVowelCombineProject({ id, lessonId, segment, character, toolLabel, toolImage, combinedImage, words }) {
  const audio = LESSON_AUDIO[lessonId];
  return buildDefaultTimingProject({
    id,
    lessonId,
    template: "vowel-combine-story",
    title: `${character.name} ${character.letter} \uBAA8\uC74C \uB9CC\uB0A8`,
    character,
    audio,
    segment: { label: character.name, ...segment },
    words,
    combine: {
      babyImage: vowelAlphaCombinedAsset("\uC544\uC544 \uC544\uAE30 \uB098\uBB47\uAC00\uC9C0 \uC2DC\uC548-alpha.png"),
      toolLabel,
      toolImage,
      combinedImage,
    },
    render: {
      outputSlug: id,
      timingFile: `${id}-vowel-timings.json`,
    },
  });
}

function buildDefaultTimingProject(definition) {
  const project = {
    schemaVersion: TIMING_SCHEMA_VERSION,
    id: definition.id,
    lessonId: definition.lessonId,
    title: definition.title,
    template: definition.template ?? "consonant-card",
    character: definition.character,
    audio: definition.audio,
    segment: definition.segment,
    sceneCues: makeSceneCues(definition.scenes ?? [], definition.segment.start),
    combineCues: makeCombineCues(definition.combine, definition.character.key, definition.segment.start, definition.template),
    cues: makeWordCues(definition.words ?? [], definition.character.key, definition.segment.start, definition.template),
    letterCues: makeLetterCues(definition.character.letter, definition.character.key, definition.segment.start, definition.template),
    removedCueIds: definition.removedCueIds,
    render: definition.render,
  };

  return clonePlainObject(project);
}

function makeSceneCues(scenes, segmentStart) {
  return scenes.map((scene, index) => {
    const timing = VOWEL_STORY_SCENE_TIMES[index] ?? { start: index * 4, end: index * 4 + 4 };
    return {
      id: scene.id ?? `scene-${index + 1}`,
      label: scene.label,
      image: scene.image,
      start: catalogTime(segmentStart + timing.start),
      end: catalogTime(segmentStart + timing.end),
    };
  });
}

function makeCombineCues(combine, characterKey, segmentStart, template = "consonant-card") {
  if (template !== "vowel-combine-story" || !combine) {
    return [];
  }

  const images = {
    baby: combine.babyImage,
    tool: combine.toolImage,
    combined: combine.combinedImage,
  };
  const labels = {
    baby: "\uC544\uAE30",
    tool: combine.toolLabel,
    combined: "\uD569\uCE5C \uC774\uBBF8\uC9C0",
  };

  return VOWEL_COMBINE_TIMES.map((timing) => ({
    id: `${characterKey}-${timing.id}`,
    label: labels[timing.assetKind],
    assetKind: timing.assetKind,
    image: images[timing.assetKind],
    start: catalogTime(segmentStart + timing.start),
    end: catalogTime(segmentStart + timing.end),
    fromPosition: clonePlainObject(timing.fromPosition),
    toPosition: clonePlainObject(timing.toPosition),
    position: clonePlainObject(timing.position),
    scale: timing.scale,
  }));
}

function makeWordCues(words, characterKey, segmentStart, template = "consonant-card") {
  return words.map((word, index) => {
    const vowelTiming = template === "vowel-story"
      ? VOWEL_STORY_WORD_TIMES[index]
      : template === "vowel-combine-story"
        ? VOWEL_COMBINE_WORD_TIMES[index]
        : null;
    const slot = vowelTiming?.position
      ? { ...vowelTiming.position, accent: vowelTiming.accent }
      : CARD_POSITIONS[index % CARD_POSITIONS.length];
    const timing = vowelTiming ?? WORD_TIMES[index] ?? { start: 14.2 + index * 1.2, end: 15.1 + index * 1.2 };
    return {
      id: word.id ?? `${characterKey}-word-${index + 1}`,
      label: word.label,
      image: word.image,
      start: catalogTime(segmentStart + timing.start),
      end: catalogTime(segmentStart + timing.end),
      position: { left: slot.left, top: slot.top },
      accent: slot.accent,
    };
  });
}

function makeLetterCues(letter, characterKey, segmentStart, template = "consonant-card") {
  const timings = template === "vowel-story"
    ? VOWEL_STORY_LETTER_TIMES
    : template === "vowel-combine-story"
      ? VOWEL_COMBINE_LETTER_TIMES
      : LETTER_TIMES;
  return timings.map((cue) => ({
    id: characterKey === "gogo" ? `g-${cue.id}` : `${characterKey}-${cue.id}`,
    label: letter,
    start: catalogTime(segmentStart + cue.start),
    end: catalogTime(segmentStart + cue.end),
    position: clonePlainObject(cue.position),
  }));
}

function clonePlainObject(value) {
  return JSON.parse(JSON.stringify(value));
}

function catalogTime(value) {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}
export function cloneTimingProject(project) {
  return JSON.parse(JSON.stringify(project));
}

export function getTimingProjectDefinition(projectId = DEFAULT_TIMING_PROJECT_ID) {
  const definition = TIMING_PROJECTS.find((project) => project.id === projectId);
  if (!definition) {
    throw new Error(`Unknown timing project id: ${projectId}`);
  }

  return cloneTimingProject(definition);
}

export function createDefaultTimingProject(projectId = DEFAULT_TIMING_PROJECT_ID) {
  return getTimingProjectDefinition(projectId);
}

export function createDefaultGogoTimingProject() {
  return createDefaultTimingProject(DEFAULT_TIMING_PROJECT_ID);
}

export function getTimingStorageKey(projectOrId = DEFAULT_TIMING_PROJECT_ID) {
  const projectId = typeof projectOrId === "string" ? projectOrId : projectOrId?.id;
  return `hangul-phonics:timing:${projectId || DEFAULT_TIMING_PROJECT_ID}`;
}

export function getTimingExportFileName(projectOrId = DEFAULT_TIMING_PROJECT_ID) {
  const project = typeof projectOrId === "string" ? getTimingProjectDefinition(projectOrId) : projectOrId;
  return project?.render?.timingFile ?? `${project?.id || DEFAULT_TIMING_PROJECT_ID}-card-timings.json`;
}

export const TIMING_CUE_COLLECTIONS = ["cues", "letterCues", "sceneCues", "combineCues"];

function mergeTimingProjectDefaults(project) {
  const projectId = project.id ?? DEFAULT_TIMING_PROJECT_ID;
  const defaults = createDefaultTimingProject(projectId);
  const removedCueIds = mergeRemovedCueIds(defaults.removedCueIds, project.removedCueIds);
  const merged = {
    ...defaults,
    ...cloneTimingProject(project),
    id: project.id ?? defaults.id,
    lessonId: project.lessonId ?? defaults.lessonId,
    character: {
      ...defaults.character,
      ...(project.character ?? {}),
    },
    audio: {
      ...defaults.audio,
      ...(project.audio ?? {}),
    },
    segment: {
      ...defaults.segment,
      ...(project.segment ?? {}),
    },
    render: {
      ...defaults.render,
      ...(project.render ?? {}),
    },
    sceneCues: Array.isArray(project.sceneCues) ? mergeCueDefaults(project.sceneCues, defaults.sceneCues, removedCueIds.sceneCues) : defaults.sceneCues,
    combineCues: Array.isArray(project.combineCues) ? mergeCueDefaults(project.combineCues, defaults.combineCues, removedCueIds.combineCues) : defaults.combineCues,
    cues: Array.isArray(project.cues) ? mergeCueDefaults(project.cues, defaults.cues, removedCueIds.cues) : defaults.cues,
    letterCues: Array.isArray(project.letterCues) ? mergeCueDefaults(project.letterCues, defaults.letterCues, removedCueIds.letterCues) : defaults.letterCues,
  };

  if (Object.keys(removedCueIds).length > 0) {
    merged.removedCueIds = removedCueIds;
  } else {
    delete merged.removedCueIds;
  }

  return merged;
}
function mergeCueDefaults(cues, defaultCues, removedCueIds = []) {
  const removedIds = new Set(removedCueIds);
  const mergedCues = cues.filter((cue) => !removedIds.has(cue.id)).map((cue, index) => {
    const defaultCue = defaultCues.find((item) => item.id === cue.id) ?? defaultCues[index] ?? {};
    const merged = {
      ...cloneTimingProject(defaultCue),
      ...cloneTimingProject(cue),
    };

    if (defaultCue.position || cue.position) {
      merged.position = {
        ...(defaultCue.position ?? {}),
        ...(cue.position ?? {}),
      };
    }

    if (!Number.isFinite(cue.end) && Number.isFinite(cue.duration) && Number.isFinite(merged.start)) {
      merged.end = merged.start + cue.duration;
    }

    normalizeCueTiming(merged, defaultCue);
    delete merged.duration;
    return merged;
  });

  const existingIds = new Set(mergedCues.map((cue) => cue.id));
  defaultCues.forEach((defaultCue) => {
    if (!existingIds.has(defaultCue.id) && !removedIds.has(defaultCue.id)) {
      mergedCues.push(cloneTimingProject(defaultCue));
    }
  });

  return mergedCues;
}

function mergeRemovedCueIds(defaultRemovedCueIds, projectRemovedCueIds) {
  const merged = normalizeRemovedCueIds(defaultRemovedCueIds);
  const projectRemoved = normalizeRemovedCueIds(projectRemovedCueIds);

  TIMING_CUE_COLLECTIONS.forEach((collectionName) => {
    const ids = new Set([...(merged[collectionName] ?? []), ...(projectRemoved[collectionName] ?? [])]);
    if (ids.size > 0) {
      merged[collectionName] = [...ids];
    }
  });

  return merged;
}
function normalizeRemovedCueIds(value) {
  const normalized = {};
  if (!value || typeof value !== "object") {
    return normalized;
  }

  TIMING_CUE_COLLECTIONS.forEach((collectionName) => {
    if (!Array.isArray(value[collectionName])) {
      return;
    }

    const ids = [...new Set(value[collectionName].filter((id) => typeof id === "string" && id.length > 0))];
    if (ids.length > 0) {
      normalized[collectionName] = ids;
    }
  });

  return normalized;
}

function addRemovedCueId(removedCueIds, collectionName, cueId) {
  const normalized = normalizeRemovedCueIds(removedCueIds);
  const ids = new Set(normalized[collectionName] ?? []);
  ids.add(cueId);
  return {
    ...normalized,
    [collectionName]: [...ids],
  };
}
function normalizeCueTiming(cue, defaultCue = {}) {
  if (cue.start === undefined && Number.isFinite(defaultCue.start)) {
    cue.start = defaultCue.start;
  }

  if (cue.end === undefined) {
    if (Number.isFinite(cue.duration) && Number.isFinite(cue.start)) {
      cue.end = cue.start + cue.duration;
    } else if (Number.isFinite(defaultCue.end)) {
      cue.end = defaultCue.end;
    } else if (Number.isFinite(cue.start)) {
      cue.end = cue.start + 1;
    }
  }

  if (Number.isFinite(cue.start)) {
    cue.start = roundTime(cue.start);
  }

  if (Number.isFinite(cue.end) && Number.isFinite(cue.start)) {
    cue.end = roundTime(Math.max(cue.end, cue.start + MIN_CUE_LENGTH));
  }
}

export function roundTime(value) {
  if (!Number.isFinite(value)) {
    throw new TypeError("time must be a finite number");
  }

  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

export function clampTime(value, min = 0, max = Number.POSITIVE_INFINITY) {
  if (!Number.isFinite(value)) {
    throw new TypeError("time must be a finite number");
  }

  const bounded = Math.min(Math.max(value, min), max);
  return roundTime(bounded);
}

export function clampPositionPercent(value) {
  return clampTime(value, 5, 95);
}

export function formatClockTime(value) {
  const totalMilliseconds = Math.max(0, Math.round(value * 1000));
  const minutes = Math.floor(totalMilliseconds / 60000);
  const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
  const milliseconds = totalMilliseconds % 1000;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

export function sortCues(cues) {
  return cues
    .map((cue, index) => ({ cue, index }))
    .sort((left, right) => {
      if (left.cue.start !== right.cue.start) {
        return left.cue.start - right.cue.start;
      }

      return left.index - right.index;
    })
    .map(({ cue }) => ({ ...cue }));
}

export function setCueStart(project, cueId, start, collectionName = "cues") {
  const min = Number.isFinite(project.segment?.start) ? project.segment.start : 0;
  const max = Number.isFinite(project.segment?.end) ? project.segment.end : Number.POSITIVE_INFINITY;
  const sourceCues = project[collectionName];
  if (!Array.isArray(sourceCues)) {
    throw new Error(`Unknown cue collection: ${collectionName}`);
  }

  let found = false;
  const cues = sourceCues.map((cue) => {
    if (cue.id !== cueId) {
      return { ...cue };
    }

    found = true;
    const span = Math.max((cue.end ?? cue.start + MIN_CUE_LENGTH) - cue.start, MIN_CUE_LENGTH);
    const startMax = Number.isFinite(max) ? max - MIN_CUE_LENGTH : max;
    const nextStart = clampTime(start, min, startMax);
    const nextEnd = cue.end > nextStart ? cue.end : nextStart + span;
    return { ...cue, start: nextStart, end: clampTime(nextEnd, nextStart + MIN_CUE_LENGTH, max) };
  });

  if (!found) {
    throw new Error(`Unknown cue id: ${cueId}`);
  }

  return { ...project, [collectionName]: cues };
}

export function setCueEnd(project, cueId, end, collectionName = "cues") {
  const max = Number.isFinite(project.segment?.end) ? project.segment.end : Number.POSITIVE_INFINITY;
  const sourceCues = project[collectionName];
  if (!Array.isArray(sourceCues)) {
    throw new Error(`Unknown cue collection: ${collectionName}`);
  }

  let found = false;
  const cues = sourceCues.map((cue) => {
    if (cue.id !== cueId) {
      return { ...cue };
    }

    found = true;
    const minEnd = cue.start + MIN_CUE_LENGTH;
    return { ...cue, end: clampTime(end, minEnd, max) };
  });

  if (!found) {
    throw new Error(`Unknown cue id: ${cueId}`);
  }

  return { ...project, [collectionName]: cues };
}

export function setCuePosition(project, cueId, position, collectionName = "cues") {
  const sourceCues = project[collectionName];
  if (!Array.isArray(sourceCues)) {
    throw new Error(`Unknown cue collection: ${collectionName}`);
  }

  let found = false;
  const cues = sourceCues.map((cue) => {
    if (cue.id !== cueId) {
      return { ...cue };
    }

    found = true;
    return {
      ...cue,
      position: {
        left: clampPositionPercent(position.left),
        top: clampPositionPercent(position.top),
      },
    };
  });

  if (!found) {
    throw new Error(`Unknown cue id: ${cueId}`);
  }

  return { ...project, [collectionName]: cues };
}

export function removeCue(project, cueId, collectionName = "cues") {
  const sourceCues = project[collectionName];
  if (!Array.isArray(sourceCues)) {
    throw new Error(`Unknown cue collection: ${collectionName}`);
  }

  const cue = sourceCues.find((item) => item.id === cueId);
  if (!cue) {
    throw new Error(`Unknown cue id: ${cueId}`);
  }

  if (collectionName === "cues" && sourceCues.length <= 1) {
    throw new Error("timing project cues are required");
  }

  return {
    ...project,
    [collectionName]: sourceCues.filter((item) => item.id !== cueId).map((item) => ({ ...item })),
    removedCueIds: addRemovedCueId(project.removedCueIds, collectionName, cueId),
  };
}
export function nudgeCueStart(project, cueId, delta, collectionName = "cues") {
  const sourceCues = project[collectionName];
  if (!Array.isArray(sourceCues)) {
    throw new Error(`Unknown cue collection: ${collectionName}`);
  }

  const cue = sourceCues.find((item) => item.id === cueId);
  if (!cue) {
    throw new Error(`Unknown cue id: ${cueId}`);
  }

  return setCueStart(project, cueId, cue.start + delta, collectionName);
}

export function getCueAtTime(project, time) {
  return sortCues(project.cues).find((cue) => isCueActiveAtTime(cue, time));
}

export function isCueActiveAtTime(cue, time) {
  return time >= cue.start && time <= cue.end;
}

export function serializeTimingProject(project) {
  return `${JSON.stringify(project, null, 2)}\n`;
}

export function parseTimingProject(input) {
  const parsed = typeof input === "string" ? JSON.parse(input) : input;

  if (!parsed || typeof parsed !== "object") {
    throw new Error("timing project must be an object");
  }

  const project = mergeTimingProjectDefaults(parsed);

  if (project.schemaVersion !== TIMING_SCHEMA_VERSION) {
    throw new Error(`Unsupported timing schema version: ${project.schemaVersion}`);
  }

  if (!project.audio || typeof project.audio.src !== "string") {
    throw new Error("timing project audio src is required");
  }

  if (!project.segment || !Number.isFinite(project.segment.start) || !Number.isFinite(project.segment.end)) {
    throw new Error("timing project segment start and end are required");
  }

  if (!Array.isArray(project.cues) || project.cues.length === 0) {
    throw new Error("timing project cues are required");
  }

  validateCues(project.cues);
  validateCues(project.letterCues);
  validateCues(project.sceneCues);
  validateCues(project.combineCues);

  return cloneTimingProject(project);
}

function validateCues(cues) {
  cues.forEach((cue) => {
    if (!cue || typeof cue.id !== "string") {
      throw new Error("cue id is required");
    }

    if (typeof cue.label !== "string") {
      throw new Error("cue label is required");
    }

    if (!Number.isFinite(cue.start)) {
      throw new Error("cue start must be a finite number");
    }

    if (!Number.isFinite(cue.end)) {
      throw new Error("cue end must be a finite number");
    }

    if (cue.end < cue.start + MIN_CUE_LENGTH) {
      throw new Error("cue end must be after cue start");
    }

    if (cue.position !== undefined) {
      if (!Number.isFinite(cue.position.left) || !Number.isFinite(cue.position.top)) {
        throw new Error("cue position must include finite left and top values");
      }
    }
  });
}


