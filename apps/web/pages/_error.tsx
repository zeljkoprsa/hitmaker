import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

interface ErrorProps {
  statusCode?: number;
}

// A client-side only error page to avoid SSR context issues
const ErrorPage: NextPage<ErrorProps> = ({ statusCode }) => {
  // Only render on client side to avoid React context issues during SSR
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return empty div during SSR to avoid React context issues
  if (!isMounted) {
    return <div style={{ display: 'none' }} />;
  }

  // Only render the actual content on the client
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
};

// This ensures the page is rendered as an empty shell during SSR
// and only populated with content on the client side
ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
