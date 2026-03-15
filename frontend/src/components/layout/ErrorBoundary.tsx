'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="glass rounded-2xl p-10 max-w-md w-full text-center border border-rose-500/30 shadow-2xl shadow-rose-500/10">
            <div className="w-20 h-20 rounded-2xl bg-rose-600/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-rose-400" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-white mb-3">
              Something Went Wrong
            </h2>
            <p className="text-slate-400 mb-2 leading-relaxed">
              An unexpected error occurred. Please try again.
            </p>
            {this.state.error && (
              <p className="text-xs text-rose-400/70 mb-6 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors duration-200 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
