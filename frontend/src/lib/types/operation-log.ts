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
