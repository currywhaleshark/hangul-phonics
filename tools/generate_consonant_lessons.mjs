import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { renderWorksheetDocument } from "../worksheets/worksheet-renderer.js";

const root = path.resolve("lessons", "consonants");
const cssHref = "../../../worksheets/pilot-a4.css";

const asset = (file) => `../../../worksheets/assets/${file}`;
const characterImage = (file) => `../../../public/${file}`;

const fillPalette = ["FFE96B", "D9F7FF", "FCE0FF", "E9FFD8", "FFE6D8", "EDE4FF"];
const letterNames = {
  "ㄱ": "기역",
  "ㄴ": "니은",
  "ㄷ": "디귿",
  "ㄹ": "리을",
  "ㅁ": "미음",
  "ㅂ": "비읍",
  "ㅅ": "시옷",
  "ㅇ": "이응",
  "ㅈ": "지읒",
  "ㅊ": "치읓",
  "ㅋ": "키읔",
  "ㅌ": "티읕",
  "ㅍ": "피읖",
  "ㅎ": "히읗",
};
const ttsSounds = {
  "ㄱ": "[g] [g] [g]",
  "ㄴ": "[n] [n] [n]",
  "ㄷ": "[d] [d] [d]",
  "ㄹ": "[r] [r] [r]",
  "ㅁ": "[m] [m] [m]",
  "ㅂ": "[b] [b] [b]",
  "ㅅ": "[s] [s] [s]",
  "ㅇ": "조용 조용",
  "ㅈ": "[j] [j] [j]",
  "ㅊ": "[ch] [ch] [ch]",
  "ㅋ": "[k] [k] [k]",
  "ㅌ": "[t] [t] [t]",
  "ㅍ": "[p] [p] [p]",
  "ㅎ": "[h] [h] [h]",
};

