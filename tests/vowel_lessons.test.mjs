import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("lessons", "vowels");

function pngSize(filePath) {
  const png = readFileSync(filePath);
  assert.ok(png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${filePath} should be a PNG`);
  return [png.readUInt32BE(16), png.readUInt32BE(20)];
}

assert.ok(
  existsSync(path.resolve("tools", "compose_aa_baby_y_vowel_heroes.mjs")),
  "ya/yeo baby hero images should be reproducible from reference PNGs"
);
for (const imageName of ["\uc544\uc544 \uc544\uae30 \uc57c \uc2dc\uc548.png", "\uc544\uc544 \uc544\uae30 \uc5ec \uc2dc\uc548.png"]) {
  assert.deepEqual(pngSize(path.resolve("public", imageName)), [1254, 1254], `${imageName} should match worksheet hero size`);
}
const expectedLessons = [
  {
    id: "lesson-01-aa-baby-vowel",
    title: "1레슨 아아 아기와 아/오/우: 모음 도구를 만나요",
    letters: "ㅇ/ㅏ/ㅗ/ㅜ/아/오/우",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "word-card", "sound-choice"],
    storyImages: ["aa-story-01-silent.png", "aa-story-02-branch.png", "aa-story-03-ah.png"],
    storyCaptions: ["아아 아기는 조용조용.", "어? 나뭇가지다!", "나뭇가지를 들고, 아!"],
    builds: [
      ["ㅇ", "ㅏ", "아"],
      ["ㅇ", "ㅗ", "오"],
      ["ㅇ", "ㅜ", "우"],
    ],
    reviewSounds: ["아", "오", "우"],
    wordCards: [
      { word: "아기", focus: "아", rest: "기", image: "baby.png" },
      { word: "아침", focus: "아", rest: "침", image: "morning.png" },
      { word: "아이스크림", focus: "아", rest: "이스크림", image: "ice-cream.png" },
      { word: "오이", focus: "오", rest: "이", image: "cucumber.png" },
      { word: "오리", focus: "오", rest: "리", image: "duck.png" },
      { word: "오랑우탄", focus: "오", rest: "랑우탄", image: "orangutan.png" },
      { word: "우산", focus: "우", rest: "산", image: "umbrella.png" },
      { word: "우유", focus: "우", rest: "유", image: "milk.png" },
      { word: "우물", focus: "우", rest: "물", image: "well.png" },
    ],  },
  {
    id: "lesson-02-gogo-nana-combination",
    title: "2레슨 고고와 나나: 가/고/나/노를 만들어요",
    letters: "ㄱ/ㄴ/ㅏ/ㅗ/가/고/나/노",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "vowel-activity", "word-card", "sound-choice"],
    storyImages: [
      "고고 가 막대기 ㄱ폰트 크게 새시안.png",
      "고고 고 상자 ㄱ폰트 크게 새시안.png",
      "나나 나 새시안.png",
      "나나 노 새시안.png",
    ],
    storyCaptions: ["ㄱ이 ㅏ를 만나, 가!", "ㄱ이 ㅗ를 만나, 고!", "ㄴ이 ㅏ를 만나, 나!", "ㄴ이 ㅗ를 만나, 노!"],
    builds: [
      ["ㄱ", "ㅏ", "가"],
      ["ㄱ", "ㅗ", "고"],
      ["ㄴ", "ㅏ", "나"],
      ["ㄴ", "ㅗ", "노"],
    ],
    reviewSounds: ["가", "고", "나", "노"],
    wordCards: [
      { word: "가방", focus: "가", rest: "방", image: "word-ga-bag.png" },
      { word: "가지", focus: "가", rest: "지", image: "word-ga-eggplant.png" },
      { word: "가위", focus: "가", rest: "위", image: "word-ga-scissors.png" },
      { word: "고양이", focus: "고", rest: "양이", image: "word-go-cat.png" },
      { word: "고구마", focus: "고", rest: "구마", image: "word-go-sweet-potato.png" },
      { word: "고래", focus: "고", rest: "래", image: "word-go-whale.png" },
      { word: "나비", focus: "나", rest: "비", image: "word-na-butterfly.png" },
      { word: "나무", focus: "나", rest: "무", image: "word-na-tree.png" },
      { word: "나사", focus: "나", rest: "사", image: "word-na-screw.png" },
      { word: "노란색", focus: "노", rest: "란색", image: "word-no-yellow.png" },
      { word: "노래", focus: "노", rest: "래", image: "word-no-song.png" },
      { word: "노트", focus: "노", rest: "트", image: "word-no-note.png" },
    ],  },
  {
    id: "lesson-03-mimi-bubu-combination",
    title: "3레슨 미미와 부부: 마/모/바/보를 만들어요",
    letters: "ㅁ/ㅂ/ㅏ/ㅗ/마/모/바/보",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "vowel-activity", "word-card", "sound-choice"],
    storyImages: [
      "미미 마 새시안.png",
      "미미 모 새시안.png",
      "부부 바 새시안.png",
      "부부 보 새시안.png",
    ],
    storyCaptions: ["ㅁ이 ㅏ를 만나, 마!", "ㅁ이 ㅗ를 만나, 모!", "ㅂ이 ㅏ를 만나, 바!", "ㅂ이 ㅗ를 만나, 보!"],
    builds: [
      ["ㅁ", "ㅏ", "마"],
      ["ㅁ", "ㅗ", "모"],
      ["ㅂ", "ㅏ", "바"],
      ["ㅂ", "ㅗ", "보"],
    ],
    reviewSounds: ["마", "모", "바", "보"],
    wordCards: [
      { word: "마늘", focus: "마", rest: "늘", image: "word-ma-garlic.png" },
      { word: "마술사", focus: "마", rest: "술사", image: "word-ma-magician.png" },
      { word: "마스크", focus: "마", rest: "스크", image: "word-ma-mask.png" },
      { word: "모자", focus: "모", rest: "자", image: "word-mo-hat.png" },
      { word: "모래", focus: "모", rest: "래", image: "word-mo-sand.png" },
      { word: "모기", focus: "모", rest: "기", image: "word-mo-mosquito.png" },
      { word: "바다", focus: "바", rest: "다", image: "word-ba-sea.png" },
      { word: "바퀴", focus: "바", rest: "퀴", image: "word-ba-wheel.png" },
      { word: "바나나", focus: "바", rest: "나나", image: "word-ba-banana.png" },
      { word: "보라색", focus: "보", rest: "라색", image: "word-bo-purple.png" },
      { word: "보름달", focus: "보", rest: "름달", image: "word-bo-full-moon.png" },
      { word: "보물상자", focus: "보", rest: "물상자", image: "word-bo-treasure-chest.png" },
    ],
  },  {
    id: "lesson-04-dodo-rara-combination",
    title: "4레슨 도도와 라라: 다/도/라/로를 만들어요",
    letters: "ㄷ/ㄹ/ㅏ/ㅗ/다/도/라/로",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "vowel-activity", "word-card", "sound-choice"],
    storyImages: [
      "도도 다 새시안.png",
      "도도 도 새시안.png",
      "라라 라 새시안.png",
      "라라 로 새시안.png",
    ],
    storyCaptions: ["ㄷ이 ㅏ를 만나, 다!", "ㄷ이 ㅗ를 만나, 도!", "ㄹ이 ㅏ를 만나, 라!", "ㄹ이 ㅗ를 만나, 로!"],
    builds: [
      ["ㄷ", "ㅏ", "다"],
      ["ㄷ", "ㅗ", "도"],
      ["ㄹ", "ㅏ", "라"],
      ["ㄹ", "ㅗ", "로"],
    ],
    reviewSounds: ["다", "도", "라", "로"],
    wordCards: [
      { word: "다람쥐", focus: "다", rest: "람쥐", image: "word-da-squirrel.png" },
      { word: "다리미", focus: "다", rest: "리미", image: "word-da-iron.png" },
      { word: "다리", focus: "다", rest: "리", image: "word-da-leg.png" },
      { word: "도토리", focus: "도", rest: "토리", image: "word-do-acorn.png" },
      { word: "도넛", focus: "도", rest: "넛", image: "word-do-donut.png" },
      { word: "도깨비", focus: "도", rest: "깨비", image: "word-do-dokkaebi.png" },
      { word: "라디오", focus: "라", rest: "디오", image: "word-ra-radio.png" },
      { word: "라면", focus: "라", rest: "면", image: "word-ra-ramen.png" },
      { word: "라켓", focus: "라", rest: "켓", image: "word-ra-racket.png" },
      { word: "로봇", focus: "로", rest: "봇", image: "word-ro-robot.png" },
      { word: "로켓", focus: "로", rest: "켓", image: "word-ro-rocket.png" },
      { word: "로션", focus: "로", rest: "션", image: "word-ro-lotion.png" },
    ],
  },  {
    id: "lesson-05-sasa-haha-combination",
    title: "5레슨 사사와 하하: 사/소/하/호를 만들어요",
    letters: "ㅅ/ㅎ/ㅏ/ㅗ/사/소/하/호",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "vowel-activity", "word-card", "sound-choice"],
    storyImages: [
      "사사 사 새시안.png",
      "사사 소 새시안.png",
      "하하 하 새시안.png",
      "하하 호 새시안.png",
    ],
    storyCaptions: ["ㅅ이 ㅏ를 만나, 사!", "ㅅ이 ㅗ를 만나, 소!", "ㅎ이 ㅏ를 만나, 하!", "ㅎ이 ㅗ를 만나, 호!"],
    builds: [
      ["ㅅ", "ㅏ", "사"],
      ["ㅅ", "ㅗ", "소"],
      ["ㅎ", "ㅏ", "하"],
      ["ㅎ", "ㅗ", "호"],
    ],
    reviewSounds: ["사", "소", "하", "호"],
    wordCards: [
      { word: "사슴", focus: "사", rest: "슴", image: "word-sa-deer.png" },
      { word: "사다리", focus: "사", rest: "다리", image: "word-sa-ladder.png" },
      { word: "사탕", focus: "사", rest: "탕", image: "word-sa-candy.png" },
      { word: "소금", focus: "소", rest: "금", image: "word-so-salt.png" },
      { word: "소", focus: "소", rest: "", image: "word-so-cow.png" },
      { word: "소리", focus: "소", rest: "리", image: "word-so-sound.png" },
      { word: "하마", focus: "하", rest: "마", image: "word-ha-hippo.png" },
      { word: "하늘", focus: "하", rest: "늘", image: "word-ha-sky.png" },
      { word: "하얀색", focus: "하", rest: "얀색", image: "word-ha-white.png" },
      { word: "호랑이", focus: "호", rest: "랑이", image: "word-ho-tiger.png" },
      { word: "호박", focus: "호", rest: "박", image: "word-ho-pumpkin.png" },
      { word: "호두", focus: "호", rest: "두", image: "word-ho-walnut.png" },
    ],
  },  {
    id: "lesson-06-jiji-chichi-combination",
    title: "6레슨 지지와 치치: 자/조/차/초를 만들어요",
    letters: "ㅈ/ㅊ/ㅏ/ㅗ/자/조/차/초",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "vowel-activity", "word-card", "sound-choice"],
    storyImages: [
      "지지 자 새시안.png",
      "지지 조 새시안.png",
      "치치 차 새시안.png",
      "치치 초 새시안.png",
    ],
    storyCaptions: ["ㅈ이 ㅏ를 만나, 자!", "ㅈ이 ㅗ를 만나, 조!", "ㅊ이 ㅏ를 만나, 차!", "ㅊ이 ㅗ를 만나, 초!"],
    builds: [
      ["ㅈ", "ㅏ", "자"],
      ["ㅈ", "ㅗ", "조"],
      ["ㅊ", "ㅏ", "차"],
      ["ㅊ", "ㅗ", "초"],
    ],
    reviewSounds: ["자", "조", "차", "초"],
    wordCards: [
      { word: "자전거", focus: "자", rest: "전거", image: "word-ja-bicycle.png" },
      { word: "자석", focus: "자", rest: "석", image: "word-ja-magnet.png" },
      { word: "자두", focus: "자", rest: "두", image: "word-ja-plum.png" },
      { word: "조개", focus: "조", rest: "개", image: "word-jo-shell.png" },
      { word: "조끼", focus: "조", rest: "끼", image: "word-jo-vest.png" },
      { word: "조명", focus: "조", rest: "명", image: "word-jo-light.png" },
      { word: "차", focus: "차", rest: "", image: "word-cha-tea.png" },
      {
        word: "자동차",
        image: "word-cha-car.png",
        parts: [
          { text: "자동" },
          { text: "차", focus: true },
        ],
      },
      { word: "차례", focus: "차", rest: "례", image: "word-cha-turn.png" },
      { word: "초콜릿", focus: "초", rest: "콜릿", image: "word-cho-chocolate.png" },
      { word: "초승달", focus: "초", rest: "승달", image: "word-cho-crescent-moon.png" },
      { word: "초록색", focus: "초", rest: "록색", image: "word-cho-green.png" },
    ],
  },
  {
    id: "lesson-07a-koko-toto-combination",
    title: "7-A레슨 코코와 토토: 카/코/타/토를 만들어요",
    letters: "ㅋ/ㅌ/ㅏ/ㅗ/카/코/타/토",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "vowel-activity", "word-card", "sound-choice"],
    storyImages: [
      "코코 카 새시안.png",
      "코코 코 새시안.png",
      "토토 타 새시안.png",
      "토토 토 새시안.png",
    ],
    storyCaptions: ["ㅋ이 ㅏ를 만나, 카!", "ㅋ이 ㅗ를 만나, 코!", "ㅌ이 ㅏ를 만나, 타!", "ㅌ이 ㅗ를 만나, 토!"],
    builds: [
      ["ㅋ", "ㅏ", "카"],
      ["ㅋ", "ㅗ", "코"],
      ["ㅌ", "ㅏ", "타"],
      ["ㅌ", "ㅗ", "토"],
    ],
    reviewSounds: ["카", "코", "타", "토"],
    wordCards: [
      { word: "카드", focus: "카", rest: "드", image: "word-ka-card.png" },
      { word: "카메라", focus: "카", rest: "메라", image: "word-ka-camera.png" },
      { word: "카트", focus: "카", rest: "트", image: "word-ka-cart.png" },
      { word: "코알라", focus: "코", rest: "알라", image: "word-ko-koala.png" },
      { word: "코끼리", focus: "코", rest: "끼리", image: "word-ko-elephant.png" },
      { word: "코뿔소", focus: "코", rest: "뿔소", image: "word-ko-rhino.png" },
      { word: "타조", focus: "타", rest: "조", image: "word-ta-ostrich.png" },
      {
        word: "치타",
        image: "word-ta-cheetah.png",
        parts: [
          { text: "치" },
          { text: "타", focus: true },
        ],
      },
      {
        word: "낙타",
        image: "word-ta-camel.png",
        parts: [
          { text: "낙" },
          { text: "타", focus: true },
        ],
      },
      { word: "토끼", focus: "토", rest: "끼", image: "word-to-rabbit.png" },
      {
        word: "토마토",
        image: "word-to-tomato.png",
        parts: [
          { text: "토", focus: true },
          { text: "마" },
          { text: "토", focus: true },
        ],
      },
      { word: "토끼풀", focus: "토", rest: "끼풀", image: "word-to-clover.png" },
    ],
  },
  {
    id: "lesson-07b-pupu-combination",
    title: "7-B레슨 푸푸: 파/포를 만들어요",
    letters: "ㅍ/ㅏ/ㅗ/파/포",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "word-card", "sound-choice"],
    storyImages: [
      "푸푸 파 새시안.png",
      "푸푸 포 새시안.png",
    ],
    storyCaptions: ["ㅍ이 ㅏ를 만나, 파!", "ㅍ이 ㅗ를 만나, 포!"],
    builds: [
      ["ㅍ", "ㅏ", "파"],
      ["ㅍ", "ㅗ", "포"],
    ],
    reviewSounds: ["파", "포"],
    wordCards: [
      { word: "파란색", focus: "파", rest: "란색", image: "word-pa-blue.png" },
      { word: "파이", focus: "파", rest: "이", image: "word-pa-pie.png" },
      { word: "파인애플", focus: "파", rest: "인애플", image: "word-pa-pineapple.png" },
      { word: "포도", focus: "포", rest: "도", image: "word-po-grapes.png" },
      { word: "포크", focus: "포", rest: "크", image: "word-po-fork.png" },
      {
        word: "폭포",
        image: "word-po-waterfall.png",
        parts: [
          { text: "폭" },
          { text: "포", focus: true },
        ],
      },
    ],
  },
];

const expansionVowels = ["ㅓ", "ㅜ", "ㅡ", "ㅣ"];

function expansionPageTypes(buildCount) {
  return [
    "story",
    ...Array.from({ length: buildCount }, () => "vowel-activity"),
    ...Array.from({ length: Math.ceil(buildCount / 4) }, () => "sound-choice"),
  ];
}

function expansionBuilds(characters) {
  return characters.flatMap((character) =>
    character.results.map((result, index) => [character.consonant, expansionVowels[index], result])
  );
}

function expansionImages(characters) {
  return characters.map((character) => `${character.name} ${character.results[0]} 새시안.png`);
}

function expansionCaptions(characters) {
  return characters.map((character) => `${character.consonant}이 새 모음을 만나, ${character.results[0]}부터 시작!`);
}

expectedLessons.push(
  {
    id: "lesson-08-ieung-vowel-expansion",
    title: "8레슨 ㅇ과 새 모음: 어/우/으/이를 만들어요",
    letters: "ㅇ/ㅓ/ㅜ/ㅡ/ㅣ/어/우/으/이",
    pageTypes: expansionPageTypes(4),
    storyImages: ["어어 풍선 시안2.png", "우우 발판 시안.png", "으으 쿠션 시안.png", "이이 막대 시안.png"],
    storyCaptions: ["ㅇ이 ㅓ를 만나, 어!", "ㅇ이 ㅜ를 만나, 우!", "ㅇ이 ㅡ를 만나, 으!", "ㅇ이 ㅣ를 만나, 이!"],
    builds: [["ㅇ", "ㅓ", "어"], ["ㅇ", "ㅜ", "우"], ["ㅇ", "ㅡ", "으"], ["ㅇ", "ㅣ", "이"]],
    reviewSounds: ["어", "우", "으", "이"],
  },
  {
    id: "lesson-09-gogo-nana-vowel-expansion",
    title: "9레슨 고고와 나나: 거/구/그/기/너/누/느/니를 만들어요",
    letters: "ㄱ/ㄴ/ㅓ/ㅜ/ㅡ/ㅣ/거/구/그/기/너/누/느/니",
    pageTypes: expansionPageTypes(8),
    storyImages: expansionImages([
      { name: "고고", results: ["거", "구", "그", "기"] },
      { name: "나나", results: ["너", "누", "느", "니"] },
    ]),
    storyCaptions: expansionCaptions([
      { consonant: "ㄱ", results: ["거", "구", "그", "기"] },
      { consonant: "ㄴ", results: ["너", "누", "느", "니"] },
    ]),
    builds: expansionBuilds([
      { consonant: "ㄱ", results: ["거", "구", "그", "기"] },
      { consonant: "ㄴ", results: ["너", "누", "느", "니"] },
    ]),
    reviewSounds: ["거", "구", "그", "기", "너", "누", "느", "니"],
  },
  {
    id: "lesson-10-mimi-rara-vowel-expansion",
    title: "10레슨 미미와 라라: 머/무/므/미/러/루/르/리를 만들어요",
    letters: "ㅁ/ㄹ/ㅓ/ㅜ/ㅡ/ㅣ/머/무/므/미/러/루/르/리",
    pageTypes: expansionPageTypes(8),
    storyImages: expansionImages([
      { name: "미미", results: ["머", "무", "므", "미"] },
      { name: "라라", results: ["러", "루", "르", "리"] },
    ]),
    storyCaptions: expansionCaptions([
      { consonant: "ㅁ", results: ["머", "무", "므", "미"] },
      { consonant: "ㄹ", results: ["러", "루", "르", "리"] },
    ]),
    builds: expansionBuilds([
      { consonant: "ㅁ", results: ["머", "무", "므", "미"] },
      { consonant: "ㄹ", results: ["러", "루", "르", "리"] },
    ]),
    reviewSounds: ["머", "무", "므", "미", "러", "루", "르", "리"],
  },
  {
    id: "lesson-11-dodo-bubu-vowel-expansion",
    title: "11레슨 도도와 부부: 더/두/드/디/버/부/브/비를 만들어요",
    letters: "ㄷ/ㅂ/ㅓ/ㅜ/ㅡ/ㅣ/더/두/드/디/버/부/브/비",
    pageTypes: expansionPageTypes(8),
    storyImages: expansionImages([
      { name: "도도", results: ["더", "두", "드", "디"] },
      { name: "부부", results: ["버", "부", "브", "비"] },
    ]),
    storyCaptions: expansionCaptions([
      { consonant: "ㄷ", results: ["더", "두", "드", "디"] },
      { consonant: "ㅂ", results: ["버", "부", "브", "비"] },
    ]),
    builds: expansionBuilds([
      { consonant: "ㄷ", results: ["더", "두", "드", "디"] },
      { consonant: "ㅂ", results: ["버", "부", "브", "비"] },
    ]),
    reviewSounds: ["더", "두", "드", "디", "버", "부", "브", "비"],
  },
  {
    id: "lesson-12-sasa-haha-vowel-expansion",
    title: "12레슨 사사와 하하: 서/수/스/시/허/후/흐/히를 만들어요",
    letters: "ㅅ/ㅎ/ㅓ/ㅜ/ㅡ/ㅣ/서/수/스/시/허/후/흐/히",
    pageTypes: expansionPageTypes(8),
    storyImages: expansionImages([
      { name: "사사", results: ["서", "수", "스", "시"] },
      { name: "하하", results: ["허", "후", "흐", "히"] },
    ]),
    storyCaptions: expansionCaptions([
      { consonant: "ㅅ", results: ["서", "수", "스", "시"] },
      { consonant: "ㅎ", results: ["허", "후", "흐", "히"] },
    ]),
    builds: expansionBuilds([
      { consonant: "ㅅ", results: ["서", "수", "스", "시"] },
      { consonant: "ㅎ", results: ["허", "후", "흐", "히"] },
    ]),
    reviewSounds: ["서", "수", "스", "시", "허", "후", "흐", "히"],
  },
  {
    id: "lesson-13-jiji-chichi-vowel-expansion",
    title: "13레슨 지지와 치치: 저/주/즈/지/처/추/츠/치를 만들어요",
    letters: "ㅈ/ㅊ/ㅓ/ㅜ/ㅡ/ㅣ/저/주/즈/지/처/추/츠/치",
    pageTypes: expansionPageTypes(8),
    storyImages: expansionImages([
      { name: "지지", results: ["저", "주", "즈", "지"] },
      { name: "치치", results: ["처", "추", "츠", "치"] },
    ]),
    storyCaptions: expansionCaptions([
      { consonant: "ㅈ", results: ["저", "주", "즈", "지"] },
      { consonant: "ㅊ", results: ["처", "추", "츠", "치"] },
    ]),
    builds: expansionBuilds([
      { consonant: "ㅈ", results: ["저", "주", "즈", "지"] },
      { consonant: "ㅊ", results: ["처", "추", "츠", "치"] },
    ]),
    reviewSounds: ["저", "주", "즈", "지", "처", "추", "츠", "치"],
  },
  {
    id: "lesson-14-koko-toto-pupu-vowel-expansion",
    title: "14레슨 코코와 토토와 푸푸: 커/쿠/크/키/터/투/트/티/퍼/푸/프/피를 만들어요",
    letters: "ㅋ/ㅌ/ㅍ/ㅓ/ㅜ/ㅡ/ㅣ/커/쿠/크/키/터/투/트/티/퍼/푸/프/피",
    pageTypes: expansionPageTypes(12),
    storyImages: expansionImages([
      { name: "코코", results: ["커", "쿠", "크", "키"] },
      { name: "토토", results: ["터", "투", "트", "티"] },
      { name: "푸푸", results: ["퍼", "푸", "프", "피"] },
    ]),
    storyCaptions: expansionCaptions([
      { consonant: "ㅋ", results: ["커", "쿠", "크", "키"] },
      { consonant: "ㅌ", results: ["터", "투", "트", "티"] },
      { consonant: "ㅍ", results: ["퍼", "푸", "프", "피"] },
    ]),
    builds: expansionBuilds([
      { consonant: "ㅋ", results: ["커", "쿠", "크", "키"] },
      { consonant: "ㅌ", results: ["터", "투", "트", "티"] },
      { consonant: "ㅍ", results: ["퍼", "푸", "프", "피"] },
    ]),
    reviewSounds: ["커", "쿠", "크", "키", "터", "투", "트", "티", "퍼", "푸", "프", "피"],
  },
  {
    id: "lesson-15-ya-yeo-yo-yu-vowel",
    title: "15레슨 아아 아기와 새 모음: 야/여/요/유를 만들어요",
    letters: "ㅇ/ㅑ/ㅕ/ㅛ/ㅠ/야/여/요/유",
    pageTypes: ["story", "vowel-activity", "vowel-activity", "vowel-activity", "vowel-activity", "word-card", "sound-choice"],
    storyImages: ["아아 아기 야 나뭇가지 노드방출 생성.png", "아아 아기 여 풍선 노드방출 생성.png", "요요 그네 시안.png", "유유 의자 시안.png"],
    storyCaptions: ["ㅇ이 ㅑ를 만나, 야!", "ㅇ이 ㅕ를 만나, 여!", "ㅇ이 ㅛ를 만나, 요!", "ㅇ이 ㅠ를 만나, 유!"],
    builds: [["ㅇ", "ㅑ", "야"], ["ㅇ", "ㅕ", "여"], ["ㅇ", "ㅛ", "요"], ["ㅇ", "ㅠ", "유"]],
    reviewSounds: ["야", "여", "요", "유"],
    wordCards: [
      { word: "야구공", focus: "야", rest: "구공", image: "word-ya-baseball.png" },
      { word: "야채", focus: "야", rest: "채", image: "word-ya-vegetables.png" },
      { word: "야자", focus: "야", rest: "자", image: "word-ya-palm.png" },
      { word: "여우", focus: "여", rest: "우", image: "word-yeo-fox.png" },
      { word: "여름", focus: "여", rest: "름", image: "word-yeo-summer.png" },
      { word: "여자", focus: "여", rest: "자", image: "word-yeo-woman.png" },
      { word: "요리", focus: "요", rest: "리", image: "word-yo-cooking.png" },
      { word: "요정", focus: "요", rest: "정", image: "word-yo-fairy.png" },
      { word: "요구르트", focus: "요", rest: "구르트", image: "word-yo-yogurt.png" },
      { word: "유리", focus: "유", rest: "리", image: "word-yu-glass.png" },
      { word: "유치원", focus: "유", rest: "치원", image: "word-yu-kindergarten.png" },
      { word: "유령", focus: "유", rest: "령", image: "word-yu-ghost.png" },
    ],
  },);

assert.ok(existsSync(root), "vowel lessons folder should exist");
assert.ok(existsSync(path.join(root, "manifest.json")), "vowel manifest should exist");

const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
assert.deepEqual(
  manifest.lessons.map((lesson) => [lesson.id, lesson.letters]),
  expectedLessons.map((lesson) => [lesson.id, lesson.letters]),
  "vowel manifest should expose the grouped lesson bundles"
);

for (const expected of expectedLessons) {
  const lessonDir = path.join(root, expected.id);
  assert.ok(existsSync(lessonDir), `${expected.id} folder should exist`);

  const worksheet = JSON.parse(await readFile(path.join(lessonDir, "worksheet.json"), "utf8"));
  assert.equal(worksheet.title, expected.title);
  assert.deepEqual(worksheet.pages.map((page) => page.type), expected.pageTypes);

  const storyPage = worksheet.pages[0];
  assert.equal(storyPage.panels.length, expected.storyImages.length, `${expected.id} story page should include every intro cut`);
  if (expected.storyImages) {
    assert.deepEqual(
      storyPage.panels.map((panel) => path.basename(panel.image)),
      expected.storyImages,
      `${expected.id} story page should use the expected intro images`
    );
    assert.deepEqual(
      storyPage.panels.map((panel) => panel.caption),
      expected.storyCaptions,
      `${expected.id} story page should use the expected intro captions`
    );
  }
  for (const panel of storyPage.panels) {
    assert.ok(existsSync(path.resolve(lessonDir, panel.image)), `${expected.id} story image ${panel.image} should exist`);
  }

  const wordCardPages = worksheet.pages.filter((page) => page.type === "word-card");
  if (expected.wordCards) {
    assert.equal(wordCardPages.length, 1, `${expected.id} should include one first-letter word card page`);
    assert.deepEqual(
      wordCardPages[0].cards.map((card) => {
        const normalized = {
          word: card.word,
          image: path.basename(card.image),
        };
        if (card.focus !== undefined) normalized.focus = card.focus;
        if (card.rest !== undefined) normalized.rest = card.rest;
        if (card.parts !== undefined) normalized.parts = card.parts;
        return normalized;
      }),
      expected.wordCards.map((card) => ({ ...card, image: path.basename(card.image) })),
      `${expected.id} word cards should use the planned first-letter vocabulary`
    );
    for (const card of wordCardPages[0].cards) {
      assert.ok(existsSync(path.resolve(lessonDir, card.image)), `${expected.id} word card image ${card.image} should exist`);
    }
  } else {
    assert.equal(wordCardPages.length, 0, `${expected.id} should not include word card pages yet`);
  }

  const activityPages = worksheet.pages.filter((page) => page.type === "vowel-activity");
  assert.deepEqual(activityPages.map((page) => page.buildPieces), expected.builds);
  for (const page of activityPages) {
    assert.ok(existsSync(path.resolve(lessonDir, page.heroImage)), `${expected.id} hero image ${page.heroImage} should exist`);
    assert.equal(page.soundSteps.length, 3, `${expected.id} ${page.traceLetter} should keep three sound steps`);
    assert.equal(page.soundSteps.at(-1).sound, `${page.traceLetter}!`);
  }

  const reviewPages = worksheet.pages.filter((page) => page.type === "sound-choice");
  assert.deepEqual(
    reviewPages.flatMap((page) => page.prompts.map((prompt) => prompt.sound)),
    expected.reviewSounds
  );
  assert.deepEqual(
    reviewPages.flatMap((page) => page.choices.map((choice) => choice.buildPieces)),
    expected.builds
  );
  assert.ok(
    reviewPages.every((page) => page.choices.every((choice) => choice.image)),
    `${expected.id} review choices should include picture cues`
  );
  for (const choice of reviewPages.flatMap((page) => page.choices)) {
    assert.ok(existsSync(path.resolve(lessonDir, choice.image)), `${expected.id} review choice image ${choice.image} should exist`);
  }

  const html = await readFile(path.join(lessonDir, "worksheet.html"), "utf8");
  assert.match(html, /pilot-a4\.css/);
  assert.match(html, /story-grid/);
  if (expected.storyImages.length === 4) {
    assert.match(html, /story-grid-four/);
  }
  assert.match(html, /vowel-activity-grid/);
  assert.match(html, /sound-choice-grid/);
  assert.match(html, /sound-choice-image/);
}

