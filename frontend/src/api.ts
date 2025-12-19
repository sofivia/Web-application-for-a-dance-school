import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export type Role = "student" | "instructor" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  auth_provider: string;
  external_id: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

export type Student = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
}


export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

let onLogoutCallback: (() => void) | null = null;

export function setOnLogoutCallback(cb: () => void) {
  onLogoutCallback = cb;
}

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

async function refreshTokens(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error("No refresh token");
  }

  const response = await axios.post(`${API_URL}/api/accounts/token/refresh/`, {
    refresh,
  });

  const newTokens: AuthTokens = {
    access: response.data.access,
    refresh: response.data.refresh ?? refresh,
  };

  setTokens(newTokens);
  return newTokens.access;
}

interface MyAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryDisabled?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as MyAxiosRequestConfig;

    if (!error.response || error.response.status !== 401 || originalRequest._retryDisabled) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearTokens();
      if (onLogoutCallback) onLogoutCallback();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (!originalRequest.headers) originalRequest.headers = {};
        if (typeof token === "string") {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshTokens();
      processQueue(null, newAccessToken);

      if (!originalRequest.headers) {
        originalRequest.headers = {};
      }
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      if (onLogoutCallback) onLogoutCallback();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export async function login(email: string, password: string): Promise<AuthTokens> {
  const response = await api.post("/api/accounts/token/", { email, password },
    {_retryDisabled: true} as MyAxiosRequestConfig);

  const tokens: AuthTokens = {
    access: response.data.access,
    refresh: response.data.refresh,
  };

  setTokens(tokens);
  return tokens;
}

export async function register(
  email: string,
  password: string,
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const response = await api.post("/api/accounts/register/", { email, password });

  const tokens: AuthTokens = {
    access: response.data.access,
    refresh: response.data.refresh,
  };

  setTokens(tokens);

  return {
    user: response.data.user as AuthUser,
    tokens,
  };
}

export function logout() {
  onLogoutCallback?.();
}

export async function getMe(): Promise<AuthUser> {
  const response = await api.get("/api/accounts/me/");
  return response.data as AuthUser;
}

export async function getStudent(): Promise<Student> {
  const response = await api.get("/api/school/students/");
  return response.data as Student;
}

export type StudentData = {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone?: string;
}

export async function createStudent(student: StudentData) {
  return api.post("/api/school/students/", student);
}
