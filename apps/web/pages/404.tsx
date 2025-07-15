import React from 'react';
import Head from 'next/head';

// A static 404 error page without client-side state
function Custom404() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#242424',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <Head>
        <title>404 - Page Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{
        textAlign: 'center',
        padding: '20px',
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>404 - Page Not Found</h1>
        <p style={{ marginBottom: '24px' }}>Sorry, the page you are looking for does not exist.</p>
        <a href="/" style={{
          backgroundColor: '#4a4a4a',
          color: 'white',
          padding: '12px 24px',
          textDecoration: 'none',
          borderRadius: '4px',
          display: 'inline-block',
        }}>Return Home</a>
      </div>
    </div>
  );
}

export default Custom404;
