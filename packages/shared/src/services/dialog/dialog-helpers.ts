import { markRaw } from "vue";
import ConfirmDialog from "../../components/dialog/ConfirmDialog.vue";
import NewProjectDialog from "../../components/dialog/NewProjectDialog.vue";
import SettingsDialog from "../../components/dialog/SettingsDialog.vue";
import type { ProjectData } from "../../types/project";
import { dialogService } from "./dialog-service";

/** 確認ダイアログを表示し、ユーザーの選択結果を返す */
export function showConfirmDialog(
  title: string,
  message: string,
  confirmLabel: string,
  cancelLabel: string,
): Promise<boolean> {
  return dialogService.open<boolean>(markRaw(ConfirmDialog), {
    title,
    message,
    confirmLabel,
    cancelLabel,
  });
}

/** 設定ダイアログを表示する */
export function showSettingsDialog(): Promise<void> {
  return dialogService.open<void>(markRaw(SettingsDialog), {});
}

/** 新規プロジェクト作成ダイアログを表示し、作成されたプロジェクトデータを返す */
export function showNewProjectDialog(): Promise<ProjectData | "cancelled"> {
  return dialogService.open<ProjectData | "cancelled">(
    markRaw(NewProjectDialog),
    {},
  );
}
