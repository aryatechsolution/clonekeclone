import React from 'react';
import * as Sentry from '@sentry/capacitor';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * App-level error boundary.
 *
 * Without this, any uncaught render/runtime error unmounts the whole React
 * tree and leaves a blank white screen — which is exactly how the iOS
 * Firebase init failure surfaced. Showing the error (and a reload button)
 * makes such failures diagnosable instead of invisible.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface to the console so it shows up in Safari Web Inspector / device logs.
    console.error('Uncaught error in React tree:', error, info.componentStack);
    // Report the crash to Sentry, attaching the React component stack for context.
    Sentry.captureException(error, {
      contexts: { react: { componentStack: info.componentStack } },
    });
  }

  handleReload = () => {
    this.setState({ error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ color: '#666', maxWidth: '32rem', wordBreak: 'break-word' }}>
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#111',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
