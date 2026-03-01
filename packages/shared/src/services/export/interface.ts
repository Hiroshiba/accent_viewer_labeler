export interface ExportService {
  exportCurrent(): Promise<void>;
  exportBulk(): Promise<void>;
}
