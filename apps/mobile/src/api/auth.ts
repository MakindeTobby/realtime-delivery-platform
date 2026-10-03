import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/auth";


export const AuthApi = {
    login: async (email: string, password: string) => {
        const res = await api.post("/auth/login", { email, password });
        await useAuthStore
            .getState()
            .setAuth({
                token: res.data.accessToken,
                refreshToken: res.data.refreshToken,
                user: res.data.user,
            });
    }
}