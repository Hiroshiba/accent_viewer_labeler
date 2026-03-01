import { buildAllExportJsons, buildExportJson } from "../../domain/export";
import { appStateService } from "../app-state/app-state-service";
import { getFsAdapter } from "../fs-adapter/interface";
import { toastService } from "../toast/toast-service";
import type { ExportService } from "./interface";

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

class ExportServiceImpl implements ExportService {
  async exportCurrent(): Promise<void> {
    const state = appStateService.state;
    if (state.phase !== "editing") {
      return;
    }
    const { project, currentStem } = state;
    const sample = project.samples[currentStem];
    if (sample == null) {
      throw new Error(
        `現在の stem "${currentStem}" のサンプルデータが見つかりません`,
      );
    }
    const json = buildExportJson(sample, project.overrides[currentStem]);
    try {
      const fs = getFsAdapter();
      const path = await fs.selectSaveLocation(`${currentStem}.json`);
      await fs.saveFile(path, json);
      toastService.show(
        `${currentStem}.json を書き出しました`,
        "success",
        3000,
      );
    } catch (error) {
      toastService.show(
        `書き出しに失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        "error",
        5000,
      );
    }
  }

  async exportBulk(): Promise<void> {
    const state = appStateService.state;
    if (state.phase !== "editing") {
      return;
    }
    const jsons = buildAllExportJsons(state.project);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const [stem, json] of jsons) {
        zip.file(`${stem}.json`, json);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, "accent-jsons.zip");
      toastService.show("一括書き出しが完了しました", "success", 3000);
    } catch (error) {
      toastService.show(
        `一括書き出しに失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        "error",
        5000,
      );
    }
  }
}

export const exportService: ExportService = new ExportServiceImpl();
