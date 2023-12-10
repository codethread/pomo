import { Nodenv } from './asserts';

const originalNodenv = process.env.NODE_ENV;

describe('constants', () => {
  afterAll(() => {
    process.env.NODE_ENV = originalNodenv;
  });

  describe('nodenv', () => {
    const validNodenvs = [
      'test',
      'production',
      'development',
      ' development ',
      '    development    ',
      '    DEVELOPMENT    ',
      'DEVELOPMENT',
      'DevElOPmeNT',
    ];
    validNodenvs.forEach((env) => {
      describe(`when valid nodenv of "${env}"`, () => {
        it('sets nodenv', () => {
          vi.resetModules();
          process.env.NODE_ENV = env;
          expect(import('./constants')).resolves.not.toThrowError();
        });
      });
    });

    const invalidNodenvs = ['', undefined, 'dev', 'true', 'false', ' '];

    invalidNodenvs.forEach((env) => {
      describe(`when invalid nodenv of "${JSON.stringify(env)}"`, () => {
        it('throws error', () => {
          vi.resetModules();
          process.env.NODE_ENV = env;
          expect(import('./constants')).rejects.toThrowError();
        });
      });
    });
  });

  describe('isDev, isProd, isTest', () => {
    interface Collection {
      env: Nodenv;
      isProd: boolean;
      isTest: boolean;
      isDev: boolean;
    }

    const collections: Collection[] = [
      { env: 'development', isProd: false, isTest: false, isDev: true },
      { env: 'test', isProd: false, isTest: true, isDev: false },
      { env: 'production', isProd: true, isTest: false, isDev: false },
    ];

    collections.forEach((collection) => {
      it(`when env is "${collection.env} env flags are set correctly`, async () => {
        vi.resetModules();
        process.env.NODE_ENV = collection.env;
        const { isDev, isProd, isTest } = await import('./constants');
        expect(isDev).toBe(collection.isDev);
        expect(isProd).toBe(collection.isProd);
        expect(isTest).toBe(collection.isTest);
      });
    });
  });

  describe('isIntegration', () => {
    describe('when not in production mode', () => {
      it('is always false', async () => {
        process.env.NODE_ENV = 'development';
        process.env.INTEGRATION = 'true';

        vi.resetModules();
        const { isIntegration } = await import('./constants');
        expect(isIntegration).toBe(false);
      });
    });

    describe('when in production mode', () => {
      describe('when INTEGRATION is true', () => {
        it('is is true', async () => {
          process.env.NODE_ENV = 'production';
          process.env.INTEGRATION = 'true';

          vi.resetModules();
          const { isIntegration } = await import('./constants');
          expect(isIntegration).toBe(true);
        });
      });

      describe('when INTEGRATION is false', () => {
        it('is is true', async () => {
          process.env.NODE_ENV = 'production';
          process.env.INTEGRATION = 'false';

          vi.resetModules();
          const { isIntegration } = await import('./constants');
          expect(isIntegration).toBe(false);
        });
      });
    });
  });
});
