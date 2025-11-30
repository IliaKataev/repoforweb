import { api } from "./axios";

export function getLessons(courseId) {
    return api.post("lesson/list/", { course_id: courseId });
}

export function getLesson(id) {
    return api.post("lesson/get/", { id });
}
