<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue";
import type { BuildProjectInput } from "../../domain/project-builder";
import { buildProjectData } from "../../domain/project-builder";
import { getFsAdapter } from "../../services/fs-adapter/interface";
import { getPersistenceService } from "../../services/persistence/persistence-service";
import { toastService } from "../../services/toast/toast-service";
import type { ProjectData } from "../../types/project";
import AppDialog from "./AppDialog.vue";

const props = defineProps<{ open: boolean }>();

const emit = defineEmits<{
  resolve: [value: ProjectData | "cancelled"];
}>();

type DialogPhase =
  | { phase: "form" }
  | { phase: "building"; current: number; total: number };

const dialogPhase = ref<DialogPhase>({ phase: "form" });

const rootDirectory = ref<string | "unselected">("unselected");
const isDraggingOver = ref(false);

const globLab = ref("");
const globStartAccent = ref("");
const globEndAccent = ref("");
const globStartAccentPhrase = ref("");
const globEndAccentPhrase = ref("");
const globAudio = ref("");

type GlobKey =
  | "globLab"
  | "globStartAccent"
  | "globEndAccent"
  | "globStartAccentPhrase"
  | "globEndAccentPhrase"
  | "globAudio";

type MatchResult =
  | { status: "unchecked" }
  | { status: "ok"; stems: Set<string> }
  | { status: "error"; message: string };

const matchResults = ref<Record<GlobKey, MatchResult>>({
  globLab: { status: "unchecked" },
  globStartAccent: { status: "unchecked" },
  globEndAccent: { status: "unchecked" },
  globStartAccentPhrase: { status: "unchecked" },
  globEndAccentPhrase: { status: "unchecked" },
  globAudio: { status: "unchecked" },
});

const requiredGlobKeys: ReadonlyArray<GlobKey> = [
  "globLab",
  "globStartAccent",
  "globEndAccent",
  "globStartAccentPhrase",
  "globEndAccentPhrase",
];

const candidateStemCount = computed(() => {
  let intersection: Set<string> | "unset" = "unset";
  for (const key of requiredGlobKeys) {
    const result = matchResults.value[key];
    if (result.status !== "ok") {
      return 0;
    }
    if (intersection === "unset") {
      intersection = new Set(result.stems);
    } else {
      for (const stem of intersection) {
        if (!result.stems.has(stem)) {
          intersection.delete(stem);
        }
      }
    }
  }
  if (intersection === "unset") {
    return 0;
  }
  return intersection.size;
});

const canStart = computed(() => {
  if (dialogPhase.value.phase !== "form") {
    return false;
  }
  if (rootDirectory.value === "unselected") {
    return false;
  }
  for (const key of requiredGlobKeys) {
    const result = matchResults.value[key];
    if (result.status !== "ok" || result.stems.size === 0) {
      return false;
    }
  }
  return candidateStemCount.value > 0;
});

function extractStem(filePath: string): string {
  const fileName = filePath.split("/").pop();
  if (fileName == null) {
    return filePath;
  }
  const dotIndex = fileName.indexOf(".");
  return dotIndex === -1 ? fileName : fileName.slice(0, dotIndex);
}

