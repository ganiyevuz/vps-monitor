import { useToastStore, ToastType } from '../stores/toastStore';

export function useToast() {
  const { addToast } = useToastStore();

  const showToast = (message: string, type: ToastType = 'info', duration = 4000) => {
    addToast(message, type, duration);
  };

  return { showToast };
}
