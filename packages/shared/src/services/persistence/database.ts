import Dexie, { type Table } from "dexie";

interface SettingsRow {
  id: "singleton";
  data: string;
}

interface ProjectRow {
  id: "singleton";
  data: string;
}

interface MetaRow {
  id: string;
  value: string;
}

interface GlobTemplatesRow {
  id: "singleton";
  data: string;
}

export class AppDatabase extends Dexie {
  settings!: Table<SettingsRow, string>;
  project!: Table<ProjectRow, string>;
  meta!: Table<MetaRow, string>;
  globTemplates!: Table<GlobTemplatesRow, string>;

  constructor() {
    super("accent-viewer-labeler");
    this.version(1).stores({
      settings: "id",
      project: "id",
      meta: "id",
      globTemplates: "id",
    });
  }
}
