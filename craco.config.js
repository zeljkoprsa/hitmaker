/* eslint-disable */
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Check if bundle analysis is requested
const shouldAnalyzeBundle = process.env.REACT_APP_BUNDLE_ANALYZER === 'true';

// Set the public URL path based on environment
// For production, we need to use absolute paths
const publicUrl = process.env.PUBLIC_URL || '/';
console.log(`Using publicUrl: ${publicUrl}`);

module.exports = {
  eslint: {
    enable: process.env.NODE_ENV !== 'production',
  },
  webpack: {
    alias: {
      '@styles': path.resolve(__dirname, 'src/styles/'),
      '@features': path.resolve(__dirname, 'src/features/'),
      '@components': path.resolve(__dirname, 'src/components/'),
    },
    plugins: [
      // Add bundle analyzer in analyze mode
      ...(shouldAnalyzeBundle
        ? [
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: 8888,
            openAnalyzer: true,
          }),
        ]
        : []),
    ],
    configure: webpackConfig => {
      // Set the public path based on environment
      // For production, we need absolute paths starting with / not relative paths with ./
      // Always use absolute paths to avoid asset loading issues
      webpackConfig.output.publicPath = publicUrl.endsWith('/') ? publicUrl : publicUrl + '/';
      console.log(`Setting webpack publicPath to: ${webpackConfig.output.publicPath}`);

      // Production-only optimizations
      if (isProduction) {
        // Ensure minimization is enabled
        webpackConfig.optimization.minimize = true;

        // Configure TerserPlugin for production
        webpackConfig.optimization.minimizer = [
          new TerserPlugin({
            terserOptions: {
              parse: {
                // We want terser to parse ecma 8 code. However, we don't want it
                // to apply any minification steps that turns valid ecma 5 code
                // into invalid ecma 5 code. This is why the 'compress' and 'output'
                // sections only apply transformations that are ecma 5 safe
                ecma: 8,
              },
              compress: {
                ecma: 5,
                warnings: false,
                // Remove console.* calls
                drop_console: true,
                // Keep console.error and console.warn for important messages
                pure_funcs: ['console.log', 'console.debug', 'console.info'],
                // Optimize performance
                passes: 2,
                reduce_vars: true,
                reduce_funcs: true,
              },
              output: {
                ecma: 5,
                comments: false,
                // Turned on because emoji and regex is not minified properly using default
                ascii_only: true,
              },
            },
            // Use multi-process parallel running to improve build speed
            parallel: true,
            extractComments: false,
          }),
        ];

        // Split chunks more efficiently
        webpackConfig.optimization.splitChunks = {
          chunks: 'all',
          minSize: 20000,
          maxSize: 0,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          automaticNameDelimiter: '~',
          enforceSizeThreshold: 50000,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        };
      }

      // Always return the modified config
      return webpackConfig;
    },
  },
  devServer: {
    allowedHosts: 'all',
    host: '0.0.0.0',
  },
};
