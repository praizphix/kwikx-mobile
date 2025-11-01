import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Check if this is a wallet extension error
    const errorMessage = error.message?.toLowerCase() || '';
    const errorStack = error.stack?.toLowerCase() || '';
    
    const isWalletError = [
      'ethereum',
      'read only property',
      'wallet',
      'web3',
      'metamask',
      'cannot read properties of null',
      'chrome-extension',
      'inpage.js',
      'content-script'
    ].some(pattern => 
      errorMessage.includes(pattern) || errorStack.includes(pattern)
    );
    
    if (isWalletError) {
      console.warn('🦊 Wallet extension error caught by boundary, suppressing');
      // Reset the error state for wallet errors
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      }, 100);
      return;
    }
    
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private isWalletExtensionError = (): boolean => {
    if (!this.state.error) return false;
    
    const errorMessage = this.state.error.message?.toLowerCase() || '';
    const errorStack = this.state.error.stack?.toLowerCase() || '';
    
    return [
      'ethereum',
      'read only property',
      'wallet',
      'web3',
      'metamask',
      'cannot read properties of null',
      'chrome-extension',
      'inpage.js',
      'content-script',
      'coinbase',
      'trust wallet',
      'phantom',
      'reading \'type\'',
      'reading \'request\'',
      'reading \'send\''
    ].some(pattern => 
      errorMessage.includes(pattern) || errorStack.includes(pattern)
    );
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      // Don't show error boundary for wallet extension errors
      if (this.isWalletExtensionError()) {
        console.warn('🦊 Wallet extension error in boundary, rendering children normally');
        return this.props.children;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                <p className="text-gray-600 mb-6">
                  We encountered an unexpected error. This might be due to a browser extension conflict.
                </p>
                
                {this.state.error && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                    <p className="text-sm text-gray-600 mb-2">Error details:</p>
                    <code className="text-xs text-red-600 break-all">
                      {this.state.error.message}
                    </code>
                    {this.state.errorInfo?.componentStack && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">Component Stack</summary>
                        <pre className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={this.handleReload}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00454a] hover:bg-[#003238] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00454a]"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload Page
                  </button>
                  
                  <button
                    onClick={this.handleGoHome}
                    className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00454a]"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go to Homepage
                  </button>
                </div>

                <div className="mt-6 text-xs text-gray-500">
                  <p>If this problem persists, try:</p>
                  <ul className="mt-2 text-left list-disc list-inside space-y-1">
                    <li>Disabling browser extensions (especially crypto wallets)</li>
                    <li>Using an incognito/private browsing window</li>
                    <li>Clearing your browser cache</li>
                    <li>Trying a different browser</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;