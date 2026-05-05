import http from '../http';
import type { AuthResponse, LoginInput, RegisterInput } from '../types/auth';

export const authApi = {
  login: (data: LoginInput) => http.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterInput) => http.post<AuthResponse>('/auth/register', data),
};
