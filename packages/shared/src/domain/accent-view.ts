import type { PitchLevel } from "../types/accent";
import type { OverrideData, SampleData } from "../types/project";
import { computePitchPattern } from "./accent-logic";

export type PhraseView = {
  moraTexts: Array<string>;
  pitchPattern: Array<PitchLevel>;
  accentPos: number;
  startMoraIndex: number;
};

export type SampleView = {
  phrases: Array<PhraseView>;
  moras: Array<string>;
  phraseBoundaries: Array<number>;
  accentPosInPhrase: Array<number>;
};

/** overrides があればそちらを優先して phraseBoundaries と accentPosInPhrase を返す */
export function resolveAccentData(
  sample: SampleData,
  override: OverrideData | undefined,
): { phraseBoundaries: Array<number>; accentPosInPhrase: Array<number> } {
  if (override != null) {
    return {
      phraseBoundaries: override.phraseBoundaries,
      accentPosInPhrase: override.accentPosInPhrase,
    };
  }
  return {
    phraseBoundaries: sample.phraseBoundaries,
    accentPosInPhrase: sample.accentPosInPhrase,
  };
}

/** phraseBoundaries からモーラ列を句ごとに分割して SampleView を構築する */
export function buildSampleView(
  moras: Array<string>,
  phraseBoundaries: Array<number>,
  accentPosInPhrase: Array<number>,
): SampleView {
  // phraseBoundaries は各句の末尾モーラインデックスの配列
  // 例: moras=5, boundaries=[3] → 句1=moras[0..3], 句2=moras[4..]
  const phraseStartIndices: Array<number> = [0];
  for (const boundary of phraseBoundaries) {
    phraseStartIndices.push(boundary + 1);
  }

  const phrases: Array<PhraseView> = phraseStartIndices.map(
    (startIdx, phraseIdx) => {
      const endIdx =
        phraseIdx < phraseBoundaries.length
          ? phraseBoundaries[phraseIdx] + 1
          : moras.length;
      const moraTexts = moras.slice(startIdx, endIdx);
      const accentPos = accentPosInPhrase[phraseIdx];
      if (accentPos == null) {
        throw new Error(
          `句 ${phraseIdx} のアクセント位置が見つかりません（accentPosInPhrase の長さ: ${accentPosInPhrase.length}）`,
        );
      }
      const pitchPattern = computePitchPattern(moraTexts.length, accentPos);
      return {
        moraTexts,
        pitchPattern,
        accentPos,
        startMoraIndex: startIdx,
      };
    },
  );

  return { phrases, moras, phraseBoundaries, accentPosInPhrase };
}
