import { Platform } from 'react-native';

/**
 * Shadow presets. RN shadows need both the iOS shadow* props and the
 * Android `elevation` prop — these bundle both so you never forget one.
 */
function makeShadow(opacity: number, radius: number, elevation: number, offsetY = 2) {
  return Platform.select({
    ios: {
      shadowColor: '#1A1A2E',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {},
  });
}

export const shadows = {
  none: {},
  card: makeShadow(0.06, 8, 2),
  cardHover: makeShadow(0.1, 14, 4, 4),
  fab: makeShadow(0.25, 12, 8, 4), // the floating red order button
  modal: makeShadow(0.2, 24, 12, 8),
} as const;

export type Shadows = typeof shadows;