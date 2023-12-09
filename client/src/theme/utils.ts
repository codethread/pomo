import { colors, palette } from '@client/theme/colors';

export const getRoot = (() => {
  let root: CSSStyleDeclaration | null;

  return function getRootMemoised() {
    if (root) return root;

    const r = document.querySelector<HTMLElement>(':root')?.style;

    if (!r) throw new Error('could not get :root selector for styles');

    root = r;

    return root;
  };
})();

export const themers: Themers = { setPalette, setColors };

export type Colors = typeof colors[number];

export type Palette = typeof palette[number];

/**
 * Theme color set using an existing color variable from the `Colors`
 */
export type ThemeVarValue = 'var(--col-null)' | `var(${Colors})`;

/**
 * Theme color provided in RGB format
 */
type ThemeVarColor = `${number} ${number} ${number}`;

export type ThemeValue = ThemeVarColor | ThemeVarValue;

export interface Themers {
  setPalette: typeof setPalette;
  setColors: typeof setColors;
}

/**
 * Set the base colors for your theme, each color can be a reference to another color, e.g `var(--col-base4)` or an RGB value.
 *
 * If a colour is not provided, e.g you don't set a value for `--col-green` this will fall back to the `--col-null` value (a rather vibrant pink, to help debug missing color properties in storybook)
 *
 * Note, not all colors are used at this point, the format is inline with popular text editors
 *
 * Provide an optional `{ strict: true }` value to force you to set all required color values
 */
function setColors(values: Record<Colors, ThemeValue>, options: { strict: true }): void;
function setColors(values: Partial<Record<Colors, ThemeValue>>): void;
function setColors(values: Record<string, ThemeValue>, _?: { strict: true }): void {
  const r = getRoot();
  Object.entries(values).forEach(([col, val]) => {
    r.setProperty(col, val);
  });
}

/**
 * Set the palette for your theme
 *
 * Any parts of the palette left undefined, will revert to the default palette defined in `themeReset` (which is often close enough)
 *
 * Provide an optional `{ strict: true }` value to force you to set all palette items
 */
function setPalette(values: Record<Palette, ThemeVarValue>, options: { strict: true }): void;
function setPalette(values: Partial<Record<Palette, ThemeVarValue>>): void;
function setPalette(values: Record<string, ThemeVarValue>, options?: { strict: true }): void {
  const r = getRoot();
  Object.entries(values).forEach(([col, val]) => {
    r.setProperty(col, val);
  });
}
