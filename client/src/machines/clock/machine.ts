import { TimerContext, TimerEvents } from '../timer/model';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';

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
          return invoke('play', { id });
        case 'create':
          return invoke('start', { seconds, minutes, timerid: id });
        case 'pause':
          return invoke('pause', { id });
        case 'stop':
          return invoke('stop', { id });
        case 'update':
          return invoke('update', { id, duration: minutes });
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
