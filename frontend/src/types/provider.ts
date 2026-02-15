export type ProviderType = 'contabo' | 'digitalocean';

export interface Provider {
  id: number;
  name: string;
  provider_type: ProviderType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_sync_at: string | null;
  last_sync_status: string | null;
}

export interface CreateProviderRequest {
  name: string;
  provider_type: ProviderType;
  credentials: Record<string, string>;
  is_active: boolean;
}

export interface ProviderCredentials {
  contabo: {
    client_id: string;
    client_secret: string;
    api_user: string;
    api_password: string;
  };
  digitalocean: {
    token: string;
  };
}
