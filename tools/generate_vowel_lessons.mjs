import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { renderWorksheetDocument } from "../worksheets/worksheet-renderer.js";

const root = path.resolve("lessons", "vowels");
const cssHref = "../../../worksheets/pilot-a4.css";

const youtubeVideoIdsByTraceLetter = new Map([
  ["\uC544", "jiq5R5GOnSY"],
  ["\uC624", "SM-5rr_zXMg"],
  ["\uC6B0", "veGNGGLLHog"],
  ["\uAC00", "kelf8prIzZs"],
  ["\uACE0", "sE3Jg8d3sVY"],
  ["\uB098", "pyCIALZkmWE"],
  ["\uB178", "KCIuIU02VY0"],
  ["\uB9C8", "Hn75Y3buYKM"],
  ["\uBAA8", "MvawirDWxi0"],
  ["\uBC14", "_gwoud3LLY0"],
  ["\uBCF4", "Mrc6LVK_cCo"],
  ["\uB2E4", "HbqQr3GkrM4"],
  ["\uB3C4", "u9MoqgDZVrM"],
  ["\uB77C", "BorMu32CkVg"],
  ["\uB85C", "u87LLzQ1LD4"],
  ["\uC0AC", "pw8Y4tBPc8g"],
  ["\uC18C", "uH7yFiacwhI"],
  ["\uD558", "E-A_L0fKROs"],
  ["\uD638", "90LTsoehtEE"],
  ["\uC790", "uEHrSncgf4c"],
  ["\uC870", "K5d67yqyz38"],
  ["\uCC28", "wz-3bVHwoK0"],
  ["\uCD08", "0R79bKEtWyY"],
  ["\uCE74", "RfswEZUIwD8"],
  ["\uCF54", "s3-kXgPOD5w"],
  ["\uD0C0", "A0xCq0A_p7Q"],
  ["\uD1A0", "XJ6BeuG5usk"],
  ["\uD30C", "EfK79cZhmh4"],
  ["\uD3EC", "f0DpJkwnBiM"],
]);

function videoQrForTraceLetter(traceLetter) {
  const videoId = youtubeVideoIdsByTraceLetter.get(traceLetter);
  if (!videoId) return undefined;

  return {
    label: "\uC601\uC0C1 \uBCF4\uAE30",
    url: `https://www.youtube.com/watch?v=${videoId}`,
    image: `../../../public/qr/youtube/${videoId}.png`,
  };
}

function soundSteps(name, consonant, consonantSound, vowelTool, vowel, vowelSound, result) {
  return [
    { label: `${name} ${consonant} 소리`, sound: consonantSound },
    { label: `${vowelTool} ${vowel} 소리`, sound: vowelSound },
    { label: "합치면", sound: `${result}!` },
  ];
}

function activity({
  title,
  read,
  heroImage,
  traceLetter,
  buildPieces,
  soundSteps: steps,
  teacherNote,
  footerRight,
  wordCards,
}) {
  return {
    title,
    read,
    heroImage,
    traceLetter,
    buildPieces,
    soundSteps: steps,
    teacherNote,
    footerLeft: `${buildPieces[0]} + ${buildPieces[1]} = ${buildPieces[2]}`,
    footerRight,
    wordCards,
  };
}

function reviewPage({ sounds, builds, images = [], footerRight, kicker = "마지막 / 소리 정리" }) {
  return {
    type: "sound-choice",
    theme: "gogo",
    kicker,
    title: "소리를 듣고 맞는 조합을 찾아요",
    read: "선생님이 말하는 소리를 듣고 알맞은 조합 카드를 찾아 동그라미해요.",
    activityTitle: "맞는 글자에 동그라미",
    prompts: sounds.map((sound, index) => ({
      label: `${index + 1}번`,
      sound,
      answer: sound,
    })),
    choices: builds.map((buildPieces, index) => ({
      label: buildPieces[2],
      image: images[index],
      buildPieces,
    })),
    teacherNote: `교사용 소리 순서: ${sounds.map((sound, index) => `${index + 1}번 ${sound}`).join(", ")}.`,
    footerLeft: "소리 정리",
    footerRight,
  };
}

function wordCardPage({ focus, title, read, activityTitle, cards, teacherNote, footerLeft, footerRight }) {
  return {
    type: "word-card",
    theme: "gogo",
    focus,
    title,
    read,
    activityTitle,
    cards,
    teacherNote,
    footerLeft,
    footerRight,
  };
}
function combinationLesson({ folder, title, letters, storyTitle, storyRead, storyTeacherNote, footerRight, characters, storyPanels }) {
  const panels = storyPanels || characters.flatMap((character) =>
    character.combos.map((combo) => ({
      image: combo.heroImage,
      caption: `${character.consonant}이 ${combo.vowel}를 만나, ${combo.result}!`,
    }))
  );
  const activities = characters.flatMap((character) =>
    character.combos.map((combo) =>
      activity({
        title: `${character.consonant}과 ${combo.vowel}가 만나면 ${combo.result}`,
        read: `${character.shortName}의 ${character.consonant} 소리, ${character.sound}! ${combo.vowelTool}의 ${combo.vowel} 소리, ${combo.vowelSound}! 합치면 ${combo.result}!`,
        heroImage: combo.heroImage,
        traceLetter: combo.result,
        buildPieces: [character.consonant, combo.vowel, combo.result],
        soundSteps: soundSteps(
          `${character.shortName}의`,
          character.consonant,
          `${character.sound}!`,
          combo.vowelTool,
          combo.vowel,
          `${combo.vowelSound}!`,
          combo.result
        ),
        teacherNote: `${character.teacherNoteStem} ${combo.teacherNoteTail}`,
        footerRight: `${character.fullName}와 ${combo.result}`,
        wordCards: combo.wordCards,
      })
    )
  );

  return {
    folder,
    title,
    letters,
    story: {
      title: storyTitle,
      read: storyRead,
      panels,
      teacherNote: storyTeacherNote,
      footerLeft: "그림 이야기",
      footerRight,
    },
    activities,
    review: {
      sounds: activities.map((item) => item.traceLetter),
      builds: activities.map((item) => item.buildPieces),
      footerRight,
    },
  };
}

