import type { UndoRedoCommand } from "../services/undo-redo/interface";
import { appStateService } from "../services/app-state/app-state-service";
import { computeMergeAccent, computeSplitAccent } from "./accent-logic";

/** アクセント句境界をトグルするコマンド（句分割または結合） */
export class ToggleBoundaryCommand implements UndoRedoCommand {
  private readonly newBoundaries: Array<number>;
  private readonly newAccentPosInPhrase: Array<number>;

  constructor(
    private readonly stem: string,
    moraIndex: number,
    private readonly currentBoundaries: Array<number>,
    private readonly currentAccentPosInPhrase: Array<number>,
  ) {
    const hasBoundary = currentBoundaries.includes(moraIndex);
    if (hasBoundary) {
      // 境界削除（結合）
      const boundaryPos = currentBoundaries.indexOf(moraIndex);
      this.newBoundaries = currentBoundaries.filter((b) => b !== moraIndex);
      const frontAccentPos = currentAccentPosInPhrase[boundaryPos];
      if (frontAccentPos == null) {
        throw new Error(`句 ${boundaryPos} のアクセント位置が見つかりません`);
      }
      const newAccentPos = computeMergeAccent(frontAccentPos);
      const merged = [...currentAccentPosInPhrase];
      merged.splice(boundaryPos, 2, newAccentPos);
      this.newAccentPosInPhrase = merged;
    } else {
      // 境界追加（分割）
      const insertPos = currentBoundaries.filter((b) => b < moraIndex).length;
      const newBoundaries = [...currentBoundaries];
      newBoundaries.splice(insertPos, 0, moraIndex);
      this.newBoundaries = newBoundaries;

      const phraseIdx = insertPos;
      const originalAccentPos = currentAccentPosInPhrase[phraseIdx];
      if (originalAccentPos == null) {
        throw new Error(`句 ${phraseIdx} のアクセント位置が見つかりません`);
      }
      const phraseStartMoraIndex =
        phraseIdx === 0 ? 0 : (currentBoundaries[phraseIdx - 1] ?? 0) + 1;
      const splitMoraIndex = moraIndex - phraseStartMoraIndex;
      const { frontAccentPos, backAccentPos } = computeSplitAccent(
        originalAccentPos,
        splitMoraIndex,
      );
      const newAccentPosInPhrase = [...currentAccentPosInPhrase];
      newAccentPosInPhrase.splice(phraseIdx, 1, frontAccentPos, backAccentPos);
      this.newAccentPosInPhrase = newAccentPosInPhrase;
    }
  }

  execute(): void {
    appStateService.setOverride(this.stem, {
      phraseBoundaries: this.newBoundaries,
      accentPosInPhrase: this.newAccentPosInPhrase,
    });
  }

  undo(): void {
    appStateService.setOverride(this.stem, {
      phraseBoundaries: this.currentBoundaries,
      accentPosInPhrase: this.currentAccentPosInPhrase,
    });
  }
}

/** アクセント位置を移動するコマンド */
export class MoveAccentCommand implements UndoRedoCommand {
  private readonly newAccentPosInPhrase: Array<number>;

  constructor(
    private readonly stem: string,
    phraseIndex: number,
    newAccentPos: number,
    private readonly currentBoundaries: Array<number>,
    private readonly currentAccentPosInPhrase: Array<number>,
  ) {
    const updated = [...currentAccentPosInPhrase];
    updated[phraseIndex] = newAccentPos;
    this.newAccentPosInPhrase = updated;
  }

  execute(): void {
    appStateService.setOverride(this.stem, {
      phraseBoundaries: this.currentBoundaries,
      accentPosInPhrase: this.newAccentPosInPhrase,
    });
  }

  undo(): void {
    appStateService.setOverride(this.stem, {
      phraseBoundaries: this.currentBoundaries,
      accentPosInPhrase: this.currentAccentPosInPhrase,
    });
  }
}
