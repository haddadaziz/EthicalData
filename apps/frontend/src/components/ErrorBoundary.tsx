"use client";

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-red-50 border border-cyan-200 flex items-center justify-center">
              <span className="text-2xl">!</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mb-2">Une erreur est survenue</h2>
            <p className="text-sm text-slate-500 mb-4">
              Un problème inattendu a été rencontré. Veuillez rafraîchir la page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
