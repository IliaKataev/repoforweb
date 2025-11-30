import { api } from "./axios";

export function getUser() {
    return api.post("user/get/");
}
