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

// Settings
export interface Setting {
  key: string;
  value: string;
}

// Files
export interface FileRecord {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  uploader_id: string | null;
  created_at: string;
}

export interface PaginatedFiles {
  data: FileRecord[];
  total: number;
  page: number;
  per_page: number;
}

// Dict
export interface DictType {
  id: string;
  name: string;
  type_code: string;
  remark: string | null;
  status: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDictTypeInput {
  name: string;
  type_code: string;
  remark?: string;
  status?: boolean;
}

export interface UpdateDictTypeInput {
  name?: string;
  type_code?: string;
  remark?: string;
  status?: boolean;
}

export interface PaginatedDictTypes {
  data: DictType[];
  total: number;
  page: number;
  per_page: number;
}

export interface DictItem {
  id: string;
  dict_type_id: string;
  label: string;
  value: string;
  sort_order: number;
  status: boolean;
  remark: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDictItemInput {
  dict_type_id: string;
  label: string;
  value: string;
  sort_order?: number;
  remark?: string;
  status?: boolean;
}

export interface UpdateDictItemInput {
  label?: string;
  value?: string;
  sort_order?: number;
  status?: boolean;
  remark?: string;
}

export interface DictItemsByType {
  type_code: string;
  items: DictItem[];
}

// Operation Logs
export interface OperationLog {
  id: string;
  user_id: string | null;
  username: string | null;
  method: string;
  path: string;
  query: string | null;
  body: string | null;
  ip: string | null;
  status_code: number;
  duration_ms: number;
  created_at: string;
}

export interface PaginatedOperationLogs {
  data: OperationLog[];
  total: number;
  page: number;
  per_page: number;
}

// Notifications
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  per_page: number;
}

export interface UnreadCount {
  count: number;
}

export interface CreateNotificationInput {
  user_id: string;
  title: string;
  content: string;
  notification_type?: string;
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

// Settings API
export const settingsApi = {
  get: () => api.get<Setting[]>('/settings'),
  update: (settings: Record<string, string>) =>
    api.put<Setting[]>('/settings', { settings }),
};

// Files API
export const filesApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<FileRecord>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedFiles>('/files', { params }),
  download: (id: string) =>
    api.get(`/files/${id}/download`, { responseType: 'blob' }),
  delete: (id: string) => api.delete(`/files/${id}`),
};

// Dict API
export const dictApi = {
  // Admin: dict types
  listTypes: (params?: { page?: number; per_page?: number; q?: string }) =>
    api.get<PaginatedDictTypes>('/admin/dict-types', { params }),
  getType: (id: string) =>
    api.get<DictType>(`/admin/dict-types/${id}`),
  createType: (data: CreateDictTypeInput) =>
    api.post<DictType>('/admin/dict-types', data),
  updateType: (id: string, data: UpdateDictTypeInput) =>
    api.put<DictType>(`/admin/dict-types/${id}`, data),
  deleteType: (id: string) => api.delete(`/admin/dict-types/${id}`),
  // Admin: dict items
  listItems: (dict_type_id: string) =>
    api.get<DictItem[]>('/admin/dict-items', { params: { dict_type_id } }),
  createItem: (data: CreateDictItemInput) =>
    api.post<DictItem>('/admin/dict-items', data),
  updateItem: (id: string, data: UpdateDictItemInput) =>
    api.put<DictItem>(`/admin/dict-items/${id}`, data),
  deleteItem: (id: string) => api.delete(`/admin/dict-items/${id}`),
  // Public: by type_code
  getByTypeCode: (typeCode: string) =>
    api.get<DictItemsByType>(`/dict/${typeCode}`),
};

// Operation Logs API
export const operationLogsApi = {
  list: (params?: {
    page?: number;
    per_page?: number;
    username?: string;
    path?: string;
    method?: string;
  }) => api.get<PaginatedOperationLogs>('/admin/operation-logs', { params }),
};

// Notifications API
export const notificationsApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedNotifications>('/notifications', { params }),
  unreadCount: () => api.get<UnreadCount>('/notifications/unread-count'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  create: (data: CreateNotificationInput) =>
    api.post<Notification>('/admin/notifications', data),
};
