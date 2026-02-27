import type { MoraInterval } from "../../types/accent";

export interface PlaybackController {
  readonly highlightedMora: number | "none";
  readonly isPlaying: boolean;
  playMoraRange(moraIntervals: Array<MoraInterval>, moraIndex: number): void;
  playPhraseRange(
    moraIntervals: Array<MoraInterval>,
    startMoraIndex: number,
    endMoraIndex: number,
  ): void;
  playFull(moraIntervals: Array<MoraInterval>): void;
  stop(): void;
}
