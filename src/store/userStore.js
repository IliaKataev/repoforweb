import { defineStore } from "pinia";
import { getUser } from "../api/user";
import { login as apiLogin, logout as apiLogout } from "../api/auth";

export const useUserStore = defineStore("user", {
    state: () => ({
        user: null,
        role: null,
        isAuthLoaded: false
    }),

    actions: {
        async loadUser() {
            try {
                const { data } = await getUser();
                this.user = data;
                this.role = data.role;
            } catch {
                this.user = null;
                this.role = null;
            }
            this.isAuthLoaded = true;
        },

        async login(login, password) {
            const { data } = await apiLogin(login, password);
            const response = await apiLogin(login, password);
            console.log(response);

            if (data.result?.status !== "ok" || !data.result.user) {
                throw new Error(data.result?.message);
            }
            console.log(data.result.user.role);
            this.user = data.result.user;
            this.role = data.result.user.role;
            return true;
        },

        async logout() {
            await apiLogout();
            this.user = null;
            this.role = null;
        }
    }
});
