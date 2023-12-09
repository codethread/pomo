import { themeMachine } from '@client/machines/theme/machine';
import { type UpdateTheme } from '@client/theme';
import { IBridge, TimerHooks, UserConfig } from '@shared/types';
import { assign, createMachine, forwardTo, InterpreterFrom } from 'xstate';
import configMachine from '../config/machine';
import { actorIds } from '../constants';
import pomodoroMachineFactory, { IPomodoroMachine } from '../pomodoro/machine';
import mainModel, { MainContext, MainEvents } from './model';

export interface IMainMachine {
  pomodoro: IPomodoroMachine;
  bridge: IBridge;
  actions: TimerHooks;
  /**
   * Inject a config as a testing mechanism
   */
  configOverride?: UserConfig;
  updateTheme: UpdateTheme;
}

const mainMachineFactory = ({
  pomodoro,
  bridge,
  actions,
  configOverride,
  updateTheme,
}: IMainMachine) =>
  createMachine(
    {
      id: 'main',
      schema: {
        context: {} as MainContext,
        events: {} as MainEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      context: mainModel.initialContext,
      initial: 'active',
      on: {
        CONFIG_LOADED: {
          actions: [forwardTo(actorIds.POMODORO), forwardTo(actorIds.THEME), 'setLoaded'],
        },
        TIMER_PAUSE: { actions: 'onTimerPause' },
        TIMER_PLAY: { actions: 'onTimerPlay' },
        TIMER_START: { actions: 'onTimerStart' },
        TIMER_STOP: { actions: 'onTimerStop' },
        TIMER_TICK: { actions: 'onTimerTick' },
        TIMER_COMPLETE: { actions: 'onTimerComplete' },
      },
      states: {
        active: {
          invoke: [
            { id: actorIds.POMODORO, src: pomodoroMachineFactory(pomodoro) },
            { id: actorIds.CONFIG, src: configMachine({ bridge, configOverride }) },
            {
              id: actorIds.THEME,
              src: themeMachine.withConfig({
                actions: {
                  updateTheme: (_, e) => {
                    updateTheme(e.data.theme);
                  },
                },
              }),
            },
          ],
        },
      },
    },
    {
      actions: {
        setLoaded: assign((_, { data }) => ({
          config: data,
          loaded: true,
        })),
        onTimerPause: ({ config }, { data }) => {
          actions.onPauseHook({ bridge, config, timer: data });
        },
        onTimerStart: ({ config }, { data }) => {
          actions.onStartHook({ bridge, config, timer: data });
        },
        onTimerPlay: ({ config }, { data }) => {
          actions.onPlayHook({ bridge, config, timer: data });
        },
        onTimerStop: ({ config }, { data }) => {
          actions.onStopHook({ bridge, config, timer: data });
        },
        onTimerTick: ({ config }, { data }) => {
          actions.onTickHook({ bridge, config, timer: data });
        },
        onTimerComplete: ({ config }, { data }) => {
          actions.onCompleteHook({ bridge, config, timer: data });
        },
      },
    }
  );

export type MainMachine = ReturnType<typeof mainMachineFactory>;
export type MainService = InterpreterFrom<MainMachine>;

export default mainMachineFactory;
