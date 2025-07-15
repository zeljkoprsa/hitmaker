import React from 'react';
import Head from 'next/head';
import '../styles/error.css';

// A static 500 error page without client-side state
function Custom500() {
  return (
    <div className="error-container">
      <Head>
        <title>500 - Server Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="error-content">
        <h1 className="error-title">500 - Server Error</h1>
        <p className="error-message">Sorry, something went wrong on our server.</p>
        <a href="/" className="error-link">Return Home</a>
      </div>
    </div>
  );
}

export default Custom500;
