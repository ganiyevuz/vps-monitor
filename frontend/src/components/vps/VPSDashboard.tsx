import { useState } from 'react';
import { useVPS, useRefreshVPS } from '../../lib/hooks/useVPS';
import { VPSFilters } from '../../types/vps';
import { VPSTable } from './VPSTable';
import { VPSFiltersComponent } from './VPSFilters';
import { RefreshCw, AlertCircle, Clock } from 'lucide-react';

export function VPSDashboard() {
  const [filters, setFilters] = useState<VPSFilters>({});
  const { data, isLoading, error } = useVPS(filters);
  const instances = data?.instances ?? [];
  const fetchedAt = data?.fetchedAt;
  const { mutate: refresh, isPending: isRefreshing } = useRefreshVPS();

  const stats = {
    total: instances.length,
    running: instances.filter((i) => i.status === 'running').length,
    stopped: instances.filter((i) => i.status === 'stopped').length,
  };

  const formatFetchedTime = (isoString?: string) => {
    if (!isoString) return 'Never';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins === 0) return 'Just now';
      if (diffMins === 1) return '1 minute ago';
      if (diffMins < 60) return `${diffMins} minutes ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) return '1 hour ago';
      if (diffHours < 24) return `${diffHours} hours ago`;

      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">VPS Dashboard</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-slate-500 text-sm">Monitor and manage all your cloud instances</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
              <Clock size={14} />
              Last fetched: {formatFetchedTime(fetchedAt)}
            </div>
          </div>
        </div>
        <button
          onClick={() => refresh()}
          disabled={isRefreshing}
          className="btn-primary"
          title="Refresh data from API"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Instances</p>
              <p className="stat-value">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Running</p>
              <p className="stat-value text-green-600">{stats.running}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <span className="text-2xl">✓</span>
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Stopped</p>
              <p className="stat-value text-red-600">{stats.stopped}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <span className="text-2xl">⊘</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <VPSFiltersComponent filters={filters} onFiltersChange={setFilters} />

      {/* Error Handling */}
      {error && (
        <div className="card-premium bg-red-50 border border-red-200 p-4 flex gap-4 items-start">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-red-900">Error loading VPS instances</p>
            <p className="text-red-700 text-sm mt-1">
              {error instanceof Error
                ? error.message
                : (error as any)?.response?.data?.error
                ? (error as any).response.data.error
                : 'Unknown error occurred'}
            </p>
          </div>
        </div>
      )}

      {/* VPS Table */}
      <VPSTable instances={instances} isLoading={isLoading} />
    </div>
  );
}
