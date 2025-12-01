import { api } from "./axios";

// Создание отправки домашней работы
export function createSubmission(formData) {
    return api.post("submission/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
}

// Список отправок по домашнему заданию
export function listSubmissionsByHomework(homework_id) {
    return api.post("submission/listByHomework/", { homework_id });
}

// Проверка/выставление оценки
export function checkSubmission(submission) {
    return api.post("submission/check/", {
        id: submission.id,
        grade: submission.tempGrade,
        comment: submission.tempComment,
        status: submission.tempStatus
    });
}