function chunkItems(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

const expansionVowels = [
  { vowel: "ㅓ", sound: "어", tool: "어어 풍선", tail: "오른쪽의 ㅓ 풍선을 붙여 읽는다." },
  { vowel: "ㅜ", sound: "우", tool: "우우 발판", tail: "아래의 ㅜ 발판을 붙여 읽는다." },
  { vowel: "ㅡ", sound: "으", tool: "으으 쿠션", tail: "아래의 ㅡ 쿠션을 붙여 읽는다." },
  { vowel: "ㅣ", sound: "이", tool: "이이 막대", tail: "오른쪽의 ㅣ 막대를 붙여 읽는다." },
];

const vowelExpansionGroups = [
  {
    folder: "lesson-08-ieung-vowel-expansion",
    title: "8레슨 ㅇ과 새 모음: 어/우/으/이를 만들어요",
    letters: "ㅇ/ㅓ/ㅜ/ㅡ/ㅣ/어/우/으/이",
    storyTitle: "ㅇ이 새 모음 친구를 만나요",
    storyRead: "조용히 기다리는 ㅇ 자리에 어어 풍선, 우우 발판, 으으 쿠션, 이이 막대가 차례로 와요.",
    storyTeacherNote: "ㅇ은 첫소리 자리에서 조용히 기다리고, 모음 소리를 길게 들려주며 어/우/으/이를 읽는다.",
    footerRight: "ㅇ과 새 모음",
    characters: [
      {
        fullName: "아아 아기",
        shortName: "ㅇ",
        consonant: "ㅇ",
        sound: "조용",
        teacherNoteStem: "ㅇ 자리를 손가락으로 짚고",
        combos: [
          { vowel: "ㅓ", result: "어", vowelSound: "어", vowelTool: "어어 풍선", heroImage: "../../../public/어어 풍선 시안2.png", teacherNoteTail: "오른쪽의 ㅓ 풍선을 붙여 어를 읽는다." },
          { vowel: "ㅜ", result: "우", vowelSound: "우", vowelTool: "우우 발판", heroImage: "../../../public/우우 발판 시안.png", teacherNoteTail: "아래의 ㅜ 발판을 붙여 우를 읽는다." },
          { vowel: "ㅡ", result: "으", vowelSound: "으", vowelTool: "으으 쿠션", heroImage: "../../../public/으으 쿠션 시안.png", teacherNoteTail: "아래의 ㅡ 쿠션을 붙여 으를 읽는다." },
          { vowel: "ㅣ", result: "이", vowelSound: "이", vowelTool: "이이 막대", heroImage: "../../../public/이이 막대 시안.png", teacherNoteTail: "오른쪽의 ㅣ 막대를 붙여 이를 읽는다." },
        ],
      },
    ],
  },
  {
    folder: "lesson-09-gogo-nana-vowel-expansion",
    title: "9레슨 고고와 나나: 거/구/그/기/너/누/느/니를 만들어요",
    letters: "ㄱ/ㄴ/ㅓ/ㅜ/ㅡ/ㅣ/거/구/그/기/너/누/느/니",
    storyTitle: "고고와 나나가 새 모음을 넓혀요",
    storyRead: "고고의 ㄱ 길과 나나의 ㄴ 길이 네 가지 새 모음 도구를 만나요.",
    storyTeacherNote: "ㄱ과 ㄴ 길을 먼저 찾고, 오른쪽 모음과 아래 모음을 나누어 붙여 읽는다.",
    footerRight: "고고와 나나",
    characters: [
      { fullName: "고고 고양이", shortName: "고고", imageName: "고고", consonant: "ㄱ", sound: "그", teacherNoteStem: "고고 꼬리의 ㄱ 길을 손가락으로 따라가고", results: ["거", "구", "그", "기"] },
      { fullName: "나나 나비", shortName: "나나", imageName: "나나", consonant: "ㄴ", sound: "느", teacherNoteStem: "나나가 앉은 ㄴ 길을 손가락으로 따라가고", results: ["너", "누", "느", "니"] },
    ],
  },
  {
    folder: "lesson-10-mimi-rara-vowel-expansion",
    title: "10레슨 미미와 라라: 머/무/므/미/러/루/르/리를 만들어요",
    letters: "ㅁ/ㄹ/ㅓ/ㅜ/ㅡ/ㅣ/머/무/므/미/러/루/르/리",
    storyTitle: "미미와 라라가 새 모음을 넓혀요",
    storyRead: "미미의 ㅁ 길과 라라 리본의 ㄹ 길이 네 가지 새 모음 도구를 만나요.",
    storyTeacherNote: "ㅁ과 ㄹ 길을 먼저 찾고, 네 모음의 붙는 자리를 비교하며 읽는다.",
    footerRight: "미미와 라라",
    characters: [
      { fullName: "미미 문어", shortName: "미미", imageName: "미미", consonant: "ㅁ", sound: "므", teacherNoteStem: "미미 어항의 ㅁ 길을 손가락으로 따라가고", results: ["머", "무", "므", "미"] },
      { fullName: "라라 리본", shortName: "라라", imageName: "라라", consonant: "ㄹ", sound: "르", teacherNoteStem: "라라 리본의 ㄹ 길을 손가락으로 따라가고", results: ["러", "루", "르", "리"] },
    ],
  },
  {
    folder: "lesson-11-dodo-bubu-vowel-expansion",
    title: "11레슨 도도와 부부: 더/두/드/디/버/부/브/비를 만들어요",
    letters: "ㄷ/ㅂ/ㅓ/ㅜ/ㅡ/ㅣ/더/두/드/디/버/부/브/비",
    storyTitle: "도도와 부부가 새 모음을 넓혀요",
    storyRead: "도도 몸의 ㄷ 길과 부부 몸의 ㅂ 길이 네 가지 새 모음 도구를 만나요.",
    storyTeacherNote: "ㄷ과 ㅂ 길을 먼저 찾고, 입 모양을 바꾸며 더/두/드/디와 버/부/브/비를 읽는다.",
    footerRight: "도도와 부부",
    characters: [
      { fullName: "도도 도토리", shortName: "도도", imageName: "도도", consonant: "ㄷ", sound: "드", teacherNoteStem: "도도 몸의 ㄷ 길을 손가락으로 따라가고", results: ["더", "두", "드", "디"] },
      { fullName: "부부 부엉이", shortName: "부부", imageName: "부부", consonant: "ㅂ", sound: "브", teacherNoteStem: "부부 몸의 ㅂ 길을 손가락으로 따라가고", results: ["버", "부", "브", "비"] },
    ],
  },
  {
    folder: "lesson-12-sasa-haha-vowel-expansion",
    title: "12레슨 사사와 하하: 서/수/스/시/허/후/흐/히를 만들어요",
    letters: "ㅅ/ㅎ/ㅓ/ㅜ/ㅡ/ㅣ/서/수/스/시/허/후/흐/히",
    storyTitle: "사사와 하하가 새 모음을 넓혀요",
    storyRead: "사사 뿔의 ㅅ 산 길과 하하 몸의 ㅎ 숨 길이 네 가지 새 모음 도구를 만나요.",
    storyTeacherNote: "ㅅ 산 길과 ㅎ 숨 길을 먼저 찾고, 바람 소리처럼 부드럽게 읽는다.",
    footerRight: "사사와 하하",
    characters: [
      { fullName: "사사 사슴", shortName: "사사", imageName: "사사", consonant: "ㅅ", sound: "스", teacherNoteStem: "사사 뿔의 ㅅ 산 길을 손가락으로 따라가고", results: ["서", "수", "스", "시"] },
      { fullName: "하하 하마", shortName: "하하", imageName: "하하", consonant: "ㅎ", sound: "흐", teacherNoteStem: "하하 몸의 ㅎ 숨 길을 손가락으로 따라가고", results: ["허", "후", "흐", "히"] },
    ],
  },
  {
    folder: "lesson-13-jiji-chichi-vowel-expansion",
    title: "13레슨 지지와 치치: 저/주/즈/지/처/추/츠/치를 만들어요",
    letters: "ㅈ/ㅊ/ㅓ/ㅜ/ㅡ/ㅣ/저/주/즈/지/처/추/츠/치",
    storyTitle: "지지와 치치가 새 모음을 넓혀요",
    storyRead: "지지의 ㅈ 길과 치치의 ㅊ 칙칙 길이 네 가지 새 모음 도구를 만나요.",
    storyTeacherNote: "ㅈ 길과 ㅊ 길을 먼저 찾고, 짧고 또렷하게 새 조합을 읽는다.",
    footerRight: "지지와 치치",
    characters: [
      { fullName: "지지 지렁이", shortName: "지지", imageName: "지지", consonant: "ㅈ", sound: "즈", teacherNoteStem: "지지의 ㅈ 길을 손가락으로 따라가고", results: ["저", "주", "즈", "지"] },
      { fullName: "치치 칙폭이", shortName: "치치", imageName: "치치", consonant: "ㅊ", sound: "츠", teacherNoteStem: "치치의 ㅊ 칙칙 길을 손가락으로 따라가고", results: ["처", "추", "츠", "치"] },
    ],
  },
  {
    folder: "lesson-14-koko-toto-pupu-vowel-expansion",
    title: "14레슨 코코와 토토와 푸푸: 커/쿠/크/키/터/투/트/티/퍼/푸/프/피를 만들어요",
    letters: "ㅋ/ㅌ/ㅍ/ㅓ/ㅜ/ㅡ/ㅣ/커/쿠/크/키/터/투/트/티/퍼/푸/프/피",
    storyTitle: "코코와 토토와 푸푸가 새 모음을 넓혀요",
    storyRead: "코코의 ㅋ 길, 토토의 ㅌ 길, 푸푸 풍선의 ㅍ 길이 네 가지 새 모음 도구를 만나요.",
    storyTeacherNote: "ㅋ/ㅌ/ㅍ의 센소리를 몸 길에서 찾고, 네 모음과 차례로 합쳐 읽는다.",
    footerRight: "코코와 토토와 푸푸",
    characters: [
      { fullName: "코코 코알라", shortName: "코코", imageName: "코코", consonant: "ㅋ", sound: "크", teacherNoteStem: "코코 몸의 ㅋ 큰 숨 길을 손가락으로 따라가고", results: ["커", "쿠", "크", "키"] },
      { fullName: "토토 토끼", shortName: "토토", imageName: "토토", consonant: "ㅌ", sound: "트", teacherNoteStem: "토토 귀와 몸의 ㅌ 톡톡 길을 손가락으로 따라가고", results: ["터", "투", "트", "티"] },
      { fullName: "푸푸 풍선", shortName: "푸푸", imageName: "푸푸", consonant: "ㅍ", sound: "프", teacherNoteStem: "푸푸 풍선 몸의 ㅍ 길을 손가락으로 따라가고", results: ["퍼", "푸", "프", "피"] },
    ],
  },
];

function combosFromResults(character) {
  if (character.combos) return character.combos;
  return expansionVowels.map((vowel, index) => ({
    vowel: vowel.vowel,
    vowelTool: vowel.tool,
    vowelSound: vowel.sound,
    result: character.results[index],
    heroImage: `../../../public/${character.imageName} ${character.results[index]} 새시안.png`,
    teacherNoteTail: vowel.tail.replace("읽는다", `${character.results[index]}를 읽는다`),
  }));
}

function vowelExpansionLesson(group) {
  const characters = group.characters.map((character) => ({
    ...character,
    combos: combosFromResults(character),
  }));
  const storyPanels = characters.length === 1
    ? characters[0].combos.map((combo) => ({
        image: combo.heroImage,
        caption: `${characters[0].consonant}이 ${combo.vowel}를 만나, ${combo.result}!`,
      }))
    : characters.map((character) => {
        const combo = character.combos[0];
        return {
          image: combo.heroImage,
          caption: `${character.consonant}이 새 모음을 만나, ${combo.result}부터 시작!`,
        };
      });

  return combinationLesson({
    ...group,
    characters,
    storyPanels,
    storyTitle: group.storyTitle,
    storyRead: group.storyRead,
    storyTeacherNote: group.storyTeacherNote,
    footerRight: group.footerRight,
  });
}

const lessons = [
  {
    folder: "lesson-01-aa-baby-vowel",
    title: "1레슨 아아 아기와 아/오/우: 모음 도구를 만나요",
    letters: "ㅇ/ㅏ/ㅗ/ㅜ/아/오/우",
    story: {
      title: "아아 아기가 소리를 찾았어",
      read: "아아 아기는 조용조용. 나뭇가지를 주워 들면 어떤 소리가 날까요?",
      panels: [
        { image: "./aa-story-01-silent.png", caption: "아아 아기는 조용조용." },
        { image: "./aa-story-02-branch.png", caption: "어? 나뭇가지다!" },
        { image: "./aa-story-03-ah.png", caption: "나뭇가지를 들고, 아!" },
      ],
      teacherNote: "그림을 왼쪽부터 차례대로 보며 아이가 마지막 소리 아를 기다리게 한다. 이후 활동에서 오, 우로 모음 도구를 확장한다.",
      footerLeft: "그림 이야기",
      footerRight: "아아 아기와 아/오/우",
    },
    activities: [
      activity({
        title: "ㅇ과 ㅏ가 만나면 아",
        read: "아아 아기가 나뭇가지를 들고 아! 입을 크게 열고 같이 말해요.",
        heroImage: "../../../public/아아 아기 나뭇가지 시안.png",
        traceLetter: "아",
        buildPieces: ["ㅇ", "ㅏ", "아"],
        soundSteps: [
          { label: "아아 아기 자리", sound: "쉿!" },
          { label: "나뭇가지 ㅏ 소리", sound: "아!" },
          { label: "합치면", sound: "아!" },
        ],
        teacherNote: "큰 글자 아를 손가락으로 천천히 따라간 뒤, ㅇ 옆에 ㅏ를 붙여 아를 만든다.",
        footerRight: "아아 아기와 아",
      }),
      activity({
        title: "ㅇ과 ㅗ가 만나면 오",
        read: "아아 아기가 오오 상자에 올라타고 오! 입을 동그랗게 하고 같이 말해요.",
        heroImage: "../../../public/오오 상자 시안.png",
        traceLetter: "오",
        buildPieces: ["ㅇ", "ㅗ", "오"],
        soundSteps: [
          { label: "아아 아기 자리", sound: "쉿!" },
          { label: "오오 상자 ㅗ 소리", sound: "오!" },
          { label: "합치면", sound: "오!" },
        ],
        teacherNote: "큰 글자 오를 손가락으로 따라간 뒤, ㅇ 아래에 ㅗ를 붙여 오를 만든다.",
        footerRight: "아아 아기와 오",
      }),
      activity({
        title: "ㅇ과 ㅜ가 만나면 우",
        read: "아아 아기가 우우 발판을 만나 우! 입을 오므리고 같이 말해요.",
        heroImage: "../../../public/우우 발판 시안.png",
        traceLetter: "우",
        buildPieces: ["ㅇ", "ㅜ", "우"],
        soundSteps: [
          { label: "아아 아기 자리", sound: "쉿!" },
          { label: "우우 발판 ㅜ 소리", sound: "우!" },
          { label: "합치면", sound: "우!" },
        ],
        teacherNote: "큰 글자 우를 손가락으로 따라간 뒤, ㅇ 아래에 ㅜ를 붙여 우를 만든다.",
        footerRight: "아아 아기와 우",
        wordCards: {
          focus: "아",
          title: "아/오/우가 들어가는 낱말",
          read: "아, 오, 우가 들어 있는 생활 낱말을 그림으로 만나요.",
          activityTitle: "배운 글자가 들어간 곳을 진하게 봐요",
          cards: [
            { word: "아기", focus: "아", rest: "기", image: "../../../worksheets/assets/baby.png" },
            { word: "아침", focus: "아", rest: "침", image: "../../../worksheets/assets/morning.png" },
            { word: "아이스크림", focus: "아", rest: "이스크림", image: "../../../worksheets/assets/ice-cream.png" },
            { word: "오이", focus: "오", rest: "이", image: "../../../worksheets/assets/cucumber.png" },
            { word: "오리", focus: "오", rest: "리", image: "../../../worksheets/assets/duck.png" },
            { word: "오랑우탄", focus: "오", rest: "랑우탄", image: "../../../worksheets/assets/orangutan.png" },
            { word: "우산", focus: "우", rest: "산", image: "../../../worksheets/assets/umbrella.png" },
            { word: "우유", focus: "우", rest: "유", image: "../../../worksheets/assets/milk.png" },
            { word: "우물", focus: "우", rest: "물", image: "../../../worksheets/assets/well.png" },
          ],
          teacherNote: "낱말 전체 읽기를 요구하지 않고 오늘 배운 글자만 찾아본다.",
          footerLeft: "배운 글자 아/오/우",
          footerRight: "아/오/우 낱말카드",
        },
      }),
    ],
    review: {
      sounds: ["아", "오", "우"],
      builds: [
        ["ㅇ", "ㅏ", "아"],
        ["ㅇ", "ㅗ", "오"],
        ["ㅇ", "ㅜ", "우"],
      ],
      footerRight: "아아 아기와 아/오/우",
    },
  },
  {
    folder: "lesson-02-gogo-nana-combination",
    title: "2레슨 고고와 나나: 가/고/나/노를 만들어요",
    letters: "ㄱ/ㄴ/ㅏ/ㅗ/가/고/나/노",
    story: {
      title: "고고와 나나가 새 글자를 만들어요",
      read: "고고의 ㄱ 꼬리와 나나가 앉은 ㄴ 모양 나무가 모음 도구를 만나요.",
      panels: [
        { image: "../../../public/고고 가 막대기 ㄱ폰트 크게 새시안.png", caption: "ㄱ이 ㅏ를 만나, 가!" },
        { image: "../../../public/고고 고 상자 ㄱ폰트 크게 새시안.png", caption: "ㄱ이 ㅗ를 만나, 고!" },
        { image: "../../../public/나나 나 새시안.png", caption: "ㄴ이 ㅏ를 만나, 나!" },
        { image: "../../../public/나나 노 새시안.png", caption: "ㄴ이 ㅗ를 만나, 노!" },
      ],
      teacherNote: "고고는 꼬리의 ㄱ, 나나는 나비가 앉은 ㄴ 모양 나무를 먼저 찾게 한다.",
      footerLeft: "그림 이야기",
      footerRight: "고고와 나나",
    },
    activities: [
      activity({
        title: "ㄱ과 ㅏ가 만나면 가",
        read: "고고의 ㄱ 소리, 그! 아아 막대기의 ㅏ 소리, 아! 합치면 가!",
        heroImage: "../../../public/고고 가 막대기 ㄱ폰트 크게 새시안.png",
        traceLetter: "가",
        buildPieces: ["ㄱ", "ㅏ", "가"],
        soundSteps: soundSteps("고고의", "ㄱ", "그!", "아아 막대기", "ㅏ", "아!", "가"),
        teacherNote: "고고 꼬리 위의 ㄱ을 손가락으로 짚고, 오른쪽의 ㅏ를 붙여 가를 읽는다.",
        footerRight: "고고 고양이와 가",
      }),
      activity({
        title: "ㄱ과 ㅗ가 만나면 고",
        read: "고고의 ㄱ 소리, 그! 오오 상자의 ㅗ 소리, 오! 합치면 고!",
        heroImage: "../../../public/고고 고 상자 ㄱ폰트 크게 새시안.png",
        traceLetter: "고",
        buildPieces: ["ㄱ", "ㅗ", "고"],
        soundSteps: soundSteps("고고의", "ㄱ", "그!", "오오 상자", "ㅗ", "오!", "고"),
        teacherNote: "고고 꼬리의 ㄱ 모양을 유지하고, 아래의 ㅗ 상자를 붙여 고를 만든다.",
        footerRight: "고고 고양이와 고",
      }),
      activity({
        title: "ㄴ과 ㅏ가 만나면 나",
        read: "나나의 ㄴ 소리, 느! 아아 막대기의 ㅏ 소리, 아! 합치면 나!",
        heroImage: "../../../public/나나 나 새시안.png",
        traceLetter: "나",
        buildPieces: ["ㄴ", "ㅏ", "나"],
        soundSteps: soundSteps("나나의", "ㄴ", "느!", "아아 막대기", "ㅏ", "아!", "나"),
        teacherNote: "나나가 앉은 ㄴ 모양 나무를 따라가고, 오른쪽의 ㅏ를 붙여 나를 읽는다.",
        footerRight: "나나 나비와 나",
      }),
      activity({
        title: "ㄴ과 ㅗ가 만나면 노",
        read: "나나의 ㄴ 소리, 느! 오오 상자의 ㅗ 소리, 오! 합치면 노!",
        heroImage: "../../../public/나나 노 새시안.png",
        traceLetter: "노",
        buildPieces: ["ㄴ", "ㅗ", "노"],
        soundSteps: soundSteps("나나의", "ㄴ", "느!", "오오 상자", "ㅗ", "오!", "노"),
        teacherNote: "나무의 ㄴ 모양을 유지하고, 아래의 ㅗ 상자를 붙여 노를 만든다.",
        footerRight: "나나 나비와 노",
        wordCards: {
          focus: "가",
          title: "가/고/나/노가 들어가는 낱말",
          read: "가, 고, 나, 노가 들어 있는 생활 낱말을 그림으로 만나요.",
          activityTitle: "배운 글자가 들어간 곳을 진하게 봐요",
          cards: [
            { word: "가방", focus: "가", rest: "방", image: "../../../worksheets/assets/word-ga-bag.png" },
            { word: "가지", focus: "가", rest: "지", image: "../../../worksheets/assets/word-ga-eggplant.png" },
            { word: "가위", focus: "가", rest: "위", image: "../../../worksheets/assets/word-ga-scissors.png" },
            { word: "고양이", focus: "고", rest: "양이", image: "../../../worksheets/assets/word-go-cat.png" },
            { word: "고구마", focus: "고", rest: "구마", image: "../../../worksheets/assets/word-go-sweet-potato.png" },
            { word: "고래", focus: "고", rest: "래", image: "../../../worksheets/assets/word-go-whale.png" },
            { word: "나비", focus: "나", rest: "비", image: "../../../worksheets/assets/word-na-butterfly.png" },
            { word: "나무", focus: "나", rest: "무", image: "../../../worksheets/assets/word-na-tree.png" },
            { word: "나사", focus: "나", rest: "사", image: "../../../worksheets/assets/word-na-screw.png" },
            { word: "노란색", focus: "노", rest: "란색", image: "../../../worksheets/assets/word-no-yellow.png" },
            { word: "노래", focus: "노", rest: "래", image: "../../../worksheets/assets/word-no-song.png" },
            { word: "노트", focus: "노", rest: "트", image: "../../../worksheets/assets/word-no-note.png" },
          ],
          teacherNote: "낱말 전체 읽기를 요구하지 않고 오늘 배운 글자만 찾아본다.",
          footerLeft: "배운 글자 가/고/나/노",
          footerRight: "가/고/나/노 낱말카드",
        },
      }),
    ],
    review: {
      sounds: ["가", "고", "나", "노"],
      builds: [
        ["ㄱ", "ㅏ", "가"],
        ["ㄱ", "ㅗ", "고"],
        ["ㄴ", "ㅏ", "나"],
        ["ㄴ", "ㅗ", "노"],
      ],
      footerRight: "고고와 나나",
    },
  },
  {
    folder: "lesson-03-mimi-bubu-combination",
    title: "3레슨 미미와 부부: 마/모/바/보를 만들어요",
    letters: "ㅁ/ㅂ/ㅏ/ㅗ/마/모/바/보",
    story: {
      title: "미미와 부부가 새 글자를 만들어요",
      read: "미미의 ㅁ 모양 어항과 부부 몸의 ㅂ 두 방 길이 모음 도구를 만나요.",
      panels: [
        { image: "../../../public/미미 마 새시안.png", caption: "ㅁ이 ㅏ를 만나, 마!" },
        { image: "../../../public/미미 모 새시안.png", caption: "ㅁ이 ㅗ를 만나, 모!" },
        { image: "../../../public/부부 바 새시안.png", caption: "ㅂ이 ㅏ를 만나, 바!" },
        { image: "../../../public/부부 보 새시안.png", caption: "ㅂ이 ㅗ를 만나, 보!" },
      ],
      teacherNote: "미미는 어항의 네모 ㅁ 길, 부부는 몸의 ㅂ 두 방 길을 먼저 찾게 한다.",
      footerLeft: "그림 이야기",
      footerRight: "미미와 부부",
    },
    activities: [
      activity({
        title: "ㅁ과 ㅏ가 만나면 마",
        read: "미미의 ㅁ 소리, 므! 아아 막대기의 ㅏ 소리, 아! 합치면 마!",
        heroImage: "../../../public/미미 마 새시안.png",
        traceLetter: "마",
        buildPieces: ["ㅁ", "ㅏ", "마"],
        soundSteps: soundSteps("미미의", "ㅁ", "므!", "아아 막대기", "ㅏ", "아!", "마"),
        teacherNote: "어항의 ㅁ 네모 길을 한 바퀴 따라가고, 오른쪽의 ㅏ를 붙여 마를 읽는다.",
        footerRight: "미미 문어와 마",
      }),
      activity({
        title: "ㅁ과 ㅗ가 만나면 모",
        read: "미미의 ㅁ 소리, 므! 오오 상자의 ㅗ 소리, 오! 합치면 모!",
        heroImage: "../../../public/미미 모 새시안.png",
        traceLetter: "모",
        buildPieces: ["ㅁ", "ㅗ", "모"],
        soundSteps: soundSteps("미미의", "ㅁ", "므!", "오오 상자", "ㅗ", "오!", "모"),
        teacherNote: "어항의 ㅁ 모양을 유지하고, 아래의 ㅗ 상자를 붙여 모를 만든다.",
        footerRight: "미미 문어와 모",
      }),
      activity({
        title: "ㅂ과 ㅏ가 만나면 바",
        read: "부부의 ㅂ 소리, 브! 아아 막대기의 ㅏ 소리, 아! 합치면 바!",
        heroImage: "../../../public/부부 바 새시안.png",
        traceLetter: "바",
        buildPieces: ["ㅂ", "ㅏ", "바"],
        soundSteps: soundSteps("부부의", "ㅂ", "브!", "아아 막대기", "ㅏ", "아!", "바"),
        teacherNote: "부부 몸의 ㅂ 두 방 길을 짚고, 오른쪽의 ㅏ를 붙여 바를 읽는다.",
        footerRight: "부부 부엉이와 바",
      }),
      activity({
        title: "ㅂ과 ㅗ가 만나면 보",
        read: "부부의 ㅂ 소리, 브! 오오 상자의 ㅗ 소리, 오! 합치면 보!",
        heroImage: "../../../public/부부 보 새시안.png",
        traceLetter: "보",
        buildPieces: ["ㅂ", "ㅗ", "보"],
        soundSteps: soundSteps("부부의", "ㅂ", "브!", "오오 상자", "ㅗ", "오!", "보"),
        teacherNote: "부부 몸의 ㅂ 모양을 유지하고, 아래의 ㅗ 상자를 붙여 보를 만든다.",
        footerRight: "부부 부엉이와 보",
        wordCards: {
          focus: "마",
          title: "마/모/바/보가 들어가는 낱말",
          read: "마, 모, 바, 보가 들어 있는 생활 낱말을 그림으로 만나요.",
          activityTitle: "배운 글자가 들어간 곳을 진하게 봐요",
          cards: [
            { word: "마늘", focus: "마", rest: "늘", image: "../../../worksheets/assets/word-ma-garlic.png" },
            { word: "마술사", focus: "마", rest: "술사", image: "../../../worksheets/assets/word-ma-magician.png" },
            { word: "마스크", focus: "마", rest: "스크", image: "../../../worksheets/assets/word-ma-mask.png" },
            { word: "모자", focus: "모", rest: "자", image: "../../../worksheets/assets/word-mo-hat.png" },
            { word: "모래", focus: "모", rest: "래", image: "../../../worksheets/assets/word-mo-sand.png" },
            { word: "모기", focus: "모", rest: "기", image: "../../../worksheets/assets/word-mo-mosquito.png" },
            { word: "바다", focus: "바", rest: "다", image: "../../../worksheets/assets/word-ba-sea.png" },
            { word: "바퀴", focus: "바", rest: "퀴", image: "../../../worksheets/assets/word-ba-wheel.png" },
            { word: "바나나", focus: "바", rest: "나나", image: "../../../worksheets/assets/word-ba-banana.png" },
            { word: "보라색", focus: "보", rest: "라색", image: "../../../worksheets/assets/word-bo-purple.png" },
            { word: "보름달", focus: "보", rest: "름달", image: "../../../worksheets/assets/word-bo-full-moon.png" },
            { word: "보물상자", focus: "보", rest: "물상자", image: "../../../worksheets/assets/word-bo-treasure-chest.png" },
          ],
          teacherNote: "낱말 전체 읽기를 요구하지 않고 오늘 배운 글자만 찾아본다.",
          footerLeft: "배운 글자 마/모/바/보",
          footerRight: "마/모/바/보 낱말카드",
        },
      }),
    ],
    review: {
      sounds: ["마", "모", "바", "보"],
      builds: [
        ["ㅁ", "ㅏ", "마"],
        ["ㅁ", "ㅗ", "모"],
        ["ㅂ", "ㅏ", "바"],
        ["ㅂ", "ㅗ", "보"],
      ],
      footerRight: "미미와 부부",
    },
  },
  combinationLesson({
    folder: "lesson-04-dodo-rara-combination",
    title: "4레슨 도도와 라라: 다/도/라/로를 만들어요",
    letters: "ㄷ/ㄹ/ㅏ/ㅗ/다/도/라/로",
    storyTitle: "도도와 라라가 새 글자를 만들어요",
    storyRead: "도도 몸의 ㄷ 길과 라라 리본의 ㄹ 길이 모음 도구를 만나요.",
    storyTeacherNote: "도도는 몸의 ㄷ 길, 라라는 리본의 ㄹ 꼬불길을 먼저 찾게 한다.",
    footerRight: "도도와 라라",
    characters: [
      {
        fullName: "도도 도토리",
        shortName: "도도",
        consonant: "ㄷ",
        sound: "드",
        teacherNoteStem: "도도 몸의 ㄷ 길을 손가락으로 따라가고,",
        combos: [
          {
            vowel: "ㅏ",
            vowelTool: "아아 막대기",
            vowelSound: "아",
            result: "다",
            heroImage: "../../../public/도도 다 새시안.png",
            teacherNoteTail: "오른쪽의 ㅏ를 붙여 다를 읽는다.",
          },
          {
            vowel: "ㅗ",
            vowelTool: "오오 상자",
            vowelSound: "오",
            result: "도",
            heroImage: "../../../public/도도 도 새시안.png",
            teacherNoteTail: "아래의 ㅗ 상자를 붙여 도를 읽는다.",
          },
        ],
      },
      {
        fullName: "라라 리본",
        shortName: "라라",
        consonant: "ㄹ",
        sound: "르",
        teacherNoteStem: "라라 리본의 ㄹ 꼬불길을 손가락으로 따라가고,",
        combos: [
          {
            vowel: "ㅏ",
            vowelTool: "아아 막대기",
            vowelSound: "아",
            result: "라",
            heroImage: "../../../public/라라 라 새시안.png",
            teacherNoteTail: "오른쪽의 ㅏ를 붙여 라를 읽는다.",
          },
          {
            vowel: "ㅗ",
            vowelTool: "오오 상자",
            vowelSound: "오",
            result: "로",
            heroImage: "../../../public/라라 로 새시안.png",
            teacherNoteTail: "아래의 ㅗ 상자를 붙여 로를 읽는다.",
            wordCards: {
              focus: "다",
              title: "다/도/라/로가 들어가는 낱말",
              read: "다, 도, 라, 로가 들어 있는 생활 낱말을 그림으로 만나요.",
              activityTitle: "배운 글자가 들어간 곳을 진하게 봐요",
              cards: [
                { word: "다람쥐", focus: "다", rest: "람쥐", image: "../../../worksheets/assets/word-da-squirrel.png" },
                { word: "다리미", focus: "다", rest: "리미", image: "../../../worksheets/assets/word-da-iron.png" },
                { word: "다리", focus: "다", rest: "리", image: "../../../worksheets/assets/word-da-leg.png" },
                { word: "도토리", focus: "도", rest: "토리", image: "../../../worksheets/assets/word-do-acorn.png" },
                { word: "도넛", focus: "도", rest: "넛", image: "../../../worksheets/assets/word-do-donut.png" },
                { word: "도깨비", focus: "도", rest: "깨비", image: "../../../worksheets/assets/word-do-dokkaebi.png" },
                { word: "라디오", focus: "라", rest: "디오", image: "../../../worksheets/assets/word-ra-radio.png" },
                { word: "라면", focus: "라", rest: "면", image: "../../../worksheets/assets/word-ra-ramen.png" },
                { word: "라켓", focus: "라", rest: "켓", image: "../../../worksheets/assets/word-ra-racket.png" },
                { word: "로봇", focus: "로", rest: "봇", image: "../../../worksheets/assets/word-ro-robot.png" },
                { word: "로켓", focus: "로", rest: "켓", image: "../../../worksheets/assets/word-ro-rocket.png" },
                { word: "로션", focus: "로", rest: "션", image: "../../../worksheets/assets/word-ro-lotion.png" },
              ],
              teacherNote: "낱말 전체 읽기를 요구하지 않고 오늘 배운 글자만 찾아본다.",
              footerLeft: "배운 글자 다/도/라/로",
              footerRight: "다/도/라/로 낱말카드",
            },
          },
        ],
      },
    ],
  }),
  combinationLesson({
    folder: "lesson-05-sasa-haha-combination",
    title: "5레슨 사사와 하하: 사/소/하/호를 만들어요",
    letters: "ㅅ/ㅎ/ㅏ/ㅗ/사/소/하/호",
    storyTitle: "사사와 하하가 새 글자를 만들어요",
    storyRead: "사사 뿔의 ㅅ 산 길과 하하 몸의 ㅎ 숨 길이 모음 도구를 만나요.",
    storyTeacherNote: "사사는 뿔의 ㅅ 산 길, 하하는 몸의 ㅎ 숨 길을 먼저 찾게 한다.",
    footerRight: "사사와 하하",
    characters: [
      {
        fullName: "사사 사슴",
        shortName: "사사",
        consonant: "ㅅ",
        sound: "스",
        teacherNoteStem: "사사 뿔의 ㅅ 산 길을 손가락으로 따라가고,",
        combos: [
          {
            vowel: "ㅏ",
            vowelTool: "아아 막대기",
            vowelSound: "아",
            result: "사",
            heroImage: "../../../public/사사 사 새시안.png",
            teacherNoteTail: "오른쪽의 ㅏ를 붙여 사를 읽는다.",
          },
          {
            vowel: "ㅗ",
            vowelTool: "오오 상자",
            vowelSound: "오",
            result: "소",
            heroImage: "../../../public/사사 소 새시안.png",
            teacherNoteTail: "아래의 ㅗ 상자를 붙여 소를 읽는다.",
          },
        ],
      },
      {
        fullName: "하하 하마",
        shortName: "하하",
        consonant: "ㅎ",
        sound: "흐",
        teacherNoteStem: "하하 몸의 ㅎ 숨 길을 손가락으로 따라가고,",
        combos: [
          {
            vowel: "ㅏ",
            vowelTool: "아아 막대기",
            vowelSound: "아",
            result: "하",
            heroImage: "../../../public/하하 하 새시안.png",
            teacherNoteTail: "오른쪽의 ㅏ를 붙여 하를 읽는다.",
          },
          {
            vowel: "ㅗ",
            vowelTool: "오오 상자",
            vowelSound: "오",
            result: "호",
            heroImage: "../../../public/하하 호 새시안.png",
            teacherNoteTail: "아래의 ㅗ 상자를 붙여 호를 읽는다.",
            wordCards: {
              focus: "사",
              title: "사/소/하/호가 들어가는 낱말",
              read: "사, 소, 하, 호가 들어 있는 생활 낱말을 그림으로 만나요.",
              activityTitle: "배운 글자가 들어간 곳을 진하게 봐요",
              cards: [
                { word: "사슴", focus: "사", rest: "슴", image: "../../../worksheets/assets/word-sa-deer.png" },
                { word: "사다리", focus: "사", rest: "다리", image: "../../../worksheets/assets/word-sa-ladder.png" },
                { word: "사탕", focus: "사", rest: "탕", image: "../../../worksheets/assets/word-sa-candy.png" },
                { word: "소금", focus: "소", rest: "금", image: "../../../worksheets/assets/word-so-salt.png" },
                { word: "소", focus: "소", rest: "", image: "../../../worksheets/assets/word-so-cow.png" },
                { word: "소리", focus: "소", rest: "리", image: "../../../worksheets/assets/word-so-sound.png" },
                { word: "하마", focus: "하", rest: "마", image: "../../../worksheets/assets/word-ha-hippo.png" },
                { word: "하늘", focus: "하", rest: "늘", image: "../../../worksheets/assets/word-ha-sky.png" },
                { word: "하얀색", focus: "하", rest: "얀색", image: "../../../worksheets/assets/word-ha-white.png" },
                { word: "호랑이", focus: "호", rest: "랑이", image: "../../../worksheets/assets/word-ho-tiger.png" },
                { word: "호박", focus: "호", rest: "박", image: "../../../worksheets/assets/word-ho-pumpkin.png" },
                { word: "호두", focus: "호", rest: "두", image: "../../../worksheets/assets/word-ho-walnut.png" },
              ],
              teacherNote: "낱말 전체 읽기를 요구하지 않고 오늘 배운 글자만 찾아본다.",
              footerLeft: "배운 글자 사/소/하/호",
              footerRight: "사/소/하/호 낱말카드",
            },
          },
        ],
      },
    ],
  }),
  combinationLesson({
    folder: "lesson-06-jiji-chichi-combination",
    title: "6레슨 지지와 치치: 자/조/차/초를 만들어요",
    letters: "ㅈ/ㅊ/ㅏ/ㅗ/자/조/차/초",
    storyTitle: "지지와 치치가 새 글자를 만들어요",
    storyRead: "지지의 ㅈ 길과 치치의 ㅊ 칙칙 길이 모음 도구를 만나요.",
    storyTeacherNote: "지지는 ㅈ 길, 치치는 ㅊ 칙칙 길을 먼저 찾게 한다.",
    footerRight: "지지와 치치",
    characters: [
      {
        fullName: "지지 지렁이",
        shortName: "지지",
        consonant: "ㅈ",
        sound: "즈",
        teacherNoteStem: "지지의 ㅈ 길을 손가락으로 따라가고,",
        combos: [
          {
            vowel: "ㅏ",
            vowelTool: "아아 막대기",
            vowelSound: "아",
            result: "자",
            heroImage: "../../../public/지지 자 새시안.png",
            teacherNoteTail: "오른쪽의 ㅏ를 붙여 자를 읽는다.",
          },
          {
            vowel: "ㅗ",
            vowelTool: "오오 상자",
            vowelSound: "오",
            result: "조",
            heroImage: "../../../public/지지 조 새시안.png",
            teacherNoteTail: "아래의 ㅗ 상자를 붙여 조를 읽는다.",
          },
        ],
      },
      {
        fullName: "치치 칙폭이",
        shortName: "치치",
        consonant: "ㅊ",
        sound: "츠",
        teacherNoteStem: "치치의 ㅊ 칙칙 길을 손가락으로 따라가고,",
        combos: [
          {
            vowel: "ㅏ",
            vowelTool: "아아 막대기",
            vowelSound: "아",
            result: "차",
            heroImage: "../../../public/치치 차 새시안.png",
            teacherNoteTail: "오른쪽의 ㅏ를 붙여 차를 읽는다.",
          },
          {
            vowel: "ㅗ",
            vowelTool: "오오 상자",
            vowelSound: "오",
            result: "초",
            heroImage: "../../../public/치치 초 새시안.png",
            teacherNoteTail: "아래의 ㅗ 상자를 붙여 초를 읽는다.",
            wordCards: {
              focus: "자",
              title: "자/조/차/초가 들어가는 낱말",
              read: "자, 조, 차, 초가 들어 있는 생활 낱말을 그림으로 만나요.",
              activityTitle: "배운 글자가 들어간 곳을 진하게 봐요",
              cards: [
                { word: "자전거", focus: "자", rest: "전거", image: "../../../worksheets/assets/word-ja-bicycle.png" },
                { word: "자석", focus: "자", rest: "석", image: "../../../worksheets/assets/word-ja-magnet.png" },
                { word: "자두", focus: "자", rest: "두", image: "../../../worksheets/assets/word-ja-plum.png" },
                { word: "조개", focus: "조", rest: "개", image: "../../../worksheets/assets/word-jo-shell.png" },
                { word: "조끼", focus: "조", rest: "끼", image: "../../../worksheets/assets/word-jo-vest.png" },
                { word: "조명", focus: "조", rest: "명", image: "../../../worksheets/assets/word-jo-light.png" },
                { word: "차", focus: "차", rest: "", image: "../../../worksheets/assets/word-cha-tea.png" },
                {
                  word: "자동차",
                  image: "../../../worksheets/assets/word-cha-car.png",
                  parts: [
                    { text: "자동" },
                    { text: "차", focus: true },
                  ],
                },
                { word: "차례", focus: "차", rest: "례", image: "../../../worksheets/assets/word-cha-turn.png" },
                { word: "초콜릿", focus: "초", rest: "콜릿", image: "../../../worksheets/assets/word-cho-chocolate.png" },
                { word: "초승달", focus: "초", rest: "승달", image: "../../../worksheets/assets/word-cho-crescent-moon.png" },
                { word: "초록색", focus: "초", rest: "록색", image: "../../../worksheets/assets/word-cho-green.png" },
              ],
              teacherNote: "낱말 전체 읽기를 요구하지 않고 오늘 배운 글자만 찾아본다.",
              footerLeft: "배운 글자 자/조/차/초",
              footerRight: "자/조/차/초 낱말카드",
            },
          },
        ],
      },
    ],
  }),
  combinationLesson({
    folder: "lesson-07a-koko-toto-combination",
    title: "7-A레슨 코코와 토토: 카/코/타/토를 만들어요",
    letters: "ㅋ/ㅌ/ㅏ/ㅗ/카/코/타/토",
    storyTitle: "코코와 토토가 새 글자를 만들어요",
    storyRead: "코코 몸의 ㅋ 큰 숨 길과 토토 몸의 ㅌ 톡톡 길이 모음 도구를 만나요.",
    storyTeacherNote: "코코는 몸의 ㅋ 큰 숨 길, 토토는 몸의 ㅌ 톡톡 길을 먼저 찾게 한다.",
    footerRight: "코코와 토토",
    characters: [
      {
        fullName: "코코 코알라",
        shortName: "코코",
        consonant: "ㅋ",
        sound: "크",
        teacherNoteStem: "코코 몸의 ㅋ 큰 숨 길을 손가락으로 따라가고,",
        combos: [
          {
            vowel: "ㅏ",
            vowelTool: "아아 막대기",
            vowelSound: "아",
            result: "카",
            heroImage: "../../../public/코코 카 새시안.png",
            teacherNoteTail: "오른쪽의 ㅏ를 붙여 카를 읽는다.",
          },
          {
            vowel: "ㅗ",
            vowelTool: "오오 상자",
            vowelSound: "오",
            result: "코",
            heroImage: "../../../public/코코 코 새시안.png",
            teacherNoteTail: "아래의 ㅗ 상자를 붙여 코를 읽는다.",
          },
        ],
      },
      {
        fullName: "토토 토끼",
        shortName: "토토",
        consonant: "ㅌ",
        sound: "트",
        teacherNoteStem: "토토 몸의 ㅌ 톡톡 길을 손가락으로 따라가고,",
        combos: [
          {
            vowel: "ㅏ",
            vowelTool: "아아 막대기",
            vowelSound: "아",
            result: "타",
            heroImage: "../../../public/토토 타 새시안.png",
            teacherNoteTail: "오른쪽의 ㅏ를 붙여 타를 읽는다.",
          },
          {
            vowel: "ㅗ",
            vowelTool: "오오 상자",
            vowelSound: "오",
            result: "토",
            heroImage: "../../../public/토토 토 새시안.png",
            teacherNoteTail: "아래의 ㅗ 상자를 붙여 토를 읽는다.",
            wordCards: {
              focus: "카",
              title: "카/코/타/토가 들어가는 낱말",
              read: "카, 코, 타, 토가 들어 있는 생활 낱말을 그림으로 만나요.",
              activityTitle: "배운 글자가 들어간 곳을 진하게 봐요",
              cards: [
                { word: "카드", focus: "카", rest: "드", image: "../../../worksheets/assets/word-ka-card.png" },
                { word: "카메라", focus: "카", rest: "메라", image: "../../../worksheets/assets/word-ka-camera.png" },
                { word: "카트", focus: "카", rest: "트", image: "../../../worksheets/assets/word-ka-cart.png" },
                { word: "코알라", focus: "코", rest: "알라", image: "../../../worksheets/assets/word-ko-koala.png" },
                { word: "코끼리", focus: "코", rest: "끼리", image: "../../../worksheets/assets/word-ko-elephant.png" },
                { word: "코뿔소", focus: "코", rest: "뿔소", image: "../../../worksheets/assets/word-ko-rhino.png" },
                { word: "타조", focus: "타", rest: "조", image: "../../../worksheets/assets/word-ta-ostrich.png" },
                {
                  word: "치타",
                  image: "../../../worksheets/assets/word-ta-cheetah.png",
                  parts: [
                    { text: "치" },
                    { text: "타", focus: true },
                  ],
                },
                {
                  word: "낙타",
                  image: "../../../worksheets/assets/word-ta-camel.png",
                  parts: [
                    { text: "낙" },
                    { text: "타", focus: true },
                  ],
                },
                { word: "토끼", focus: "토", rest: "끼", image: "../../../worksheets/assets/word-to-rabbit.png" },
                {
                  word: "토마토",
                  image: "../../../worksheets/assets/word-to-tomato.png",
                  parts: [
                    { text: "토", focus: true },
                    { text: "마" },
                    { text: "토", focus: true },
                  ],
                },
                { word: "토끼풀", focus: "토", rest: "끼풀", image: "../../../worksheets/assets/word-to-clover.png" },
              ],
              teacherNote: "낱말 전체 읽기를 요구하지 않고 오늘 배운 글자만 찾아본다. 토마토는 처음과 끝의 토를 함께 찾아본다.",
              footerLeft: "배운 글자 카/코/타/토",
              footerRight: "카/코/타/토 낱말카드",
            },
          },
        ],
      },
    ],
  }),
  combinationLesson({
    folder: "lesson-07b-pupu-combination",
    title: "7-B레슨 푸푸: 파/포를 만들어요",
    letters: "ㅍ/ㅏ/ㅗ/파/포",
    storyTitle: "푸푸가 새 글자를 만들어요",
    storyRead: "푸푸 풍선 몸의 ㅍ 길이 모음 도구를 만나요.",
    storyTeacherNote: "푸푸 풍선 몸의 ㅍ 길을 먼저 찾고, 입바람 놀이와 함께 파/포를 읽는다.",
    footerRight: "푸푸",
    characters: [
      {
        fullName: "푸푸 풍선",
        shortName: "푸푸",
        consonant: "ㅍ",
        sound: "프",
        teacherNoteStem: "푸푸 풍선 몸의 ㅍ 길을 손가락으로 따라가고,",
        combos: [
          {
            vowel: "ㅏ",
            vowelTool: "아아 막대기",
            vowelSound: "아",
            result: "파",
            heroImage: "../../../public/푸푸 파 새시안.png",
            teacherNoteTail: "오른쪽의 ㅏ를 붙여 파를 읽는다.",
          },
          {
            vowel: "ㅗ",
            vowelTool: "오오 상자",
            vowelSound: "오",
            result: "포",
            heroImage: "../../../public/푸푸 포 새시안.png",
            teacherNoteTail: "아래의 ㅗ 상자를 붙여 포를 읽는다.",
            wordCards: {
              focus: "파",
              title: "파/포가 들어가는 낱말",
              read: "파, 포가 들어 있는 생활 낱말을 그림으로 만나요.",
              activityTitle: "배운 글자가 들어간 곳을 진하게 봐요",
              cards: [
                { word: "파란색", focus: "파", rest: "란색", image: "../../../worksheets/assets/word-pa-blue.png" },
                { word: "파이", focus: "파", rest: "이", image: "../../../worksheets/assets/word-pa-pie.png" },
                { word: "파인애플", focus: "파", rest: "인애플", image: "../../../worksheets/assets/word-pa-pineapple.png" },
                { word: "포도", focus: "포", rest: "도", image: "../../../worksheets/assets/word-po-grapes.png" },
                { word: "포크", focus: "포", rest: "크", image: "../../../worksheets/assets/word-po-fork.png" },
                {
                  word: "폭포",
                  image: "../../../worksheets/assets/word-po-waterfall.png",
                  parts: [
                    { text: "폭" },
                    { text: "포", focus: true },
                  ],
                },
              ],
              teacherNote: "낱말 전체 읽기를 요구하지 않고 오늘 배운 글자만 찾아본다.",
              footerLeft: "배운 글자 파/포",
              footerRight: "파/포 낱말카드",
            },
          },
        ],
      },
    ],
  }),
];

lessons.push(...vowelExpansionGroups.map(vowelExpansionLesson));
lessons.push({
  folder: "lesson-15-ya-yeo-yo-yu-vowel",
  title: "15레슨 아아 아기와 새 모음: 야/여/요/유를 만들어요",
  letters: "ㅇ/ㅑ/ㅕ/ㅛ/ㅠ/야/여/요/유",
  story: {
    title: "아아 아기가 새 모음 친구를 만나요",
    read: "조용히 기다리는 ㅇ 자리에 ㅑ, ㅕ, ㅛ, ㅠ 모음 친구들이 차례로 와요. 입 모양을 바꾸며 야, 여, 요, 유를 말해요.",
    panels: [
      { image: "../../../public/아아 아기 야 시안.png", caption: "ㅇ이 ㅑ를 만나, 야!" },
      { image: "../../../public/아아 아기 여 시안.png", caption: "ㅇ이 ㅕ를 만나, 여!" },
      { image: "../../../public/요요 그네 시안.png", caption: "ㅇ이 ㅛ를 만나, 요!" },
      { image: "../../../public/유유 의자 시안.png", caption: "ㅇ이 ㅠ를 만나, 유!" },
    ],
    teacherNote: "ㅇ은 첫소리 자리에서 조용히 기다리고, 오른쪽에 붙는 ㅑ/ㅕ와 아래에 붙는 ㅛ/ㅠ의 자리를 비교하며 야/여/요/유를 읽는다.",
    footerLeft: "그림 이야기",
    footerRight: "아아 아기와 야/여/요/유",
  },
  activities: [
    activity({
      title: "ㅇ과 ㅑ가 만나면 야",
      read: "아아 아기가 야야 두 나뭇가지를 만나 야! 입을 크게 열고 같이 말해요.",
      heroImage: "../../../public/아아 아기 야 시안.png",
      traceLetter: "야",
      buildPieces: ["ㅇ", "ㅑ", "야"],
      soundSteps: [
        { label: "아아 아기 자리", sound: "쉿!" },
        { label: "야야 두 나뭇가지 ㅑ 소리", sound: "야!" },
        { label: "합치면", sound: "야!" },
      ],
      teacherNote: "큰 글자 야를 손가락으로 천천히 따라간 뒤, ㅇ 오른쪽에 ㅑ를 붙여 야를 만든다.",
      footerRight: "아아 아기와 야",
    }),
    activity({
      title: "ㅇ과 ㅕ가 만나면 여",
      read: "아아 아기가 여여 두 풍선을 만나 여! 입을 부드럽게 열고 같이 말해요.",
      heroImage: "../../../public/아아 아기 여 시안.png",
      traceLetter: "여",
      buildPieces: ["ㅇ", "ㅕ", "여"],
      soundSteps: [
        { label: "아아 아기 자리", sound: "쉿!" },
        { label: "여여 두 풍선 ㅕ 소리", sound: "여!" },
        { label: "합치면", sound: "여!" },
      ],
      teacherNote: "큰 글자 여를 손가락으로 천천히 따라간 뒤, ㅇ 오른쪽에 ㅕ를 붙여 여를 만든다.",
      footerRight: "아아 아기와 여",
    }),
    activity({
      title: "ㅇ과 ㅛ가 만나면 요",
      read: "아아 아기가 요요 그네를 만나 요! 입을 동그랗게 하고 같이 말해요.",
      heroImage: "../../../public/요요 그네 시안.png",
      traceLetter: "요",
      buildPieces: ["ㅇ", "ㅛ", "요"],
      soundSteps: [
        { label: "아아 아기 자리", sound: "쉿!" },
        { label: "요요 그네 ㅛ 소리", sound: "요!" },
        { label: "합치면", sound: "요!" },
      ],
      teacherNote: "큰 글자 요를 손가락으로 천천히 따라간 뒤, ㅇ 아래에 ㅛ를 붙여 요를 만든다.",
      footerRight: "아아 아기와 요",
    }),
    activity({
      title: "ㅇ과 ㅠ가 만나면 유",
      read: "아아 아기가 유유 의자를 만나 유! 입을 앞으로 모으고 같이 말해요.",
      heroImage: "../../../public/유유 의자 시안.png",
      traceLetter: "유",
      buildPieces: ["ㅇ", "ㅠ", "유"],
      soundSteps: [
        { label: "아아 아기 자리", sound: "쉿!" },
        { label: "유유 의자 ㅠ 소리", sound: "유!" },
        { label: "합치면", sound: "유!" },
      ],
      teacherNote: "큰 글자 유를 손가락으로 천천히 따라간 뒤, ㅇ 아래에 ㅠ를 붙여 유를 만든다.",
      footerRight: "아아 아기와 유",
      wordCards: {
        focus: "야",
        title: "야/여/요/유가 들어가는 낱말",
        read: "야, 여, 요, 유가 들어 있는 쉬운 낱말을 그림으로 만나요.",
        activityTitle: "배운 글자가 들어간 곳을 진하게 봐요",
        cards: [
          { word: "야구공", focus: "야", rest: "구공", image: "../../../worksheets/assets/word-ya-baseball.png" },
          { word: "야채", focus: "야", rest: "채", image: "../../../worksheets/assets/word-ya-vegetables.png" },
          { word: "야자", focus: "야", rest: "자", image: "../../../worksheets/assets/word-ya-palm.png" },
          { word: "여우", focus: "여", rest: "우", image: "../../../worksheets/assets/word-yeo-fox.png" },
          { word: "여름", focus: "여", rest: "름", image: "../../../worksheets/assets/word-yeo-summer.png" },
          { word: "여자", focus: "여", rest: "자", image: "../../../worksheets/assets/word-yeo-woman.png" },
          { word: "요리", focus: "요", rest: "리", image: "../../../worksheets/assets/word-yo-cooking.png" },
          { word: "요정", focus: "요", rest: "정", image: "../../../worksheets/assets/word-yo-fairy.png" },
          { word: "요구르트", focus: "요", rest: "구르트", image: "../../../worksheets/assets/word-yo-yogurt.png" },
          { word: "유리", focus: "유", rest: "리", image: "../../../worksheets/assets/word-yu-glass.png" },
          { word: "유치원", focus: "유", rest: "치원", image: "../../../worksheets/assets/word-yu-kindergarten.png" },
          { word: "유령", focus: "유", rest: "령", image: "../../../worksheets/assets/word-yu-ghost.png" },
        ],
        teacherNote: "낱말 전체 읽기를 요구하지 않고 오늘 배운 야/여/요/유 음절만 찾아본다.",
        footerLeft: "배운 글자 야/여/요/유",
        footerRight: "야/여/요/유 낱말카드",
      },
    }),
  ],
  review: {
    sounds: ["야", "여", "요", "유"],
    builds: [["ㅇ", "ㅑ", "야"], ["ㅇ", "ㅕ", "여"], ["ㅇ", "ㅛ", "요"], ["ㅇ", "ㅠ", "유"]],
    footerRight: "아아 아기와 야/여/요/유",
  },
});

function worksheetForLesson(lesson) {
  const reviewChunks = chunkItems(lesson.activities, 4);
  const reviewPages = reviewChunks.map((items, index) => reviewPage({
    sounds: items.map((item) => item.traceLetter),
    builds: items.map((item) => item.buildPieces),
    images: items.map((item) => item.heroImage),
    footerRight: lesson.review.footerRight,
    kicker: reviewChunks.length === 1
      ? "마지막 / 소리 정리"
      : `소리 정리 ${index + 1}/${reviewChunks.length}`,
  }));

  const activityPages = [];
  let pageNumber = 2;
  for (const item of lesson.activities) {
    activityPages.push({
      type: "vowel-activity",
      theme: "gogo",
      kicker: `${pageNumber}장 / 소리 활동`,
      title: item.title,
      read: item.read,
      heroImage: item.heroImage,
      traceLetter: item.traceLetter,
      activityTitle: item.activityTitle || "보고 따라 그리고 붙여서 만들어요",
      buildPieces: item.buildPieces,
      soundSteps: item.soundSteps,
      videoQr: videoQrForTraceLetter(item.traceLetter),
      teacherNote: item.teacherNote,
      footerLeft: item.footerLeft,
      footerRight: item.footerRight,
    });
    pageNumber += 1;

    if (item.wordCards) {
      activityPages.push({
        ...wordCardPage(item.wordCards),
        kicker: `${pageNumber}장 / 글자 낱말`,
      });
      pageNumber += 1;
    }
  }

  return {
    title: lesson.title,
    pages: [
      {
        type: "story",
        theme: "gogo",
        kicker: "1장 / 그림 이야기",
        title: lesson.story.title,
        read: lesson.story.read,
        panels: lesson.story.panels,
        teacherNote: lesson.story.teacherNote,
        footerLeft: lesson.story.footerLeft,
        footerRight: lesson.story.footerRight,
      },
      ...activityPages,
      ...reviewPages,
    ],
  };
}

async function writeLesson(lesson) {
  const lessonDir = path.join(root, lesson.folder);
  const worksheet = worksheetForLesson(lesson);
  await mkdir(lessonDir, { recursive: true });
  await writeFile(path.join(lessonDir, "worksheet.json"), `${JSON.stringify(worksheet, null, 2)}\n`, "utf8");
  await writeFile(
    path.join(lessonDir, "worksheet.html"),
    renderWorksheetDocument(worksheet, { cssHref }),
    "utf8"
  );
}

async function writeManifest() {
  await mkdir(root, { recursive: true });
  await writeFile(
    path.join(root, "manifest.json"),
    `${JSON.stringify({
      title: "모음 친구 레슨",
      lessons: lessons.map((lesson) => ({
        id: lesson.folder,
        title: lesson.title,
        letters: lesson.letters,
        worksheetPath: `../lessons/vowels/${lesson.folder}/worksheet.json`,
        htmlPath: `../lessons/vowels/${lesson.folder}/worksheet.html`,
      })),
    }, null, 2)}\n`,
    "utf8"
  );
}

for (const lesson of lessons) {
  await writeLesson(lesson);
}

await writeManifest();

console.log(`Wrote ${lessons.length} grouped vowel lesson folders to ${root}`);
