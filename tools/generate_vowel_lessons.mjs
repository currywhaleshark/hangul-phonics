import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { renderWorksheetDocument } from "../worksheets/worksheet-renderer.js";

const root = path.resolve("lessons", "vowels");
const cssHref = "../../../worksheets/pilot-a4.css";

const lesson = {
  folder: "lesson-01-aa-baby-vowel",
  title: "1레슨 아아 아기와 아: 조용한 아기가 소리를 찾았어",
  letters: "ㅇ/ㅏ/아",
  worksheet: {
    title: "1레슨 아아 아기와 아: 조용한 아기가 소리를 찾았어",
    pages: [
      {
        type: "story",
        theme: "gogo",
        kicker: "1장 / 그림 이야기",
        title: "아아 아기가 소리를 찾았어",
        read: "아아 아기는 조용조용. 나뭇가지를 만나면 어떤 소리가 날까요?",
        panels: [
          {
            image: "./aa-story-01-silent.png",
            caption: "아아 아기는 조용조용.",
          },
          {
            image: "./aa-story-02-branch.png",
            caption: "어? 나뭇가지다!",
          },
          {
            image: "./aa-story-03-ah.png",
            caption: "나뭇가지를 들고, 아!",
          },
        ],
        teacherNote: "그림을 왼쪽부터 차례대로 보며 아이가 마지막 소리 아를 기다리게 한다.",
        footerLeft: "그림 이야기",
        footerRight: "아아 아기와 아",
      },
      {
        type: "vowel-activity",
        theme: "gogo",
        kicker: "2장 / 소리 활동",
        title: "입 크게 아",
        read: "아아 아기가 나뭇가지를 들고 아! 입을 크게 열고 같이 말해요.",
        heroImage: "../../../public/아아 아기 나뭇가지 시안.png",
        traceLetter: "아",
        activityTitle: "보고 따라 그리고 붙여서 만들어요",
        buildPieces: ["ㅇ", "ㅏ", "아"],
        teacherNote: "큰 글자 아를 손가락으로 천천히 따라간 뒤, ㅇ 옆에 ㅏ를 붙여 아를 만든다.",
        footerLeft: "ㅇ + ㅏ = 아",
        footerRight: "아아 아기와 아",
      },
    ],
  },
};

async function writeLesson() {
  const lessonDir = path.join(root, lesson.folder);
  await mkdir(lessonDir, { recursive: true });
  await writeFile(path.join(lessonDir, "worksheet.json"), `${JSON.stringify(lesson.worksheet, null, 2)}\n`, "utf8");
  await writeFile(
    path.join(lessonDir, "worksheet.html"),
    renderWorksheetDocument(lesson.worksheet, { cssHref }),
    "utf8"
  );
}

async function writeManifest() {
  await mkdir(root, { recursive: true });
  await writeFile(
    path.join(root, "manifest.json"),
    `${JSON.stringify({
      title: "모음 친구 레슨",
      lessons: [
        {
          id: lesson.folder,
          title: lesson.title,
          letters: lesson.letters,
          worksheetPath: `../lessons/vowels/${lesson.folder}/worksheet.json`,
          htmlPath: `../lessons/vowels/${lesson.folder}/worksheet.html`,
        },
      ],
    }, null, 2)}\n`,
    "utf8"
  );
}

await writeLesson();
await writeManifest();

console.log(`Wrote vowel lesson to ${path.join(root, lesson.folder)}`);
