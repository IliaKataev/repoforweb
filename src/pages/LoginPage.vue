<template>
  <div class="login-page">
    <div class="login-container">
      <h1 class="page-title">Вход в систему</h1>

      <div class="form">
        <input v-model="login" placeholder="Логин" />
        <input type="password" v-model="password" placeholder="Пароль" />

        <button @click="submit">Войти</button>

        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
console.log("LoginPage.vue loaded");

import { ref } from "vue";
import { useUserStore } from "../store/userStore.js";
import { useRouter } from "vue-router";

const login = ref("");
const password = ref("");
const error = ref("");

const store = useUserStore();
const router = useRouter();

const submit = async () => {
  console.log("submit called");
  try {
    await store.login(login.value, password.value);
    console.log("Role after login:", store.role);

    if (!store.role) await store.loadUser();

    switch (store.role) {
      case "Студент":
        await router.replace("/student");
        break;
      case "Преподаватель":
        await router.replace("/teacher");
        break;
      case "Администратор":
        await router.replace("/admin");
        break;
      default:
        await router.replace("/courses");
    }
  } catch (e) {
    error.value = e.message;
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f3f4f6;
  font-family: 'Inter', sans-serif;
}

.login-container {
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.page-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

input {
  padding: 10px 14px;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #2563eb;
}

button {
  padding: 10px 16px;
  background-color: #2563eb;
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #1d4ed8;
}

.error {
  color: #ef4444;
  font-size: 0.9rem;
  text-align: center;
}
</style>
