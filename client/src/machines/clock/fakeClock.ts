import type { ClockMachine } from './machine';

const interval = 1000;
class Clock {
  private complete = false;

  constructor(private mins: number, private seconds: number) {}

  countdown() {
    if (this.complete) return;

    if (this.mins === 0 && this.seconds === 1) {
      this.seconds = 0;
      this.complete = true;
    } else if (this.seconds === 0) {
      this.seconds = 59;
      this.mins -= 1;
    } else {
      this.seconds -= 1;
    }
  }

  getTime() {
    return { minutes: this.mins, seconds: this.seconds };
  }
}

export const fakeClockMachine: ClockMachine = () => {
  let timer: NodeJS.Timeout | undefined = undefined;
  let clock: Clock | null = null;

  const stopTimer = () => {
    if (timer) clearInterval(timer);
  };

  return (sendBack, recieve) => {
    recieve((e: any) => {
      const {
        data: { seconds, minutes },
      } = e;

      switch (e.type) {
        case 'create':
          clock = new Clock(minutes, seconds);
          break;
        case 'play':
          timer = setInterval(() => {
            if (!clock) {
              throw new Error('dev error, should be a clock');
            }
            clock.countdown();
            const { seconds, minutes } = clock.getTime();
            sendBack({ type: '_TICK', seconds, minutes });
          }, interval);
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
      stopTimer();
    };
  };
};
