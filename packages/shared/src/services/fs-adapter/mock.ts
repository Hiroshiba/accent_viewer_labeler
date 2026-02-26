import { ParseError } from "../../errors";
import {
  createMockFileSystem,
  MOCK_ROOT_DIRECTORY,
} from "../../mock-data/samples";
import type { FsAdapter } from "./interface";

function matchGlob(pattern: string, filePath: string): boolean {
  // シンプルなグロブマッチング: * はパス区切り以外、** は任意のパス
  const parts = pattern.split("**");
  const regexParts = parts.map((part) =>
    part.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*"),
  );
  const regexStr = regexParts.join(".*");
  return new RegExp(`^${regexStr}$`).test(filePath);
}

export class MockFsAdapter implements FsAdapter {
  private readonly files: Map<string, string | ArrayBuffer>;
  private readonly savedFiles: Map<string, string>;

  constructor() {
    this.files = createMockFileSystem();
    this.savedFiles = new Map();
  }

  async readTextFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (content == null) {
      throw new ParseError(`ファイルが見つかりません: ${path}`);
    }
    if (content instanceof ArrayBuffer) {
      throw new ParseError(
        `バイナリファイルをテキストとして読もうとしました: ${path}`,
      );
    }
    return content;
  }

  async readBinaryFile(path: string): Promise<ArrayBuffer> {
    const content = this.files.get(path);
    if (content == null) {
      throw new ParseError(`ファイルが見つかりません: ${path}`);
    }
    if (typeof content === "string") {
      throw new ParseError(
        `テキストファイルをバイナリとして読もうとしました: ${path}`,
      );
    }
    return content;
  }

  async listFilesGlob(
    rootDirectory: string,
    globPattern: string,
  ): Promise<Array<string>> {
    const results: Array<string> = [];
    const fullPattern = `${rootDirectory}/${globPattern}`;
    for (const filePath of this.files.keys()) {
      if (matchGlob(fullPattern, filePath)) {
        results.push(filePath);
      }
    }
    return results.sort();
  }

  async selectDirectory(): Promise<string> {
    return MOCK_ROOT_DIRECTORY;
  }

  async saveFile(path: string, content: string): Promise<void> {
    this.savedFiles.set(path, content);
  }

  async selectSaveLocation(suggestedName: string): Promise<string> {
    return `${MOCK_ROOT_DIRECTORY}/${suggestedName}`;
  }
}
