import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],

  // Use a dedicated tsconfig that sets module=CommonJS, rootDir=., and suppresses TS6 deprecation
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.test.json',
      },
    ],
  },

  // Path alias: @/ → project root
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Ignore root-level dot directories (build output, editor state) so they are
  // never scanned for tests or pulled into the module map.
  modulePathIgnorePatterns: ['<rootDir>/\\.[^/]+/'],
  watchPathIgnorePatterns: ['<rootDir>/\\.[^/]+/'],

  // Don't transform node_modules
  transformIgnorePatterns: ['/node_modules/'],

  // Coverage
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Isolation between tests
  clearMocks: true,
  restoreMocks: true,
};

export default config;
