import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-4 pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100 ${
              toast.type === 'error' ? 'bg-red-500 text-white' : 
              toast.type === 'success' ? 'bg-green-500 text-white' : 
              'bg-gray-800 text-white'
            }`}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-white hover:opacity-75">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
