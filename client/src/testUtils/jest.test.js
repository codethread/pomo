const basConfig = require('../jest.config');
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  ...basConfig,
  displayName: 'tests',
  preset: 'ts-jest',
  clearMocks: true,
  setupFilesAfterEnv: [
    '<rootDir>/testHelpers/setupTests.ts',
    '<rootDir>/testHelpers/jest.setup.ts',
  ],
  moduleNameMapper: {
    '^@shared(.*)$': '<rootDir>/shared/$1',
    '^@client(.*)$': '<rootDir>/client/$1',
    '^@electron(.*)$': '<rootDir>/electron/$1',
    '^@test/(.*)$': '<rootDir>/testHelpers/$1',
    'package.json': '<rootDir>/package.json',
  },
};
