import axios from 'axios';
import type { CreateUserDto, LoginUserDto } from './auth.dto';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const signIn = async (data: LoginUserDto) => {
  const response = await api.post('/auth/signin', data);
  return response.data;
};

export const signUp = async (data: CreateUserDto) => {
  const response = await api.post('/auth/signup', data);
  return response.data;
};

export const getRideHistory = async (token: string) => {
  const response = await api.get('/rides/history', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getProfile = async (token: string) => {
  const response = await api.get('/auth/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export default api;
