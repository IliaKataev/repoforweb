<template>
  <div class="student-cabinet">
    <header class="cabinet-header">
      <h1>🎓 Кабинет студента: {{ store.user?.firstName }} {{ store.user?.lastName }}</h1>
      <button class="logout-btn" @click="logout">Выйти</button>
    </header>

    <div class="cabinet-actions">
      <button @click="goToCourses" class="courses-btn">Просмотреть курсы</button>
    </div>

    <p>Вы можете просматривать курсы, лекции и задания.</p>

    <div v-if="store.user" class="user-info">
      <h2>Информация о пользователе</h2>
      <table>
        <tr><th>ID</th><td>{{ store.user.id }}</td></tr>
        <tr><th>Логин</th><td>{{ store.user.login }}</td></tr>
        <tr><th>Email</th><td>{{ store.user.email }}</td></tr>
        <tr><th>Имя</th><td>{{ store.user.firstName }}</td></tr>
        <tr><th>Фамилия</th><td>{{ store.user.lastName }}</td></tr>
        <tr><th>Роль</th><td>{{ store.user.role }}</td></tr>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "../store/userStore.js";
import { useRouter } from "vue-router";

const store = useUserStore();
const router = useRouter();

const logout = async () => {
  await store.logout();
  router.replace("/login");
};

const goToCourses = () => {
  router.push("/courses");
};
</script>

<style scoped>
.student-cabinet {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  font-family: 'Inter', sans-serif;
  background: #f9fafb;
  border-radius: 8px;
}

.cabinet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.logout-btn {
  padding: 6px 12px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

.logout-btn:hover {
  background-color: #dc2626;
}

.cabinet-actions {
  margin-bottom: 24px;
}

.courses-btn {
  padding: 8px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

.courses-btn:hover {
  background-color: #1d4ed8;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

p {
  color: #374151;
  font-size: 1rem;
  margin-bottom: 24px;
}

.user-info {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.user-info h2 {
  margin-bottom: 16px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.user-info table {
  width: 100%;
  border-collapse: collapse;
}

.user-info th,
.user-info td {
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
}

.user-info th {
  font-weight: 600;
  color: #374151;
}

.user-info td {
  color: #111827;
}
</style>
