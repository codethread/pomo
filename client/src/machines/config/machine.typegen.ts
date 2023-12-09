// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    storeConfig: 'done.invoke.loadConfig' | 'done.invoke.updateConfig' | 'done.invoke.resetConfig';
    respondWithConfig: 'REQUEST_CONFIG';
    broadcastConfig:
      | 'done.invoke.updateConfig'
      | 'error.platform.updateConfig'
      | 'done.invoke.resetConfig'
      | 'error.platform.resetConfig';
  };
  internalEvents: {
    'done.invoke.loadConfig': {
      type: 'done.invoke.loadConfig';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.updateConfig': {
      type: 'done.invoke.updateConfig';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.resetConfig': {
      type: 'done.invoke.resetConfig';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.updateConfig': { type: 'error.platform.updateConfig'; data: unknown };
    'error.platform.resetConfig': { type: 'error.platform.resetConfig'; data: unknown };
    'xstate.init': { type: 'xstate.init' };
    'error.platform.loadConfig': { type: 'error.platform.loadConfig'; data: unknown };
  };
  invokeSrcNameMap: {
    loadConfig: 'done.invoke.loadConfig';
    updateConfig: 'done.invoke.updateConfig';
    resetConfig: 'done.invoke.resetConfig';
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    loadConfig: 'xstate.init';
    updateConfig: 'UPDATE';
    resetConfig: 'RESET';
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | 'loading'
    | 'loaded'
    | 'loaded.settings'
    | 'loaded.config'
    | 'loaded.config.idle'
    | 'loaded.config.updating'
    | 'loaded.config.resetting'
    | { loaded?: 'settings' | 'config' | { config?: 'idle' | 'updating' | 'resetting' } };
  tags: 'loading' | 'idle' | 'updating';
}
