import type {
  AutoScrollMode,
  DisplayMode,
  PlaybackSpeed,
  Settings,
} from "../../types/settings";

export interface SettingsService {
  readonly current: Settings;
  setDisplayMode(mode: DisplayMode): void;
  setAutoScrollMode(mode: AutoScrollMode): void;
  setPlaybackSpeed(speed: PlaybackSpeed): void;
  load(): Promise<void>;
}
