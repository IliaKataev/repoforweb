<template>
  <div class="courses-page">
    <h1 class="page-title">Доступные курсы</h1>
    <div class="courses-list">
      <CourseCard
          v-for="course in courses"
          :key="course.id"
          :course="course"
          @select="router.push('/course/' + course.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {getCourses, getCoursesForUser} from '../api/courses';
import { useRouter } from 'vue-router';
import CourseCard from '../components/CourseCard.vue';

const courses = ref([]);
const router = useRouter();

onMounted(async () => {
  try {
    const res = await getCourses();
    console.log(res.data);
    courses.value = res.data.result;
  } catch (e) {
    console.error('Ошибка загрузки курсов:', e);
  }
});
</script>

<style scoped>
.courses-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  font-family: 'Inter', sans-serif;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 24px;
  text-align: center;
}

.courses-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}



</style>