const lessons = [
  {
    folder: "lesson-01-gogo-nana",
    title: "1레슨 고고와 나나: ㄱ ㄴ 첫소리 친구",
    pair: [
      {
        key: "gogo",
        theme: "gogo",
        letter: "ㄱ",
        name: "고고 고양이",
        title: "고고 고양이야",
        image: characterImage("고고 고양이.png"),
        panelTitle: "고고의 길",
        sound: "그 그 그",
        introLine: "나는 고고 고양이야. 내 몸에는 ㄱ 길이 있어.",
        likesLine: "강아지와 곰은 내 친구야. 나는 고기, 과자, 국수를 좋아해.",
        note: "고고의 ㄱ 길은 꺾여 가는 길이다. 손가락으로 크게 따라가며 소리를 붙인다.",
        cards: [
          { label: "강아지", image: asset("dog.png") },
          { label: "곰", image: asset("bear.png") },
          { label: "고기", image: asset("meat.png") },
          { label: "나무", image: asset("nieun-tree.png") },
          { label: "과자", image: asset("snack.png") },
          { label: "국수", image: asset("noodles.png") },
        ],
        correct: ["강아지", "곰", "고기", "과자", "국수"],
      },
      {
        key: "nana",
        theme: "nana",
        letter: "ㄴ",
        name: "나나 나비",
        title: "나나 나비야",
        image: characterImage("나나 나비.png"),
        panelTitle: "나나가 앉은 길",
        sound: "느 느 느",
        introLine: "나는 나나 나비야. 나는 ㄴ 길이 있는 나무에 앉아.",
        likesLine: "나는 노란색을 좋아해. 너구리와 나무를 만나고 낮잠도 좋아해.",
        note: "나나의 ㄴ 길은 내려와서 옆으로 가는 길이다. 천천히 꺾는 움직임을 살린다.",
        cards: [
          { label: "노란색", fill: "FFE96B" },
          { label: "너구리", image: asset("raccoon-dog.png") },
          { label: "나무", image: asset("nieun-tree.png") },
          { label: "곰", image: asset("bear.png") },
          { label: "나비", image: asset("butterfly.png") },
          { label: "낮잠", image: asset("nap.png") },
        ],
        correct: ["노란색", "너구리", "나무", "나비", "낮잠"],
      },
    ],
  },
  {
    folder: "lesson-03-dodo-rara",
    title: "3레슨 도도와 라라: ㄷ ㄹ 첫소리 친구",
    pair: [
      {
        key: "dodo",
        theme: "gogo",
        letter: "ㄷ",
        name: "도도 도토리",
        title: "도도 도토리야",
        image: characterImage("도도 도토리.png"),
        panelTitle: "도도의 단단한 길",
        sound: "드 드 드",
        introLine: "나는 도도 도토리야. 내 몸에는 ㄷ 길이 있어.",
        likesLine: "다람쥐는 내 친구야. 나는 달, 다리, 도넛, 도토리를 좋아해.",
        note: "ㄷ은 위, 옆, 아래가 만나는 단단한 길처럼 소개한다.",
        cards: [
          { label: "다람쥐", image: asset("squirrel.png") },
          { label: "달", image: asset("moon.png") },
          { label: "다리", image: asset("bridge.png") },
          { label: "도넛", image: asset("donut.png") },
          { label: "도토리", image: asset("acorn.png") },
          { label: "라면", image: asset("ramen.png") },
        ],
        correct: ["다람쥐", "달", "다리", "도넛", "도토리"],
      },
      {
        key: "rara",
        theme: "nana",
        letter: "ㄹ",
        name: "라라 리본",
        title: "라라 리본이야",
        image: characterImage("라라 리본.png"),
        panelTitle: "라라의 리본 길",
        sound: "르 르 르",
        introLine: "나는 라라 리본이야. 내 몸에는 ㄹ 길이 꼬불꼬불 있어.",
        likesLine: "나는 라면, 로봇, 리본, 라디오, 레몬 소리를 좋아해.",
        note: "ㄹ은 꺾임이 여러 번 이어지는 리본 길처럼 다룬다.",
        cards: [
          { label: "라면", image: asset("ramen.png") },
          { label: "로봇", image: asset("robot.png") },
          { label: "리본", image: asset("ribbon.png") },
          { label: "라디오", image: asset("radio.png") },
          { label: "레몬", image: asset("lemon.png") },
          { label: "도토리", image: asset("acorn.png") },
        ],
        correct: ["라면", "로봇", "리본", "라디오", "레몬"],
      },
    ],
  },
  {
    folder: "lesson-02-mimi-bubu",
    title: "2레슨 미미와 부부: ㅁ ㅂ 입술로 느끼는 자음",
    pair: [
      {
        key: "mimi",
        theme: "gogo",
        letter: "ㅁ",
        name: "미미 문어",
        title: "미미 문어야",
        image: characterImage("미미 문어.png"),
        panelTitle: "미미의 네모 길",
        sound: "므 므 므",
        introLine: "나는 미미 문어야. ㅁ 네모 길이 있는 어항에 살고 있어.",
        introTtsLine: "미음 네모 길이 있는 어항에 살고 있어.",
        likesLine: "나는 모자, 문, 물, 무지개, 미끄럼틀을 좋아해.",
        note: "ㅁ은 닫힌 네모 방처럼 보여 주고 손가락으로 한 바퀴 돈다.",
        cards: [
          { label: "모자", image: asset("hat.png") },
          { label: "문", image: asset("door.png") },
          { label: "물", image: asset("water.png") },
          { label: "무지개", image: asset("rainbow.png") },
          { label: "미끄럼틀", image: asset("slide.png") },
          { label: "바나나", image: asset("banana.png") },
        ],
        correct: ["모자", "문", "물", "무지개", "미끄럼틀"],
      },
      {
        key: "bubu",
        theme: "nana",
        letter: "ㅂ",
        name: "부부 부엉이",
        title: "부부 부엉이야",
        image: characterImage("부부 부엉이.png"),
        panelTitle: "부부의 두 방 길",
        sound: "브 브 브",
        introLine: "나는 부부 부엉이야. 내 몸에는 ㅂ 두 방 길이 있어.",
        likesLine: "나는 바나나, 버스, 별, 비, 바구니를 좋아해.",
        note: "ㅂ은 ㅁ 위에 작은 길이 더 있는 모양으로 비교하지 말고, 두 방 친구로 소개한다.",
        cards: [
          { label: "바나나", image: asset("banana.png") },
          { label: "버스", image: asset("bus.png") },
          { label: "별", image: asset("star.png") },
          { label: "비", image: asset("rain.png") },
          { label: "바구니", image: asset("basket.png") },
          { label: "모자", image: asset("hat.png") },
        ],
        correct: ["바나나", "버스", "별", "비", "바구니"],
      },
    ],
  },
  {
    folder: "lesson-04-sasa-haha",
    title: "4레슨 사사와 하하: ㅅ ㅎ 숨과 바람 자음",
    pair: [
      {
        key: "sasa",
        theme: "gogo",
        letter: "ㅅ",
        name: "사사 사슴",
        title: "사사 사슴이야",
        image: characterImage("사사 사슴.png"),
        panelTitle: "사사의 산 길",
        sound: "스 스 스",
        introLine: "나는 사사 사슴이야. 내 뿔에는 ㅅ 산 길이 있어.",
        introTtsLine: "내 뿔에는 시옷 산 길이 있어.",
        likesLine: "나는 사과, 수박, 산, 손, 사탕을 좋아해.",
        note: "ㅅ은 산처럼 올라갔다 내려오는 길로 몸동작과 연결한다.",
        cards: [
          { label: "사과", image: asset("apple.png") },
          { label: "수박", image: asset("watermelon.png") },
          { label: "산", image: asset("mountain.png") },
          { label: "손", image: asset("hand.png") },
          { label: "사탕", image: asset("candy.png") },
          { label: "아기", image: asset("baby.png") },
        ],
        correct: ["사과", "수박", "산", "손", "사탕"],
      },
      {
        key: "haha",
        theme: "nana",
        letter: "ㅎ",
        name: "하하 하마",
        title: "하하 하마야",
        image: characterImage("하하 하마.png"),
        panelTitle: "하하의 숨 길",
        sound: "흐 흐 흐",
        introLine: "나는 하하 하마야. 내 몸에는 ㅎ 숨 길이 있어.",
        likesLine: "나는 해, 하트, 호랑이, 하모니카, 햄버거를 좋아해.",
        note: "ㅎ은 따뜻한 숨이 나오는 친구처럼 손을 입 앞에 대고 느낀다.",
        cards: [
          { label: "해", image: asset("sun.png") },
          { label: "하트", image: asset("heart.png") },
          { label: "호랑이", image: asset("tiger.png") },
          { label: "하모니카", image: asset("harmonica.png") },
          { label: "햄버거", image: asset("hamburger.png") },
          { label: "사과", image: asset("apple.png") },
        ],
        correct: ["해", "하트", "호랑이", "하모니카", "햄버거"],
      },
    ],
  },
  {
    folder: "lesson-05-jiji-chichi",
    title: "5레슨 지지와 치치: ㅈ ㅊ 첫소리 친구",
    pair: [
      {
        key: "jiji",
        theme: "gogo",
        letter: "ㅈ",
        name: "지지 지렁이",
        title: "지지 지렁이야",
        image: characterImage("지지 지렁이.png"),
        panelTitle: "지지의 작은 지붕 길",
        sound: "즈 즈 즈",
        introLine: "나는 지지 지렁이야. ㅈ 길이 있는 나무를 좋아해.",
        introTtsLine: "지읒 길이 있는 나무를 좋아해.",
        likesLine: "나는 자동차, 집, 주스, 지갑, 젤리를 좋아해.",
        note: "ㅈ은 ㅅ 위에 작은 길이 더 있는 친구처럼 보이되, 이름보다 소리 반복을 앞세운다.",
        cards: [
          { label: "자동차", image: asset("car.png") },
          { label: "집", image: asset("house.png") },
          { label: "주스", image: asset("juice.png") },
          { label: "지갑", image: asset("wallet.png") },
          { label: "젤리", image: asset("jelly.png") },
          { label: "치즈", image: asset("cheese.png") },
        ],
        correct: ["자동차", "집", "주스", "지갑", "젤리"],
      },
      {
        key: "chichi",
        theme: "nana",
        letter: "ㅊ",
        name: "치치 칙폭이",
        title: "치치 칙폭이야",
        image: characterImage("치치 칙폭이.png"),
        panelTitle: "치치의 칙칙 길",
        sound: "츠 츠 츠",
        introLine: "나는 치치 칙폭이야. 내 몸에는 ㅊ 길이 있어.",
        likesLine: "나는 치즈, 책, 초콜릿, 치마, 친구를 좋아해.",
        note: "ㅊ은 기차 소리처럼 신나게 반복하되, 과하게 빠르지 않게 한다.",
        cards: [
          { label: "치즈", image: asset("cheese.png") },
          { label: "책", image: asset("book.png") },
          { label: "초콜릿", image: asset("chocolate.png") },
          { label: "치마", image: asset("skirt.png") },
          { label: "친구", image: asset("friend.png") },
          { label: "주스", image: asset("juice.png") },
        ],
        correct: ["치즈", "책", "초콜릿", "치마", "친구"],
      },
    ],
  },
  {
    folder: "lesson-06-koko-toto-pupu",
    title: "6레슨 코코와 토토와 푸푸: ㅋ ㅌ ㅍ 센 숨 친구 3총사",
    pair: [
      {
        key: "koko",
        theme: "gogo",
        letter: "ㅋ",
        name: "코코 코알라",
        title: "코코 코알라야",
        image: characterImage("코코 코알라.png"),
        panelTitle: "코코의 큰 숨 길",
        sound: "크 크 크",
        introLine: "나는 코코 코알라야. 내 몸에는 ㅋ 길이 있어.",
        likesLine: "나는 쿠키, 콩, 카드, 크레용, 코끼리를 좋아해.",
        note: "ㅋ은 ㄱ보다 숨이 더 크게 나가는 친구처럼 놀이로만 느끼게 한다.",
        cards: [
          { label: "쿠키", image: asset("cookie.png") },
          { label: "콩", image: asset("bean.png") },
          { label: "카드", image: asset("card.png") },
          { label: "크레용", image: asset("crayon.png") },
          { label: "코끼리", image: asset("elephant.png") },
          { label: "토끼", image: asset("rabbit.png") },
        ],
        correct: ["쿠키", "콩", "카드", "크레용", "코끼리"],
      },
      {
        key: "toto",
        theme: "nana",
        letter: "ㅌ",
        name: "토토 토끼",
        title: "토토 토끼야",
        image: characterImage("토토 토끼.png"),
        panelTitle: "토토의 톡톡 길",
        sound: "트 트 트",
        introLine: "나는 토토 토끼야. 내 몸에는 ㅌ 길이 있어.",
        likesLine: "나는 토마토, 택시, 타조, 튤립, 토끼풀을 좋아해.",
        note: "ㅌ은 ㄷ보다 톡 튀는 숨이 있는 친구처럼 손뼉 동작을 붙인다.",
        cards: [
          { label: "토마토", image: asset("tomato.png") },
          { label: "택시", image: asset("taxi.png") },
          { label: "타조", image: asset("ostrich.png") },
          { label: "튤립", image: asset("tulip.png") },
          { label: "토끼풀", image: asset("clover.png") },
          { label: "쿠키", image: asset("cookie.png") },
        ],
        correct: ["토마토", "택시", "타조", "튤립", "토끼풀"],
      },
      {
        key: "pupu",
        theme: "mix",
        letter: "ㅍ",
        name: "푸푸 풍선",
        title: "푸푸 풍선이야",
        image: characterImage("푸푸 풍선.png"),
        panelTitle: "푸푸의 퐁퐁 길",
        sound: "프 프 프",
        introLine: "나는 푸푸 풍선이야. 내 몸에는 ㅍ 길이 있어.",
        likesLine: "나는 포도, 피자, 풀, 풍선, 파도를 좋아해.",
        note: "ㅍ은 바람이 퐁 나오는 친구처럼 입바람 놀이와 연결한다.",
        cards: [
          { label: "포도", image: asset("grapes.png") },
          { label: "피자", image: asset("pizza.png") },
          { label: "풀", image: asset("grass.png") },
          { label: "풍선", image: asset("balloon.png") },
          { label: "파도", image: asset("wave.png") },
          { label: "쿠키", image: asset("cookie.png") },
        ],
        correct: ["포도", "피자", "풀", "풍선", "파도"],
      },
    ],
  },
  {
    disabled: true,
    folder: "lesson-07-pupu-haha",
    title: "7레슨 푸푸와 하하: ㅍ ㅎ 첫소리 친구",
    pair: [
      {
        key: "pupu",
        theme: "gogo",
        letter: "ㅍ",
        name: "푸푸 풍선",
        title: "푸푸 풍선이야",
        image: characterImage("푸푸 풍선.png"),
        panelTitle: "푸푸의 퐁퐁 길",
        sound: "프 프 프",
        introLine: "나는 푸푸 풍선이야. 내 몸에는 ㅍ 길이 있어.",
        likesLine: "나는 포도, 피자, 풀, 풍선, 파도를 좋아해.",
        note: "ㅍ은 바람이 퐁 나오는 친구처럼 입바람 놀이와 연결한다.",
        cards: labels(["포도", "피자", "풀", "풍선", "파도", "하마"]),
        correct: ["포도", "피자", "풀", "풍선", "파도"],
      },
      {
        key: "haha",
        theme: "nana",
        letter: "ㅎ",
        name: "하하 하마",
        title: "하하 하마야",
        image: characterImage("하하 하마.png"),
        panelTitle: "하하의 숨 길",
        sound: "흐 흐 흐",
        introLine: "나는 하하 하마야. 내 몸에는 ㅎ 숨 길이 있어.",
        likesLine: "나는 해, 하트, 호랑이, 하모니카, 햄버거를 좋아해.",
        note: "ㅎ은 따뜻한 숨이 나오는 친구처럼 손을 입 앞에 대고 느낀다.",
        cards: labels(["해", "하트", "호랑이", "하모니카", "햄버거", "포도"]),
        correct: ["해", "하트", "호랑이", "하모니카", "햄버거"],
      },
    ],
  },
];

