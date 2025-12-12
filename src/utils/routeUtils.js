/**
 * Utility functions for handling routes in different environments
 */

/**
 * Returns the base path for the application
 * In development, this will be empty
 * In production, this will be '/hitmaker'
 */
export const getBasePath = () => {
  return process.env.REACT_APP_BASE_PATH || '';
};

/**
 * Prefixes a route with the base path if needed
 * @param {string} route - The route to prefix
 * @returns {string} - The prefixed route
 */
export const prefixRoute = route => {
  const basePath = getBasePath();
  if (!route) return basePath || '/';

  // If route already starts with base path, don't add it again
  if (basePath && route.startsWith(basePath)) {
    return route;
  }

  // Handle joining paths with slashes correctly
  if (basePath && route.startsWith('/')) {
    return `${basePath}${route}`;
  } else if (basePath) {
    return `${basePath}/${route}`;
  }

  return route;
};
