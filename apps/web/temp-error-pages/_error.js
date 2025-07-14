import React from 'react';

// Using a class component to avoid React hooks and context issues during SSR
class ErrorPage extends React.Component {
  static getInitialProps({ res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
  }

  render() {
    const { statusCode } = this.props;
    
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#242424',
        color: 'white',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
            {statusCode ? `${statusCode} - Error` : 'An Error Occurred'}
          </h1>
          <p style={{ marginBottom: '24px' }}>
            {statusCode
              ? `A server-side error occurred.`
              : 'An error occurred on the client.'}
          </p>
          <a 
            href="/"
            style={{ 
              backgroundColor: '#4a4a4a',
              color: 'white',
              padding: '12px 24px',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorPage;
