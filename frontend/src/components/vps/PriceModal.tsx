import { useState, useEffect } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import { useInstanceCustomPrice, useCreateInstanceCustomPrice, useUpdateInstanceCustomPrice, useDeleteInstanceCustomPrice } from '../../lib/hooks/useInstanceCustomPrice';
import { useToast } from '../../lib/hooks/useToast';

interface PriceModalProps {
  isOpen: boolean;
  instanceId: string;
  instanceName: string;
  providerId: number;
  currentPrice: number | null;
  onClose: () => void;
}

export function PriceModal({ isOpen, instanceId, instanceName, providerId, currentPrice, onClose }: PriceModalProps) {
  const [monthlyPrice, setMonthlyPrice] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [isActive, setIsActive] = useState(true);
  const { showToast } = useToast();

  // Fetch existing custom price
  const { data: customPrice, isLoading: isFetching } = useInstanceCustomPrice(providerId, instanceId);

  // Mutations
  const createMutation = useCreateInstanceCustomPrice();
  const updateMutation = useUpdateInstanceCustomPrice();
  const deleteMutation = useDeleteInstanceCustomPrice();

  // Initialize form when custom price is loaded
  useEffect(() => {
    if (customPrice) {
      setMonthlyPrice(customPrice.monthly_price.toString());
      setCurrency(customPrice.currency);
      setIsActive(customPrice.is_active);
    } else {
      setMonthlyPrice(currentPrice?.toFixed(2) || '');
      setCurrency('USD');
      setIsActive(true);
    }
  }, [customPrice, currentPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!monthlyPrice || parseFloat(monthlyPrice) < 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    try {
      if (customPrice) {
        // Update existing
        await updateMutation.mutateAsync({
          id: customPrice.id,
          data: {
            monthly_price: parseFloat(monthlyPrice),
            currency,
            is_active: isActive,
          },
        });
        showToast('Price updated successfully', 'success');
      } else {
        // Create new
        await createMutation.mutateAsync({
          provider: providerId,
          instance_id: instanceId,
          monthly_price: parseFloat(monthlyPrice),
          currency,
          is_active: isActive,
        });
        showToast('Price created successfully', 'success');
      }
      onClose();
    } catch (error) {
      showToast('Failed to save price', 'error');
    }
  };

  const handleDelete = async () => {
    if (!customPrice) return;

    if (!window.confirm('Are you sure you want to delete this custom price?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(customPrice.id);
      showToast('Price deleted successfully', 'success');
      onClose();
    } catch (error) {
      showToast('Failed to delete price', 'error');
    }
  };

  if (!isOpen) return null;

  const isLoading = isFetching || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-96 p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {customPrice ? 'Edit Price' : 'Set Custom Price'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Instance info */}
        <div className="mb-4 pb-4 border-b border-slate-200">
          <p className="text-sm text-slate-600">Instance</p>
          <p className="font-medium text-slate-900">{instanceName}</p>
          <p className="text-xs text-slate-500 font-mono mt-1">{instanceId}</p>
        </div>

        {/* Form */}
        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Price Display */}
            {currentPrice && !customPrice && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-600 mb-1">Provider Price</p>
                <p className="text-lg font-semibold text-blue-900">${currentPrice.toFixed(2)}/mo</p>
              </div>
            )}

            {/* Monthly Price */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monthly Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer">
                Active
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-slate-200">
              {customPrice && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
              <div className="flex-1 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {customPrice ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
