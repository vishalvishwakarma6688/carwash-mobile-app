import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { apiClient, TOKEN_KEY, REFRESH_TOKEN_KEY } from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const AUTH_QUERY_KEY = ['auth', 'profile'];

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: Record<string, any>) => {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data;
    },
    onSuccess: async (res) => {
      if (res?.data?.tokens) {
        await SecureStore.setItemAsync(TOKEN_KEY, res.data.tokens.accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, res.data.tokens.refreshToken);
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      }
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Record<string, any>) => {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    },
    onSuccess: async (res) => {
      if (res?.data?.tokens) {
        await SecureStore.setItemAsync(TOKEN_KEY, res.data.tokens.accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, res.data.tokens.refreshToken);
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      }
    },
  });
}

export function useGetProfile() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) return null;
      const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
      return response.data?.data;
    },
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
        }
      } catch (err) {
        console.warn('Logout endpoint error:', err);
      } finally {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace('/auth/login' as any);
    },
  });
}
