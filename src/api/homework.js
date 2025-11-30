import { api } from "./axios";

export function getHomework(id) {
    return api.post("homework/get/", { id });
}
