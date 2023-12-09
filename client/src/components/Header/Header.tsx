import { Pages } from '@client/pages/PageManager';
import React from 'react';
import { Box, MenuButton } from '@client/components';
import pj from '../../../../package.json';

export interface IHeader {
  onClick: () => void;
  page: Pages;
  showClose: boolean;
}

export function Header({ onClick, page, showClose }: IHeader): JSX.Element {
  return (
    <header className="grid h-11 flex-shrink-0 grid-cols-[20%_60%_20%]">
      <MenuButton onClick={onClick} showClose={showClose} />
      <Box>
        <h2 className="text-center text-lg">{showClose ? 'Menu' : page}</h2>
      </Box>
      <Box className="text-sm text-thmBackgroundBrightest">
        <p>Beta</p>
        <p className="text-xs">{pj.version}</p>
      </Box>
    </header>
  );
}
