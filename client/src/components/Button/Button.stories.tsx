import { ComponentMeta, ComponentStory } from '@storybook/react';
import { PageWrapper } from '@client/storybook';
import React from 'react';
import { Button, IButton } from './Button';

export default {
  component: Button,
} as ComponentMeta<typeof Button>;

const sharedArgs: Omit<IButton, 'type'> = {
  disabled: false,
};

export const VariantsCol: ComponentStory<typeof Button> = (args) => (
  <PageWrapper padded>
    <Button {...args} type="button" variant="primary">
      Primary
    </Button>
    <Button {...args} type="button" variant="secondary">
      secondary
    </Button>
    <Button {...args} type="button" variant="tertiary">
      tertiary
    </Button>
  </PageWrapper>
);
VariantsCol.args = { ...sharedArgs };

export const VariantsRow: ComponentStory<typeof Button> = (args) => (
  <PageWrapper padded>
    <div className="flex flex-row flex-wrap gap-1">
      <Button {...args} type="button" variant="primary">
        Primary
      </Button>
      <Button {...args} type="button" variant="secondary">
        secondary
      </Button>
      <Button {...args} type="button" variant="tertiary">
        tertiary
      </Button>
    </div>
  </PageWrapper>
);

VariantsRow.args = { ...sharedArgs };

const Template: ComponentStory<typeof Button> = (args) => (
  <PageWrapper padded>
    <Button {...args} type="button">
      {args.children}
    </Button>
  </PageWrapper>
);

export const Primary = Template.bind({});
Primary.args = { children: 'button' };
export const PrimaryFullWidth = Template.bind({});
PrimaryFullWidth.args = { children: 'button', fullWidth: true };
