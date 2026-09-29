import React from 'react';

/**
 * Global error boundary — if any runtime error crashes React, show the actual
 * error on screen instead of a blank white page, plus a recovery button.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Also visible in DevTools console
    console.error('App crashed:', error, info);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* storage may be blocked — reload anyway */
    }
    window.location.replace('/');
  };

  render() {
    if (this.state.error) {
      const message = this.state.error?.message || String(this.state.error);
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 24 }}>
          <div style={{ maxWidth: 640, background: '#fff', borderRadius: 16, padding: 24, fontFamily: 'system-ui, sans-serif' }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#dc2626'}}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              The app hit an unexpected error
            </h1>
            <p style={{ color: '#475569', fontSize: 14, marginBottom: 12 }}>
              The error details below will also help pinpoint the cause — please share them if the problem persists.
            </p>
            <pre style={{ background: '#f1f5f9', borderRadius: 8, padding: 12, fontSize: 12, color: '#b91c1c', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 220, overflow: 'auto' }}>
              {message}
              {'\n\n'}
              {this.state.error?.stack || ''}
            </pre>
            <button
              onClick={this.handleReset}
              style={{ marginTop: 16, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}
            >
              Clear session &amp; reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}