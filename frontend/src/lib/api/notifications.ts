import http from '../http';
import type {
  CreateNotificationInput,
  Notification,
  PaginatedNotifications,
  UnreadCount,
} from '../types/notification';

export const notificationsApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    http.get<PaginatedNotifications>('/notifications', { params }),
  unreadCount: () => http.get<UnreadCount>('/notifications/unread-count'),
  markRead: (id: string) => http.put(`/notifications/${id}/read`),
  markAllRead: () => http.put('/notifications/read-all'),
  create: (data: CreateNotificationInput) =>
    http.post<Notification>('/admin/notifications', data),
};
