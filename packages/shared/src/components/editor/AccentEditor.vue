<script setup lang="ts">
import { computed } from "vue";
import { UnreachableError } from "../../errors";
import { buildSampleView, resolveAccentData } from "../../domain/accent-view";
import { appStateService } from "../../services/app-state/app-state-service";
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
          <PitchLine :pitch-pattern="phrase.pitchPattern" />
          <MoraRow :mora-texts="phrase.moraTexts" />
        </div>
        <BoundaryToggle
          v-if="phraseIdx < sampleView.phrases.length - 1"
          :active="true"
        />
      </template>
    </div>
  </div>
</template>
