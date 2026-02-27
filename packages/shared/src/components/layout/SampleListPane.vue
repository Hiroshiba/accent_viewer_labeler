<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/20/solid";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { UnreachableError } from "../../errors";
import { actionService } from "../../services/action/action-service";
import { appStateService } from "../../services/app-state/app-state-service";

type FilterMode = "all" | "unchecked";

const searchQuery = ref("");
const filterMode = ref<FilterMode>("all");
const searchInputRef = ref<HTMLInputElement | null>(null);
const stemRefs = new Map<string, Element>();

const editingState = computed(() => {
  const state = appStateService.state;
  if (state.phase !== "editing") {
    throw new UnreachableError(state as never);
  }
  return state;
});

const filteredStems = computed(() => {
  const { project } = editingState.value;
  let stems = project.stems;

  if (filterMode.value === "unchecked") {
    stems = stems.filter((s) => project.checked[s] == null);
  }

  if (searchQuery.value.length > 0) {
    const query = searchQuery.value.toLowerCase();
    stems = stems.filter((s) => s.toLowerCase().includes(query));
  }

  return stems;
});

function setStemRef(stem: string, el: unknown): void {
  if (el instanceof Element) {
    stemRefs.set(stem, el);
  } else {
    stemRefs.delete(stem);
  }
}

function selectStem(stem: string): void {
  const previousStem = editingState.value.currentStem;
  if (previousStem !== stem) {
    appStateService.markChecked(previousStem);
  }
  appStateService.setCurrentStem(stem);
}

function moveToNext(): void {
  const stems = filteredStems.value;
  const currentIndex = stems.indexOf(editingState.value.currentStem);
  if (currentIndex === -1 || currentIndex >= stems.length - 1) {
    return;
  }
  const next = stems[currentIndex + 1];
  if (next == null) {
    return;
  }
  selectStem(next);
}

function moveToPrev(): void {
  const stems = filteredStems.value;
  const currentIndex = stems.indexOf(editingState.value.currentStem);
  if (currentIndex <= 0) {
    return;
  }
  const prev = stems[currentIndex - 1];
  if (prev == null) {
    return;
  }
  selectStem(prev);
}

function clearSearch(): void {
  searchQuery.value = "";
  if (searchInputRef.value != null) {
    searchInputRef.value.blur();
  }
}

watch(
  () => editingState.value.currentStem,
  (newStem) => {
    nextTick(() => {
      const el = stemRefs.get(newStem);
      if (el != null) {
        el.scrollIntoView({ block: "nearest" });
      }
    });
  },
);

onMounted(() => {
  actionService.register({
    id: "sample-list:next",
    label: "次のサンプル",
    shortcut: "J",
    handler: moveToNext,
    enabled: () => appStateService.state.phase === "editing",
  });
  actionService.register({
    id: "sample-list:prev",
    label: "前のサンプル",
    shortcut: "K",
    handler: moveToPrev,
    enabled: () => appStateService.state.phase === "editing",
  });
  actionService.register({
    id: "sample-list:clear-search",
    label: "検索クリア",
    shortcut: "Escape",
    handler: clearSearch,
    enabled: () =>
      searchQuery.value.length > 0 ||
      document.activeElement === searchInputRef.value,
  });
});

onUnmounted(() => {
  actionService.unregister("sample-list:next");
  actionService.unregister("sample-list:prev");
  actionService.unregister("sample-list:clear-search");
});
</script>

<template>
  <aside
    class="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-gray-50"
  >
    <div class="flex flex-col gap-2 border-b border-gray-200 p-3">
      <input
        ref="searchInputRef"
        v-model="searchQuery"
        type="search"
        placeholder="検索..."
        class="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
      />
      <div class="flex gap-1">
        <button
          type="button"
          :class="
            filterMode === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          "
          class="flex-1 rounded border border-gray-300 px-2 py-0.5 text-xs"
          @click="filterMode = 'all'"
        >
          全件
        </button>
        <button
          type="button"
          :class="
            filterMode === 'unchecked'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          "
          class="flex-1 rounded border border-gray-300 px-2 py-0.5 text-xs"
          @click="filterMode = 'unchecked'"
        >
          未確認
        </button>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto">
      <button
        v-for="stem in filteredStems"
        :key="stem"
        :ref="(el) => setStemRef(stem, el)"
        type="button"
        :class="
          stem === editingState.currentStem
            ? 'bg-blue-100 text-blue-900'
            : 'text-gray-700 hover:bg-gray-100'
        "
        class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm"
        @click="selectStem(stem)"
      >
        <CheckIcon
          v-if="editingState.project.checked[stem] != null"
          class="h-3.5 w-3.5 shrink-0 text-green-500"
        />
        <span v-else class="h-3.5 w-3.5 shrink-0" />
        <span class="truncate">{{ stem }}</span>
      </button>
    </div>
    <div class="border-t border-gray-200 px-3 py-1.5 text-xs text-gray-400">
      {{ filteredStems.length }} / {{ editingState.project.stems.length }} 件
    </div>
  </aside>
</template>
