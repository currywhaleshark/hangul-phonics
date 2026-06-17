import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sortingGame = await readFile(new URL("../sorting-game.js", import.meta.url), "utf8");
const vowelGame = await readFile(new URL("../vowel-game.js", import.meta.url), "utf8");

assert.match(
  sortingGame,
  /function getSortingGameLessons/,
  "sorting game should adapt the worksheet manifest into a game-specific lesson list"
);
assert.match(
  sortingGame,
  /lesson-06a-koko-toto-pupu-meet/,
  "sorting game should explicitly hide lesson 6-A because it has no sorting page"
);
assert.match(
  sortingGame,
  /lesson-06b-koko-toto-pupu-sounds/,
  "sorting game should keep lesson 6-B as the playable lesson 6"
);
assert.match(
  sortingGame,
  /gameShortTitle:\s*'6레슨'/,
  "sorting game should label lesson 6-B as 6레슨"
);
assert.match(
  sortingGame,
  /state\.lessons\s*=\s*getSortingGameLessons\(data\.lessons\)/,
  "sorting game should use the filtered lesson list"
);

assert.doesNotMatch(vowelGame, /lesson-07a/, "vowel game should not expose lesson 7-A as a separate choice");
assert.doesNotMatch(vowelGame, /lesson-07b/, "vowel game should not expose lesson 7-B as a separate choice");
assert.doesNotMatch(vowelGame, /short:\s*'7-A'/, "vowel game should not render a 7-A button");
assert.doesNotMatch(vowelGame, /short:\s*'7-B'/, "vowel game should not render a 7-B button");
assert.match(vowelGame, /id:\s*'lesson-07'/, "vowel game should expose one combined lesson 7");
assert.match(vowelGame, /short:\s*'7'/, "combined vowel lesson should render as button 7");
assert.match(
  vowelGame,
  /syllables:\s*\['카',\s*'코',\s*'타',\s*'토',\s*'파',\s*'포'\]/,
  "combined vowel lesson 7 should include ㅋ, ㅌ, and ㅍ syllables"
);

