import React from 'react';

// A static 500 error page without client-side state
function Custom500() {
  return (
    <html>
      <head>
        <title>500 - Server Error</title>
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
          <h1>500 - Server Error</h1>
          <p>Sorry, something went wrong on our server.</p>
          <a href="/">Return Home</a>
        </div>
      </body>
    </html>
  );
}

export default Custom500;
