import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const SERVICES_QUERY_KEY = 'services';
export const PACKAGES_QUERY_KEY = 'service_packages';

export function useGetServices(businessId?: string) {
  return useQuery({
    queryKey: [SERVICES_QUERY_KEY, businessId],
    queryFn: async () => {
      const url = businessId
        ? API_ENDPOINTS.SERVICES.LIST_BY_BUSINESS(businessId)
        : '/services';
      const response = await apiClient.get(url);
      return response.data?.data || [];
    },
  });
}

export function useGetPackages(businessId?: string) {
  return useQuery({
    queryKey: [PACKAGES_QUERY_KEY, businessId],
    queryFn: async () => {
      const url = businessId
        ? API_ENDPOINTS.SERVICES.PACKAGES.LIST(businessId)
        : '/services/packages/list';
      const response = await apiClient.get(url);
      return response.data?.data || [];
    },
  });
}
