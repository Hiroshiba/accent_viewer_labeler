import { ValidationError } from "../errors";
import { projectDataSchema, type ProjectData } from "../types/project";

/** プロジェクトを JSON 文字列にシリアライズする */
export function serializeProject(
  project: ProjectData,
  currentStem: string,
): string {
  const data: ProjectData = { ...project, lastOpenStem: currentStem };
  return JSON.stringify(data, null, 2);
}

/** JSON 文字列からプロジェクトをデシリアライズし、整合性を検証する */
export function deserializeProject(json: string): ProjectData {
  const parsed: unknown = JSON.parse(json);
  const project = projectDataSchema.parse(parsed);

  const stemSet = new Set(project.stems);

  for (const key of Object.keys(project.samples)) {
    if (!stemSet.has(key)) {
      throw new ValidationError(
        `samples に含まれる stem "${key}" が stems 配列に存在しません`,
      );
    }
  }

  for (const stem of project.stems) {
    if (project.samples[stem] == null) {
      throw new ValidationError(
        `stems 配列の "${stem}" に対応する sample データが存在しません`,
      );
    }
  }

  for (const key of Object.keys(project.overrides)) {
    if (!stemSet.has(key)) {
      throw new ValidationError(
        `overrides に含まれる stem "${key}" が stems 配列に存在しません`,
      );
    }
  }

  for (const key of Object.keys(project.checked)) {
    if (!stemSet.has(key)) {
      throw new ValidationError(
        `checked に含まれる stem "${key}" が stems 配列に存在しません`,
      );
    }
  }

  if (!stemSet.has(project.lastOpenStem)) {
    throw new ValidationError(
      `lastOpenStem "${project.lastOpenStem}" が stems 配列に存在しません`,
    );
  }

  return project;
}