function labels(words) {
  return words.map((label, index) => ({ label, fill: fillPalette[index % fillPalette.length] }));
}

function firstName(character) {
  return character.name.split(" ")[0];
}

function letterName(character) {
  return letterNames[character.letter] || character.letter;
}

function ttsSound(character) {
  return ttsSounds[character.letter] || character.sound;
}

function introTtsLine(character) {
  return character.introTtsLine || `내 몸에는 ${letterName(character)} 길이 있어.`;
}

function audioTitle(lesson) {
  return lesson.title.replace(/[ㄱ-ㅎ]/g, (letter) => letterNames[letter] || letter);
}

function pageForCharacter(character, lessonTitle, pageNumber) {
  return {
    type: "character",
    theme: character.theme,
    kicker: `${pageNumber}장 / 캐릭터와 자음 길`,
    title: character.title,
    image: character.image,
    panelTitle: character.panelTitle,
    letter: character.letter,
    sound: character.sound,
    read: character.introLine,
    activityTitle: `손가락으로 ${character.letter} 길을 따라가요`,
    trace: [character.letter, character.letter, character.letter],
    teacherNote: `읽어주기: "${character.name}, ${character.sound}". ${character.note}`,
    footerLeft: character.name,
    footerRight: lessonTitle,
  };
}

