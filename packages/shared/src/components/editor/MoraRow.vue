<script setup lang="ts">
const props = defineProps<{
  moraTexts: Array<string>;
  startMoraIndex: number;
  selectedMoraIndex: number | "none";
  highlightedMoraIndex: number | "none";
}>();

const emit = defineEmits<{
  "mora-click": [globalMoraIndex: number];
}>();
</script>

<template>
  <div class="flex">
    <span
      v-for="(mora, i) in props.moraTexts"
      :key="i"
      :data-mora-index="props.startMoraIndex + i"
      :class="{
        'bg-blue-200': props.selectedMoraIndex === props.startMoraIndex + i,
        'bg-yellow-200':
          props.highlightedMoraIndex === props.startMoraIndex + i,
      }"
      class="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-sm"
      @click="emit('mora-click', props.startMoraIndex + i)"
    >
      {{ mora }}
    </span>
  </div>
</template>
