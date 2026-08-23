import React from 'react';
import toast from 'react-hot-toast';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Show toast notification
    toast.error('Something went wrong. Please try again.');

    // You can also log to an error reporting service here
    // Example: Sentry.captureException(error);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
            <div className="text-6xl mb-4">😅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try again or go back to the homepage.
            </p>
            
            {this.props.showDetails && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                <p className="text-sm text-red-600 font-mono break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-sm text-gray-600 cursor-pointer">Stack trace</summary>
                    <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center">
              <button
                onClick={this.handleReset}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with ErrorBoundary
export const withErrorBoundary = (WrappedComponent, fallbackProps = {}) => {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary {...fallbackProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};

// Component-level error fallback
export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-4xl mb-3">⚠️</div>
      <h3 className="text-lg font-semibold text-red-700 mb-2">
        Failed to load component
      </h3>
      <p className="text-sm text-red-600 mb-4">
        {error?.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
      >
        Retry
      </button>
    </div>
  );
};

export default ErrorBoundary;