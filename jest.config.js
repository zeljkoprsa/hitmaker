/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json'
    }]
  },
  moduleNameMapper: {
    '^tone$': '<rootDir>/src/__mocks__/tone.ts',
    '^tone/(.*)$': '<rootDir>/src/__mocks__/tone.ts',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1'
  },
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: [
    '@testing-library/jest-dom',
    '<rootDir>/src/setupTests.ts'
  ],
  modulePaths: ['<rootDir>/src'],
  roots: ['<rootDir>/src']
};
