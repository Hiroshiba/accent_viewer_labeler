import type { PitchLevel } from "../types/accent";
import { ValidationError } from "../errors";

/** 句内モーラ数とアクセント位置（0 始まり）から高低パターンを計算する */
export function computePitchPattern(
  moraCount: number,
  accentPos: number,
): Array<PitchLevel> {
  if (moraCount < 1) {
    throw new ValidationError(`モーラ数が不正です: ${moraCount}`);
  }
  if (accentPos < 0 || accentPos >= moraCount) {
    throw new ValidationError(
      `アクセント位置が範囲外です: ${accentPos}（モーラ数: ${moraCount}）`,
    );
  }

  if (accentPos === 0) {
    return Array.from({ length: moraCount }, (_, i) => (i === 0 ? "H" : "L"));
  }

  return Array.from({ length: moraCount }, (_, i) => {
    if (i === 0) return "L";
    if (i <= accentPos) return "H";
    return "L";
  });
}

export type SplitAccentResult = {
  frontAccentPos: number;
  backAccentPos: number;
};

/** 句を分割したときの前後のアクセント位置を計算する */
export function computeSplitAccent(
  originalAccentPos: number,
  splitMoraIndex: number,
): SplitAccentResult {
  if (originalAccentPos <= splitMoraIndex) {
    return { frontAccentPos: originalAccentPos, backAccentPos: 0 };
  }
  return {
    frontAccentPos: 0,
    backAccentPos: originalAccentPos - splitMoraIndex - 1,
  };
}

/** 2 つの句を結合したときのアクセント位置を計算する（前の句のアクセント位置を採用） */
export function computeMergeAccent(frontAccentPos: number): number {
  return frontAccentPos;
}
