<script setup lang="ts">
import { PlayIcon, StopIcon } from "@heroicons/vue/20/solid";
import { computed, ref } from "vue";
import { UnreachableError } from "../../errors";
import { appStateService } from "../../services/app-state/app-state-service";
import { getAudioService } from "../../services/audio/interface";
import { playbackController } from "../../services/playback/playback-controller";
import type { PlaybackSpeed } from "../../types/settings";
import { playbackSpeedValues } from "../../types/settings";

const editingState = computed(() => {
  const state = appStateService.state;
  if (state.phase !== "editing") {
    throw new UnreachableError(state as never);
  }
  return state;
});

const hasAudio = computed(() => {
  const { project, currentStem } = editingState.value;
  return project.audioFiles[currentStem] != null;
});

const isPlaying = computed(() => playbackController.isPlaying);

// ステップ17でグローバル設定と統合するまでの暫定管理
const currentSpeed = ref<PlaybackSpeed>(1);

function togglePlayStop(): void {
  if (!hasAudio.value) {
    return;
  }
  if (isPlaying.value) {
    playbackController.stop();
  }
}

function setSpeed(speed: PlaybackSpeed): void {
  currentSpeed.value = speed;
  getAudioService().setPlaybackSpeed(speed);
}
</script>

<template>
  <div
    class="flex h-12 shrink-0 items-center gap-3 border-b border-gray-200 px-4"
  >
    <button
      type="button"
      :disabled="!hasAudio"
      class="flex items-center justify-center rounded p-1 disabled:cursor-not-allowed disabled:opacity-40"
      :class="hasAudio ? 'hover:bg-gray-100' : ''"
      @click="togglePlayStop"
    >
      <StopIcon v-if="isPlaying" class="h-5 w-5 text-gray-700" />
      <PlayIcon v-else class="h-5 w-5 text-gray-700" />
    </button>
    <div class="flex gap-1">
      <button
        v-for="speed in playbackSpeedValues"
        :key="speed"
        type="button"
        :disabled="!hasAudio"
        :class="
          currentSpeed === speed
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40'
        "
        class="rounded border border-gray-300 px-2 py-0.5 text-xs disabled:cursor-not-allowed"
        @click="setSpeed(speed)"
      >
        {{ speed }}x
      </button>
    </div>
  </div>
</template>
