import { createCtx } from './createCtx';

import { slackHooks as hooks } from './slack';

describe('slack integrations', () => {
  describe('when slack is disabled', () => {
    it('should never fire', () => {
      const { ctx, spies } = createCtx({ config: { slack: { enabled: false } } });

      hooks.onTickHook(ctx);
      hooks.onStartHook(ctx);
      hooks.onCompleteHook(ctx);
      hooks.onPauseHook(ctx);
      hooks.onPlayHook(ctx);
      hooks.onStopHook(ctx);

      expect(spies.slackSetProfile).not.toHaveBeenCalled();
      expect(spies.slackSetPresence).not.toHaveBeenCalled();
      expect(spies.slackSetSnooze).not.toHaveBeenCalled();
    });
  });

  describe('when slack is selected with valid creds', () => {
    describe('when timer is a pomodoro', () => {
      test('onStartHook sets the user as away', () => {
        const { ctx, spies } = createCtx();

        hooks.onStartHook(ctx);

        expect(spies.slackSetPresence).toHaveBeenCalledWith(expect.anything(), 'away');
        expect(spies.slackSetSnooze).toHaveBeenCalledWith(expect.anything(), ctx.timer.minutes);
        expect(spies.slackSetProfile).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            emoji: ':tomato:',
            text: 'free in 17 minutes',
          })
        );
      });

      test('onTickHook updates the user status, but only when the timer has ticked down all seconds in any given minute', () => {
        const testCtx = createCtx({ timer: { minutes: 1, seconds: 1 } });
        hooks.onTickHook(testCtx.ctx);
        expect(testCtx.spies.slackSetProfile).not.toBeCalled();

        const { ctx, spies } = createCtx({ timer: { minutes: 1, seconds: 0 } });

        hooks.onTickHook(ctx);

        expect(spies.slackSetProfile).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            text: 'free in 1 min',
          })
        );
      });

      test('onStopHook sets the user as active', () => {
        const { ctx, spies } = createCtx();

        hooks.onStopHook(ctx);

        expect(spies.slackSetPresence).toHaveBeenCalledWith(expect.anything(), 'active');
        expect(spies.slackSetSnooze).toHaveBeenCalledWith(expect.anything(), 0);
        expect(spies.slackSetProfile).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            emoji: '',
            text: '',
          })
        );
      });

      test('onCompleteHook sets the user as active', () => {
        const { ctx, spies } = createCtx();

        hooks.onCompleteHook(ctx);

        expect(spies.slackSetPresence).toHaveBeenCalledWith(expect.anything(), 'active');
        expect(spies.slackSetSnooze).toHaveBeenCalledWith(expect.anything(), 0);
        expect(spies.slackSetProfile).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            emoji: '',
            text: '',
          })
        );
      });
    });

    test.each(['short', 'long'] as const)(
      'when timer is a "%s" break, it does not call any hooks',
      (timerType) => {
        const { ctx, spies } = createCtx({ timer: { type: timerType } });

        hooks.onTickHook(ctx);
        hooks.onStartHook(ctx);
        hooks.onCompleteHook(ctx);
        hooks.onPauseHook(ctx);
        hooks.onPlayHook(ctx);
        hooks.onStopHook(ctx);

        expect(spies.slackSetProfile).not.toHaveBeenCalled();
        expect(spies.slackSetPresence).not.toHaveBeenCalled();
        expect(spies.slackSetSnooze).not.toHaveBeenCalled();
      }
    );
  });
});
