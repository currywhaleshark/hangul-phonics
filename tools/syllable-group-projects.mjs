// Grouped videos for lessons 15-17: one vowel tool meets several consonant friends in turn, so the
// child hears only the consonant sound change. Word cards for every syllable appear together at the end.
import {
  SYLLABLE_COMBINE_CHARACTERS,
  TIMING_SCHEMA_VERSION,
  VOWEL_COMBINE_BABY_IMAGE,
  VOWEL_COMBINE_BACKGROUND,
  roundTime,
} from "./timing-editor-core.js";

const toolAsset = (file) => `public/video-assets/vowel-alpha/tools/${file}`;
const combinedAsset = (file) => `public/video-assets/vowel-alpha/combined/${file}`;
const wordAsset = (file) => `worksheets/assets/${file}`;
const audioAsset = (file) => `public/audio-gemini-candidates/vowel-combination-tts/${file}`;

const BABY = { key: "aa", name: "아아 아기", subject: "아, 아, 아기가", image: VOWEL_COMBINE_BABY_IMAGE };
const FRIENDS = {
  gogo: { subject: "고고 고양이가", sound: "그" },
  nana: { subject: "나나 나비가", sound: "느" },
  bubu: { subject: "부부 부엉이가", sound: "브" },
  haha: { subject: "하하 하마가", sound: "흐" },
  pupu: { subject: "푸푸 풍선이", sound: "프" },
};

const SINGLE_TOOL_LAYOUT = { from: { left: 84, top: 58 }, to: { left: 60, top: 58 }, scale: 0.62 };

export const SYLLABLE_GROUP_DEFINITIONS = [
  {
    id: "yeo-group",
    index: 201,
    vowelLetter: "ㅕ",
    title: "여여 두 풍선과 자음 친구들 | 겨·녀·벼·혀",
    tools: [{ label: "여여 두 풍선", image: toolAsset("여여 두 풍선-alpha.png"), ...SINGLE_TOOL_LAYOUT }],
    vowelSound: "여",
    introLines: ["여여 두 풍선에 자음 친구들이 놀러 와요."],
    blocks: [
      { characterKey: "gogo", syllable: "겨", image: combinedAsset("고고 겨 풍선-alpha.png") },
      { characterKey: "nana", syllable: "녀", image: combinedAsset("나나 녀 풍선-alpha.png") },
      { characterKey: "bubu", syllable: "벼", image: combinedAsset("부부 벼 풍선-alpha.png") },
      { characterKey: "haha", syllable: "혀", image: combinedAsset("하하 혀 풍선-alpha.png") },
    ],
    words: [["겨울", "겨", "word-gyeo-winter.png"], ["소녀", "녀", "word-nyeo-girl.png"], ["벼", "벼", "word-byeo-rice.png"], ["혀", "혀", "word-hyeo-tongue.png"]],
  },
  {
    id: "yo-group",
    index: 202,
    vowelLetter: "ㅛ",
    title: "요요 그네와 자음 친구들 | 교·표",
    tools: [{ label: "요요 그네", image: toolAsset("요요 그네-alpha.png"), ...SINGLE_TOOL_LAYOUT }],
    vowelSound: "요",
    introLines: ["요요 그네에 자음 친구들이 놀러 와요."],
    blocks: [
      { characterKey: "gogo", syllable: "교", image: combinedAsset("고고 교 새시안3-alpha.png") },
      { characterKey: "pupu", syllable: "표", image: combinedAsset("푸푸 표 그네 새시안-alpha.png") },
    ],
    words: [["교실", "교", "word-gyo-classroom.png"], ["표범", "표", "word-pyo-leopard.png"]],
  },
  {
    id: "yu-group",
    index: 203,
    vowelLetter: "ㅠ",
    title: "유유 의자와 자음 친구들 | 규·퓨·휴",
    tools: [{ label: "유유 의자", image: toolAsset("유유 의자-alpha.png"), ...SINGLE_TOOL_LAYOUT }],
    vowelSound: "유",
    introLines: ["유유 의자에 자음 친구들이 놀러 와요."],
    blocks: [
      { characterKey: "gogo", syllable: "규", image: combinedAsset("고고 규 새시안-alpha.png") },
      { characterKey: "pupu", syllable: "퓨", image: combinedAsset("푸푸 퓨 의자 새시안-alpha.png") },
      { characterKey: "haha", syllable: "휴", image: combinedAsset("하하 휴 의자-alpha.png") },
    ],
    words: [["규칙", "규", "word-gyu-rule.png"], ["퓨마", "퓨", "word-pyu-puma.png"], ["휴지", "휴", "word-hyu-tissue.png"]],
  },
  {
    id: "wa-group",
    index: 204,
    vowelLetter: "ㅘ",
    title: "오오 상자와 아아 나뭇가지 | 와·과",
    // The branch stands on the box: together they make ㅘ.
    tools: [
      { label: "오오 상자", image: toolAsset("오오 상자-alpha.png"), from: { left: 84, top: 70 }, to: { left: 61, top: 70 }, scale: 0.5 },
      { label: "아아 나뭇가지", image: toolAsset("아아 나뭇가지-alpha.png"), from: { left: 61, top: -20 }, to: { left: 62, top: 44.5 }, scale: 0.5 },
    ],
    vowelSound: "와",
    introLines: ["오오 상자 위에 아아 나뭇가지가 섰어요.", "오, 아, 빨리 붙이면 와!"],
    mergedLetter: "ㅘ",
    blocks: [
      { characterKey: "baby", syllable: "와", image: combinedAsset("아아 아기 와 오오상자 나뭇가지-alpha.png") },
      { characterKey: "gogo", syllable: "과", image: combinedAsset("고고 과 오오상자 나뭇가지-alpha.png") },
    ],
    words: [["와플", "와", "word-wa-waffle.png"], ["치와와", "와", "word-wa-chihuahua.png"], ["과자", "과", "word-gwa-snack.png"], ["사과", "과", "word-gwa-apple.png"]],
  },
];

