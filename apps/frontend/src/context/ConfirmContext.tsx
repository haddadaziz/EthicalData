"use client";

import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from '@/components/icons';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ options, resolve });
    });
  };

  const handleClose = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 text-left relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                    confirmState.options.type === 'danger'
                      ? 'bg-rose-50 border-rose-100 text-rose-600'
                      : 'bg-amber-50 border-amber-100 text-amber-600'
                  }`}>
                    {confirmState.options.type === 'danger' ? (
                      <Trash2 className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-950">{confirmState.options.title}</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Confirmation requise</p>
                  </div>
                </div>

                <button
                  onClick={() => handleClose(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-950 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {confirmState.options.message}
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => handleClose(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {confirmState.options.cancelText || 'Annuler'}
                </button>

                <button
                  onClick={() => handleClose(true)}
                  className={`px-6 py-2.5 font-bold rounded-xl text-xs text-white shadow-md transition-all cursor-pointer ${
                    confirmState.options.type === 'danger'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {confirmState.options.confirmText || 'Confirmer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm doit être utilisé dans un ConfirmProvider");
  }
  return context;
}