const commonIgnore = ['node_modules', 'temp', 'build', 'reports', 'dist', 'publishingTools'];

/** @type {import('ts-vi/dist/types').InitialOptionsTsvi.projects[number]} */
const unitTests = {
  modulePathIgnorePatterns: commonIgnore,
  // preset: 'ts-vi',
  testEnvironment: 'node',
  clearMocks: true,
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': '<rootDir>/src/testHelpers/stringStub.ts',
    '^@shared(.*)$': '<rootDir>/src/utils/$1',
    '^@client(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/src/testHelpers/$1',
    'package.json': '<rootDir>/src/../../package.json',
  },
};

/** @type {import('ts-vi/dist/types').InitialOptionsTsvi} */
export default {
  coverageDirectory: '<rootDir>/src/reports',
  maxWorkers: '80%',
  preset: 'ts-vi',
  projects: [
    {
      ...unitTests,
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['**/?(*.)+(spec|test).ts'],
      setupFilesAfterEnv: ['<rootDir>/src/testHelpers/vi.setup.ts'],
    },
    {
      ...unitTests,
      displayName: 'ui',
      testEnvironment: 'jsdom',
      testMatch: ['**/?(*.)+(spec|test).tsx'],
      setupFilesAfterEnv: [
        '<rootDir>/src/testHelpers/setupTests.ts',
        '<rootDir>/src/testHelpers/vi.setup.ts',
      ],
    },
  ],
};
