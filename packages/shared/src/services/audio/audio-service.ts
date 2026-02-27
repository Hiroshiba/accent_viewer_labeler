import type { AudioPlaybackState, AudioService } from "./interface";

class AudioServiceImpl implements AudioService {
  private audioContext: AudioContext | "unloaded" = "unloaded";
  private audioBuffer: AudioBuffer | "unloaded" = "unloaded";
  private sourceNode: AudioBufferSourceNode | "none" = "none";
  private startOffset: number = 0;
  private startTimestamp: number = 0;
  private scheduledEndTime: number = 0;
  private _playbackState: AudioPlaybackState = "stopped";
  private _playbackSpeed: number = 1;

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
    if (this.audioBuffer === "unloaded") {
      return 0;
    }
    return this.audioBuffer.duration;
  }

  async load(source: ArrayBuffer): Promise<void> {
    const ctx = new AudioContext();
    const buffer = await ctx.decodeAudioData(source);
    if (this.audioContext !== "unloaded") {
      this.stop();
      void this.audioContext.close();
    }
    this.audioContext = ctx;
    this.audioBuffer = buffer;
    this._playbackState = "stopped";
  }

  play(startTime: number, endTime: number): void {
    if (this.audioContext === "unloaded" || this.audioBuffer === "unloaded") {
      throw new Error("音声が読み込まれていません");
    }
    this.stop();
    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;
    source.playbackRate.value = this._playbackSpeed;
    source.connect(this.audioContext.destination);
    const duration = endTime - startTime;
    source.start(0, startTime, duration);
    source.onended = () => {
      this._playbackState = "stopped";
      this.sourceNode = "none";
    };
    this.sourceNode = source;
    this.startOffset = startTime;
    this.startTimestamp = performance.now() / 1000;
    this.scheduledEndTime = endTime;
    this._playbackState = "playing";
  }

  stop(): void {
    if (this.sourceNode !== "none") {
      this.sourceNode.onended = null;
      this.sourceNode.stop();
      this.sourceNode.disconnect();
      this.sourceNode = "none";
    }
    this._playbackState = "stopped";
  }

  setPlaybackSpeed(speed: number): void {
    this._playbackSpeed = speed;
    if (this.sourceNode !== "none") {
      this.sourceNode.playbackRate.value = speed;
    }
  }
}

export const audioService: AudioService = new AudioServiceImpl();
