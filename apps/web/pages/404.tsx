import React from 'react';
import Head from 'next/head';

// A static 404 error page without client-side state
function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #242424;
            color: white;
            font-family: system-ui, sans-serif;
          }
        `}} />
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
    </>
  );
}

export default Custom404;
