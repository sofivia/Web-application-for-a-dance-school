import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { Type, plainToInstance, Transform, instanceToPlain } from 'class-transformer';

const API_URL = import.meta.env.VITE_API_URL ?? "https://localhost";

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

export class Student {
   first_name!: string;
   last_name!: string;

   @Type(() => Date)
   date_of_birth!: Date | null;

   phone!: string;
};

export class Instructor {
   first_name!: string;
   last_name!: string;
   short_bio!: string;
   phone!: string;
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
   return plainToInstance(Student, response.data);
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

export class AccountView {
   pk!: string;

   @Type(() => Student)
   studentInfo?: Student;

   @Type(() => Instructor)
   instructorInfo?: Instructor;

   email!: string;
   is_active!: boolean;
   role!: Role;
};

export type AccountParams = {
   page: number;
   name?: string;
   surname?: string;
   accountType?: string;
   email?: string;
   is_active?: boolean;
};

type BaseAccount = {
   email: string;
   is_active: boolean;
};

export type BaseType<T> = T & BaseAccount;

export type BaseStudent = BaseType<Student>;
export type BaseInstructor = BaseType<Instructor>;

class AccountViews {
   count!: number;

   @Type(() => AccountView)
   results!: AccountView[];
}

export async function getAccounts(params: AccountParams) {
   const resp = await api.get("/api/school/accounts/", { params });
   return plainToInstance(AccountViews, resp.data);
}
export async function getAccount(id: string) {
   const resp = await api.get(`/api/school/accounts/${id}/`);
   return plainToInstance(AccountView, resp.data);
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

export async function getAttendanceRecords(params: { page: number }) {
   const { data } = await api.get("/api/school/attendance/", { params });
   return plainToInstance(AttendanceRecords, data)}

// --- Classes / Filters (dla instruktora) ---

export interface Location {
  id: number;
  name: string;
  address?: string;
}

export interface ClassTypeMini {
  id: number;
  name: string;
  level?: string;
}

export interface InstructorMini {
  id: number;
  first_name: string;
  last_name: string;
}

export async function listClassSessions(params?: Record<string, any>): Promise<ClassSessionRow[]> {
  const response = await api.get("/api/school/classes/", { params });
  const data = response.data;

  if (data && Array.isArray(data.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}

// TODO:
// GET  /api/school/classes/{sessionId}/participants/  -> returns participants list + optional session meta + can_edit
// POST /api/school/classes/{sessionId}/participants/  -> saves attendance records

export type AttendanceStatus = "present" | "absent" | "excused";

export type ClassParticipantRow = {
  student_id: string;
  first_name: string;
  last_name: string;
  status?: AttendanceStatus;
};

export type ClassParticipantsResponse = {
  session?: any;               // TODO: session meta (date/time/type/studio)
  can_edit?: boolean;          // TODO: when false -> disable editing
  participants: ClassParticipantRow[];
};

export async function getClassParticipants(sessionId: number | string) {
  const resp = await api.get(`/api/school/classes/${sessionId}/participants/`);
  return resp.data as ClassParticipantsResponse | ClassParticipantRow[] | { results: ClassParticipantRow[] };
}

export async function saveClassAttendance(
  sessionId: number | string,
  records: Array<{ student_id: string; status: AttendanceStatus }>
) {
  const resp = await api.post(`/api/school/classes/${sessionId}/participants/`, { records });
  return resp.data as { ok: boolean };
}

export class PassProduct {
   id?: string;
   name!: string;
   description?: string;
   price_cents!: number;
   is_active!: boolean;
}

export type Page<T> = {
   count: number;
   results: T[];
   previous: string | null;
   next: string | null;
}

export class ViewSetAPI<T, F> {
   root: string;

   constructor(root: string) {
      this.root = root;
   }

   public async get(id: string) {
      const resp = await api.get(`${this.root}/${id}/`);
      return resp.data as T;
   }
   
   public async create(x: T) {
      const resp = await api.post(`${this.root}/`, instanceToPlain(x));
      return resp.data as T;
   }
   
   public async getMany(page: number, filters?: F) {
      const params = {page, ...instanceToPlain(filters)};
      const { data } = await api.get(`${this.root}/`, {params});
      return data as Page<T>;
   }
   
   public async edit(id: string, x: T) {
      const resp = await api.put(`${this.root}/${id}/`, instanceToPlain(x));
      return resp.data as T;
   }
   
   public async delete(id: string) {
      await api.delete(`${this.root}/${id}/`);
   }
}


export const passProductAPI = new ViewSetAPI<PassProduct, {is_active: boolean}>("/api/billing/pass-products");

export type PaymentStatus = "pending" | "paid" | "void";
export type PaymentMethod = "cash" | "transfer" | "card";

export class Payment {
   id!: string;
   student_id!: string;
   student_name!: string;
   product_id!: string;
   product_name!: string;
   amount_cents!: number;
   status!: PaymentStatus;
   @Type(() => Date) paid_at?: Date;
   method!: PaymentMethod;
   @Type(() => Date) period_start!: Date;
   @Type(() => Date) period_end!: Date;
   @Type(() => Date) created_at!: Date;
   @Type(() => Date) updated_at!: Date;
};

export function SafeDate() {
   return Transform(({ value }) => {
      if (!value || value === '') return undefined;
      const d = new Date(value);
      return isNaN(d.getTime()) ? undefined : d;
   }, {toClassOnly: true});
}

export function JustDate() {
   return Transform(({ value }) => {
      console.log("hello")
    if (value instanceof Date) {
      console.log("hello")
      return value.toISOString().split('T')[0];
    }
   }, {toPlainOnly: true});
}

export class PaymentPost {
   student_id!: string;
   product_id!: string;
   amount_cents?: number;
   status!: PaymentStatus;
   method!: PaymentMethod;
   @JustDate() @SafeDate() period_start!: Date;
   @JustDate() @SafeDate() period_end!: Date;
};

export async function createPayment(payment: PaymentPost) {
   console.log(payment);
   const resp = await api.post("/api/billing/purchases/", instanceToPlain(payment));
   return resp.data;
}

export class PaymentParams {
   student_name?: string;
   product_name?: string;
   status?: string;
   @JustDate() @SafeDate() period_start?: Date;
};

export const paymentAPI = new ViewSetAPI<Payment, PaymentParams>("/api/billing/purchases");

export async function markPaid(id: string) {
   const resp = await api.post(`/api/billing/purchases/${id}/mark-paid/`, {});
   return resp.data;
}

export async function voidPayment(id: string) {
   const resp = await api.post(`/api/billing/purchases/${id}/void/`, {});
   return resp.data;
}

export async function generatePayments(month: string) {
   const resp = await api.post(`/api/billing/purchases/generate-monthly/`, {month});
   return resp.data;
}
