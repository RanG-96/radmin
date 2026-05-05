import http from '../http';
import type {
  AdminCreateUserInput,
  PaginatedUsers,
  UpdateMeInput,
  UpdateUserInput,
  User,
} from '../types/user';

export const userApi = {
  me: () => http.get<User>('/users/me'),
  updateMe: (data: UpdateMeInput) => http.put<User>('/users/me', data),
};

export const adminApi = {
  listUsers: (params?: { page?: number; per_page?: number; q?: string }) =>
    http.get<PaginatedUsers>('/admin/users', { params }),
  getUser: (id: string) => http.get<User>(`/admin/users/${id}`),
  createUser: (data: AdminCreateUserInput) => http.post<User>('/admin/users', data),
  updateUser: (id: string, data: UpdateUserInput) =>
    http.put<User>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => http.delete(`/admin/users/${id}`),
};
