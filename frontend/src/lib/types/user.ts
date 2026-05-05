export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
