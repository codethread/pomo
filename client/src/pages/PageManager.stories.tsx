import { PageWrapper } from '@client/storybook';
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { IPageManager, PageManager as Pages } from './PageManager';
import { Navigation } from './Navigation';

export default {
  component: Pages,
  args: {
    initialPage: 'Timer',
    wrapped: true,
  },
} as ComponentMeta<StoryArgs>;

type StoryArgs = (
  args: IPageManager & {
    wrapped: boolean;
  }
) => JSX.Element;

export const PageManager: ComponentStory<StoryArgs> = (args) => (
  <PageWrapper wrapped={args.wrapped}>
    <Pages initialPage={args.initialPage} />
  </PageWrapper>
);

PageManager.args = {
  initialPage: 'Timer',
};

export const Nav: ComponentStory<StoryArgs> = (args) => (
  <PageWrapper wrapped={args.wrapped}>
    <Navigation onNavigate={() => {}} page={args.initialPage ?? 'Timer'} />
  </PageWrapper>
);
