import { defineStore } from "pinia";
import { getUser } from "../api/user";

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
        }
    }
});
