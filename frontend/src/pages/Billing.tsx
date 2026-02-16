import { useVPS } from '../lib/hooks/useVPS';
import { Layout } from '../components/layout/Layout';
import { RefreshCw, AlertCircle, Clock, DollarSign, Server, TrendingUp } from 'lucide-react';
import { useRefreshVPS } from '../lib/hooks/useVPS';
import { CostChart } from '../components/billing/CostChart';
import { ProviderCostCard } from '../components/billing/ProviderCostCard';

export function BillingPage() {
  const { data, isLoading, error } = useVPS();
  const instances = data?.instances ?? [];
  const fetchedAt = data?.fetchedAt;
  const { mutate: refresh, isPending: isRefreshing } = useRefreshVPS();

  // Calculate billing data
  const providerCosts = instances.reduce((acc, instance) => {
    if (!instance.monthly_price) return acc;
    const provider = instance.provider_type;
    if (!acc[provider]) {
      acc[provider] = { total: 0, count: 0, currency: instance.currency };
    }
    acc[provider].total += instance.monthly_price;
    acc[provider].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number; currency: string }>);

  const totalMonthlyCost = instances.reduce((sum, i) => sum + (i.monthly_price || 0), 0);
  const activeInstanceCount = instances.filter(i => i.monthly_price).length;
  const averageCost = activeInstanceCount > 0 ? totalMonthlyCost / activeInstanceCount : 0;

  // Provider colors
  const providerColors: Record<string, string> = {
    contabo: '#3B82F6',
    digitalocean: '#06B6D4',
  };

  const getProviderColor = (provider: string) => {
    return providerColors[provider.toLowerCase()] || '#8B5CF6';
  };

  const chartData = Object.entries(providerCosts).map(([provider, data]) => ({
    provider,
    cost: data.total,
    color: getProviderColor(provider),
  }));

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'CA$',
    };
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatFetchedTime = (isoString?: string) => {
    if (!isoString) return 'Never';
    try {
      // Ensure the ISO string has Z suffix for UTC interpretation
      const utcString = isoString.endsWith('Z') ? isoString : `${isoString}Z`;
      const date = new Date(utcString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins === 0) return 'Just now';
      if (diffMins === 1) return '1 minute ago';
      if (diffMins < 60) return `${diffMins} minutes ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) return '1 hour ago';
      if (diffHours < 24) return `${diffHours} hours ago`;

      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Billing Overview</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-slate-500 text-sm">Monitor and track your cloud spending across all providers</p>
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

        {/* Error Handling */}
        {error && (
          <div className="card-premium bg-red-50 border border-red-200 p-4 flex gap-4 items-start">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-red-900">Error loading billing data</p>
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

        {/* Stats Cards */}
        {activeInstanceCount > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat-card group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-label">Total Monthly Cost</p>
                    <p className="stat-value text-green-600">{formatCurrency(totalMonthlyCost)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <DollarSign size={24} className="text-green-600" />
                  </div>
                </div>
              </div>

              <div className="stat-card group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-label">Active Instances</p>
                    <p className="stat-value text-blue-600">{activeInstanceCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Server size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="stat-card group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-label">Average Cost per Instance</p>
                    <p className="stat-value text-purple-600">{formatCurrency(averageCost)}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <TrendingUp size={24} className="text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Breakdown Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Provider Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(providerCosts).map(([provider, data]) => (
                  <ProviderCostCard
                    key={provider}
                    provider={provider}
                    total={data.total}
                    count={data.count}
                    percentage={(data.total / totalMonthlyCost) * 100}
                    currency={data.currency}
                  />
                ))}
              </div>
            </div>

            {/* Cost Visualization */}
            {chartData.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Cost Distribution</h2>
                <CostChart data={chartData} />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
              <DollarSign size={40} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-600 mb-2">No Billing Data Available</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">No instances with pricing information found. Add VPS instances to see billing data.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
