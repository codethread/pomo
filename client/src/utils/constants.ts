import type { Nodenv } from './asserts';
import { assertValidNodenv } from './asserts';

interface URLS {
  readonly main: string;
}

const nodenv = sanitiseNodenv(process.env.NODE_ENV);

/**
 * Development mode
 * Set for local development, with certain features enabled such as browser devtools
 */
const isDev = nodenv === 'development';
/**
 * Production mode
 * Set for how clients will interact with application.
 */
const isProd = nodenv === 'production';
/**
 * Test mode
 * Set for Unit tests via vi
 * Allows for certain backdoors to be exposed such as forcing errors for testing
 */
const isTest = nodenv === 'test';
/**
 * Integration mode
 * Production like in all ways except that certain electron security features
 * are disabled to allow Spectron to interact with the electron process during
 * e2e tests.
 */
const isIntegration = isProd && process.env.INTEGRATION === 'true';

const urls: URLS = {
  main: 'http://localhost:4000',
};

export { nodenv, isDev, isProd, isTest, isIntegration, urls };

function sanitiseNodenv(env?: string): Nodenv {
  if (!env) throw new Error('NODE_ENV is not defined');
  const sanitisedNodenv = env.trim().toLocaleLowerCase();
  assertValidNodenv(sanitisedNodenv);
  return sanitisedNodenv;
}

export const githubScopes = ['repo', 'read:org'];
