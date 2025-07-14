import React, { useState, useEffect } from 'react';

// A client-side only 500 error page to avoid SSR context issues
const Custom500 = () => {
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
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>500 - Server Error</h1>
        <p style={{ marginBottom: '24px' }}>Sorry, something went wrong on our server.</p>
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
};

export default Custom500;

// Use Next.js config to disable static optimization for this page
export const config = {
  unstable_runtimeJS: false
};
