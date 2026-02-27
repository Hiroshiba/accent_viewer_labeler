import { ParseError, ValidationError } from "../errors";

/** 0/1 のスペース区切りテキストをパースする */
export function parseAccentFlags(content: string): Array<number> {
  const parts = content.trim().split(/\s+/);
  if (parts.length === 0 || (parts.length === 1 && parts[0] === "")) {
    throw new ParseError("アクセントフラグファイルが空です");
  }
  return parts.map((part, index) => {
    if (part !== "0" && part !== "1") {
      throw new ParseError(
        `アクセントフラグの ${index + 1} 番目の値が不正です（0 か 1 のみ許容）: ${part}`,
      );
    }
    return Number(part);
  });
}

/** 音素レベルのフラグ配列をモーラレベルに変換する */
export function phonemeFlagsToMoraFlags(
  phonemeFlags: Array<number>,
  moraPhonemeIndices: Array<Array<number>>,
): Array<number> {
  return moraPhonemeIndices.map((indices) =>
    indices.some((idx) => phonemeFlags[idx] === 1) ? 1 : 0,
  );
}

export type AccentAnalysis = {
  phraseBoundaries: Array<number>;
  accentPosInPhrase: Array<number>;
};

type PhraseRange = {
  startMora: number;
  endMora: number;
};

function buildPhraseRanges(
  startPhrMora: Array<number>,
  endPhrMora: Array<number>,
  moraCount: number,
): Array<PhraseRange> {
  const startPositions = startPhrMora
    .map((flag, i) => (flag === 1 ? i : -1))
    .filter((i) => i !== -1);

  const endPositions = endPhrMora
    .map((flag, i) => (flag === 1 ? i : -1))
    .filter((i) => i !== -1);

  if (startPositions.length === 0) {
    throw new ValidationError("アクセント句の開始位置が見つかりません");
  }
  if (startPositions.length !== endPositions.length) {
    throw new ValidationError(
      `アクセント句の開始数（${startPositions.length}）と終了数（${endPositions.length}）が一致しません`,
    );
  }

  const ranges: Array<PhraseRange> = startPositions.map((start, i) => ({
    startMora: start,
    endMora: endPositions[i],
  }));

  if (ranges[0].startMora !== 0) {
    throw new ValidationError(
      `最初のアクセント句がモーラ 0 から始まっていません（実際: ${ranges[0].startMora}）`,
    );
  }
  if (ranges[ranges.length - 1].endMora !== moraCount - 1) {
    throw new ValidationError(
      `最後のアクセント句が最終モーラで終わっていません（実際: ${ranges[ranges.length - 1].endMora}, モーラ数: ${moraCount}）`,
    );
  }

  for (let i = 1; i < ranges.length; i++) {
    if (ranges[i].startMora !== ranges[i - 1].endMora + 1) {
      throw new ValidationError(
        `アクセント句が連続していません（句 ${i - 1} 終了: ${ranges[i - 1].endMora}, 句 ${i} 開始: ${ranges[i].startMora}）`,
      );
    }
  }

  return ranges;
}

/** 4 種のモーラレベルフラグからアクセント句境界とアクセント位置を算出する */
export function analyzeAccent(
  startAccMora: Array<number>,
  _endAccMora: Array<number>,
  startPhrMora: Array<number>,
  endPhrMora: Array<number>,
  moraCount: number,
): AccentAnalysis {
  const phrases = buildPhraseRanges(startPhrMora, endPhrMora, moraCount);

  const phraseBoundaries = phrases.slice(0, -1).map((phrase) => phrase.endMora);

  const accentPosInPhrase = phrases.map((phrase) => {
    const phraseLength = phrase.endMora - phrase.startMora + 1;
    let firstStartAccentInPhrase = -1;
    for (let i = 0; i < phraseLength; i++) {
      if (startAccMora[phrase.startMora + i] === 1) {
        firstStartAccentInPhrase = i;
        break;
      }
    }
    if (firstStartAccentInPhrase === -1) {
      throw new ValidationError(
        `アクセント句（モーラ ${phrase.startMora}〜${phrase.endMora}）内に start_accent が見つかりません`,
      );
    }
    if (firstStartAccentInPhrase === 0) {
      return 0;
    }
    return firstStartAccentInPhrase - 1;
  });

  return { phraseBoundaries, accentPosInPhrase };
}
