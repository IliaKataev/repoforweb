import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import { getActivePinia } from "pinia";

// Публичные страницы
import LoginPage from "../pages/LoginPage.vue";
import CoursesPage from "../pages/CoursesPage.vue";
import CourseViewPage from "../pages/CourseViewPage.vue";
import LessonPage from "../pages/LessonPage.vue";
import HomeworkPage from "../pages/HomeworkPage.vue";

// Кабинеты
const StudentDashboard = () => import("../pages/StudentDashboard.vue");
const TeacherDashboard = () => import("../pages/TeacherDashboard.vue");
const AdminDashboard = () => import("../pages/AdminDashboard.vue");

const routes = [
    { path: "/", redirect: "/courses" },

    // публичные маршруты
    { path: "/login", component: LoginPage },
    { path: "/courses", component: CoursesPage },
    { path: "/course/:id", component: CourseViewPage },
    { path: "/lesson/:id", component: LessonPage },
    { path: "/homework/:id", component: HomeworkPage },

    // маршруты по ролям
    {
        path: "/student",
        component: StudentDashboard,
        meta: { roles: ["Студент"] }
    },
    {
        path: "/teacher",
        component: TeacherDashboard,
        meta: { roles: ["Преподаватель"] }
    },
    {
        path: "/admin",
        component: AdminDashboard,
        meta: { roles: ["Администратор"] }
    }
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});


router.beforeEach(async (to, from, next) => {
    const store = useUserStore();

    // загружаем Pinia если еще не активирована
    if (!getActivePinia()) {
        console.error("Pinia не инициализирована!");
        return next("/login");
    }

    // загружаем пользователя один раз
    if (!store.isAuthLoaded) {
        await store.loadUser();
    }

    const userRole = store.role;

    // если маршрут публичный (login) — пропускаем
    if (to.path === "/login") {
        // если уже залогинен — редиректим на домашнюю по роли
        if (userRole) {
            switch (userRole) {
                case "Студент":
                    return next("/student");
                case "Преподаватель":
                    return next("/teacher");
                case "Администратор":
                    return next("/admin");
            }
        }
        return next();
    }

    if (!userRole) return next("/login");

    // проверка роли на приватных маршрутах
    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
        // редирект на домашнюю по роли
        switch (userRole) {
            case "Студент":
                return next("/student");
            case "Преподаватель":
                return next("/teacher");
            case "Администратор":
                return next("/admin");
        }
    }

    next();
});
