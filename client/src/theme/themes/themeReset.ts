import { Themers } from '@client/theme/utils';

export function themeReset({ setPalette, setColors }: Themers): void {
  setColors(
    {
      '--col-bg': 'var(--col-null)',
      '--col-bg-alt': 'var(--col-null)',
      '--col-fg': 'var(--col-null)',
      '--col-fg-alt': 'var(--col-null)',

      /* base */
      '--col-base0': 'var(--col-null)',
      '--col-base1': 'var(--col-null)',
      '--col-base2': 'var(--col-null)',
      '--col-base3': 'var(--col-null)',
      '--col-base4': 'var(--col-null)',
      '--col-base5': 'var(--col-null)',
      '--col-base6': 'var(--col-null)',
      '--col-base7': 'var(--col-null)',
      '--col-base8': 'var(--col-null)',

      /* colours */
      '--col-grey': 'var(--col-null)',
      '--col-red': 'var(--col-null)',
      '--col-orange': 'var(--col-null)',
      '--col-green': 'var(--col-null)',
      '--col-teal': 'var(--col-null)',
      '--col-yellow': 'var(--col-null)',
      '--col-blue': 'var(--col-null)',
      '--col-dark-blue': 'var(--col-null)',
      '--col-magenta': 'var(--col-null)',
      '--col-violet': 'var(--col-null)',
      '--col-cyan': 'var(--col-null)',
      '--col-dark-cyan': 'var(--col-null)',
    },
    { strict: true }
  );

  setPalette(
    {
      '--color-background': 'var(--col-bg)',
      '--color-backgroundSubtle': 'var(--col-bg-alt)',
      '--color-backgroundBright': 'var(--col-base3)',
      '--color-backgroundBrightest': 'var(--col-base5)',
      '--color-fgDim': 'var(--col-base6)',
      '--color-fg': 'var(--col-fg)',
      '--color-fgBrightest': 'var(--col-base8)',
      '--color-primary': 'var(--col-teal)',
      '--color-bright': 'var(--col-cyan)',
      '--color-secondary': 'var(--col-blue)',
      '--color-tertiary': 'var(--col-dark-blue)',
      '--color-error': 'var(--col-red)',
      '--color-warning': 'var(--col-yellow)',
      '--color-good': 'var(--col-green)',
    },
    { strict: true }
  );
}
