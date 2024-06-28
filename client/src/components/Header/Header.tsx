import { Pages } from '@client/pages/PageManager';
import { Box, MenuButton } from '@client/components';
import { getVersion } from '@tauri-apps/api/app';
import { useAsync } from 'react-use';
import { useIsDev } from '@client/hooks/useBridge';

export interface IHeader {
  onClick: () => void;
  page: Pages;
  showClose: boolean;
}

export function Header({ onClick, page, showClose }: IHeader): JSX.Element {
  const { value: version } = useAsync(getVersion);
  const { value: isDev } = useIsDev();
  return (
    <header className="grid h-11 flex-shrink-0 grid-cols-[20%_60%_20%]">
      <MenuButton onClick={onClick} showClose={showClose} />
      <Box>
        <h2 className="text-center text-lg">{showClose ? 'Menu' : page}</h2>
      </Box>
      <Box className="text-sm text-thmBackgroundBrightest">
        {isDev ? <p>Dev</p> : <p>Beta</p>}
        <p className="text-xs">{version}</p>
      </Box>
    </header>
  );
}
