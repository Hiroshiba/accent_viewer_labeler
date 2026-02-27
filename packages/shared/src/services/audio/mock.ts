import type { AudioPlaybackState, AudioService } from "./interface";

export class MockAudioService implements AudioService {
  private _playbackState: AudioPlaybackState = "stopped";
  private _duration: number = 0;
  private _playbackSpeed: number = 1;
  private startOffset: number = 0;
  private startTimestamp: number = 0;
  private scheduledEndTime: number = 0;
  private timerId: ReturnType<typeof setTimeout> | "none" = "none";

  get playbackState(): AudioPlaybackState {
    return this._playbackState;
  }

  get currentTime(): number {
    if (this._playbackState === "stopped") {
      return 0;
    }
    const elapsed =
      (performance.now() / 1000 - this.startTimestamp) * this._playbackSpeed;
    return Math.min(this.startOffset + elapsed, this.scheduledEndTime);
  }

  get duration(): number {
    return this._duration;
  }

  async load(source: ArrayBuffer): Promise<void> {
    // 16bit mono 44100Hz の WAV として duration を推定する
    const dataSize = Math.max(0, source.byteLength - 44);
    this._duration = dataSize / (44100 * 2);
    this.stop();
  }

  play(startTime: number, endTime: number): void {
    this.stop();
    this.startOffset = startTime;
    this.startTimestamp = performance.now() / 1000;
    this.scheduledEndTime = endTime;
    this._playbackState = "playing";
    const durationMs = ((endTime - startTime) / this._playbackSpeed) * 1000;
    this.timerId = setTimeout(() => {
      this._playbackState = "stopped";
      this.timerId = "none";
    }, durationMs);
  }

  stop(): void {
    if (this.timerId !== "none") {
      clearTimeout(this.timerId);
      this.timerId = "none";
    }
    this._playbackState = "stopped";
  }

  setPlaybackSpeed(speed: number): void {
    this._playbackSpeed = speed;
  }
}
