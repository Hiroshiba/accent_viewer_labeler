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
  "v",
  "ky",
  "kw",
  "sh",
  "ch",
  "ny",
  "hy",
  "my",
  "ry",
  "gy",
  "gw",
  "j",
  "ty",
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
  s: { a: "さ", i: "すぃ", u: "す", e: "せ", o: "そ" },
  t: { a: "た", i: "てぃ", u: "とぅ", e: "て", o: "と" },
  n: { a: "な", i: "に", u: "ぬ", e: "ね", o: "の" },
  h: { a: "は", i: "ひ", e: "へ", o: "ほ" },
  m: { a: "ま", i: "み", u: "む", e: "め", o: "も" },
  y: { a: "や", u: "ゆ", e: "いぇ", o: "よ" },
  r: { a: "ら", i: "り", u: "る", e: "れ", o: "ろ" },
  w: { a: "わ", i: "うぃ", u: "うぅ", e: "うぇ", o: "うぉ" },
  g: { a: "が", i: "ぎ", u: "ぐ", e: "げ", o: "ご" },
  z: { a: "ざ", i: "ずぃ", u: "ず", e: "ぜ", o: "ぞ" },
  d: { a: "だ", i: "でぃ", u: "どぅ", e: "で", o: "ど" },
  b: { a: "ば", i: "び", u: "ぶ", e: "べ", o: "ぼ" },
  p: { a: "ぱ", i: "ぴ", u: "ぷ", e: "ぺ", o: "ぽ" },
  v: { a: "ゔぁ", i: "ゔぃ", u: "ゔ", e: "ゔぇ", o: "ゔぉ" },
  ky: { a: "きゃ", i: "きぃ", u: "きゅ", e: "きぇ", o: "きょ" },
  kw: { a: "くぁ", i: "くぃ", u: "くぅ", e: "くぇ", o: "くぉ" },
  sh: { a: "しゃ", i: "し", u: "しゅ", e: "しぇ", o: "しょ" },
  ch: { a: "ちゃ", i: "ち", u: "ちゅ", e: "ちぇ", o: "ちょ" },
  ny: { a: "にゃ", i: "にぃ", u: "にゅ", e: "にぇ", o: "にょ" },
  hy: { a: "ひゃ", i: "ひぃ", u: "ひゅ", e: "ひぇ", o: "ひょ" },
  my: { a: "みゃ", i: "みぃ", u: "みゅ", e: "みぇ", o: "みょ" },
  ry: { a: "りゃ", i: "りぃ", u: "りゅ", e: "りぇ", o: "りょ" },
  gy: { a: "ぎゃ", i: "ぎぃ", u: "ぎゅ", e: "ぎぇ", o: "ぎょ" },
  gw: { a: "ぐぁ", i: "ぐぃ", u: "ぐぅ", e: "ぐぇ", o: "ぐぉ" },
  j: { a: "じゃ", i: "じ", u: "じゅ", e: "じぇ", o: "じょ" },
  ty: { a: "てゃ", u: "てゅ", e: "てぇ", o: "てょ" },
  dy: { a: "でゃ", u: "でゅ", e: "でぇ", o: "でょ" },
  by: { a: "びゃ", i: "びぃ", u: "びゅ", e: "びぇ", o: "びょ" },
  py: { a: "ぴゃ", i: "ぴぃ", u: "ぴゅ", e: "ぴぇ", o: "ぴょ" },
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
