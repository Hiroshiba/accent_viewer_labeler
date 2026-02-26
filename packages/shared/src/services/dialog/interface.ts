import type { Component, Raw } from "vue";

export interface DialogDescriptor {
  id: number;
  component: Raw<Component>;
  props: Record<string, unknown>;
  resolve: (value: unknown) => void;
}

export interface DialogService {
  readonly stack: ReadonlyArray<DialogDescriptor>;
  open<T>(
    component: Raw<Component>,
    props: Record<string, unknown>,
  ): Promise<T>;
  close(id: number, value: unknown): void;
}
