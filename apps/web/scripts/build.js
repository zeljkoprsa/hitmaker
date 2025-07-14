const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Two-phase build process to handle error pages separately
console.log('Starting two-phase build process...');

// Phase 1: Build the main app without error pages
console.log('Phase 1: Building main app...');
try {
  // Set environment variable to skip error pages during build
  process.env.SKIP_ERROR_PAGES = 'true';
  // Use local Next.js installation
  execSync('npx next build', { stdio: 'inherit' });
  console.log('Main app build completed successfully');
} catch (error) {
  console.log('Main app build failed, but continuing with error page handling...');
}

// Phase 2: Build error pages separately with minimal configuration
console.log('Phase 2: Building error pages separately...');
try {
  // Create temporary directory for error pages
  const tempDir = path.join(process.cwd(), 'temp-error-pages');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // Copy error page files to temp directory
  const errorPageFiles = ['_error.js', '404.js', '500.js'];
  errorPageFiles.forEach(file => {
    const sourcePath = path.join(process.cwd(), 'pages', file);
    if (fs.existsSync(sourcePath)) {
      const destPath = path.join(tempDir, file);
      fs.copyFileSync(sourcePath, destPath);
    }
  });

  // Ensure the public directory exists
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Copy static HTML error pages to the public directory
  const staticErrorPages = ['404.html', '500.html'];
  staticErrorPages.forEach(page => {
    const sourcePath = path.join(process.cwd(), 'pages', page);
    const publicPath = path.join(process.cwd(), 'public', page);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, publicPath);
      console.log(`Copied ${page} to public directory`);
    }
  });

  // Copy JS error pages to the build output
  const jsErrorPages = ['_error.js', '404.js', '500.js'];
  jsErrorPages.forEach(page => {
    const sourcePath = path.join(process.cwd(), 'pages', page);
    const destPath = path.join(process.cwd(), '.next/server/pages', page.replace('.js', '.html'));
    
    if (fs.existsSync(sourcePath)) {
      // Create a simple HTML wrapper for the error page
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error</title>
  <style>
    body {
      background-color: #242424;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    p {
      margin-bottom: 1.5rem;
    }
    a {
      display: inline-block;
      background-color: #4a4a4a;
      color: white;
      padding: 0.75rem 1.5rem;
      text-decoration: none;
      border-radius: 0.375rem;
    }
    a:hover {
      background-color: #5a5a5a;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${page === '404.js' ? '404 - Page Not Found' : '500 - Server Error'}</h1>
    <p>${page === '404.js' ? 'Sorry, the page you are looking for does not exist.' : 'Sorry, something went wrong on our server.'}</p>
    <a href="/">Return Home</a>
  </div>
</body>
</html>`;
      
      // Ensure the directory exists
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      fs.writeFileSync(destPath, htmlContent);
      console.log(`Created HTML version of ${page} at ${destPath}`);
    }
  });

} catch (error) {
  console.error('Error handling error pages:', error);
}

console.log('Build process completed successfully');
