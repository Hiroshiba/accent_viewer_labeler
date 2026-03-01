<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { matchAudioToStems } from "../../domain/audio-glob";
import { UnreachableError } from "../../errors";
import { appStateService } from "../../services/app-state/app-state-service";
import { getFsAdapter } from "../../services/fs-adapter/interface";
import AppDialog from "./AppDialog.vue";

const props = defineProps<{ open: boolean }>();

type AudioGlobResult =
  | {
      globAudio: string;
      audioFiles: Record<string, string>;
      unmatchedCount: number;
    }
  | "cancelled";

const emit = defineEmits<{
  resolve: [value: AudioGlobResult];
}>();

const editingState = computed(() => {
  const state = appStateService.state;
  if (state.phase !== "editing") {
    throw new UnreachableError(state as never);
  }
  return state;
});

const globAudio = ref("");

type SearchState =
  | { status: "idle" }
  | { status: "searching" }
  | {
      status: "done";
      matchedCount: number;
      unmatchedCount: number;
      audioFiles: Record<string, string>;
    };

const searchState = ref<SearchState>({ status: "idle" });

onMounted(() => {
  globAudio.value = editingState.value.project.meta.globAudio;
});

async function onSearch(): Promise<void> {
  const pattern = globAudio.value;
  if (pattern === "") {
    searchState.value = {
      status: "done",
      matchedCount: 0,
      unmatchedCount: editingState.value.project.stems.length,
      audioFiles: {},
    };
    return;
  }
  searchState.value = { status: "searching" };
  const rootDir = editingState.value.project.meta.rootDirectory;
  const files = await getFsAdapter().listFilesGlob(rootDir, pattern);
  const { audioFiles, unmatchedCount } = matchAudioToStems(
    editingState.value.project.stems,
    files,
  );
  searchState.value = {
    status: "done",
    matchedCount: Object.keys(audioFiles).length,
    unmatchedCount,
    audioFiles,
  };
}

function onApply(): void {
  const state = searchState.value;
  if (state.status !== "done") {
    return;
  }
  emit("resolve", {
    globAudio: globAudio.value,
    audioFiles: state.audioFiles,
    unmatchedCount: state.unmatchedCount,
  });
}
</script>

<template>
  <AppDialog
    :open="props.open"
    title="音声ファイルの設定"
    max-width="max-w-lg"
    @close="emit('resolve', 'cancelled')"
  >
    <template #body>
      <div class="space-y-4">
        <div>
          <p class="mb-2 text-sm font-medium text-gray-700">
            音声ファイルの glob パターン
          </p>
          <div class="flex gap-2">
            <input
              v-model="globAudio"
              type="text"
              placeholder="例: audio/**/*.wav"
              class="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
            />
            <button
              type="button"
              class="shrink-0 rounded bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
              @click="onSearch"
            >
              検索
            </button>
          </div>
        </div>

        <div
          v-if="searchState.status === 'searching'"
          class="text-sm text-gray-500"
        >
          検索中…
        </div>

        <div
          v-else-if="searchState.status === 'done'"
          class="space-y-1 text-sm text-gray-600"
        >
          <p>マッチ: {{ searchState.matchedCount }} 件</p>
          <p v-if="searchState.unmatchedCount > 0">
            音声なし: {{ searchState.unmatchedCount }} 件
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <button
        type="button"
        class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="searchState.status !== 'done'"
        @click="onApply"
      >
        適用
      </button>
      <button
        type="button"
        class="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        @click="emit('resolve', 'cancelled')"
      >
        キャンセル
      </button>
    </template>
  </AppDialog>
</template>
