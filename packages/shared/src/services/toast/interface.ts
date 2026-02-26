export type ToastLevel = "info" | "success" | "error";

export interface ToastItem {
  id: number;
  message: string;
  level: ToastLevel;
}

export interface ToastService {
  readonly items: ReadonlyArray<ToastItem>;
  show(message: string, level: ToastLevel, durationMs: number): void;
  dismiss(id: number): void;
}
