// Import jest-dom's custom matchers for testing DOM elements
import '@testing-library/jest-dom';

// You can add any global test setup here
// For example, mocking the global window object or adding custom matchers

// If you need to mock any global objects or set global variables:
// global.fetch = jest.fn();

// If you need to mock Next.js components like useRouter:
// jest.mock('next/router', () => ({
//   useRouter: () => ({
//     push: jest.fn(),
//     replace: jest.fn(),
//     prefetch: jest.fn(),
//     back: jest.fn(),
//     query: {},
//     pathname: '/',
//     // Add any other router properties your app uses
//   }),
// }));

// Clean up any mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

