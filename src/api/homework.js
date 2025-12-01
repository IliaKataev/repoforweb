import { api } from "./axios";

// Получение одного домашнего задания
export function getHomework(id) {
    return api.post("homework/get/", { id });
}

// Список домашних заданий, можно по лекции
export function listAllHomeworks(lesson_id = null) {
    return api.post("homework/list/", { lesson_id });
}
