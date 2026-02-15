import axios, { AxiosInstance } from 'axios';

let token: string | null = null;

const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setAuthToken = (newToken: string) => {
  token = newToken;
};

export const clearAuthToken = () => {
  token = null;
};

export default apiClient;
