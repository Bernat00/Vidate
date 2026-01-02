import React, { createContext, useContext, useState, useEffect } from 'react';
import Toast from '../components/toast.jsx';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message, status = 'success') => {
    setToast({ message, status });
  };

  const closeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 lg:left-auto lg:right-5 lg:translate-x-0 z-50 w-full max-w-sm px-4 lg:px-0 transition-all duration-300">
          <Toast
            text={toast.message}
            status={toast.status}
            onClose={closeToast}
          />
        </div>
      )}
    </ToastContext.Provider>
  );
};