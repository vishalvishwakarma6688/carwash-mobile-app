import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const VEHICLES_QUERY_KEY = 'vehicles';

export function useGetCustomerVehicles(customerId?: string) {
  return useQuery({
    queryKey: [VEHICLES_QUERY_KEY, customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const response = await apiClient.get(API_ENDPOINTS.VEHICLES.LIST_BY_CUSTOMER(customerId));
      return response.data?.data || [];
    },
    enabled: !!customerId,
  });
}

export function useAddVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleData: {
      customerId: string;
      plateNumber: string;
      brand: string;
      model: string;
      color?: string;
      vehicleType?: string;
    }) => {
      const response = await apiClient.post(API_ENDPOINTS.VEHICLES.CREATE, vehicleData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VEHICLES_QUERY_KEY] });
    },
  });
}
