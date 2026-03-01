import { shallowRef } from "vue";
import type {
  AutoScrollMode,
  DisplayMode,
  PlaybackSpeed,
  Settings,
} from "../../types/settings";
import { getAudioService } from "../audio/interface";
import { getPersistenceService } from "../persistence/persistence-service";
import type { SettingsService } from "./interface";

const INITIAL_SETTINGS: Settings = {
  displayMode: "wrap",
  autoScrollMode: "none",
  playbackSpeed: 1,
};

class SettingsServiceImpl implements SettingsService {
  private readonly _current = shallowRef<Settings>({ ...INITIAL_SETTINGS });

  get current(): Settings {
    return this._current.value;
  }

  setDisplayMode(mode: DisplayMode): void {
    this._current.value = { ...this._current.value, displayMode: mode };
    void this.persist();
  }

  setAutoScrollMode(mode: AutoScrollMode): void {
    this._current.value = { ...this._current.value, autoScrollMode: mode };
    void this.persist();
  }

  setPlaybackSpeed(speed: PlaybackSpeed): void {
    this._current.value = { ...this._current.value, playbackSpeed: speed };
    getAudioService().setPlaybackSpeed(speed);
    void this.persist();
  }

  async load(): Promise<void> {
    const stored = await getPersistenceService().loadSettings();
    if (stored === "none") {
      return;
    }
    this._current.value = stored;
    getAudioService().setPlaybackSpeed(stored.playbackSpeed);
  }

  private async persist(): Promise<void> {
    await getPersistenceService().saveSettings(this._current.value);
  }
}

export const settingsService: SettingsService = new SettingsServiceImpl();
