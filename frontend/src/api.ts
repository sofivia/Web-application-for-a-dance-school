import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { Type, plainToInstance } from 'class-transformer';

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
   first_name: string;
   last_name: string;
   date_of_birth: string;
   phone?: string;
};

export type Instructor = {
   first_name: string;
   last_name: string;
   short_bio: string;
   phone: string;
};

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
   (error) => Promise.reject(error)
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
   }
);

export async function login(email: string, password: string): Promise<AuthTokens> {
   const response = await api.post("/api/accounts/token/", { email, password }, {
      _retryDisabled: true,
   } as MyAxiosRequestConfig);

   const tokens: AuthTokens = {
      access: response.data.access,
      refresh: response.data.refresh,
   };

   setTokens(tokens);
   return tokens;
}

export async function register(email: string, password: string): Promise<{ user: AuthUser; tokens: AuthTokens }> {
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

export async function getStudent() {
   const response = await api.get("/api/school/students/");
   return response.data as Student;
}

export async function getInstructor() {
   const response = await api.get("/api/school/instructors/");
   return response.data as Instructor;
}

export async function registerStudent(student: Student) {
   const resp = await api.post<Student>("/api/school/students/", student);
   return resp.data;
}

export async function registerInstructor(instructor: Instructor) {
   const resp = await api.post("/api/school/instructors/", instructor);
   return resp.data;
}

export type ClassFilters = {
   class_types: { id: string; name: string; level: string; duration_minutes: number }[];
   instructors: { id: string; first_name: string; last_name: string }[];
   locations: { pk: string; name: string }[];
};

export type ClassSessionRow = {
   id: string;
   group_id: string;
   starts_at: string;
   ends_at: string;
   class_type: { id: string; name: string; level: string; duration_minutes: number };
   instructor: { id: string; first_name: string; last_name: string } | null;
   location: { pk: string; name: string };
   limit: number;
   enrolled: number;
   is_enrolled: boolean;
};

export async function getClassFilters(): Promise<ClassFilters> {
   const res = await api.get("/api/school/class-filters/");
   return res.data as ClassFilters;
}

type ClassesParams = {
   page: number;
   class_type?: string;
   primary_instructor?: string;
   location?: string;
   date_from?: string;
   date_to?: string;
};

export async function getClasses(params: ClassesParams): Promise<{ count: number; results: ClassSessionRow[] }> {
   const res = await api.get("/api/school/classes/", { params });
   return res.data as { count: number; results: ClassSessionRow[] };
}

export async function enroll(groupId: string | number) {
   return api.post("/api/school/enroll/", { group_id: groupId });
}

export async function unenroll(groupId: string | number) {
   return api.post("/api/school/unenroll/", { group_id: groupId });
}

export type ClassGroup = {
   pk: string;
   name: string;
   primary_instructor: { id: string; first_name: string; last_name: string };
   weekday: number;
   start_time: string;
   end_time: string;
   location: { pk: string; name: string };
   nr_enrolled: number;
   effective_capacity: number;
   start_date: string;
   end_date: string;
   is_enrolled: boolean;
};

export async function getClassGroups(params: ClassesParams) {
   const resp = await api.get("/api/school/classgroups/", { params });
   return resp.data as { count: number; results: ClassGroup[] };
}

export async function getClassGroup(id: string) {
   const resp = await api.get(`/api/school/classgroups/${id}/`);
   return resp.data as ClassGroup;
}

export type AccountView = {
   pk: string;
   studentInfo?: Student;
   instructorInfo?: Instructor;
   email: string;
   isActive: boolean;
   role: string;
};

export type AccountParams = {
   page: number;
   name?: string;
   surname?: string;
   accountType?: string;
   email?: string;
   isActive?: boolean;
};

type BaseAccount = {
   email: string;
   is_active: boolean;
};

export type BaseType<T> = T & BaseAccount;

export type BaseStudent = BaseType<Student>;
export type BaseInstructor = BaseType<Instructor>;

export async function getAccounts(params: AccountParams) {
   const resp = await api.get("/api/school/accounts/", { params });
   return resp.data as { count: number; results: AccountView[] };
}
export async function getAccount(id: string) {
   const resp = await api.get(`/api/school/accounts/${id}/`);
   return resp.data as AccountView;
}
export async function removeAccount(id: string) {
   const resp = await api.delete(`/api/school/accounts/${id}/`);
   return resp.data;
}

export async function createInstructor(password: string, instructor: BaseInstructor) {
   const resp = await api.post("/api/school/instructors/", { instructor, password });
   return resp.data as BaseInstructor;
}
export async function editInstructor(id: string, instructor: BaseInstructor) {
   const resp = await api.put(`/api/school/instructors/${id}/`, instructor);
   return resp.data as BaseInstructor;
}

export async function createStudent(password: string, student: BaseStudent) {
   const resp = await api.post("/api/school/students/", { student, password });
   return resp.data as BaseStudent;
}
export async function editStudent(id: string, student: BaseStudent) {
   const resp = await api.put(`/api/school/students/${id}/`, student);
   return resp.data as BaseStudent;
}

export class AttendanceRecord {
   id!: string;
   instructorName!: string;
   classType!: string;

   @Type(() => Date)
   markedAt!: Date;
};

export class AttendanceRecords {
   count!: number;

   @Type(() => AttendanceRecord)
   results!: AttendanceRecord[];
}

export async function getAttendanceRecords(params: { page: number }) { // TODO: implement get attendance records, where status = "Nieobecny"
   const { data } = await api.get("/api/school/attendance/", { params });
   return plainToInstance(AttendanceRecords, data)
}
