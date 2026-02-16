import apiClient from './client';

export interface InstanceCustomPrice {
  id: number;
  provider: number;
  instance_id: string;
  instance_ip?: string;
  monthly_price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInstancePriceRequest {
  provider: number;
  instance_id: string;
  instance_ip?: string;
  monthly_price: number;
  currency?: string;
  is_active?: boolean;
}

export interface UpdateInstancePriceRequest {
  monthly_price?: number;
  instance_ip?: string;
  currency?: string;
  is_active?: boolean;
}

const basePath = 'instance-prices';

export const instancePricesApi = {
  // Get price for a specific instance
  async getPrice(
    providerId: number,
    instanceId: string
  ): Promise<InstanceCustomPrice | null> {
    try {
      const response = await apiClient.get<InstanceCustomPrice[]>(basePath, {
        params: {
          provider: providerId,
          search: instanceId,
        },
      });

      const prices = response.data;
      // Find exact match by instance_id
      return prices.find((p) => p.instance_id === instanceId) || null;
    } catch (error) {
      console.error('Failed to fetch price:', error);
      return null;
    }
  },

  // List all prices for a provider
  async listByProvider(providerId: number): Promise<InstanceCustomPrice[]> {
    try {
      const response = await apiClient.get<InstanceCustomPrice[]>(basePath, {
        params: {
          provider: providerId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      return [];
    }
  },

  // Create new custom price
  async create(data: CreateInstancePriceRequest): Promise<InstanceCustomPrice> {
    try {
      const response = await apiClient.post<InstanceCustomPrice>(basePath, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create price:', error);
      throw error;
    }
  },

  // Update existing price
  async update(
    id: number,
    data: UpdateInstancePriceRequest
  ): Promise<InstanceCustomPrice> {
    try {
      const response = await apiClient.patch<InstanceCustomPrice>(
        `${basePath}/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update price:', error);
      throw error;
    }
  },

  // Delete price
  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`${basePath}/${id}`);
    } catch (error) {
      console.error('Failed to delete price:', error);
      throw error;
    }
  },
};
