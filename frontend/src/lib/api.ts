import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface AdminCreateUserInput {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
}

export interface UpdateMeInput {
  username?: string;
  email?: string;
  password?: string;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  per_page: number;
}

// Auth API
export const authApi = {
  login: (data: LoginInput) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterInput) => api.post<AuthResponse>('/auth/register', data),
};

// User API (self)
export const userApi = {
  me: () => api.get<User>('/users/me'),
  updateMe: (data: UpdateMeInput) => api.put<User>('/users/me', data),
};

// Admin API
export const adminApi = {
  listUsers: (params?: { page?: number; per_page?: number; q?: string }) =>
    api.get<PaginatedUsers>('/admin/users', { params }),
  getUser: (id: string) => api.get<User>(`/admin/users/${id}`),
  createUser: (data: AdminCreateUserInput) => api.post<User>('/admin/users', data),
  updateUser: (id: string, data: UpdateUserInput) => api.put<User>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};
