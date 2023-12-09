import { Pages } from '@client/pages/PageManager';
import {
  AdjustmentsIcon,
  ChatAlt2Icon,
  ChevronRightIcon,
  ClockIcon,
  EmojiHappyIcon,
  PencilIcon,
} from '@heroicons/react/solid';
import React from 'react';
import { Button } from '@client/components';

interface INavigation {
  page: Pages;
  onNavigate(page: Pages): void;
}
export function Navigation({ onNavigate, page }: INavigation): JSX.Element {
  return (
    // <div className="absolute top-0 h-full w-full backdrop-blur-md">
    <div className="h-full w-full grow backdrop-blur-md">
      <ul className="mx-auto mt-3 flex w-fit flex-col justify-center space-y-4 align-middle">
        <NavItem onNavigate={onNavigate} page={page} name="Timer" Icon={ClockIcon} />
        <NavItem onNavigate={onNavigate} page={page} name="Slack Settings" Icon={ChatAlt2Icon} />
        <NavItem onNavigate={onNavigate} page={page} name="Timer Settings" Icon={AdjustmentsIcon} />
        <NavItem onNavigate={onNavigate} page={page} name="Theme Settings" Icon={PencilIcon} />
      </ul>
    </div>
  );
}

function NavItem({
  onNavigate,
  page,
  name,
  Icon,
}: INavigation & { name: Pages; Icon: React.FC<{ className: string }> }): JSX.Element | null {
  return (
    <li>
      <Button
        onClick={() => {
          onNavigate(name);
        }}
        variant="tertiary"
        disabled={page === name}
      >
        {page === name ? (
          <ChevronRightIcon className="mr-2 inline-flex w-5" />
        ) : (
          <Icon className="mr-2 inline-flex w-5" />
        )}
        {name}
      </Button>
    </li>
  );
}
