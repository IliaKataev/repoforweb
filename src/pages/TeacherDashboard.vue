<template>
  <div class="teacher-dashboard">
    <h2>📚 Панель преподавателя</h2>



    <div class="dashboard-content">


      <div class="homeworks-sidebar">
        <h3>Задания</h3>
        <div class="search-box">
          <input
              type="text"
              v-model="searchQuery"
              placeholder="Поиск заданий..."
              class="search-input"
          />
        </div>

        <div class="homeworks-list">
          <div
              v-for="hw in filteredHomeworks"
              :key="hw.id"
              class="homework-item"
              :class="{ active: selectedHomework?.id === hw.id }"
              @click="selectHomework(hw)"
          >
            <div class="hw-title">{{ hw.title }}</div>
            <div class="hw-stats">
              <span class="submissions-count">
                📄 {{ hw.submissions_count ?? 0 }} работ
              </span>
              <span v-if="hw.deadline" class="deadline">
                📅 {{ formatShortDate(hw.deadline) }}
              </span>
            </div>
          </div>

          <div v-if="filteredHomeworks.length === 0" class="no-homeworks">
            Задания не найдены
          </div>
        </div>
      </div>



      <div class="submissions-main">
        <div v-if="!selectedHomework" class="select-hint">
          <div class="hint-icon">👈</div>
          <p>Выберите задание для просмотра отправленных работ</p>
        </div>

        <div v-else>
          <submissions-list
              :homework-id="selectedHomework.id"
              :submissions="submissions"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../store/userStore.js';
import { listAllHomeworks } from '../api/homework.js';
import { listSubmissionsByHomework } from '../api/submission.js';
import SubmissionsList from '../components/SubmissionList.vue';

const userStore = useUserStore();
const homeworks = ref([]);
const selectedHomework = ref(null);
const submissions = ref([]);
const searchQuery = ref('');
const lessonId = ref(null);

function formatShortDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU');
}

const filteredHomeworks = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return query
      ? homeworks.value.filter(hw => hw.title.toLowerCase().includes(query))
      : [...homeworks.value];
});
import { nextTick } from 'vue';

async function selectHomework(hw) {
  submissions.value = [];
  selectedHomework.value = null;

  await nextTick();

  selectedHomework.value = hw;

  try {
    const { data } = await listSubmissionsByHomework(hw.id);
    const submissionsData = data?.result || [];
    submissions.value = submissionsData;

    hw.submissions_count = submissionsData.length;
  } catch (err) {
    console.error('Ошибка загрузки отправок:', err);
    submissions.value = [];
    hw.submissions_count = 0;
  }
}


async function loadHomeworks() {
  try {
    const { data } = await listAllHomeworks(lessonId.value);
    const tasks = data?.result || [];

    homeworks.value = tasks.map(hw => ({
      ...hw,
      submissions_count: 0
    }));
  } catch (err) {
    console.error('Ошибка загрузки домашних заданий:', err);
  }
}

onMounted(() => {
  if (!['Преподаватель', 'Администратор'].includes(userStore.role)) {
    alert('Доступ запрещен. Только для преподавателей.');
    return;
  }

  loadHomeworks();
});
</script>








<style scoped>
.teacher-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.teacher-dashboard h2 {
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.dashboard-content {
  display: flex;
  gap: 30px;
  height: calc(100vh - 120px);
}

/* Левая колонка - задания */
.homeworks-sidebar {
  width: 350px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow-y: auto;
}

.homeworks-sidebar h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.homeworks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.homework-item {
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f9fafb;
}

.homework-item:hover {
  border-color: #93c5fd;
  background: #f0f9ff;
}

.homework-item.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.hw-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 15px;
}

.hw-subtitle {
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 8px;
}

.hw-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #9ca3af;
}

.submissions-count {
  color: #3b82f6;
  font-weight: 500;
}

.deadline {
  color: #ef4444;
  font-weight: 500;
}

.no-homeworks {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
  font-style: italic;
}

/* Правая колонка - отправки */
.submissions-main {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow-y: auto;
}

.select-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.hint-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.submissions-container {
  padding: 30px;
}

.submissions-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f3f4f6;
}

.header-left h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 24px;
}

.hw-description {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
  max-width: 600px;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  min-width: 100px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
}

.loading {
  text-align: center;
  padding: 60px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-submissions {
  text-align: center;
  padding: 80px 40px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.submissions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.submission-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s;
}

.submission-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.student-details {
  display: flex;
  flex-direction: column;
}

.student-details strong {
  font-size: 16px;
  color: #333;
}

.student-details small {
  font-size: 12px;
  color: #9ca3af;
}

.submission-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.submission-date {
  font-size: 13px;
  color: #6b7280;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-submitted {
  background: #fef3c7;
  color: #92400e;
}

.status-graded {
  background: #d1fae5;
  color: #065f46;
}

.status-in_review {
  background: #dbeafe;
  color: #1e40af;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.answer-text h4,
.file-attachment h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #6b7280;
}

.text-preview {
  font-size: 15px;
  line-height: 1.5;
  color: #374151;
}

.text-toggle {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  margin-left: 8px;
  text-decoration: underline;
}

.full-text {
  margin-top: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  white-space: pre-wrap;
}

.file-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f3f4f6;
  border-radius: 8px;
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.3s;
}

.file-link:hover {
  background: #e5e7eb;
}

.file-icon {
  font-size: 18px;
}

.grading-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f3f4f6;
}

.current-grade {
  margin-bottom: 20px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

.grade-value {
  font-size: 20px;
  font-weight: 700;
  color: #10b981;
  margin: 0 8px;
}

.comment {
  font-style: italic;
  color: #6b7280;
  margin-left: 12px;
}

.grading-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}

.grade-input,
.comment-input,
.status-select {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.grade-input:focus,
.comment-input:focus,
.status-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.comment-input {
  resize: vertical;
  min-height: 60px;
}

.save-btn {
  grid-column: 1 / -1;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.save-btn:hover:not(:disabled) {
  background: #2563eb;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-btn.saving {
  background: #93c5fd;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .dashboard-content {
    flex-direction: column;
    height: auto;
  }

  .homeworks-sidebar {
    width: 100%;
    max-height: 400px;
  }

  .grading-form {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .submissions-header {
    flex-direction: column;
    gap: 20px;
  }

  .stats {
    flex-wrap: wrap;
  }

  .stat-item {
    min-width: 80px;
  }
}
</style>