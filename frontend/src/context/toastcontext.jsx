import React, { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  // The global function to trigger the toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
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

      {/* The Global Toast UI */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center w-full max-w-xs p-4 rounded-lg shadow-xl border transition-all duration-300 transform translate-y-0 ${
          toast.type === 'error' 
            ? 'bg-bgSecondary border-textError text-textError' 
            : 'bg-bgSecondary border-borderAccent text-textAccent'
        }`}>
          <div className="text-sm font-semibold">{toast.message}</div>
          <button
            onClick={() => setToast(null)}
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 hover:bg-bgPrimary"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};