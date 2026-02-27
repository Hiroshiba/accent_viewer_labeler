<script setup lang="ts">
const MORA_WIDTH = 24;

const props = defineProps<{
  moraCount: number;
}>();

const emit = defineEmits<{
  toggle: [moraLocalIndex: number];
}>();
</script>

<template>
  <div
    :style="{ width: `${props.moraCount * MORA_WIDTH}px` }"
    class="relative h-4"
  >
    <button
      v-for="i in props.moraCount - 1"
      :key="i"
      :style="{ left: `${i * MORA_WIDTH - 4}px` }"
      class="absolute top-0 flex h-full w-2 cursor-pointer items-center justify-center"
      @click="emit('toggle', i - 1)"
    >
      <div class="h-3 w-0.5 rounded-full bg-gray-200 hover:bg-gray-400" />
    </button>
  </div>
</template>
