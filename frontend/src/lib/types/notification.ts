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
