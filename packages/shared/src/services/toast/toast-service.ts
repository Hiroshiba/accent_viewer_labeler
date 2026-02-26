import { shallowRef } from "vue";
import type { ToastItem, ToastLevel, ToastService } from "./interface";

class ToastServiceImpl implements ToastService {
  private readonly _items = shallowRef<Array<ToastItem>>([]);
  private _nextId = 0;

  get items(): ReadonlyArray<ToastItem> {
    return this._items.value;
  }

  show(message: string, level: ToastLevel, durationMs: number): void {
    const id = this._nextId;
    this._nextId += 1;
    const item: ToastItem = { id, message, level };
    this._items.value = [...this._items.value, item];
    setTimeout(() => {
      this.dismiss(id);
    }, durationMs);
  }

  dismiss(id: number): void {
    this._items.value = this._items.value.filter((item) => item.id !== id);
  }
}

export const toastService: ToastService = new ToastServiceImpl();
