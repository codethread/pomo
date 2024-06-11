import type { ClockMachine } from './machine';

export const fakeClockMachine: ClockMachine = () => {
  let timer: NodeJS.Timeout | undefined = undefined;
  const stopTimer = () => {
    if (timer) clearInterval(timer);
  };

  return (sendBack, recieve) => {
    recieve((e: any) => {
      switch (e.type) {
        case 'play':
          timer = setInterval(() => {
            sendBack({ type: '_TICK' });
          }, 1000);
          break;
        case 'pause':
          stopTimer();
          break;
        case 'stop':
          stopTimer();
          break;
      }
    });

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  };
};
