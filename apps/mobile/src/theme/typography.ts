/**
 * Typography tokens.
 *
 * The Figma type has rounded, friendly letterforms with heavy display
 * weights — Nunito is a close, free match with the weight range you need.
 * Swap `fontFamily` below if you land on a different family; nothing else
 * has to change since every screen reads from `typography`, not raw values.
 *
 * Setup (once):
 *   npx expo install @expo-google-fonts/nunito expo-font
 * Then in App.tsx / root layout:
 *   const [loaded] = useFonts({
 *     Nunito_400Regular,
 *     Nunito_600SemiBold,
 *     Nunito_700Bold,
 *     Nunito_800ExtraBold,
 *   });
 */

export const fontFamily = {
  regular: 'Inter_400Regular',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
};

export const typography = {
  display: { fontFamily: fontFamily.extraBold, fontSize: 28, lineHeight: 34 },
  h1: { fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 28 },
  h2: { fontFamily: fontFamily.bold, fontSize: 18, lineHeight: 24 },
  h3: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 22 },
  bodyLg: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 },
  bodyMedium: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
  captionMedium: { fontFamily: fontFamily.semiBold, fontSize: 12, lineHeight: 16 },
  tiny: { fontFamily: fontFamily.regular, fontSize: 10, lineHeight: 14 },
} as const;

export type Typography = typeof typography;