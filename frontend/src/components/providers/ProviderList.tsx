import { Provider } from '../../types/provider';
import { formatDate } from '../../lib/utils';

interface ProviderListProps {
  providers: Provider[];
  onDelete: (id: number) => void;
  onTestConnection: (id: number) => void;
  isLoading?: boolean;
  testingId?: number;
}

export function ProviderList({
  providers,
  onDelete,
  onTestConnection,
  isLoading,
  testingId,
}: ProviderListProps) {
  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Loading providers...</div>;
  }

  if (providers.length === 0) {
    return <div className="text-center py-12 text-slate-400">No providers added yet</div>;
  }

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <div key={provider.id} className="card-premium p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between gap-4">
            {/* Left section - Provider info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 truncate">{provider.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge-info">
                      {provider.provider_type === 'contabo' ? '☁️ Contabo' : '🌊 DigitalOcean'}
                    </span>
                    <span className={provider.is_active ? 'badge-success' : 'badge-danger'}>
                      {provider.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {provider.last_sync_at && (
                <p className="text-xs text-slate-500">
                  Last sync: {formatDate(provider.last_sync_at)}
                </p>
              )}
            </div>

            {/* Right section - Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onTestConnection(provider.id)}
                disabled={testingId === provider.id}
                className="px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
              >
                {testingId === provider.id ? 'Testing...' : 'Test'}
              </button>
              <button
                onClick={() => onDelete(provider.id)}
                className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-xs font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
