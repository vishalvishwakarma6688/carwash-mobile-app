import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

export const PAYMENTS_QUERY_KEY = 'payments';

export function useGetPayments() {
  return useQuery({
    queryKey: [PAYMENTS_QUERY_KEY],
    queryFn: async () => {
      const response = await apiClient.get('/payments');
      return response.data?.data?.payments || response.data?.data || [];
    },
  });
}
