import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const BUSINESSES_QUERY_KEY = 'businesses';

export function useGetBusinesses() {
  return useQuery({
    queryKey: [BUSINESSES_QUERY_KEY],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.BUSINESSES.LIST);
      const data = response.data?.data;
      if (Array.isArray(data)) return data;
      return data?.businesses || [];
    },
  });
}
