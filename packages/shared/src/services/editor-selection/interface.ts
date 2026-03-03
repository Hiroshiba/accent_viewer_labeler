export interface EditorSelectionService {
  readonly selectedMora: number | "none";
  readonly selectedPhrase: number | "none";
  selectMora(moraIndex: number): void;
  selectPhrase(phraseIndex: number): void;
  clearAll(): void;
}
