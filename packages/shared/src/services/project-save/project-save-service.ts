import { shallowRef } from "vue";
import { isDirty as checkIsDirty } from "../../domain/dirty-check";
import {
  deserializeProject,
  serializeProject,
} from "../../domain/project-save-load";
import { appStateService } from "../app-state/app-state-service";
import { showConfirmDialog } from "../dialog/dialog-helpers";
import { getFsAdapter } from "../fs-adapter/interface";
import { getPersistenceService } from "../persistence/persistence-service";
import { toastService } from "../toast/toast-service";
import { undoRedoService } from "../undo-redo/undo-redo-service";
import type { ProjectSaveService } from "./interface";

class ProjectSaveServiceImpl implements ProjectSaveService {
  readonly lastSavedJson = shallowRef<string>("");

  get isDirty(): boolean {
    const state = appStateService.state;
    if (state.phase !== "editing") {
      return false;
    }
    if (this.lastSavedJson.value === "") {
      return false;
    }
    return checkIsDirty(
      this.lastSavedJson.value,
      state.project,
      state.currentStem,
    );
  }

  markSaved(json: string): void {
    this.lastSavedJson.value = json;
  }

  async save(): Promise<void> {
    const state = appStateService.state;
    if (state.phase !== "editing") {
      toastService.show("プロジェクトが開かれていません", "error", 3000);
      return;
    }
    try {
      const json = serializeProject(state.project, state.currentStem);
      const fs = getFsAdapter();
      const path = await fs.selectSaveLocation("project.accentproj.json");
      await fs.saveFile(path, json);
      await getPersistenceService().saveProject(state.project);
      this.markSaved(json);
      toastService.show("プロジェクトを保存しました", "success", 3000);
    } catch (error) {
      toastService.show(
        `保存に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        "error",
        5000,
      );
    }
  }

  async load(): Promise<void> {
    if (this.isDirty) {
      const confirmed = await showConfirmDialog(
        "未保存の変更があります",
        "変更が保存されていません。読み込むと失われます。続けますか？",
        "読み込む",
        "キャンセル",
      );
      if (!confirmed) {
        return;
      }
    }
    try {
      const fs = getFsAdapter();
      const result = await fs.selectAndReadTextFile(".json");
      if (result === "cancelled") {
        return;
      }
      const project = deserializeProject(result.content);
      appStateService.setEditing(project, project.lastOpenStem);
      undoRedoService.clear();
      const json = serializeProject(project, project.lastOpenStem);
      this.markSaved(json);
      toastService.show("プロジェクトを読み込みました", "success", 3000);
    } catch (error) {
      toastService.show(
        `読み込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        "error",
        5000,
      );
    }
  }
}

export const projectSaveService: ProjectSaveService =
  new ProjectSaveServiceImpl();
