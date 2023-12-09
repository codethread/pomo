import { PageWrapper } from '@client/storybook';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { Theme as ThemeC } from './Theme';

const meta: ComponentMeta<StoryArgs> = {
  component: ThemeC,
  args: {
    wrapped: true,
  },
};
export default meta;

type StoryArgs = (args: { wrapped: boolean }) => JSX.Element;

export const Theme: ComponentStory<StoryArgs> = (args) => (
  <PageWrapper wrapped={args.wrapped}>
    <ThemeC />
  </PageWrapper>
);