function blockCharacter(block) {
  if (block.characterKey === "baby") {
    return { ...BABY, sound: null };
  }
  return { ...SYLLABLE_COMBINE_CHARACTERS[block.characterKey], ...FRIENDS[block.characterKey] };
}

export function groupAudioFile(definition) {
  return `group_${definition.blocks.map((block) => block.syllable).join("")}_${definition.id}.mp3`;
}

// Narration lines in order: intro lines, one line per block, the word line, and the final recap.
export function groupNarrationLines(definition) {
  const blockLines = definition.blocks.map((block) => {
    const character = blockCharacter(block);
    return character.sound
      ? `${character.subject} 오면, ${character.sound}, ${definition.vowelSound}, ${block.syllable}!`
      : `${character.subject} 오면, ${block.syllable}!`;
  });
  const words = definition.words.map(([word]) => word);
  const syllables = definition.blocks.map((block) => block.syllable);
  return [...definition.introLines, ...blockLines, `${words.join(", ")}.`, `${syllables.join(", ")}!`];
}

export function getSyllableGroupDefinition(id) {
  return SYLLABLE_GROUP_DEFINITIONS.find((definition) => definition.id === id) ?? null;
}

function rowLeft(index, count, spacing) {
  return roundTime(50 + (index - (count - 1) / 2) * spacing);
}

