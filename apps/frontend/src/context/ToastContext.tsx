"use client";

import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from '@/components/icons';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = React.useCallback((idToRemove: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== idToRemove));
  }, []);

  const showToast = React.useCallback((message: string, type: ToastType = 'success') => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Zone d'affichage des notifications Toast */}
      <div role="status" aria-live="polite" className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 max-w-sm w-[90%] sm:w-full pointer-events-none items-center">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isInfo = toast.type === 'info';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.21, 1.02, 0.43, 1.01] }}
                className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-2xl border backdrop-blur-md text-sm font-bold ${
                  isSuccess
                    ? 'bg-emerald-950/90 text-emerald-100 border-emerald-600/60 shadow-emerald-950/30'
                    : isError
                    ? 'bg-rose-950/90 text-rose-100 border-rose-600/60 shadow-rose-950/30'
                    : 'bg-slate-950/90 text-slate-100 border-slate-700/60 shadow-slate-950/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  {isInfo && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
                  <span className="leading-snug text-xs md:text-sm font-semibold">{toast.message}</span>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors ml-3 shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé à l\'intérieur de ToastProvider');
  }
  return context;
}