/**
 * useAuth.ts
 * Manages authentication state: reads token from localStorage,
 * exposes login / register / logout methods.
 */

import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import * as authApi from '../api/auth';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    authApi.getMe()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await authApi.login(email, password);
    localStorage.setItem('token', token);
    setUser(u);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const { token, user: u } = await authApi.register(username, email, password);
    localStorage.setItem('token', token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return { user, loading, login, register, logout };
};
