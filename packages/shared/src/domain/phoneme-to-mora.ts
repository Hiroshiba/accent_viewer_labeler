import { ParseError } from "../errors";
import { getPhonemeKind, phonemesToHiragana } from "./ojt-to-hiragana";

export type MoraInfo = {
  hiragana: string;
  phonemeIndices: Array<number>;
};

/** pau を除いた音素列をモーラ列に変換する */
export function phonemesToMoras(phonemes: Array<string>): Array<MoraInfo> {
  const moras: Array<MoraInfo> = [];
  let i = 0;

  while (i < phonemes.length) {
    const phoneme = phonemes[i];
    const kind = getPhonemeKind(phoneme);

    if (kind === "vowel") {
      moras.push({
        hiragana: phonemesToHiragana("none", phoneme),
        phonemeIndices: [i],
      });
      i++;
    } else if (kind === "consonant") {
      if (i + 1 >= phonemes.length) {
        throw new ParseError(
          `子音の後に母音がありません（音素インデックス ${i}: ${phoneme}）`,
        );
      }
      const nextPhoneme = phonemes[i + 1];
      const nextKind = getPhonemeKind(nextPhoneme);
      if (nextKind !== "vowel") {
        throw new ParseError(
          `子音の後に母音がありません（音素インデックス ${i}: ${phoneme}, 次の音素: ${nextPhoneme}）`,
        );
      }
      moras.push({
        hiragana: phonemesToHiragana(phoneme, nextPhoneme),
        phonemeIndices: [i, i + 1],
      });
      i += 2;
    } else if (kind === "special") {
      if (phoneme === "N") {
        moras.push({ hiragana: "ん", phonemeIndices: [i] });
      } else if (phoneme === "cl") {
        moras.push({ hiragana: "っ", phonemeIndices: [i] });
      } else if (phoneme === "pau") {
        throw new ParseError(
          `pau が音素列に含まれています（音素インデックス ${i}）。pau を除外してから渡してください`,
        );
      }
      i++;
    }
  }

  return moras;
}
