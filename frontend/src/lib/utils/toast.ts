import { useToastStore } from '../stores/toastStore';

export function createToastHelpers() {
  return {
    success: (message: string, duration?: number) => {
      useToastStore.getState().addToast(message, 'success', duration);
    },
    error: (message: string, duration?: number) => {
      useToastStore.getState().addToast(message, 'error', duration);
    },
    warning: (message: string, duration?: number) => {
      useToastStore.getState().addToast(message, 'warning', duration);
    },
    info: (message: string, duration?: number) => {
      useToastStore.getState().addToast(message, 'info', duration);
    },
  };
}

export const toast = createToastHelpers();
