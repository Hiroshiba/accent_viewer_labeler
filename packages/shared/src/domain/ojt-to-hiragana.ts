import { ParseError } from "../errors";

/** OJT 音素の種別 */
type PhonemeKind = "vowel" | "consonant" | "special";

const VOWELS = new Set(["a", "i", "u", "e", "o"]);
const VOICELESS_VOWELS = new Set(["A", "I", "U", "E", "O"]);
const CONSONANTS = new Set([
  "k",
  "s",
  "t",
  "n",
  "h",
  "m",
  "y",
  "r",
  "w",
  "g",
  "z",
  "d",
  "b",
  "p",
  "ky",
  "sh",
  "ch",
  "ny",
  "hy",
  "my",
  "ry",
  "gy",
  "j",
  "dy",
  "by",
  "py",
  "ts",
  "f",
]);
const SPECIALS = new Set(["N", "cl", "pau"]);

/** OJT 音素の種別を返す */
export function getPhonemeKind(phoneme: string): PhonemeKind {
  if (VOWELS.has(phoneme) || VOICELESS_VOWELS.has(phoneme)) return "vowel";
  if (CONSONANTS.has(phoneme)) return "consonant";
  if (SPECIALS.has(phoneme)) return "special";
  throw new ParseError(`未知の OJT 音素: ${phoneme}`);
}

/** 母音を有声・小文字に正規化する（A→a 等） */
function normalizeVowel(vowel: string): string {
  return vowel.toLowerCase();
}

const CONSONANT_VOWEL_TO_HIRAGANA: Record<string, Record<string, string>> = {
  k: { a: "か", i: "き", u: "く", e: "け", o: "こ" },
  s: { a: "さ", i: "し", u: "す", e: "せ", o: "そ" },
  t: { a: "た", i: "ち", u: "つ", e: "て", o: "と" },
  n: { a: "な", i: "に", u: "ぬ", e: "ね", o: "の" },
  h: { a: "は", i: "ひ", u: "ふ", e: "へ", o: "ほ" },
  m: { a: "ま", i: "み", u: "む", e: "め", o: "も" },
  y: { a: "や", u: "ゆ", o: "よ" },
  r: { a: "ら", i: "り", u: "る", e: "れ", o: "ろ" },
  w: { a: "わ", o: "を" },
  g: { a: "が", i: "ぎ", u: "ぐ", e: "げ", o: "ご" },
  z: { a: "ざ", i: "じ", u: "ず", e: "ぜ", o: "ぞ" },
  d: { a: "だ", i: "ぢ", u: "づ", e: "で", o: "ど" },
  b: { a: "ば", i: "び", u: "ぶ", e: "べ", o: "ぼ" },
  p: { a: "ぱ", i: "ぴ", u: "ぷ", e: "ぺ", o: "ぽ" },
  ky: { a: "きゃ", u: "きゅ", o: "きょ" },
  sh: { a: "しゃ", i: "し", u: "しゅ", e: "しぇ", o: "しょ" },
  ch: { a: "ちゃ", i: "ち", u: "ちゅ", e: "ちぇ", o: "ちょ" },
  ny: { a: "にゃ", u: "にゅ", o: "にょ" },
  hy: { a: "ひゃ", u: "ひゅ", o: "ひょ" },
  my: { a: "みゃ", u: "みゅ", o: "みょ" },
  ry: { a: "りゃ", u: "りゅ", o: "りょ" },
  gy: { a: "ぎゃ", u: "ぎゅ", o: "ぎょ" },
  j: { a: "じゃ", i: "じ", u: "じゅ", e: "じぇ", o: "じょ" },
  dy: { a: "ぢゃ", u: "ぢゅ", o: "ぢょ" },
  by: { a: "びゃ", u: "びゅ", o: "びょ" },
  py: { a: "ぴゃ", u: "ぴゅ", o: "ぴょ" },
  ts: { a: "つぁ", i: "つぃ", u: "つ", e: "つぇ", o: "つぉ" },
  f: { a: "ふぁ", i: "ふぃ", u: "ふ", e: "ふぇ", o: "ふぉ" },
};

const VOWEL_TO_HIRAGANA: Record<string, string> = {
  a: "あ",
  i: "い",
  u: "う",
  e: "え",
  o: "お",
};

/** 子音（または "none"）と母音からひらがなを返す */
export function phonemesToHiragana(
  consonant: string | "none",
  vowel: string,
): string {
  if (consonant === "none") {
    const normalized = normalizeVowel(vowel);
    const hiragana = VOWEL_TO_HIRAGANA[normalized];
    if (hiragana == null) {
      throw new ParseError(`未知の母音: ${vowel}`);
    }
    return hiragana;
  }

  const vowelMap = CONSONANT_VOWEL_TO_HIRAGANA[consonant];
  if (vowelMap == null) {
    throw new ParseError(`未知の子音: ${consonant}`);
  }
  const normalized = normalizeVowel(vowel);
  const hiragana = vowelMap[normalized];
  if (hiragana == null) {
    throw new ParseError(`未知の音素の組み合わせ: ${consonant} + ${vowel}`);
  }
  return hiragana;
}
