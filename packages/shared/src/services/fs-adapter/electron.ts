import type { FsAdapter } from "./interface";

interface ElectronFsApi {
  readTextFile(filePath: string): Promise<string>;
  readBinaryFile(filePath: string): Promise<ArrayBuffer>;
  listFilesGlob(
    rootDirectory: string,
    globPattern: string,
  ): Promise<Array<string>>;
  selectDirectory(): Promise<string | "cancelled">;
  saveFile(filePath: string, content: string): Promise<void>;
  selectSaveLocation(suggestedName: string): Promise<string | "cancelled">;
  selectAndReadTextFile(
    accept: string,
  ): Promise<{ name: string; content: string } | "cancelled">;
}

declare global {
  interface Window {
    electronFs: ElectronFsApi;
  }
}

/** Electron IPC 経由の FsAdapter 実装 */
export class ElectronFsAdapter implements FsAdapter {
  async readTextFile(path: string): Promise<string> {
    return window.electronFs.readTextFile(path);
  }

  async readBinaryFile(path: string): Promise<ArrayBuffer> {
    return window.electronFs.readBinaryFile(path);
  }

  async listFilesGlob(
    rootDirectory: string,
    globPattern: string,
  ): Promise<Array<string>> {
    return window.electronFs.listFilesGlob(rootDirectory, globPattern);
  }

  async selectDirectory(): Promise<string> {
    const result = await window.electronFs.selectDirectory();
    if (result === "cancelled") {
      throw new Error("ディレクトリ選択がキャンセルされました");
    }
    return result;
  }

  async saveFile(path: string, content: string): Promise<void> {
    return window.electronFs.saveFile(path, content);
  }

  async selectSaveLocation(suggestedName: string): Promise<string> {
    const result = await window.electronFs.selectSaveLocation(suggestedName);
    if (result === "cancelled") {
      throw new Error("保存先選択がキャンセルされました");
    }
    return result;
  }

  async selectAndReadTextFile(
    accept: string,
  ): Promise<{ name: string; content: string } | "cancelled"> {
    return window.electronFs.selectAndReadTextFile(accept);
  }
}
