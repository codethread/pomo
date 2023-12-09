export default {
  content: ['client/index.html', 'client/src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
    colors: {
      thmBackground: withOpacityValue('--color-background'),
      thmBackgroundSubtle: withOpacityValue('--color-backgroundSubtle'),
      thmBackgroundBright: withOpacityValue('--color-backgroundBright'),
      thmBackgroundBrightest: withOpacityValue('--color-backgroundBrightest'),
      thmFgDim: withOpacityValue('--color-fgDim'),
      thmFg: withOpacityValue('--color-fg'),
      thmFgBright: withOpacityValue('--color-fgBrightest'),
      thmPrimary: withOpacityValue('--color-primary'),
      thmBright: withOpacityValue('--color-bright'),
      thmSecondary: withOpacityValue('--color-secondary'),
      thmTertiary: withOpacityValue('--color-tertiary'),
      thmError: withOpacityValue('--color-error'),
      thmWarn: withOpacityValue('--color-warning'),
      thmGood: withOpacityValue('--color-good'),
    },
  },
  plugins: [],
};

function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}
