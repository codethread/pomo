import { themers } from '@client/theme/utils';
import { assertUnreachable } from '@shared/asserts';
import { nord, nordLight, rosePine } from './themes/nord';
import { oneDark } from './themes/oneDark';
import { themeReset } from './themes/themeReset';

export const themes = ['nord', 'nord-light', 'one-dark', 'rose-pine'] as const;

export function updateTheme(theme: ThemeName): void {
  themeReset(themers);

  switch (theme) {
    case 'nord-light':
      return nordLight(themers);
    case 'nord':
      return nord(themers);
    case 'one-dark':
      return oneDark(themers);
    case 'rose-pine':
      return rosePine(themers);
    default:
      return assertUnreachable(theme);
  }
}

export type UpdateTheme = typeof updateTheme;

export type ThemeName = typeof themes[number];
