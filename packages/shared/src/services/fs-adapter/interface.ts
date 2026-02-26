/** ファイルシステム操作の抽象インターフェース */
export interface FsAdapter {
  readTextFile(path: string): Promise<string>;
  readBinaryFile(path: string): Promise<ArrayBuffer>;
  listFilesGlob(
    rootDirectory: string,
    globPattern: string,
  ): Promise<Array<string>>;
  selectDirectory(): Promise<string>;
  saveFile(path: string, content: string): Promise<void>;
  selectSaveLocation(suggestedName: string): Promise<string>;
}

let currentAdapter: FsAdapter | "unset" = "unset";

export function setFsAdapter(adapter: FsAdapter): void {
  currentAdapter = adapter;
}

export function getFsAdapter(): FsAdapter {
  if (currentAdapter === "unset") {
    throw new Error(
      "FsAdapter が未設定です。setFsAdapter() を呼び出してください。",
    );
  }
  return currentAdapter;
}
