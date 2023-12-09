// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    onStartHook: 'TIMER_START';
    onPauseHook: 'TIMER_PAUSE';
    onPlayHook: 'TIMER_PLAY';
    onTickHook: 'TIMER_TICK';
    updateTimerConfig: 'CONFIG_LOADED';
    onStopHook: 'TIMER_STOPPED';
    increasePomoCount: 'TIMER_COMPLETE';
    onCompleteHook: 'TIMER_COMPLETE';
    updatePomoTimerConfig: 'CONFIG_LOADED';
    increaseShortBreakCount: 'xstate.init';
    increaseLongBreakCount: 'xstate.init';
  };
  internalEvents: {
    '': { type: '' };
    'done.invoke.pomodoroMachine.short:invocation[0]': {
      type: 'done.invoke.pomodoroMachine.short:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.pomodoroMachine.long:invocation[0]': {
      type: 'done.invoke.pomodoroMachine.long:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
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
    isLongBreak: '';
  };
  eventsCausingDelays: {};
  matchesStates: 'loading' | 'pomo' | 'breakDecision' | 'short' | 'long';
  tags: never;
}
