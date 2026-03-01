import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import fg from "fast-glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function toNativePath(internalPath: string): string {
  return internalPath.split("/").join(path.sep);
}

function toInternalPath(nativePath: string): string {
  return nativePath.split(path.sep).join("/");
}

function createWindow(): void {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  if (VITE_DEV_SERVER_URL) {
    void win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    void win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

function registerIpcHandlers(): void {
  ipcMain.handle(
    "fs:read-text-file",
    async (_event, filePath: string): Promise<string> => {
      return readFile(toNativePath(filePath), "utf-8");
    },
  );

  ipcMain.handle(
    "fs:read-binary-file",
    async (_event, filePath: string): Promise<ArrayBuffer> => {
      const buffer = await readFile(toNativePath(filePath));
      return buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      );
    },
  );

  ipcMain.handle(
    "fs:list-files-glob",
    async (
      _event,
      rootDirectory: string,
      globPattern: string,
    ): Promise<Array<string>> => {
      const nativeRoot = toNativePath(rootDirectory);
      const matches = await fg(globPattern, {
        cwd: nativeRoot,
        absolute: true,
      });
      return matches.map(toInternalPath).sort();
    },
  );

  ipcMain.handle(
    "fs:select-directory",
    async (): Promise<string | "cancelled"> => {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
      if (result.canceled || result.filePaths.length === 0) {
        return "cancelled";
      }
      const selected = result.filePaths[0];
      if (selected == null) {
        return "cancelled";
      }
      return toInternalPath(selected);
    },
  );

  ipcMain.handle(
    "fs:save-file",
    async (_event, filePath: string, content: string): Promise<void> => {
      await writeFile(toNativePath(filePath), content, "utf-8");
    },
  );

  ipcMain.handle(
    "fs:select-save-location",
    async (_event, suggestedName: string): Promise<string | "cancelled"> => {
      const result = await dialog.showSaveDialog({
        defaultPath: suggestedName,
      });
      if (result.canceled || result.filePath == null) {
        return "cancelled";
      }
      return toInternalPath(result.filePath);
    },
  );

  ipcMain.handle(
    "fs:select-and-read-text-file",
    async (
      _event,
      accept: string,
    ): Promise<{ name: string; content: string } | "cancelled"> => {
      const ext = accept.startsWith(".") ? accept.slice(1) : accept;
      const result = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "テキストファイル", extensions: [ext] }],
      });
      if (result.canceled || result.filePaths.length === 0) {
        return "cancelled";
      }
      const filePath = result.filePaths[0];
      if (filePath == null) {
        return "cancelled";
      }
      const content = await readFile(filePath, "utf-8");
      const name = path.basename(filePath);
      return { name, content };
    },
  );
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});
