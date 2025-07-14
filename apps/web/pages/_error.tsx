import React from 'react';
import { NextPage } from 'next';

interface ErrorProps {
  statusCode?: number;
}

// A static error page without client-side state
const ErrorPage: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <html>
      <head>
        <title>{statusCode ? `${statusCode} - Error` : 'An Error Occurred'}</title>
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
          .container {
            text-align: center;
            padding: 20px;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 16px;
          }
          p {
            margin-bottom: 24px;
          }
          a {
            background-color: #4a4a4a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            display: inline-block;
          }
        `}} />
      </head>
      <body>
        <div className="container">
          <h1>{statusCode ? `${statusCode} - Error` : 'An Error Occurred'}</h1>
          <p>
            {statusCode
              ? `A server-side error occurred.`
              : 'An error occurred on the client.'}
          </p>
          <a href="/">Return Home</a>
        </div>
      </body>
    </html>
  );
};

// For _error.tsx, getInitialProps is required to get the status code
// but we'll keep it minimal to avoid React context issues
ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
