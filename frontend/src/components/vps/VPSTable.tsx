import { useState, useMemo } from 'react';
import { VPSInstance } from '../../types/vps';
import { formatDateHumanReadable, getRelativeTime } from '../../lib/utils';
import { VPSStatusBadge } from './VPSStatusBadge';
import { Calendar, ChevronUp, ChevronDown } from 'lucide-react';

interface VPSTableProps {
  instances: VPSInstance[];
  isLoading?: boolean;
}

type SortColumn = 'name' | 'status' | 'ipv4' | 'plan' | 'cpu' | 'disk' | 'price' | 'provider' | 'created';
type SortDirection = 'asc' | 'desc';

export function VPSTable({ instances, isLoading }: VPSTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedInstances = useMemo(() => {
    const sorted = [...instances].sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortColumn) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'ipv4':
          aValue = a.ipv4;
          bValue = b.ipv4;
          break;
        case 'plan':
          aValue = (a.plan || '').toLowerCase();
          bValue = (b.plan || '').toLowerCase();
          break;
        case 'cpu':
          aValue = a.cpu_cores;
          bValue = b.cpu_cores;
          break;
        case 'disk':
          aValue = a.disk_gb;
          bValue = b.disk_gb;
          break;
        case 'price':
          aValue = a.monthly_price || 0;
          bValue = b.monthly_price || 0;
          break;
        case 'provider':
          aValue = a.provider_type.toLowerCase();
          bValue = b.provider_type.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return sorted;
  }, [instances, sortColumn, sortDirection]);

  const SortHeader = ({ column, label }: { column: SortColumn; label: string }) => (
    <th
      onClick={() => handleSort(column)}
      className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-200/50 transition-colors select-none"
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {sortColumn === column && (
          sortDirection === 'asc' ? <ChevronUp size={16} className="text-blue-600" /> : <ChevronDown size={16} className="text-blue-600" />
        )}
      </div>
    </th>
  );

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Loading VPS instances...</div>;
  }

  if (instances.length === 0) {
    return <div className="text-center py-12 text-slate-400">No VPS instances found</div>;
  }

  return (
    <div className="card-premium overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 sticky top-0">
            <tr>
              <SortHeader column="name" label="Name" />
              <SortHeader column="status" label="Status" />
              <SortHeader column="ipv4" label="IP Address" />
              <SortHeader column="plan" label="Plan" />
              <SortHeader column="cpu" label="CPU/RAM" />
              <SortHeader column="disk" label="Disk" />
              <SortHeader column="price" label="Price" />
              <SortHeader column="provider" label="Provider" />
              <SortHeader column="created" label="Created" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedInstances.map((instance, idx) => (
              <tr key={`${instance.id}-${idx}`} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900 whitespace-nowrap" title={instance.name}>
                  {instance.name.length > 10 ? instance.name.substring(0, 10) + '...' : instance.name}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  <VPSStatusBadge status={instance.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                  {instance.ipv4 || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {instance.plan ? (
                    <span
                      className="badge-info inline-block"
                      title={instance.plan}
                    >
                      {instance.plan.length > 11 ? instance.plan.substring(0, 11) + '...' : instance.plan}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                  {instance.cpu_cores}C / {instance.ram_mb >= 1024 ? `${Math.round(instance.ram_mb / 1024)}GB` : `${instance.ram_mb}MB`}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{Math.round(instance.disk_gb)}GB</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900 whitespace-nowrap">
                  {instance.monthly_price ? (
                    <span className="text-green-700 font-semibold">
                      ${instance.monthly_price.toFixed(2)}/mo
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  <span className="badge-info">
                    {instance.provider_type.charAt(0).toUpperCase() + instance.provider_type.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                  <div className="group relative inline-flex items-center gap-2 cursor-help">
                    <Calendar size={16} className="text-blue-500 flex-shrink-0" />
                    <span className="font-medium text-slate-700">{getRelativeTime(instance.created_at)}</span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                      {formatDateHumanReadable(instance.created_at)}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
