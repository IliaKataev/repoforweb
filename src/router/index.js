import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../pages/LoginPage.vue";
import CoursesPage from "../pages/CoursesPage.vue";
import CourseViewPage from "../pages/CourseViewPage.vue";
import LessonPage from "../pages/LessonPage.vue";
import HomeworkPage from "../pages/HomeworkPage.vue";

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", redirect: "/courses" },
        { path: "/login", component: LoginPage },
        { path: "/courses", component: CoursesPage },
        { path: "/course/:id", component: CourseViewPage },
        { path: "/lesson/:id", component: LessonPage },
        { path: "/homework/:id", component: HomeworkPage }
    ]
});
