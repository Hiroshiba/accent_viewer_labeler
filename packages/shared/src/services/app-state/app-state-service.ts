import { shallowRef } from "vue";
import type { OverrideData, ProjectData } from "../../types/project";
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

  setCurrentStem(stem: string): void {
    const current = this._state.value;
    if (current.phase !== "editing") {
      throw new Error("editing フェーズ以外で setCurrentStem は呼べません");
    }
    this._state.value = { ...current, currentStem: stem };
  }

  markChecked(stem: string): void {
    const current = this._state.value;
    if (current.phase !== "editing") {
      throw new Error("editing フェーズ以外で markChecked は呼べません");
    }
    const project = current.project;
    this._state.value = {
      ...current,
      project: {
        ...project,
        checked: { ...project.checked, [stem]: true },
      },
    };
  }

  unmarkChecked(stem: string): void {
    const current = this._state.value;
    if (current.phase !== "editing") {
      throw new Error("editing フェーズ以外で unmarkChecked は呼べません");
    }
    const project = current.project;
    const newChecked = { ...project.checked };
    delete newChecked[stem];
    this._state.value = {
      ...current,
      project: { ...project, checked: newChecked },
    };
  }

  setOverride(stem: string, override: OverrideData): void {
    const current = this._state.value;
    if (current.phase !== "editing") {
      throw new Error("editing フェーズ以外で setOverride は呼べません");
    }
    const project = current.project;
    this._state.value = {
      ...current,
      project: {
        ...project,
        overrides: { ...project.overrides, [stem]: override },
      },
    };
  }
}

export const appStateService: AppStateService = new AppStateServiceImpl();
