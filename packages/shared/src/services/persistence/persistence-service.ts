import { projectDataSchema, type ProjectData } from "../../types/project";
import { settingsSchema, type Settings } from "../../types/settings";
import { AppDatabase } from "./database";
import {
  globTemplatesSchema,
  type GlobTemplates,
  type PersistenceService,
} from "./interface";

class PersistenceServiceImpl implements PersistenceService {
  private readonly db: AppDatabase;

  constructor() {
    this.db = new AppDatabase();
  }

  async loadSettings(): Promise<Settings | "none"> {
    const row = await this.db.settings.get("singleton");
    if (row == null) {
      return "none";
    }
    return settingsSchema.parse(JSON.parse(row.data));
  }

  async saveSettings(settings: Settings): Promise<void> {
    await this.db.settings.put({
      id: "singleton",
      data: JSON.stringify(settings),
    });
  }

  async loadProject(): Promise<ProjectData | "none"> {
    const row = await this.db.project.get("singleton");
    if (row == null) {
      return "none";
    }
    return projectDataSchema.parse(JSON.parse(row.data));
  }

  async saveProject(project: ProjectData): Promise<void> {
    await this.db.project.put({
      id: "singleton",
      data: JSON.stringify(project),
    });
  }

  async clearProject(): Promise<void> {
    await this.db.project.delete("singleton");
  }

  async loadAppVersion(): Promise<number | "none"> {
    const row = await this.db.meta.get("appVersion");
    if (row == null) {
      return "none";
    }
    return Number(row.value);
  }

  async saveAppVersion(version: number): Promise<void> {
    await this.db.meta.put({ id: "appVersion", value: String(version) });
  }

  async loadGlobTemplates(): Promise<GlobTemplates | "none"> {
    const row = await this.db.globTemplates.get("singleton");
    if (row == null) {
      return "none";
    }
    return globTemplatesSchema.parse(JSON.parse(row.data));
  }

  async saveGlobTemplates(templates: GlobTemplates): Promise<void> {
    await this.db.globTemplates.put({
      id: "singleton",
      data: JSON.stringify(templates),
    });
  }
}

let currentService: PersistenceService | "unset" = "unset";

export function setPersistenceService(service: PersistenceService): void {
  currentService = service;
}

export function getPersistenceService(): PersistenceService {
  if (currentService === "unset") {
    throw new Error(
      "PersistenceService が未設定です。setPersistenceService() を呼び出してください。",
    );
  }
  return currentService;
}

export const persistenceService: PersistenceService =
  new PersistenceServiceImpl();
