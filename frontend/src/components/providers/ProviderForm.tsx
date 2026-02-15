import { useState, useEffect } from 'react';
import { CreateProviderRequest, ProviderType } from '../../types/provider';

interface ProviderFormProps {
  onSubmit: (data: CreateProviderRequest) => void;
  isLoading?: boolean;
  initialData?: Partial<CreateProviderRequest>;
}

export function ProviderForm({ onSubmit, isLoading, initialData }: ProviderFormProps) {
  const isEditing = !!initialData;
  const [name, setName] = useState('');
  const [providerType, setProviderType] = useState<ProviderType>('contabo');
  const [isActive, setIsActive] = useState(true);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setProviderType(initialData.provider_type || 'contabo');
      setIsActive(initialData.is_active !== undefined ? initialData.is_active : true);
      setCredentials({});
    } else {
      // Reset form when not editing
      setName('');
      setProviderType('contabo');
      setIsActive(true);
      setCredentials({});
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && initialData) {
      // When editing, only include fields that changed
      const submitData: any = {};

      if (name !== initialData.name) {
        submitData.name = name;
      }

      if (isActive !== initialData.is_active) {
        submitData.is_active = isActive;
      }

      // Only include credentials if any field has a value
      if (Object.values(credentials).some(v => v)) {
        submitData.credentials = credentials;
      }

      onSubmit(submitData as CreateProviderRequest);
    } else {
      // When creating, send all fields
      onSubmit({
        name,
        provider_type: providerType,
        is_active: isActive,
        credentials,
      });
    }
  };

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials({ ...credentials, [key]: value });
  };

  const contaboFields = [
    { key: 'client_id', label: 'Client ID' },
    { key: 'client_secret', label: 'Client Secret' },
    { key: 'api_user', label: 'API User (Email)' },
    { key: 'api_password', label: 'API Password' },
  ];

  const digitaloceanFields = [{ key: 'token', label: 'API Token' }];

  const credentialFields = providerType === 'contabo' ? contaboFields : digitaloceanFields;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2.5">Account Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input-premium text-sm"
          placeholder="e.g., Production"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2.5">Provider</label>
        <select
          value={providerType}
          onChange={(e) => {
            setProviderType(e.target.value as ProviderType);
            setCredentials({});
          }}
          disabled={isEditing}
          className="input-premium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="contabo">☁️ Contabo</option>
          <option value="digitalocean">🌊 DigitalOcean</option>
        </select>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-slate-900 text-sm">API Credentials</h3>
          {isEditing && (
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Optional</span>
          )}
        </div>
        <p className="text-xs text-slate-600 mb-3">
          {isEditing
            ? 'Leave blank to keep existing credentials'
            : 'Enter your API credentials to connect your account'}
        </p>
        <div className="space-y-3">
          {credentialFields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                {field.label}
              </label>
              <input
                type={field.key.includes('secret') || field.key.includes('password') ? 'password' : 'text'}
                value={credentials[field.key] || ''}
                onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                required={!isEditing}
                className="input-premium text-sm"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
        <input
          type="checkbox"
          id="is_active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer flex-1">
          Activate this account
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold py-3 mt-6"
      >
        {isLoading ? (isEditing ? 'Updating...' : 'Connecting...') : (isEditing ? 'Update Account' : 'Connect Account')}
      </button>
    </form>
  );
}
