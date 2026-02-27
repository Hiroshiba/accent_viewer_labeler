import { shallowRef } from "vue";
import type { MoraInterval } from "../../types/accent";
import {
  computeFullPlaybackRange,
  computeMoraPlaybackRange,
  computePhrasePlaybackRange,
  findMoraAtTime,
} from "../../domain/playback-range";
import { getAudioService } from "../audio/interface";
import type { PlaybackController } from "./interface";

class PlaybackControllerImpl implements PlaybackController {
  private readonly _highlightedMora = shallowRef<number | "none">("none");
  private readonly _isPlaying = shallowRef(false);
  private animationFrameId: number | "none" = "none";
  private currentMoraIntervals: Array<MoraInterval> = [];

  get highlightedMora(): number | "none" {
    return this._highlightedMora.value;
  }

  get isPlaying(): boolean {
    return this._isPlaying.value;
  }

  playMoraRange(moraIntervals: Array<MoraInterval>, moraIndex: number): void {
    const { startTime, endTime } = computeMoraPlaybackRange(
      moraIntervals,
      moraIndex,
    );
    this.startPlay(moraIntervals, startTime, endTime);
  }

  playPhraseRange(
    moraIntervals: Array<MoraInterval>,
    startMoraIndex: number,
    endMoraIndex: number,
  ): void {
    const { startTime, endTime } = computePhrasePlaybackRange(
      moraIntervals,
      startMoraIndex,
      endMoraIndex,
    );
    this.startPlay(moraIntervals, startTime, endTime);
  }

  playFull(moraIntervals: Array<MoraInterval>): void {
    const { startTime, endTime } = computeFullPlaybackRange(moraIntervals);
    this.startPlay(moraIntervals, startTime, endTime);
  }

  stop(): void {
    getAudioService().stop();
    this.stopHighlightLoop();
    this._isPlaying.value = false;
    this._highlightedMora.value = "none";
  }

  private startPlay(
    moraIntervals: Array<MoraInterval>,
    startTime: number,
    endTime: number,
  ): void {
    this.stopHighlightLoop();
    this.currentMoraIntervals = moraIntervals;
    getAudioService().play(startTime, endTime);
    this._isPlaying.value = true;
    this.startHighlightLoop();
  }

  private startHighlightLoop(): void {
    const tick = (): void => {
      const audio = getAudioService();
      if (audio.playbackState === "stopped") {
        this._isPlaying.value = false;
        this._highlightedMora.value = "none";
        this.animationFrameId = "none";
        return;
      }
      this._highlightedMora.value = findMoraAtTime(
        this.currentMoraIntervals,
        audio.currentTime,
      );
      this.animationFrameId = requestAnimationFrame(tick);
    };
    this.animationFrameId = requestAnimationFrame(tick);
  }

  private stopHighlightLoop(): void {
    if (this.animationFrameId !== "none") {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = "none";
    }
  }
}

export const playbackController: PlaybackController =
  new PlaybackControllerImpl();
