<template>
  <div class="login">
    <h2>Вход</h2>
    <input v-model="login" placeholder="Логин"/>
    <input v-model="password" type="password" placeholder="Пароль"/>
    <button @click="doLogin">Войти</button>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { login as apiLogin } from "../api/auth";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/userStore";

const login = ref("");
const password = ref("");
const error = ref("");

const router = useRouter();
const userStore = useUserStore();

async function doLogin() {
  const { data } = await apiLogin(login.value, password.value);
  if (data.message === "Successfully authenticated") {
    await userStore.loadUser();
    router.push("/courses");
  } else {
    error.value = data.message;
  }
}
</script>
