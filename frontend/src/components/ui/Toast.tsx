import { useToastStore } from '../../store/useToastStore';
import type { ToastType } from '../../store/useToastStore';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success': return 'border-green-100 bg-green-50 text-green-900 dark:bg-green-900/20 dark:border-green-900/50';
      case 'error': return 'border-red-100 bg-red-50 text-red-900 dark:bg-red-900/20 dark:border-red-900/50';
      case 'warning': return 'border-yellow-100 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-900/50';
      case 'info': return 'border-blue-100 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:border-blue-900/50';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 rounded-lg border p-4 shadow-lg 
            animate-in slide-in-from-right-full duration-300 min-w-[300px] max-w-md
            ${getStyles(toast.type)}
          `}
        >
          {getIcon(toast.type)}
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4 opacity-50" />
          </button>
        </div>
      ))}
    </div>
  );
};
