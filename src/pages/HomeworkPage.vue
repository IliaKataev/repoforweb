<template>
  <div class="hw-page" v-if="hw">
    <div class="header">
      <h2 class="hw-title">{{ hw.title?.TEXT || hw.title }}</h2>
      <button @click="goBack" class="btn-back">← Назад</button>
    </div>

    <div class="hw-content">
      <div class="hw-info">
        <p v-if="hw.description" class="hw-description">{{ hw.description?.TEXT || hw.description }}</p>
        <div class="hw-meta">
          <span><strong>Тип:</strong> {{ hw.type || 'Не указан' }}</span>
          <span v-if="hw.deadline"><strong>Дедлайн:</strong> {{ formatDate(hw.deadline) }}</span>
        </div>
      </div>

      <div class="attachments-section" v-if="hw.attachments?.length">
        <h3>📎 Материалы задания</h3>
        <div class="attachments">
          <div v-for="(file, index) in hw.attachments" :key="index" class="attachment-item">
            <a :href="file" :download="getFileName(file)" target="_blank" class="attachment-link">
              📄 {{ getFileName(file) }}
            </a>
          </div>
        </div>
      </div>

      <div v-if="userStore.role === 'Студент'" class="submission-section">
        <HomeworkSubmissionForm
            :homework-id="hwId"
            @submitted="onHomeworkSubmitted"
        />
      </div>

      <div v-else-if="['Преподаватель', 'Администратор'].includes(userStore.role)" class="submissions-section">
        <h3>📋 Отправленные работы</h3>
        <div v-if="submissionsLoading" class="loading">Загрузка...</div>
        <div v-else-if="submissions.length === 0" class="no-submissions">
          Работы еще не отправлены
        </div>
        <div v-else class="submissions-list">
          <div v-for="submission in submissions" :key="submission.id" class="submission-item">
            <div class="submission-header">
              <span class="student">Студент #{{ submission.student }}</span>
              <span class="date">{{ formatDate(submission.date) }}</span>
              <span class="status" :class="'status-' + submission.status">
                {{ getStatusText(submission.status) }}
              </span>
              <span v-if="submission.grade" class="grade">Оценка: {{ submission.grade }}</span>
            </div>
            <div class="submission-content">
              <p v-if="submission.text">{{ truncateText(submission.text, 150) }}</p>
              <a v-if="submission.file" :href="submission.file" target="_blank" class="file-link">
                📎 {{ getFileName(submission.file) }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="loading-container">
    <div class="loading">Загрузка задания...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../store/userStore.js';
import { getHomework } from '../api/homework.js';
import HomeworkSubmissionForm from '../components/HomeworkSubmissionForm.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const hwId = route.params.id;
const hw = ref(null);
const submissions = ref([]);
const submissionsLoading = ref(false);

onMounted(async () => {
  const { data } = await getHomework(hwId);
  hw.value = data?.result || null;

  if (['Преподаватель', 'Администратор'].includes(userStore.role)) {
    await loadSubmissions();
  }
});

async function loadSubmissions() {
  submissionsLoading.value = true;
  try {
    const response = await fetch(`http://192.168.0.106/api/Submission/listByHomework/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homework_id: hwId }),
      credentials: 'include'
    });

    const data = await response.json();
    if (data?.result) {
      submissions.value = data.result;
    }
  } catch (error) {
    console.error('Ошибка загрузки отправок:', error);
  } finally {
    submissionsLoading.value = false;
  }
}

function onHomeworkSubmitted(result) {
  console.log('Задание отправлено:', result);
}

async function submitHomework() {
  if (!form.value.text.trim() && !selectedFile.value) {
    error.value = 'Заполните текст ответа или прикрепите файл';
    return;
  }

  submitting.value = true;
  error.value = '';
  success.value = false;

  try {
    const formData = new FormData();
    formData.append('homework_id', props.homeworkId);
    formData.append('text', form.value.text);

    if (selectedFile.value) {
      formData.append('file', selectedFile.value);
    }

    console.log('Отправляемые данные:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ', pair[1]);
    }

    const response = await fetch('http://192.168.0.106/api/', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const data = await response.json();
    console.log('Ответ сервера:', data);

    if (data?.status === 'ok') {
      if (data.result?.success || !data.result?.error) {
        success.value = true;
        alreadySubmitted.value = true;
        emit('submitted', data);

        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        error.value = data.result?.error || 'Ошибка при отправке';
      }
    } else {
      error.value = data?.error ||
          data?.errorMessage ||
          data?.message ||
          'Неизвестная ошибка при отправке';
    }
  } catch (err) {
    console.error('Ошибка при отправке:', err);
    error.value = `Ошибка сети: ${err.message}`;
  } finally {
    submitting.value = false;
  }
}

function getFileName(path) {
  return path?.split('/').pop() || 'файл';
}

function formatDate(dateString) {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

function truncateText(text, length) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

function getStatusText(status) {
  const statusMap = {
    'submitted': 'На проверке',
    'graded': 'Проверено',
    'in_review': 'В процессе'
  };
  return statusMap[status] || status;
}

function goBack() {
  router.back();
}
</script>

<style scoped>
.hw-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.hw-title {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.btn-back {
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-back:hover {
  background-color: #5a6268;
}

.hw-content {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.hw-info {
  margin-bottom: 30px;
}

.hw-description {
  font-size: 16px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #4a90e2;
}

.hw-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.hw-meta span {
  padding: 5px 10px;
  background-color: #e9ecef;
  border-radius: 4px;
}

.attachments-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.attachments-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.attachments {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.attachment-link {
  color: #4a90e2;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.attachment-link:hover {
  text-decoration: underline;
}

.submission-section,
.submissions-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #e9ecef;
}

.submissions-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.loading, .no-submissions {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.submission-item {
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: #fff;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.student {
  font-weight: bold;
  color: #333;
}

.date {
  color: #6c757d;
}

.status {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-submitted {
  background-color: #fff3cd;
  color: #856404;
}

.status-graded {
  background-color: #d4edda;
  color: #155724;
}

.grade {
  font-weight: bold;
  color: #28a745;
}

.submission-content {
  font-size: 14px;
  color: #555;
}

.file-link {
  display: inline-block;
  margin-top: 8px;
  color: #4a90e2;
  text-decoration: none;
}

.file-link:hover {
  text-decoration: underline;
}
</style>