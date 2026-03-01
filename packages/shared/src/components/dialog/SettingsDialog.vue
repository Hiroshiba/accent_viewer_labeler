<script setup lang="ts">
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";
import { computed } from "vue";
import { settingsService } from "../../services/settings/settings-service";
import type {
  AutoScrollMode,
  DisplayMode,
  PlaybackSpeed,
} from "../../types/settings";
import {
  autoScrollModeValues,
  displayModeValues,
  playbackSpeedValues,
} from "../../types/settings";
import AppDialog from "./AppDialog.vue";

const props = defineProps<{ open: boolean }>();

const emit = defineEmits<{ resolve: [value: void] }>();

const displayMode = computed(() => settingsService.current.displayMode);
const autoScrollMode = computed(() => settingsService.current.autoScrollMode);
const playbackSpeed = computed(() => settingsService.current.playbackSpeed);

const displayModeLabels: Record<DisplayMode, string> = {
  wrap: "折り返し",
  "horizontal-scroll": "横スクロール",
};

const autoScrollModeLabels: Record<AutoScrollMode, string> = {
  none: "しない",
  "follow-offscreen": "画面外で追従",
  "always-center": "常に中心",
};

function onDisplayModeChange(mode: DisplayMode): void {
  settingsService.setDisplayMode(mode);
}

function onAutoScrollModeChange(mode: AutoScrollMode): void {
  settingsService.setAutoScrollMode(mode);
}

function onPlaybackSpeedChange(speed: PlaybackSpeed): void {
  settingsService.setPlaybackSpeed(speed);
}
</script>

<template>
  <AppDialog :open="props.open" title="設定" @close="emit('resolve')">
    <template #body>
      <div class="space-y-5">
        <RadioGroup
          :model-value="displayMode"
          @update:model-value="onDisplayModeChange"
        >
          <RadioGroupLabel class="text-sm font-medium text-gray-700"
            >表示モード</RadioGroupLabel
          >
          <div class="mt-2 flex gap-2">
            <RadioGroupOption
              v-for="mode in displayModeValues"
              :key="mode"
              v-slot="{ checked }"
              :value="mode"
              as="template"
            >
              <button
                type="button"
                :class="
                  checked
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                "
                class="rounded border px-3 py-1.5 text-sm"
              >
                {{ displayModeLabels[mode] }}
              </button>
            </RadioGroupOption>
          </div>
        </RadioGroup>

        <RadioGroup
          :model-value="autoScrollMode"
          @update:model-value="onAutoScrollModeChange"
        >
          <RadioGroupLabel class="text-sm font-medium text-gray-700"
            >自動スクロール</RadioGroupLabel
          >
          <div class="mt-2 flex flex-wrap gap-2">
            <RadioGroupOption
              v-for="mode in autoScrollModeValues"
              :key="mode"
              v-slot="{ checked }"
              :value="mode"
              as="template"
            >
              <button
                type="button"
                :class="
                  checked
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                "
                class="rounded border px-3 py-1.5 text-sm"
              >
                {{ autoScrollModeLabels[mode] }}
              </button>
            </RadioGroupOption>
          </div>
        </RadioGroup>

        <RadioGroup
          :model-value="playbackSpeed"
          @update:model-value="onPlaybackSpeedChange"
        >
          <RadioGroupLabel class="text-sm font-medium text-gray-700"
            >再生速度</RadioGroupLabel
          >
          <div class="mt-2 flex flex-wrap gap-2">
            <RadioGroupOption
              v-for="speed in playbackSpeedValues"
              :key="speed"
              v-slot="{ checked }"
              :value="speed"
              as="template"
            >
              <button
                type="button"
                :class="
                  checked
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                "
                class="rounded border px-3 py-1.5 text-sm"
              >
                {{ speed }}x
              </button>
            </RadioGroupOption>
          </div>
        </RadioGroup>
      </div>
    </template>
    <template #footer>
      <button
        type="button"
        class="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        @click="emit('resolve')"
      >
        閉じる
      </button>
    </template>
  </AppDialog>
</template>
