import { Themers } from '@client/theme/utils';

export function nord({ setPalette, setColors }: Themers): void {
  setColors(
    {
      '--col-bg': '46 52 64',
      '--col-bg-alt': '39 44 54',
      '--col-base0': '25 28 37',
      '--col-base1': '36 40 50',
      '--col-base2': '44 51 63',
      '--col-base3': '55 62 76',
      '--col-base4': '67 76 94',
      '--col-base5': '76 86 106',
      '--col-base6': '144 153 171',
      '--col-base7': '216 222 233',
      '--col-base8': '240 244 252',
      '--col-fg': '236 239 244',
      '--col-fg-alt': '229 233 240',
      '--col-red': '191 97 106',
      '--col-orange': '208 135 112',
      '--col-green': '163 190 140',
      '--col-teal': '143 188 187',
      '--col-yellow': '235 203 139',
      '--col-blue': '129 161 193',
      '--col-dark-blue': '94 129 172',
      '--col-magenta': '180 142 173',
      '--col-violet': '93 128 174',
      '--col-cyan': '136 192 208',
      '--col-dark-cyan': '80 118 129',
      '--col-grey': 'var(--col-base4)',
    },
    { strict: true }
  );
}

export function nordLight({ setPalette, setColors }: Themers): void {
  setColors(
    {
      '--col-bg': '229 233 240',
      '--col-bg-alt': '216 222 233',
      '--col-base0': '240 244 252',
      '--col-base1': '227 234 245',
      '--col-base2': '216 222 233',
      '--col-base3': '194 208 231',
      '--col-base4': '184 197 219',
      '--col-base5': '174 186 207',
      '--col-base6': '161 172 192',
      '--col-base7': '96 114 140',
      '--col-base8': '72 81 99',
      '--col-fg': '59 66 82',
      '--col-fg-alt': '46 52 64',
      '--col-red': '191 97 106',
      '--col-orange': '208 135 112',
      '--col-green': '163 190 140',
      '--col-teal': '143 188 187',
      '--col-yellow': '235 203 139',
      '--col-blue': '129 161 193',
      '--col-dark-blue': '94 129 172',
      '--col-magenta': '180 142 173',
      '--col-violet': '93 128 174',
      '--col-cyan': '136 192 208',
      '--col-dark-cyan': '80 118 129',
      '--col-grey': 'var(--col-base4)',
    },
    { strict: true }
  );
}
