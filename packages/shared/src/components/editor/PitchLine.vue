<script setup lang="ts">
import { computed } from "vue";
import type { PitchLevel } from "../../types/accent";

const MORA_WIDTH = 36;
const SVG_HEIGHT = 32;
const Y_HIGH = 6;
const Y_LOW = 26;

const props = defineProps<{
  pitchPattern: Array<PitchLevel>;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  "phrase-click": [];
}>();

const svgWidth = computed(() => props.pitchPattern.length * MORA_WIDTH);

const points = computed(() =>
  props.pitchPattern
    .map((level, i) => {
      const x = i * MORA_WIDTH + MORA_WIDTH / 2;
      const y = level === "H" ? Y_HIGH : Y_LOW;
      return `${x},${y}`;
    })
    .join(" "),
);
</script>

<template>
  <div
    :class="props.isSelected ? 'bg-blue-50' : ''"
    class="cursor-pointer rounded"
    @click="emit('phrase-click')"
  >
    <svg :width="svgWidth" :height="SVG_HEIGHT" class="block">
      <polyline
        :points="points"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-blue-500"
      />
      <circle
        v-for="(level, i) in props.pitchPattern"
        :key="i"
        :cx="i * MORA_WIDTH + MORA_WIDTH / 2"
        :cy="level === 'H' ? Y_HIGH : Y_LOW"
        r="3"
        class="fill-blue-500"
      />
    </svg>
  </div>
</template>
