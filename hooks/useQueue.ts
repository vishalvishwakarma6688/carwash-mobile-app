import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const QUEUE_QUERY_KEY = 'queue';

export function useGetBranchQueue(branchId: string) {
  return useQuery({
    queryKey: [QUEUE_QUERY_KEY, branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const response = await apiClient.get(API_ENDPOINTS.QUEUE.LIST_BY_BRANCH(branchId));
      return response.data?.data;
    },
    enabled: !!branchId,
  });
}

export function useCreateWalkIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (walkInData: Record<string, any>) => {
      const response = await apiClient.post(API_ENDPOINTS.QUEUE.WALK_IN, walkInData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_QUERY_KEY] });
    },
  });
}

export function useUpdateQueueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, assignedEmployeeId, priority }: { id: string; status?: string; assignedEmployeeId?: string; priority?: number }) => {
      const response = await apiClient.put(API_ENDPOINTS.QUEUE.UPDATE_STATUS(id), { status, assignedEmployeeId, priority });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_QUERY_KEY] });
    },
  });
}
