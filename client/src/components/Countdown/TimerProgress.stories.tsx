import { PageWrapper } from '@client/storybook';
import React, { useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { ITimerProgress, TimerProgress } from './TimerProgress';

export default {
  component: TimerProgress,
  args: {
    wrapped: true,
    duration: 10,
    mins: 1,
    seconds: 10,
    state: 'pomo',
  },
} as ComponentMeta<StoryArgs>;

type StoryArgs = (
  args: ITimerProgress & {
    wrapped: boolean;
  }
) => JSX.Element;

export const Timer: ComponentStory<StoryArgs> = ({ wrapped, state, seconds, mins, duration }) => (
  <PageWrapper padded wrapped={wrapped}>
    <TimerProgress duration={duration} mins={mins} seconds={seconds} state={state} />
  </PageWrapper>
);

export const TimerPomo = Timer.bind({});
TimerPomo.args = {
  state: 'pomo',
  mins: 3,
  seconds: 30,
  duration: 5,
};

export const TimerBreak = Timer.bind({});
TimerBreak.args = {
  state: 'break',
  mins: 3,
  seconds: 30,
  duration: 5,
};

export const TimerInactive = Timer.bind({});
TimerInactive.args = {
  state: 'inactive',
  mins: 3,
  seconds: 30,
  duration: 5,
};
