import React from 'react';

// Using a class component to avoid React hooks and context issues during SSR
class Custom404 extends React.Component {
  render() {
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
            404 - Page Not Found
          </h1>
          <p style={{ marginBottom: '24px' }}>
            Sorry, the page you are looking for does not exist.
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

// Disable automatic static optimization for this page
Custom404.getInitialProps = () => ({})

export default Custom404;
