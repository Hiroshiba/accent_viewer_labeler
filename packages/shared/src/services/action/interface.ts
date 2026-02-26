export type ActionId = string;

export interface ActionBinding {
  id: ActionId;
  label: string;
  shortcut: string;
  handler: () => void;
  enabled: () => boolean;
}

export interface ActionService {
  register(binding: ActionBinding): void;
  unregister(id: ActionId): void;
  execute(id: ActionId): void;
  startListening(): void;
  stopListening(): void;
}
