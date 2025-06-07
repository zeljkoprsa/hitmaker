# Testing Documentation for tryuseless.com

## Table of Contents

1. [Introduction](#introduction)
2. [Test Setup](#test-setup)
3. [Running Tests](#running-tests)
4. [Test Organization](#test-organization)
5. [Writing Tests](#writing-tests)
6. [Mocking](#mocking)
7. [Best Practices](#best-practices)
8. [Continuous Integration](#continuous-integration)

## Introduction

This document outlines the testing approach for the tryuseless.com project. We use Jest as our test runner and React Testing Library for testing React components. Our goal is to maintain high-quality, maintainable tests that provide confidence in our codebase.

## Test Setup

Our testing environment uses:

- **Jest**: JavaScript testing framework
- **React Testing Library**: For rendering and testing React components
- **jest-dom**: For additional DOM testing assertions

### Configuration Files

- `jest.config.js`: Main Jest configuration
- `jest.setup.js`: Setup file for extending Jest with additional matchers and global setup
- `__mocks__`: Directory containing mocks for non-JavaScript modules

## Running Tests

To run tests, use the following npm scripts:

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Viewing Test Coverage

After running `npm run test:coverage`, you can view the coverage report in the terminal. A detailed HTML report is also generated in the `coverage` directory, which you can open in your browser.

## Test Organization

We follow the component-adjacent test file pattern, where test files are placed next to the files they test.

```
components/
  ├── ui/
  │   ├── Badge.tsx
  │   ├── Badge.test.tsx    # Tests for Badge component
  │   ├── Card.tsx
  │   └── Card.test.tsx     # Tests for Card component
  ├── layout/
  │   ├── Header.tsx
  │   └── Header.test.tsx   # Tests for Header component
```

For testing hooks, utilities, or functions that aren't tied to a specific component, we use a similar approach:

```
lib/
  ├── hooks/
  │   ├── useWindowSize.ts
  │   └── useWindowSize.test.ts
  ├── utils/
  │   ├── formatDate.ts
  │   └── formatDate.test.ts
```

## Writing Tests

### Component Tests

Component tests should verify:

1. The component renders correctly
2. Props affect the component as expected
3. User interactions trigger the expected behavior
4. Edge cases and error states are handled properly

Example component test:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('responds to user interaction', async () => {
    render(<MyComponent />);
    await userEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(screen.getByText('Button clicked')).toBeInTheDocument();
  });
});
```

### Hook Tests

To test custom hooks, use the `renderHook` function from React Testing Library:

```tsx
import { renderHook, act } from '@testing-library/react';
import useCounter from './useCounter';

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### Testing Utilities and Functions

Pure function tests should be simple and straightforward:

```tsx
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });
});
```

## Mocking

### Mocking Components

To mock a component:

```tsx
// In your test file
jest.mock('../ComponentToMock', () => ({
  __esModule: true,
  default: () => <div data-testid="mocked-component">Mocked Component</div>
}));
```

### Mocking Next.js Features

#### Mocking useRouter

```tsx
// In your test file
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    // Add other properties as needed
  })
}));
```

#### Mocking next/image

```tsx
// In __mocks__/next/image.js
module.exports = {
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  }
};
```

### Mocking API Calls

For mocking fetch or other API calls:

```tsx
// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'mocked data' }),
    ok: true
  })
);

// Or use jest.spyOn
jest.spyOn(global, 'fetch').mockResolvedValue({
  json: () => Promise.resolve({ data: 'mocked data' }),
  ok: true
});
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what the component does, not how it does it.
2. **Use appropriate queries**: Prefer queries that reflect how users interact with your UI:
   - `getByRole` over `getByTestId`
   - `getByLabelText` for form inputs
   - `getByText` for visible text
3. **Keep tests simple**: Each test should test one thing.
4. **Use descriptive test names**: Names should describe what is being tested.
5. **Avoid testing implementation details**: Don't test state directly unless necessary.
6. **Use Setup functions**: Use `beforeEach` to set up common test fixtures.
7. **Clean up after tests**: Use `afterEach` to clean up if your tests modify the environment.

## Continuous Integration

Our CI pipeline runs tests automatically on every pull request. Here's what's checked:

1. All tests pass
2. Test coverage meets minimum thresholds
3. Linting passes

To set up CI integration locally, follow these steps:

1. Make sure your tests pass locally using `npm test`
2. Check that your code meets the linting standards with `npm run lint`
3. Ensure your changes have appropriate test coverage

---

For questions or suggestions about our testing approach, please reach out to the development team.

