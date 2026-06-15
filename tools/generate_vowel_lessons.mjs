import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { renderWorksheetDocument } from "../worksheets/worksheet-renderer.js";

const root = path.resolve("lessons", "vowels");
const cssHref = "../../../worksheets/pilot-a4.css";

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
  };
}

function reviewPage({ sounds, builds, images = [], footerRight }) {
  return {
    type: "sound-choice",
    theme: "gogo",
    kicker: "마지막 / 소리 정리",
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

function combinationLesson({ folder, title, letters, storyTitle, storyRead, storyTeacherNote, footerRight, characters }) {
  const panels = characters.flatMap((character) =>
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
          },
        ],
      },
    ],
  }),
];

function worksheetForLesson(lesson) {
  const reviewImages = lesson.activities.map((item) => item.heroImage);

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
      ...lesson.activities.map((item, index) => ({
        type: "vowel-activity",
        theme: "gogo",
        kicker: `${index + 2}장 / 소리 활동`,
        title: item.title,
        read: item.read,
        heroImage: item.heroImage,
        traceLetter: item.traceLetter,
        activityTitle: item.activityTitle || "보고 따라 그리고 붙여서 만들어요",
        buildPieces: item.buildPieces,
        soundSteps: item.soundSteps,
        teacherNote: item.teacherNote,
        footerLeft: item.footerLeft,
        footerRight: item.footerRight,
      })),
      reviewPage({ ...lesson.review, images: reviewImages }),
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
