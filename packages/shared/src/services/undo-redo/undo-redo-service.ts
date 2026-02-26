import { shallowRef } from "vue";
import type { UndoRedoCommand, UndoRedoService } from "./interface";

class UndoRedoServiceImpl implements UndoRedoService {
  private readonly _undoStack = shallowRef<Array<UndoRedoCommand>>([]);
  private readonly _redoStack = shallowRef<Array<UndoRedoCommand>>([]);

  get canUndo(): boolean {
    return this._undoStack.value.length > 0;
  }

  get canRedo(): boolean {
    return this._redoStack.value.length > 0;
  }

  push(command: UndoRedoCommand): void {
    command.execute();
    this._undoStack.value = [...this._undoStack.value, command];
    this._redoStack.value = [];
  }

  undo(): void {
    const stack = this._undoStack.value;
    if (stack.length === 0) {
      return;
    }
    const command = stack[stack.length - 1];
    if (command == null) {
      throw new Error("スタックの末尾要素が取得できません");
    }
    command.undo();
    this._undoStack.value = stack.slice(0, -1);
    this._redoStack.value = [...this._redoStack.value, command];
  }

  redo(): void {
    const stack = this._redoStack.value;
    if (stack.length === 0) {
      return;
    }
    const command = stack[stack.length - 1];
    if (command == null) {
      throw new Error("スタックの末尾要素が取得できません");
    }
    command.execute();
    this._redoStack.value = stack.slice(0, -1);
    this._undoStack.value = [...this._undoStack.value, command];
  }

  clear(): void {
    this._undoStack.value = [];
    this._redoStack.value = [];
  }
}

export const undoRedoService: UndoRedoService = new UndoRedoServiceImpl();
