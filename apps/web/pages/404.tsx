import React from 'react';
import Head from 'next/head';
import '../styles/error.css';

// A static 404 error page without client-side state
function Custom404() {
  return (
    <div className="error-container">
      <Head>
        <title>404 - Page Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="error-content">
        <h1 className="error-title">404 - Page Not Found</h1>
        <p className="error-message">Sorry, the page you are looking for does not exist.</p>
        <a href="/" className="error-link">Return Home</a>
      </div>
    </div>
  );
}

export default Custom404;
