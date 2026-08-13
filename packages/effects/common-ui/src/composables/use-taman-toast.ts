export function useTamanToast() {
  const toast = useToast();

  function info(message: string) {
    toast.add({
      title: message,
      icon: 'lucide:info',
      color: 'info',
    });
  }

  function success(message: string) {
    toast.add({
      title: message,
      icon: 'lucide:check',
      color: 'success',
    });
  }

  function error(message: string) {
    toast.add({
      title: message,
      icon: 'lucide:x',
      color: 'error',
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
