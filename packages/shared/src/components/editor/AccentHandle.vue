<script setup lang="ts">
import { computed, ref } from "vue";

const MORA_WIDTH = 24;

const props = defineProps<{
  moraCount: number;
  accentPos: number;
}>();

const emit = defineEmits<{
  move: [newAccentPos: number];
}>();

const isDragging = ref(false);
const dragAccentPos = ref(0);
const trackRef = ref<HTMLElement | null>(null);

const displayPos = computed(() =>
  isDragging.value ? dragAccentPos.value : props.accentPos,
);
const trackWidth = computed(() => props.moraCount * MORA_WIDTH);
const handleLeft = computed(() => displayPos.value * MORA_WIDTH);

function calcAccentPosFromOffset(offsetX: number): number {
  const pos = Math.floor(offsetX / MORA_WIDTH);
  return Math.max(0, Math.min(props.moraCount - 1, pos));
}

function onTrackClick(event: MouseEvent): void {
  if (isDragging.value) {
    return;
  }
  const newPos = calcAccentPosFromOffset(event.offsetX);
  if (newPos !== props.accentPos) {
    emit("move", newPos);
  }
}

function onHandleMousedown(event: MouseEvent): void {
  event.stopPropagation();
  isDragging.value = true;
  dragAccentPos.value = props.accentPos;

  const onMousemove = (e: MouseEvent): void => {
    const track = trackRef.value;
    if (track == null) {
      return;
    }
    const rect = track.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    dragAccentPos.value = calcAccentPosFromOffset(offsetX);
  };

  const onMouseup = (): void => {
    isDragging.value = false;
    document.removeEventListener("mousemove", onMousemove);
    document.removeEventListener("mouseup", onMouseup);
    if (dragAccentPos.value !== props.accentPos) {
      emit("move", dragAccentPos.value);
    }
  };

  document.addEventListener("mousemove", onMousemove);
  document.addEventListener("mouseup", onMouseup);
}
</script>

<template>
  <div
    ref="trackRef"
    :style="{ width: `${trackWidth}px` }"
    class="relative h-4 cursor-pointer rounded bg-gray-100"
    @click="onTrackClick"
  >
    <div
      :style="{ left: `${handleLeft}px`, width: `${MORA_WIDTH}px` }"
      class="absolute top-0 h-full rounded bg-blue-400"
      @mousedown="onHandleMousedown"
    />
  </div>
</template>
