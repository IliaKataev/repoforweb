<template>
  <article class="course-card" @click="handleClick">
    <div class="thumb">
      <img v-if="course.image" :src="course.image" :alt="course.name" />
      <div v-else class="thumb-placeholder">{{ initials }}</div>
    </div>
    <div class="body">
      <h3>{{ course.name }}</h3>
      <p v-if="course.description">{{ course.description.TEXT }}</p>
      <div class="meta">
        <span v-if="course.teacher">👩‍🏫 {{ course.teacher }}</span>
        <span v-if="course.duration">⏱ {{ course.duration }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({ course: Object });
const emits = defineEmits(['select']);

function handleClick() { emits('select', props.course); }

const initials = computed(() =>
    props.course?.name
        ? props.course.name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
        : ''
);
</script>

<style scoped>
.course-card {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;
  background: #fff; cursor: pointer; transition: transform 0.15s;
}
.course-card:hover { transform: translateY(-2px); }
.thumb { width: 84px; height: 64px; flex: 0 0 84px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; border-radius: 6px; overflow: hidden; }
.thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb-placeholder { font-weight: 600; color: #374151; }
.body { flex: 1; min-width: 0; }
.meta { font-size: 0.85rem; color: #6b7280; display: flex; gap: 10px; margin-top: 6px; }
</style>
