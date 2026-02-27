import { ParseError } from "../errors";

export type LabEntry = {
  start: number;
  end: number;
  phoneme: string;
};

/** Julius 形式 .lab ファイルの内容をパースする */
export function parseLab(content: string): Array<LabEntry> {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  if (lines.length === 0) {
    throw new ParseError(".lab ファイルが空です");
  }

  return lines.map((line, index) => {
    const parts = line.split(/\s+/);
    if (parts.length !== 3) {
      throw new ParseError(
        `.lab ファイルの ${index + 1} 行目が不正です（3カラム必要）: ${line}`,
      );
    }

    const start = Number(parts[0]);
    const end = Number(parts[1]);
    const phoneme = parts[2];

    if (Number.isNaN(start)) {
      throw new ParseError(
        `.lab ファイルの ${index + 1} 行目の開始時刻が数値ではありません: ${parts[0]}`,
      );
    }
    if (Number.isNaN(end)) {
      throw new ParseError(
        `.lab ファイルの ${index + 1} 行目の終了時刻が数値ではありません: ${parts[1]}`,
      );
    }
    if (start >= end) {
      throw new ParseError(
        `.lab ファイルの ${index + 1} 行目の時刻が不正です（start >= end）: ${line}`,
      );
    }

    return { start, end, phoneme };
  });
}
