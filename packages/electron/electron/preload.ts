import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electronFs", {
  readTextFile(filePath: string): Promise<string> {
    return ipcRenderer.invoke("fs:read-text-file", filePath);
  },
  readBinaryFile(filePath: string): Promise<ArrayBuffer> {
    return ipcRenderer.invoke("fs:read-binary-file", filePath);
  },
  listFilesGlob(
    rootDirectory: string,
    globPattern: string,
  ): Promise<Array<string>> {
    return ipcRenderer.invoke("fs:list-files-glob", rootDirectory, globPattern);
  },
  selectDirectory(): Promise<string | "cancelled"> {
    return ipcRenderer.invoke("fs:select-directory");
  },
  saveFile(filePath: string, content: string): Promise<void> {
    return ipcRenderer.invoke("fs:save-file", filePath, content);
  },
  selectSaveLocation(suggestedName: string): Promise<string | "cancelled"> {
    return ipcRenderer.invoke("fs:select-save-location", suggestedName);
  },
  selectAndReadTextFile(
    accept: string,
  ): Promise<{ name: string; content: string } | "cancelled"> {
    return ipcRenderer.invoke("fs:select-and-read-text-file", accept);
  },
});
