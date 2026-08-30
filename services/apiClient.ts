import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/apiEndpoints';

export const TOKEN_KEY = 'carwash_access_token';
export const REFRESH_TOKEN_KEY = 'carwash_refresh_token';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach Access Token to Authorization Header
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error reading access token from SecureStore:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Automatic Refresh Token Rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
            refreshToken,
          });

          if (data?.data?.accessToken) {
            await SecureStore.setItemAsync(TOKEN_KEY, data.data.accessToken);
            if (data.data.refreshToken) {
              await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.data.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh token failed -> clear stored tokens
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    }

    return Promise.reject(error);
  }
);
