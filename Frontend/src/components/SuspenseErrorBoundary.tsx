import React, { Component } from "react";

interface SuspenseErrorBoundaryProps {
  children: React.ReactNode;
}

interface SuspenseErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SuspenseErrorBoundary extends Component<SuspenseErrorBoundaryProps, SuspenseErrorBoundaryState> {
  constructor(props: SuspenseErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SuspenseErrorBoundaryState {
    return { hasError: true, error };
  }

import * as Sentry from "@sentry/react";

componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  console.error("SuspenseErrorBoundary caught error:", error, errorInfo);
  Sentry.captureException(error, {
    contexts: { react: { componentStack: errorInfo.componentStack } }
  });
}

render() {
  if (this.state.hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>            <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">We're sorry, but something went wrong while loading this component.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-primary px-4 py-2 rounded-md text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return this.props.children;
}
}