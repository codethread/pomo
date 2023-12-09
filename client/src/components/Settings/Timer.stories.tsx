import React from 'react';
import { PageWrapper } from '@client/storybook';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useTimerSettings } from '@client/hooks';
import { Timer as TimerC } from './Timer';

const meta: ComponentMeta<StoryArgs> = {
  component: TimerC,
  args: {
    wrapped: true,
  },
};
export default meta;

type StoryArgs = (args: { wrapped: boolean }) => JSX.Element;

export const Timer: ComponentStory<StoryArgs> = (args) => {
  const actor = useTimerSettings();
  return (
    <PageWrapper wrapped={args.wrapped}>
      {actor ? <TimerC actor={actor} /> : <p>loading...</p>}
    </PageWrapper>
  );
};
