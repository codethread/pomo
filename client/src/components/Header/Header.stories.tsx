import React from 'react';
import { PageWrapper } from '@client/storybook';
import { action } from '@storybook/addon-actions';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Header as HeaderComp, IHeader } from './Header';

const meta: ComponentMeta<StoryArgs> = {
  component: HeaderComp,
  args: {
    page: 'Timer',
    wrapped: true,
  },
};
export default meta;

type StoryArgs = (
  args: IHeader & {
    wrapped: boolean;
  }
) => JSX.Element;

export const Header: ComponentStory<StoryArgs> = (args) => (
  <PageWrapper wrapped={args.wrapped}>
    <HeaderComp onClick={args.onClick} page={args.page} showClose={false} />
  </PageWrapper>
);

Header.args = {
  page: 'Timer',
};
