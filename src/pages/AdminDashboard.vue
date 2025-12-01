<template>
  <div class="admin-dashboard">
    <header class="cabinet-header">
      <h1>🛠 Кабинет администратора: {{ store.user?.firstName }} {{ store.user?.lastName }}</h1>
      <button class="logout-btn" @click="logout">Выйти</button>
    </header>

    <div class="dashboard-container">
      <nav class="admin-nav">
        <ul>
          <li :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">Управление пользователями</li>
          <li :class="{ active: activeTab === 'roles' }" @click="activeTab = 'roles'">Назначение ролей</li>
          <li :class="{ active: activeTab === 'courses' }" @click="openCourses">Курсы</li>
        </ul>
      </nav>

      <div class="admin-content">
        <section v-if="activeTab === 'users'">
          <h2>Управление пользователями</h2>
          <p>Здесь можно создавать, редактировать и блокировать пользователей.</p>
        </section>

        <section v-if="activeTab === 'roles'">
          <h2>Назначение ролей</h2>
          <p>Выбираем пользователя и назначаем ему роль (Студент / Преподаватель).</p>
        </section>

        <section v-if="activeTab === 'courses'">
          <h2>Курсы</h2>

          <button class="primary-btn" @click="openCreateModal">➕ Добавить курс</button>

          <div v-if="loadingCourses" class="loading">Загрузка...</div>

          <div v-else class="course-list">
            <article v-for="c in courses" :key="c.id" class="course-item">
              <div class="info">
                <h3>{{ c.name ?? "Без названия" }}</h3>
                <p>{{ c.description?.TEXT ?? "" }}</p>
                <small>👩‍🏫 {{ c.teacher ?? "—" }} | ⏱ {{ c.duration ?? "—" }}</small>
              </div>
              <button class="edit-btn" @click="openEditModal(c)">✏️ Редактировать</button>
            </article>
          </div>
        </section>

        <!-- Модалка -->
        <div v-if="showCourseModal" class="modal-backdrop">
          <div class="modal">
            <h2>{{ isEditMode ? "Редактировать курс" : "Добавить курс" }}</h2>

            <label>Название</label>
            <input v-model="form.name" placeholder="Название курса" />

            <label>Описание</label>
            <textarea v-model="form.description"></textarea>

            <label>Преподаватель</label>
            <input v-model="form.teacher" placeholder="Имя преподавателя" />

            <label>Длительность</label>
            <input v-model="form.duration" placeholder="Например: 12 занятий" />

            <label>Изображение</label>
            <input type="file" @change="onImageSelect" />

            <label>
              <input type="checkbox" v-model="form.active" />
              Активный курс
            </label>

            <div class="modal-actions">
              <button class="primary-btn" @click="saveCourse">💾 Сохранить</button>
              <button class="secondary-btn" @click="closeCourseModal">Отмена</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "../store/userStore.js";
import { useRouter } from "vue-router";
import { getCourses, updateCourse, createCourse } from "../api/courses";

const store = useUserStore();
const router = useRouter();

const activeTab = ref("users");

const courses = ref([]);
const loadingCourses = ref(false);

const showCourseModal = ref(false);
const isEditMode = ref(false);

const form = ref({
  id: null,
  name: "",
  description: "",
  teacher: "",
  duration: "",
  active: true,
  image: null,
});

const openCourses = async () => {
  activeTab.value = "courses";
  loadingCourses.value = true;
  try {
    const res = await getCourses();
    courses.value = res.data.result.map(c => ({
      ...c,
      description: c.description?.TEXT ? { TEXT: c.description.TEXT, TYPE: 'TEXT' } : { TEXT: '', TYPE: 'TEXT' }
    }));
  } catch (e) {
    console.error("Ошибка при загрузке курсов:", e);
  }
  loadingCourses.value = false;
};

const openCreateModal = () => {
  isEditMode.value = false;
  form.value = { id: null, name: "", description: "", teacher: "", duration: "", active: true, image: null };
  showCourseModal.value = true;
};

const openEditModal = (course) => {
  isEditMode.value = true;
  form.value = {
    id: course.id,
    name: course.name ?? "",
    description: course.description?.TEXT ?? "",
    teacher: course.teacher ?? "",
    duration: course.duration ?? "",
    active: course.active ?? true,
    image: null,
  };
  showCourseModal.value = true;
};

const closeCourseModal = () => showCourseModal.value = false;

const onImageSelect = (e) => {
  form.value.image = e.target.files[0];
};

const saveCourse = async () => {
  try {
    const payload = {
      id: form.value.id,
      name: form.value.name,
      teacher: form.value.teacher,
      duration: form.value.duration,
      description: form.value.description,
      active: form.value.active,
    };

    if (form.value.image) payload.image = form.value.image;

    let res;
    if (isEditMode.value) {
      res = await updateCourse(payload);
    } else {
      res = await createCourse(payload);
    }

    console.log("Server response:", res);

    closeCourseModal();
    await openCourses();
  } catch (e) {
    console.error("Ошибка при сохранении курса:", e.response?.data ?? e);
  }
};




const logout = async () => {
  await store.logout();
  router.replace("/login");
};
</script>


<style scoped>
.admin-dashboard { max-width: 1200px; margin: 0 auto; padding: 24px; font-family: 'Inter', sans-serif; background: #f9fafb; border-radius: 8px; }
.cabinet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.logout-btn { padding: 6px 12px; background-color: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; transition: 0.2s; }
.logout-btn:hover { background-color: #dc2626; }
.dashboard-container { display: flex; gap: 24px; }
.admin-nav { width: 220px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
.admin-nav ul { list-style: none; padding: 0; margin: 0; }
.admin-nav li { padding: 10px 12px; cursor: pointer; border-radius: 6px; transition: 0.2s; margin-bottom: 6px; }
.admin-nav li:hover { background: #f3f4f6; }
.admin-nav li.active { background: #2563eb; color: white; font-weight: 600; }
.admin-content { flex: 1; background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb; }
.admin-content h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 12px; }
.admin-content p { color: #374151; }

/* Список курсов */
.course-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.course-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
.course-item .info h3 { margin: 0; font-size: 1rem; font-weight: 600; }
.course-item .info p { margin: 4px 0; font-size: 0.9rem; color: #4b5563; }
.course-item .info small { font-size: 0.8rem; color: #6b7280; }

/* Кнопки */
.primary-btn { background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; margin-bottom: 12px; }
.edit-btn { background: #4b5563; color: white; padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; }

/* Модалка */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal { background: white; padding: 20px; border-radius: 12px; width: 400px; display: flex; flex-direction: column; gap: 12px; }
.modal label { font-weight: 500; margin-top: 8px; }
.modal input, .modal textarea { width: 100%; padding: 6px 8px; border-radius: 6px; border: 1px solid #d1d5db; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
.secondary-btn { background: #9ca3af; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; }
</style>
