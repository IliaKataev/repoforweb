<template>
  <div class="submissions-list">
    <div class="header">
      <h3>Работы студентов</h3>
      <div class="stats">
        <span>Всего: {{ submissions.length }}</span>
        <span class="status-new" v-if="newSubmissionsCount > 0">
          Новых: {{ newSubmissionsCount }}
        </span>
      </div>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else-if="submissions.length === 0" class="no-submissions">
      <p>Работы еще не отправлены</p>
    </div>

    <div v-else class="submissions-container">
      <div class="submissions-grid">
        <div
            v-for="submission in submissions"
            :key="submission.id"
            class="submission-card"
            :class="{ 'status-new': submission.status === 'submitted', 'status-graded': submission.status === 'graded' }"
            @click="openSubmission(submission)"
        >
          <div class="submission-header">
            <div class="student-info">
              <span class="student-name">{{ submission.name }}</span>
              <span class="submission-date">{{ formatDate(submission.date) }}</span>
            </div>
            <div class="submission-status">
              <span class="status-badge" :class="'status-' + submission.status">
                {{ getStatusText(submission.status) }}
              </span>
              <span v-if="submission.grade" class="grade-badge">
                Оценка: {{ submission.grade }}
              </span>
            </div>
          </div>

          <div class="submission-preview">
            <p class="text-preview" v-if="submission.text">
              {{ truncateText(submission.text.TEXT, 100) }}
            </p>
            <div v-if="submission.file" class="file-preview">
              <span class="file-icon">📎</span>
              <span class="file-name">{{ getFileName(submission.file) }}</span>
            </div>
            <div v-else class="no-file">Без файла</div>
          </div>

          <div class="submission-actions">
            <button
                class="btn-grade"
                @click.stop="openGradeModal(submission)"
                v-if="submission.status !== 'graded'"
            >
              Оценить
            </button>
            <button
                class="btn-view"
                @click.stop="openSubmission(submission)"
            >
              Подробнее
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно оценки -->
    <div v-if="showGradeModal" class="modal-overlay" @click.self="closeGradeModal">
      <div class="modal-content">
        <h4>Оценить работу студента #{{ selectedSubmission?.student }}</h4>

        <div class="grade-form">
          <div class="form-group">
            <label>Оценка:</label>
            <div class="grade-options">
              <button
                  v-for="grade in gradeOptions"
                  :key="grade"
                  class="grade-option"
                  :class="{ selected: gradeForm.grade === grade }"
                  @click="gradeForm.grade = grade"
              >
                {{ grade }}
              </button>
              <input
                  type="number"
                  v-model="gradeForm.customGrade"
                  placeholder="Другая"
                  min="1"
                  max="10"
                  step="0.5"
                  class="custom-grade"
                  @change="gradeForm.grade = gradeForm.customGrade"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Комментарий:</label>
            <textarea
                v-model="gradeForm.comment.name"
                placeholder="Комментарий к работе..."
                rows="4"
            ></textarea>
          </div>

          <div class="form-actions">
            <button
                class="btn-submit"
                @click="submitGrade"
                :disabled="grading || !gradeForm.grade"
            >
              {{ grading ? 'Сохранение...' : 'Сохранить оценку' }}
            </button>
            <button class="btn-cancel" @click="closeGradeModal">
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно просмотра работы -->
    <div v-if="showViewModal" class="modal-overlay" @click.self="closeViewModal">
      <div class="modal-content large">
        <div class="modal-header">
          <h4>Работа студента #{{ selectedSubmission?.student }}</h4>
          <button class="btn-close" @click="closeViewModal">×</button>
        </div>

        <div class="submission-details">
          <div class="detail-row">
            <strong>Дата отправки:</strong>
            <span>{{ formatDate(selectedSubmission?.date) }}</span>
          </div>
          <div class="detail-row">
            <strong>Статус:</strong>
            <span class="status-badge" :class="'status-' + selectedSubmission?.status">
              {{ getStatusText(selectedSubmission?.status) }}
            </span>
          </div>
          <div class="detail-row" v-if="selectedSubmission?.grade">
            <strong>Оценка:</strong>
            <span class="grade-value">{{ selectedSubmission.grade }}</span>
          </div>
          <div class="detail-row" v-if="selectedSubmission?.comment">
            <strong>Комментарий преподавателя:</strong>
            <p class="comment-text">{{ selectedSubmission.comment.TEXT }}</p>

          </div>

          <div class="text-content" v-if="selectedSubmission?.text">
            <h5>Текст ответа:</h5>
            <div class="text-box">
              {{ selectedSubmission.text.TEXT }}
            </div>
          </div>

          <div class="file-content" v-if="selectedSubmission?.file">
            <h5>Прикрепленный файл:</h5>
            <a
                :href="selectedSubmission.file"
                target="_blank"
                class="file-download"
            >
              📎 {{ getFileName(selectedSubmission.file) }}
            </a>
          </div>
        </div>

        <div class="modal-actions" v-if="selectedSubmission?.status !== 'graded'">
          <button
              class="btn-grade-large"
              @click="openGradeModal(selectedSubmission)"
          >
            Оценить эту работу
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../api/axios';

