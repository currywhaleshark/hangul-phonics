import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { renderWorksheetDocument } from "../worksheets/worksheet-renderer.js";

const root = path.resolve("lessons", "vowels");
const cssHref = "../../../worksheets/pilot-a4.css";

const lessons = [
  {
    folder: "lesson-01-aa-baby-vowel",
    title: "1레슨 아아 아기와 아: 조용한 아기가 소리를 찾았어",
    letters: "ㅇ/ㅏ/아",
    story: {
      title: "아아 아기가 소리를 찾았어",
      read: "아아 아기는 조용조용. 나뭇가지를 만나면 어떤 소리가 날까요?",
      panels: [
        { image: "./aa-story-01-silent.png", caption: "아아 아기는 조용조용." },
        { image: "./aa-story-02-branch.png", caption: "어? 나뭇가지다!" },
        { image: "./aa-story-03-ah.png", caption: "나뭇가지를 들고, 아!" },
      ],
      teacherNote: "그림을 왼쪽부터 차례대로 보며 아이가 마지막 소리 아를 기다리게 한다.",
      footerLeft: "그림 이야기",
      footerRight: "아아 아기와 아",
    },
    activity: {
      title: "입 크게 아",
      read: "아아 아기가 나뭇가지를 들고 아! 입을 크게 열고 같이 말해요.",
      heroImage: "../../../public/아아 아기 나뭇가지 시안.png",
      traceLetter: "아",
      buildPieces: ["ㅇ", "ㅏ", "아"],
      teacherNote: "큰 글자 아를 손가락으로 천천히 따라간 뒤, ㅇ 옆에 ㅏ를 붙여 아를 만든다.",
      footerLeft: "ㅇ + ㅏ = 아",
      footerRight: "아아 아기와 아",
    },
  },
  {
    folder: "lesson-02-oo-box-vowel",
    title: "2레슨 아아 아기와 오: 상자를 만나 오 소리",
    letters: "ㅇ/ㅗ/오",
    story: {
      title: "아아 아기가 상자를 만났어",
      read: "아아 아기는 조용조용. 오오 상자를 만나면 어떤 소리가 날까요?",
      panels: [
        { image: "../../../public/아아 아기.png", caption: "아아 아기는 조용조용." },
        { image: "../../../public/오오 상자.png", caption: "어? 오오 상자다!" },
        { image: "../../../public/오오 상자 시안.png", caption: "상자 위에 올라타고, 오!" },
      ],
      teacherNote: "상자 위에 올라타는 동작을 몸으로 해 보며 오 소리를 기다리게 한다.",
      footerLeft: "그림 이야기",
      footerRight: "아아 아기와 오",
    },
    activity: {
      title: "입 동그랗게 오",
      read: "아아 아기가 오오 상자에 올라타고 오! 입을 동그랗게 하고 같이 말해요.",
      heroImage: "../../../public/오오 상자 시안.png",
      traceLetter: "오",
      buildPieces: ["ㅇ", "ㅗ", "오"],
      teacherNote: "큰 글자 오를 손가락으로 천천히 따라간 뒤, ㅇ 아래에 ㅗ를 붙여 오를 만든다.",
      footerLeft: "ㅇ + ㅗ = 오",
      footerRight: "아아 아기와 오",
    },
  },
  {
    folder: "lesson-03-uu-platform-vowel",
    title: "3레슨 아아 아기와 우: 발판을 만나 우 소리",
    letters: "ㅇ/ㅜ/우",
    story: {
      title: "아아 아기가 발판을 만났어",
      read: "아아 아기는 조용조용. 우우 발판을 만나면 어떤 소리가 날까요?",
      panels: [
        { image: "../../../public/아아 아기.png", caption: "아아 아기는 조용조용." },
        { image: "../../../public/우우 발판.png", caption: "어? 우우 발판이다!" },
        { image: "../../../public/우우 발판 시안.png", caption: "발판을 아래에 놓고, 우!" },
      ],
      teacherNote: "발판이 아래로 받쳐 주는 모습을 보며 입을 오므려 우 소리를 낸다.",
      footerLeft: "그림 이야기",
      footerRight: "아아 아기와 우",
    },
    activity: {
      title: "입 오므려 우",
      read: "아아 아기가 우우 발판을 만나 우! 입을 오므리고 같이 말해요.",
      heroImage: "../../../public/우우 발판 시안.png",
      traceLetter: "우",
      buildPieces: ["ㅇ", "ㅜ", "우"],
      teacherNote: "큰 글자 우를 손가락으로 천천히 따라간 뒤, ㅇ 아래에 ㅜ를 붙여 우를 만든다.",
      footerLeft: "ㅇ + ㅜ = 우",
      footerRight: "아아 아기와 우",
    },
  },
];

function worksheetForLesson(lesson) {
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
      {
        type: "vowel-activity",
        theme: "gogo",
        kicker: "2장 / 소리 활동",
        title: lesson.activity.title,
        read: lesson.activity.read,
        heroImage: lesson.activity.heroImage,
        traceLetter: lesson.activity.traceLetter,
        activityTitle: "보고 따라 그리고 붙여서 만들어요",
        buildPieces: lesson.activity.buildPieces,
        teacherNote: lesson.activity.teacherNote,
        footerLeft: lesson.activity.footerLeft,
        footerRight: lesson.activity.footerRight,
      },
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

console.log(`Wrote ${lessons.length} vowel lesson folders to ${root}`);
