import type { ProjectData } from "../../types/project";
import type { Settings } from "../../types/settings";
import type { GlobTemplates, PersistenceService } from "./interface";

export class MockPersistenceService implements PersistenceService {
  private settings: Settings | "none" = "none";
  private project: ProjectData | "none" = "none";
  private appVersion: number | "none" = "none";
  private globTemplates: GlobTemplates | "none" = "none";

  async loadSettings(): Promise<Settings | "none"> {
    return this.settings;
  }

  async saveSettings(settings: Settings): Promise<void> {
    this.settings = settings;
  }

  async loadProject(): Promise<ProjectData | "none"> {
    return this.project;
  }

  async saveProject(project: ProjectData): Promise<void> {
    this.project = project;
  }

  async clearProject(): Promise<void> {
    this.project = "none";
  }

  async loadAppVersion(): Promise<number | "none"> {
    return this.appVersion;
  }

  async saveAppVersion(version: number): Promise<void> {
    this.appVersion = version;
  }

  async loadGlobTemplates(): Promise<GlobTemplates | "none"> {
    return this.globTemplates;
  }

  async saveGlobTemplates(templates: GlobTemplates): Promise<void> {
    this.globTemplates = templates;
  }
}
