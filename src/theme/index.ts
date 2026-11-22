// Design tokens for Indang Transit. Calm, civic, transit-map style.

export const colors = {
  ink: '#102A43',
  paper: '#F7F5EF',
  surface: '#FFFFFF',
  line: '#D9E2EC',
  muted: '#627D98',
  transit: '#0B6E4F',
  route: '#1F6FB2',
  fare: '#B7791F',
  onTransit: '#FFFFFF',
} as const;

export const type = {
  size: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32 },
  line: { xs: 16, sm: 20, md: 24, lg: 28, xl: 32, xxl: 40 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radii = { sm: 8, md: 12, lg: 16 } as const;

export const touch = { min: 44 } as const;
