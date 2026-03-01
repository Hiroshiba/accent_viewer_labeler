import { extractStem } from "./project-builder";

/** stems リストと音声ファイルパスから audioFiles マッピングを構築する */
export function matchAudioToStems(
  stems: Array<string>,
  audioFilePaths: Array<string>,
): { audioFiles: Record<string, string>; unmatchedCount: number } {
  const audioMap = new Map<string, string>();
  for (const path of audioFilePaths) {
    const stem = extractStem(path);
    audioMap.set(stem, path);
  }

  const audioFiles: Record<string, string> = {};
  let unmatchedCount = 0;
  for (const stem of stems) {
    const audioPath = audioMap.get(stem);
    if (audioPath != null) {
      audioFiles[stem] = audioPath;
    } else {
      unmatchedCount += 1;
    }
  }
  return { audioFiles, unmatchedCount };
}
