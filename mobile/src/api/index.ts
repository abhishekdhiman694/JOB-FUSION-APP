import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { store } from '../store';
import { logout } from '../store/authSlice';

// Use host machine IP for android emulator, localhost for iOS simulator, or LAN IP for physical device
const LAN_IP = '192.168.1.33';
const BASE_URL = `http://${LAN_IP}:3000/api`; 
// const BASE_URL = 'http://10.0.2.2:3000/api'; // Android Emulator
// const BASE_URL = 'http://localhost:3000/api'; // iOS / Physical

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default api;
