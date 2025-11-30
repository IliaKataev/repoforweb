<template>
  <article class="lesson-card" @click="open" role="button" tabindex="0" @keyup.enter="open">
    <div class="left">
      <strong class="name">{{ lesson.name }}</strong>
      <div class="info">
        <span v-if="lesson.duration">⏱ {{ lesson.duration }}</span>
        <span v-if="hasHomework"> • HW {{ homeworkCount }}</span>
      </div>
    </div>
    <div class="right">
      <button class="open" @click.stop="open">Перейти</button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({ lesson: Object });
const emits = defineEmits(['select']);

function open() { emits('select', props.lesson); }

const hasHomework = computed(() => Array.isArray(props.lesson.homework) && props.lesson.homework.length > 0);
const homeworkCount = computed(() => hasHomework.value ? props.lesson.homework.length : 0);
</script>

<style scoped>
.lesson-card{
  display:flex; justify-content:space-between; align-items:center;
  padding:10px; border-radius:8px; border:1px solid #e6e6e6;
  background:#fff; gap:12px; cursor:pointer; transition:transform 0.15s;
}
.lesson-card:hover{ transform: translateY(-2px); }
.left{ min-width:0; }
.name{ display:block; font-size:1rem; color:#111827; margin-bottom:4px; }
.info{ font-size:0.85rem; color:#6b7280; }
.right{}
.open{ background:transparent; border:1px solid #3b82f6; color:#2563eb; padding:6px 10px; border-radius:6px; cursor:pointer; }
.open:hover{ background:#f1f5f9; }
</style>
