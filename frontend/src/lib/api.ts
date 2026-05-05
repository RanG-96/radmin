export { default } from './http';

export { authApi } from './api/auth';
export { adminApi, userApi } from './api/users';
export { settingsApi } from './api/settings';
export { filesApi } from './api/files';
export { dictApi } from './api/dict';
export { notificationsApi } from './api/notifications';
export { operationLogsApi } from './api/operation-logs';

export type {
  AuthResponse,
  LoginInput,
  RegisterInput,
} from './types/auth';
export type {
  AdminCreateUserInput,
  PaginatedUsers,
  UpdateMeInput,
  UpdateUserInput,
  User,
} from './types/user';
export type { Setting } from './types/setting';
export type { FileRecord, PaginatedFiles } from './types/file';
export type {
  CreateDictItemInput,
  CreateDictTypeInput,
  DictItem,
  DictItemsByType,
  DictType,
  PaginatedDictTypes,
  UpdateDictItemInput,
  UpdateDictTypeInput,
} from './types/dict';
export type {
  CreateNotificationInput,
  Notification,
  PaginatedNotifications,
  UnreadCount,
} from './types/notification';
export type {
  OperationLog,
  PaginatedOperationLogs,
} from './types/operation-log';
