import { listen } from '@tauri-apps/api/event';
import { TimerContext, TimerEvents } from '../timer/machine';
import { pause, play, start, stop, update } from '@shared/commands';

export type ClockMachine = typeof clockMachine;
export const clockMachine =
  ({ id }: TimerContext) =>
  (sendBack: (e: TimerEvents) => void, recieve: (e: any) => void) => {
    recieve((e: any) => {
      const {
        data: { seconds, minutes, id },
      } = e;
      switch (e.type) {
        case 'play':
          return play(id);
        case 'create':
          return start(minutes, seconds, id);
        case 'pause':
          return pause(id);
        case 'stop':
          return stop(id);
        case 'update':
          return update(id, minutes);
      }
    });

    const listeners = Promise.all([
      listen(`tick_${id}`, (e: any) => {
        sendBack({
          type: '_TICK',
          seconds: e.payload.seconds as number,
          minutes: e.payload.minutes as number,
        });
      }),
    ]);

    return () => {
      listeners.then((l) => {
        l.forEach((unlisten) => unlisten());
      });
    };
  };
