import type { OverrideData, ProjectData, SampleData } from "../types/project";
import { resolveAccentData } from "./accent-view";

type ExportJson = {
  phrase_boundaries: Array<number>;
  accent_pos_in_phrase: Array<number>;
};

/** 単一サンプルの書き出し JSON を生成する */
export function buildExportJson(
  sample: SampleData,
  override: OverrideData | undefined,
): string {
  const { phraseBoundaries, accentPosInPhrase } = resolveAccentData(
    sample,
    override,
  );
  const data: ExportJson = {
    phrase_boundaries: phraseBoundaries,
    accent_pos_in_phrase: accentPosInPhrase,
  };
  return JSON.stringify(data, null, 2);
}

/** 全 stem の書き出し JSON を生成する（stem → JSON 文字列のマップ） */
export function buildAllExportJsons(project: ProjectData): Map<string, string> {
  const result = new Map<string, string>();
  for (const stem of project.stems) {
    const sample = project.samples[stem];
    if (sample == null) {
      throw new Error(`stem "${stem}" のサンプルデータが見つかりません`);
    }
    result.set(stem, buildExportJson(sample, project.overrides[stem]));
  }
  return result;
}
