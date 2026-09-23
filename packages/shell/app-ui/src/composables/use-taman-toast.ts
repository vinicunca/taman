import type { Toast } from 'pohon-ui/composables/useToast';
import { useToast } from 'pohon-ui/composables/useToast';

export function useTamanToast() {
  const toast = useToast();

  function info(message: string, options?: Partial<Toast>) {
    toast.add({
      title: message,
      icon: 'lucide:info',
      color: 'info',
      ...options,
    });
  }

  function success(message: string, options?: Partial<Toast>) {
    toast.add({
      title: message,
      icon: 'lucide:check',
      color: 'success',
      ...options,
    });
  }

  function error(message: string, options?: Partial<Toast>) {
    toast.add({
      title: message,
      icon: 'lucide:x',
      color: 'error',
      ...options,
    });
  }

  const toaster = {
    info,
    success,
    error,
  };

  return {
    toast,
    toaster,
  };
}
