import { markRaw } from "vue";
import ConfirmDialog from "../../components/dialog/ConfirmDialog.vue";
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
