import type { FsAdapter } from "../services/fs-adapter/interface";
import type {
  ProjectData,
  ProjectMeta,
  SampleData,
  SourceFiles,
} from "../types/project";
import type { MoraInterval } from "../types/accent";
import { ValidationError } from "../errors";
import { parseLab } from "./lab-parser";
import { phonemesToMoras } from "./phoneme-to-mora";
import {
  parseAccentFlags,
  phonemeFlagsToMoraFlags,
  analyzeAccent,
} from "./accent-parser";
import { naturalSort } from "./natural-sort";

export type BuildProjectInput = {
  rootDirectory: string;
  globLab: string;
  globStartAccent: string;
  globEndAccent: string;
  globStartAccentPhrase: string;
  globEndAccentPhrase: string;
  globAudio: string;
};

export type ProgressCallback = (current: number, total: number) => void;

/** ファイルパスから stem（拡張子なしファイル名）を抽出する */
export function extractStem(filePath: string): string {
  const fileName = filePath.split("/").pop();
  if (fileName == null) {
    throw new ValidationError(
      `ファイルパスからファイル名を取得できません: ${filePath}`,
    );
  }
  const dotIndex = fileName.indexOf(".");
  if (dotIndex === -1) {
    return fileName;
  }
  return fileName.slice(0, dotIndex);
}

/** ファイルリストから stem → パスの Map を構築する */
function buildStemMap(files: Array<string>): Map<string, string> {
  const map = new Map<string, string>();
  for (const file of files) {
    const stem = extractStem(file);
    if (map.has(stem)) {
      throw new ValidationError(
        `stem "${stem}" に複数のファイルがマッチしました: ${map.get(stem)}, ${file}`,
      );
    }
    map.set(stem, file);
  }
  return map;
}

/** 複数の stem セットの共通部分を返す */
function stemIntersection(stemMaps: Array<Map<string, string>>): Set<string> {
  const [first, ...rest] = stemMaps;
  const result = new Set<string>(first.keys());
  for (const map of rest) {
    for (const stem of result) {
      if (!map.has(stem)) {
        result.delete(stem);
      }
    }
  }
  return result;
}

