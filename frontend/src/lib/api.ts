import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  Appointment,
  DashboardStats,
  MedicalRecord,
  Paginated,
  Patient,
  TokenPair,
  User,
} from './types';

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export const token = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const access = token.getAccess();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  const refresh = token.getRefresh();
  if (!refresh) {
    throw new Error('No refresh token found');
  }
  const { data } = await axios.post<TokenPair>(
    `${import.meta.env.VITE_API_URL}/api/accounts/token/refresh/`,
    { refresh }
  );
  token.setTokens(data.access, refresh);
  return data.access;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    if (!original) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken().finally(() => {
          isRefreshing = false;
        });
      }

      const newAccess = await refreshPromise;
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (refreshErr) {
      token.clear();
      return Promise.reject(refreshErr);
    }
  }
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post<TokenPair>('/api/accounts/token/', { username, password }),
};

export const usersApi = {
  list: () => api.get<Paginated<User> | User[]>('/api/accounts/users/'),
  me: () => api.get<User>('/api/accounts/users/me/'),
  doctors: () => api.get<User[]>('/api/accounts/users/doctors/'),
};

export const patientsApi = {
  list: (params?: { search?: string; category?: string; page?: number }) =>
    api.get<Paginated<Patient>>('/api/clinic/patients/', { params }),
  get: (id: number) => api.get<Patient>(`/api/clinic/patients/${id}/`),
  create: (payload: Partial<Patient>) => api.post<Patient>('/api/clinic/patients/', payload),
  update: (id: number, payload: Partial<Patient>) =>
    api.patch<Patient>(`/api/clinic/patients/${id}/`, payload),
  delete: (id: number) => api.delete(`/api/clinic/patients/${id}/`),
};

export const appointmentsApi = {
  list: (params?: { search?: string; date?: string; status?: string; doctor?: number; page?: number }) =>
    api.get<Paginated<Appointment>>('/api/clinic/appointments/', { params }),
  get: (id: number) => api.get<Appointment>(`/api/clinic/appointments/${id}/`),
  create: (payload: Partial<Appointment>) =>
    api.post<Appointment>('/api/clinic/appointments/', payload),
  update: (id: number, payload: Partial<Appointment>) =>
    api.patch<Appointment>(`/api/clinic/appointments/${id}/`, payload),
  delete: (id: number) => api.delete(`/api/clinic/appointments/${id}/`),
};

export const recordsApi = {
  list: (params?: { page?: number }) =>
    api.get<Paginated<MedicalRecord>>('/api/clinic/records/', { params }),
  get: (id: number) => api.get<MedicalRecord>(`/api/clinic/records/${id}/`),
  create: (payload: Partial<MedicalRecord>) =>
    api.post<MedicalRecord>('/api/clinic/records/', payload),
  update: (id: number, payload: Partial<MedicalRecord>) =>
    api.patch<MedicalRecord>(`/api/clinic/records/${id}/`, payload),
};

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/api/clinic/dashboard/'),
};

export default api;
