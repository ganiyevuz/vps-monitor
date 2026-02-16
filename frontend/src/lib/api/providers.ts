import client from './client';
import { Provider, CreateProviderRequest } from '../../types/provider';

export const providersApi = {
  getAll: async () => {
    const response = await client.get<{ results: Provider[] }>('providers');
    return response.data.results;
  },

  getOne: async (id: number) => {
    const response = await client.get<Provider>(`providers/${id}`);
    return response.data;
  },

  create: async (data: CreateProviderRequest) => {
    const response = await client.post<Provider>('providers', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateProviderRequest>) => {
    const response = await client.patch<Provider>(`providers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await client.delete(`providers/${id}`);
  },

  testConnection: async (id: number) => {
    const response = await client.post<{ status: string; message: string }>(
      `providers/${id}/test-connection`
    );
    return response.data;
  },
};
