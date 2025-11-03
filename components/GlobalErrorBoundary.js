'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console
    console.error('Global Error Boundary caught an error:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Send error to logging service (e.g., Sentry, LogRocket)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // Placeholder for error logging service integration
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const errorLog = {
          timestamp: new Date().toISOString(),
          message: error.toString(),
          stack: error.stack,
          componentStack: errorInfo?.componentStack,
          userAgent: navigator.userAgent,
          url: window.location.href
        };
        
        // Store in localStorage for debugging
        const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
        existingLogs.push(errorLog);
        
        // Keep only last 10 errors
        const recentLogs = existingLogs.slice(-10);
        localStorage.setItem('error_logs', JSON.stringify(recentLogs));
      } catch (e) {
        console.error('Failed to log error to localStorage:', e);
      }
    }
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Reload the page to ensure clean state
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleContactSupport = () => {
    // You can customize this to open a support form or email
    const subject = encodeURIComponent('MyCanteen Error Report');
    const body = encodeURIComponent(
      `Error occurred at: ${new Date().toISOString()}\n\n` +
      `Error: ${this.state.error?.toString() || 'Unknown error'}\n\n` +
      `Please describe what you were doing when this error occurred:`
    );
    window.location.href = `mailto:support@mycanteen.com?subject=${subject}&body=${body}`;
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const isCriticalError = this.state.errorCount > 2;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4 py-12">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
            {/* Icon */}
            <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">
              Oops! Something went wrong
            </h1>
            
            {/* Message */}
            <p className="text-gray-600 text-center mb-6 text-lg">
              {isCriticalError 
                ? "We're experiencing repeated errors. Please contact support if this persists."
                : "We encountered an unexpected error. Don't worry, your data is safe."}
            </p>

            {/* Error count warning */}
            {this.state.errorCount > 1 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm text-center">
                  ⚠️ This error has occurred {this.state.errorCount} times. 
                  You may need to clear your browser cache or contact support.
                </p>
              </div>
            )}

            {/* Development error details */}
            {isDevelopment && this.state.error && (
              <details className="mb-6 p-4 bg-gray-100 rounded-lg text-sm border border-gray-300">
                <summary className="cursor-pointer font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                  🔧 Error Details (Development Mode)
                </summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Error Message:</p>
                    <p className="text-red-600 font-mono text-xs bg-red-50 p-2 rounded break-all">
                      {this.state.error.toString()}
                    </p>
                  </div>
                  
                  {this.state.error.stack && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Stack Trace:</p>
                      <pre className="text-gray-600 font-mono text-xs overflow-auto max-h-40 bg-gray-50 p-2 rounded">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Component Stack:</p>
                      <pre className="text-gray-600 font-mono text-xs overflow-auto max-h-40 bg-gray-50 p-2 rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Location:</p>
                    <p className="text-gray-600 text-xs font-mono bg-blue-50 p-2 rounded break-all">
                      {typeof window !== 'undefined' ? window.location.href : 'Unknown'}
                    </p>
                  </div>
                </div>
              </details>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>

              <button
                onClick={this.handleContactSupport}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </button>
            </div>

            {/* Help text */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm text-center">
                If this problem persists, try clearing your browser cache or using a different browser.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
