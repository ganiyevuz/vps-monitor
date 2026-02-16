import { useState } from 'react';
import { Plus, Cloud, Edit2, X } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { usePageTitle } from '../lib/hooks/usePageTitle';
import { ProviderForm } from '../components/providers/ProviderForm';
import {
  useProviders,
  useCreateProvider,
  useUpdateProvider,
  useDeleteProvider,
  useTestConnection,
} from '../lib/hooks/useProviders';
import { CreateProviderRequest, Provider } from '../types/provider';
import { formatDate } from '../lib/utils';
import { toast } from '../lib/utils/toast';

export function ProvidersPage() {
  usePageTitle('Providers');
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [testingId, setTestingId] = useState<number | undefined>();

  const { data: providers = [], isLoading, refetch } = useProviders();
  const { mutate: createProvider, isPending: isCreating } = useCreateProvider();
  const { mutate: updateProvider, isPending: isUpdating } = useUpdateProvider();
  const { mutate: deleteProvider } = useDeleteProvider();
  const { mutate: testConnection } = useTestConnection();

  const getErrorMessage = (error: any): string => {
    let errorMsg = 'Operation failed';

    if (error?.response?.data) {
      const data = error.response.data;
      if (data.message) {
        errorMsg = data.message;
      } else if (data.error) {
        errorMsg = data.error;
      } else if (data.detail) {
        errorMsg = data.detail;
      } else if (data.credentials) {
        errorMsg = 'Invalid API credentials - please check and try again';
      }
    } else if (error?.response?.status) {
      if (error.response.status === 400) {
        errorMsg = 'Invalid request - check your input';
      } else if (error.response.status === 401) {
        errorMsg = 'Unauthorized - your credentials are invalid';
      } else if (error.response.status === 404) {
        errorMsg = 'Provider not found';
      } else if (error.response.status === 500) {
        errorMsg = 'Server error - please try again later';
      }
    } else if (error?.message) {
      errorMsg = error.message;
    }

    return errorMsg;
  };

  const handleSaveProvider = async (data: CreateProviderRequest) => {
    if (editingProvider) {
      // Update existing provider
      updateProvider(
        { id: editingProvider.id, data },
        {
          onSuccess: () => {
            toast.success('Provider updated successfully!');
            setShowModal(false);
            setEditingProvider(null);
          },
          onError: (err: any) => {
            toast.error(getErrorMessage(err));
          },
        }
      );
    } else {
      // Create new provider
      createProvider(data, {
        onSuccess: () => {
          toast.success('Provider added successfully!');
          setShowModal(false);
        },
        onError: (err: any) => {
          toast.error(getErrorMessage(err));
        },
      });
    }
  };

  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProvider(null);
  };

  const handleTestConnection = (id: number) => {
    setTestingId(id);
    testConnection(id, {
      onSuccess: (response) => {
        toast.success(`Connection successful: ${response.message}`);
        setTestingId(undefined);
        setTimeout(() => refetch(), 1000);
      },
      onError: (error: any) => {
        const errorMsg = getErrorMessage(error);
        toast.error(errorMsg);
        setTestingId(undefined);
      },
    });
  };

  const handleDeleteProvider = (id: number) => {
    if (confirm('Are you sure you want to delete this provider?')) {
      deleteProvider(id);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="section-title">Cloud Providers</h1>
            <p className="text-slate-500 text-sm mt-2">Connect and manage your cloud infrastructure across multiple providers</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary gap-2"
          >
            <Plus size={20} />
            Add Provider
          </button>
        </div>

        {/* Providers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
              <Cloud size={40} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-600 mb-2">No Providers Connected</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Add your first cloud provider to start monitoring your infrastructure across multiple clouds</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus size={20} />
              Connect Provider
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="group relative card-premium overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 flex flex-col"
              >
                {/* Header with provider icon and status */}
                <div className="relative p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-2xl mb-1">
                        {provider.provider_type === 'contabo' ? '☁️' : '🌊'}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{provider.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {provider.provider_type === 'contabo' ? 'Contabo' : 'DigitalOcean'}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      provider.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${provider.is_active ? 'bg-green-500' : 'bg-slate-400'}`} />
                      {provider.is_active ? 'Active' : 'Off'}
                    </div>
                  </div>
                </div>

                {/* Content section */}
                <div className="flex-1 p-4 space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                      <p className="text-xs text-slate-500 font-medium">Type</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5 capitalize truncate">
                        {provider.provider_type}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2.5 border border-purple-100">
                      <p className="text-xs text-slate-500 font-medium">Created</p>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">
                        {new Date(provider.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Sync info */}
                  <div className="space-y-2">
                    {provider.last_sync_at && (
                      <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-100">
                        <p className="text-xs text-slate-500 font-medium">Last Sync</p>
                        <p className="text-xs font-semibold text-slate-900 mt-0.5">
                          {formatDate(provider.last_sync_at)}
                        </p>
                      </div>
                    )}

                    {/* Sync Status Badge */}
                    <div className={`rounded-lg p-2.5 border flex items-center gap-2 ${
                      provider.last_sync_status?.toLowerCase() === 'success'
                        ? 'bg-green-50 border-green-200'
                        : provider.last_sync_status?.toLowerCase() === 'failed'
                          ? 'bg-red-50 border-red-200'
                          : provider.last_sync_status?.toLowerCase() === 'pending'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="text-lg">
                        {provider.last_sync_status?.toLowerCase() === 'success'
                          ? '✓'
                          : provider.last_sync_status?.toLowerCase() === 'failed'
                            ? '✕'
                            : provider.last_sync_status?.toLowerCase() === 'pending'
                              ? '⟳'
                              : '—'}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium">Sync Status</p>
                        <p className={`text-xs font-semibold mt-0.5 ${
                          provider.last_sync_status?.toLowerCase() === 'success'
                            ? 'text-green-700'
                            : provider.last_sync_status?.toLowerCase() === 'failed'
                              ? 'text-red-700'
                              : provider.last_sync_status?.toLowerCase() === 'pending'
                                ? 'text-blue-700'
                                : 'text-slate-900'
                        }`}>
                          {provider.last_sync_status || 'Never synced'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with actions */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
                  <button
                    onClick={() => handleTestConnection(provider.id)}
                    disabled={testingId === provider.id}
                    title="Test connection"
                    className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs font-semibold"
                  >
                    {testingId === provider.id ? '... Testing' : '✓ Test'}
                  </button>
                  <button
                    onClick={() => handleEditProvider(provider)}
                    title="Edit provider"
                    className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 hover:from-blue-200 hover:to-cyan-200 transition-all duration-200 text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProvider(provider.id)}
                    title="Delete provider"
                    className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-red-100 to-pink-100 text-red-700 hover:from-red-200 hover:to-pink-200 transition-all duration-200 text-xs font-semibold"
                  >
                    🗑 Delete️
                  </button>
                </div>
              </div>
            ))}

            {/* Add new card */}
            <button
              onClick={() => setShowModal(true)}
              className="card-premium p-4 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group min-h-[280px]"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus size={28} className="text-blue-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900 text-sm">Add Provider</p>
                <p className="text-xs text-slate-500 mt-1">Connect new account</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal Content */}
          <div className="relative card-premium max-w-2xl w-full p-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={24} className="text-slate-400" />
            </button>

            {/* Modal Header */}
            <div className="mb-8 pr-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                {editingProvider ? 'Edit Provider' : 'Connect Provider'}
              </h2>
              <p className="text-sm text-slate-600">
                {editingProvider
                  ? 'Update your cloud provider account settings'
                  : 'Add a new cloud provider account to start monitoring your infrastructure'}
              </p>
            </div>

            {/* Form */}
            <ProviderForm
              onSubmit={handleSaveProvider}
              isLoading={isCreating || isUpdating}
              initialData={editingProvider ? {
                name: editingProvider.name,
                provider_type: editingProvider.provider_type as any,
                credentials: {},
                is_active: editingProvider.is_active,
              } : undefined}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
