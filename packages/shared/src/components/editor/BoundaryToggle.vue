<script setup lang="ts">
const props = defineProps<{
  active: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <div
    class="flex cursor-pointer flex-col items-center"
    @click="emit('toggle')"
  >
    <div class="flex h-8 items-center">
      <div
        :class="props.active ? 'bg-orange-400' : 'bg-gray-200'"
        class="h-full w-0.5"
      />
    </div>
    <div class="flex h-6 w-4 items-center justify-center">
      <div
        :class="props.active ? 'bg-orange-400' : 'bg-gray-200'"
        class="h-3 w-0.5 rounded-full"
      />
    </div>
  </div>
</template>
