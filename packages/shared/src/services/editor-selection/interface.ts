export interface EditorSelectionService {
  readonly selectedMora: number | "none";
  readonly selectedPhrase: number | "none";
  selectMora(moraIndex: number): void;
  deselectMora(): void;
  selectPhrase(phraseIndex: number): void;
  deselectPhrase(): void;
  clearAll(): void;
}
