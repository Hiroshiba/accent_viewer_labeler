/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string;
    VITE_PUBLIC: string;
  }
}

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

interface Window {
  electronFs: ElectronFsApi;
}
