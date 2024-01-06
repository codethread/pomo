// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    updatedStarted: 'START';
    updateTimerConfig: 'UPDATE';
    updateTimer: '_TICK';
    onTickHook: '_TICK';
    updateNow: 'FORCE_UPDATE';
    onPlayHook: 'PLAY';
    onStartHook: 'xstate.init';
    onPauseHook: 'PAUSE';
    onCompleteHook: '_TICK';
    onStopHook: 'STOP';
  };
  internalEvents: {
    '': { type: '' };
    'xstate.init': { type: 'xstate.init' };
    'done.invoke.updater': {
      type: 'done.invoke.updater';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.updater': { type: 'error.platform.updater'; data: unknown };
  };
  invokeSrcNameMap: {
    updater: 'done.invoke.updater';
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    updater: 'START' | '' | 'PLAY';
  };
  eventsCausingGuards: {
    shouldAutoStart: '';
    isTimerFinished: '_TICK';
  };
  eventsCausingDelays: {};
  matchesStates: 'ready' | 'playing' | 'paused' | 'complete' | 'stopped';
  tags: never;
}
