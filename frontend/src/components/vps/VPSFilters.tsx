import { VPSFilters } from '../../types/vps';

interface VPSFiltersProps {
  filters: VPSFilters;
  onFiltersChange: (filters: VPSFilters) => void;
}

export function VPSFiltersComponent({ filters, onFiltersChange }: VPSFiltersProps) {
  return (
    <div className="card-premium p-6 flex gap-4 flex-wrap items-end">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Provider</label>
        <select
          value={filters.provider_type || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, provider_type: e.target.value || undefined })
          }
          className="input-premium"
        >
          <option value="">All Providers</option>
          <option value="contabo">Contabo</option>
          <option value="digitalocean">DigitalOcean</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
        <select
          value={filters.status || ''}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
          className="input-premium"
        >
          <option value="">All Statuses</option>
          <option value="running">Running</option>
          <option value="stopped">Stopped</option>
          <option value="error">Error</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Region</label>
        <input
          type="text"
          placeholder="Filter by region"
          value={filters.region || ''}
          onChange={(e) => onFiltersChange({ ...filters, region: e.target.value || undefined })}
          className="input-premium"
        />
      </div>

      <button
        onClick={() => onFiltersChange({})}
        className="btn-secondary"
      >
        Clear Filters
      </button>
    </div>
  );
}
