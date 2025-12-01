import { api } from "./axios";

export const login = (login, password) =>
    api.post("/Auth/login/", { login, password });

export const logout = () =>
    api.post("/Auth/logout/");