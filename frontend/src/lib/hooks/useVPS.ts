import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vpsApi } from '../api/vps';
import { VPSFilters } from '../../types/vps';

const VPS_QUERY_KEY = ['vps'];

export const useVPS = (filters?: VPSFilters) => {
  return useQuery({
    queryKey: [...VPS_QUERY_KEY, filters],
    queryFn: async () => {
      const response = await vpsApi.getAll(filters);
      return {
        instances: response.results,
        fetchedAt: response.fetched_at,
      };
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Auto-refetch every 1 minute
  });
};

export const useVPSByProvider = (providerId: number, filters?: VPSFilters) => {
  return useQuery({
    queryKey: [...VPS_QUERY_KEY, 'provider', providerId, filters],
    queryFn: async () => {
      const response = await vpsApi.getByProvider(providerId, filters);
      return {
        instances: response.results,
        fetchedAt: response.fetched_at,
      };
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });
};

export const useRefreshVPS = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => vpsApi.refresh(),
    onSuccess: async () => {
      // Invalidate and refetch immediately
      await queryClient.invalidateQueries({ queryKey: VPS_QUERY_KEY });
    },
  });
};
