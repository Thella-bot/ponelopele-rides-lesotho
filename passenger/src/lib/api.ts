import axios from 'axios';
import { CreateUserDto } from '../../../backend/src/auth/dto/create-user.dto';
import { LoginUserDto } from '../../../backend/src/auth/dto/login-user.dto';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const signIn = async (data: LoginUserDto) => {
  const response = await api.post('/auth/signin', data);
  return response.data;
};

export const signUp = async (data: CreateUserDto) => {
  const response = await api.post('/auth/signup', data);
  return response.data;
};

export const requestRide = async (data: {
  pickupLat: number;
  pickupLng: number;
  pickupName: string;
  destLat: number;
  destLng: number;
  destName: string;
  passengerId: string;
}) => {
  const response = await api.post('/rides', data);
  return response.data;
};

export const estimateRideFare = async (params: {
  pickupLat: number;
  pickupLng: number;
  destLat: number;
  destLng: number;
  durationMinutes?: number;
}) => {
  const response = await api.get('/rides/estimate', { params });
  return response.data;
};