function pageForSpot(character, lessonTitle, pageNumber) {
  return {
    type: "spot",
    theme: character.theme,
    kicker: `${pageNumber}장 / 첫소리 연결`,
    title: `${character.name}의 친구와 좋아하는 것`,
    read: character.likesLine,
    activityTitle: `${character.name.split(" ")[0]}의 소리로 시작하는 그림에 동그라미`,
    cards: character.cards,
    soundBox: `${character.name.split(" ")[0]}의 소리: ${character.sound}`,
    teacherNote: `활동: ${character.correct.join(", ")} 그림을 찾아 표시한다. 정답을 재촉하지 말고 "${character.name.split(" ")[0]}와 같은 소리일까?"라고 묻는다.`,
    footerLeft: "첫소리 연결",
    footerRight: lessonTitle,
  };
}

function pageForSorting(lesson) {
  const characters = charactersForLesson(lesson);
  const tilesPerCharacter = characters.length > 2 ? 3 : 4;
  const tileColumns = characters.length > 2 ? 3 : 4;
  const tileGroups = characters.map((character) =>
    character.cards.slice(0, tilesPerCharacter).map((card) => ({ ...card, answer: character.letter }))
  );

  return {
    type: "sorting",
    theme: "mix",
    kicker: "5장 / 분류 활동",
    title: "친구를 집에 보낼까?",
    read: `${characters.map((character) => `${character.name}의 친구는 ${character.letter} 집`).join("으로, ")}으로 보내요.`,
    houses: characters.map((character) => ({ title: `${character.letter} 집`, theme: character.theme })),
    activityTitle: "오려서 붙이거나 선으로 이어요",
    tileColumns,
    tiles: interleaveMany(tileGroups),
    teacherNote: "검사 포인트: 아이가 캐릭터 이름을 외운 결과와 첫소리 분류를 하는 것을 구분해서 관찰한다.",
    footerLeft: `${characters.map((character) => character.letter).join("/")} 분류`,
    footerRight: lesson.title,
  };
}

