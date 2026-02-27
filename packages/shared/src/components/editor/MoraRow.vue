<script setup lang="ts">
const props = defineProps<{
  moraTexts: Array<string>;
}>();
</script>

<template>
  <div class="flex">
    <span
      v-for="(mora, i) in props.moraTexts"
      :key="i"
      class="flex h-6 w-6 items-center justify-center text-sm"
    >
      {{ mora }}
    </span>
  </div>
</template>
