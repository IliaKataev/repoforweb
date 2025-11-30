import axios from "axios";

export const api = axios.create({
    baseURL: "http://192.168.0.104/api/", // Твой Bitrix REST endpoint
    withCredentials: true // Bitrix использует cookie сессии
});
