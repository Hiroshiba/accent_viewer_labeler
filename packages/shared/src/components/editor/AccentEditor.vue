<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from "vue";
import { UnreachableError } from "../../errors";
import {
  MoveAccentCommand,
  ToggleBoundaryCommand,
} from "../../domain/accent-edit-commands";
import { buildSampleView, resolveAccentData } from "../../domain/accent-view";
import { appStateService } from "../../services/app-state/app-state-service";
import { actionService } from "../../services/action/action-service";
import { undoRedoService } from "../../services/undo-redo/undo-redo-service";
import AccentHandle from "./AccentHandle.vue";
import BoundaryButtonRow from "./BoundaryButtonRow.vue";
import BoundaryToggle from "./BoundaryToggle.vue";
import MoraRow from "./MoraRow.vue";
import PitchLine from "./PitchLine.vue";

const editingState = computed(() => {
  const state = appStateService.state;
  if (state.phase !== "editing") {
    throw new UnreachableError(state as never);
  }
  return state;
});

const sampleView = computed(() => {
  const { project, currentStem } = editingState.value;
  const sample = project.samples[currentStem];
  if (sample == null) {
    throw new Error(`サンプル "${currentStem}" が見つかりません`);
  }
  const override = project.overrides[currentStem];
  const { phraseBoundaries, accentPosInPhrase } = resolveAccentData(
    sample,
    override,
  );
  return buildSampleView(sample.moras, phraseBoundaries, accentPosInPhrase);
});

function getCurrentAccentData(): {
  phraseBoundaries: Array<number>;
  accentPosInPhrase: Array<number>;
} {
  const { project, currentStem } = editingState.value;
  const sample = project.samples[currentStem];
  if (sample == null) {
    throw new Error(`サンプル "${currentStem}" が見つかりません`);
  }
  const override = project.overrides[currentStem];
  return resolveAccentData(sample, override);
}

function handleBoundaryToggle(phraseIdx: number): void {
  const { currentStem } = editingState.value;
  const { phraseBoundaries, accentPosInPhrase } = getCurrentAccentData();
  const boundary = phraseBoundaries[phraseIdx];
  if (boundary == null) {
    throw new Error(`句 ${phraseIdx} の境界が見つかりません`);
  }
  const command = new ToggleBoundaryCommand(
    currentStem,
    boundary,
    phraseBoundaries,
    accentPosInPhrase,
  );
  undoRedoService.push(command);
}

function handleInnerBoundaryToggle(
  phraseIdx: number,
  moraLocalIdx: number,
): void {
  const { currentStem } = editingState.value;
  const { phraseBoundaries, accentPosInPhrase } = getCurrentAccentData();
  const phrase = sampleView.value.phrases[phraseIdx];
  if (phrase == null) {
    throw new Error(`句 ${phraseIdx} が見つかりません`);
  }
  // moraLocalIdx は句内インデックス。句の先頭モーラインデックスを加算してグローバル境界位置にする
  const boundaryMoraIndex = phrase.startMoraIndex + moraLocalIdx;
  const command = new ToggleBoundaryCommand(
    currentStem,
    boundaryMoraIndex,
    phraseBoundaries,
    accentPosInPhrase,
  );
  undoRedoService.push(command);
}

function handleAccentMove(phraseIdx: number, newAccentPos: number): void {
  const { currentStem } = editingState.value;
  const { phraseBoundaries, accentPosInPhrase } = getCurrentAccentData();
  const currentPos = accentPosInPhrase[phraseIdx];
  if (currentPos == null) {
    throw new Error(`句 ${phraseIdx} のアクセント位置が見つかりません`);
  }
  if (currentPos === newAccentPos) {
    return;
  }
  const command = new MoveAccentCommand(
    currentStem,
    phraseIdx,
    newAccentPos,
    phraseBoundaries,
    accentPosInPhrase,
  );
  undoRedoService.push(command);
}

watch(
  () => editingState.value.currentStem,
  () => {
    undoRedoService.clear();
  },
);

onMounted(() => {
  actionService.register({
    id: "editor:undo",
    label: "元に戻す",
    shortcut: "Ctrl+Z",
    handler: () => undoRedoService.undo(),
    enabled: () => undoRedoService.canUndo,
  });
  actionService.register({
    id: "editor:redo",
    label: "やり直し",
    shortcut: "Ctrl+Y",
    handler: () => undoRedoService.redo(),
    enabled: () => undoRedoService.canRedo,
  });
});

onUnmounted(() => {
  actionService.unregister("editor:undo");
  actionService.unregister("editor:redo");
});
</script>

<template>
  <div class="p-4">
    <p class="mb-3 text-sm font-medium text-gray-700">
      {{ editingState.currentStem }}
    </p>
    <div class="flex flex-wrap items-end">
      <template
        v-for="(phrase, phraseIdx) in sampleView.phrases"
        :key="phraseIdx"
      >
        <div>
          <AccentHandle
            :mora-count="phrase.moraTexts.length"
            :accent-pos="phrase.accentPos"
            @move="(newPos) => handleAccentMove(phraseIdx, newPos)"
          />
          <PitchLine :pitch-pattern="phrase.pitchPattern" />
          <MoraRow :mora-texts="phrase.moraTexts" />
          <BoundaryButtonRow
            :mora-count="phrase.moraTexts.length"
            @toggle="
              (localIdx) => handleInnerBoundaryToggle(phraseIdx, localIdx)
            "
          />
        </div>
        <BoundaryToggle
          v-if="phraseIdx < sampleView.phrases.length - 1"
          :active="true"
          @toggle="handleBoundaryToggle(phraseIdx)"
        />
      </template>
    </div>
  </div>
</template>
