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
          <li :class="{ active: activeTab === 'courses' }" @click="activeTab = 'courses'">Доступ к курсам</li>
        </ul>
      </nav>

      <div class="admin-content">
        <section v-if="activeTab === 'users'">
          <h2>Управление пользователями</h2>
          <p>Здесь можно создавать, редактировать и блокировать пользователей.</p>
          <!-- Пока просто заглушка -->
        </section>

        <section v-if="activeTab === 'roles'">
          <h2>Назначение ролей</h2>
          <p>Выбираем пользователя и назначаем ему роль (Студент / Преподаватель).</p>
          <!-- Заглушка -->
        </section>

        <section v-if="activeTab === 'courses'">
          <h2>Назначение доступа к курсам</h2>
          <p>Выбираем пользователя и даем доступ к курсам.</p>
          <!-- Заглушка -->
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "../store/userStore.js";
import { useRouter } from "vue-router";

const store = useUserStore();
const router = useRouter();

const activeTab = ref("users");

const logout = async () => {
  await store.logout();
  router.replace("/login");
};
</script>

<style scoped>
.admin-dashboard {
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

.dashboard-container {
  display: flex;
  gap: 24px;
}

.admin-nav {
  width: 220px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.admin-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.admin-nav li {
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: 0.2s;
  margin-bottom: 6px;
}

.admin-nav li:hover {
  background: #f3f4f6;
}

.admin-nav li.active {
  background: #2563eb;
  color: white;
  font-weight: 600;
}

.admin-content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.admin-content h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.admin-content p {
  color: #374151;
}
</style>
