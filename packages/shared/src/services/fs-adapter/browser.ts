import { matchGlob } from "./glob-match";
import type { FsAdapter } from "./interface";

const BROWSER_PATH_PREFIX = "browser://";

async function resolveFilePath(
  dirHandle: FileSystemDirectoryHandle,
  relativePath: string,
): Promise<FileSystemFileHandle> {
  const parts = relativePath.split("/").filter((p) => p !== "");
  let current: FileSystemDirectoryHandle = dirHandle;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (part == null) {
      throw new Error(`パスのセグメントが不正です: ${relativePath}`);
    }
    current = await current.getDirectoryHandle(part);
  }
  const fileName = parts[parts.length - 1];
  if (fileName == null) {
    throw new Error(`ファイルパスが空です: ${relativePath}`);
  }
  return current.getFileHandle(fileName);
}

async function* walkDirectory(
  handle: FileSystemDirectoryHandle,
  pathPrefix: string,
): AsyncGenerator<string> {
  for await (const [name, entry] of handle.entries()) {
    const entryPath = `${pathPrefix}/${name}`;
    if (entry.kind === "file") {
      yield entryPath;
    } else {
      const subDirHandle = await handle.getDirectoryHandle(name);
      yield* walkDirectory(subDirHandle, entryPath);
    }
  }
}

/** File System Access API を使った FsAdapter 実装 */
export class BrowserFsAdapter implements FsAdapter {
  private directoryHandle: FileSystemDirectoryHandle | "unselected" =
    "unselected";
  private directoryPath: string | "unselected" = "unselected";
  private saveHandles: Map<string, FileSystemFileHandle> = new Map();

  private getDirectoryHandle(): FileSystemDirectoryHandle {
    if (this.directoryHandle === "unselected") {
      throw new Error(
        "ルートディレクトリが未選択です。selectDirectory() を先に呼び出してください。",
      );
    }
    return this.directoryHandle;
  }

  private toRelativePath(fullPath: string): string {
    if (this.directoryPath === "unselected") {
      throw new Error("ルートディレクトリが未選択です。");
    }
    const prefix = `${this.directoryPath}/`;
    if (!fullPath.startsWith(prefix)) {
      throw new Error(
        `パス "${fullPath}" はルートディレクトリ "${this.directoryPath}" 配下ではありません。`,
      );
    }
    return fullPath.slice(prefix.length);
  }

  async readTextFile(path: string): Promise<string> {
    const relativePath = this.toRelativePath(path);
    const fileHandle = await resolveFilePath(
      this.getDirectoryHandle(),
      relativePath,
    );
    const file = await fileHandle.getFile();
    return file.text();
  }

  async readBinaryFile(path: string): Promise<ArrayBuffer> {
    const relativePath = this.toRelativePath(path);
    const fileHandle = await resolveFilePath(
      this.getDirectoryHandle(),
      relativePath,
    );
    const file = await fileHandle.getFile();
    return file.arrayBuffer();
  }

  async listFilesGlob(
    rootDirectory: string,
    globPattern: string,
  ): Promise<Array<string>> {
    const dirHandle = this.getDirectoryHandle();
    const fullPattern = `${rootDirectory}/${globPattern}`;
    const results: Array<string> = [];
    for await (const filePath of walkDirectory(dirHandle, rootDirectory)) {
      if (matchGlob(fullPattern, filePath)) {
        results.push(filePath);
      }
    }
    return results.sort();
  }

  async selectDirectory(): Promise<string> {
    const handle = await window.showDirectoryPicker({ mode: "read" });
    this.directoryHandle = handle;
    this.directoryPath = `${BROWSER_PATH_PREFIX}${handle.name}`;
    this.saveHandles = new Map();
    return this.directoryPath;
  }

  async saveFile(path: string, content: string): Promise<void> {
    const fileHandle = this.saveHandles.get(path);
    if (fileHandle == null) {
      throw new Error(
        `保存先が見つかりません: ${path}。selectSaveLocation() を先に呼び出してください。`,
      );
    }
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  async selectSaveLocation(suggestedName: string): Promise<string> {
    const ext = suggestedName.includes(".")
      ? suggestedName.slice(suggestedName.lastIndexOf("."))
      : "";
    const mimeType = ext === ".json" ? "application/json" : "text/plain";
    const fileHandle = await window.showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: "ファイル",
          accept: { [mimeType]: [ext === "" ? "*" : ext] },
        },
      ],
    });
    const syntheticPath = `${BROWSER_PATH_PREFIX}save/${suggestedName}`;
    this.saveHandles.set(syntheticPath, fileHandle);
    return syntheticPath;
  }

  async selectAndReadTextFile(
    accept: string,
  ): Promise<{ name: string; content: string } | "cancelled"> {
    let fileHandles: FileSystemFileHandle[];
    try {
      fileHandles = await window.showOpenFilePicker({
        types: [
          {
            description: "テキストファイル",
            accept: { "text/*": [accept] },
          },
        ],
        multiple: false,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
      throw error;
    }
    const fileHandle = fileHandles[0];
    if (fileHandle == null) {
      return "cancelled";
    }
    const file = await fileHandle.getFile();
    const content = await file.text();
    return { name: file.name, content };
  }
}
