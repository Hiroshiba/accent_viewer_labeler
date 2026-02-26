import type { ProjectData } from "../../types/project";

export type AppPhase =
  | { phase: "empty" }
  | { phase: "loading"; message: string }
  | { phase: "editing"; project: ProjectData; currentStem: string };

export interface AppStateService {
  readonly state: AppPhase;
  setEmpty(): void;
  setLoading(message: string): void;
  setEditing(project: ProjectData, currentStem: string): void;
}
