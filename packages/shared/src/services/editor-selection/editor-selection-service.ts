import { shallowRef } from "vue";
import type { EditorSelectionService } from "./interface";

class EditorSelectionServiceImpl implements EditorSelectionService {
  private readonly _selectedMora = shallowRef<number | "none">("none");
  private readonly _selectedPhrase = shallowRef<number | "none">("none");

  get selectedMora(): number | "none" {
    return this._selectedMora.value;
  }

  get selectedPhrase(): number | "none" {
    return this._selectedPhrase.value;
  }

  selectMora(moraIndex: number): void {
    this._selectedMora.value = moraIndex;
  }

  deselectMora(): void {
    this._selectedMora.value = "none";
  }

  selectPhrase(phraseIndex: number): void {
    this._selectedPhrase.value = phraseIndex;
  }

  deselectPhrase(): void {
    this._selectedPhrase.value = "none";
  }

  clearAll(): void {
    this._selectedMora.value = "none";
    this._selectedPhrase.value = "none";
  }
}

export const editorSelectionService: EditorSelectionService =
  new EditorSelectionServiceImpl();
