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
import { editorSelectionService } from "../../services/editor-selection/editor-selection-service";
import { playbackController } from "../../services/playback/playback-controller";
import { settingsService } from "../../services/settings/settings-service";
import { getFsAdapter } from "../../services/fs-adapter/interface";
import { getAudioService } from "../../services/audio/interface";
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
  return buildSampleView(
    sample.moras,
    phraseBoundaries,
    accentPosInPhrase,
    sample.pauPositions,
  );
});

const currentSample = computed(() => {
  const { project, currentStem } = editingState.value;
  const sample = project.samples[currentStem];
  if (sample == null) {
    throw new Error(`サンプル "${currentStem}" が見つかりません`);
  }
  return sample;
});

const hasAudio = computed(() => {
  const { project, currentStem } = editingState.value;
  return project.audioFiles[currentStem] != null;
});

const selectedMora = computed(() => editorSelectionService.selectedMora);
const selectedPhrase = computed(() => editorSelectionService.selectedPhrase);
const highlightedMora = computed(() => playbackController.highlightedMora);
const displayMode = computed(() => settingsService.current.displayMode);

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

function handleMoraClick(globalMoraIndex: number): void {
  editorSelectionService.selectMora(globalMoraIndex);
  if (hasAudio.value) {
    playbackController.playMoraRange(
      currentSample.value.moraIntervals,
      globalMoraIndex,
    );
  }
}

function handlePhraseClick(phraseIdx: number): void {
  editorSelectionService.selectPhrase(phraseIdx);
  if (hasAudio.value) {
    const phrase = sampleView.value.phrases[phraseIdx];
    if (phrase == null) {
      throw new Error(`句 ${phraseIdx} が見つかりません`);
    }
    const endMoraIndex =
      phraseIdx < sampleView.value.phrases.length - 1
        ? (sampleView.value.phraseBoundaries[phraseIdx] ?? 0)
        : sampleView.value.moras.length - 1;
    playbackController.playPhraseRange(
      currentSample.value.moraIntervals,
      phrase.startMoraIndex,
      endMoraIndex,
    );
  }
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

function handleSpaceKey(): void {
  if (playbackController.isPlaying) {
    playbackController.stop();
    return;
  }
  if (!hasAudio.value) {
    return;
  }
  const moraIntervals = currentSample.value.moraIntervals;
  const mora = selectedMora.value;
  const phrase = selectedPhrase.value;
  if (mora !== "none") {
    playbackController.playMoraRange(moraIntervals, mora);
  } else if (phrase !== "none") {
    const phraseView = sampleView.value.phrases[phrase];
    if (phraseView == null) {
      throw new Error(`句 ${phrase} が見つかりません`);
    }
    const endMoraIndex =
      phrase < sampleView.value.phrases.length - 1
        ? (sampleView.value.phraseBoundaries[phrase] ?? 0)
        : sampleView.value.moras.length - 1;
    playbackController.playPhraseRange(
      moraIntervals,
      phraseView.startMoraIndex,
      endMoraIndex,
    );
  } else {
    playbackController.playFull(moraIntervals);
  }
}

function handleEscKey(): void {
  editorSelectionService.clearAll();
  playbackController.stop();
}

async function loadAudioForCurrentStem(): Promise<void> {
  const { project, currentStem } = editingState.value;
  const audioPath = project.audioFiles[currentStem];
  if (audioPath == null) {
    return;
  }
  const arrayBuffer = await getFsAdapter().readBinaryFile(audioPath);
  await getAudioService().load(arrayBuffer);
}

watch(
  () => editingState.value.currentStem,
  () => {
    undoRedoService.clear();
    editorSelectionService.clearAll();
    playbackController.stop();
    void loadAudioForCurrentStem();
  },
);

watch(
  () => editingState.value.project.audioFiles,
  () => {
    playbackController.stop();
    void loadAudioForCurrentStem();
  },
);

onMounted(() => {
  void loadAudioForCurrentStem();
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
  actionService.register({
    id: "editor:space",
    label: "再生/停止",
    shortcut: "Space",
    handler: handleSpaceKey,
    enabled: () => appStateService.state.phase === "editing",
  });
  actionService.register({
    id: "editor:esc",
    label: "選択解除と再生停止",
    shortcut: "Escape",
    handler: handleEscKey,
    enabled: () =>
      editorSelectionService.selectedMora !== "none" ||
      editorSelectionService.selectedPhrase !== "none" ||
      playbackController.isPlaying,
  });
});

onUnmounted(() => {
  actionService.unregister("editor:undo");
  actionService.unregister("editor:redo");
  actionService.unregister("editor:space");
  actionService.unregister("editor:esc");
  playbackController.stop();
  editorSelectionService.clearAll();
});
</script>

<template>
  <div class="p-4">
    <p class="mb-3 text-sm font-medium text-gray-700">
      {{ editingState.currentStem }}
    </p>
    <div
      :class="
        displayMode === 'wrap' ? 'flex flex-wrap items-end' : 'flex items-end'
      "
    >
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
          <PitchLine
            :pitch-pattern="phrase.pitchPattern"
            :is-selected="selectedPhrase === phraseIdx"
            @phrase-click="handlePhraseClick(phraseIdx)"
          />
          <MoraRow
            :mora-texts="phrase.moraTexts"
            :start-mora-index="phrase.startMoraIndex"
            :selected-mora-index="selectedMora"
            :highlighted-mora-index="highlightedMora"
            @mora-click="handleMoraClick"
          />
          <BoundaryButtonRow
            :mora-count="phrase.moraTexts.length"
            @toggle="
              (localIdx) => handleInnerBoundaryToggle(phraseIdx, localIdx)
            "
          />
        </div>
        <template v-if="phraseIdx < sampleView.phrases.length - 1">
          <BoundaryToggle
            :active="true"
            @toggle="handleBoundaryToggle(phraseIdx)"
          />
          <template v-if="sampleView.pauAtBoundaries[phraseIdx]">
            <div class="flex flex-col items-center">
              <div
                class="flex h-6 w-9 items-center justify-center text-sm text-gray-400"
              >
                、
              </div>
              <div class="h-4" />
            </div>
            <BoundaryToggle
              :active="true"
              @toggle="handleBoundaryToggle(phraseIdx)"
            />
          </template>
        </template>
      </template>
    </div>
  </div>
</template>
