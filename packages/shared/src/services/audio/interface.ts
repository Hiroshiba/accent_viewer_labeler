export type AudioPlaybackState = "playing" | "stopped";

export interface AudioService {
  load(source: ArrayBuffer): Promise<void>;
  play(startTime: number, endTime: number): void;
  stop(): void;
  setPlaybackSpeed(speed: number): void;
  readonly playbackState: AudioPlaybackState;
  readonly currentTime: number;
  readonly duration: number;
}

let currentService: AudioService | "unset" = "unset";

export function setAudioService(service: AudioService): void {
  currentService = service;
}

export function getAudioService(): AudioService {
  if (currentService === "unset") {
    throw new Error(
      "AudioService が未設定です。setAudioService() を呼び出してください。",
    );
  }
  return currentService;
}