// lines: [{ start, end, lastPhraseStart }] matching groupNarrationLines(definition).
export function buildSyllableGroupProject(definition, lines, duration) {
  const introCount = definition.introLines.length;
  const blockLines = lines.slice(introCount, introCount + definition.blocks.length);
  const wordLine = lines[introCount + definition.blocks.length];
  const end = roundTime(duration);
  const switchTimes = blockLines.map((line) => roundTime(Math.max(line.start + 0.6, line.lastPhraseStart - 0.15)));
  const combineCues = [];

  definition.tools.forEach((tool, toolIndex) => {
    combineCues.push({
      id: `${definition.id}-tool-${toolIndex + 1}-intro`,
      label: tool.label,
      assetKind: "tool",
      image: tool.image,
      start: 0.2,
      end: roundTime(blockLines[0].start),
      fromPosition: tool.from,
      toPosition: tool.to,
      position: tool.to,
      scale: tool.scale,
    });
  });

  definition.blocks.forEach((block, blockIndex) => {
    const line = blockLines[blockIndex];
    const character = blockCharacter(block);
    const blockEnd = roundTime(blockIndex + 1 < blockLines.length ? blockLines[blockIndex + 1].start : wordLine.start);
    definition.tools.forEach((tool, toolIndex) => {
      combineCues.push({
        id: `${definition.id}-${block.syllable}-tool-${toolIndex + 1}`,
        label: tool.label,
        assetKind: "tool",
        image: tool.image,
        start: roundTime(line.start),
        end: switchTimes[blockIndex],
        fromPosition: tool.to,
        toPosition: tool.to,
        position: tool.to,
        scale: tool.scale,
      });
    });
    combineCues.push(
      {
        id: `${definition.id}-${block.syllable}-character`,
        label: character.name,
        assetKind: "character",
        image: character.image,
        start: roundTime(line.start),
        end: switchTimes[blockIndex],
        fromPosition: { left: 14, top: 60 },
        toPosition: { left: 40, top: 60 },
        position: { left: 40, top: 60 },
        scale: 0.56,
      },
      {
        id: `${definition.id}-${block.syllable}-combined`,
        label: block.syllable,
        assetKind: "combined",
        image: block.image,
        start: switchTimes[blockIndex],
        end: blockEnd,
        fromPosition: { left: 50, top: 60 },
        toPosition: { left: 50, top: 60 },
        position: { left: 50, top: 60 },
        scale: 0.8,
      },
    );
  });

  const syllableCount = definition.blocks.length;
  const letterCues = definition.blocks.map((block, blockIndex) => ({
    id: `${definition.id}-${block.syllable}`,
    label: block.syllable,
    start: switchTimes[blockIndex],
    end,
    position: { left: rowLeft(blockIndex, syllableCount, 15), top: 15 },
  }));
  if (definition.mergedLetter) {
    const mergeLine = lines[introCount - 1];
    letterCues.unshift({
      id: `${definition.id}-merged`,
      label: definition.mergedLetter,
      start: roundTime(mergeLine.lastPhraseStart - 0.1),
      end: roundTime(blockLines[0].start),
      position: { left: 80, top: 22 },
    });
  }

  const accents = ["#ffb703", "#8ecae6", "#ff8fab", "#79ce91"];
  const cues = definition.words.map(([word, badge, image], wordIndex) => ({
    id: `${definition.id}-word-${wordIndex + 1}`,
    label: word,
    badge,
    image: wordAsset(image),
    start: roundTime(wordLine.start - 0.1 + wordIndex * 0.45),
    end,
    position: { left: rowLeft(wordIndex, definition.words.length, 20), top: 64 },
    accent: accents[wordIndex % accents.length],
  }));

  return {
    schemaVersion: TIMING_SCHEMA_VERSION,
    id: definition.id,
    lessonId: `vowel-group-${definition.id}`,
    title: definition.title,
    template: "syllable-group-story",
    character: { key: definition.id, name: definition.tools.map((tool) => tool.label).join(" + "), letter: definition.vowelLetter },
    audio: { src: audioAsset(groupAudioFile(definition)), duration: end },
    segment: { label: definition.vowelLetter, start: 0, end },
    syllables: definition.blocks.map((block) => block.syllable),
    sceneCues: [],
    combineCues,
    cues,
    letterCues,
    render: {
      background: VOWEL_COMBINE_BACKGROUND,
      outputSlug: definition.id,
      timingFile: `${definition.id}-card-timings.json`,
    },
  };
}
