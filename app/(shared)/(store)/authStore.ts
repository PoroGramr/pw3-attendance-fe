import { create } from "zustand";
import type { LoginResponse } from "../(api)/auth";

type AdminInfo = LoginResponse["admin"];

interface AuthStore {
    accessToken: string | null;
    admin: AdminInfo | null;
    setAuth: (accessToken: string, admin: AdminInfo) => void;
    setAccessToken: (accessToken: string) => void;
    clearAuth: () => void;
}

// accessToken과 관리자 정보는 메모리에만 보관한다 (새로고침 시 초기화됨).
const useAuthStore = create<AuthStore>((set) => ({
    accessToken: null,
    admin: null,

    setAuth: (accessToken, admin) => {
        set({ accessToken, admin });
    },

    // accessToken 재발급(refresh) 시 admin 정보는 그대로 두고 토큰만 갱신한다.
    setAccessToken: (accessToken) => {
        set({ accessToken });
    },

    clearAuth: () => {
        set({ accessToken: null, admin: null });
    },
}));

export default useAuthStore;