/** FsAdapter を使ってプロジェクトデータを構築する */
export async function buildProjectData(
  fs: FsAdapter,
  input: BuildProjectInput,
  onProgress: ProgressCallback,
): Promise<ProjectData> {
  const [
    labFiles,
    startAccFiles,
    endAccFiles,
    startPhrFiles,
    endPhrFiles,
    audioFiles,
  ] = await Promise.all([
    fs.listFilesGlob(input.rootDirectory, input.globLab),
    fs.listFilesGlob(input.rootDirectory, input.globStartAccent),
    fs.listFilesGlob(input.rootDirectory, input.globEndAccent),
    fs.listFilesGlob(input.rootDirectory, input.globStartAccentPhrase),
    fs.listFilesGlob(input.rootDirectory, input.globEndAccentPhrase),
    fs.listFilesGlob(input.rootDirectory, input.globAudio),
  ]);

  const labMap = buildStemMap(labFiles);
  const startAccMap = buildStemMap(startAccFiles);
  const endAccMap = buildStemMap(endAccFiles);
  const startPhrMap = buildStemMap(startPhrFiles);
  const endPhrMap = buildStemMap(endPhrFiles);
  const audioMap = buildStemMap(audioFiles);

  const commonStems = stemIntersection([
    labMap,
    startAccMap,
    endAccMap,
    startPhrMap,
    endPhrMap,
  ]);

  if (commonStems.size === 0) {
    throw new ValidationError(
      "5 種の必須ファイルすべてに共通する stem が見つかりません",
    );
  }

  const sortedStems = naturalSort([...commonStems]);
  const samples: Record<string, SampleData> = {};
  const resultAudioFiles: Record<string, string> = {};

  for (let i = 0; i < sortedStems.length; i++) {
    onProgress(i, sortedStems.length);

    const stem = sortedStems[i];

    const labPath = labMap.get(stem);
    const startAccPath = startAccMap.get(stem);
    const endAccPath = endAccMap.get(stem);
    const startPhrPath = startPhrMap.get(stem);
    const endPhrPath = endPhrMap.get(stem);

    if (
      labPath == null ||
      startAccPath == null ||
      endAccPath == null ||
      startPhrPath == null ||
      endPhrPath == null
    ) {
      throw new ValidationError(
        `stem "${stem}" のファイルパスが見つかりません`,
      );
    }

    const [
      labContent,
      startAccContent,
      endAccContent,
      startPhrContent,
      endPhrContent,
    ] = await Promise.all([
      fs.readTextFile(labPath),
      fs.readTextFile(startAccPath),
      fs.readTextFile(endAccPath),
      fs.readTextFile(startPhrPath),
      fs.readTextFile(endPhrPath),
    ]);

    const labEntries = parseLab(labContent);
    const nonPauEntries = labEntries.filter((e) => e.phoneme !== "pau");
    const nonPauPhonemes = nonPauEntries.map((e) => e.phoneme);

    const moraInfos = phonemesToMoras(nonPauPhonemes);

    const startAccFlags = parseAccentFlags(startAccContent);
    const endAccFlags = parseAccentFlags(endAccContent);
    const startPhrFlags = parseAccentFlags(startPhrContent);
    const endPhrFlags = parseAccentFlags(endPhrContent);

    if (startAccFlags.length !== nonPauPhonemes.length) {
      throw new ValidationError(
        `stem "${stem}" の start_accent のフラグ数（${startAccFlags.length}）が音素数（${nonPauPhonemes.length}）と一致しません`,
      );
    }
    if (endAccFlags.length !== nonPauPhonemes.length) {
      throw new ValidationError(
        `stem "${stem}" の end_accent のフラグ数（${endAccFlags.length}）が音素数（${nonPauPhonemes.length}）と一致しません`,
      );
    }
    if (startPhrFlags.length !== nonPauPhonemes.length) {
      throw new ValidationError(
        `stem "${stem}" の start_accent_phrase のフラグ数（${startPhrFlags.length}）が音素数（${nonPauPhonemes.length}）と一致しません`,
      );
    }
    if (endPhrFlags.length !== nonPauPhonemes.length) {
      throw new ValidationError(
        `stem "${stem}" の end_accent_phrase のフラグ数（${endPhrFlags.length}）が音素数（${nonPauPhonemes.length}）と一致しません`,
      );
    }

    const moraPhonemeIndices = moraInfos.map((m) => m.phonemeIndices);
    const startAccMora = phonemeFlagsToMoraFlags(
      startAccFlags,
      moraPhonemeIndices,
    );
    const endAccMora = phonemeFlagsToMoraFlags(endAccFlags, moraPhonemeIndices);
    const startPhrMora = phonemeFlagsToMoraFlags(
      startPhrFlags,
      moraPhonemeIndices,
    );
    const endPhrMora = phonemeFlagsToMoraFlags(endPhrFlags, moraPhonemeIndices);

    const analysis = analyzeAccent(
      startAccMora,
      endAccMora,
      startPhrMora,
      endPhrMora,
      moraInfos.length,
    );

    const moraIntervals: Array<MoraInterval> = moraInfos.map((mora) => {
      const firstEntry = nonPauEntries[mora.phonemeIndices[0]];
      const lastEntry =
        nonPauEntries[mora.phonemeIndices[mora.phonemeIndices.length - 1]];
      return { start: firstEntry.start, end: lastEntry.end };
    });

    const sourceFiles: SourceFiles = {
      lab: labPath,
      startAccent: startAccPath,
      endAccent: endAccPath,
      startAccentPhrase: startPhrPath,
      endAccentPhrase: endPhrPath,
    };

    samples[stem] = {
      moras: moraInfos.map((m) => m.hiragana),
      moraIntervals,
      phraseBoundaries: analysis.phraseBoundaries,
      accentPosInPhrase: analysis.accentPosInPhrase,
      sourceFiles,
    };

    const audioPath = audioMap.get(stem);
    if (audioPath != null) {
      resultAudioFiles[stem] = audioPath;
    }
  }

  onProgress(sortedStems.length, sortedStems.length);

  const meta: ProjectMeta = {
    rootDirectory: input.rootDirectory,
    globLab: input.globLab,
    globStartAccent: input.globStartAccent,
    globEndAccent: input.globEndAccent,
    globStartAccentPhrase: input.globStartAccentPhrase,
    globEndAccentPhrase: input.globEndAccentPhrase,
    globAudio: input.globAudio,
  };

  const firstStem = sortedStems[0];
  if (firstStem == null) {
    throw new ValidationError("stem が存在しません");
  }

  return {
    version: 1,
    meta,
    stems: sortedStems,
    samples,
    overrides: {},
    checked: {},
    audioFiles: resultAudioFiles,
    lastOpenStem: firstStem,
  };
}
