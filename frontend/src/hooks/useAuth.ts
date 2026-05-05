import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api/auth';
import { userApi } from '../lib/api/users';
import type { LoginInput, RegisterInput } from '../lib/types/auth';
import type { User } from '../lib/types/user';

export function useAuth() {
  const token = localStorage.getItem('token');
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      return;
    }
    userApi.me()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (input: LoginInput) => {
    const res = await authApi.login(input);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    navigate('/');
  }, [navigate]);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await authApi.register(input);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    navigate('/');
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  return { user, loading, login, register, logout };
}
