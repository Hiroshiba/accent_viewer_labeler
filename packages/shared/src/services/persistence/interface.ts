import { z } from "zod";
import type { ProjectData } from "../../types/project";
import type { Settings } from "../../types/settings";

export const globTemplatesSchema = z.object({
  globLab: z.string(),
  globStartAccent: z.string(),
  globEndAccent: z.string(),
  globStartAccentPhrase: z.string(),
  globEndAccentPhrase: z.string(),
  globAudio: z.string(),
});

export type GlobTemplates = z.infer<typeof globTemplatesSchema>;

export interface PersistenceService {
  loadSettings(): Promise<Settings | "none">;
  saveSettings(settings: Settings): Promise<void>;
  loadProject(): Promise<ProjectData | "none">;
  saveProject(project: ProjectData): Promise<void>;
  clearProject(): Promise<void>;
  loadAppVersion(): Promise<number | "none">;
  saveAppVersion(version: number): Promise<void>;
  loadGlobTemplates(): Promise<GlobTemplates | "none">;
  saveGlobTemplates(templates: GlobTemplates): Promise<void>;
}
