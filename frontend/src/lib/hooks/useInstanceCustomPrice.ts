import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  instancePricesApi,
  InstanceCustomPrice,
  CreateInstancePriceRequest,
  UpdateInstancePriceRequest,
} from '../api/instance-prices';

export function useInstanceCustomPrice(providerId: number, instanceId: string) {
  return useQuery({
    queryKey: ['instance-price', providerId, instanceId],
    queryFn: () => instancePricesApi.getPrice(providerId, instanceId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateInstanceCustomPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInstancePriceRequest) =>
      instancePricesApi.create(data),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['instance-price', data.provider, data.instance_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['instance-prices'],
      });
    },
  });
}

export function useUpdateInstanceCustomPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateInstancePriceRequest;
    }) => instancePricesApi.update(id, data),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['instance-price', data.provider, data.instance_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['instance-prices'],
      });
    },
  });
}

export function useDeleteInstanceCustomPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => instancePricesApi.delete(id),
    onSuccess: () => {
      // Invalidate all instance price queries
      queryClient.invalidateQueries({
        queryKey: ['instance-price'],
      });
      queryClient.invalidateQueries({
        queryKey: ['instance-prices'],
      });
    },
  });
}
