export const palette = {
  bg: '#F4F6F8',
  surface: '#FFFFFF',
  text: '#14212B',
  muted: '#66737F',
  line: '#DCE2E7',
  brand: '#0A557A',
  brandDeep: '#063F5C',
  brandSoft: '#E7F2F7',
  safe: '#167A45',
  safeSoft: '#E7F5ED',
  conditional: '#A46600',
  conditionalSoft: '#FFF3D8',
  danger: '#B42318',
  dangerSoft: '#FDECEA',
  unknown: '#59636E',
  unknownSoft: '#EEF1F3',
  white: '#FFFFFF'
} as const;

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30
} as const;

export type QuickCheckTone = 'safe' | 'conditional' | 'danger' | 'unknown';

export function toneColors(tone: QuickCheckTone) {
  if (tone === 'safe') return { foreground: palette.safe, background: palette.safeSoft };
  if (tone === 'conditional') return { foreground: palette.conditional, background: palette.conditionalSoft };
  if (tone === 'danger') return { foreground: palette.danger, background: palette.dangerSoft };
  return { foreground: palette.unknown, background: palette.unknownSoft };
}
