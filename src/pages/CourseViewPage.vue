<template>
  <div class="course-page" v-if="course">
    <!-- Заголовок и мета -->
    <div class="header">
      <h1 class="course-title">{{ course.name }}</h1>
      <div class="course-meta">
        <span v-if="course.teacher">👩‍🏫 {{ course.teacher }}</span>
        <span v-if="course.duration">⏱ {{ course.duration }}</span>
      </div>
      <img v-if="course.image" :src="course.image" alt="Course image" class="course-image" />
    </div>

    <!-- Описание курса -->
    <div v-if="course.description" class="course-description" v-html="course.description.TEXT || course.description"></div>

    <!-- Уроки -->
    <h2 class="lessons-heading">Лекции</h2>
    <div class="lessons-list">
      <LessonCard
          v-for="lesson in course.lessons"
          :key="lesson.id"
          :lesson="lesson"
          @select="router.push('/lesson/' + lesson.id)"
      />
    </div>

    <div v-if="!course.lessons?.length" class="no-lessons">
      В этом курсе пока нет лекций.
    </div>
  </div>

  <div v-else>
    Загрузка курса...
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCourses } from '../api/courses';
import LessonCard from '../components/LessonCard.vue';

const route = useRoute();
const router = useRouter();
const courseId = route.params.id;

const course = ref(null);

onMounted(async () => {
  try {
    console.log('courseId:', courseId);
    const { data } = await getCourses(); // получаем все курсы
    console.log('all courses:', data.result);

    if (Array.isArray(data.result)) {
      const found = data.result.find(c => String(c.id) === String(courseId));
      if (found) {
        course.value = found;
      } else {
        console.error('Курс с таким ID не найден');
      }
    } else {
      console.error('Неверный формат ответа:', data.result);
    }
  } catch (err) {
    console.error('Ошибка загрузки курса:', err);
  }
});
</script>

<style scoped>
.course-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  font-family: 'Inter', sans-serif;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.course-title {
  font-size: 2rem;
  color: #111827;
  margin: 0;
}

.course-meta {
  font-size: 0.95rem;
  color: #6b7280;
  display: flex;
  gap: 16px;
  align-items: center;
}

.course-image {
  margin-top: 12px;
  max-width: 100%;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}

.course-description {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  color: #374151;
  margin-bottom: 24px;
  white-space: pre-line;
}

.lessons-heading {
  font-size: 1.5rem;
  margin-bottom: 12px;
  color: #111827;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.no-lessons {
  color: #6b7280;
  font-style: italic;
  margin-top: 12px;
  text-align: center;
}
</style>
