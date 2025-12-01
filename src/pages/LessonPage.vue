<template>
  <div class="lesson-page" v-if="lesson">
    <h2 class="lesson-title">{{ lesson.name }}</h2>

    <div v-if="lesson.content" class="lesson-content" v-html="lesson.content.TEXT || lesson.content"></div>

    <div v-if="lesson.video" class="lesson-video">
      <video controls :src="lesson.video"></video>
    </div>

    <div v-if="lesson.materials?.length" class="lesson-materials">
      <h3>Материалы</h3>
      <ul>
        <li v-for="file in lesson.materials" :key="file">
          <a :href="file" target="_blank">{{ file.split('/').pop() }}</a>
        </li>
      </ul>
    </div>

    <h3 class="hw-heading">Домашние задания</h3>
    <div class="hw-list">
      <div v-for="hw in lesson.homework || []" :key="hw.id" class="hw-card"
           @click="$router.push('/homework/' + hw.id)">
        {{ hw.title?.TEXT || hw.title }} — срок {{ hw.deadline || 'не указан' }}
      </div>
      <div v-if="!(lesson.homework?.length)">Домашних заданий пока нет</div>
    </div>
  </div>

  <div v-else class="loading">Загрузка урока...</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getLesson } from "../api/lessons";

const route = useRoute();
const lessonId = route.params.id;

const lesson = ref(null);

onMounted(async () => {
  try {
    const { data } = await getLesson(lessonId);
    lesson.value = data?.result || null;
  } catch (err) {
    console.error("Ошибка загрузки урока:", err);
  }
});
</script>

<style scoped>
.lesson-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  font-family: 'Inter', sans-serif;
}

.lesson-title {
  font-size: 2rem;
  color: #111827;
  margin-bottom: 16px;
}

.lesson-content {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  color: #374151;
  margin-bottom: 24px;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.lesson-video {
  margin-bottom: 24px;
}

.lesson-video video {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.lesson-materials {
  margin-bottom: 24px;
}

.lesson-materials ul {
  list-style-type: disc;
  padding-left: 20px;
}

.lesson-materials li a {
  color: #2563eb;
  text-decoration: underline;
}

.hw-heading {
  font-size: 1.5rem;
  color: #111827;
  margin-bottom: 12px;
}

.hw-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hw-card {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  transition: 0.2s;
}

.hw-card:hover {
  background: #f3f4f6;
}

.loading {
  text-align: center;
  color: #6b7280;
  font-style: italic;
}
</style>
