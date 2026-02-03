import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          maxWidth: '800px',
          margin: '0 auto',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1 style={{ color: '#d32f2f', marginBottom: '20px' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
          {this.state.error && (
            <details style={{ marginTop: '30px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Error Details
              </summary>
              <pre style={{
                backgroundColor: '#f5f5f5',
                padding: '15px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '14px'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