function interleave(left, right) {
  const result = [];
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    if (left[i]) result.push(left[i]);
    if (right[i]) result.push(right[i]);
  }
  return result;
}

function interleaveMany(lists) {
  const result = [];
  const maxLength = Math.max(...lists.map((items) => items.length));
  for (let i = 0; i < maxLength; i += 1) {
    for (const list of lists) {
      if (list[i]) result.push(list[i]);
    }
  }
  return result;
}

function charactersForLesson(lesson) {
  return lesson.pair;
}

function orderedLessons() {
  return lessons
    .filter((lesson) => !lesson.disabled)
    .slice()
    .sort((left, right) => {
      const leftNumber = Number(left.folder.match(/^lesson-(\d+)/)?.[1] || 0);
      const rightNumber = Number(right.folder.match(/^lesson-(\d+)/)?.[1] || 0);
      return leftNumber - rightNumber;
    });
}

function joinKoreanList(items) {
  if (items.length <= 2) return items.join("와 ");
  return `${items.slice(0, -1).join(", ")}와 ${items.at(-1)}`;
}

function worksheetForLesson(lesson) {
  const characters = charactersForLesson(lesson);
  const characterPages = characters.flatMap((character, index) => [
    pageForCharacter(character, lesson.title, index * 2 + 1),
    pageForSpot(character, lesson.title, index * 2 + 2),
  ]);

  return {
    title: lesson.title,
    pages: [...characterPages, pageForSorting(lesson)],
  };
}

