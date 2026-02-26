import { shallowRef, type Component, type Raw } from "vue";
import type { DialogDescriptor, DialogService } from "./interface";

class DialogServiceImpl implements DialogService {
  private readonly _stack = shallowRef<Array<DialogDescriptor>>([]);
  private _nextId = 0;

  get stack(): ReadonlyArray<DialogDescriptor> {
    return this._stack.value;
  }

  open<T>(
    component: Raw<Component>,
    props: Record<string, unknown>,
  ): Promise<T> {
    return new Promise<T>((resolve) => {
      const id = this._nextId;
      this._nextId += 1;
      const descriptor: DialogDescriptor = {
        id,
        component,
        props,
        resolve: resolve as (value: unknown) => void,
      };
      this._stack.value = [...this._stack.value, descriptor];
    });
  }

  close(id: number, value: unknown): void {
    const descriptor = this._stack.value.find((d) => d.id === id);
    if (descriptor == null) {
      throw new Error(`ダイアログ ID ${String(id)} が見つかりません`);
    }
    descriptor.resolve(value);
    this._stack.value = this._stack.value.filter((d) => d.id !== id);
  }
}

export const dialogService: DialogService = new DialogServiceImpl();
