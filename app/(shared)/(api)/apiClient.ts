import axios, { type InternalAxiosRequestConfig } from "axios";
import useAuthStore from "../(store)/authStore";
import { refresh } from "./auth";
import { getCookie, setCookie, removeCookie, epochSecondsToDate } from "@/lib/utils";

const apiClient = axios.create();

// 모든 요청에 accessToken이 있으면 Authorization 헤더를 붙인다.
apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 동시에 여러 요청이 401을 받아도 refresh는 한 번만 실행되도록 진행 중인 재발급을 공유한다.
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getCookie("refreshToken");
  if (!refreshToken) {
    console.error("[auth] refresh 스킵: refreshToken 쿠키가 없음");
    return null;
  }

  try {
    const data = await refresh(refreshToken);
    useAuthStore.getState().setAccessToken(data.accessToken);
    if (data.refreshToken) {
      setCookie(
        "refreshToken",
        data.refreshToken,
        data.refreshTokenExpiresAt ? epochSecondsToDate(data.refreshTokenExpiresAt) : undefined
      );
    }
    return data.accessToken;
  } catch (refreshError: any) {
    console.error(
      "[auth] accessToken 재발급 실패:",
      refreshError.response?.status,
      refreshError.response?.data ?? refreshError.message
    );
    return null;
  }
};

const forceLogout = () => {
  useAuthStore.getState().clearAuth();
  removeCookie("refreshToken");
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
};

// 401 응답을 받으면 refreshToken으로 accessToken을 재발급받아 원래 요청을 한 번 재시도한다.
// 재발급 자체가 실패하거나, 재발급 후 재시도한 요청마저 401이면 세션을 정리하고 로그인 페이지로 보낸다.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    console.error(
      "[auth] interceptor 진입:",
      originalRequest?.url,
      "hasResponse:",
      !!error.response,
      "status:",
      error.response?.status,
      "_retry:",
      originalRequest?._retry,
      "message:",
      error.message
    );

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // 재발급 후 재시도한 요청마저 401이면 더 손쓸 방법이 없으므로 바로 로그인 페이지로 보낸다.
    if (originalRequest._retry) {
      console.error("[auth] 이미 재시도했던 요청 -> forceLogout 실행:", originalRequest.url);
      forceLogout();
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    console.error("[auth] refreshAccessToken 호출 시작");
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const newAccessToken = await refreshPromise;
    console.error("[auth] refreshAccessToken 결과:", newAccessToken ? "성공" : "실패(null)");

    if (newAccessToken) {
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    }

    forceLogout();
    return Promise.reject(error);
  }
);

export default apiClient;
