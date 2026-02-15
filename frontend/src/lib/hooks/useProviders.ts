import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providersApi } from '../api/providers';
import { Provider, CreateProviderRequest } from '../../types/provider';

const PROVIDERS_QUERY_KEY = ['providers'];

export const useProviders = () => {
  return useQuery({
    queryKey: PROVIDERS_QUERY_KEY,
    queryFn: () => providersApi.getAll(),
  });
};

export const useProvider = (id: number) => {
  return useQuery({
    queryKey: [...PROVIDERS_QUERY_KEY, id],
    queryFn: () => providersApi.getOne(id),
  });
};

export const useCreateProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProviderRequest) => providersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROVIDERS_QUERY_KEY });
    },
  });
};

export const useUpdateProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateProviderRequest> }) =>
      providersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROVIDERS_QUERY_KEY });
    },
  });
};

export const useDeleteProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => providersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROVIDERS_QUERY_KEY });
    },
  });
};

export const useTestConnection = () => {
  return useMutation({
    mutationFn: (id: number) => providersApi.testConnection(id),
  });
};
