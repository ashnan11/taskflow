import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('TaskFlow error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center"
          role="alert"
        >
          <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" aria-hidden="true" />
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            TaskFlow hit an unexpected error. Your data is safe in local storage.
          </p>
          {this.state.error && (
            <p className="mt-2 max-w-lg truncate text-xs text-slate-500">{this.state.error.message}</p>
          )}
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
