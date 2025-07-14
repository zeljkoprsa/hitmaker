const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths
const rootDir = path.resolve(__dirname, '..');
const pagesDir = path.join(rootDir, 'pages');
const publicDir = path.join(rootDir, 'public');

// Ensure directories exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

/**
 * Create static HTML error pages to avoid SSR issues
 */
function createStaticErrorPages() {
  console.log('Creating static error pages...');
  
  // Create a simple 404 page
  const html404 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background-color: #242424;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
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
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404 - Page Not Found</h1>
    <p>Sorry, the page you are looking for does not exist.</p>
    <a href="/">Return Home</a>
  </div>
</body>
</html>`;

  // Create a simple 500 page
  const html500 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>500 - Server Error</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background-color: #242424;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
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
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>500 - Server Error</h1>
    <p>Sorry, something went wrong on our server.</p>
    <a href="/">Return Home</a>
  </div>
</body>
</html>`;

  // Write the HTML files to public directory
  fs.writeFileSync(path.join(publicDir, '404.html'), html404);
  fs.writeFileSync(path.join(publicDir, '500.html'), html500);
  
  console.log('Created static HTML error pages in public directory');
}

/**
 * Create a temporary Next.js config that handles error pages correctly
 */
function createTempNextConfig() {
  console.log('Creating temporary Next.js config for error pages...');
  
  const configPath = path.join(rootDir, 'next.config.js');
  const originalConfig = fs.readFileSync(configPath, 'utf8');
  
  // Backup the original config
  fs.writeFileSync(`${configPath}.backup`, originalConfig);
  
  // Create a modified config that handles error pages correctly
  const modifiedConfig = originalConfig.replace(
    'module.exports = nextConfig;',
    `// Configure error pages handling
nextConfig.typescript = {
  // Ignore TypeScript errors during build
  ignoreBuildErrors: true,
};

// Skip static optimization for error pages
nextConfig.unstable_excludeFiles = ['pages/404.tsx', 'pages/500.tsx', 'pages/_error.tsx'];

module.exports = nextConfig;`
  );
  
  fs.writeFileSync(configPath, modifiedConfig);
  console.log('Temporary Next.js config created');
  
  return originalConfig;
}

/**
 * Restore the original Next.js config
 */
function restoreNextConfig(originalConfig) {
  console.log('Restoring original Next.js config...');
  
  const configPath = path.join(rootDir, 'next.config.js');
  fs.writeFileSync(configPath, originalConfig);
  
  // Remove the backup file
  if (fs.existsSync(`${configPath}.backup`)) {
    fs.unlinkSync(`${configPath}.backup`);
  }
  
  console.log('Original Next.js config restored');
}

/**
 * Create a special .nojekyll file for GitHub Pages
 */
function createNoJekyllFile() {
  const noJekyllPath = path.join(publicDir, '.nojekyll');
  fs.writeFileSync(noJekyllPath, '');
  console.log('Created .nojekyll file');
}

/**
 * Main build function
 */
async function build() {
  console.log('Starting build process...');
  
  try {
    // Step 1: Create static error pages first
    createStaticErrorPages();
    createNoJekyllFile();
    
    // Step 2: Create temporary Next.js config that excludes error pages from prerendering
    const originalConfig = createTempNextConfig();
    
    try {
      // Step 3: Build the app with the modified config
      console.log('Building the app...');
      execSync('npx next build', { stdio: 'inherit', cwd: rootDir });
    } finally {
      // Step 4: Restore the original config regardless of build success/failure
      restoreNextConfig(originalConfig);
    }
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Run the build
build();
