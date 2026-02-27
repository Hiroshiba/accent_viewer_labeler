import type { MoraInterval } from "../types/accent";

/** 前後コンテキストモーラ数 */
const CONTEXT_MORAS = 2;

/** モーラインデックスから前後コンテキスト付き再生区間を計算する */
export function computeMoraPlaybackRange(
  moraIntervals: Array<MoraInterval>,
  moraIndex: number,
): { startTime: number; endTime: number } {
  const start = Math.max(0, moraIndex - CONTEXT_MORAS);
  const end = Math.min(moraIntervals.length - 1, moraIndex + CONTEXT_MORAS);
  const startInterval = moraIntervals[start];
  const endInterval = moraIntervals[end];
  if (startInterval == null || endInterval == null) {
    throw new Error(`モーラ区間が見つかりません: ${start} 〜 ${end}`);
  }
  return { startTime: startInterval.start, endTime: endInterval.end };
}

/** 句のモーラ範囲から再生区間を計算する */
export function computePhrasePlaybackRange(
  moraIntervals: Array<MoraInterval>,
  startMoraIndex: number,
  endMoraIndex: number,
): { startTime: number; endTime: number } {
  const startInterval = moraIntervals[startMoraIndex];
  const endInterval = moraIntervals[endMoraIndex];
  if (startInterval == null || endInterval == null) {
    throw new Error(
      `モーラ区間が見つかりません: ${startMoraIndex} 〜 ${endMoraIndex}`,
    );
  }
  return { startTime: startInterval.start, endTime: endInterval.end };
}

/** 全モーラの再生区間を計算する */
export function computeFullPlaybackRange(moraIntervals: Array<MoraInterval>): {
  startTime: number;
  endTime: number;
} {
  if (moraIntervals.length === 0) {
    return { startTime: 0, endTime: 0 };
  }
  const first = moraIntervals[0];
  const last = moraIntervals[moraIntervals.length - 1];
  if (first == null || last == null) {
    throw new Error("モーラ区間が空です");
  }
  return { startTime: first.start, endTime: last.end };
}

/** currentTime が属するモーラインデックスを返す。範囲外は "none" */
export function findMoraAtTime(
  moraIntervals: Array<MoraInterval>,
  currentTime: number,
): number | "none" {
  for (let i = 0; i < moraIntervals.length; i++) {
    const interval = moraIntervals[i];
    if (interval == null) {
      continue;
    }
    if (currentTime >= interval.start && currentTime < interval.end) {
      return i;
    }
  }
  return "none";
}
