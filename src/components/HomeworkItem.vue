<template>
  <div class="hw-item">
    <div class="main" @click="open" role="button" tabindex="0" @keyup.enter="open">
      <div class="title-block">
        <h4 class="title">{{ hw.title || hw.name }}</h4>
        <small class="type" v-if="hw.type">[{{ hw.type }}]</small>
      </div>
      <div class="meta">
        <span v-if="hw.deadline">Срок: {{ formatDate(hw.deadline) }}</span>
        <span v-if="attachmentsCount"> • {{ attachmentsCount }} файл(ов)</span>
      </div>
    </div>
    <div class="actions">
      <button @click.stop="downloadAll" :disabled="attachmentsCount === 0">Скачать</button>
      <slot name="controls"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  hw: Object
});
const emit = defineEmits(['open']);

function open() { emit('open'); }

const attachmentsCount = computed(() => props.hw?.attachments?.length || 0);

function formatDate(date) { return date; } // можно добавить норм. формат
function downloadAll() { alert('Скачать все файлы'); } // реализация скачивания
</script>

<style scoped>
.hw-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  transition: 0.2s;
}

.hw-item:hover {
  background: #f9fafb;
}

.main {
  cursor: pointer;
  flex: 1;
}

.title-block {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.type {
  font-size: 0.85rem;
  color: #6b7280;
}

.meta {
  font-size: 0.85rem;
  color: #6b7280;
}

.actions button {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #f3f4f6;
  cursor: pointer;
}

.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
