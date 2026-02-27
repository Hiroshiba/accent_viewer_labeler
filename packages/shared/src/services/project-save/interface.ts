export interface ProjectSaveService {
  readonly isDirty: boolean;
  save(): Promise<void>;
  load(): Promise<void>;
  markSaved(json: string): void;
}
