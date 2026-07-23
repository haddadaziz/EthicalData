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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-black/80 space-y-6 text-left relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                    confirmState.options.type === 'danger'
                      ? 'bg-rose-950/30 border-rose-900/50 text-rose-500'
                      : 'bg-amber-950/30 border-amber-900/50 text-amber-500'
                  }`}>
                    {confirmState.options.type === 'danger' ? (
                      <Trash2 className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{confirmState.options.title}</h3>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">Confirmation requise</p>
                  </div>
                </div>

                <button
                  onClick={() => handleClose(false)}
                  className="p-1.5 hover:bg-rose-950/30 text-slate-450 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {confirmState.options.message}
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => handleClose(false)}
                  className="px-5 py-2.5 bg-slate-900/50 hover:bg-rose-950/30 hover:text-rose-500 hover:border-rose-900/50 border border-transparent text-slate-400 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {confirmState.options.cancelText || 'Annuler'}
                </button>

                <button
                  onClick={() => handleClose(true)}
                  className={`px-6 py-2.5 font-bold rounded-xl text-xs text-white shadow-md transition-all cursor-pointer ${
                    confirmState.options.type === 'danger'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10'
                      : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/10'
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