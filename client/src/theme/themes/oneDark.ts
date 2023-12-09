import { Themers } from '@client/theme/utils';

export function oneDark({ setPalette, setColors }: Themers): void {
  setColors({
    '--col-grey': 'var(--col-base4)',
    '--col-bg': '40 44 52',
    '--col-fg': '187 194 207',
    '--col-bg-alt': '33 36 43',
    '--col-fg-alt': '91 98 104',
    '--col-base0': '27 34 41',
    '--col-base1': '28 31 36',
    '--col-base2': '32 35 40',
    '--col-base3': '35 39 46',
    '--col-base4': '63 68 74',
    '--col-base5': '91 98 104',
    '--col-base6': '115 121 126',
    '--col-base7': '156 160 164',
    '--col-base8': '223 223 223',
    '--col-red': '255 108 107',
    '--col-orange': '218 133 72',
    '--col-green': '152 190 101',
    '--col-teal': '77 181 189',
    '--col-yellow': '236 190 123',
    '--col-blue': '81 175 239',
    '--col-dark-blue': '34 87 160',
    '--col-magenta': '198 120 221',
    '--col-violet': '169 161 225',
    '--col-cyan': '70 217 255',
    '--col-dark-cyan': '86 153 175',
  });

  setPalette({
    '--color-background': 'var(--col-bg)',
    '--color-backgroundSubtle': 'var(--col-bg-alt)',
    '--color-backgroundBright': 'var(--col-base3)',
    '--color-backgroundBrightest': 'var(--col-base5)',
    '--color-fgDim': 'var(--col-fg)',
    '--color-fg': 'var(--col-base8)',
    '--color-fgBrightest': 'var(--col-base8)',
    '--color-primary': 'var(--col-magenta)',
    '--color-bright': 'var(--col-cyan)',
    '--color-secondary': 'var(--col-teal)',
    '--color-tertiary': 'var(--col-dark-blue)',
  });
}
