import api from './client';
import { AuthResponse, User } from '../types';

export const register = (username: string, email: string, password: string) =>
  api.post<AuthResponse>('/auth/register', { username, email, password }).then((r) => r.data);

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data);

export const getMe = () =>
  api.get<{ user: User }>('/auth/me').then((r) => r.data.user);
