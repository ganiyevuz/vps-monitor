import { X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Toast as ToastType } from '../../lib/stores/toastStore';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-900',
          icon: 'text-green-600',
          Icon: Check,
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          icon: 'text-red-600',
          Icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-900',
          icon: 'text-amber-600',
          Icon: AlertTriangle,
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          icon: 'text-blue-600',
          Icon: Info,
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.Icon;

  return (
    <div
      className={`${styles.bg} border ${styles.border} rounded-lg p-4 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-right-4 duration-300`}
    >
      <Icon className={`${styles.icon} flex-shrink-0 mt-0.5`} size={20} />
      <p className={`${styles.text} text-sm font-medium flex-1`}>
        {toast.message}
      </p>
      <button
        onClick={() => onClose(toast.id)}
        className={`${styles.icon} hover:opacity-70 flex-shrink-0 transition-opacity`}
      >
        <X size={18} />
      </button>
    </div>
  );
}
