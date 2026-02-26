export interface UndoRedoCommand {
  execute(): void;
  undo(): void;
}

export interface UndoRedoService {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  push(command: UndoRedoCommand): void;
  undo(): void;
  redo(): void;
  clear(): void;
}
