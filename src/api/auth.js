import { api } from "./axios";

export function login(login, password) {
    return api.post("auth/login/", { login, password });
}

export function logout() {
    return api.post("auth/logout/");
}