const props = defineProps({
  homeworkId: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(['graded']);

// Данные
const submissions = ref([]);
const loading = ref(true);
const showGradeModal = ref(false);
const showViewModal = ref(false);
const selectedSubmission = ref(null);
const grading = ref(false);

// Форма оценки
const gradeForm = ref({
  grade: null,
  customGrade: '',
  comment: ''
});

// Опции оценок
const gradeOptions = ['5', '4', '3', '2', '1', 'зачет'];

// Загружаем отправки
async function loadSubmissions() {
  loading.value = true;
  try {
    const response = await api.post('Submission/listByHomework/', {
      homework_id: props.homeworkId
    });
    console.log(response);
    if (response.data?.result) {
      submissions.value = response.data.result;
    }
  } catch (error) {
    console.error('Error loading submissions:', error);
  } finally {
    loading.value = false;
  }
}

// Статистика
const newSubmissionsCount = computed(() => {
  return submissions.value.filter(s => s.status === 'submitted').length;
});

// Форматирование
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function truncateText(text, length) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

function getFileName(path) {
  return path?.split('/').pop() || 'файл';
}

function getStatusText(status) {
  const statusMap = {
    'submitted': 'На проверке',
    'graded': 'Проверено',
    'in_review': 'В процессе'
  };
  return statusMap[status] || status;
}

function openGradeModal(submission) {
  selectedSubmission.value = submission;

  let commentText = '';
  if (submission.comment) {
    if (typeof submission.comment === 'string') {
      commentText = submission.comment;
    } else if (submission.comment.TEXT) {
      commentText = submission.comment.TEXT;
    }
  }

  gradeForm.value = {
    grade: submission.grade || null,
    customGrade: '',
    comment: commentText
  };

  showGradeModal.value = true;
}


// Закрыть модальное окно оценки
function closeGradeModal() {
  showGradeModal.value = false;
  selectedSubmission.value = null;
}

// Отправить оценку
async function submitGrade() {
  if (!gradeForm.value.grade || !selectedSubmission.value) return;

  grading.value = true;
  try {
    const response = await api.post('Submission/check/', {
      id: selectedSubmission.value.id,
      grade: gradeForm.value.grade,
      comment: gradeForm.value.comment,
      status: 'graded'
    });

    if (response.data?.success) {
      // Обновляем локальные данные
      const index = submissions.value.findIndex(s => s.id === selectedSubmission.value.id);
      if (index !== -1) {
        submissions.value[index] = {
          ...submissions.value[index],
          grade: gradeForm.value.grade,
          comment: gradeForm.value.comment,
          status: 'graded'
        };
      }

      emit('graded', selectedSubmission.value.id);
      closeGradeModal();
    }
  } catch (error) {
    console.error('Error grading submission:', error);
    alert('Ошибка при сохранении оценки');
  } finally {
    grading.value = false;
  }
}

// Открыть детали отправки
function openSubmission(submission) {
  selectedSubmission.value = submission;
  showViewModal.value = true;
}

// Закрыть детали отправки
function closeViewModal() {
  showViewModal.value = false;
  selectedSubmission.value = null;
}

onMounted(() => {
  loadSubmissions();
});
</script>

<style scoped>
.submissions-list {
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h3 {
  margin: 0;
  color: #111827;
}

.stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.status-new {
  color: #ef4444;
  font-weight: 500;
}

.loading, .no-submissions {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

/* Сетка отправок */
.submissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.submission-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
}

.submission-card:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.submission-card.status-new {
  border-left: 4px solid #ef4444;
}

.submission-card.status-graded {
  border-left: 4px solid #10b981;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.student-info {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 500;
  color: #111827;
}

.submission-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.submission-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
}

.status-badge.status-submitted {
  background: #fef2f2;
  color: #dc2626;
}

.status-badge.status-graded {
  background: #d1fae5;
  color: #065f46;
}

.grade-badge {
  background: #dbeafe;
  color: #1e40af;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.submission-preview {
  margin-bottom: 1rem;
}

.text-preview {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.4;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #3b82f6;
}

.file-icon {
  font-size: 1rem;
}

.no-file {
  font-size: 0.875rem;
  color: #9ca3af;
  font-style: italic;
}

.submission-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-grade, .btn-view {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-grade {
  background: #3b82f6;
  color: white;
}

.btn-grade:hover {
  background: #2563eb;
}

.btn-view {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-view:hover {
  background: #e5e7eb;
}

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 700px;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.btn-close:hover {
  color: #111827;
}

/* Форма оценки */
.grade-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.grade-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.grade-option {
  padding: 0.5rem 1rem;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.grade-option:hover {
  border-color: #3b82f6;
}

.grade-option.selected {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.custom-grade {
  width: 80px;
  padding: 0.5rem;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  text-align: center;
}

.custom-grade:focus {
  outline: none;
  border-color: #3b82f6;
}

.grade-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  resize: vertical;
}

.grade-form textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-submit, .btn-cancel, .btn-grade-large {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-submit {
  background: #10b981;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #059669;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

/* Детали отправки */
.submission-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-row strong {
  color: #374151;
}

.comment-text {
  margin: 0;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.text-content, .file-content {
  margin-top: 1rem;
}

.text-content h5, .file-content h5 {
  margin: 0 0 0.5rem 0;
  color: #111827;
}

.text-box {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.file-download {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #eff6ff;
  border-radius: 6px;
  color: #3b82f6;
  text-decoration: none;
  border: 1px solid #dbeafe;
}

.file-download:hover {
  background: #dbeafe;
}

.modal-actions {
  margin-top: 1.5rem;
  text-align: center;
}

.btn-grade-large {
  background: #3b82f6;
  color: white;
  padding: 1rem 2rem;
  font-size: 1rem;
}

.btn-grade-large:hover {
  background: #2563eb;
}
</style>