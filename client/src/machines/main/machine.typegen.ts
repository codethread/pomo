// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    setLoaded: 'CONFIG_LOADED';
    onTimerPause: 'TIMER_PAUSE';
    onTimerPlay: 'TIMER_PLAY';
    onTimerStart: 'TIMER_START';
    onTimerStop: 'TIMER_STOP';
    onTimerTick: 'TIMER_TICK';
    onTimerComplete: 'TIMER_COMPLETE';
  };
  internalEvents: {
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
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates: 'active';
  tags: never;
}
