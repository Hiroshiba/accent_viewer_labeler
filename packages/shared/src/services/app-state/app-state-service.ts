import { shallowRef } from "vue";
import type { ProjectData } from "../../types/project";
import type { AppPhase, AppStateService } from "./interface";

class AppStateServiceImpl implements AppStateService {
  private readonly _state = shallowRef<AppPhase>({ phase: "empty" });

  get state(): AppPhase {
    return this._state.value;
  }

  setEmpty(): void {
    this._state.value = { phase: "empty" };
  }

  setLoading(message: string): void {
    this._state.value = { phase: "loading", message };
  }

  setEditing(project: ProjectData, currentStem: string): void {
    this._state.value = { phase: "editing", project, currentStem };
  }
}

export const appStateService: AppStateService = new AppStateServiceImpl();
