import client from './client';
import { VPSInstance, VPSFilters } from '../../types/vps';

export interface VPSResponse {
  results: VPSInstance[];
  count: number;
  fetched_at: string;
}

export const vpsApi = {
  getAll: async (filters?: VPSFilters): Promise<VPSResponse> => {
    const params = new URLSearchParams();
    if (filters?.provider_type) params.append('provider_type', filters.provider_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.region) params.append('region', filters.region);

    const queryString = params.toString();
    const url = queryString ? `vps?${queryString}` : 'vps';

    const response = await client.get<VPSResponse>(url);
    return response.data;
  },

  getByProvider: async (providerId: number, filters?: VPSFilters): Promise<VPSResponse> => {
    const params = new URLSearchParams({ provider_id: providerId.toString() });
    if (filters?.status) params.append('status', filters.status);
    if (filters?.region) params.append('region', filters.region);

    const response = await client.get<VPSResponse>(
      `vps/by-provider?${params.toString()}`
    );
    return response.data;
  },

  refresh: async () => {
    const response = await client.post<{ status: string; message: string }>(
      'vps/refresh'
    );
    return response.data;
  },
};