async function updateMatchResult(
  key: GlobKey,
  globValue: string,
): Promise<void> {
  if (rootDirectory.value === "unselected" || globValue === "") {
    matchResults.value = {
      ...matchResults.value,
      [key]: { status: "unchecked" },
    };
    return;
  }
  try {
    const files = await getFsAdapter().listFilesGlob(
      rootDirectory.value,
      globValue,
    );
    const stems = new Set(files.map(extractStem));
    matchResults.value = {
      ...matchResults.value,
      [key]: { status: "ok", stems },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    matchResults.value = {
      ...matchResults.value,
      [key]: { status: "error", message },
    };
  }
}

function resetMatchResults(): void {
  const reset: MatchResult = { status: "unchecked" };
  matchResults.value = {
    globLab: reset,
    globStartAccent: reset,
    globEndAccent: reset,
    globStartAccentPhrase: reset,
    globEndAccentPhrase: reset,
    globAudio: reset,
  };
}

async function onSelectDirectory(): Promise<void> {
  try {
    const dir = await getFsAdapter().selectDirectory();
    rootDirectory.value = dir;
    resetMatchResults();
  } catch {
    // おそらくユーザーがキャンセルした場合（FsAdapter がキャンセルを例外で通知するため）
  }
}

function onDragover(event: DragEvent): void {
  event.preventDefault();
  isDraggingOver.value = true;
}

function onDragleave(): void {
  isDraggingOver.value = false;
}

async function onDrop(event: DragEvent): Promise<void> {
  event.preventDefault();
  isDraggingOver.value = false;
  // 実際の D&D ファイル処理は Step 20 の BrowserFsAdapter で対応
  // ここでは selectDirectory() を呼ぶ
  await onSelectDirectory();
}

async function onStart(): Promise<void> {
  if (rootDirectory.value === "unselected") {
    return;
  }
  const input: BuildProjectInput = {
    rootDirectory: rootDirectory.value,
    globLab: globLab.value,
    globStartAccent: globStartAccent.value,
    globEndAccent: globEndAccent.value,
    globStartAccentPhrase: globStartAccentPhrase.value,
    globEndAccentPhrase: globEndAccentPhrase.value,
    globAudio: globAudio.value,
  };
  await getPersistenceService().saveGlobTemplates({
    globLab: globLab.value,
    globStartAccent: globStartAccent.value,
    globEndAccent: globEndAccent.value,
    globStartAccentPhrase: globStartAccentPhrase.value,
    globEndAccentPhrase: globEndAccentPhrase.value,
    globAudio: globAudio.value,
  });
  dialogPhase.value = { phase: "building", current: 0, total: 0 };
  try {
    const project = await buildProjectData(
      getFsAdapter(),
      input,
      (current, total) => {
        dialogPhase.value = { phase: "building", current, total };
      },
    );
    emit("resolve", project);
  } catch (error) {
    toastService.show(
      `プロジェクト構築に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
      "error",
      5000,
    );
    dialogPhase.value = { phase: "form" };
  }
}

onMounted(async () => {
  const saved = await getPersistenceService().loadGlobTemplates();
  if (saved === "none") {
    return;
  }
  globLab.value = saved.globLab;
  globStartAccent.value = saved.globStartAccent;
  globEndAccent.value = saved.globEndAccent;
  globStartAccentPhrase.value = saved.globStartAccentPhrase;
  globEndAccentPhrase.value = saved.globEndAccentPhrase;
  globAudio.value = saved.globAudio;
});

type GlobFieldDef = {
  key: GlobKey;
  label: string;
  modelRef: Ref<string>;
  required: boolean;
};

function getMatchCount(key: GlobKey): number | "unchecked" | "error" {
  const result = matchResults.value[key];
  if (result.status === "ok") {
    return result.stems.size;
  }
  if (result.status === "error") {
    return "error";
  }
  return "unchecked";
}

function getMatchError(key: GlobKey): string | null {
  const result = matchResults.value[key];
  if (result.status === "error") {
    return result.message;
  }
  return null;
}

const globFields: ReadonlyArray<GlobFieldDef> = [
  { key: "globLab", label: ".lab ファイル", modelRef: globLab, required: true },
  {
    key: "globStartAccent",
    label: "アクセント開始",
    modelRef: globStartAccent,
    required: true,
  },
  {
    key: "globEndAccent",
    label: "アクセント終了",
    modelRef: globEndAccent,
    required: true,
  },
  {
    key: "globStartAccentPhrase",
    label: "アクセント句開始",
    modelRef: globStartAccentPhrase,
    required: true,
  },
  {
    key: "globEndAccentPhrase",
    label: "アクセント句終了",
    modelRef: globEndAccentPhrase,
    required: true,
  },
  {
    key: "globAudio",
    label: "音声ファイル（任意）",
    modelRef: globAudio,
    required: false,
  },
];
</script>

<template>
  <AppDialog
    :open="props.open"
    title="新規プロジェクト作成"
    max-width="max-w-xl"
    @close="emit('resolve', 'cancelled')"
  >
    <template #body>
      <div v-if="dialogPhase.phase === 'form'" class="space-y-4">
        <div>
          <p class="mb-2 text-sm font-medium text-gray-700">
            ルートディレクトリ
          </p>
          <div
            class="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 transition-colors"
            :class="
              isDraggingOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            "
            @dragover="onDragover"
            @dragleave="onDragleave"
            @drop="onDrop"
            @click="onSelectDirectory"
          >
            <span
              v-if="rootDirectory === 'unselected'"
              class="text-sm text-gray-400"
            >
              フォルダをドロップ、またはクリックして選択
            </span>
            <span v-else class="break-all text-sm text-gray-700">
              {{ rootDirectory }}
            </span>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium text-gray-700">glob パターン</p>
          <div class="space-y-2">
            <div
              v-for="field in globFields"
              :key="field.key"
              class="flex items-center gap-2"
            >
              <label class="w-44 shrink-0 text-xs text-gray-600">
                {{ field.label }}
              </label>
              <input
                :value="field.modelRef.value"
                type="text"
                class="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
                :class="
                  matchResults[field.key].status === 'error'
                    ? 'border-red-400'
                    : ''
                "
                @input="
                  field.modelRef.value = (
                    $event.target as HTMLInputElement
                  ).value
                "
                @blur="updateMatchResult(field.key, field.modelRef.value)"
              />
              <span class="w-16 shrink-0 text-right text-xs">
                <template v-if="getMatchCount(field.key) === 'error'">
                  <span class="text-red-500">エラー</span>
                </template>
                <template v-else-if="getMatchCount(field.key) === 'unchecked'">
                  <span class="text-gray-300">-</span>
                </template>
                <template v-else>
                  <span
                    :class="
                      getMatchCount(field.key) === 0
                        ? 'text-red-500'
                        : 'text-gray-500'
                    "
                  >
                    {{ getMatchCount(field.key) }}件
                  </span>
                </template>
              </span>
            </div>
          </div>
          <template v-for="field in globFields" :key="field.key">
            <p
              v-if="getMatchError(field.key) != null"
              class="mt-1 text-xs text-red-500"
            >
              {{ field.label }}: {{ getMatchError(field.key) }}
            </p>
          </template>
        </div>

        <p class="text-sm text-gray-600">
          候補サンプル数:
          <span class="font-medium">{{ candidateStemCount }}</span> 件
        </p>
      </div>

      <div
        v-else-if="dialogPhase.phase === 'building'"
        class="flex flex-col items-center gap-3 py-4"
      >
        <p class="text-sm text-gray-600">プロジェクトを構築中…</p>
        <p class="text-sm font-medium text-gray-800">
          {{ dialogPhase.current }} / {{ dialogPhase.total }}
        </p>
      </div>
    </template>

    <template #footer>
      <template v-if="dialogPhase.phase === 'form'">
        <button
          type="button"
          class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!canStart"
          @click="onStart"
        >
          開始
        </button>
        <button
          type="button"
          class="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          @click="emit('resolve', 'cancelled')"
        >
          キャンセル
        </button>
      </template>
    </template>
  </AppDialog>
</template>
