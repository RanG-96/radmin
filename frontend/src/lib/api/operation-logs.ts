import http from '../http';
import type { PaginatedOperationLogs } from '../types/operation-log';

export const operationLogsApi = {
  list: (params?: {
    page?: number;
    per_page?: number;
    username?: string;
    path?: string;
    method?: string;
  }) => http.get<PaginatedOperationLogs>('/admin/operation-logs', { params }),
};
