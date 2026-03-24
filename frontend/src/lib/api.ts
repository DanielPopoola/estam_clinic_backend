import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// ── Storage helpers ─────────────────────────────────────────────────────────
export const token = {
  getAccess: () => localStorage.getItem('access_token'),
  getRefresh: () => localStorage.getItem('refresh_token'),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// ── Axios instance ───────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the Bearer token to every outgoing request
api.interceptors.request.use((config) => {
  const access = token.getAccess();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// On 401, try to refresh. If refresh also fails, clear tokens and redirect.
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, newToken: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(newToken!)));
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newAccess) => {
          original.headers.Authorization = `Bearer ${newAccess}`;
          return api(original);
        })
        .catch((err) => Promise.reject(err));
    }

    original._retry = true;
    isRefreshing = true;

    const refresh = token.getRefresh();
    if (!refresh) {
      token.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${BASE_URL}/api/accounts/token/refresh/`, {
        refresh,
      });
      token.setTokens(data.access, data.refresh ?? refresh);
      processQueue(null, data.access);
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      token.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/api/accounts/token/', { username, password }),
};

// ── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  me: () => api.get('/api/accounts/users/me/'),
  list: () => api.get('/api/accounts/users/'),
  doctors: () => api.get('/api/accounts/users/doctors/'),
};

// ── Patients ─────────────────────────────────────────────────────────────────
export const patientsApi = {
  list: (params?: { search?: string; category?: string; page?: number }) =>
    api.get('/api/clinic/patients/', { params }),
  get: (id: number) => api.get(`/api/clinic/patients/${id}/`),
  create: (data: Record<string, unknown>) => api.post('/api/clinic/patients/', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.patch(`/api/clinic/patients/${id}/`, data),
  delete: (id: number) => api.delete(`/api/clinic/patients/${id}/`),
};

// ── Appointments ──────────────────────────────────────────────────────────────
export const appointmentsApi = {
  list: (params?: { status?: string; date?: string; doctor?: number; page?: number }) =>
    api.get('/api/clinic/appointments/', { params }),
  get: (id: number) => api.get(`/api/clinic/appointments/${id}/`),
  create: (data: Record<string, unknown>) => api.post('/api/clinic/appointments/', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.patch(`/api/clinic/appointments/${id}/`, data),
  delete: (id: number) => api.delete(`/api/clinic/appointments/${id}/`),
};

// ── Medical Records ────────────────────────────────────────────────────────────
export const recordsApi = {
  list: () => api.get('/api/clinic/records/'),
  get: (id: number) => api.get(`/api/clinic/records/${id}/`),
  create: (data: Record<string, unknown>) => api.post('/api/clinic/records/', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.patch(`/api/clinic/records/${id}/`, data),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get('/api/clinic/dashboard/'),
};