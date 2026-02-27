import type { ProjectData } from "../types/project";

/** 現在のプロジェクトが最後の保存時点から変更されているか判定する */
export function isDirty(
  savedJson: string,
  currentProject: ProjectData,
  currentStem: string,
): boolean {
  const current: ProjectData = { ...currentProject, lastOpenStem: currentStem };
  return savedJson !== JSON.stringify(current, null, 2);
}
