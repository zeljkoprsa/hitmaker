import React from 'react';

// A completely static 404 error page
export default function Custom404() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#242424',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>404 - Page Not Found</h1>
        <p style={{ marginBottom: '24px' }}>Sorry, the page you are looking for does not exist.</p>
        <a href="/" style={{
          backgroundColor: '#4a4a4a',
          color: 'white',
          padding: '12px 24px',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>Return Home</a>
      </div>
    </div>
  );
}

// Disable automatic static optimization for this page
export const getInitialProps = () => ({});

// Disable runtime JS for this page
export const config = {
  unstable_runtimeJS: false
};
