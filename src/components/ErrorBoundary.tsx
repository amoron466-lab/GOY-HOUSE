import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4">
          <div className="bg-stone-900 p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border border-stone-800">
            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-medium text-stone-100 mb-4">
              Уучлаарай, алдаа гарлаа
            </h2>
            <p className="text-stone-400 mb-8">
              {this.state.error?.message.includes('permission') 
                ? 'Хандах эрх хүрэлцэхгүй байна. / Permission denied.' 
                : 'Системд алдаа гарлаа. Та дахин оролдоно уу. / An error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gold-400 hover:bg-gold-500 text-white px-8 py-3 rounded-xl font-medium transition-colors"
            >
              Дахин ачаалах / Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
