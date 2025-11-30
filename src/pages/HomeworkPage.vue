<template>
  <div class="hw-page" v-if="hw">
    <h2 class="hw-title">{{ hw.title?.TEXT || hw.title }}</h2>
    <p v-if="hw.description" class="hw-description">{{ hw.description?.TEXT || hw.description }}</p>
    <p class="hw-meta">Тип: {{ hw.type }}</p>
    <p class="hw-meta">Дедлайн: {{ hw.deadline }}</p>

    <h3 class="attachments-heading">Материалы</h3>
    <div class="attachments" v-if="hw.attachments?.length">
      <div v-for="file in hw.attachments" :key="file">
        <a :href="file" :download="getFileName(file)" target="_blank">{{ getFileName(file) }}</a>
      </div>
    </div>
    <div v-else class="no-attachments">Нет материалов</div>
  </div>

  <div v-else class="loading">Загрузка задания...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getHomework } from '../api/homework';

const route = useRoute();
const hwId = route.params.id;
const hw = ref(null);

onMounted(async () => {
  const { data } = await getHomework(hwId);
  hw.value = data?.result || null;
});

function getFileName(path) { return path?.split('/').pop() || ''; }
</script>

<style scoped>
.hw-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  font-family: 'Inter', sans-serif;
}

.hw-title {
  font-size: 2rem;
  color: #111827;
  margin-bottom: 12px;
}

.hw-description {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
  color: #374151;
}

.hw-meta {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.attachments-heading {
  margin-top: 24px;
  font-size: 1.2rem;
  color: #111827;
}

.attachments a {
  display: inline-block;
  margin-bottom: 6px;
  color: #2563eb;
  text-decoration: underline;
}

.no-attachments {
  color: #6b7280;
  font-style: italic;
  margin-top: 8px;
}

.loading {
  text-align: center;
  color: #6b7280;
  font-style: italic;
}
</style>
