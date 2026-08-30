import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const BOOKINGS_QUERY_KEY = 'bookings';

export function useGetBookings(params?: { branchId?: string; customerId?: string; status?: string }) {
  return useQuery({
    queryKey: [BOOKINGS_QUERY_KEY, params],
    queryFn: async () => {
      const endpoint = API_ENDPOINTS.BOOKINGS.LIST(params?.branchId, params?.customerId, params?.status);
      const response = await apiClient.get(endpoint);
      return response.data?.data;
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: Record<string, any>) => {
      const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.CREATE, bookingData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKINGS_QUERY_KEY] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const response = await apiClient.put(API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(id), { status, notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKINGS_QUERY_KEY] });
    },
  });
}
