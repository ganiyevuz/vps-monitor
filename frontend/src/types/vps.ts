export interface VPSInstance {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  ipv4: string;
  ipv6: string | null;
  cpu_cores: number;
  ram_mb: number;
  disk_gb: number;
  region: string;
  created_at: string;
  provider_type: string;
  provider_account_id: number;
  plan: string | null;
  monthly_price: number | null;
  currency: string;
}

export interface VPSFilters {
  provider_type?: string;
  status?: string;
  region?: string;
}
