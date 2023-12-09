// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    updateSetting: 'UPDATE';
    validateSetting: 'UPDATE';
    saveSettings: 'SAVE';
    storeConfig: 'CONFIG_LOADED';
  };
  internalEvents: {
    '': { type: '' };
    'xstate.init': { type: 'xstate.init' };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    hasError: '';
  };
  eventsCausingDelays: {};
  matchesStates: 'idle' | 'valid' | 'invalid' | 'checking' | 'resetting';
  tags: 'idle' | 'editing' | 'errors';
}
