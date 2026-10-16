import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const expectedCards = new Map([
  ["lesson-08-ieung-vowel-expansion", [
    ["어항", "어"], ["상어", "어"], ["우유", "우"], ["우산", "우"], ["이불", "이"], ["이빨", "이"], ["으르렁", "으"], ["으쓱", "으"],
  ]],
  ["lesson-09a-gogo-vowel-expansion", [
    ["거북이", "거"], ["거위", "거"], ["구름", "구"], ["축구공", "구"], ["기린", "기"], ["기차", "기"], ["그림", "그"], ["그네", "그"],
  ]],
  ["lesson-09b-nana-vowel-expansion", [
    ["너구리", "너"], ["비누", "누"], ["누룽지", "누"], ["고니", "니"], ["할머니", "니"], ["지느러미", "느"], ["느리다", "느"],
  ]],
  ["lesson-10a-mimi-vowel-expansion", [
    ["머리", "머"], ["주머니", "머"], ["무지개", "무"], ["무당벌레", "무"], ["미끄럼틀", "미"], ["미역", "미"],
  ]],
  ["lesson-10b-rara-vowel-expansion", [
    ["루돌프", "루"], ["빗자루", "루"], ["리본", "리"], ["병아리", "리"], ["요구르트", "르"],
  ]],
  ["lesson-11a-dodo-vowel-expansion", [
    ["더위", "더"], ["더럽다", "더"], ["두더지", "두"], ["호두", "두"], ["카드", "드"], ["드레스", "드"],
  ]],
  ["lesson-11b-bubu-vowel-expansion", [
    ["버스", "버"], ["버섯", "버"], ["부엉이", "부"], ["부채", "부"], ["비닐봉지", "비"], ["비빔밥", "비"], ["브로콜리", "브"], ["브라키오사우루스", "브"],
  ]],
  ["lesson-12a-sasa-vowel-expansion", [
    ["서랍", "서"], ["도서관", "서"], ["수박", "수"], ["수영장", "수"], ["시계", "시"], ["시소", "시"], ["주스", "스"], ["스티커", "스"],
  ]],
  ["lesson-12b-haha-vowel-expansion", [
    ["허리", "허"], ["허수아비", "허"], ["후추", "후"], ["후라이팬", "후"],
  ]],
  ["lesson-13a-jiji-vowel-expansion", [
    ["저울", "저"], ["저금통", "저"], ["주황색", "주"], ["주머니", "주"], ["지렁이", "지"], ["지하철", "지"], ["치즈", "즈"], ["마요네즈", "즈"],
  ]],
  ["lesson-13b-chichi-vowel-expansion", [
    ["후추", "추"], ["배추", "추"], ["치즈", "치"], ["곰치", "치"],
  ]],
  ["lesson-14a-koko-vowel-expansion", [
    ["커피", "커"], ["커튼", "커"], ["쿠키", "쿠"], ["쿠션", "쿠"], ["키위", "키"], ["스키", "키"], ["크레파스", "크"], ["크림", "크"],
  ]],
  ["lesson-14b-toto-vowel-expansion", [
    ["놀이터", "터"], ["터널", "터"], ["투구게", "투"], ["티셔츠", "티"], ["티라노사우루스", "티"], ["요트", "트"], ["마트", "트"],
  ]],
  ["lesson-14c-pupu-vowel-expansion", [
    ["퍼즐", "퍼"], ["지퍼", "퍼"], ["푸들", "푸"], ["샴푸", "푸"], ["피아노", "피"], ["피자", "피"], ["프테라노돈", "프"], ["점프", "프"],
  ]],
]);

function cardWord(card) {
  if (card.word) return card.word;
  if (Array.isArray(card.parts)) return card.parts.map((part) => part.text || "").join("");
  return `${card.focus || ""}${card.rest || ""}`;
}

function cardFocus(card) {
  if (Array.isArray(card.parts)) {
    return card.parts.filter((part) => part.focus).map((part) => part.text || "").join("");
  }
  return card.focus || "";
}

let totalCards = 0;
for (const [folder, expected] of expectedCards) {
  const lessonDir = path.resolve("lessons", "vowels", folder);
  const worksheet = JSON.parse(readFileSync(path.join(lessonDir, "worksheet.json"), "utf8"));
  const pages = worksheet.pages.filter((page) => page.type === "word-card");
  const cards = pages.flatMap((page) => page.cards || []);

  assert.ok(pages.length > 0, `${folder} should include word-card pages`);
  assert.ok(pages.every((page) => page.cards.length <= 12), `${folder} should keep each word-card page at 12 cards or fewer`);
  assert.deepEqual(
    cards.map((card) => [cardWord(card), cardFocus(card)]),
    expected,
    `${folder} should preserve the planned words and highlighted syllables`
  );

  for (const card of cards) {
    assert.ok(card.image, `${folder} ${cardWord(card)} should have an image`);
    assert.ok(
      existsSync(path.resolve(lessonDir, card.image)),
      `${folder} ${cardWord(card)} image should exist: ${card.image}`
    );
  }
  totalCards += cards.length;
}

assert.equal(totalCards, 95, "lessons 8-14 should include all 95 planned word cards");

console.log("Vowel expansion word-card tests passed.");
