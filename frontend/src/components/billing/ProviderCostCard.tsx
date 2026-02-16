interface ProviderCostCardProps {
  provider: string;
  total: number;
  count: number;
  percentage: number;
  currency: string;
}

export function ProviderCostCard({
  provider,
  total,
  count,
  percentage,
  currency,
}: ProviderCostCardProps) {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
  };
  const symbol = currencySymbols[currency] || '$';

  const getProviderIcon = (providerType: string) => {
    return providerType.toLowerCase() === 'contabo' ? '☁️' : '🌊';
  };

  const getProviderBgColor = (providerType: string) => {
    return providerType.toLowerCase() === 'contabo'
      ? 'from-blue-50 to-blue-100 border-blue-200'
      : 'from-cyan-50 to-cyan-100 border-cyan-200';
  };

  return (
    <div className={`card-premium p-6 bg-gradient-to-br ${getProviderBgColor(provider)} border`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getProviderIcon(provider)}</span>
            <div>
              <h3 className="font-bold text-slate-900 capitalize">{provider}</h3>
              <p className="text-sm text-slate-600">{count} instance{count !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Cost */}
        <div className="border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-600 mb-1">Monthly Cost</p>
          <p className="text-3xl font-bold text-slate-900">
            {symbol}{total.toFixed(2)}
          </p>
        </div>

        {/* Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Percentage of total</span>
            <span className="font-semibold text-slate-900">{percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