function introScript(lesson) {
  const characters = charactersForLesson(lesson);
  const characterSections = characters
    .map(
      (character) => `## ${character.name}

안녕, 나는 ${character.name}야.  
${introTtsLine(character)}  
내 소리는 ${ttsSound(character)}.  

${character.likesLine}  
우리 같이 말해 볼까?  
${ttsSound(character)}.  
${ttsSound(character)}.  
${firstName(character)}의 소리!`
    )
    .join("\n\n");
  const summary = characters
    .map((character) => `${firstName(character)}는 ${letterName(character)} 길`)
    .join(", ");

  return `# ${audioTitle(lesson)} 캐릭터 자기소개 TTS 대본

## TTS 방향

- 목소리: 밝고 다정한 유아 교사 톤
- 속도: 천천히, 한 문장 뒤 1초 쉬기
- 글자: 낱자 기호 대신 기역, 니은처럼 자음 이름으로 읽기
- 반복 소리: 한국어 음절 반복 대신 [g] [g] [g]처럼 발음기호로 읽기
- 호흡: 아이가 따라 말할 수 있도록 질문 뒤 짧게 멈추기

${characterSections}

## 마무리

오늘 만난 친구는 ${joinKoreanList(characters.map((character) => character.name))}.  
${summary}.  
손가락으로 길을 따라가며 한 번 더 말해 보자.
`;
}

