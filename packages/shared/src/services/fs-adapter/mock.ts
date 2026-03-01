import { ParseError } from "../../errors";
import {
  createMockFileSystem,
  MOCK_ROOT_DIRECTORY,
} from "../../mock-data/samples";
import { matchGlob } from "./glob-match";
import type { FsAdapter } from "./interface";

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

  async selectAndReadTextFile(
    accept: string,
  ): Promise<{ name: string; content: string } | "cancelled"> {
    for (const [path, content] of this.savedFiles.entries()) {
      if (path.endsWith(accept.replace(/^\./, ""))) {
        const name = path.split("/").pop() ?? path;
        return { name, content };
      }
    }
    return "cancelled";
  }
}
