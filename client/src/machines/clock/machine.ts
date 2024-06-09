import { TimerContext, TimerEvents } from '../timer/model';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';

export function clockMachine({ id }: TimerContext) {
  return (sendBack: (e: TimerEvents) => void, recieve: (e: any) => void) => {
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
      }
    });

    const listeners = Promise.all([
      listen(`complete_${id}`, () => {
        sendBack({ type: '_COMPLETE' });
      }),

      listen(`setTime_${id}`, (e: any) => {
        sendBack({
          type: 'FORCE_UPDATE',
          seconds: e.payload.seconds as number,
          minutes: e.payload.minutes as number,
        });
      }),

      listen(`tick_${id}`, () => {
        sendBack({ type: '_TICK' });
      }),
    ]);

    return () => {
      listeners.then((l) => {
        l.forEach((unlisten) => unlisten());
      });
    };
  };
}
