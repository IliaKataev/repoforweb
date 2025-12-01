<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../api/axios';

const props = defineProps({
  homeworkId: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(['submitted']);

// Данные формы
const form = ref({
  text: '',
  homework_id: props.homeworkId
});

const selectedFile = ref(null);
const fileInput = ref(null); // ← ref для input
const submitting = ref(false);
const error = ref('');
const success = ref(false);
const alreadySubmitted = ref(false);
const deadlinePassed = ref(false);

// Константы
const maxTextLength = 5000;
const allowedFileTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png';

// Проверяем статус задания при загрузке
onMounted(async () => {
  await checkSubmissionStatus();
});

// Проверяем, отправлял ли уже студент это задание
async function checkSubmissionStatus() {
  try {
    const response = await api.post('Submission/listByHomework/', {
      homework_id: props.homeworkId
    });

    if (response.data?.result?.length > 0) {
      alreadySubmitted.value = true;
    }
  } catch (err) {
    console.error('Error checking submission status:', err);
  }
}

// Обработка выбора файла
function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Проверка размера файла (10MB)
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'Файл слишком большой (макс. 10MB)';
    event.target.value = '';
    return;
  }

  selectedFile.value = file;
  error.value = '';
}

// Удаление выбранного файла - ИСПРАВЛЕННАЯ ВЕРСИЯ
function removeFile() {
  selectedFile.value = null;
  // Используем document.getElementById вместо fileInput.ref
  const fileInputElement = document.getElementById('fileInput');
  if (fileInputElement) {
    fileInputElement.value = '';
  }
}

// Сброс формы - ИСПРАВЛЕННАЯ ВЕРСИЯ
function resetForm() {
  form.value.text = '';
  selectedFile.value = null; // Просто сбрасываем значение

  // Сбрасываем input файла
  const fileInputElement = document.getElementById('fileInput');
  if (fileInputElement) {
    fileInputElement.value = '';
  }

  error.value = '';
  success.value = false;
}

// Отправка задания - ИСПРАВЛЕННАЯ ВЕРСИЯ
async function submitHomework() {
  // Валидация
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

    const response = await api.post('Submission/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('Ответ сервера:', response.data);

    // ИСПРАВЛЕННАЯ ПРОВЕРКА
    if (response.data?.status === 'ok' || response.data?.result?.success) {
      success.value = true;
      alreadySubmitted.value = true;
      emit('submitted', response.data);

      // Автоматически сбросить форму через 3 секунды
      setTimeout(() => {
        resetForm();
      }, 3000);
    } else {
      error.value = response.data?.error ||
          response.data?.errorMessage ||
          response.data?.message ||
          'Неизвестная ошибка при отправке';
    }
  } catch (err) {
    console.error('Ошибка при отправке:', err);

    if (err.response) {
      const serverError = err.response.data;
      error.value = serverError?.error ||
          serverError?.errorMessage ||
          serverError?.message ||
          `Ошибка сервера: ${err.response.status}`;
      console.error('Данные ошибки:', serverError);
    } else if (err.request) {
      error.value = 'Нет ответа от сервера. Проверьте подключение.';
    } else {
      error.value = `Ошибка при настройке запроса: ${err.message}`;
    }
  } finally {
    submitting.value = false;
  }
}

// Просмотр отправки
async function loadSubmission() {
  try {
    const response = await api.post('Submission/listByHomework/', {
      homework_id: props.homeworkId
    });

    if (response.data?.result?.length > 0) {
      const submission = response.data.result[0];
      alert(`Ваша отправка:\nДата: ${submission.date}\nСтатус: ${submission.status}\nОценка: ${submission.grade || 'еще нет'}`);
    }
  } catch (err) {
    console.error('Error loading submission:', err);
  }
}
</script>

<template>
  <div class="submission-form">
    <h3>Отправить выполненное задание</h3>

    <div v-if="alreadySubmitted" class="already-submitted">
      <p>Вы уже отправили это задание</p>
      <button @click="loadSubmission" class="btn-view">Просмотреть мою отправку</button>
    </div>

    <div v-else-if="deadlinePassed" class="deadline-passed">
      <p>Срок сдачи задания истек</p>
    </div>

    <form v-else @submit.prevent="submitHomework" class="form">
      <div class="form-group">
        <label for="answerText">Текст ответа:</label>
        <textarea
            id="answerText"
            v-model="form.text"
            placeholder="Напишите ваш ответ здесь..."
            rows="6"
            :maxlength="maxTextLength"
        ></textarea>
        <small class="counter">{{ form.text.length }}/{{ maxTextLength }}</small>
      </div>

      <div class="form-group">
        <label for="fileInput">Прикрепить файл (опционально):</label>
        <input
            type="file"
            id="fileInput"
        @change="handleFileChange"
        :accept="allowedFileTypes"
        />
        <small class="file-info">
          Макс. размер: 10MB. Разрешены: PDF, Word, изображения
        </small>
        <div v-if="selectedFile" class="file-preview">
          <span>📎 {{ selectedFile.name }}</span>
          <button type="button" @click="removeFile" class="btn-remove">×</button>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="submitting" class="btn-submit">
          {{ submitting ? 'Отправка...' : 'Отправить задание' }}
        </button>
        <button type="button" @click="resetForm" class="btn-reset" v-if="form.text || selectedFile">
          Очистить
        </button>
      </div>
    </form>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="success" class="success-message">
      Задание успешно отправлено!
    </div>
  </div>
</template>

<style scoped>
/* Стили остаются без изменений */
.submission-form {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.submission-form h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #111827;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.counter {
  display: block;
  text-align: right;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-group input[type="file"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
}

.file-info {
  display: block;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.btn-remove {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}

.btn-remove:hover {
  background: #dc2626;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-submit, .btn-reset, .btn-view {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-reset {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-reset:hover {
  background: #e5e7eb;
}

.btn-view {
  background: #10b981;
  color: white;
  border: none;
}

.btn-view:hover {
  background: #059669;
}

.already-submitted, .deadline-passed {
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
}

.already-submitted {
  background: #d1fae5;
  border: 1px solid #a7f3d0;
}

.deadline-passed {
  background: #fee2e2;
  border: 1px solid #fecaca;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  color: #059669;
  text-align: center;
}
</style>