function chantScript(lesson) {
  const characters = charactersForLesson(lesson);
  const chantBlocks = characters
    .map(
      (character) => `선생님: ${character.name}, ${ttsSound(character)}  
아이: ${ttsSound(character)}  
선생님: ${character.correct.slice(0, 3).join(", ")}  
아이: ${ttsSound(character)}  

다 같이:  
${firstName(character)} ${ttsSound(character)}  
${firstName(character)} ${ttsSound(character)}  
${letterName(character)} 길을 따라가요  
${ttsSound(character)}, 좋아요!`
    )
    .join("\n\n");
  const houses = characters.map((character) => `${letterName(character)} 집`).join(", ");

  return `# ${audioTitle(lesson)} 챈트 대본

## 챈트 진행

- 리듬: 박수 두 번, 무릎 두 번
- 방식: 선생님이 먼저 말하고 아이가 마지막 소리를 따라 말함
- 글자: 낱자 기호 대신 기역, 니은처럼 자음 이름으로 읽기
- 반복 소리: TTS에서는 [g] [g] [g]처럼 발음기호로 읽기
- 길이: 45초 안팎으로 짧게 반복

## 챈트

${chantBlocks}

마무리:  
${houses}  
친구들이 찾아가요  
같은 소리 들리면  
쏙쏙 붙여요!
`;
}

function songMarkdown(lesson) {
  const characters = charactersForLesson(lesson);
  const verses = characters
    .map(
      (character, index) => `[Verse ${index + 1}]  
안녕 안녕 ${character.name}  
${letterName(character)} 길을 따라가요  
${character.sound}, ${character.sound}  
${firstName(character)} 소리 들려요

[Pre-Chorus ${index + 1}]  
${character.correct.slice(0, 3).join(", ")}  
같은 소리 찾아요  
손가락으로 길을 따라  
천천히 말해요`
    )
    .join("\n\n");
  const chorus = characters.map((character) => `${firstName(character)} ${character.sound}`).join("  \n");
  const outro = characters.map((character) => `${letterName(character)} 집으로 쏙`).join("  \n");

  return `# ${audioTitle(lesson)} 노래

## Suno 스타일 지시문

Korean toddler phonics song, cheerful preschool classroom energy, 95 BPM, ukulele, xylophone, soft hand claps, simple call-and-response melody, clear Korean diction, warm female vocal, playful but not noisy, short repeated hook, no rap, no complex harmony, no English lyrics.
Sing consonant names in Korean, such as 기역 and 니은, instead of isolated Hangul jamo. Keep the phonic hook as Korean syllables, such as 그, 느, 드, 르; do not sing bracketed phonetic symbols.

## 가사

${verses}

[Chorus]  
${chorus}  
친구들이 웃어요  
소리 길을 걸어요

[Outro]  
${outro}  
오늘 만난 자음 친구  
다시 한번 안녕
`;
}

async function writeLesson(lesson) {
  const lessonDir = path.join(root, lesson.folder);
  const worksheet = worksheetForLesson(lesson);
  const html = renderWorksheetDocument(worksheet, { cssHref });

  await mkdir(lessonDir, { recursive: true });
  await writeFile(path.join(lessonDir, "worksheet.json"), `${JSON.stringify(worksheet, null, 2)}\n`, "utf8");
  await writeFile(path.join(lessonDir, "worksheet.html"), html, "utf8");
  await writeFile(path.join(lessonDir, "character-intro-tts.md"), introScript(lesson), "utf8");
  await writeFile(path.join(lessonDir, "chant-script.md"), chantScript(lesson), "utf8");
  await writeFile(path.join(lessonDir, "song.md"), songMarkdown(lesson), "utf8");
}

async function writeManifest() {
  const activeLessons = orderedLessons();
  const manifest = {
    title: "자음 친구 레슨",
    lessons: activeLessons.map((lesson) => ({
      id: lesson.folder,
      title: lesson.title,
      letters: charactersForLesson(lesson).map((character) => character.letter).join("/"),
      worksheetPath: `../lessons/consonants/${lesson.folder}/worksheet.json`,
      htmlPath: `../lessons/consonants/${lesson.folder}/worksheet.html`,
    })),
  };

  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

for (const lesson of orderedLessons()) {
  await writeLesson(lesson);
}

await writeManifest();

console.log(`Wrote ${orderedLessons().length} consonant lesson folders to ${root}`);
