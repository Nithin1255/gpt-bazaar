import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('GPT Bazaar ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F6F8F7] p-6">
          <div className="max-w-lg w-full bg-white border border-[#E4EBE6] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-red-700 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-slate-900">
                  Something went wrong
                </h2>
                <p className="text-xs text-slate-500">
                  A data or rendering exception interrupted this view.
                </p>
              </div>
            </div>
            <pre className="text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 overflow-x-auto max-h-48 whitespace-pre-wrap break-words">
              {this.state.errorMessage}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, errorMessage: '' })}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E6F2D] hover:bg-[#0A5823] text-white text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retry View
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
