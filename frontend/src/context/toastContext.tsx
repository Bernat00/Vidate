/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Toast from '../components/toast';
import type { ToastStatus } from '../types/domain';

interface ToastContextValue {
  showToast: (message: string, status?: ToastStatus) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; status: ToastStatus } | null>(null);

  const showToast = (message: string, status: ToastStatus = 'success') => {
    setToast({ message, status });
  };

  const closeToast = () => setToast(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 10000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 lg:left-auto lg:right-5 lg:translate-x-0 z-50 w-full max-w-sm px-4 lg:px-0 transition-all duration-300">
          <Toast text={toast.message} status={toast.status} onClose={closeToast} />
        </div>
      )}
    </ToastContext.Provider>
  );
};
