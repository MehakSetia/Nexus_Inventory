import axios from 'axios';
import { getStoredToken } from '../auth/tokenStore.js';

export function createApi(baseURL) {
  const api = axios.create({ baseURL });

  api.interceptors.request.use((config) => {
    const stored = getStoredToken();
    const token = stored?.token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
}

