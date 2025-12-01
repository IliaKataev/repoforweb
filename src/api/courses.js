import { api } from "./axios";

export function getCourses() {
    return api.get("Course/list/");
}

export function updateCourse(data) {
    return api.post("Course/update/", data);
}

export function createCourse(data) {
    return api.post("Course/create/", data);
}


export function getCoursesForUser() {
    return api.get("User/getCoursesForUser/");
}
