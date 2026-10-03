import React, { createContext, useContext, useMemo } from 'react';
import { colors, gradients, palette } from './colors';
import { typography, fontFamily } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';

export const theme = {
  colors,
  gradients,
  palette,
  typography,
  fontFamily,
  spacing,
  radius,
  shadows,
} as const;

export type Theme = typeof theme;

const ThemeContext = createContext<Theme>(theme);

/**
 * Wrap App.tsx with this once. Kept as a Context (rather than a plain
 * import) so a future dark-mode or white-label theme is a one-line swap
 * of the `value` prop instead of a rewrite of every screen.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => theme, []);
  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}